const codeFrame = document.getElementById("typescript-iframe");
const inputFrame = document.getElementById("json-iframe");
const outputFrame = document.getElementById("bot-runner-iframe");

document.getElementById("go-button").addEventListener("click", async () => {
  const code = await sendCommand(codeFrame, { command: "getOutput" });
  const input = await sendCommand(inputFrame, { command: "getValue" });
  const result = await sendCommand(outputFrame, {
    command: "execute",
    code,
    input: JSON.parse(input),
  });
  console.log(result);
});

function sendCommand(frame, command) {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();

    channel.port1.onmessage = ({ data }) => {
      channel.port1.close();
      if (data.error) {
        reject(data.error);
      } else {
        resolve(data.result);
      }
    };

    frame.contentWindow?.postMessage(command, "*", [channel.port2]);
  });
}
