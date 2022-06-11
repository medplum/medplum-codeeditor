// Based on: https://www.typescriptlang.org/dev/sandbox/
// See also: https://github.com/microsoft/TypeScript-Website/issues/1283

const params = new URLSearchParams(window.location.search);
const code = params.get("code") || "";

let module = params.get("module") || "esnext";
if (module === "commonjs") {
  module = "umd";
}

const target = module === "esnext" ? "esnext" : "es6";

let editor = undefined;
let tsProxy = undefined;

console.log("module", module);
console.log("target", target);

// This version uses the latest version of the sandbox, which is used on the TypeScript website.
// For the monaco version you can use unpkg or the TypeSCript web infra CDN.
// You can see the available releases for TypeScript here:
// https://typescript.azureedge.net/indexes/releases.json
require.config({
  paths: {
    vs: "https://typescript.azureedge.net/cdn/4.7.2/monaco/min/vs",
    sandbox: "https://www.typescriptlang.org/js/sandbox",
  },
  ignoreDuplicateModules: ["vs/editor/editor.main"],
});

require([
  "vs/editor/editor.main",
  "vs/language/typescript/tsWorker",
  "sandbox/index",
], (main, _tsWorker, sandboxFactory) => {
  const sandboxConfig = {
    text: code,
    compilerOptions: {
      allowJs: true,
      module,
      target,
    },
    domID: "container",
  };

  const sandbox = sandboxFactory.createTypeScriptSandbox(
    sandboxConfig,
    main,
    window.ts
  );
  editor = sandbox.editor;
  editor.getModel().updateOptions({ tabSize: 2 });
  editor.focus();

  // Get transpiled output
  // See: https://stackoverflow.com/a/55132486
  monaco.languages.typescript.getTypeScriptWorker().then((worker) => {
    worker(editor.getModel().uri).then((proxy) => (tsProxy = proxy));
  });
});

window.addEventListener("message", (e) => {
  if (e.data?.command === "setValue" && editor) {
    editor.getModel().setValue(e.data.value);
  }

  if (e.data?.command === "getValue" && editor) {
    e.ports[0].postMessage({ result: editor.getValue() });
  }

  if (e.data?.command === "getOutput" && editor && tsProxy) {
    tsProxy.getEmitOutput(editor.getModel().uri.toString()).then((r) => {
      e.ports[0].postMessage({ result: r.outputFiles[0].text });
    });
  }
});
