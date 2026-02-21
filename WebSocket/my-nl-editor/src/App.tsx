import React, { useEffect, useState } from "react";
import ApiKeyInput from "./components/ApiKeyInput";
import CommandInput from "./components/CommandInput";
import EditorView from "./components/EditorView";
import { runRouterAgent } from "./agents/routerAgent";
import { useRealtimeTranscription } from "./RealtimeTranscription";

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

  const { isRecording, partialText, startStreaming, stopStreaming } = useRealtimeTranscription(
  apiKey,
  async (finalText) => {
    // Keď sa nahrávanie vypne a príde finálny text, spracujeme ho
    await handleSubmit(finalText);
  }
  );

  const handleMicClick = () => {
    if (isRecording) {
      stopStreaming();
    } else {
      if (!apiKey) {
        alert("Najprv zadaj API kľúč!");
        return;
      }
      setCommand("");
      startStreaming();
    }
  };
  useEffect(() => {
  if (isRecording && partialText) {
    setCommand(partialText);
  }
}, [partialText, isRecording]);


  // Synchronizácia partialTextu do tvojho inputu (command)
  React.useEffect(() => {
    if (isRecording && partialText) {
      setCommand(partialText);
    }
  }, [partialText, isRecording]);

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


return (
  <div style={{ padding: 20 }}>
    <h1>Natural language controlled editor</h1>

    <ApiKeyInput value={apiKey} onChange={setApiKey} />

    {/* TLAČIDLO AKO PREPÍNAČ (Toggle) */}
    <div style={{ margin: "10px 0" }}>
      <button
        onClick={handleMicClick}
        style={{
          padding: "12px 24px",
          backgroundColor: isRecording ? "#dc3545" : "#28a745", // Červená pri nahrávaní, zelená pri tichu
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "16px",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}
      >
        <span style={{ fontSize: "20px" }}>
          {isRecording ? "⏹️" : "🎤"}
        </span>
        {isRecording ? "Stop recording" : "Start voice command"}
      </button>
    </div>

    {loading && <div style={{ marginTop: 8, color: "#007bff" }}>Processing voice/text… ⏳</div>}
    <CommandInput
      command={command}
      onChange={setCommand}
      onSubmit={handleSubmitForm}
    />

    <EditorView paragraphs={paragraphs} currentIndex={currentIndex} />
  </div>
);

}