import { getLCModel, callLC } from "./langchainClient";

export async function runEditAgent(opts: {
  apiKey: string;
  paragraph: string;
  command: string;
}) {
  const { apiKey, paragraph, command } = opts;

  const system = `Si editor textu. Úlohou je upraviť IBA jeden odsek podľa príkazu.
Výstup musí byť výhradne nový odsek, bez komentárov, bez poznámok.`;

  const messages = [
    { role: "system", content: system },
    {
      role: "user",
      content: `Odstavec:
${paragraph}

Inštrukcia:
${command}

Požiadavky:
- uprav LEN tento odsek
- gramatika musí byť správna
- nič nevysvetľuj
- výstup = čistý text odseku`
    }
  ];

  const model = getLCModel(apiKey);
  const output = await callLC(model, messages);
  return output.trim();
}
