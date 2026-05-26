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
  const [history_, setHistory] = useState<string[][]>([]);

  const [paragraphs, setParagraphs] = useState<string[]>([
    "O troch prasiatkach",
    "Boli raz tri malé prasiatka, ktoré žili na lúke pri lese...",
    "Obdobie bezstarostného pokoja sa skončilo a prasiatka museli rýchlo vymyslieť...",
    "Prvé prasiatko sa do toho pustilo hneď...",
    "Druhé prasiatko, ktoré bolo o kúsok ďalej, si vymyslelo domček z dreva...",
    "Tretie prasiatko nad domčekom dumalo a dumalo..."
  ]);



  async function handleSubmit(cmd: string) {
    if (!apiKey) {
      alert("Zadaj OpenAI API kľúč!");
      return;
    }
    if (!cmd.trim()) return;

    try {
      setLoading(true);

      const results = await runRouterAgent({
        apiKey,
        command: cmd,
        paragraphs,
        currentIndex,
        history_
      });

      setParagraphs(results.paragraphs);
      setCurrentIndex(results.currentIndex);
      setHistory(results.history);

      
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
    <div className="app-container">
      <h1 className="app-title">Prirodzením jazykom ovládaný editor</h1>
      

      <div className="top-bar">
        <ApiKeyInput value={apiKey} onChange={setApiKey} />
        <CommandInput
          command={command}
          onChange={setCommand}
          onSubmit={handleSubmitForm}
        />
      </div>

      <div className="main-workspace">
        
        <aside className="sidebar-input">
          <SpeechWhisper apiKey={apiKey} onText={handleSubmitCommand} />
          
          {loading && (
            <div style={{ marginTop: 20, fontSize: '0.8rem', color: '#3b82f6' }}>
              <span className="loader-spin">⏳</span> AI premýšľa...
            </div>
          )}
        </aside>
        

        <main className="editor-workspace">
          <EditorView paragraphs={paragraphs} currentIndex={currentIndex} />
        </main>

      </div>
    </div>
  );
}
