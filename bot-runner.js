window.addEventListener("message", async (e) => {
  if (e.data?.command === "execute") {
    const { baseUrl, accessToken, code, input } = e.data;
    try {
      const encodedJs = encodeURIComponent(code);
      const dataUri = "data:text/javascript;charset=utf-8," + encodedJs;
      const module = await import(dataUri);
      const handler = module.handler;
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
      document.getElementById("container").innerHTML = JSON.stringify(
        result,
        null,
        2
      );
    } catch (err) {
      console.log(err);
    }
  }
});
