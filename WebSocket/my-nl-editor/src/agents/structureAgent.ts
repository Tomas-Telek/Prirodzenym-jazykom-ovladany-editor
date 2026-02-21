import { getLCModel, callLC } from "./langchainClient";

export async function runStructureAgent(opts: {
  apiKey: string;
  command: string;
  total: number;
  current: number;
}) {
  const { apiKey, command, total, current } = opts;

  const model = getLCModel(apiKey);

  const system = `You are a document structure editing agent. Your task is to determine whether a paragraph should be added or deleted.

  POSSIBLE ACTIONS:

    "add_after": Adds a new empty paragraph AFTER the current one.

    "add_before": Adds a new empty paragraph BEFORE the current one.

    "delete": Deletes the current paragraph.

  ALWAYS RESPOND IN THE FORMAT: action | index.
  Indexes are from 0 to ${total - 1}. 
  The current index is ${current}.`;

  const messages = [
    { role: "system", content: system },
    {
      role: "user",
      content: `Command: "${command}"
      Current index: ${current}
      Total paragraphs: ${total}
      Respond in the format "action | index".`
    }
  ];

  const output = await callLC(model, messages);
  return output.trim().toLowerCase();
}