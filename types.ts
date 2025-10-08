
export interface TranscriptLine {
  text: string;
  timestamp: string;
  isFinal: boolean;
}

export interface SummaryData {
  summary: string[];
  key_terms: string[];
  action_items: string[];
}
