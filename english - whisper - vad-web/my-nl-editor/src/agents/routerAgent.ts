import { runEditAgent } from "./editAgent";
import { runCreativeAgent } from "./CreativeAgent";
import { getLCModel} from "./langchainClient";
import { z } from "zod";

export async function runRouterAgent(opts: {
  apiKey: string;
  command: string;
  paragraphs: string[];
  currentIndex: number;
  history_: string[][];
  fontSize: number;
  language: string;
}) {
  const { apiKey, command, paragraphs, currentIndex, history_, fontSize, language } = opts;

  const langName = language === 'sk' ? 'SLOVAK' : 'ENGLISH';
  console.log("Index:", currentIndex);


  // 1. Definícia schémy
  const taskScheme = z.object({
    tasks: z.array(
      z.object({
        category: z.enum([
          "edit", "creative", "navigate", "structure", "undo", "font", "dictate"
        ]).describe(`
          - edit: Modifying existing text (grammar, rewrite, translate).
          - creative: Generating NEW content (continue writing, poem).
          - navigate: Moving between paragraphs.
          - structure: Creating or deleting entire paragraphs.
          - undo: Reverting the last action.
          - font: Changing font size.
          - dictate: Adding raw dictated text to current paragraph.
        `),
        cleanCommand: z.string().describe("Clear, grammatically correct version of the user's instruction in ${langName}."),

        structureAction: z.enum(["add_after", "add_before", "delete", "none"])
        .describe("Only for 'structure' category. What to do with the paragraph. 'none' means no structural change."),

        fontAction: z.enum(["increase", "decrease", "reset", "none"])
        .describe("Only for 'fontUP' and 'fontDOWN' categories. How to adjust the font size. 'none' means no change."),

        navTarget: z.string()
        .describe(`Target for 'navigate' category. 
          Use: 'next', 'prev', 'first', 'last'. 
          If user names a specific number (e.g. 'go to paragraph 5'), return that number as a string.
          Current index is ${currentIndex + 1}, total paragraphs: ${paragraphs.length}.
          If not navigating, return 'none'.`)
      })
    )
  });


  const model = getLCModel(apiKey);


  const structuredLlm = model.withStructuredOutput(taskScheme);

  const system = `You are an Intelligent Task Planner for a text editor.
  The user is communicating in ${langName}.
  Analyze the user's voice command and decompose it into atomic tasks.

  RULES:
  - AUTOMATIC NAVIGATION: If the command refers to another paragraph, generate "navigate" first.`;

  const decision = await structuredLlm.invoke([
    { role: "system", content: system },
    { role: "user", content: `Command: "${command}"` }
  ]);


  let updatedParagraphs = [...paragraphs];
  let updatedIndex = currentIndex;
  let updatedHistory = [...history_];
  let updatedFontSize = fontSize;

  for (const task of decision.tasks) {

    if (task.category === "undo") {
      if (updatedHistory.length > 0) {
        updatedParagraphs = updatedHistory[updatedHistory.length - 1];
        updatedHistory = updatedHistory.slice(0, -1);
      }
      continue; 
    }

    if (task.category !== "navigate") {
      updatedHistory.push([...updatedParagraphs]);
    }



    switch (task.category) {

      case "structure":
        const action = task.structureAction;
        
        if (action === "delete") {
          updatedParagraphs = updatedParagraphs.filter((_, i) => i !== updatedIndex);
          updatedIndex = Math.max(0, updatedIndex - 1);
        } 
        else if (action === "add_after") {
          if (updatedParagraphs.length === 0) {
            updatedParagraphs = [""];
            updatedIndex = 0;
          } else {
            updatedParagraphs.splice(updatedIndex + 1, 0, "");
            updatedIndex = updatedIndex + 1;
          }
        }
        else if (action === "add_before") {
          updatedParagraphs.splice(updatedIndex, 0, "");
        }
        break;

      case "edit":
        const editedText = await runEditAgent({
          apiKey,
          paragraph: updatedParagraphs[updatedIndex],
          command: task.cleanCommand,
          language: language
        });
        updatedParagraphs[updatedIndex] = editedText;
        break;


      case "navigate":
        const target = task.navTarget;
          if (target === "none") break;

          let newIdx = updatedIndex;

          if (target === "next") {
            newIdx = Math.min(updatedParagraphs.length - 1, updatedIndex + 1);
          } else if (target === "prev") {
            newIdx = Math.max(0, updatedIndex - 1);
          } else if (target === "first") {
            newIdx = 0;
          } else if (target === "last") {
            newIdx = updatedParagraphs.length - 1;
          } else {
            // Ak AI vrátila číslo ako string (napr. "5")
            const num = parseInt(target, 10);
            if (!isNaN(num)) {
              
              newIdx = Math.max(0, Math.min(updatedParagraphs.length - 1, num - 1));
            }
          }
          updatedIndex = newIdx;
          break;


      case "font":
        if (task.fontAction === "increase") {
          updatedFontSize += 2;
        } else if (task.fontAction === "decrease") {
          updatedFontSize = Math.max(8, updatedFontSize - 2);
        } else if (task.fontAction === "reset") {
          updatedFontSize = 16;
        }
        break;

      case "dictate":
        updatedParagraphs[updatedIndex] += (updatedParagraphs[updatedIndex] ? " " : "") + task.cleanCommand;
        break;

      case "creative":
        const generatedText = await runCreativeAgent({
          apiKey,
          paragraph: updatedParagraphs[updatedIndex],
          command: task.cleanCommand,
          language: language
        });
        updatedParagraphs[updatedIndex] += (updatedParagraphs[updatedIndex] ? " " : "") + generatedText;
        break;
    }
  }


  return {
    paragraphs: updatedParagraphs,
    currentIndex: updatedIndex,
    history: updatedHistory,
    fontSize: updatedFontSize

  };
}