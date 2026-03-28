import { useRef, useState } from 'react';

export function useVoiceInput() {
  const [listening, setListening]     = useState(false);
  const [transcript, setTranscript]   = useState('');
  const [analyserNode, setAnalyserNode] = useState(null);

  const recRef         = useRef(null);
  const streamRef      = useRef(null);
  const audioCtxRef    = useRef(null);
  const transcriptRef  = useRef('');
  const listeningRef   = useRef(false);
  const onAutoMatchRef = useRef(null);

  const supported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const start = async (onAutoMatch) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return false;

    onAutoMatchRef.current = onAutoMatch ?? null;

    // Set listening immediately so the modal appears without waiting for getUserMedia
    listeningRef.current  = true;
    transcriptRef.current = '';
    setListening(true);
    setTranscript('');

    // Start speech recognition synchronously
    const rec = new SR();
    rec.continuous      = true;
    rec.interimResults  = true;
    rec.lang            = 'en-US';
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      let interim = '';
      let final   = '';
      for (const result of Array.from(e.results)) {
        if (result.isFinal) final   += result[0].transcript + ' ';
        else                interim += result[0].transcript;
      }
      const full = (final + interim).trim();
      transcriptRef.current = full;
      setTranscript(full);

      if (final.trim() && onAutoMatchRef.current) {
        onAutoMatchRef.current(final.trim());
      }
    };

    rec.onerror = (e) => { if (e.error !== 'aborted') console.warn('SR error:', e.error); };

    rec.onend = () => {
      if (listeningRef.current && recRef.current === rec) {
        try { rec.start(); } catch (_) {}
      }
    };

    rec.start();
    recRef.current = rec;

    // Set up waveform asynchronously — modal already visible with idle animation
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!listeningRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return true;
      }
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      audioCtx.createMediaStreamSource(stream).connect(analyser);
      streamRef.current   = stream;
      audioCtxRef.current = audioCtx;
      setAnalyserNode(analyser);
    } catch (err) {
      console.warn('Waveform setup failed (mic denied?):', err);
      // Voice recognition still works, just no waveform
    }

    return true;
  };

  const stop = () => {
    listeningRef.current  = false;
    const final = transcriptRef.current.trim();

    if (recRef.current) {
      recRef.current.onend    = null;
      recRef.current.onresult = null;
      try { recRef.current.stop(); } catch (_) {}
      recRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }

    setListening(false);
    setTranscript('');
    setAnalyserNode(null);
    transcriptRef.current = '';
    onAutoMatchRef.current = null;

    return final;
  };

  return { listening, transcript, analyserNode, supported, start, stop };
}
