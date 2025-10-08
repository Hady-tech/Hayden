
import React, { useRef, useEffect } from 'react';
import { TranscriptLine } from '../types';

interface TranscriptDisplayProps {
  transcript: TranscriptLine[];
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ transcript }) => {
  const endOfTranscriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfTranscriptRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  return (
    <div className="flex-grow p-6 overflow-y-auto bg-gray-900/50 m-2 rounded-lg">
      {transcript.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>Press "Start Listening" to begin transcription...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transcript.map((line, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="font-mono text-sm text-indigo-400 mt-1 whitespace-nowrap">{line.timestamp}</span>
              <p className={`leading-relaxed ${line.isFinal ? 'text-gray-100 font-medium' : 'text-gray-400 italic'}`}>
                {line.text}
              </p>
            </div>
          ))}
          <div ref={endOfTranscriptRef} />
        </div>
      )}
    </div>
  );
};

export default TranscriptDisplay;
