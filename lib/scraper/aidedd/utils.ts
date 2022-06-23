import { evaluate } from "mathjs";
import { Damage, Distance, Range, SpellComponent, Weight } from "../../types";
import { ADDPriceScrap } from "./types";

export const RE_PRICE = /^[0-9]+ [gsc]p$/;
export const RE_DAMAGE =
  /^(?<formula>[0-9]+(d[0-9]+)?) (?<type>bludgeoning|piercing|slashing)$/;
export const RE_WEIGHT =
  /^(?<value>[0-9]+(,[0-9]+|\/[0-9]+)?) (?<unit>(lb\.|kg|g))$/;
const RE_DISTANCE = /^(?<distance>[0-9]+) (?<unit>(feet|mètres))$/;
const RE_COMPONENTS =
  /^(?<components>([VSM], ){0,2}[VSM])( \((?<materials>[^\(\)]+)\))?$/;
const RE_CASTING_TIME =
  /^(?<concentration>[Cc]oncentration, )?(up to |jusqu'à )?(?<value>[0-9]+) (?<unit>(action|hours?|heures?|minutes?|r[eé]action|round))(?<condition>,.+)?$/;
const RE_SCHOOL =
  /^level (?<level>[0-9]+) - (?<school>[a-z]+)(?<ritual> \(ritual\))?$/;
export const KG_LB_RATIO = 2;
export const METER_FOOT_RATIO = 1.5;
export const FOOT_MILE_RATIO = 0.000189394;

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

export function parseDuration(str: string) {
  if (str === "Instantaneous" || str === "instantanée") {
    return {
      value: 0,
      unit: "none",
      label: str.toLowerCase(),
      concentration: false,
    };
  }

  const match = str.match(RE_CASTING_TIME);

  if (!match || !match.groups?.value || !match.groups?.unit) {
    throw new Error(`Invalid duration format "${str}"`);
  }

  return {
    value: parseFloat(match.groups.value),
    unit: match.groups.unit.replace(/s$/, ""),
    label: str,
    condition: match.groups.condition,
    concentration: !!match.groups.concentration,
  };
}

export function parseDistance(str: string): Distance {
  const match = str.match(RE_DISTANCE);

  if (!match || !match.groups?.distance || !match.groups?.unit) {
    throw new Error(`Invalid distance format "${str}"`);
  }

  const value = parseFloat(match.groups.distance);

  switch (match.groups.unit) {
    case "feet":
      return {
        feet: value,
        meters: value / METER_FOOT_RATIO,
      };
    case "mètres":
      return {
        feet: value * METER_FOOT_RATIO,
        meters: value,
      };
    default:
      throw new Error(`Unknown unit "${match.groups.unit}"`);
  }
}

export function parseRange(str: string): Range {
  const lower = str.toLowerCase();

  if (lower === "self" || lower === "personnelle") {
    return { type: "self" };
  }

  return {
    type: "ranged",
    distance: parseDistance(str),
  };
}

export function isComponent(str: string): str is SpellComponent {
  return ["V", "S", "M"].includes(str);
}

export function parseComponents(str: string): {
  components: SpellComponent[];
  materials?: string;
} {
  const match = str.match(RE_COMPONENTS);

  if (!match || !match.groups?.components || !match.groups?.materials) {
    throw new Error(`Invalid components format "${str}"`);
  }

  const components: SpellComponent[] = match.groups.components
    .split(",")
    .map((cmp) => cmp.trim())
    .filter((cmp) => isComponent(cmp)) as SpellComponent[];

  return {
    components,
    materials: match.groups.materials,
  };
}

export function parseSchool(str: string): {
  level: number;
  school: string;
  ritual: boolean;
} {
  const match = str.match(RE_SCHOOL);

  if (!match || !match.groups?.level?.length || !match.groups?.school) {
    throw new Error(`Invalid school format "${str}"`);
  }

  return {
    level: parseFloat(match.groups.level),
    school: match.groups.school,
    ritual: !!match.groups.ritual,
  };
}

export function parseSourceId(str: string) {
  switch (str.toLocaleLowerCase()) {
    case "player´s handbook (srd)":
      return "srd";
    case "xanathar´s guide to everything":
      return "xtge";
    default:
      throw new Error(`Unknow source "${str}"`);
  }
}
