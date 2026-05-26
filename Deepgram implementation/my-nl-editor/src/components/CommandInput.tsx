import React from "react";

type Props = {
  command: string;
  onChange: (s: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
};

export default function CommandInput({ command, onChange, onSubmit }: Props) {
  return (
    <form onSubmit={onSubmit} className="command-form">
      <label className="command-label">
        Zadajte príkaz v prirodzenom jazyku:
      </label>
      
      <textarea
        className="command-textarea"
        placeholder="Napr.: 'Zmeň poslednú vetu na vtipnejšiu' alebo 'Naviguj na druhý odsek'..."
        value={command}
        onChange={(e) => onChange(e.target.value)}
      />

      <div style={{ textAlign: 'right' }}>
        <button type="submit" className="submit-button">
          Vykonať príkaz
        </button>
      </div>
    </form>
  );
}
