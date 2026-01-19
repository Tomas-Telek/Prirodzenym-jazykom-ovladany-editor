import React from "react";

type Props = {
  command: string;
  onChange: (s: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
};

export default function CommandInput({ command, onChange, onSubmit }: Props) {
  return (
    <form onSubmit={onSubmit} style={{ marginBottom: 12 }}>
      <label>Napíš príkaz v prirodzenom jazyku:</label><br />
      <textarea
        value={command}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "90%", height: 90 }}
      />
      <br />
      <button type="submit">Odoslať</button>
    </form>
  );
}
