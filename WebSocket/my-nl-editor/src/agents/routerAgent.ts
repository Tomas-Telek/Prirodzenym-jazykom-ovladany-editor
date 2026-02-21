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

  const system = `You are a router for a text editor.

    TASKS:
    1. Fix grammar and phonetic errors from the transcription.
    2. Decide on the category:
       - "edit": if the user wants to modify the content of the current paragraph. Like write down something new, delete part of it, change words, rephrase, expand, shorten, correct grammar, etc.
        If it involves changing text, it's "edit". If it justa random text, it's also "edit".
       - "navigate": if the user wants to move to a different paragraph or navigate.
       - "structure": if the user wants to CREATE a new paragraph or DELETE an entire paragraph.

    ALWAYS RESPOND IN THE FORMAT:
      category | corrected_command
      (Example: edit | delete last word)`;


  const messages = [
    { role: "system", content: system },
    {
      role: "user",
      content: `Command: "${command}"`
    }
  ];

  const output = await callLC(model, messages);
  const [category, cleanCommand] = output.split("|").map(s => s.trim().toLowerCase());

  console.log("✅ ✅ ✅ category:", category);
  console.log("✅ ✅ ✅ currentIndex:", currentIndex);
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
