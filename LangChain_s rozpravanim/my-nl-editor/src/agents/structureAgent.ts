import { getLCModel, callLC } from "./langchainClient";

export async function runStructureAgent(opts: {
  apiKey: string;
  command: string;
  total: number;
  current: number;
}) {
  const { apiKey, command, total, current } = opts;

  const model = getLCModel(apiKey);

  const system = `Si agent pre úpravu štruktúry dokumentu. 
  Tvojou úlohou je určiť, či sa má odsek pridať alebo vymazať.
  
  MOŽNÉ AKCIE:
  - "add_after": Pridá nový prázdny odsek ZA aktuálny.
  - "add_before": Pridá nový prázdny odsek PRED aktuálny.
  - "delete": Vymaže aktuálny odsek.

  ODPOVEDAJ VŽDY V FORMÁTE: akcia | index
  Indexy sú od 0 po ${total - 1}.
  Aktuálny index je ${current}.`;

  const messages = [
    { role: "system", content: system },
    {
      role: "user",
      content: `Príkaz: "${command}"
      Aktuálny index: ${current}
      Počet odsekov: ${total}
      Odpovedz v tvare "akcia | index".`
    }
  ];

  const output = await callLC(model, messages);
  return output.trim().toLowerCase();
}