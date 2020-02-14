var NgxEditorComponent_1;
import { __decorate } from "tslib";
import { Component, OnInit, Input, Output, ViewChild, ElementRef, EventEmitter, Renderer2, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommandExecutorService } from './common/services/command-executor.service';
import { MessageService } from './common/services/message.service';
import { ngxEditorConfig } from './common/ngx-editor.defaults';
import * as Utils from './common/utils/ngx-editor.utils';
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
        this._commandExecutor.savedSelection = Utils.saveSelection();
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
export { NgxEditorComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWVkaXRvci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9teS1saWIvIiwic291cmNlcyI6WyJsaWIvbmd4LWVkaXRvci9uZ3gtZWRpdG9yLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFDdkQsWUFBWSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQ3BDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxpQkFBaUIsRUFBdUIsTUFBTSxnQkFBZ0IsQ0FBQztBQUV2RSxPQUFPLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSw0Q0FBNEMsQ0FBQztBQUNsRixPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUNBQW1DLENBQUM7QUFFakUsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQzdELE9BQU8sS0FBSyxLQUFLLE1BQU0saUNBQWlDLENBQUM7QUFhekQsSUFBYSxrQkFBa0IsMEJBQS9CLE1BQWEsa0JBQWtCO0lBMkI3QixZQUFvQixlQUErQixFQUFVLGdCQUF3QyxFQUFVLFNBQW9CO1FBQS9HLG9CQUFlLEdBQWYsZUFBZSxDQUFnQjtRQUFVLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBd0I7UUFBVSxjQUFTLEdBQVQsU0FBUyxDQUFXO1FBakIxSCxZQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ2xCLFdBQU0sR0FBRyxlQUFlLENBQUM7UUFLeEIsU0FBSSxHQUF5QixJQUFJLFlBQVksRUFBVSxDQUFDO1FBQ3hELFVBQUssR0FBeUIsSUFBSSxZQUFZLEVBQVUsQ0FBQztRQUtuRSxVQUFLLEdBQVEsS0FBSyxDQUFDO0lBTW5CLENBQUM7SUFFRCxlQUFlO1FBQ2IsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUVELGFBQWE7UUFD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QnRELGtCQUFrQjtJQVg5QixTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsZ0JBQWdCO1FBQzFCLHNsQ0FBMEM7UUFFMUMsU0FBUyxFQUFFLENBQUM7Z0JBQ1YsT0FBTyxFQUFFLGlCQUFpQjtnQkFDMUIsV0FBVyxFQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxvQkFBa0IsQ0FBQztnQkFDakQsS0FBSyxFQUFFLElBQUk7YUFDWixDQUFDOztLQUNILENBQUM7R0FFVyxrQkFBa0IsQ0FrSTlCO1NBbElZLGtCQUFrQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XHJcbiAgQ29tcG9uZW50LCBPbkluaXQsIElucHV0LCBPdXRwdXQsIFZpZXdDaGlsZCwgRWxlbWVudFJlZixcclxuICBFdmVudEVtaXR0ZXIsIFJlbmRlcmVyMiwgZm9yd2FyZFJlZlxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge05HX1ZBTFVFX0FDQ0VTU09SLCBDb250cm9sVmFsdWVBY2Nlc3Nvcn0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xyXG5cclxuaW1wb3J0IHtDb21tYW5kRXhlY3V0b3JTZXJ2aWNlfSBmcm9tICcuL2NvbW1vbi9zZXJ2aWNlcy9jb21tYW5kLWV4ZWN1dG9yLnNlcnZpY2UnO1xyXG5pbXBvcnQge01lc3NhZ2VTZXJ2aWNlfSBmcm9tICcuL2NvbW1vbi9zZXJ2aWNlcy9tZXNzYWdlLnNlcnZpY2UnO1xyXG5cclxuaW1wb3J0IHtuZ3hFZGl0b3JDb25maWd9IGZyb20gJy4vY29tbW9uL25neC1lZGl0b3IuZGVmYXVsdHMnO1xyXG5pbXBvcnQgKiBhcyBVdGlscyBmcm9tICcuL2NvbW1vbi91dGlscy9uZ3gtZWRpdG9yLnV0aWxzJztcclxuXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiAnYXBwLW5neC1lZGl0b3InLFxyXG4gIHRlbXBsYXRlVXJsOiAnLi9uZ3gtZWRpdG9yLmNvbXBvbmVudC5odG1sJyxcclxuICBzdHlsZVVybHM6IFsnLi9uZ3gtZWRpdG9yLmNvbXBvbmVudC5zY3NzJ10sXHJcbiAgcHJvdmlkZXJzOiBbe1xyXG4gICAgcHJvdmlkZTogTkdfVkFMVUVfQUNDRVNTT1IsXHJcbiAgICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBOZ3hFZGl0b3JDb21wb25lbnQpLFxyXG4gICAgbXVsdGk6IHRydWVcclxuICB9XVxyXG59KVxyXG5cclxuZXhwb3J0IGNsYXNzIE5neEVkaXRvckNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgQ29udHJvbFZhbHVlQWNjZXNzb3Ige1xyXG4gIEBJbnB1dCgpIGVkaXRhYmxlOiBib29sZWFuO1xyXG4gIEBJbnB1dCgpIHNwZWxsY2hlY2s6IGJvb2xlYW47XHJcbiAgQElucHV0KCkgcGxhY2Vob2xkZXI6IHN0cmluZztcclxuICBASW5wdXQoKSB0cmFuc2xhdGU6IHN0cmluZztcclxuICBASW5wdXQoKSBoZWlnaHQ6IHN0cmluZztcclxuICBASW5wdXQoKSBtaW5IZWlnaHQ6IHN0cmluZztcclxuICBASW5wdXQoKSB3aWR0aDogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIG1pbldpZHRoOiBzdHJpbmc7XHJcbiAgQElucHV0KCkgdG9vbGJhcjogT2JqZWN0O1xyXG4gIEBJbnB1dCgpIHJlc2l6ZXIgPSAnc3RhY2snO1xyXG4gIEBJbnB1dCgpIGNvbmZpZyA9IG5neEVkaXRvckNvbmZpZztcclxuICBASW5wdXQoKSBzaG93VG9vbGJhcjogYm9vbGVhbjtcclxuICBASW5wdXQoKSBlbmFibGVUb29sYmFyOiBib29sZWFuO1xyXG4gIEBJbnB1dCgpIGltYWdlRW5kUG9pbnQ6IHN0cmluZztcclxuXHJcbiAgQE91dHB1dCgpIGJsdXI6IEV2ZW50RW1pdHRlcjxzdHJpbmc+ID0gbmV3IEV2ZW50RW1pdHRlcjxzdHJpbmc+KCk7XHJcbiAgQE91dHB1dCgpIGZvY3VzOiBFdmVudEVtaXR0ZXI8c3RyaW5nPiA9IG5ldyBFdmVudEVtaXR0ZXI8c3RyaW5nPigpO1xyXG5cclxuICBAVmlld0NoaWxkKCd0ZXh0QXJlYScsIHtzdGF0aWM6IGZhbHNlfSkgdGV4dEFyZWE6IGFueTtcclxuICBAVmlld0NoaWxkKCduZ3hXcmFwcGVyJywge3N0YXRpYzogZmFsc2V9KSBuZ3hXcmFwcGVyOiBFbGVtZW50UmVmO1xyXG5cclxuICBVdGlsczogYW55ID0gVXRpbHM7XHJcblxyXG4gIHByaXZhdGUgb25DaGFuZ2U6ICh2YWx1ZTogc3RyaW5nKSA9PiB2b2lkO1xyXG4gIHByaXZhdGUgb25Ub3VjaGVkOiAoKSA9PiB2b2lkO1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9tZXNzYWdlU2VydmljZTogTWVzc2FnZVNlcnZpY2UsIHByaXZhdGUgX2NvbW1hbmRFeGVjdXRvcjogQ29tbWFuZEV4ZWN1dG9yU2VydmljZSwgcHJpdmF0ZSBfcmVuZGVyZXI6IFJlbmRlcmVyMikge1xyXG4gIH1cclxuXHJcbiAgb25UZXh0QXJlYUZvY3VzKCk6IHZvaWQge1xyXG4gICAgdGhpcy5mb2N1cy5lbWl0KCdmb2N1cycpO1xyXG4gIH1cclxuXHJcbiAgb25FZGl0b3JGb2N1cygpIHtcclxuICAgIGxldCB0ZXh0QXJlYTogYW55ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RleHRBcmVhJyk7XHJcbiAgICAoKHRoaXMudGV4dEFyZWEgfHwge30pLm5hdGl2ZUVsZW1lbnQgfHwgdGV4dEFyZWEpLmZvY3VzKCk7XHJcbiAgfVxyXG5cclxuICBvbkNvbnRlbnRDaGFuZ2UoaW5uZXJIVE1MOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIGlmICh0eXBlb2YgdGhpcy5vbkNoYW5nZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICB0aGlzLm9uQ2hhbmdlKGlubmVySFRNTCk7XHJcbiAgICAgIHRoaXMudG9nZ2xlUGxhY2Vob2xkZXIoaW5uZXJIVE1MKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIG9uVGV4dEFyZWFCbHVyKCk6IHZvaWQge1xyXG4gICAgLyoqIHNhdmUgc2VsZWN0aW9uIGlmIGZvY3Vzc2VkIG91dCAqL1xyXG4gICAgdGhpcy5fY29tbWFuZEV4ZWN1dG9yLnNhdmVkU2VsZWN0aW9uID0gVXRpbHMuc2F2ZVNlbGVjdGlvbigpO1xyXG5cclxuICAgIGlmICh0eXBlb2YgdGhpcy5vblRvdWNoZWQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgdGhpcy5vblRvdWNoZWQoKTtcclxuICAgIH1cclxuICAgIHRoaXMuYmx1ci5lbWl0KCdibHVyJyk7XHJcbiAgfVxyXG5cclxuICByZXNpemVUZXh0QXJlYShvZmZzZXRZOiBudW1iZXIpOiB2b2lkIHtcclxuICAgIGxldCBuZXdIZWlnaHQgPSBwYXJzZUludCh0aGlzLmhlaWdodCwgMTApO1xyXG4gICAgbmV3SGVpZ2h0ICs9IG9mZnNldFk7XHJcbiAgICB0aGlzLmhlaWdodCA9IG5ld0hlaWdodCArICdweCc7XHJcbiAgICBsZXQgdGV4dEFyZWE6IGFueSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXh0QXJlYScpO1xyXG4gICAgKCh0aGlzLnRleHRBcmVhIHx8IHt9KS5uYXRpdmVFbGVtZW50IHx8IHRleHRBcmVhKS5zdHlsZS5oZWlnaHQgPSB0aGlzLmhlaWdodDtcclxuICB9XHJcblxyXG4gIGV4ZWN1dGVDb21tYW5kKGNvbW1hbmROYW1lOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIHRoaXMuX2NvbW1hbmRFeGVjdXRvci5leGVjdXRlKGNvbW1hbmROYW1lKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHRoaXMuX21lc3NhZ2VTZXJ2aWNlLnNlbmRNZXNzYWdlKGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgd3JpdGVWYWx1ZSh2YWx1ZTogYW55KTogdm9pZCB7XHJcbiAgICB0aGlzLnRvZ2dsZVBsYWNlaG9sZGVyKHZhbHVlKTtcclxuXHJcbiAgICBpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gJycgfHwgdmFsdWUgPT09ICc8YnI+Jykge1xyXG4gICAgICB2YWx1ZSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5yZWZyZXNoVmlldyh2YWx1ZSk7XHJcbiAgfVxyXG5cclxuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiBhbnkpOiB2b2lkIHtcclxuICAgIHRoaXMub25DaGFuZ2UgPSBmbjtcclxuICB9XHJcblxyXG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiBhbnkpOiB2b2lkIHtcclxuICAgIHRoaXMub25Ub3VjaGVkID0gZm47XHJcbiAgfVxyXG5cclxuICByZWZyZXNoVmlldyh2YWx1ZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBsZXQgdGV4dEFyZWE6IGFueSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXh0QXJlYScpO1xyXG4gICAgY29uc3Qgbm9ybWFsaXplZFZhbHVlID0gdmFsdWUgPT09IG51bGwgPyAnJyA6IHZhbHVlO1xyXG4gICAgdGhpcy5fcmVuZGVyZXIuc2V0UHJvcGVydHkoKHRoaXMudGV4dEFyZWEgfHwge30pLm5hdGl2ZUVsZW1lbnQgfHwgdGV4dEFyZWEsICdpbm5lckhUTUwnLCBub3JtYWxpemVkVmFsdWUpO1xyXG4gIH1cclxuXHJcbiAgdG9nZ2xlUGxhY2Vob2xkZXIodmFsdWU6IGFueSk6IHZvaWQge1xyXG4gICAgY29uc29sZS5sb2codGhpcy5uZ3hXcmFwcGVyKTtcclxuICAgIGxldCBuZ3hXcmFwcGVyOiBhbnkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmd4V3JhcHBlcicpO1xyXG4gICAgaWYgKCF2YWx1ZSB8fCB2YWx1ZSA9PT0gJzxicj4nIHx8IHZhbHVlID09PSAnJykge1xyXG4gICAgICB0aGlzLl9yZW5kZXJlci5hZGRDbGFzcygodGhpcy5uZ3hXcmFwcGVyIHx8IHt9KS5uYXRpdmVFbGVtZW50IHx8IG5neFdyYXBwZXIsICdzaG93LXBsYWNlaG9sZGVyJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLl9yZW5kZXJlci5yZW1vdmVDbGFzcygodGhpcy5uZ3hXcmFwcGVyIHx8IHt9KS5uYXRpdmVFbGVtZW50IHx8IG5neFdyYXBwZXIsICdzaG93LXBsYWNlaG9sZGVyJyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBnZXRDb2xsZWN0aXZlUGFyYW1zKCk6IGFueSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBlZGl0YWJsZTogdGhpcy5lZGl0YWJsZSxcclxuICAgICAgc3BlbGxjaGVjazogdGhpcy5zcGVsbGNoZWNrLFxyXG4gICAgICBwbGFjZWhvbGRlcjogdGhpcy5wbGFjZWhvbGRlcixcclxuICAgICAgdHJhbnNsYXRlOiB0aGlzLnRyYW5zbGF0ZSxcclxuICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCxcclxuICAgICAgbWluSGVpZ2h0OiB0aGlzLm1pbkhlaWdodCxcclxuICAgICAgd2lkdGg6IHRoaXMud2lkdGgsXHJcbiAgICAgIG1pbldpZHRoOiB0aGlzLm1pbldpZHRoLFxyXG4gICAgICBlbmFibGVUb29sYmFyOiB0aGlzLmVuYWJsZVRvb2xiYXIsXHJcbiAgICAgIHNob3dUb29sYmFyOiB0aGlzLnNob3dUb29sYmFyLFxyXG4gICAgICBpbWFnZUVuZFBvaW50OiB0aGlzLmltYWdlRW5kUG9pbnQsXHJcbiAgICAgIHRvb2xiYXI6IHRoaXMudG9vbGJhclxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIG5nT25Jbml0KCkge1xyXG4gICAgdGhpcy5jb25maWcgPSB0aGlzLlV0aWxzLmdldEVkaXRvckNvbmZpZ3VyYXRpb24odGhpcy5jb25maWcsIG5neEVkaXRvckNvbmZpZywgdGhpcy5nZXRDb2xsZWN0aXZlUGFyYW1zKCkpO1xyXG4gICAgbGV0IHRleHRBcmVhOiBhbnkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGV4dEFyZWEnKTtcclxuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5oZWlnaHQgfHwgKCh0aGlzLnRleHRBcmVhIHx8IHt9KS5uYXRpdmVFbGVtZW50IHx8IHRleHRBcmVhKS5vZmZzZXRIZWlnaHQ7XHJcblxyXG4gICAgdGhpcy5leGVjdXRlQ29tbWFuZCgnZW5hYmxlT2JqZWN0UmVzaXppbmcnKTtcclxuICB9XHJcbn1cclxuIl19