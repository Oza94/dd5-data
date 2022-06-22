import { evaluate } from "mathjs";
import { Damage, Weight } from "../../types";
import { ADDPriceScrap } from "./types";

export const RE_PRICE = /^[0-9]+ [gsc]p$/;
export const RE_DAMAGE =
  /^(?<formula>[0-9]+(d[0-9]+)?) (?<type>bludgeoning|piercing|slashing)$/;
export const RE_WEIGHT =
  /^(?<value>[0-9]+(,[0-9]+|\/[0-9]+)?) (?<unit>(lb\.|kg|g))$/;
export const KG_LB_RATIO = 2;

export function parsePrice(str: ADDPriceScrap) {
  if (!RE_PRICE.test(str)) {
    throw new Error(`Invalid price format "${str}"`);
  }

  const [value, unit] = str.split(" ");

  if (!value || !unit) {
    throw new Error(`Can't parse invalid price "${str}"`);
  }

  const parsed = parseFloat(value);

  switch (unit) {
    case "cp":
      return parsed * 0.01;
    case "sp":
      return parsed * 0.1;
    default:
      return parsed * 1;
  }
}

export function parseDamage(str: string): Damage {
  const match = str.match(RE_DAMAGE);

  if (!match || !match.groups?.type || !match.groups?.formula) {
    throw new Error(`Invalid damage format "${str}"`);
  }

  return { formula: match.groups.formula, type: match.groups.type };
}

export function parseWeight(str: string): Weight {
  const match = str.match(RE_WEIGHT);

  if (!match || !match.groups?.value || !match.groups?.unit) {
    throw new Error(`Invalid weight format "${str}"`);
  }

  // We may have stuff like "1/4 lb." that requires something more robust than parseFloat
  const parsed: number = evaluate(match.groups.value.replace(",", "."));
  let kg = 0;
  let lb = 0;

  switch (match.groups.unit) {
    case "kg": {
      kg = parsed;
      lb = parsed * KG_LB_RATIO;
      break;
    }
    case "g": {
      kg = parsed * 0.001;
      lb = kg * KG_LB_RATIO;
      break;
    }
    case "lb.": {
      kg = parsed / KG_LB_RATIO;
      lb = parsed;
      break;
    }
    default:
      throw new Error(`Invalid weight unit "${match.groups.unit}"`);
  }

  return { kg, lb };
}
