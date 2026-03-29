export const BOARD_FIELD_WIDTHS = {
  date: 6,
  name: 18,
  location: 10,
  start: 5,
  end: 5,
  status: 12,
} as const;

export type UserTone = "amber" | "sky" | "mint" | "coral";

export type BoardRowData = {
  id: string;
  date: string;
  name: string;
  location: string;
  start: string;
  end: string;
  status: string;
  tone: UserTone;
};

export type BoardSnapshot = {
  clockLabel: string;
  rows: BoardRowData[];
  stationLabel: string;
  stationTitle: string;
};

export const demoSnapshots: BoardSnapshot[] = [
  {
    stationLabel: "Kitchen Terminal",
    stationTitle: "Family Schedule",
    clockLabel: "09:12 AM",
    rows: [
      {
        id: "soccer",
        date: "MAR 28",
        name: "KAI SOCCER",
        location: "RIVER PK",
        start: "09:30",
        end: "11:00",
        status: "STARTING SOON",
        tone: "sky",
      },
      {
        id: "market",
        date: "MAR 28",
        name: "FARMERS MKT",
        location: "DOWNTOWN",
        start: "11:30",
        end: "12:15",
        status: "",
        tone: "amber",
      },
      {
        id: "brunch",
        date: "MAR 28",
        name: "BRUNCH W ANA",
        location: "LINDEN",
        start: "12:30",
        end: "02:00",
        status: "",
        tone: "coral",
      },
      {
        id: "library",
        date: "MAR 28",
        name: "LIBRARY RUN",
        location: "EAST SIDE",
        start: "02:30",
        end: "03:15",
        status: "",
        tone: "mint",
      },
      {
        id: "dinner",
        date: "MAR 28",
        name: "DINNER PREP",
        location: "HOME",
        start: "05:30",
        end: "06:20",
        status: "",
        tone: "amber",
      },
      {
        id: "movie",
        date: "MAR 28",
        name: "MOVIE NIGHT",
        location: "LIVING RM",
        start: "07:30",
        end: "09:00",
        status: "",
        tone: "coral",
      },
    ],
  },
  {
    stationLabel: "Kitchen Terminal",
    stationTitle: "Family Schedule",
    clockLabel: "09:47 AM",
    rows: [
      {
        id: "soccer",
        date: "MAR 28",
        name: "KAI SOCCER",
        location: "RIVER PK",
        start: "09:30",
        end: "11:00",
        status: "IN PROGRESS",
        tone: "sky",
      },
      {
        id: "market",
        date: "MAR 28",
        name: "FARMERS MKT",
        location: "DOWNTOWN",
        start: "11:30",
        end: "12:15",
        status: "STARTING SOON",
        tone: "amber",
      },
      {
        id: "brunch",
        date: "MAR 28",
        name: "BRUNCH W ANA",
        location: "LINDEN",
        start: "12:30",
        end: "02:00",
        status: "",
        tone: "coral",
      },
      {
        id: "library",
        date: "MAR 28",
        name: "LIBRARY RUN",
        location: "EAST SIDE",
        start: "02:30",
        end: "03:15",
        status: "",
        tone: "mint",
      },
      {
        id: "dinner",
        date: "MAR 28",
        name: "DINNER PREP",
        location: "HOME",
        start: "05:30",
        end: "06:20",
        status: "",
        tone: "amber",
      },
      {
        id: "movie",
        date: "MAR 28",
        name: "MOVIE NIGHT",
        location: "LIVING RM",
        start: "07:30",
        end: "09:00",
        status: "",
        tone: "coral",
      },
    ],
  },
  {
    stationLabel: "Kitchen Terminal",
    stationTitle: "Family Schedule",
    clockLabel: "11:48 AM",
    rows: [
      {
        id: "market",
        date: "MAR 28",
        name: "FARMERS MKT",
        location: "DOWNTOWN",
        start: "11:30",
        end: "12:15",
        status: "IN PROGRESS",
        tone: "amber",
      },
      {
        id: "brunch",
        date: "MAR 28",
        name: "BRUNCH W ANA",
        location: "LINDEN",
        start: "12:30",
        end: "02:00",
        status: "STARTING SOON",
        tone: "coral",
      },
      {
        id: "library",
        date: "MAR 28",
        name: "LIBRARY RUN",
        location: "EAST SIDE",
        start: "02:30",
        end: "03:15",
        status: "",
        tone: "mint",
      },
      {
        id: "dinner",
        date: "MAR 28",
        name: "DINNER PREP",
        location: "HOME",
        start: "05:30",
        end: "06:20",
        status: "",
        tone: "amber",
      },
      {
        id: "movie",
        date: "MAR 28",
        name: "MOVIE NIGHT",
        location: "LIVING RM",
        start: "07:30",
        end: "09:00",
        status: "",
        tone: "coral",
      },
      {
        id: "airport",
        date: "MAR 29",
        name: "AIRPORT RUN",
        location: "TERMINAL B",
        start: "08:00",
        end: "09:10",
        status: "",
        tone: "sky",
      },
    ],
  },
];
