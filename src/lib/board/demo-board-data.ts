export const BOARD_FIELD_WIDTHS = {
  date: 6,
  name: 34,
  start: 5,
  end: 5,
  status: 13,
} as const;

export const DEMO_ROW_COUNT = 6;

export type UserTone = "default" | "amber" | "sky" | "mint" | "coral";

export type BoardRowData = {
  id: string;
  date: string;
  name: string;
  start: string;
  end: string;
  status: string;
  tone: UserTone;
};

export type BoardSnapshot = {
  rows: BoardRowData[];
};

export function createEmptyRow(slot: number): BoardRowData {
  return {
    id: `empty-${slot}`,
    date: "",
    name: "",
    start: "",
    end: "",
    status: "",
    tone: "default",
  };
}

export function padBoardRows(rows: BoardRowData[]) {
  return Array.from({ length: DEMO_ROW_COUNT }, (_, index) => rows[index] ?? createEmptyRow(index));
}

export const demoSnapshots: BoardSnapshot[] = [
  {
    rows: [
      {
        id: "soccer",
        date: "MAR 28",
        name: "KAI SOCCER AT RIVER PARK",
        start: "09:30",
        end: "11:00",
        status: "STARTING SOON",
        tone: "sky",
      },
      {
        id: "market",
        date: "MAR 28",
        name: "FARMERS MARKET DOWNTOWN",
        start: "11:30",
        end: "12:15",
        status: "",
        tone: "amber",
      },
      {
        id: "brunch",
        date: "MAR 28",
        name: "BRUNCH WITH ANA AT LINDEN",
        start: "12:30",
        end: "02:00",
        status: "",
        tone: "coral",
      },
      {
        id: "library",
        date: "MAR 28",
        name: "LIBRARY RUN EAST SIDE",
        start: "02:30",
        end: "03:15",
        status: "",
        tone: "mint",
      },
      {
        id: "dinner",
        date: "MAR 28",
        name: "DINNER PREP AT HOME",
        start: "05:30",
        end: "06:20",
        status: "",
        tone: "amber",
      },
      {
        id: "movie",
        date: "MAR 28",
        name: "MOVIE NIGHT IN LIVING ROOM",
        start: "07:30",
        end: "09:00",
        status: "",
        tone: "coral",
      },
    ],
  },
  {
    rows: [
      {
        id: "soccer",
        date: "MAR 28",
        name: "KAI SOCCER AT RIVER PARK",
        start: "09:30",
        end: "11:00",
        status: "IN PROGRESS",
        tone: "sky",
      },
      {
        id: "market",
        date: "MAR 28",
        name: "FARMERS MARKET DOWNTOWN",
        start: "11:30",
        end: "12:15",
        status: "STARTING SOON",
        tone: "amber",
      },
      {
        id: "brunch",
        date: "MAR 28",
        name: "BRUNCH WITH ANA AT LINDEN",
        start: "12:30",
        end: "02:00",
        status: "",
        tone: "coral",
      },
      {
        id: "library",
        date: "MAR 28",
        name: "LIBRARY RUN EAST SIDE",
        start: "02:30",
        end: "03:15",
        status: "",
        tone: "mint",
      },
      {
        id: "dinner",
        date: "MAR 28",
        name: "DINNER PREP AT HOME",
        start: "05:30",
        end: "06:20",
        status: "",
        tone: "amber",
      },
      {
        id: "movie",
        date: "MAR 28",
        name: "MOVIE NIGHT IN LIVING ROOM",
        start: "07:30",
        end: "09:00",
        status: "",
        tone: "coral",
      },
    ],
  },
  {
    rows: [
      {
        id: "market",
        date: "MAR 28",
        name: "FARMERS MARKET DOWNTOWN",
        start: "11:30",
        end: "12:15",
        status: "IN PROGRESS",
        tone: "amber",
      },
      {
        id: "brunch",
        date: "MAR 28",
        name: "BRUNCH WITH ANA AT LINDEN",
        start: "12:30",
        end: "02:00",
        status: "STARTING SOON",
        tone: "coral",
      },
      {
        id: "library",
        date: "MAR 28",
        name: "LIBRARY RUN EAST SIDE",
        start: "02:30",
        end: "03:15",
        status: "",
        tone: "mint",
      },
      {
        id: "dinner",
        date: "MAR 28",
        name: "DINNER PREP AT HOME",
        start: "05:30",
        end: "06:20",
        status: "",
        tone: "amber",
      },
      {
        id: "movie",
        date: "MAR 28",
        name: "MOVIE NIGHT IN LIVING ROOM",
        start: "07:30",
        end: "09:00",
        status: "",
        tone: "coral",
      },
      {
        id: "airport",
        date: "MAR 29",
        name: "AIRPORT RUN TERMINAL B",
        start: "08:00",
        end: "09:10",
        status: "",
        tone: "sky",
      },
    ],
  },
];
