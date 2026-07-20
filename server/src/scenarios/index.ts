import type { Scenario } from "../types";
import financialCrisis2008 from "./2008-financial-crisis.json";
import dotcomBubble from "./dotcom-bubble.json";
import covidCrash from "./covid-crash.json";

export const scenarios: Scenario[] = [
  financialCrisis2008 as Scenario,
  dotcomBubble as Scenario,
  covidCrash as Scenario,
];

export function getScenario(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id);
}

export function listScenarios(): Pick<Scenario, "id" | "name" | "description" | "peakToTroughPct">[] {
  return scenarios.map(({ id, name, description, peakToTroughPct }) => ({
    id,
    name,
    description,
    peakToTroughPct,
  }));
}
