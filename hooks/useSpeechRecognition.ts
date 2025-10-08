import { useState, useRef, useCallback, useEffect } from 'react';
import { TranscriptLine } from '../types';
import { formatTimestamp } from '../utils/formatter';

// Polyfill for browsers that might name it webkitSpeechRecognition
// FIX: Rename to SpeechRecognitionAPI to avoid shadowing the SpeechRecognition type and cast to any to fix property not existing error.
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // FIX: Use renamed constant.
    if (!SpeechRecognitionAPI) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    // FIX: Use renamed constant.
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // FIX: Use 'any' for event type as SpeechRecognitionEvent is not found.
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      const newTranscriptLines: TranscriptLine[] = [];

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
          newTranscriptLines.push({
            text: finalTranscript.trim(),
            timestamp: formatTimestamp(new Date()),
            isFinal: true
          });
          finalTranscript = '';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      setTranscript(prev => {
        const updatedTranscript = [...prev];
        const last = updatedTranscript[updatedTranscript.length - 1];
        
        // Add all new final results
        if (newTranscriptLines.length > 0) {
          // If the last item was interim, remove it before adding new final lines
          if (last && !last.isFinal) {
            updatedTranscript.pop();
          }
          updatedTranscript.push(...newTranscriptLines);
        }

        // Add or update the interim result
        if (interimTranscript.trim()) {
           const lastAgain = updatedTranscript[updatedTranscript.length -1];
           if (lastAgain && !lastAgain.isFinal) {
             updatedTranscript[updatedTranscript.length - 1] = {
               ...lastAgain,
               text: interimTranscript.trim()
             };
           } else {
            updatedTranscript.push({
                text: interimTranscript.trim(),
                timestamp: formatTimestamp(new Date()),
                isFinal: false
            });
           }
        }
        return updatedTranscript;
      });
    };

    // FIX: Use 'any' for event type as SpeechRecognitionErrorEvent is not found.
    recognition.onerror = (event: any) => {
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
            setError(`Error: ${event.error}. Please check your microphone and try again.`);
        } else {
            setError(`Speech recognition error: ${event.error}`);
        }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        setTranscript([]); // Clear previous transcript on start
        setError(null);
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Error starting speech recognition:", err);
        setError("Could not start speech recognition. It might be already active.");
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return { isListening, transcript, error, startListening, stopListening };
};
