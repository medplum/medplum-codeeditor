window.addEventListener("message", (e) => {
  if (e.data?.command === "setValue") {
    setOutput(e.data.value);
    e.ports[0].postMessage({ result: true });
  }
});

function setOutput(output) {
  if (typeof output !== "string") {
    output = JSON.stringify(output, null, 2);
  }
  document.getElementById("container").textContent = output;
}
