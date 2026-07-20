import type { Scenario, ScenarioSnapshot } from "../types";

interface RawSnapshot {
  label: string;
  narrative: string;
  equityReturnPct: number;
  debtReturnPct: number;
}

interface RawScenario {
  id: string;
  name: string;
  description: string;
  peakToTroughPct: number;
  snapshots: RawSnapshot[];
}

const RAW_SCENARIOS: RawScenario[] = [
  {
    id: "2008-financial-crisis",
    name: "2008 Financial Crisis",
    description:
      "Live through the run-up to and collapse of the 2007-2009 financial crisis. Illustrative returns shaped after real events, not sourced market data.",
    peakToTroughPct: -57,
    snapshots: [
      {
        label: "Jun 2007 — Housing Boom Peaks",
        narrative:
          "Home prices are near all-time highs. Subprime mortgage lending is booming, and few investors expect trouble ahead.",
        equityReturnPct: 0,
        debtReturnPct: 0,
      },
      {
        label: "Aug 2007 — Credit Cracks Appear",
        narrative:
          "Two Bear Stearns hedge funds collapse and BNP Paribas freezes withdrawals, citing an inability to value subprime assets. Credit markets tighten.",
        equityReturnPct: -6,
        debtReturnPct: 1.2,
      },
      {
        label: "Mar 2008 — Bear Stearns Collapses",
        narrative:
          "Bear Stearns is sold to JPMorgan Chase in a fire sale brokered by the Fed to avert a bankruptcy. Markets wobble but hold.",
        equityReturnPct: -9,
        debtReturnPct: 1.5,
      },
      {
        label: "Sep 2008 — Lehman Brothers Falls",
        narrative:
          "Lehman Brothers files for the largest bankruptcy in US history. Credit markets freeze overnight and panic spreads globally.",
        equityReturnPct: -26,
        debtReturnPct: 3.5,
      },
      {
        label: "Nov 2008 — Global Panic Deepens",
        narrative:
          "Governments scramble to bail out banks worldwide. Unemployment climbs and consumer spending collapses.",
        equityReturnPct: -17,
        debtReturnPct: 1,
      },
      {
        label: "Mar 2009 — Markets Bottom Out",
        narrative: "Major indices hit their lowest point in over a decade. Investor sentiment is at rock bottom.",
        equityReturnPct: -8,
        debtReturnPct: 0.5,
      },
      {
        label: "Dec 2009 — Recovery Takes Hold",
        narrative:
          "Stimulus measures and central bank intervention stabilize the financial system. Markets begin a long climb back.",
        equityReturnPct: 23,
        debtReturnPct: 1,
      },
    ],
  },
  {
    id: "dotcom-bubble",
    name: "Dot-com Bubble Crash",
    description:
      "Ride the final euphoric run-up of the dot-com bubble and the brutal 2000-2002 crash that followed. Illustrative returns shaped after real events, not sourced market data.",
    peakToTroughPct: -78,
    snapshots: [
      {
        label: "Dec 1999 — Dot-com Mania",
        narrative:
          "Internet startups with no profits are going public at massive valuations. \"This time it's different,\" investors say.",
        equityReturnPct: 0,
        debtReturnPct: 0,
      },
      {
        label: "Mar 2000 — The Peak",
        narrative: "The Nasdaq hits an all-time high. Money keeps pouring into anything with \".com\" in the name.",
        equityReturnPct: 12,
        debtReturnPct: 0.5,
      },
      {
        label: "Apr 2000 — First Cracks",
        narrative: "The Nasdaq suffers its worst week ever as investors start questioning internet valuations.",
        equityReturnPct: -18,
        debtReturnPct: 1,
      },
      {
        label: "2001 — The Unwind Begins",
        narrative:
          "Dot-coms burn through cash with no path to profit. Layoffs sweep the tech sector as funding dries up.",
        equityReturnPct: -28,
        debtReturnPct: 2,
      },
      {
        label: "Sep 2001 — Shock and Recession",
        narrative: "9/11 rattles already-fragile markets. The US enters a recession as tech spending craters.",
        equityReturnPct: -20,
        debtReturnPct: 2.5,
      },
      {
        label: "2002 — Capitulation",
        narrative:
          "Accounting scandals at Enron and WorldCom shatter remaining investor confidence. The Nasdaq is down over 75% from its peak.",
        equityReturnPct: -22,
        debtReturnPct: 1.5,
      },
      {
        label: "2003 — A Fragile Bottom",
        narrative: "Survivors of the crash begin rebuilding. The market finds a bottom and cautious recovery begins.",
        equityReturnPct: 14,
        debtReturnPct: 1,
      },
    ],
  },
  {
    id: "covid-crash",
    name: "COVID-19 Crash & Recovery",
    description:
      "Navigate the fastest crash in market history and the sharp recovery that followed in 2020. Illustrative returns shaped after real events, not sourced market data.",
    peakToTroughPct: -34,
    snapshots: [
      {
        label: "Jan 2020 — Record Highs",
        narrative:
          "Markets are at all-time highs. A new virus is spreading in China, but few investors are concerned yet.",
        equityReturnPct: 0,
        debtReturnPct: 0,
      },
      {
        label: "Feb 2020 — Alarm Bells",
        narrative: "COVID-19 spreads beyond China. The WHO raises alarm as case counts climb globally.",
        equityReturnPct: -8,
        debtReturnPct: 1.5,
      },
      {
        label: "Mar 2020 — Fastest Crash in History",
        narrative:
          "Lockdowns shut down economies worldwide. Markets crash at the fastest pace in history as uncertainty peaks.",
        equityReturnPct: -25,
        debtReturnPct: 3,
      },
      {
        label: "Apr 2020 — Central Banks Step In",
        narrative: "Massive stimulus and near-zero interest rates from central banks calm panic-selling.",
        equityReturnPct: 13,
        debtReturnPct: 1,
      },
      {
        label: "Jun 2020 — An Uneasy Rally",
        narrative: "Markets rally despite ongoing economic uncertainty, driven by stimulus and low rates.",
        equityReturnPct: 8,
        debtReturnPct: 0.5,
      },
      {
        label: "Oct 2020 — Second Wave Fears",
        narrative: "A resurgence in cases raises fears of renewed lockdowns, injecting fresh volatility.",
        equityReturnPct: -5,
        debtReturnPct: 1,
      },
      {
        label: "Dec 2020 — Vaccine Rally",
        narrative: "Vaccine breakthroughs spark optimism. Markets close the year at fresh highs.",
        equityReturnPct: 14,
        debtReturnPct: 0.5,
      },
    ],
  },
];

function buildScenario(raw: RawScenario): Scenario {
  let equityIndex = 100;
  let debtIndex = 100;

  const snapshots: ScenarioSnapshot[] = raw.snapshots.map((s, index) => {
    equityIndex = Math.round(equityIndex * (1 + s.equityReturnPct / 100) * 100) / 100;
    debtIndex = Math.round(debtIndex * (1 + s.debtReturnPct / 100) * 100) / 100;
    return {
      index,
      label: s.label,
      narrative: s.narrative,
      equityReturnPct: s.equityReturnPct,
      debtReturnPct: s.debtReturnPct,
      equityIndex,
      debtIndex,
    };
  });

  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    peakToTroughPct: raw.peakToTroughPct,
    snapshots,
  };
}

export const scenarios: Scenario[] = RAW_SCENARIOS.map(buildScenario);
