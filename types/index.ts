export interface Horse {
  name: string;
  id: number;
  jockeySilk: string[];
  condition: number;
  color: {
    label: string;
    value: string;
  };
}

export interface RaceRun {
  horses: Horse[];
  length: number;
}

export interface RaceResult {
  animationSpeed: number;
  horse: Horse;
  performance: number;
}
