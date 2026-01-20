import { runEditAgent } from "./editAgent";
import { runNavigateAgent } from "./navigateAgent";
import { getLCModel, callLC } from "./langchainClient";
import { runStructureAgent } from "./structureAgent";

export async function runRouterAgent(opts: {
  apiKey: string;
  command: string;
  paragraphs: string[];
  currentIndex: number;
}) {
  const { apiKey, command, paragraphs, currentIndex } = opts;

  const model = getLCModel(apiKey);

  const system = `Si router pre textový editor. Analyzuj hlasový príkaz v slovenčine.
    
    ÚLOHY:
    1. Oprav gramatiku a fonetické chyby z prepisu (napr. "viskrabni" -> "vymaž").
    2. Rozhodni o kategórii:
       - "edit": ak chce používateľ meniť obsah aktuálneho odseku.
       - "navigate": ak sa chce presunúť na iný odsek alebo navigovať.
       - "structure": ak chce používateľ VYTVORIŤ nový odsek alebo VYMAZAŤ celý odsek.
       
    ODPOVEDAJ VŽDY V TOMTO FORMÁTE:
      kategoria | opraveny_prikaz
      (Príklad: edit | vymaž posledné slovo)`;


  const messages = [
    { role: "system", content: system },
    {
      role: "user",
      content: `Príkaz: "${command}"`
    }
  ];

  const output = await callLC(model, messages);
  const [category, cleanCommand] = output.split("|").map(s => s.trim().toLowerCase());

  const isEdit = category === "edit";

  const finalCommand = cleanCommand || command;

  if (category === "structure") {
    const structureAction = await runStructureAgent({
          apiKey,
          command: finalCommand,
          total: paragraphs.length,
          current: currentIndex
        });
        return { type: "structure" as const, value: structureAction };
      }

  else if (isEdit) {
    const updated = await runEditAgent({
      apiKey,
      paragraph: paragraphs[currentIndex],
      command: finalCommand
    });
    return { type: "edit" as const, value: updated };


  } else {
    const idxStr = await runNavigateAgent({
      apiKey,
      command: finalCommand,
      total: paragraphs.length,
      current: currentIndex
    });
    return { type: "navigate" as const, value: idxStr };
  }
    
}
