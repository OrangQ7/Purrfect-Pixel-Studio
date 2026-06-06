export const TEMPLATE_WIDTH = 21;
export const TEMPLATE_HEIGHT = 18;

export type CellRegion =
  | "BG"
  | "OL"
  | "LE"
  | "RE"
  | "FH"
  | "LOF"
  | "LIF"
  | "FC"
  | "RIF"
  | "ROF"
  | "NU"
  | "CH"
  | "BU"
  | "BM"
  | "BE"
  | "BD"
  | "LL"
  | "RL"
  | "LP"
  | "RP"
  | "TB"
  | "TM"
  | "TT";

export type TemplateCell = {
  row: number;
  col: number;
  region: CellRegion;
};

export const CELL_REGION_MAP: CellRegion[][] = [
  ["BG","BG","BG","BG","OL","OL","BG","BG","BG","BG","BG","OL","OL","BG","BG","BG","BG","BG","BG","BG","BG"],
  ["BG","BG","BG","OL","LE","LE","OL","OL","BG","OL","OL","RE","RE","OL","BG","BG","BG","BG","BG","BG","BG"],
  ["BG","BG","OL","LE","LE","FH","FH","OL","OL","OL","FH","FH","RE","RE","OL","BG","BG","BG","BG","BG","BG"],
  ["BG","BG","OL","LOF","LOF","LIF","FH","FH","FH","FH","FH","RIF","ROF","ROF","OL","BG","BG","BG","BG","BG","BG"],
  ["BG","OL","LOF","LOF","LOF","LIF","LIF","FC","FC","FC","RIF","RIF","ROF","ROF","ROF","OL","BG","BG","BG","BG","BG"],
  ["OL","OL","OL","LOF","LOF","LIF","LIF","FC","FC","FC","RIF","RIF","ROF","ROF","OL","OL","OL","BG","BG","BG","BG"],
  ["BG","OL","LOF","LOF","LOF","LIF","LIF","FC","FC","FC","RIF","RIF","ROF","ROF","ROF","OL","BG","BG","BG","BG","BG"],
  ["OL","BU","BU","BU","BU","NU","NU","NU","NU","NU","NU","NU","BU","BU","BU","BU","OL","BG","BG","BG","BG"],
  ["OL","OL","BU","BU","BU","CH","CH","CH","CH","CH","CH","CH","BU","BU","BU","OL","OL","BG","BG","BG","BG"],
  ["BG","BG","OL","BU","BU","CH","CH","CH","CH","CH","CH","CH","BU","BU","OL","BG","BG","BG","BG","BG","BG"],
  ["BG","OL","LL","LL","LL","BM","BM","BM","BM","BM","BM","BM","RL","RL","RL","OL","BG","BG","OL","OL","BG"],
  ["BG","OL","LL","LL","LL","BM","BM","BM","BM","BM","BM","BM","RL","RL","RL","OL","BG","OL","TB","TM","OL"],
  ["BG","OL","LL","LL","LL","BE","BE","BE","BE","BE","BE","BE","RL","RL","RL","OL","OL","TB","TM","TT","OL"],
  ["BG","OL","LL","LL","BE","BE","BE","BE","BE","BE","OL","BE","BE","RL","RL","OL","TB","TM","TT","OL","BG"],
  ["BG","BG","OL","LP","LP","LP","LP","OL","BD","OL","BD","RP","RP","RP","OL","TM","TM","TT","TT","OL","BG"],
  ["BG","BG","OL","LP","LP","LP","LP","LP","OL","BD","BD","RP","RP","RP","OL","TT","TT","OL","OL","BG","BG"],
  ["BG","BG","BG","OL","LP","LP","LP","LP","OL","RP","RP","RP","RP","OL","TT","TT","OL","OL","BG","BG","BG"],
  ["BG","BG","BG","BG","OL","OL","OL","OL","OL","OL","OL","OL","OL","OL","OL","OL","BG","BG","BG","BG","BG"],
];

export function mapMatrixToCells(): TemplateCell[] {
  const cells: TemplateCell[] = [];

  for (let row = 0; row < CELL_REGION_MAP.length; row++) {
    for (let col = 0; col < CELL_REGION_MAP[row].length; col++) {
      cells.push({
        row: row + 1,
        col: col + 1,
        region: CELL_REGION_MAP[row][col],
      });
    }
  }

  return cells;
}

export const TEMPLATE_CELLS = mapMatrixToCells();
