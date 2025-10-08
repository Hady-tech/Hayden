
import { TranscriptLine, SummaryData } from '../types';

export const formatTimestamp = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `[${hours}:${minutes}:${seconds}]`;
};

export const transcriptToPlainText = (transcript: TranscriptLine[]): string => {
  return transcript
    .filter(line => line.isFinal)
    .map(line => line.text)
    .join(' ');
};

interface MarkdownData {
  transcript: TranscriptLine[];
  summary: SummaryData | null;
  title?: string;
}

export const generateMarkdown = ({
  transcript,
  summary,
  title,
}: MarkdownData): string => {
  const today = new Date().toISOString().split('T')[0];
  let md = `# ${title || `Lecture Notes – ${today}`}\n\n`;

  if (summary) {
    md += '## Summary\n';
    summary.summary.forEach(item => {
      md += `- ${item}\n`;
    });
    md += '\n';

    md += '## Key Terms & Definitions\n';
    summary.key_terms.forEach(item => {
      md += `- ${item}\n`;
    });
    md += '\n';

    md += '## Action Items\n';
    summary.action_items.forEach(item => {
      md += `- ${item}\n`;
    });
    md += '\n';
  }

  md += '## Full Transcript\n';
  transcript
    .filter(line => line.isFinal)
    .forEach(line => {
      md += `${line.timestamp} ${line.text}\n`;
    });

  return md;
};
