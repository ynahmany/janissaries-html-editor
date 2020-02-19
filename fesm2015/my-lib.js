import { __decorate } from 'tslib';
import { Injectable, EventEmitter, Renderer2, Input, Output, ViewChild, Component, forwardRef, HostListener, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, Validators, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpRequest, HttpClient, HttpResponse, HttpClientModule } from '@angular/common/http';
import { PopoverConfig, PopoverModule } from 'ngx-bootstrap';
import { Subject } from 'rxjs';

/**
 * enable or disable toolbar based on configuration
 *
 * @param value toolbar item
 * @param toolbar toolbar configuration object
 */
function canEnableToolbarOptions(value, toolbar) {
    if (value) {
        if (toolbar['length'] === 0) {
            return true;
        }
        else {
            const found = toolbar.filter(array => {
                return array.indexOf(value) !== -1;
            });
            return found.length ? true : false;
        }
    }
    else {
        return false;
    }
}
/**
 * set editor configuration
 *
 * @param value configuration via [config] property
 * @param ngxEditorConfig default editor configuration
 * @param input direct configuration inputs via directives
 */
function getEditorConfiguration(value, ngxEditorConfig, input) {
    for (const i in ngxEditorConfig) {
        if (i) {
            if (input[i] !== undefined) {
                value[i] = input[i];
            }
            if (!value.hasOwnProperty(i)) {
                value[i] = ngxEditorConfig[i];
            }
        }
    }
    return value;
}
/**
 * return vertical if the element is the resizer property is set to basic
 *
 * @param resizer type of resizer, either basic or stack
 */
function canResize(resizer) {
    if (resizer === 'basic') {
        return 'vertical';
    }
    return false;
}
/**
 * save selection when the editor is focussed out
 */
function saveSelection() {
    if (window.getSelection) {
        const sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            return sel.getRangeAt(0);
        }
    }
    else if (document.getSelection && document.createRange) {
        return document.createRange();
    }
    return null;
}
/**
 * restore selection when the editor is focussed in
 *
 * @param range saved selection when the editor is focussed out
 */
function restoreSelection(range) {
    if (range) {
        if (window.getSelection) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            return true;
        }
        else if (document.getSelection && range.select) {
            range.select();
            return true;
        }
    }
    else {
        return false;
    }
}

var Utils = /*#__PURE__*/Object.freeze({
    __proto__: null,
    canEnableToolbarOptions: canEnableToolbarOptions,
    getEditorConfiguration: getEditorConfiguration,
    canResize: canResize,
    saveSelection: saveSelection,
    restoreSelection: restoreSelection
});

let CommandExecutorService = class CommandExecutorService {
    /**
     *
     * @param _http HTTP Client for making http requests
     */
    constructor(_http) {
        this._http = _http;
        /** saves the selection from the editor when focussed out */
        this.savedSelection = undefined;
    }
    /**
     * executes command from the toolbar
     *
     * @param command command to be executed
     */
    execute(command) {
        if (!this.savedSelection && command !== 'enableObjectResizing') {
            throw new Error('Range out of Editor');
        }
        if (command === 'enableObjectResizing') {
            document.execCommand('enableObjectResizing', true);
        }
        if (command === 'blockquote') {
            document.execCommand('formatBlock', false, 'blockquote');
        }
        if (command === 'removeBlockquote') {
            document.execCommand('formatBlock', false, 'div');
        }
        document.execCommand(command, false, null);
    }
    /**
     * inserts image in the editor
     *
     * @param imageURI url of the image to be inserted
     */
    insertImage(imageURI) {
        if (this.savedSelection) {
            if (imageURI) {
                const restored = restoreSelection(this.savedSelection);
                if (restored) {
                    const inserted = document.execCommand('insertImage', false, imageURI);
                    if (!inserted) {
                        throw new Error('Invalid URL');
                    }
                }
            }
        }
        else {
            throw new Error('Range out of the editor');
        }
    }
    /**
   * inserts image in the editor
   *
   * @param videParams url of the image to be inserted
   */
    insertVideo(videParams) {
        if (this.savedSelection) {
            if (videParams) {
                const restored = restoreSelection(this.savedSelection);
                if (restored) {
                    if (this.isYoutubeLink(videParams.videoUrl)) {
                        const youtubeURL = '<iframe width="' + videParams.width + '" height="' + videParams.height + '"'
                            + 'src="' + videParams.videoUrl + '"></iframe>';
                        this.insertHtml(youtubeURL);
                    }
                    else if (this.checkTagSupportInBrowser('video')) {
                        if (this.isValidURL(videParams.videoUrl)) {
                            const videoSrc = '<video width="' + videParams.width + '" height="' + videParams.height + '"'
                                + ' controls="true"><source src="' + videParams.videoUrl + '"></video>';
                            this.insertHtml(videoSrc);
                        }
                        else {
                            throw new Error('Invalid video URL');
                        }
                    }
                    else {
                        throw new Error('Unable to insert video');
                    }
                }
            }
        }
        else {
            throw new Error('Range out of the editor');
        }
    }
    /**
     * checks the input url is a valid youtube URL or not
     *
     * @param url Youtue URL
     */
    isYoutubeLink(url) {
        const ytRegExp = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/;
        return ytRegExp.test(url);
    }
    /**
     * check whether the string is a valid url or not
     * @param url url
     */
    isValidURL(url) {
        const urlRegExp = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
        return urlRegExp.test(url);
    }
    /**
     * uploads image to the server
     *
     * @param file file that has to be uploaded
     * @param endPoint enpoint to which the image has to be uploaded
     */
    uploadImage(file, endPoint) {
        if (!endPoint) {
            throw new Error('Image Endpoint isn`t provided or invalid');
        }
        const formData = new FormData();
        if (file) {
            formData.append('file', file);
            const req = new HttpRequest('POST', endPoint, formData, {
                reportProgress: true
            });
            return this._http.request(req);
        }
        else {
            throw new Error('Invalid Image');
        }
    }
    /**
     * inserts link in the editor
     *
     * @param params parameters that holds the information for the link
     */
    createLink(params) {
        if (this.savedSelection) {
            /**
             * check whether the saved selection contains a range or plain selection
             */
            if (params.urlNewTab) {
                const newUrl = '<a href="' + params.urlLink + '" target="_blank">' + params.urlText + '</a>';
                if (document.getSelection().type !== 'Range') {
                    const restored = restoreSelection(this.savedSelection);
                    if (restored) {
                        this.insertHtml(newUrl);
                    }
                }
                else {
                    throw new Error('Only new links can be inserted. You cannot edit URL`s');
                }
            }
            else {
                const restored = restoreSelection(this.savedSelection);
                if (restored) {
                    document.execCommand('createLink', false, params.urlLink);
                }
            }
        }
        else {
            throw new Error('Range out of the editor');
        }
    }
    /**
     * insert color either font or background
     *
     * @param color color to be inserted
     * @param where where the color has to be inserted either text/background
     */
    insertColor(color, where) {
        if (this.savedSelection) {
            const restored = restoreSelection(this.savedSelection);
            if (restored && this.checkSelection()) {
                if (where === 'textColor') {
                    document.execCommand('foreColor', false, color);
                }
                else {
                    document.execCommand('hiliteColor', false, color);
                }
            }
        }
        else {
            throw new Error('Range out of the editor');
        }
    }
    /**
     * set font size for text
     *
     * @param fontSize font-size to be set
     */
    setFontSize(fontSize) {
        if (this.savedSelection && this.checkSelection()) {
            const deletedValue = this.deleteAndGetElement();
            if (deletedValue) {
                const restored = restoreSelection(this.savedSelection);
                if (restored) {
                    if (this.isNumeric(fontSize)) {
                        const fontPx = '<span style="font-size: ' + fontSize + 'px;">' + deletedValue + '</span>';
                        this.insertHtml(fontPx);
                    }
                    else {
                        const fontPx = '<span style="font-size: ' + fontSize + ';">' + deletedValue + '</span>';
                        this.insertHtml(fontPx);
                    }
                }
            }
        }
        else {
            throw new Error('Range out of the editor');
        }
    }
    /**
     * set font name/family for text
     *
     * @param fontName font-family to be set
     */
    setFontName(fontName) {
        if (this.savedSelection && this.checkSelection()) {
            const deletedValue = this.deleteAndGetElement();
            if (deletedValue) {
                const restored = restoreSelection(this.savedSelection);
                if (restored) {
                    if (this.isNumeric(fontName)) {
                        const fontFamily = '<span style="font-family: ' + fontName + 'px;">' + deletedValue + '</span>';
                        this.insertHtml(fontFamily);
                    }
                    else {
                        const fontFamily = '<span style="font-family: ' + fontName + ';">' + deletedValue + '</span>';
                        this.insertHtml(fontFamily);
                    }
                }
            }
        }
        else {
            throw new Error('Range out of the editor');
        }
    }
    /** insert HTML */
    insertHtml(html) {
        const isHTMLInserted = document.execCommand('insertHTML', false, html);
        if (!isHTMLInserted) {
            throw new Error('Unable to perform the operation');
        }
    }
    /**
     * check whether the value is a number or string
     * if number return true
     * else return false
     */
    isNumeric(value) {
        return /^-{0,1}\d+$/.test(value);
    }
    /** delete the text at selected range and return the value */
    deleteAndGetElement() {
        let slectedText;
        if (this.savedSelection) {
            slectedText = this.savedSelection.toString();
            this.savedSelection.deleteContents();
            return slectedText;
        }
        return false;
    }
    /** check any slection is made or not */
    checkSelection() {
        const slectedText = this.savedSelection.toString();
        if (slectedText.length === 0) {
            throw new Error('No Selection Made');
        }
        return true;
    }
    /**
     * check tag is supported by browser or not
     *
     * @param tag HTML tag
     */
    checkTagSupportInBrowser(tag) {
        return !(document.createElement(tag) instanceof HTMLUnknownElement);
    }
};
CommandExecutorService.ctorParameters = () => [
    { type: HttpClient }
];
CommandExecutorService = __decorate([
    Injectable()
], CommandExecutorService);

/** time in which the message has to be cleared */
const DURATION = 7000;
let MessageService = class MessageService {
    constructor() {
        /** variable to hold the user message */
        this.message = new Subject();
    }
    /** returns the message sent by the editor */
    getMessage() {
        return this.message.asObservable();
    }
    /**
     * sends message to the editor
     *
     * @param message message to be sent
     */
    sendMessage(message) {
        this.message.next(message);
        this.clearMessageIn(DURATION);
    }
    /**
     * a short interval to clear message
     *
     * @param milliseconds time in seconds in which the message has to be cleared
     */
    clearMessageIn(milliseconds) {
        setTimeout(() => {
            this.message.next(undefined);
        }, milliseconds);
    }
};
MessageService = __decorate([
    Injectable()
], MessageService);

/**
 * toolbar default configuration
 */
const ngxEditorConfig = {
    editable: true,
    spellcheck: true,
    height: 'auto',
    minHeight: '0',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Enter text here...',
    imageEndPoint: '',
    toolbar: [
        ['bold', 'italic', 'underline', 'strikeThrough', 'superscript', 'subscript'],
        ['fontName', 'fontSize', 'color'],
        ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'indent', 'outdent'],
        ['cut', 'copy', 'delete', 'removeFormat', 'undo', 'redo'],
        ['paragraph', 'blockquote', 'removeBlockquote', 'horizontalLine', 'orderedList', 'unorderedList'],
        ['link', 'unlink', 'image', 'video']
    ]
};

var NgxEditorComponent_1;
let NgxEditorComponent = NgxEditorComponent_1 = class NgxEditorComponent {
    constructor(_messageService, _commandExecutor, _renderer) {
        this._messageService = _messageService;
        this._commandExecutor = _commandExecutor;
        this._renderer = _renderer;
        this.resizer = 'stack';
        this.config = ngxEditorConfig;
        this.blur = new EventEmitter();
        this.focus = new EventEmitter();
        this.Utils = Utils;
    }
    onTextAreaFocus() {
        this.focus.emit('focus');
    }
    onEditorFocus() {
        let textArea = document.getElementById('textArea');
        ((this.textArea || {}).nativeElement || textArea).focus();
    }
    onContentChange(innerHTML) {
        if (typeof this.onChange === 'function') {
            this.onChange(innerHTML);
            this.togglePlaceholder(innerHTML);
        }
    }
    onTextAreaBlur() {
        /** save selection if focussed out */
        this._commandExecutor.savedSelection = saveSelection();
        if (typeof this.onTouched === 'function') {
            this.onTouched();
        }
        this.blur.emit('blur');
    }
    resizeTextArea(offsetY) {
        let newHeight = parseInt(this.height, 10);
        newHeight += offsetY;
        this.height = newHeight + 'px';
        let textArea = document.getElementById('textArea');
        ((this.textArea || {}).nativeElement || textArea).style.height = this.height;
    }
    executeCommand(commandName) {
        try {
            this._commandExecutor.execute(commandName);
        }
        catch (error) {
            this._messageService.sendMessage(error.message);
        }
    }
    writeValue(value) {
        this.togglePlaceholder(value);
        if (value === null || value === undefined || value === '' || value === '<br>') {
            value = null;
        }
        this.refreshView(value);
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    refreshView(value) {
        let textArea = document.getElementById('textArea');
        const normalizedValue = value === null ? '' : value;
        this._renderer.setProperty((this.textArea || {}).nativeElement || textArea, 'innerHTML', normalizedValue);
    }
    togglePlaceholder(value) {
        console.log(this.ngxWrapper);
        let ngxWrapper = document.getElementById('ngxWrapper');
        if (!value || value === '<br>' || value === '') {
            this._renderer.addClass((this.ngxWrapper || {}).nativeElement || ngxWrapper, 'show-placeholder');
        }
        else {
            this._renderer.removeClass((this.ngxWrapper || {}).nativeElement || ngxWrapper, 'show-placeholder');
        }
    }
    getCollectiveParams() {
        return {
            editable: this.editable,
            spellcheck: this.spellcheck,
            placeholder: this.placeholder,
            translate: this.translate,
            height: this.height,
            minHeight: this.minHeight,
            width: this.width,
            minWidth: this.minWidth,
            enableToolbar: this.enableToolbar,
            showToolbar: this.showToolbar,
            imageEndPoint: this.imageEndPoint,
            toolbar: this.toolbar
        };
    }
    ngOnInit() {
        this.config = this.Utils.getEditorConfiguration(this.config, ngxEditorConfig, this.getCollectiveParams());
        let textArea = document.getElementById('textArea');
        this.height = this.height || ((this.textArea || {}).nativeElement || textArea).offsetHeight;
        this.executeCommand('enableObjectResizing');
    }
};
NgxEditorComponent.ctorParameters = () => [
    { type: MessageService },
    { type: CommandExecutorService },
    { type: Renderer2 }
];
__decorate([
    Input()
], NgxEditorComponent.prototype, "editable", void 0);
__decorate([
    Input()
], NgxEditorComponent.prototype, "spellcheck", void 0);
__decorate([
    Input()
], NgxEditorComponent.prototype, "placeholder", void 0);
__decorate([
    Input()
], NgxEditorComponent.prototype, "translate", void 0);
__decorate([
    Input()
], NgxEditorComponent.prototype, "height", void 0);
__decorate([
    Input()
], NgxEditorComponent.prototype, "minHeight", void 0);
__decorate([
    Input()
], NgxEditorComponent.prototype, "width", void 0);
__decorate([
    Input()
], NgxEditorComponent.prototype, "minWidth", void 0);
__decorate([
    Input()
], NgxEditorComponent.prototype, "toolbar", void 0);
__decorate([
    Input()
], NgxEditorComponent.prototype, "resizer", void 0);
__decorate([
    Input()
], NgxEditorComponent.prototype, "config", void 0);
__decorate([
    Input()
], NgxEditorComponent.prototype, "showToolbar", void 0);
__decorate([
    Input()
], NgxEditorComponent.prototype, "enableToolbar", void 0);
__decorate([
    Input()
], NgxEditorComponent.prototype, "imageEndPoint", void 0);
__decorate([
    Output()
], NgxEditorComponent.prototype, "blur", void 0);
__decorate([
    Output()
], NgxEditorComponent.prototype, "focus", void 0);
__decorate([
    ViewChild('textArea', { static: false })
], NgxEditorComponent.prototype, "textArea", void 0);
__decorate([
    ViewChild('ngxWrapper', { static: false })
], NgxEditorComponent.prototype, "ngxWrapper", void 0);
NgxEditorComponent = NgxEditorComponent_1 = __decorate([
    Component({
        selector: 'app-ngx-editor',
        template: "<div class=\"ngx-editor\" id=\"ngxEditor\" [style.width]=\"config['width']\" [style.minWidth]=\"config['minWidth']\" tabindex=\"0\"\r\n  (focus)=\"onEditorFocus()\">\r\n\r\n  <app-ngx-editor-toolbar [config]=\"config\" (execute)=\"executeCommand($event)\"></app-ngx-editor-toolbar>\r\n\r\n  <!-- text area -->\r\n  <div class=\"ngx-wrapper\" #ngxWrapper id=\"ngxWrapper\">\r\n    <div class=\"ngx-editor-textarea\" [attr.contenteditable]=\"config['editable']\" (input)=\"onContentChange($event.target.innerHTML)\"\r\n      [attr.translate]=\"config['translate']\" [attr.spellcheck]=\"config['spellcheck']\" [style.height]=\"config['height']\"\r\n      [style.minHeight]=\"config['minHeight']\" [style.resize]=\"Utils?.canResize(resizer)\" (focus)=\"onTextAreaFocus()\"\r\n      (blur)=\"onTextAreaBlur()\" #textArea id=\"textArea\"></div>\r\n\r\n    <span class=\"ngx-editor-placeholder\">{{ placeholder || config['placeholder'] }}</span>\r\n  </div>\r\n\r\n  <app-ngx-editor-message></app-ngx-editor-message>\r\n  <app-ngx-grippie *ngIf=\"resizer === 'stack'\"></app-ngx-grippie>\r\n\r\n</div>\r\n",
        providers: [{
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => NgxEditorComponent_1),
                multi: true
            }],
        styles: [".ngx-editor{position:relative}.ngx-editor ::ng-deep [contenteditable=true]:empty:before{content:attr(placeholder);display:block;color:#868e96;opacity:1}.ngx-editor .ngx-wrapper{position:relative}.ngx-editor .ngx-wrapper .ngx-editor-textarea{min-height:5rem;padding:.5rem .8rem 1rem;border:1px solid #ddd;background-color:transparent;overflow-x:hidden;overflow-y:auto;z-index:2;position:relative}.ngx-editor .ngx-wrapper .ngx-editor-textarea.focus,.ngx-editor .ngx-wrapper .ngx-editor-textarea:focus{outline:0}.ngx-editor .ngx-wrapper .ngx-editor-textarea ::ng-deep blockquote{margin-left:1rem;border-left:.2em solid #dfe2e5;padding-left:.5rem}.ngx-editor .ngx-wrapper ::ng-deep p{margin-bottom:0}.ngx-editor .ngx-wrapper .ngx-editor-placeholder{display:none;position:absolute;top:0;padding:.5rem .8rem 1rem .9rem;z-index:1;color:#6c757d;opacity:1}.ngx-editor .ngx-wrapper.show-placeholder .ngx-editor-placeholder{display:block}"]
    })
], NgxEditorComponent);

let NgxGrippieComponent = class NgxGrippieComponent {
    /**
     * Constructor
     *
     * @param _editorComponent Editor component
     */
    constructor(_editorComponent) {
        this._editorComponent = _editorComponent;
        /** previous value befor resizing the editor */
        this.oldY = 0;
        /** set to true on mousedown event */
        this.grabber = false;
    }
    /**
     *
     * @param event Mouseevent
     *
     * Update the height of the editor when the grabber is dragged
     */
    onMouseMove(event) {
        if (!this.grabber) {
            return;
        }
        this._editorComponent.resizeTextArea(event.clientY - this.oldY);
        this.oldY = event.clientY;
    }
    /**
     *
     * @param event Mouseevent
     *
     * set the grabber to false on mouse up action
     */
    onMouseUp(event) {
        this.grabber = false;
    }
    onResize(event, resizer) {
        this.grabber = true;
        this.oldY = event.clientY;
        event.preventDefault();
    }
};
NgxGrippieComponent.ctorParameters = () => [
    { type: NgxEditorComponent }
];
__decorate([
    HostListener('document:mousemove', ['$event'])
], NgxGrippieComponent.prototype, "onMouseMove", null);
__decorate([
    HostListener('document:mouseup', ['$event'])
], NgxGrippieComponent.prototype, "onMouseUp", null);
__decorate([
    HostListener('mousedown', ['$event'])
], NgxGrippieComponent.prototype, "onResize", null);
NgxGrippieComponent = __decorate([
    Component({
        selector: 'app-ngx-grippie',
        template: "<div class=\"ngx-editor-grippie\">\r\n  <svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" style=\"isolation:isolate\" viewBox=\"651.6 235 26 5\"\r\n    width=\"26\" height=\"5\">\r\n    <g id=\"sprites\">\r\n      <path d=\" M 651.6 235 L 653.6 235 L 653.6 237 L 651.6 237 M 654.6 238 L 656.6 238 L 656.6 240 L 654.6 240 M 660.6 238 L 662.6 238 L 662.6 240 L 660.6 240 M 666.6 238 L 668.6 238 L 668.6 240 L 666.6 240 M 672.6 238 L 674.6 238 L 674.6 240 L 672.6 240 M 657.6 235 L 659.6 235 L 659.6 237 L 657.6 237 M 663.6 235 L 665.6 235 L 665.6 237 L 663.6 237 M 669.6 235 L 671.6 235 L 671.6 237 L 669.6 237 M 675.6 235 L 677.6 235 L 677.6 237 L 675.6 237\"\r\n        fill=\"rgb(147,153,159)\" />\r\n    </g>\r\n  </svg>\r\n</div>\r\n",
        styles: [".ngx-editor-grippie{height:9px;background-color:#f1f1f1;position:relative;text-align:center;cursor:s-resize;border:1px solid #ddd;border-top:transparent}.ngx-editor-grippie svg{position:absolute;top:1.5px;width:50%;right:25%}"]
    })
], NgxGrippieComponent);

let NgxEditorMessageComponent = class NgxEditorMessageComponent {
    /**
     * @param _messageService service to send message to the editor
     */
    constructor(_messageService) {
        this._messageService = _messageService;
        /** property that holds the message to be displayed on the editor */
        this.ngxMessage = undefined;
        this._messageService.getMessage().subscribe((message) => this.ngxMessage = message);
    }
    /**
     * clears editor message
     */
    clearMessage() {
        this.ngxMessage = undefined;
    }
};
NgxEditorMessageComponent.ctorParameters = () => [
    { type: MessageService }
];
NgxEditorMessageComponent = __decorate([
    Component({
        selector: 'app-ngx-editor-message',
        template: "<div class=\"ngx-editor-message\" *ngIf=\"ngxMessage\" (dblclick)=\"clearMessage()\">\r\n  {{ ngxMessage }}\r\n</div>\r\n",
        styles: [".ngx-editor-message{font-size:80%;background-color:#f1f1f1;border:1px solid #ddd;border-top:transparent;padding:0 .5rem .1rem;-webkit-transition:.5s ease-in;transition:.5s ease-in}"]
    })
], NgxEditorMessageComponent);

let NgxEditorToolbarComponent = class NgxEditorToolbarComponent {
    constructor(_popOverConfig, _formBuilder, _messageService, _commandExecutorService) {
        this._popOverConfig = _popOverConfig;
        this._formBuilder = _formBuilder;
        this._messageService = _messageService;
        this._commandExecutorService = _commandExecutorService;
        /** set to false when image is being uploaded */
        this.uploadComplete = true;
        /** upload percentage */
        this.updloadPercentage = 0;
        /** set to true when the image is being uploaded */
        this.isUploading = false;
        /** which tab to active for color insetion */
        this.selectedColorTab = 'textColor';
        /** font family name */
        this.fontName = '';
        /** font size */
        this.fontSize = '';
        /** hex color code */
        this.hexColor = '';
        /** show/hide image uploader */
        this.isImageUploader = false;
        /**
         * Emits an event when a toolbar button is clicked
         */
        this.execute = new EventEmitter();
        this._popOverConfig.outsideClick = true;
        this._popOverConfig.placement = 'bottom';
        this._popOverConfig.container = 'body';
    }
    /**
     * enable or diable toolbar based on configuration
     *
     * @param value name of the toolbar buttons
     */
    canEnableToolbarOptions(value) {
        return canEnableToolbarOptions(value, this.config['toolbar']);
    }
    /**
     * triggers command from the toolbar to be executed and emits an event
     *
     * @param command name of the command to be executed
     */
    triggerCommand(command) {
        this.execute.emit(command);
    }
    /**
     * create URL insert form
     */
    buildUrlForm() {
        this.urlForm = this._formBuilder.group({
            urlLink: ['', [Validators.required]],
            urlText: ['', [Validators.required]],
            urlNewTab: [true]
        });
    }
    /**
     * inserts link in the editor
     */
    insertLink() {
        try {
            this._commandExecutorService.createLink(this.urlForm.value);
        }
        catch (error) {
            this._messageService.sendMessage(error.message);
        }
        /** reset form to default */
        this.buildUrlForm();
        /** close inset URL pop up */
        this.urlPopover.hide();
    }
    /**
     * create insert image form
     */
    buildImageForm() {
        this.imageForm = this._formBuilder.group({
            imageUrl: ['', [Validators.required]]
        });
    }
    /**
     * create insert image form
     */
    buildVideoForm() {
        this.videoForm = this._formBuilder.group({
            videoUrl: ['', [Validators.required]],
            height: [''],
            width: ['']
        });
    }
    /**
     * Executed when file is selected
     *
     * @param e onChange event
     */
    onFileChange(e) {
        this.uploadComplete = false;
        this.isUploading = true;
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            try {
                this._commandExecutorService.uploadImage(file, this.config.imageEndPoint).subscribe(event => {
                    if (event.type) {
                        this.updloadPercentage = Math.round(100 * event.loaded / event.total);
                    }
                    if (event instanceof HttpResponse) {
                        try {
                            this._commandExecutorService.insertImage(event.body.url);
                        }
                        catch (error) {
                            this._messageService.sendMessage(error.message);
                        }
                        this.uploadComplete = true;
                        this.isUploading = false;
                    }
                });
            }
            catch (error) {
                this._messageService.sendMessage(error.message);
                this.uploadComplete = true;
                this.isUploading = false;
            }
        }
    }
    /** insert image in the editor */
    insertImage() {
        try {
            this._commandExecutorService.insertImage(this.imageForm.value.imageUrl);
        }
        catch (error) {
            this._messageService.sendMessage(error.message);
        }
        /** reset form to default */
        this.buildImageForm();
        /** close inset URL pop up */
        this.imagePopover.hide();
    }
    /** insert image in the editor */
    insertVideo() {
        try {
            this._commandExecutorService.insertVideo(this.videoForm.value);
        }
        catch (error) {
            this._messageService.sendMessage(error.message);
        }
        /** reset form to default */
        this.buildVideoForm();
        /** close inset URL pop up */
        this.videoPopover.hide();
    }
    /** inser text/background color */
    insertColor(color, where) {
        try {
            this._commandExecutorService.insertColor(color, where);
        }
        catch (error) {
            this._messageService.sendMessage(error.message);
        }
        this.colorPopover.hide();
    }
    /** set font size */
    setFontSize(fontSize) {
        try {
            this._commandExecutorService.setFontSize(fontSize);
        }
        catch (error) {
            this._messageService.sendMessage(error.message);
        }
        this.fontSizePopover.hide();
    }
    /** set font Name/family */
    setFontName(fontName) {
        try {
            this._commandExecutorService.setFontName(fontName);
        }
        catch (error) {
            this._messageService.sendMessage(error.message);
        }
        this.fontSizePopover.hide();
    }
    ngOnInit() {
        this.buildUrlForm();
        this.buildImageForm();
        this.buildVideoForm();
    }
};
NgxEditorToolbarComponent.ctorParameters = () => [
    { type: PopoverConfig },
    { type: FormBuilder },
    { type: MessageService },
    { type: CommandExecutorService }
];
__decorate([
    Input()
], NgxEditorToolbarComponent.prototype, "config", void 0);
__decorate([
    ViewChild('urlPopover', { static: false })
], NgxEditorToolbarComponent.prototype, "urlPopover", void 0);
__decorate([
    ViewChild('imagePopover', { static: false })
], NgxEditorToolbarComponent.prototype, "imagePopover", void 0);
__decorate([
    ViewChild('videoPopover', { static: false })
], NgxEditorToolbarComponent.prototype, "videoPopover", void 0);
__decorate([
    ViewChild('fontSizePopover', { static: false })
], NgxEditorToolbarComponent.prototype, "fontSizePopover", void 0);
__decorate([
    ViewChild('colorPopover', { static: false })
], NgxEditorToolbarComponent.prototype, "colorPopover", void 0);
__decorate([
    Output()
], NgxEditorToolbarComponent.prototype, "execute", void 0);
NgxEditorToolbarComponent = __decorate([
    Component({
        selector: 'app-ngx-editor-toolbar',
        template: "<div class=\"ngx-toolbar\" *ngIf=\"config['showToolbar']\">\r\n  <div class=\"ngx-toolbar-set\">\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('bold')\" (click)=\"triggerCommand('bold')\"\r\n      title=\"Bold\" [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-bold\" aria-hidden=\"true\"></i>\r\n    </button>\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('italic')\" (click)=\"triggerCommand('italic')\"\r\n      title=\"Italic\" [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-italic\" aria-hidden=\"true\"></i>\r\n    </button>\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('underline')\" (click)=\"triggerCommand('underline')\"\r\n      title=\"Underline\" [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-underline\" aria-hidden=\"true\"></i>\r\n    </button>\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('strikeThrough')\" (click)=\"triggerCommand('strikeThrough')\"\r\n      title=\"Strikethrough\" [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-strikethrough\" aria-hidden=\"true\"></i>\r\n    </button>\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('superscript')\" (click)=\"triggerCommand('superscript')\"\r\n      title=\"Superscript\" [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-superscript\" aria-hidden=\"true\"></i>\r\n    </button>\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('subscript')\" (click)=\"triggerCommand('subscript')\"\r\n      title=\"Subscript\" [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-subscript\" aria-hidden=\"true\"></i>\r\n    </button>\r\n  </div>\r\n  <div class=\"ngx-toolbar-set\">\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('fontName')\" (click)=\"fontName = ''\"\r\n      title=\"Font Family\" [popover]=\"fontNameTemplate\" #fontNamePopover=\"bs-popover\" containerClass=\"ngxePopover\"\r\n      [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-font\" aria-hidden=\"true\"></i>\r\n    </button>\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('fontSize')\" (click)=\"fontSize = ''\"\r\n      title=\"Font Size\" [popover]=\"fontSizeTemplate\" #fontSizePopover=\"bs-popover\" containerClass=\"ngxePopover\"\r\n      [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-text-height\" aria-hidden=\"true\"></i>\r\n    </button>\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('color')\" (click)=\"hexColor = ''\"\r\n      title=\"Color Picker\" [popover]=\"insertColorTemplate\" #colorPopover=\"bs-popover\" containerClass=\"ngxePopover\"\r\n      [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-tint\" aria-hidden=\"true\"></i>\r\n    </button>\r\n  </div>\r\n  <div class=\"ngx-toolbar-set\">\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('justifyLeft')\" (click)=\"triggerCommand('justifyLeft')\"\r\n      title=\"Justify Left\" [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-align-left\" aria-hidden=\"true\"></i>\r\n    </button>\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('justifyCenter')\" (click)=\"triggerCommand('justifyCenter')\"\r\n      title=\"Justify Center\" [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-align-center\" aria-hidden=\"true\"></i>\r\n    </button>\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('justifyRight')\" (click)=\"triggerCommand('justifyRight')\"\r\n      title=\"Justify Right\" [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-align-right\" aria-hidden=\"true\"></i>\r\n    </button>\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('justifyFull')\" (click)=\"triggerCommand('justifyFull')\"\r\n      title=\"Justify\" [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-align-justify\" aria-hidden=\"true\"></i>\r\n    </button>\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('indent')\" (click)=\"triggerCommand('indent')\"\r\n      title=\"Indent\" [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-indent\" aria-hidden=\"true\"></i>\r\n    </button>\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('outdent')\" (click)=\"triggerCommand('outdent')\"\r\n      title=\"Outdent\" [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-outdent\" aria-hidden=\"true\"></i>\r\n    </button>\r\n  </div>\r\n  <div class=\"ngx-toolbar-set\">\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('cut')\" (click)=\"triggerCommand('cut')\"\r\n      title=\"Cut\" [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-scissors\" aria-hidden=\"true\"></i>\r\n    </button>\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('copy')\" (click)=\"triggerCommand('copy')\"\r\n      title=\"Copy\" [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-files-o\" aria-hidden=\"true\"></i>\r\n    </button>\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('delete')\" (click)=\"triggerCommand('delete')\"\r\n      title=\"Delete\" [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-trash\" aria-hidden=\"true\"></i>\r\n    </button>\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('removeFormat')\" (click)=\"triggerCommand('removeFormat')\"\r\n      title=\"Clear Formatting\" [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-eraser\" aria-hidden=\"true\"></i>\r\n    </button>\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('undo')\" (click)=\"triggerCommand('undo')\"\r\n      title=\"Undo\" [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-undo\" aria-hidden=\"true\"></i>\r\n    </button>\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('redo')\" (click)=\"triggerCommand('redo')\"\r\n      title=\"Redo\" [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-repeat\" aria-hidden=\"true\"></i>\r\n    </button>\r\n  </div>\r\n  <div class=\"ngx-toolbar-set\">\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('paragraph')\" (click)=\"triggerCommand('insertParagraph')\"\r\n      title=\"Paragraph\" [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-paragraph\" aria-hidden=\"true\"></i>\r\n    </button>\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('blockquote')\" (click)=\"triggerCommand('blockquote')\"\r\n      title=\"Blockquote\" [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-quote-left\" aria-hidden=\"true\"></i>\r\n    </button>\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('removeBlockquote')\" (click)=\"triggerCommand('removeBlockquote')\"\r\n      title=\"Remove Blockquote\" [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-quote-right\" aria-hidden=\"true\"></i>\r\n    </button>\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('horizontalLine')\" (click)=\"triggerCommand('insertHorizontalRule')\"\r\n      title=\"Horizontal Line\" [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-minus\" aria-hidden=\"true\"></i>\r\n    </button>\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('unorderedList')\" (click)=\"triggerCommand('insertUnorderedList')\"\r\n      title=\"Unordered List\" [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-list-ul\" aria-hidden=\"true\"></i>\r\n    </button>\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('orderedList')\" (click)=\"triggerCommand('insertOrderedList')\"\r\n      title=\"Ordered List\" [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-list-ol\" aria-hidden=\"true\"></i>\r\n    </button>\r\n  </div>\r\n  <div class=\"ngx-toolbar-set\">\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('link')\" (click)=\"buildUrlForm()\"\r\n      [popover]=\"insertLinkTemplate\" title=\"Insert Link\" #urlPopover=\"bs-popover\" containerClass=\"ngxePopover\"\r\n      [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-link\" aria-hidden=\"true\"></i>\r\n    </button>\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('unlink')\" (click)=\"triggerCommand('unlink')\"\r\n      title=\"Unlink\" [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-chain-broken\" aria-hidden=\"true\"></i>\r\n    </button>\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('image')\" (click)=\"buildImageForm()\"\r\n      title=\"Insert Image\" [popover]=\"insertImageTemplate\" #imagePopover=\"bs-popover\" containerClass=\"ngxePopover\"\r\n      [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-picture-o\" aria-hidden=\"true\"></i>\r\n    </button>\r\n    <button type=\"button\" class=\"ngx-editor-button\" *ngIf=\"canEnableToolbarOptions('video')\" (click)=\"buildVideoForm()\"\r\n      title=\"Insert Video\" [popover]=\"insertVideoTemplate\" #videoPopover=\"bs-popover\" containerClass=\"ngxePopover\"\r\n      [disabled]=\"!config['enableToolbar']\">\r\n      <i class=\"fa fa-youtube-play\" aria-hidden=\"true\"></i>\r\n    </button>\r\n  </div>\r\n</div>\r\n\r\n<!-- URL Popover template -->\r\n<ng-template #insertLinkTemplate>\r\n  <div class=\"ngxe-popover extra-gt\">\r\n    <form [formGroup]=\"urlForm\" (ngSubmit)=\"urlForm.valid && insertLink()\" autocomplete=\"off\">\r\n      <div class=\"form-group\">\r\n        <label for=\"urlInput\" class=\"small\">URL</label>\r\n        <input type=\"text\" class=\"form-control-sm\" id=\"URLInput\" placeholder=\"URL\" formControlName=\"urlLink\" required>\r\n      </div>\r\n      <div class=\"form-group\">\r\n        <label for=\"urlTextInput\" class=\"small\">Text</label>\r\n        <input type=\"text\" class=\"form-control-sm\" id=\"urlTextInput\" placeholder=\"Text\" formControlName=\"urlText\"\r\n          required>\r\n      </div>\r\n      <div class=\"form-check\">\r\n        <input type=\"checkbox\" class=\"form-check-input\" id=\"urlNewTab\" formControlName=\"urlNewTab\">\r\n        <label class=\"form-check-label\" for=\"urlNewTab\">Open in new tab</label>\r\n      </div>\r\n      <button type=\"submit\" class=\"btn-primary btn-sm btn\">Submit</button>\r\n    </form>\r\n  </div>\r\n</ng-template>\r\n\r\n<!-- Image Uploader Popover template -->\r\n<ng-template #insertImageTemplate>\r\n  <div class=\"ngxe-popover imgc-ctnr\">\r\n    <div class=\"imgc-topbar btn-ctnr\">\r\n      <button type=\"button\" class=\"btn\" [ngClass]=\"{active: isImageUploader}\" (click)=\"isImageUploader = true\">\r\n        <i class=\"fa fa-upload\"></i>\r\n      </button>\r\n      <button type=\"button\" class=\"btn\" [ngClass]=\"{active: !isImageUploader}\" (click)=\"isImageUploader = false\">\r\n        <i class=\"fa fa-link\"></i>\r\n      </button>\r\n    </div>\r\n    <div class=\"imgc-ctnt is-image\">\r\n      <div *ngIf=\"isImageUploader; else insertImageLink\"> </div>\r\n      <div *ngIf=\"!isImageUploader; else imageUploder\"> </div>\r\n      <ng-template #imageUploder>\r\n        <div class=\"ngx-insert-img-ph\">\r\n          <p *ngIf=\"uploadComplete\">Choose Image</p>\r\n          <p *ngIf=\"!uploadComplete\">\r\n            <span>Uploading Image</span>\r\n            <br>\r\n            <span>{{ updloadPercentage }} %</span>\r\n          </p>\r\n          <div class=\"ngxe-img-upl-frm\">\r\n            <input type=\"file\" (change)=\"onFileChange($event)\" accept=\"image/*\" [disabled]=\"isUploading\" [style.cursor]=\"isUploading ? 'not-allowed': 'allowed'\">\r\n          </div>\r\n        </div>\r\n      </ng-template>\r\n      <ng-template #insertImageLink>\r\n        <form class=\"extra-gt\" [formGroup]=\"imageForm\" (ngSubmit)=\"imageForm.valid && insertImage()\" autocomplete=\"off\">\r\n          <div class=\"form-group\">\r\n            <label for=\"imageURLInput\" class=\"small\">URL</label>\r\n            <input type=\"text\" class=\"form-control-sm\" id=\"imageURLInput\" placeholder=\"URL\" formControlName=\"imageUrl\"\r\n              required>\r\n          </div>\r\n          <button type=\"submit\" class=\"btn-primary btn-sm btn\">Submit</button>\r\n        </form>\r\n      </ng-template>\r\n      <div class=\"progress\" *ngIf=\"!uploadComplete\">\r\n        <div class=\"progress-bar progress-bar-striped progress-bar-animated bg-success\" [ngClass]=\"{'bg-danger': updloadPercentage<20, 'bg-warning': updloadPercentage<50, 'bg-success': updloadPercentage>=100}\"\r\n          [style.width.%]=\"updloadPercentage\"></div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</ng-template>\r\n\r\n\r\n<!-- Insert Video Popover template -->\r\n<ng-template #insertVideoTemplate>\r\n  <div class=\"ngxe-popover imgc-ctnr\">\r\n    <div class=\"imgc-topbar btn-ctnr\">\r\n      <button type=\"button\" class=\"btn active\">\r\n        <i class=\"fa fa-link\"></i>\r\n      </button>\r\n    </div>\r\n    <div class=\"imgc-ctnt is-image\">\r\n      <form class=\"extra-gt\" [formGroup]=\"videoForm\" (ngSubmit)=\"videoForm.valid && insertVideo()\" autocomplete=\"off\">\r\n        <div class=\"form-group\">\r\n          <label for=\"videoURLInput\" class=\"small\">URL</label>\r\n          <input type=\"text\" class=\"form-control-sm\" id=\"videoURLInput\" placeholder=\"URL\" formControlName=\"videoUrl\"\r\n            required>\r\n        </div>\r\n        <div class=\"row form-group\">\r\n          <div class=\"col\">\r\n            <input type=\"text\" class=\"form-control-sm\" formControlName=\"height\" placeholder=\"height (px)\" pattern=\"[0-9]\">\r\n          </div>\r\n          <div class=\"col\">\r\n            <input type=\"text\" class=\"form-control-sm\" formControlName=\"width\" placeholder=\"width (px)\" pattern=\"[0-9]\">\r\n          </div>\r\n          <label class=\"small\">Height/Width</label>\r\n        </div>\r\n        <button type=\"submit\" class=\"btn-primary btn-sm btn\">Submit</button>\r\n      </form>\r\n    </div>\r\n  </div>\r\n</ng-template>\r\n\r\n<!-- Insert color template -->\r\n<ng-template #insertColorTemplate>\r\n  <div class=\"ngxe-popover imgc-ctnr\">\r\n    <div class=\"imgc-topbar two-tabs\">\r\n      <span (click)=\"selectedColorTab ='textColor'\" [ngClass]=\"{active: selectedColorTab ==='textColor'}\">Text</span>\r\n      <span (click)=\"selectedColorTab ='backgroundColor'\" [ngClass]=\"{active: selectedColorTab ==='backgroundColor'}\">Background</span>\r\n    </div>\r\n    <div class=\"imgc-ctnt is-color extra-gt1\">\r\n      <form autocomplete=\"off\">\r\n        <div class=\"form-group\">\r\n          <label for=\"hexInput\" class=\"small\">Hex Color</label>\r\n          <input type=\"text\" class=\"form-control-sm\" id=\"hexInput\" name=\"hexInput\" maxlength=\"7\" placeholder=\"HEX Color\"\r\n            [(ngModel)]=\"hexColor\" required>\r\n        </div>\r\n        <button type=\"button\" class=\"btn-primary btn-sm btn\" (click)=\"insertColor(hexColor, selectedColorTab)\">Submit</button>\r\n      </form>\r\n    </div>\r\n  </div>\r\n</ng-template>\r\n\r\n<!-- font size template -->\r\n<ng-template #fontSizeTemplate>\r\n  <div class=\"ngxe-popover extra-gt1\">\r\n    <form autocomplete=\"off\">\r\n      <div class=\"form-group\">\r\n        <label for=\"fontSize\" class=\"small\">Font Size</label>\r\n        <input type=\"text\" class=\"form-control-sm\" id=\"fontSize\" name=\"fontSize\" placeholder=\"Font size in px/rem\"\r\n          [(ngModel)]=\"fontSize\" required>\r\n      </div>\r\n      <button type=\"button\" class=\"btn-primary btn-sm btn\" (click)=\"setFontSize(fontSize)\">Submit</button>\r\n    </form>\r\n  </div>\r\n</ng-template>\r\n\r\n<!-- font family/name template -->\r\n<ng-template #fontNameTemplate>\r\n  <div class=\"ngxe-popover extra-gt1\">\r\n    <form autocomplete=\"off\">\r\n      <div class=\"form-group\">\r\n        <label for=\"fontSize\" class=\"small\">Font Size</label>\r\n        <input type=\"text\" class=\"form-control-sm\" id=\"fontSize\" name=\"fontName\" placeholder=\"Ex: 'Times New Roman', Times, serif\"\r\n          [(ngModel)]=\"fontName\" required>\r\n      </div>\r\n      <button type=\"button\" class=\"btn-primary btn-sm btn\" (click)=\"setFontName(fontName)\">Submit</button>\r\n    </form>\r\n  </div>\r\n</ng-template>\r\n",
        providers: [PopoverConfig],
        styles: ["::ng-deep .ngxePopover.popover{position:absolute;top:0;left:0;z-index:1060;display:block;max-width:276px;font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,\"Helvetica Neue\",Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",\"Segoe UI Symbol\";font-style:normal;font-weight:400;line-height:1.5;text-align:left;text-align:start;text-decoration:none;text-shadow:none;text-transform:none;letter-spacing:normal;word-break:normal;word-spacing:normal;white-space:normal;line-break:auto;font-size:.875rem;word-wrap:break-word;background-color:#fff;background-clip:padding-box;border:1px solid rgba(0,0,0,.2);border-radius:.3rem}::ng-deep .ngxePopover.popover .arrow{position:absolute;display:block;width:1rem;height:.5rem;margin:0 .3rem}::ng-deep .ngxePopover.popover .arrow::after,::ng-deep .ngxePopover.popover .arrow::before{position:absolute;display:block;content:\"\";border-color:transparent;border-style:solid}::ng-deep .ngxePopover.popover .popover-header{padding:.5rem .75rem;margin-bottom:0;font-size:1rem;color:inherit;background-color:#f7f7f7;border-bottom:1px solid #ebebeb;border-top-left-radius:calc(.3rem - 1px);border-top-right-radius:calc(.3rem - 1px)}::ng-deep .ngxePopover.popover .popover-header:empty{display:none}::ng-deep .ngxePopover.popover .popover-body{padding:.5rem .75rem;color:#212529}::ng-deep .ngxePopover.popover.bs-popover-auto[x-placement^=top],::ng-deep .ngxePopover.popover.bs-popover-top{margin-bottom:.5rem}::ng-deep .ngxePopover.popover.bs-popover-auto[x-placement^=top] .arrow,::ng-deep .ngxePopover.popover.bs-popover-top .arrow{bottom:calc((.5rem + 1px) * -1)}::ng-deep .ngxePopover.popover.bs-popover-auto[x-placement^=top] .arrow::after,::ng-deep .ngxePopover.popover.bs-popover-auto[x-placement^=top] .arrow::before,::ng-deep .ngxePopover.popover.bs-popover-top .arrow::after,::ng-deep .ngxePopover.popover.bs-popover-top .arrow::before{border-width:.5rem .5rem 0}::ng-deep .ngxePopover.popover.bs-popover-auto[x-placement^=top] .arrow::before,::ng-deep .ngxePopover.popover.bs-popover-top .arrow::before{bottom:0;border-top-color:rgba(0,0,0,.25)}::ng-deep .ngxePopover.popover.bs-popover-auto[x-placement^=top] .arrow::after,::ng-deep .ngxePopover.popover.bs-popover-top .arrow::after{bottom:1px;border-top-color:#fff}::ng-deep .ngxePopover.popover.bs-popover-auto[x-placement^=right],::ng-deep .ngxePopover.popover.bs-popover-right{margin-left:.5rem}::ng-deep .ngxePopover.popover.bs-popover-auto[x-placement^=right] .arrow,::ng-deep .ngxePopover.popover.bs-popover-right .arrow{left:calc((.5rem + 1px) * -1);width:.5rem;height:1rem;margin:.3rem 0}::ng-deep .ngxePopover.popover.bs-popover-auto[x-placement^=right] .arrow::after,::ng-deep .ngxePopover.popover.bs-popover-auto[x-placement^=right] .arrow::before,::ng-deep .ngxePopover.popover.bs-popover-right .arrow::after,::ng-deep .ngxePopover.popover.bs-popover-right .arrow::before{border-width:.5rem .5rem .5rem 0}::ng-deep .ngxePopover.popover.bs-popover-auto[x-placement^=right] .arrow::before,::ng-deep .ngxePopover.popover.bs-popover-right .arrow::before{left:0;border-right-color:rgba(0,0,0,.25)}::ng-deep .ngxePopover.popover.bs-popover-auto[x-placement^=right] .arrow::after,::ng-deep .ngxePopover.popover.bs-popover-right .arrow::after{left:1px;border-right-color:#fff}::ng-deep .ngxePopover.popover.bs-popover-auto[x-placement^=bottom],::ng-deep .ngxePopover.popover.bs-popover-bottom{margin-top:.5rem}::ng-deep .ngxePopover.popover.bs-popover-auto[x-placement^=bottom] .arrow,::ng-deep .ngxePopover.popover.bs-popover-bottom .arrow{left:45%!important;top:calc((.5rem + 1px) * -1)}::ng-deep .ngxePopover.popover.bs-popover-auto[x-placement^=bottom] .arrow::after,::ng-deep .ngxePopover.popover.bs-popover-auto[x-placement^=bottom] .arrow::before,::ng-deep .ngxePopover.popover.bs-popover-bottom .arrow::after,::ng-deep .ngxePopover.popover.bs-popover-bottom .arrow::before{border-width:0 .5rem .5rem}::ng-deep .ngxePopover.popover.bs-popover-auto[x-placement^=bottom] .arrow::before,::ng-deep .ngxePopover.popover.bs-popover-bottom .arrow::before{top:0;border-bottom-color:rgba(0,0,0,.25)}::ng-deep .ngxePopover.popover.bs-popover-auto[x-placement^=bottom] .arrow::after,::ng-deep .ngxePopover.popover.bs-popover-bottom .arrow::after{top:1px;border-bottom-color:#fff}::ng-deep .ngxePopover.popover.bs-popover-auto[x-placement^=bottom] .popover-header::before,::ng-deep .ngxePopover.popover.bs-popover-bottom .popover-header::before{position:absolute;top:0;left:50%;display:block;width:1rem;margin-left:-.5rem;content:\"\";border-bottom:1px solid #f7f7f7}::ng-deep .ngxePopover.popover.bs-popover-auto[x-placement^=left],::ng-deep .ngxePopover.popover.bs-popover-left{margin-right:.5rem}::ng-deep .ngxePopover.popover.bs-popover-auto[x-placement^=left] .arrow,::ng-deep .ngxePopover.popover.bs-popover-left .arrow{right:calc((.5rem + 1px) * -1);width:.5rem;height:1rem;margin:.3rem 0}::ng-deep .ngxePopover.popover.bs-popover-auto[x-placement^=left] .arrow::after,::ng-deep .ngxePopover.popover.bs-popover-auto[x-placement^=left] .arrow::before,::ng-deep .ngxePopover.popover.bs-popover-left .arrow::after,::ng-deep .ngxePopover.popover.bs-popover-left .arrow::before{border-width:.5rem 0 .5rem .5rem}::ng-deep .ngxePopover.popover.bs-popover-auto[x-placement^=left] .arrow::before,::ng-deep .ngxePopover.popover.bs-popover-left .arrow::before{right:0;border-left-color:rgba(0,0,0,.25)}::ng-deep .ngxePopover.popover.bs-popover-auto[x-placement^=left] .arrow::after,::ng-deep .ngxePopover.popover.bs-popover-left .arrow::after{right:1px;border-left-color:#fff}::ng-deep .ngxePopover .btn{display:inline-block;font-weight:400;text-align:center;white-space:nowrap;vertical-align:middle;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;border:1px solid transparent;padding:.375rem .75rem;font-size:1rem;line-height:1.5;border-radius:.25rem;-webkit-transition:color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;transition:color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out}::ng-deep .ngxePopover .btn.btn-sm{padding:.25rem .5rem;font-size:.875rem;line-height:1.5;border-radius:.2rem}::ng-deep .ngxePopover .btn:active,::ng-deep .ngxePopover .btn:focus{outline:0;box-shadow:none}::ng-deep .ngxePopover .btn.btn-primary{color:#fff;background-color:#007bff;border-color:#007bff}::ng-deep .ngxePopover .btn.btn-primary:hover{color:#fff;background-color:#0069d9;border-color:#0062cc}::ng-deep .ngxePopover .btn:not(:disabled):not(.disabled){cursor:pointer}::ng-deep .ngxePopover form .form-group{margin-bottom:1rem}::ng-deep .ngxePopover form .form-group input{overflow:visible}::ng-deep .ngxePopover form .form-group .form-control-sm{width:100%;outline:0;border:none;border-bottom:1px solid #bdbdbd;border-radius:0;margin-bottom:1px;padding:.25rem .5rem;font-size:.875rem;line-height:1.5}::ng-deep .ngxePopover form .form-group.row{display:-webkit-box;display:flex;flex-wrap:wrap;margin-left:0;margin-right:0}::ng-deep .ngxePopover form .form-group.row .col{flex-basis:0;-webkit-box-flex:1;flex-grow:1;max-width:100%;padding:0}::ng-deep .ngxePopover form .form-group.row .col:first-child{padding-right:15px}::ng-deep .ngxePopover form .form-check{position:relative;display:block;padding-left:1.25rem}::ng-deep .ngxePopover form .form-check .form-check-input{position:absolute;margin-top:.3rem;margin-left:-1.25rem}.ngx-toolbar{display:-webkit-box;display:flex;flex-wrap:wrap;background-color:#f5f5f5;font-size:.8rem;padding:.2rem .2rem 0;border:1px solid #ddd}.ngx-toolbar .ngx-toolbar-set{display:-webkit-box;display:flex;border-radius:5px;background-color:#fff;margin-right:.2rem;margin-bottom:.2rem}.ngx-toolbar .ngx-toolbar-set .ngx-editor-button{background-color:transparent;padding:.4rem;min-width:2.5rem;border:1px solid #ddd;border-right:transparent}.ngx-toolbar .ngx-toolbar-set .ngx-editor-button:hover{cursor:pointer;background-color:#f1f1f1;-webkit-transition:.2s;transition:.2s}.ngx-toolbar .ngx-toolbar-set .ngx-editor-button.focus,.ngx-toolbar .ngx-toolbar-set .ngx-editor-button:focus{outline:0}.ngx-toolbar .ngx-toolbar-set .ngx-editor-button:last-child{border-right:1px solid #ddd;border-top-right-radius:5px;border-bottom-right-radius:5px}.ngx-toolbar .ngx-toolbar-set .ngx-editor-button:first-child{border-top-left-radius:5px;border-bottom-left-radius:5px}.ngx-toolbar .ngx-toolbar-set .ngx-editor-button:disabled{background-color:#f5f5f5;pointer-events:none;cursor:not-allowed}::ng-deep .popover{border-top-right-radius:0;border-top-left-radius:0}::ng-deep .ngxe-popover{min-width:15rem;white-space:nowrap}::ng-deep .ngxe-popover .extra-gt,::ng-deep .ngxe-popover.extra-gt{padding-top:.5rem!important}::ng-deep .ngxe-popover .extra-gt1,::ng-deep .ngxe-popover.extra-gt1{padding-top:.75rem!important}::ng-deep .ngxe-popover .extra-gt2,::ng-deep .ngxe-popover.extra-gt2{padding-top:1rem!important}::ng-deep .ngxe-popover .form-group label{display:none;margin:0}::ng-deep .ngxe-popover .form-group .form-control-sm{width:100%;outline:0;border:none;border-bottom:1px solid #bdbdbd;border-radius:0;margin-bottom:1px;padding-left:0;padding-right:0}::ng-deep .ngxe-popover .form-group .form-control-sm:active,::ng-deep .ngxe-popover .form-group .form-control-sm:focus{border-bottom:2px solid #1e88e5;box-shadow:none;margin-bottom:0}::ng-deep .ngxe-popover .form-group .form-control-sm.ng-dirty.ng-invalid:not(.ng-pristine){border-bottom:2px solid red}::ng-deep .ngxe-popover .form-check{margin-bottom:1rem}::ng-deep .ngxe-popover .btn:focus{box-shadow:none!important}::ng-deep .ngxe-popover.imgc-ctnr{margin:-.5rem -.75rem}::ng-deep .ngxe-popover.imgc-ctnr .imgc-topbar{box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 1px 1px rgba(0,0,0,.16);border-bottom:0}::ng-deep .ngxe-popover.imgc-ctnr .imgc-topbar.btn-ctnr button{background-color:transparent;border-radius:0}::ng-deep .ngxe-popover.imgc-ctnr .imgc-topbar.btn-ctnr button:hover{cursor:pointer;background-color:#f1f1f1;-webkit-transition:.2s;transition:.2s}::ng-deep .ngxe-popover.imgc-ctnr .imgc-topbar.btn-ctnr button.active{color:#007bff;-webkit-transition:.2s;transition:.2s}::ng-deep .ngxe-popover.imgc-ctnr .imgc-topbar.two-tabs span{width:50%;display:-webkit-inline-box;display:inline-flex;-webkit-box-pack:center;justify-content:center;padding:.4rem 0;margin:0 -1px 2px}::ng-deep .ngxe-popover.imgc-ctnr .imgc-topbar.two-tabs span:hover{cursor:pointer}::ng-deep .ngxe-popover.imgc-ctnr .imgc-topbar.two-tabs span.active{margin-bottom:-2px;border-bottom:2px solid #007bff;color:#007bff}::ng-deep .ngxe-popover.imgc-ctnr .imgc-ctnt{padding:.5rem}::ng-deep .ngxe-popover.imgc-ctnr .imgc-ctnt.is-image .progress{height:.5rem;margin:.5rem -.5rem -.6rem}::ng-deep .ngxe-popover.imgc-ctnr .imgc-ctnt.is-image p{margin:0}::ng-deep .ngxe-popover.imgc-ctnr .imgc-ctnt.is-image .ngx-insert-img-ph{border:2px dashed #bdbdbd;padding:1.8rem 0;position:relative;letter-spacing:1px;text-align:center}::ng-deep .ngxe-popover.imgc-ctnr .imgc-ctnt.is-image .ngx-insert-img-ph:hover{background:#ebebeb}::ng-deep .ngxe-popover.imgc-ctnr .imgc-ctnt.is-image .ngx-insert-img-ph .ngxe-img-upl-frm{opacity:0;position:absolute;top:0;bottom:0;left:0;right:0;z-index:2147483640;overflow:hidden;margin:0;padding:0;width:100%}::ng-deep .ngxe-popover.imgc-ctnr .imgc-ctnt.is-image .ngx-insert-img-ph .ngxe-img-upl-frm input{cursor:pointer;position:absolute;right:0;top:0;bottom:0;margin:0}"]
    })
], NgxEditorToolbarComponent);

let NgxEditorModule = class NgxEditorModule {
};
NgxEditorModule = __decorate([
    NgModule({
        imports: [CommonModule, FormsModule, ReactiveFormsModule, PopoverModule.forRoot(), HttpClientModule],
        declarations: [NgxEditorComponent, NgxGrippieComponent, NgxEditorMessageComponent, NgxEditorToolbarComponent],
        exports: [NgxEditorComponent],
        providers: [CommandExecutorService, MessageService]
    })
], NgxEditorModule);

/**
 * Generated bundle index. Do not edit.
 */

export { NgxEditorModule, NgxEditorComponent as ɵa, MessageService as ɵb, CommandExecutorService as ɵc, NgxGrippieComponent as ɵd, NgxEditorMessageComponent as ɵe, NgxEditorToolbarComponent as ɵf };
//# sourceMappingURL=my-lib.js.map
