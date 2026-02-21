type Props = {
  paragraphs: string[];
  currentIndex: number;
};

export default function EditorView({ paragraphs, currentIndex }: Props) {
  return (
    <div>
      <h2>Editor</h2>
      {/* Pridali sme id="editor", aby fungoval štýl z App.css */}
      <div id="editor">
        {paragraphs.map((p, i) => (
          <div
            key={i}
            /* Ak je index aktuálny, pridáme triedu .highlight, inak nič */
            className={i === currentIndex ? "highlight" : ""}
          >
            {p}
          </div>
        ))}
      </div>
    </div>
  );
}