import React, { useState, useRef, useEffect } from "react";
import ApiKeyInput from "./components/ApiKeyInput";
import CommandInput from "./components/CommandInput";
import EditorView from "./components/EditorView";
import { runRouterAgent } from "./agents/routerAgent";
import SpeechWhisper from "./components/SpeechWhisper";
import jsPDF from "jspdf";
import { Helmet, HelmetProvider } from 'react-helmet-async';


export default function App() {
  const [apiKey, setApiKey] = useState<string>("");
  const [command, setCommand] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [history_, setHistory] = useState<string[][]>([]);
  const [fontSize, setFontSize] = useState<number>(16);

  const [language, setLanguage] = useState<'sk' | 'en'>('sk');

  const [paragraphs, setParagraphs] = useState<string[]>([
    "On a quiet hill above a small village lived a boy named Leo who collected lost things.",
    "Not stolen things. Not broken things. Lost things.",
    "Every morning, he walked through the forest and picked up whatever he found: a single glove, a rusty key, a ribbon caught in a branch, a marble shining in the dirt. He kept them all in a wooden box under his bed.",
    "It was a tiny paper star folded carefully from yellow paper. Inside it, someone had written: “If you find this, I hope you’re not lonely.” Leo smiled. He wasn’t lonely anymore. So he folded another star from blue paper and wrote: “You’re not alone either.” Then he left it on the same forest path the next morning.",
    "From that day on, the two strangers never met—but the forest slowly filled with paper stars, and neither of them ever felt lonely again."
  ]);


  const stateRef = useRef({ currentIndex, paragraphs, history_, fontSize, language });

  useEffect(() => {
    stateRef.current = { currentIndex, paragraphs, history_, fontSize, language };
  }, [currentIndex, paragraphs, history_, fontSize, language]);

  async function handleSubmit(cmd: string) {
    if (!apiKey) {
      alert("Enter your OpenAI API key!");
      return;
    }
    if (!cmd.trim()) return;

    try {
      setLoading(true);

      const results = await runRouterAgent({
        apiKey,
        command: cmd,
        paragraphs: stateRef.current.paragraphs,
        currentIndex: stateRef.current.currentIndex,
        history_: stateRef.current.history_,
        fontSize: stateRef.current.fontSize,
        language: stateRef.current.language // Odtiaľto sa berie VŽDY aktuálny jazyk pre AI
      });
      
      setParagraphs(results.paragraphs);
      setCurrentIndex(results.currentIndex);
      setHistory(results.history);
      setCommand("");
      setFontSize(results.fontSize);
    } catch (err) {
      console.error("Error calling agent:", err);
    } finally {
      setLoading(false);
    }
  }

  async function setLivePreview(text: string) {
    if (!text) return;
    setCommand(text);
  }

  async function handleSubmitForm(e?: React.FormEvent) {
    e?.preventDefault();
    await handleSubmit(command);
  }

  async function handleSubmitCommand(cmd: string) {
    setCommand(cmd);
    await handleSubmit(cmd);
  }

  const exportToPDF = () => {
    const doc = new jsPDF();
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

    paragraphs.forEach((para) => {
      const cleanText = removeDiacritics(para); 
      const lines: string[] = doc.splitTextToSize(cleanText, contentWidth);
      
      lines.forEach(line => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, margin, yPosition);
        yPosition += lineHeight;
      });
      yPosition += 5;
    });

    doc.save("dokument.pdf");
  };

  const handleManualEdit = (index: number, newText: string) => {
    setParagraphs(prev => {
      const updated = [...prev];
      updated[index] = newText;
      setHistory(prev => [...prev, paragraphs]);
      return updated;
    });
  };

  return (
    <HelmetProvider>
    <div className="app-container" style={{ padding: '20px' }}>
      <Helmet>
          <html lang={language} />
          <title>
            {language === 'sk' 
              ? 'VoxEdit: Prirodzeným Jazykom Ovládaný Textový Editor' 
              : 'VoxEdit: Natural Language Driven Text Editor'}
          </title>
        </Helmet>
      <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
        <div style={{ background: '#eee', padding: '5px', borderRadius: '8px', display: 'flex', gap: '5px' }}>
          <button 
            onClick={() => setLanguage('sk')}
            style={{ background: language === 'sk' ? '#007bff' : 'white', color: language === 'sk' ? 'white' : 'black' }}
          >
            SK
          </button>
          <button 
            onClick={() => setLanguage('en')}
            style={{ background: language === 'en' ? '#007bff' : 'white', color: language === 'en' ? 'white' : 'black' }}
          >
            EN
          </button>
        </div>
      </div>
      <h1 className="app-title"> {language === 'sk' ? 'VoxEdit: Prirodzeným Jazykom Ovládaný Textový Editor' : 'VoxEdit: Natural Language Driven Text Editor'} </h1>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <ApiKeyInput 
          value={apiKey} 
          onChange={setApiKey}  
          language={language}
          />
      </div>

      <div className="voice-controls-row" style={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f8fafc',
        padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%' }}>
          
          <SpeechWhisper 
            apiKey={apiKey} 
            onText={handleSubmitCommand} 
            language={language}
            setLivePreview={setLivePreview}
          />

          <div style={{ flex: 1 }}>
            <CommandInput
              command={command}
              onChange={setCommand}
              onSubmit={handleSubmitForm}
              language={language}
            />
          </div>
        </div>

        {loading && (
          <div className="agent-loading-status" style={{ marginTop: '10px' }}>
            <span className="loader-spin">⏳</span> 
            <span style={{ fontSize: '0.9rem', color: '#3b82f6', fontWeight: 500 }}>
               {language === 'sk' ? 'AI spracúva ...' : 'AI processing ...'}
            </span>
          </div>
        )}
      </div>

      <button 
        onClick={exportToPDF}
        style={{
          padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none',
          borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginLeft: 'auto' 
        }}
      >
        {language === 'sk' ? 'Exportovať do PDF' : 'Export to PDF'}
      </button>
      <main className="editor-workspace" style={{ width: '100%' }}>
        <EditorView 
          paragraphs={paragraphs} 
          currentIndex={currentIndex} 
          fontSize={fontSize} 
          onManualEdit={handleManualEdit}
          language={language}
        />
      </main>
    </div>
    </HelmetProvider>
  );
}