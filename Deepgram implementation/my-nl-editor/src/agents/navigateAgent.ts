import { getLCModel, callLC } from "./langchainClient";

export async function runNavigateAgent(opts: {
  apiKey: string;
  command: string;
  total: number;
  current: number;
}) {
  const { apiKey, command, total, current } = opts;

  const model = getLCModel(apiKey);

  const system = `Si navigačný agent. Odpovedáš JEDNÝM číslom 1..${total}.`;

  const messages = [
    { role: "system", content: system },
    {
      role: "user",
      content: `Príkaz: "${command}"
      Aktuálny odsek: ${current + 1}
      Počet odsekov: ${total}
      Odpovedz iba jedným číslom.`
    }
  ];

  const output = await callLC(model, messages);
  
  const targetIndex = parseInt(output.replace(/[^0-9]/g, ''), 10);
  

  console.log("Navigate:", targetIndex);
  return isNaN(targetIndex) ? current.toString() : targetIndex.toString();
}
