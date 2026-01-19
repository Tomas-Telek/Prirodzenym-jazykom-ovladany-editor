import { runEditAgent } from "./editAgent";
import { runNavigateAgent } from "./navigateAgent";

const editKeywords = [
  'napíš','napis','prepíš','prepis','vymaž','vymaz',
  'nahraď','nahrad','zmeň','zmen','uprav','pridaj',
  'doplň','dopln','odstráň','odstran','preformuluj',
  'rozšír','rozsir','vymeň','vymen','dopíš','dopis','vynechaj','vloz','vlož'
];

export async function runRouterAgent(opts: {
  apiKey: string;
  command: string;
  paragraphs: string[];
  currentIndex: number;
}) {
  const { apiKey, command, paragraphs, currentIndex } = opts;
  const cmdLower = command.toLowerCase();
  const isEdit = editKeywords.some(k => cmdLower.includes(k));

  if (isEdit) {
    const updated = await runEditAgent({
      apiKey,
      paragraph: paragraphs[currentIndex],
      command
    });
    return { type: "edit" as const, value: updated };
  } else {
    const idxStr = await runNavigateAgent({
      apiKey,
      command,
      total: paragraphs.length,
      current: currentIndex
    });
    return { type: "navigate" as const, value: idxStr };
  }
}
