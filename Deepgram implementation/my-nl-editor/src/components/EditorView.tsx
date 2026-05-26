import React, { useEffect, useRef } from "react";
import "../index.css";

type Props = {
  paragraphs: string[];
  currentIndex: number;
  fontSize?: number;
  onManualEdit: (index: number, newText: string) => void;
};

export default function EditorView({ paragraphs, currentIndex, fontSize, onManualEdit }: Props) {
  const activeParagraphRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeParagraphRef.current) {
      activeParagraphRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentIndex]);

  return (
    <div className="editor-container">
      <h2 style={{ marginBottom: "24px", fontWeight: 700 }}>Text Editor: </h2>
      
      <div className="blocks-wrapper">
        {paragraphs.map((p, i) => {
          const isActive = i === currentIndex;
          
          return (
            <div
              key={i}
              ref={isActive ? activeParagraphRef : null}
              className={`paragraph-block ${isActive ? "active" : ""}`}
              style={{ 
                fontSize: fontSize, 
                display: 'flex',      // Zabezpečí, že číslo a text sú vedľa seba
                alignItems: 'flex-start', 
                gap: '12px' 
              }}
            >
              {/* Číslo odseku - fixné, neovplyvňuje text */}
              <span 
                className="paragraph-number" 
                style={{ userSelect: 'none', marginTop: '2px' }}
              >
                {i + 1}
              </span>
              
              {/* Samotná editovateľná plocha */}
              <div
                contentEditable={true}
                suppressContentEditableWarning={true}
                className="paragraph-content"
                style={{ 
                  flex: 1, 
                  outline: 'none', // Odstráni modrý rámček pri kliknutí
                  minHeight: '1em' 
                }}
                onBlur={(e) => {
                  // Teraz innerText obsahuje IBA text tohto divu, bez čísla!
                  const newText = e.currentTarget.innerText.trim();
                  if (newText !== p) {
                    onManualEdit(i, newText);
                  }
                }}
              >
                {p || <span className="empty-placeholder" style={{ color: '#ccc' }}>Prázdny odsek...</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}