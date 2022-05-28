const EXAMPLE_TYPESCRIPT = `import { BotEvent, MedplumClient } from '@medplum/core';
import { Patient } from '@medplum/fhirtypes';

export async function handler(client: MedplumClient, event: BotEvent): Promise<any> {
  console.log('client: ' + !!client);
  console.log('event: ' + !!event);

  const patient = event.input as Patient;
  console.log(JSON.stringify(event, null, 2));
  return patient.birthDate;
}
`;

const EXAMPLE_JSON = `{
  "resourceType": "Patient",
  "birthDate": "1990-01-01"
}
`;

const codeFrame = document.getElementById("typescript-iframe");
const inputFrame = document.getElementById("json-iframe");
const outputFrame = document.getElementById("bot-runner-iframe");

codeFrame.addEventListener("load", () => {
  sendCommand(codeFrame, { command: "setValue", value: EXAMPLE_TYPESCRIPT });
});

inputFrame.addEventListener("load", () => {
  sendCommand(inputFrame, { command: "setValue", value: EXAMPLE_JSON });
});

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
