import { getLCModel, callLC } from "./langchainClient";
import { JsonOutputParser } from "@langchain/core/output_parsers";

export async function runStructureAgent(opts: {
  apiKey: string;
  command: string;
  total: number;
  current: number;
}) {
  const { apiKey, command, total, current } = opts;

  const model = getLCModel(apiKey);
  const parser = new JsonOutputParser();
  const chain = model.pipe(parser);


  const system = `You are a Document Structure Agent.
  Your task is to determine if a paragraph should be added or deleted.

  ACTIONS:
  - "add_after": Add a new empty paragraph AFTER the current one.
  - "add_before": Add a new empty paragraph BEFORE the current one.
  - "delete": Remove the current paragraph.

  RULES:
  - Current paragraph index: ${current}
  - Total paragraphs: ${total}

  OUTPUT FORMAT (Return ONLY JSON):
  {
    "action": "add_after" | "add_before" | "delete",
    "index": number
  }`;

  const messages = [
      { role: "system", content: system },
      {
        role: "user",
        content: `Command: "${command}"\nCurrent Index: ${current}\nTotal: ${total}`
      }
    ];

  const decision = await chain.invoke(messages);

  console.log("TS: Decided object:", decision);

  return decision;
}