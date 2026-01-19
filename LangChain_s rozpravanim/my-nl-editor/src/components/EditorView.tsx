import React from "react";

type Props = {
  paragraphs: string[];
  currentIndex: number;
};

export default function EditorView({ paragraphs, currentIndex }: Props) {
  return (
    <div>
      <h2>Editor</h2>
      <div style={{ width: "90%", border: "1px solid #ccc", padding: 10 }}>
        {paragraphs.map((p, i) => (
          <div
            key={i}
            style={{
              padding: 8,
              marginBottom: 6,
              background: i === currentIndex ? "#ffffa0" : "transparent"
            }}
          >
            {p}
          </div>
        ))}
      </div>
    </div>
  );
}
