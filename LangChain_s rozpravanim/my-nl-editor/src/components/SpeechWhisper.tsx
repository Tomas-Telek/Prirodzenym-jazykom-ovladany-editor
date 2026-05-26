import _, { useRef, useState } from "react";

type Props = {
  apiKey: string;
  onText: (text: string) => void;
};

export default function SpeechWhisper({ apiKey, onText }: Props) {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    audioChunksRef.current = [];

    recorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    recorder.onstop = async () => {
      setLoading(true);
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const file = new File([blob], "audio.webm", { type: "audio/webm" });

      try {
        const text = await sendToWhisper(file);
        onText(text);
      } catch (err) {
        console.error("Chyba pri Whisper API:", err);
      } finally {
        setLoading(false);
      }
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecording(true);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  async function sendToWhisper(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("model", "whisper-1");
    //formData.append("model", "whisper-large-v3");
    formData.append("language", "sk");

    /* Using groq
    const groqApiKey = "";
    const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${groqApiKey}`
      },
      body: formData
    });
    */

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData
    });

    const data = await res.json();
    return data.text || "";
  }


  return (
    <div className="voice-control-wrapper">
      <button 
        onClick={recording ? stopRecording : startRecording}
        className={`record-button ${recording ? 'recording' : 'idle'}`}
      >
        {recording ? (
          <><span>⏹</span> Zastaviť</>
        ) : (
          <><span>🎤</span> Nahrať hlasový príkaz</>
        )}
      </button>

      <div className="status-area">
        {recording && (
          <span className="status-text" style={{ color: '#ef4444' }}>
            Hlasový vstup aktívny... 🔴
          </span>
        )}
        
        {loading && (
          <span className="status-text">
            <span className="loader-spin">⏳</span> AI analyzuje vašu reč...
          </span>
        )}
      </div>
    </div>
  );
}
