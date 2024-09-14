export interface Horse {
  name: string;
  id: number;
  color: string[];
  condition: number;
}

export interface RaceRun {
  horses: Horse[];
  length: number;
}
