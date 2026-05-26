import React, { useRef, useState, useEffect } from "react";

type Props = {
  deepgramKey: string; // Pozor: potrebuješ Deepgram API kľúč
  onText: (text: string) => void;
};

export default function SpeechDeepgram({ deepgramKey, onText }: Props) {
  const [recording, setRecording] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);



  async function startRecording() {
    if (!deepgramKey) {
      alert("Zadaj Deepgram API kľúč!");
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Otvorenie WebSocketu priamo na Deepgram
    // Parametre: 
    // model=nova-2 (najrýchlejší), 
    // language=sk, 
    // smart_format=true (pridá bodky, veľké písmená)
    // endpointing=500 (po 500ms ticha pošle finálny výsledok)
    const socket = new WebSocket(
      `wss://api.deepgram.com/v1/listen?model=nova-2&language=sk&smart_format=true&endpointing=500&dictation=true&filler_words=true`,
      ["token", deepgramKey]
    );

    socket.onopen = () => {
      console.log("Deepgram spojenie otvorené");
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
          socket.send(event.data);
        }
      };

      recorder.start(100); // Posielaj kúsky audia každých 100ms
      mediaRecorderRef.current = recorder;
    };

    socket.onmessage = (message) => {
      const received = JSON.parse(message.data);
      const transcript = received.channel?.alternatives[0]?.transcript;

      // Ak je is_final true, znamená to, že Deepgram detegoval koniec vety/príkazu
      if (transcript && received.is_final) {
        console.log("Finálny prepis:", transcript);
        onText(transcript);
        
        // VOLITEĽNÉ: Ak chceš, aby sa nahrávanie po jednom príkaze zastavilo:
        // stopRecording();
      }
    };

    socketRef.current = socket;
    setRecording(true);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    socketRef.current?.close();
    setRecording(false);
  }

  return (
    <div className="voice-control-wrapper">
      <button 
        onClick={recording ? stopRecording : startRecording}
        className={`record-button ${recording ? 'recording' : 'idle'}`}
      >
        {recording ? "⏹ Zastaviť počúvanie" : "🎤 Zapnúť inteligentný režim"}
      </button>
      
      {recording && (
        <div className="status-area">
          <span className="status-text" style={{ color: '#10b981' }}>
            Systém aktívne počúva... 🟢
          </span>
        </div>
      )}
    </div>
  );
}