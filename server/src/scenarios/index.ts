import type { Scenario } from "../types";
import { scenarios } from "./data";

export { scenarios };

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
