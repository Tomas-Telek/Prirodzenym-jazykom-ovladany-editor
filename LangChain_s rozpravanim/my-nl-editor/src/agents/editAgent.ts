import { getLCModel, callLC } from "./langchainClient";

export async function runEditAgent(opts: {
  apiKey: string;
  paragraph: string;
  command: string;
}) {
  const { apiKey, paragraph, command } = opts;

const system = `Editor odsekov. Pravidlá:
  1. Uprav len cieľovú časť podľa inštrukcie. Zvyšok nemeň.
  2. Ak je vstup len veta bez inštrukcie, pridaj ju na koniec.
  3. Fixuj gramatiku a nadväznosť.
  4. Formát: Veľké písmeno na začiatku, bodka na konci vety.
  5. Výstup: Len čistý opravený text. Žiadne komentáre, úvodzovky ani vysvetlivky.`;

  const messages = [
    { role: "system", content: system },
    {
      role: "user",
      content: `Odstavec:
${paragraph}

Inštrukcia:
${command}`
    }
  ];

  const model = getLCModel(apiKey);
  const output = await callLC(model, messages);
  return output.trim();
}
