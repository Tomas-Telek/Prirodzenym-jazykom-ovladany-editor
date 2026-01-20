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
      Odpovedz iba číslom.`
    }
  ];

  const output = await callLC(model, messages);
  return output.trim();
}
