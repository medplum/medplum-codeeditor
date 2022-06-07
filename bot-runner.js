window.addEventListener("message", async (e) => {
  if (e.data?.command === "setValue") {
    setOutput(e.data.value);
  }

  if (e.data?.command === "execute") {
    const { baseUrl, accessToken, code, input } = e.data;
    try {
      if (code.includes("exports.handler")) {
        const exports = {};
        eval(code);
        executeHandler(e, baseUrl, accessToken, input, exports.handler);
      } else {
        const encodedJs = encodeURIComponent(code);
        const dataUri = "data:text/javascript;charset=utf-8," + encodedJs;
        const module = await import(dataUri);
        executeHandler(e, baseUrl, accessToken, input, module.handler);
      }
    } catch (err) {
      handleError(err);
    }
  }
});

async function executeHandler(e, baseUrl, accessToken, input, handler) {
  try {
    const client = new medplum.core.MedplumClient({ baseUrl });
    if (accessToken) {
      client.setAccessToken(accessToken);
    }
    const botEvent = {
      contentType: "application/fhir+json",
      input,
    };
    const result = await handler(client, botEvent);
    e.ports[0].postMessage({ result });
    setOutput(result);
  } catch (err) {
    handleError(err);
  }
}

function handleError(err) {
  console.log(err);
  if (typeof err === "string") {
    setOutput("Unhandled error: " + err);
  } else if (err instanceof Error) {
    setOutput("Unhandled error: " + err.message + "\n" + err.stack);
  } else {
    setOutput(err);
  }
}

function setOutput(output) {
  if (typeof output !== "string") {
    output = JSON.stringify(output, null, 2);
  }
  document.getElementById("container").innerHTML = output;
}
