// Based on: https://www.typescriptlang.org/dev/sandbox/
// See also: https://github.com/microsoft/TypeScript-Website/issues/1283

const params = new URLSearchParams(window.location.search);
const code = params.get("code") || "";
const module = params.get("module") || "commonjs";

const state = {
  editor: undefined,
  tsProxy: undefined,
  initialCode: "",
};

console.log("module", module);

// This version uses the latest version of the sandbox, which is used on the TypeScript website.
// For the monaco version you can use unpkg or the TypeScript web infra CDN.
// You can see the available releases for TypeScript here:
// https://playgroundcdn.typescriptlang.org/indexes/releases.json
require.config({
  paths: {
    vs: "https://playgroundcdn.typescriptlang.org/cdn/5.9.3/monaco/min/vs",
    sandbox: "https://www.typescriptlang.org/js/sandbox",
  },
  ignoreDuplicateModules: ["vs/editor/editor.main"],
});

require([
  "vs/editor/editor.main",
  "vs/language/typescript/tsWorker",
  "sandbox/index",
], (main, _tsWorker, sandboxFactory) => {
  const { ModuleKind, ScriptTarget } = main.languages.typescript;
  const sandboxConfig = {
    text: code,
    filetype: "ts",
    compilerOptions: {
      module: module === "commonjs" ? ModuleKind.CommonJS : ModuleKind.ESNext,
      target: ScriptTarget.ES2020,
      skipLibCheck: true,
      skipDefaultLibCheck: true,
    },
    domID: "container",
  };

  const sandbox = sandboxFactory.createTypeScriptSandbox(
    sandboxConfig,
    main,
    window.ts
  );
  state.editor = sandbox.editor;
  state.editor.getModel().updateOptions({ tabSize: 2 });
  state.editor.focus();

  // Get transpiled output
  // See: https://stackoverflow.com/a/55132486
  monaco.languages.typescript.getTypeScriptWorker().then((worker) => {
    worker(state.editor.getModel().uri).then((proxy) => {
      state.tsProxy = proxy;
      if (state.initialCode) {
        state.editor.getModel().setValue(state.initialCode);
      }
    });
  });
});

window.addEventListener("message", (e) => {
  if (e.data?.command === "setValue") {
    if (state.editor && state.tsProxy) {
      state.editor.getModel().setValue(e.data.value ?? "");
    } else {
      state.initialCode = e.data.value ?? "";
    }
    e.ports[0].postMessage({ result: true });
  }

  if (e.data?.command === "getValue") {
    let result = state.initialCode;
    if (state.editor && state.tsProxy) {
      result = state.editor.getValue();
    }
    e.ports[0].postMessage({ result });
  }

  if (e.data?.command === "getOutput") {
    if (state.editor && state.tsProxy) {
      state.tsProxy
        .getEmitOutput(state.editor.getModel().uri.toString())
        .then((r) => {
          if (r.outputFiles && r.outputFiles.length > 0) {
            e.ports[0].postMessage({ result: r.outputFiles[0].text });
          } else {
            e.ports[0].postMessage({ result: "" });
          }
        })
        .catch((err) => {
          console.error("Error getting emit output:", err);
          e.ports[0].postMessage({
            error: err.message || "Failed to get transpiled output",
          });
        });
    } else {
      e.ports[0].postMessage({ result: "" });
    }
  }
});
