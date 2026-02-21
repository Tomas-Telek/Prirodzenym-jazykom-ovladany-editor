import { getLCModel, callLC } from "./langchainClient";

export async function runNavigateAgent(opts: {
  apiKey: string;
  command: string;
  total: number;
  current: number;
}) {
  const { apiKey, command, total, current } = opts;

  const model = getLCModel(apiKey);

  const system = `You are a navigation agent. Respond with a SINGLE number 1..${total}.`;

  const messages = [
    { role: "system", content: system },
    {
      role: "user",
      content: `Command: "${command}"
      Current paragraph: ${current + 1}
      Total paragraphs: ${total}
      Respond with a single number only.`
    }
  ];

  const output = await callLC(model, messages);
  return output.trim();
}
