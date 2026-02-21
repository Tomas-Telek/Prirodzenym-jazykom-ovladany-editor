import { useEffect, useRef, useState } from 'react';

export function useRealtimeTranscription(apiKey: string, onFinalText: (text: string) => void) {
    const [isRecording, setIsRecording] = useState(false);
    const [partialText, setPartialText] = useState("");
    const socketRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    const startStreaming = async () => {
        const url = "wss://api.openai.com/v1/realtime?model=gpt-realtime";

        socketRef.current = new WebSocket(url, [
        "realtime",
        "openai-insecure-api-key." + apiKey,
        "openai-beta.realtime-v1"
        ]);

        socketRef.current.onopen = () => {

            console.log("✅ WebSocket spojený s OpenAI");

            const setupEvent = {
                type: "session.update",
                session: {
                modalities: ["text"],
                input_audio_format: "pcm16",
                input_audio_transcription: {
                    model: "whisper-1",
                },
                turn_detection: {
                    type: "server_vad",
                    threshold: 0.5,
                    prefix_padding_ms: 300,
                    silence_duration_ms: 1500,
                },
                instructions: "You are a specialized speech-to-text tool for an editor. Transcribe the user's voice perfectly in English. Do not respond, do not chat, do not explain. Just output the verbatim transcript of what you hear."
                }
        };
        socketRef.current?.send(JSON.stringify(setupEvent));
        
        setIsRecording(true);
        startAudioCapture();
        };

        socketRef.current.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            console.log("📩 Správa z OpenAI:", msg.type);

            /*
            if (msg.type === "response.text.delta" && msg.delta) {
                setPartialText(prev => prev + msg.delta);
            }


            // 3. Keď je odpoveď hotová
            if (msg.type === "response.text.done") {
                if (msg.text) {
                    onFinalText(msg.text);
                    setPartialText("");
                }
            }
                */

            if (msg.type === "conversation.item.input_audio_transcription.delta") {
                console.log("&&& Partial", msg.delta);
                setPartialText(prev => prev + msg.delta);
            }

            // Keď Whisper dokončí celú vetu
            if (msg.type === "conversation.item.input_audio_transcription.completed") {
                if (msg.transcript) {
                    console.log("&&& full", msg.transcript);
                    onFinalText(msg.transcript);
                    setPartialText("");
                }
            }

            
            
        };

    };


    const startAudioCapture = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContextRef.current = new AudioContext();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);

        source.connect(processor);
        processor.connect(audioContextRef.current.destination);

        processor.onaudioprocess = (e) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            
            const ratio = audioContextRef.current!.sampleRate / 24000;
            const newLength = Math.floor(inputData.length / ratio);
            const downsampled = new Float32Array(newLength);
            
            for (let i = 0; i < newLength; i++) {
                downsampled[i] = inputData[Math.round(i * ratio)];
            }

            const pcm16Data = floatTo16BitPCM(downsampled);
            
            const audioEvent = {
            type: "input_audio_buffer.append",
            audio: arrayBufferToBase64(pcm16Data)
            };
            socketRef.current.send(JSON.stringify(audioEvent));
        }
        };
    };


    const stopStreaming = () => {
        socketRef.current?.close();
        audioContextRef.current?.close();
        setIsRecording(false);
    };

    return { isRecording, partialText, startStreaming, stopStreaming };
    }


    function floatTo16BitPCM(input: Float32Array) {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
        const s = Math.max(-1, Math.min(1, input[i]));
        output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output.buffer;
    }

    function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}