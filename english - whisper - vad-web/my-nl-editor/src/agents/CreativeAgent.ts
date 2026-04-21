import { getLCModel, callLC } from "./langchainClient";

export async function runCreativeAgent(opts: {
  apiKey: string;
  paragraph: string;
  command: string;
  language: string;
}) {
  const { apiKey, paragraph, command, language } = opts;

  const langName = language === 'sk' ? 'SLOVAK' : 'ENGLISH';

  const system = `You are a Creative Writing Assistant. 
    Your goal is to generate or expand text based on the user's prompt and the existing context. 

    RULES:
    1. CONTINUATION: If the user asks to "continue" or "write more", analyze the current paragraph and generate a seamless, natural addition.
    2. CREATION: If the user asks to "generate" or "write a story about", create new, engaging content from scratch.
    3. TONE: Match the style, vocabulary, and emotional tone of the existing paragraph.
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

  const model = getLCModel(apiKey, 0.8);
  const output = await callLC(model, messages);
  return output.trim();
}
