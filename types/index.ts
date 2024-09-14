export interface Horse {
  name: string;
  id: number;
  jockeySilk: string[];
  condition: number;
  color: string;
}

export interface RaceRun {
  horses: Horse[];
  length: number;
}
