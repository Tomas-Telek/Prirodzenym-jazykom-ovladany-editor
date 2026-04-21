import { getLCModel, callLC } from "./langchainClient";

export async function runEditAgent(opts: {
  apiKey: string;
  paragraph: string;
  command: string;
  language: string;
}) {
  const { apiKey, paragraph, command, language } = opts;

  const langName = language === 'sk' ? 'SLOVAK' : 'ENGLISH';

  const system = `Paragraph Editor. Rules:
    1. Modify ONLY the target part based on the instruction. Keep the rest unchanged.
    2. If the input is just a sentence without specific instructions, append it to the end of the paragraph.
    3. Formatting: Ensure it starts with a Capital letter and ends with a period.
    4. OUTPUT: Return ONLY the newly generated text. Do not include any meta-comments (e.g., "Sure, here is your story:" or test in apostrophes: ").
    5. LANGUAGE: You must output the text in ${langName}.`;

  const messages = [
    { role: "system", content: system },
    {
      role: "user",
      content: `Current Paragraph:
  "${paragraph}"

  Instruction:
  ${command}`
      }
  ];

  const model = getLCModel(apiKey);
  const output = await callLC(model, messages);
  return output.trim();
}
