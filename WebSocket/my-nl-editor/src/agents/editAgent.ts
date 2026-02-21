import { getLCModel, callLC } from "./langchainClient";

export async function runEditAgent(opts: {
  apiKey: string;
  paragraph: string;
  command: string;
}) {
  const { apiKey, paragraph, command } = opts;

  const system = `You are a professional text editor. Your task is to modify ONLY the provided paragraph based on the user's instruction. 
  Follow these rules strictly:
  1. Identify the specific sentence or words to be changed by checking their exact start and end.
  2. Execute the change (add, delete, or replace) while keeping the rest of the text untouched.
  3. Ensure the paragraph remains grammatically correct and logically coherent.
  4. Every sentence must start with a capital letter and end with a period.
  5. Output ONLY the resulting clean paragraph. No explanations, no quotes, no conversational fillers.`;

  const messages = [
    { role: "system", content: system },
    {
      role: "user",
      content: `Paragraph: ${paragraph}

  Instruction:
  ${command}

  Requirements:
  - Ensure correct grammar and punctuation.
  - Do not explain the changes.
  - Output ONLY the full, edited paragraph.`
    }
  ];

  const model = getLCModel(apiKey);
  const output = await callLC(model, messages);
  return output.trim();
}
