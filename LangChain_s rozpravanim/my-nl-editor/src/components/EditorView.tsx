import React from "react";
import "../index.css";

type Props = {
  paragraphs: string[];
  currentIndex: number;
};

export default function EditorView({ paragraphs, currentIndex }: Props) {
  return (
    <div className="editor-container">
      <h2 style={{ marginBottom: "24px", fontWeight: 700 }}>Text Editor: </h2>
      
      <div className="blocks-wrapper">
        {paragraphs.map((p, i) => (
          <div
            key={i}
            className={`paragraph-block ${i === currentIndex ? "active" : ""}`}
          >
            <span className="paragraph-number">{i + 1}</span>
            
            {p ? (
              p
            ) : (
              <span className="empty-placeholder">Prázdni odsek...</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}