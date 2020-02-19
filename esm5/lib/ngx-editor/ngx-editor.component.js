import { __decorate } from "tslib";
import { Component, OnInit, Input, Output, ViewChild, ElementRef, EventEmitter, Renderer2, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommandExecutorService } from './common/services/command-executor.service';
import { MessageService } from './common/services/message.service';
import { ngxEditorConfig } from './common/ngx-editor.defaults';
import * as Utils from './common/utils/ngx-editor.utils';
var NgxEditorComponent = /** @class */ (function () {
    function NgxEditorComponent(_messageService, _commandExecutor, _renderer) {
        this._messageService = _messageService;
        this._commandExecutor = _commandExecutor;
        this._renderer = _renderer;
        this.resizer = 'stack';
        this.config = ngxEditorConfig;
        this.blur = new EventEmitter();
        this.focus = new EventEmitter();
        this.Utils = Utils;
    }
    NgxEditorComponent_1 = NgxEditorComponent;
    NgxEditorComponent.prototype.onTextAreaFocus = function () {
        this.focus.emit('focus');
    };
    NgxEditorComponent.prototype.onEditorFocus = function () {
        var textArea = document.getElementById('textArea');
        ((this.textArea || {}).nativeElement || textArea).focus();
    };
    NgxEditorComponent.prototype.onContentChange = function (innerHTML) {
        if (typeof this.onChange === 'function') {
            this.onChange(innerHTML);
            this.togglePlaceholder(innerHTML);
        }
    };
    NgxEditorComponent.prototype.onTextAreaBlur = function () {
        /** save selection if focussed out */
        this._commandExecutor.savedSelection = Utils.saveSelection();
        if (typeof this.onTouched === 'function') {
            this.onTouched();
        }
        this.blur.emit('blur');
    };
    NgxEditorComponent.prototype.resizeTextArea = function (offsetY) {
        var newHeight = parseInt(this.height, 10);
        newHeight += offsetY;
        this.height = newHeight + 'px';
        var textArea = document.getElementById('textArea');
        ((this.textArea || {}).nativeElement || textArea).style.height = this.height;
    };
    NgxEditorComponent.prototype.executeCommand = function (commandName) {
        try {
            this._commandExecutor.execute(commandName);
        }
        catch (error) {
            this._messageService.sendMessage(error.message);
        }
    };
    NgxEditorComponent.prototype.writeValue = function (value) {
        this.togglePlaceholder(value);
        if (value === null || value === undefined || value === '' || value === '<br>') {
            value = null;
        }
        this.refreshView(value);
    };
    NgxEditorComponent.prototype.registerOnChange = function (fn) {
        this.onChange = fn;
    };
    NgxEditorComponent.prototype.registerOnTouched = function (fn) {
        this.onTouched = fn;
    };
    NgxEditorComponent.prototype.refreshView = function (value) {
        var textArea = document.getElementById('textArea');
        var normalizedValue = value === null ? '' : value;
        this._renderer.setProperty((this.textArea || {}).nativeElement || textArea, 'innerHTML', normalizedValue);
    };
    NgxEditorComponent.prototype.togglePlaceholder = function (value) {
        console.log(this.ngxWrapper);
        var ngxWrapper = document.getElementById('ngxWrapper');
        if (!value || value === '<br>' || value === '') {
            this._renderer.addClass((this.ngxWrapper || {}).nativeElement || ngxWrapper, 'show-placeholder');
        }
        else {
            this._renderer.removeClass((this.ngxWrapper || {}).nativeElement || ngxWrapper, 'show-placeholder');
        }
    };
    NgxEditorComponent.prototype.getCollectiveParams = function () {
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
    };
    NgxEditorComponent.prototype.ngOnInit = function () {
        this.config = this.Utils.getEditorConfiguration(this.config, ngxEditorConfig, this.getCollectiveParams());
        var textArea = document.getElementById('textArea');
        this.height = this.height || ((this.textArea || {}).nativeElement || textArea).offsetHeight;
        this.executeCommand('enableObjectResizing');
    };
    var NgxEditorComponent_1;
    NgxEditorComponent.ctorParameters = function () { return [
        { type: MessageService },
        { type: CommandExecutorService },
        { type: Renderer2 }
    ]; };
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
                    useExisting: forwardRef(function () { return NgxEditorComponent_1; }),
                    multi: true
                }],
            styles: [".ngx-editor{position:relative}.ngx-editor ::ng-deep [contenteditable=true]:empty:before{content:attr(placeholder);display:block;color:#868e96;opacity:1}.ngx-editor .ngx-wrapper{position:relative}.ngx-editor .ngx-wrapper .ngx-editor-textarea{min-height:5rem;padding:.5rem .8rem 1rem;border:1px solid #ddd;background-color:transparent;overflow-x:hidden;overflow-y:auto;z-index:2;position:relative}.ngx-editor .ngx-wrapper .ngx-editor-textarea.focus,.ngx-editor .ngx-wrapper .ngx-editor-textarea:focus{outline:0}.ngx-editor .ngx-wrapper .ngx-editor-textarea ::ng-deep blockquote{margin-left:1rem;border-left:.2em solid #dfe2e5;padding-left:.5rem}.ngx-editor .ngx-wrapper ::ng-deep p{margin-bottom:0}.ngx-editor .ngx-wrapper .ngx-editor-placeholder{display:none;position:absolute;top:0;padding:.5rem .8rem 1rem .9rem;z-index:1;color:#6c757d;opacity:1}.ngx-editor .ngx-wrapper.show-placeholder .ngx-editor-placeholder{display:block}"]
        })
    ], NgxEditorComponent);
    return NgxEditorComponent;
}());
export { NgxEditorComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWVkaXRvci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9teS1saWIvIiwic291cmNlcyI6WyJsaWIvbmd4LWVkaXRvci9uZ3gtZWRpdG9yLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUNMLFNBQVMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUN2RCxZQUFZLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFDcEMsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLGlCQUFpQixFQUF1QixNQUFNLGdCQUFnQixDQUFDO0FBRXZFLE9BQU8sRUFBQyxzQkFBc0IsRUFBQyxNQUFNLDRDQUE0QyxDQUFDO0FBQ2xGLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQ0FBbUMsQ0FBQztBQUVqRSxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFDN0QsT0FBTyxLQUFLLEtBQUssTUFBTSxpQ0FBaUMsQ0FBQztBQWF6RDtJQTJCRSw0QkFBb0IsZUFBK0IsRUFBVSxnQkFBd0MsRUFBVSxTQUFvQjtRQUEvRyxvQkFBZSxHQUFmLGVBQWUsQ0FBZ0I7UUFBVSxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQXdCO1FBQVUsY0FBUyxHQUFULFNBQVMsQ0FBVztRQWpCMUgsWUFBTyxHQUFHLE9BQU8sQ0FBQztRQUNsQixXQUFNLEdBQUcsZUFBZSxDQUFDO1FBS3hCLFNBQUksR0FBeUIsSUFBSSxZQUFZLEVBQVUsQ0FBQztRQUN4RCxVQUFLLEdBQXlCLElBQUksWUFBWSxFQUFVLENBQUM7UUFLbkUsVUFBSyxHQUFRLEtBQUssQ0FBQztJQU1uQixDQUFDOzJCQTVCVSxrQkFBa0I7SUE4QjdCLDRDQUFlLEdBQWY7UUFDRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRUQsMENBQWEsR0FBYjtRQUNFLElB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QUFTLENBQUMsWUFBWSxFQUFFLEVBQUMsTUFBTSxFQUFFLEtBQUssRUFBQyxDQUFDOzBEQUF3QjtJQXBCdEQsa0JBQWtCO1FBWDlCLFNBQVMsQ0FBQztZQUNULFFBQVEsRUFBRSxnQkFBZ0I7WUFDMUIsc2xDQUEwQztZQUUxQyxTQUFTLEVBQUUsQ0FBQztvQkFDVixPQUFPLEVBQUUsaUJBQWlCO29CQUMxQixXQUFXLEVBQUUsVUFBVSxDQUFDLGNBQU0sT0FBQSxvQkFBa0IsRUFBbEIsQ0FBa0IsQ0FBQztvQkFDakQsS0FBSyxFQUFFLElBQUk7aUJBQ1osQ0FBQzs7U0FDSCxDQUFDO09BRVcsa0JBQWtCLENBa0k5QjtJQUFELHlCQUFDO0NBQUEsQUFsSUQsSUFrSUM7U0FsSVksa0JBQWtCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcclxuICBDb21wb25lbnQsIE9uSW5pdCwgSW5wdXQsIE91dHB1dCwgVmlld0NoaWxkLCBFbGVtZW50UmVmLFxyXG4gIEV2ZW50RW1pdHRlciwgUmVuZGVyZXIyLCBmb3J3YXJkUmVmXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7TkdfVkFMVUVfQUNDRVNTT1IsIENvbnRyb2xWYWx1ZUFjY2Vzc29yfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XHJcblxyXG5pbXBvcnQge0NvbW1hbmRFeGVjdXRvclNlcnZpY2V9IGZyb20gJy4vY29tbW9uL3NlcnZpY2VzL2NvbW1hbmQtZXhlY3V0b3Iuc2VydmljZSc7XHJcbmltcG9ydCB7TWVzc2FnZVNlcnZpY2V9IGZyb20gJy4vY29tbW9uL3NlcnZpY2VzL21lc3NhZ2Uuc2VydmljZSc7XHJcblxyXG5pbXBvcnQge25neEVkaXRvckNvbmZpZ30gZnJvbSAnLi9jb21tb24vbmd4LWVkaXRvci5kZWZhdWx0cyc7XHJcbmltcG9ydCAqIGFzIFV0aWxzIGZyb20gJy4vY29tbW9uL3V0aWxzL25neC1lZGl0b3IudXRpbHMnO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6ICdhcHAtbmd4LWVkaXRvcicsXHJcbiAgdGVtcGxhdGVVcmw6ICcuL25neC1lZGl0b3IuY29tcG9uZW50Lmh0bWwnLFxyXG4gIHN0eWxlVXJsczogWycuL25neC1lZGl0b3IuY29tcG9uZW50LnNjc3MnXSxcclxuICBwcm92aWRlcnM6IFt7XHJcbiAgICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcclxuICAgIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE5neEVkaXRvckNvbXBvbmVudCksXHJcbiAgICBtdWx0aTogdHJ1ZVxyXG4gIH1dXHJcbn0pXHJcblxyXG5leHBvcnQgY2xhc3MgTmd4RWRpdG9yQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBDb250cm9sVmFsdWVBY2Nlc3NvciB7XHJcbiAgQElucHV0KCkgZWRpdGFibGU6IGJvb2xlYW47XHJcbiAgQElucHV0KCkgc3BlbGxjaGVjazogYm9vbGVhbjtcclxuICBASW5wdXQoKSBwbGFjZWhvbGRlcjogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHRyYW5zbGF0ZTogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIGhlaWdodDogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIG1pbkhlaWdodDogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHdpZHRoOiBzdHJpbmc7XHJcbiAgQElucHV0KCkgbWluV2lkdGg6IHN0cmluZztcclxuICBASW5wdXQoKSB0b29sYmFyOiBPYmplY3Q7XHJcbiAgQElucHV0KCkgcmVzaXplciA9ICdzdGFjayc7XHJcbiAgQElucHV0KCkgY29uZmlnID0gbmd4RWRpdG9yQ29uZmlnO1xyXG4gIEBJbnB1dCgpIHNob3dUb29sYmFyOiBib29sZWFuO1xyXG4gIEBJbnB1dCgpIGVuYWJsZVRvb2xiYXI6IGJvb2xlYW47XHJcbiAgQElucHV0KCkgaW1hZ2VFbmRQb2ludDogc3RyaW5nO1xyXG5cclxuICBAT3V0cHV0KCkgYmx1cjogRXZlbnRFbWl0dGVyPHN0cmluZz4gPSBuZXcgRXZlbnRFbWl0dGVyPHN0cmluZz4oKTtcclxuICBAT3V0cHV0KCkgZm9jdXM6IEV2ZW50RW1pdHRlcjxzdHJpbmc+ID0gbmV3IEV2ZW50RW1pdHRlcjxzdHJpbmc+KCk7XHJcblxyXG4gIEBWaWV3Q2hpbGQoJ3RleHRBcmVhJywge3N0YXRpYzogZmFsc2V9KSB0ZXh0QXJlYTogYW55O1xyXG4gIEBWaWV3Q2hpbGQoJ25neFdyYXBwZXInLCB7c3RhdGljOiBmYWxzZX0pIG5neFdyYXBwZXI6IEVsZW1lbnRSZWY7XHJcblxyXG4gIFV0aWxzOiBhbnkgPSBVdGlscztcclxuXHJcbiAgcHJpdmF0ZSBvbkNoYW5nZTogKHZhbHVlOiBzdHJpbmcpID0+IHZvaWQ7XHJcbiAgcHJpdmF0ZSBvblRvdWNoZWQ6ICgpID0+IHZvaWQ7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX21lc3NhZ2VTZXJ2aWNlOiBNZXNzYWdlU2VydmljZSwgcHJpdmF0ZSBfY29tbWFuZEV4ZWN1dG9yOiBDb21tYW5kRXhlY3V0b3JTZXJ2aWNlLCBwcml2YXRlIF9yZW5kZXJlcjogUmVuZGVyZXIyKSB7XHJcbiAgfVxyXG5cclxuICBvblRleHRBcmVhRm9jdXMoKTogdm9pZCB7XHJcbiAgICB0aGlzLmZvY3VzLmVtaXQoJ2ZvY3VzJyk7XHJcbiAgfVxyXG5cclxuICBvbkVkaXRvckZvY3VzKCkge1xyXG4gICAgbGV0IHRleHRBcmVhOiBhbnkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGV4dEFyZWEnKTtcclxuICAgICgodGhpcy50ZXh0QXJlYSB8fCB7fSkubmF0aXZlRWxlbWVudCB8fCB0ZXh0QXJlYSkuZm9jdXMoKTtcclxuICB9XHJcblxyXG4gIG9uQ29udGVudENoYW5nZShpbm5lckhUTUw6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgaWYgKHR5cGVvZiB0aGlzLm9uQ2hhbmdlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHRoaXMub25DaGFuZ2UoaW5uZXJIVE1MKTtcclxuICAgICAgdGhpcy50b2dnbGVQbGFjZWhvbGRlcihpbm5lckhUTUwpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgb25UZXh0QXJlYUJsdXIoKTogdm9pZCB7XHJcbiAgICAvKiogc2F2ZSBzZWxlY3Rpb24gaWYgZm9jdXNzZWQgb3V0ICovXHJcbiAgICB0aGlzLl9jb21tYW5kRXhlY3V0b3Iuc2F2ZWRTZWxlY3Rpb24gPSBVdGlscy5zYXZlU2VsZWN0aW9uKCk7XHJcblxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLm9uVG91Y2hlZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICB0aGlzLm9uVG91Y2hlZCgpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5ibHVyLmVtaXQoJ2JsdXInKTtcclxuICB9XHJcblxyXG4gIHJlc2l6ZVRleHRBcmVhKG9mZnNldFk6IG51bWJlcik6IHZvaWQge1xyXG4gICAgbGV0IG5ld0hlaWdodCA9IHBhcnNlSW50KHRoaXMuaGVpZ2h0LCAxMCk7XHJcbiAgICBuZXdIZWlnaHQgKz0gb2Zmc2V0WTtcclxuICAgIHRoaXMuaGVpZ2h0ID0gbmV3SGVpZ2h0ICsgJ3B4JztcclxuICAgIGxldCB0ZXh0QXJlYTogYW55ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RleHRBcmVhJyk7XHJcbiAgICAoKHRoaXMudGV4dEFyZWEgfHwge30pLm5hdGl2ZUVsZW1lbnQgfHwgdGV4dEFyZWEpLnN0eWxlLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG4gIH1cclxuXHJcbiAgZXhlY3V0ZUNvbW1hbmQoY29tbWFuZE5hbWU6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgdHJ5IHtcclxuICAgICAgdGhpcy5fY29tbWFuZEV4ZWN1dG9yLmV4ZWN1dGUoY29tbWFuZE5hbWUpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgdGhpcy5fbWVzc2FnZVNlcnZpY2Uuc2VuZE1lc3NhZ2UoZXJyb3IubWVzc2FnZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB3cml0ZVZhbHVlKHZhbHVlOiBhbnkpOiB2b2lkIHtcclxuICAgIHRoaXMudG9nZ2xlUGxhY2Vob2xkZXIodmFsdWUpO1xyXG5cclxuICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSAnJyB8fCB2YWx1ZSA9PT0gJzxicj4nKSB7XHJcbiAgICAgIHZhbHVlID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJlZnJlc2hWaWV3KHZhbHVlKTtcclxuICB9XHJcblxyXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46IGFueSk6IHZvaWQge1xyXG4gICAgdGhpcy5vbkNoYW5nZSA9IGZuO1xyXG4gIH1cclxuXHJcbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm46IGFueSk6IHZvaWQge1xyXG4gICAgdGhpcy5vblRvdWNoZWQgPSBmbjtcclxuICB9XHJcblxyXG4gIHJlZnJlc2hWaWV3KHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIGxldCB0ZXh0QXJlYTogYW55ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RleHRBcmVhJyk7XHJcbiAgICBjb25zdCBub3JtYWxpemVkVmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCA/ICcnIDogdmFsdWU7XHJcbiAgICB0aGlzLl9yZW5kZXJlci5zZXRQcm9wZXJ0eSgodGhpcy50ZXh0QXJlYSB8fCB7fSkubmF0aXZlRWxlbWVudCB8fCB0ZXh0QXJlYSwgJ2lubmVySFRNTCcsIG5vcm1hbGl6ZWRWYWx1ZSk7XHJcbiAgfVxyXG5cclxuICB0b2dnbGVQbGFjZWhvbGRlcih2YWx1ZTogYW55KTogdm9pZCB7XHJcbiAgICBjb25zb2xlLmxvZyh0aGlzLm5neFdyYXBwZXIpO1xyXG4gICAgbGV0IG5neFdyYXBwZXI6IGFueSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZ3hXcmFwcGVyJyk7XHJcbiAgICBpZiAoIXZhbHVlIHx8IHZhbHVlID09PSAnPGJyPicgfHwgdmFsdWUgPT09ICcnKSB7XHJcbiAgICAgIHRoaXMuX3JlbmRlcmVyLmFkZENsYXNzKCh0aGlzLm5neFdyYXBwZXIgfHwge30pLm5hdGl2ZUVsZW1lbnQgfHwgbmd4V3JhcHBlciwgJ3Nob3ctcGxhY2Vob2xkZXInKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuX3JlbmRlcmVyLnJlbW92ZUNsYXNzKCh0aGlzLm5neFdyYXBwZXIgfHwge30pLm5hdGl2ZUVsZW1lbnQgfHwgbmd4V3JhcHBlciwgJ3Nob3ctcGxhY2Vob2xkZXInKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGdldENvbGxlY3RpdmVQYXJhbXMoKTogYW55IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGVkaXRhYmxlOiB0aGlzLmVkaXRhYmxlLFxyXG4gICAgICBzcGVsbGNoZWNrOiB0aGlzLnNwZWxsY2hlY2ssXHJcbiAgICAgIHBsYWNlaG9sZGVyOiB0aGlzLnBsYWNlaG9sZGVyLFxyXG4gICAgICB0cmFuc2xhdGU6IHRoaXMudHJhbnNsYXRlLFxyXG4gICAgICBoZWlnaHQ6IHRoaXMuaGVpZ2h0LFxyXG4gICAgICBtaW5IZWlnaHQ6IHRoaXMubWluSGVpZ2h0LFxyXG4gICAgICB3aWR0aDogdGhpcy53aWR0aCxcclxuICAgICAgbWluV2lkdGg6IHRoaXMubWluV2lkdGgsXHJcbiAgICAgIGVuYWJsZVRvb2xiYXI6IHRoaXMuZW5hYmxlVG9vbGJhcixcclxuICAgICAgc2hvd1Rvb2xiYXI6IHRoaXMuc2hvd1Rvb2xiYXIsXHJcbiAgICAgIGltYWdlRW5kUG9pbnQ6IHRoaXMuaW1hZ2VFbmRQb2ludCxcclxuICAgICAgdG9vbGJhcjogdGhpcy50b29sYmFyXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgbmdPbkluaXQoKSB7XHJcbiAgICB0aGlzLmNvbmZpZyA9IHRoaXMuVXRpbHMuZ2V0RWRpdG9yQ29uZmlndXJhdGlvbih0aGlzLmNvbmZpZywgbmd4RWRpdG9yQ29uZmlnLCB0aGlzLmdldENvbGxlY3RpdmVQYXJhbXMoKSk7XHJcbiAgICBsZXQgdGV4dEFyZWE6IGFueSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXh0QXJlYScpO1xyXG4gICAgdGhpcy5oZWlnaHQgPSB0aGlzLmhlaWdodCB8fCAoKHRoaXMudGV4dEFyZWEgfHwge30pLm5hdGl2ZUVsZW1lbnQgfHwgdGV4dEFyZWEpLm9mZnNldEhlaWdodDtcclxuXHJcbiAgICB0aGlzLmV4ZWN1dGVDb21tYW5kKCdlbmFibGVPYmplY3RSZXNpemluZycpO1xyXG4gIH1cclxufVxyXG4iXX0=