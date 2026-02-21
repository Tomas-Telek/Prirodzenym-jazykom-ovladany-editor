import React from "react";
type Props = {
  value: string;
  onChange: (v: string) => void;
};

export default function ApiKeyInput({ value, onChange }: Props) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label>OpenAI API key:</label><br />
      <input
        type="password"
        placeholder="sk-..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "90%" }}
      />

    </div>
  );
}
