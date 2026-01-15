
export type Language = 'en' | 'hi';

export interface PersonalityResult {
  id: string;
  title: string;
  description: string;
  reportDescription: string; // New field for formal "Report" style text
  darkLine: string;
  color: string;
  shareHook: string;
  traits?: string[];
  compatibility?: string;
}

export enum AppState {
  INITIAL = 'INITIAL',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}
