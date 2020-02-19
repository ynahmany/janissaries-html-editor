# Janissaries Html Editor

<p align="center">A Simple HTML Editor for Angular 9 Applications.</p>
<p align="center">
  <a href="https://www.npmjs.com/package/janissaries-html-editor">
    <img alt="npm version" src="https://img.shields.io/npm/v/janissaries-html-editor.svg">
  </a>
  <a href="https://www.npmjs.com/package/janissaries-html-editor">
    <img alt="npm" src="https://img.shields.io/npm/dm/janissaries-html-editor.svg">
  </a>
</p>

## Getting Started

### Installation

Install via Package managers such as [npm][npm]

```bash
npm install janissaries-html-editor --save
```

### Usage

Import `janissaries-html-editor` module

```typescript
import { JanissariesHtmlEditorModule } from 'janissaries-html-editor';

@NgModule({
  imports: [ JanissariesHtmlEditorModule ]
})
```

Import [font-awesome](https://github.com/FortAwesome/Font-Awesome) into your application

Then in HTML

```html
<janissaries-html-editor [placeholder]="'Enter text here...'" [spellcheck]="true" [(ngModel)]="htmlContent"></janissaries-html-editor>
```

For `ngModel` to work, You must import `FormsModule` from `@angular/forms`

#### PeerDependencies

`janissaries-html-editor` depeneds on the following libraries to work.

* [Font-Awesome v4.7.0](https://github.com/FortAwesome/Font-Awesome/tree/fa-4)
* [Ngx-Bootstrap](https://github.com/valor-software/ngx-bootstrap)

## Compatibility

All Evergreen-Browsers are supported

* Google Chrome
* Microsoft Edge
* Mozilla Firefox
* Opera

[npm]: https://www.npmjs.com/
[yarn]: https://yarnpkg.com/lang/en/
[github]: https://github.com/janissaries-io/janissaries-html-editor
[wiki]:https://github.com/janissaries-io/janissaries-html-editor/wiki/ngxEditor
