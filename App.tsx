
import React, { useState, useCallback, useMemo } from 'react';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { summarizeTranscript, translateTranscript } from './services/geminiService';
import { SummaryData, TranscriptLine } from './types';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import TranscriptDisplay from './components/TranscriptDisplay';
import SummaryDisplay from './components/SummaryDisplay';
import ExportPanel from './components/ExportPanel';
import { transcriptToPlainText, formatTimestamp } from './utils/formatter';

const App: React.FC = () => {
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    error: speechError,
  } = useSpeechRecognition();

  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const plainTranscript = useMemo(() => transcriptToPlainText(transcript), [transcript]);

  const handleSummarize = useCallback(async () => {
    if (!plainTranscript || isSummarizing) return;
    setIsSummarizing(true);
    setGeminiError(null);
    setSummary(null);
    try {
      const result = await summarizeTranscript(plainTranscript);
      setSummary(result);
    } catch (e) {
      console.error(e);
      setGeminiError('Failed to generate summary. Please check your API key and try again.');
    } finally {
      setIsSummarizing(false);
    }
  }, [plainTranscript, isSummarizing]);
  
  const handleTranslate = useCallback(async (language: string) => {
    if (!plainTranscript || isTranslating) return;
    setIsTranslating(true);
    setGeminiError(null);
    setTranslatedText(null);
    try {
      const result = await translateTranscript(plainTranscript, language);
      setTranslatedText(result);
    } catch (e) {
      console.error(e);
      setGeminiError(`Failed to translate to ${language}. Please check your API key and try again.`);
    } finally {
      setIsTranslating(false);
    }
  }, [plainTranscript, isTranslating]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Transcription */}
        <div className="flex flex-col bg-gray-800/50 rounded-2xl shadow-lg ring-1 ring-white/10">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">Live Transcription</h2>
            <p className="text-gray-400 mt-1">Capture your lecture in real-time.</p>
          </div>
          <ControlPanel
            isListening={isListening}
            isTranscriptEmpty={transcript.length === 0}
            onStart={startListening}
            onStop={stopListening}
            onSummarize={handleSummarize}
            isSummarizing={isSummarizing}
          />
          {speechError && <div className="p-4 mx-6 mb-4 text-center text-red-400 bg-red-900/50 rounded-lg">{speechError}</div>}
          <TranscriptDisplay transcript={transcript} />
        </div>

        {/* Right Column: Analysis & Export */}
        <div className="flex flex-col bg-gray-800/50 rounded-2xl shadow-lg ring-1 ring-white/10">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">AI Analysis & Notes</h2>
            <p className="text-gray-400 mt-1">Generate summaries and export your notes.</p>
          </div>
          <div className="flex-grow p-6 overflow-y-auto">
             {geminiError && <div className="p-4 mb-4 text-center text-red-400 bg-red-900/50 rounded-lg">{geminiError}</div>}
            <SummaryDisplay summary={summary} isLoading={isSummarizing} />
            <div className="mt-8">
               <ExportPanel
                transcript={transcript}
                summary={summary}
                onTranslate={handleTranslate}
                isTranslating={isTranslating}
                translatedText={translatedText}
               />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
