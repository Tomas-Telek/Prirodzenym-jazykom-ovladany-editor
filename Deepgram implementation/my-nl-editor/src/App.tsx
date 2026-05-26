import React, { useState , useRef, useEffect} from "react";
import ApiKeyInput from "./components/ApiKeyInput";
import CommandInput from "./components/CommandInput";
import EditorView from "./components/EditorView";
import { runRouterAgent } from "./agents/routerAgent";
import SpeechDeepgram from "./components/SpeechWhisper";
import DeepgramApiKeyInput from "./components/deepgramKeyInput";
import jsPDF from "jspdf";


export default function App() {
  const [apiKey, setApiKey] = useState<string>("");
  const [deepgramKey, setDeepgramKey] = useState<string>("");

  
  const [command, setCommand] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [history_, setHistory] = useState<string[][]>([]);
  const [fontSize, setFontSize] = useState<number>(16);


  const [paragraphs, setParagraphs] = useState<string[]>([
    "O troch prasiatkach",
    "Boli raz tri malé prasiatka, ktoré žili na lúke pri lese...",
    "Obdobie bezstarostného pokoja sa skončilo a prasiatka museli rýchlo vymyslieť...",
    "Prvé prasiatko sa do toho pustilo hneď...",
    "Druhé prasiatko, ktoré bolo o kúsok ďalej, si vymyslelo domček z dreva...",
    "Tretie prasiatko nad domčekom dumalo a dumalo..."
  ]);

  const stateRef = useRef({ currentIndex, paragraphs, history_ , fontSize });

  useEffect(() => {
  stateRef.current = { currentIndex, paragraphs, history_ , fontSize};
}, [currentIndex, paragraphs, history_, fontSize]);



  async function handleSubmit(cmd: string) {
    if (!apiKey) {
      alert("Zadaj OpenAI API kľúč!");
      return;
    }
    if (!cmd.trim()) return;

    try {
      setLoading(true);

      // TU JE ZMENA: Namiesto currentIndex použijeme stateRef.current.currentIndex
      const results = await runRouterAgent({
        apiKey,
        command: cmd,
        paragraphs: stateRef.current.paragraphs,
        currentIndex: stateRef.current.currentIndex,
        history_: stateRef.current.history_,
        fontSize: stateRef.current.fontSize
      });

      console.log("Router Agent Results - Nový index:", results.currentIndex);
      
      setParagraphs(results.paragraphs);
      setCurrentIndex(results.currentIndex);
      setHistory(results.history);
      setCommand("");
      setFontSize(results.fontSize);
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


  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Funkcia na odstránenie diakritiky (ak font blbne, toto zachráni čitateľnosť)
    const removeDiacritics = (text: string) => {
      return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    
    let yPosition = 35;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const contentWidth = 170;
    const lineHeight = 7;

    paragraphs.forEach((para, index) => {
      // TIP: Ak chceš diakritiku riskovať, zakomentuj riadok nižšie. 
      // Ak chceš mať PDF 100% čitateľné (bez paznakov), nechaj ho takto:
      const cleanText = removeDiacritics(para); 

      // Rozdelíme text na riadky podľa šírky
      const lines: string[] = doc.splitTextToSize(cleanText, contentWidth);
      
      lines.forEach(line => {
        // Kontrola konca strany
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.text(line, margin, yPosition);
        yPosition += lineHeight; // Posun o jeden riadok
      });

      yPosition += 5; // Extra medzera medzi odsekmi
    });

    doc.save("dokument.pdf");
  };


  const handleManualEdit = (index: number, newText: string) => {
    setParagraphs(prev => {
      const updated = [...prev];
      updated[index] = newText;
      setHistory(prev => [...prev, paragraphs])
      return updated;
    });

  };

return (
  <div className="app-container" style={{ padding: '20px' }}>
    <h1 className="app-title">Prirodzeným jazykom ovládaný editor</h1>

    {/* HORNÝ PANEL - API Kľúče */}
    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
      <ApiKeyInput value={apiKey} onChange={setApiKey} />

      <DeepgramApiKeyInput value={deepgramKey} onChange={setDeepgramKey} />
    </div>

    {/* HLAVNÁ OBLASŤ OVLÁDANIA - Teraz nad editorom */}
    <div className="voice-controls-row" style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: '#f8fafc',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '20px',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%' }}>
        
        {/* Deepgram tlačidlo na ľavej strane */}
        <SpeechDeepgram 
          deepgramKey={deepgramKey} 
          onText={handleSubmitCommand} 
        />


        {/* Manuálny vstup uprostred */}
        <div style={{ flex: 1 }}>
          <CommandInput
            command={command}
            onChange={setCommand}
            onSubmit={handleSubmitForm}
          />
        </div>
      </div>

      {/* Indikátor práce pod ovládacími prvkami */}
      {loading && (
        <div className="agent-loading-status" style={{ marginTop: '10px' }}>
          <span className="loader-spin">⏳</span> 
          <span style={{ fontSize: '0.9rem', color: '#3b82f6', fontWeight: 500 }}>
             AI vykonáva príkaz...
          </span>
        </div>
      )}
    </div>

    {/* EDITOR - Teraz na celú šírku */}
    <button 
      onClick={exportToPDF}
      style={{
        padding: '8px 16px',
        backgroundColor: '#10b981', // Pekná zelená
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        marginLeft: 'auto' // Posunie ho úplne doprava v lište
      }}
    >
      📥 Exportovať PDF
    </button>
    <main className="editor-workspace" style={{ width: '100%' }}>
      <EditorView 
        paragraphs={paragraphs} 
        currentIndex={currentIndex} 
        fontSize={fontSize} 
        onManualEdit={handleManualEdit}
      />
    </main>
  </div>
  );
}
