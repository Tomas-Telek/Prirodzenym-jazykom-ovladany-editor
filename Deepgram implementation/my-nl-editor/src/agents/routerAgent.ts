import { runEditAgent } from "./editAgent";
import { runNavigateAgent } from "./navigateAgent";
import { getLCModel} from "./langchainClient";
import { runStructureAgent } from "./structureAgent";
import { JsonOutputParser } from "@langchain/core/output_parsers";

export async function runRouterAgent(opts: {
  apiKey: string;
  command: string;
  paragraphs: string[];
  currentIndex: number;
  history_: string[][];
  fontSize: number;
}) {
  const { apiKey, command, paragraphs, currentIndex, history_, fontSize } = opts;
  console.log("Initial state:", {currentIndex});

  const model = getLCModel(apiKey);
  const parser = new JsonOutputParser();

  const chain = model.pipe(parser);

  const system = `You are an Intelligent Task Planner for a text editor.
  Analyze the user's Slovak voice command and decompose it into a sequence of atomic tasks.

  CATEGORIES:
  1. "edit": Changing content inside the currently selected paragraph (e.g., fix grammar, rewrite, make it shorter).
  2. "navigate": Moving between paragraphs (e.g., go to next, go to the beginning, jump to paragraph 5).
  3. "structure": Creating or deleting entire paragraphs (e.g., add new block below, delete this).
  4. "undo": Reverting the last action (e.g., "vráť to späť", "zruš to", "undo", "vráť poslednú zmenu").
  5. "fontUP": Increase font size of the current paragraph.
  6. "fontDOWN": Decrease font size of the current paragraph.

  RULES:
  - CONTEXT AWARENESS: You are given the 'Current Index' (0-based) and the user's command.
  - AUTOMATIC NAVIGATION: If the user's command refers to a paragraph OTHER than the current one (e.g., "v treťom odseku oprav..."), you MUST first generate a "navigate" task to that paragraph, followed by the requested action.
  - Clean Commands: The "cleanCommand" should be a clear, corrected version of the specific instruction in Slovak.

  Current Index: ${currentIndex + 1}

  RETURN ONLY VALID JSON:
  {
    "tasks": [
      {
        "category": "edit" | "navigate" | "structure" | "undo" | "fontUP" | "fontDOWN",
        "cleanCommand": "corrected Slovak instruction",
      }
    ]
  }`;


  const messages = [
    { role: "system", content: system },
    {role: "user", content: `Command: "${command}"`}
  ];


  const decision = await chain.invoke(messages);

  console.log("Router OUT:", decision);

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
    else{
      updatedHistory.push([...updatedParagraphs]);
    }


    if (task.category === "structure") {
      const structureAction = await runStructureAgent({
            apiKey,
            command: task.cleanCommand,
            total: updatedParagraphs.length,
            current: updatedIndex
          });
          updatedIndex = structureAction.index;
          const { action, index } = structureAction; 
                    if (action === "delete") {
            updatedParagraphs = updatedParagraphs.filter((_, i) => i !== index);
            updatedIndex = Math.max(0, index - 1);
          } 

          else if (action === "add_after") {
            updatedParagraphs.splice(index + 1, 0, "");
            updatedIndex = index + 1;
          } 

          else if (action === "add_before") {
            updatedParagraphs.splice(index, 0, "");
            updatedIndex = index;
          }
          continue;
      }



    if (task.category === "edit") {
      const updated = await runEditAgent({
        apiKey,
        paragraph: updatedParagraphs[updatedIndex],
        command: task.cleanCommand
      });
      console.log("Edit OUT:", currentIndex, updatedIndex);
      updatedParagraphs[updatedIndex] = updated;
      continue;
    } 


    if (task.category === "navigate") {
      const idxStr = await runNavigateAgent({
        apiKey,
        command: task.cleanCommand,
        total: updatedParagraphs.length,
        current: updatedIndex
      });
      const idx = Number(idxStr) - 1;
      if (!Number.isNaN(idx) && idx >= 0 && idx < updatedParagraphs.length) {
          updatedIndex = idx;
        }
      continue;
    }
    if (task.category === "fontUP") {
      updatedFontSize += 2;
    }
    if (task.category === "fontDOWN") {
      updatedFontSize -= 2;
    }

  }


  return {
    paragraphs: updatedParagraphs,
    currentIndex: updatedIndex,
    history: updatedHistory,
    fontSize: updatedFontSize

  };
}