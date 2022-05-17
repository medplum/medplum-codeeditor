const params = new URLSearchParams(window.location.search);
const code = params.get("code") || "";
let editor = undefined;

require.config({
  paths: {
    vs: "https://typescript.azureedge.net/cdn/4.6.4/monaco/min/vs",
  },
  ignoreDuplicateModules: ["vs/editor/editor.main"],
});

require(["vs/editor/editor.main"], () => {
  editor = monaco.editor.create(document.getElementById("container"), {
    value: code,
    language: "json",
    minimap: {
      enabled: false,
    },
    lineNumbers: "off",
    glyphMargin: false,
    folding: false,
  });
});

window.addEventListener("message", (e) => {
  if (editor && e.data?.command === "getValue") {
    e.ports[0].postMessage({ result: editor.getValue() });
  }
});
