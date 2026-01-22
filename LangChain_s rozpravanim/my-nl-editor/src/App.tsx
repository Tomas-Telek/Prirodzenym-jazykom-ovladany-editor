import React, { useState } from "react";
import ApiKeyInput from "./components/ApiKeyInput";
import SpeechWhisper from "./components/SpeechWhisper";
import CommandInput from "./components/CommandInput";
import EditorView from "./components/EditorView";
import { runRouterAgent } from "./agents/routerAgent";

export default function App() {
  const [apiKey, setApiKey] = useState<string>("");
  const [command, setCommand] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const [paragraphs, setParagraphs] = useState<string[]>([
    "O troch prasiatkach",
    "Boli raz tri malé prasiatka, ktoré žili na lúke pri lese...",
    "Obdobie bezstarostného pokoja sa skončilo a prasiatka museli rýchlo vymyslieť...",
    "Prvé prasiatko sa do toho pustilo hneď...",
    "Druhé prasiatko, ktoré bolo o kúsok ďalej, si vymyslelo domček z dreva...",
    "Tretie prasiatko nad domčekom dumalo a dumalo..."
  ]);

  // --- hlavná funkcia, ktorá spracuje text (z formulára alebo hlasu)
  async function handleSubmit(cmd: string) {
    if (!apiKey) {
      alert("Zadaj OpenAI API kľúč!");
      return;
    }
    if (!cmd.trim()) return;

    try {
      setLoading(true);

      const res = await runRouterAgent({
        apiKey,
        command: cmd,
        paragraphs,
        currentIndex
      });

      if (res.type === "edit") {
        const copy = [...paragraphs];
        copy[currentIndex] = res.value;
        setParagraphs(copy);
      } 
      
      else if (res.type === "navigate") {
        const idx = Number(res.value) - 1;
        if (!Number.isNaN(idx) && idx >= 0 && idx < paragraphs.length) {
          setCurrentIndex(idx);
        } 
        else {
          console.warn("Neplatný index z agenta:", res.value);
        }
      }

      else if (res.type === "structure") {
        const [action, indexStr] = res.value.split("|").map(s => s.trim());
        const index = parseInt(indexStr);

        if (action === "delete") {
          const newParagraphs = paragraphs.filter((_, i) => i !== index);
          setParagraphs(newParagraphs);
          if (index != 0) setCurrentIndex(index - 1);
        } 
        else if (action === "add_after") {
          const newParagraphs = [...paragraphs];
          newParagraphs.splice(index + 1, 0, "");
          setParagraphs(newParagraphs);
          if (index != 0 || 0 != paragraphs.length) setCurrentIndex(index + 1);
        } 
        else if (action === "add_before") {
          const newParagraphs = [...paragraphs];
          newParagraphs.splice(index, 0, "");
          setParagraphs(newParagraphs);
        }
      }

      setCommand("");
    } catch (err) {
      console.error("Chyba pri volaní agenta:", err);
    } finally {
      setLoading(false);
    }
  }

  // --- pre CommandInput (formulár)
  async function handleSubmitForm(e?: React.FormEvent) {
    e?.preventDefault();
    await handleSubmit(command);
  }

  // --- pre SpeechWhisper (hlas)
  async function handleSubmitCommand(cmd: string) {
    setCommand(cmd);
    await handleSubmit(cmd);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Prirodzeným jazykom ovládaný editor</h1>

      <ApiKeyInput value={apiKey} onChange={setApiKey} />

      <SpeechWhisper apiKey={apiKey} onText={handleSubmitCommand} />

      {loading && <div style={{ marginTop: 8 }}>Spracovávam hlas/text… ⏳</div>}

      <CommandInput
        command={command}
        onChange={setCommand}
        onSubmit={handleSubmitForm}
      />

      <EditorView paragraphs={paragraphs} currentIndex={currentIndex} />
    </div>
  );
}
