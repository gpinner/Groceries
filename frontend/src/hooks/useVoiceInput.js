import { useRef, useState } from 'react';

export function useVoiceInput() {
  const [listening, setListening]   = useState(false);
  const [interim, setInterim]       = useState('');
  const [supported] = useState(
    () => !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );

  const recognitionRef  = useRef(null);
  const transcriptRef   = useRef('');

  const start = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.continuous      = true;
    rec.interimResults  = true;
    rec.lang            = 'en-US';

    rec.onresult = (e) => {
      const text = Array.from(e.results)
        .map(r => r[0].transcript)
        .join('');
      transcriptRef.current = text;
      setInterim(text);
    };

    rec.onerror = () => {
      setListening(false);
      setInterim('');
      transcriptRef.current = '';
    };

    // Keep alive if browser stops it mid-recording
    rec.onend = () => {
      if (recognitionRef.current === rec) {
        setListening(false);
      }
    };

    rec.start();
    recognitionRef.current = rec;
    transcriptRef.current  = '';
    setInterim('');
    setListening(true);
  };

  // Returns the final transcript so caller can act on it
  const stop = () => {
    const final = transcriptRef.current.trim();
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onend    = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    transcriptRef.current = '';
    setListening(false);
    setInterim('');
    return final;
  };

  return { listening, interim, supported, start, stop };
}
