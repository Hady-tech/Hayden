
import React from 'react';
import { MicIcon, StopCircleIcon, SparklesIcon, LoadingIcon } from './Icons';

interface ControlPanelProps {
  isListening: boolean;
  isTranscriptEmpty: boolean;
  onStart: () => void;
  onStop: () => void;
  onSummarize: () => void;
  isSummarizing: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isListening,
  isTranscriptEmpty,
  onStart,
  onStop,
  onSummarize,
  isSummarizing,
}) => {
  return (
    <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      {!isListening ? (
        <button
          onClick={onStart}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800 transition-all duration-200"
        >
          <MicIcon className="w-5 h-5" />
          Start Listening
        </button>
      ) : (
        <button
          onClick={onStop}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-800 transition-all duration-200 animate-pulse"
        >
          <StopCircleIcon className="w-5 h-5" />
          Stop Listening
        </button>
      )}

      <button
        onClick={onSummarize}
        disabled={isTranscriptEmpty || isSummarizing || isListening}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSummarizing ? (
          <>
            <LoadingIcon className="w-5 h-5 animate-spin" />
            Summarizing...
          </>
        ) : (
          <>
            <SparklesIcon className="w-5 h-5" />
            Summarize Transcript
          </>
        )}
      </button>
    </div>
  );
};

export default ControlPanel;
