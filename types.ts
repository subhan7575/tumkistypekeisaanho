
export type Language = 'en' | 'hi';

export interface PersonalityResult {
  id: string;
  title: string;
  description: string;
  reportDescription: string;
  darkLine: string; 
  color: string;
  shareHook: string;
  traits: string[];
  weaknesses: string[]; // Added to show "flaws" as requested
}

export enum AppState {
  INITIAL = 'INITIAL',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}
