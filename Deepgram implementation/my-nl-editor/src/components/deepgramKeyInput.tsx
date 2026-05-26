type Props = {
  value: string;
  onChange: (v: string) => void;
};

export default function DeepgramApiKeyInput({ value, onChange }: Props) {
  return (
    <div className="api-key-container">
      <label className="api-key-label">
        <span>🔐</span> Deepgram API Key:
      </label>
      <input
        type="password"
        className="api-key-input"
        placeholder="xxxxxxxxxxxxxxxxxxxxx"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <small style={{ display: 'block', marginTop: '6px', color: '#94a3b8', fontSize: '0.75rem' }}>
        Kľúč je uložený iba lokálne v pamäti aplikácie.
      </small>
    </div>
  );
}
