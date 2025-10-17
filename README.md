# Medplum Code Editor

Embeddable TypeScript and JSON editors.

Example: https://codeeditor.medplum.com/example.html

Lightweight wrapper around Monaco Editor: https://microsoft.github.io/monaco-editor/

Based on: https://www.typescriptlang.org/dev/sandbox/

IFrame message communication based on: https://advancedweb.hu/how-to-use-async-await-with-postmessage/

## TypeScript Versions

For Monaco editor, we use the TypeScript web infra CDN.

See available TypeScript releases here: https://playgroundcdn.typescriptlang.org/indexes/releases.json

Update the `vs` URL in `typescript-editor.js`:

```js
require.config({
  paths: {
    vs: "https://playgroundcdn.typescriptlang.org/cdn/5.9.3/monaco/min/vs",
    sandbox: "https://www.typescriptlang.org/js/sandbox",
  },
  ignoreDuplicateModules: ["vs/editor/editor.main"],
});
```
