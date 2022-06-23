import { evaluate } from "mathjs";
import {
  Shape,
  Damage,
  Distance,
  Range,
  SpellComponent,
  Weight,
  Sphere,
  Circle,
  Cone,
  Line,
  Cube,
} from "../../types";
import { ADDPriceScrap } from "./types";

export const RE_PRICE = /^[0-9]+ [gsc]p$/;
export const RE_DAMAGE =
  /^(?<formula>[0-9]+(d[0-9]+)?) (?<type>bludgeoning|piercing|slashing)$/;
export const RE_WEIGHT =
  /^(?<value>[0-9]+(,[0-9]+|\/[0-9]+)?) (?<unit>(lb\.|kg|g))$/;
const RE_DISTANCE =
  /^(?<distance>[0-9]+(,[0-9]+)?) (?<unit>(feet|foot|mètres?|miles?|kilomètres?))$/;
const RE_RANGE =
  /^(?<type>personnelle|self|touch|contact|special|spéciale|sight|champ de vision|illimitée|unlimited)?((?<rangeValue>[0-9]+(,[0-9]+)?) (?<rangeUnit>[a-zè]+))?( \(((?<aoeValue1>[0-9]+)\-(?<aoeUnit1>(foot|mile))(-radius)? (?<aoeShape1>([a-z]+))|((?<aoeShape2>[a-zèéôê]+) de (?<aoeValue2>[0-9]+(,[0-9]+)?) (?<aoeUnit2>[a-zèê]+)( (de rayon|d'arête))?))\))?$/;
const RE_COMPONENTS =
  /^(?<components>([VSM], ){0,2}[VSM])( \((?<materials>[^\(\)]+)\))?$/;
const RE_CASTING_TIME =
  /^(?<concentration>[Cc]oncentration, )?([Uu]p to |jusqu'[àa] )?(?<value>[0-9]+) (?<unit>((bonus )?action( bonus)?|hours?|heures?|minutes?|r[eé]action|rounds?|days?|jours?|))(?<condition>,.+)?$/;
const RE_SCHOOL =
  /^level (?<level>[0-9]+) - (?<school>[a-z]+)(?<ritual> \(ritual\))?$/;
export const KG_LB_RATIO = 2;
export const METER_FOOT_RATIO = 1.5;
export const FOOT_MILE_RATIO = 0.000189394;
export const MILE_METER_RATIO = 1.5;

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

export const NOUNIT_DURATION: Record<string, string> = {
  instantaneous: "instantaneous",
  instantanée: "instantaneous",
  instantane: "instantaneous",
  "until dispelled": "until_dispelled",
  "jusqu'à dissipation": "until_dispelled",
  spéciale: "special",
  special: "special",
};

export function isNoUnitDuration(str: string) {
  return Object.values(NOUNIT_DURATION).includes(str);
}

export function parseDurationUnit(str: string) {
  switch (str) {
    case "action bonus":
    case "bonus action":
      return "bonus_action";
    default:
      return str.replace(/s$/, "");
  }
}

export function parseDuration(str: string) {
  let lower = str.toLowerCase();

  // Fix issue with improper formating
  // See: https://www.aidedd.org/dnd/sorts.php?vo=control-weather
  if (lower.endsWith("h")) {
    lower += "ours";
  }

  // See: https://www.aidedd.org/dnd/sorts.php?vf=sens-de-l-orientation
  if (lower.endsWith("j")) {
    lower += "ours";
  }

  const nounit = NOUNIT_DURATION[lower];

  if (nounit) {
    return {
      value: 0,
      unit: nounit,
      label: lower,
      concentration: false,
    };
  }

  const match = lower.match(RE_CASTING_TIME);

  if (!match || !match.groups?.value || !match.groups?.unit) {
    throw new Error(`Invalid duration format "${str}"`);
  }

  return {
    value: parseFloat(match.groups.value),
    unit: parseDurationUnit(
      match.groups.unit.replace(match.groups.condition || "@none", "")
    ),
    label: lower,
    condition: match.groups.condition,
    concentration: !!match.groups.concentration,
  };
}

export function parseDistance(str: string): Distance {
  const match = str.match(RE_DISTANCE);

  if (!match || !match.groups?.distance || !match.groups?.unit) {
    throw new Error(`Invalid distance format "${str}"`);
  }

  const value = parseFloat(match.groups.distance.replace(",", "."));

  switch (match.groups.unit) {
    case "feet":
    case "foot":
      return {
        feet: value,
        meters: value / METER_FOOT_RATIO,
      };
    case "mètres":
    case "mètre":
      return {
        feet: value * METER_FOOT_RATIO,
        meters: value,
      };
    case "miles":
    case "mile":
      return {
        miles: value,
        meters: value * MILE_METER_RATIO,
      };
    case "kilomètre":
    case "kilomètres":
      return {
        miles: (value * 1000) / MILE_METER_RATIO,
        meters: value * 1000,
      };
    default:
      throw new Error(`Unknown unit "${match.groups.unit}"`);
  }
}

export function parseRange(str: string): { range: Range; aoe?: Shape } {
  const match = str.toLowerCase().match(RE_RANGE);

  if (!match?.groups) {
    throw new Error(`Invalid range format "${str}"`);
  }

  const {
    type,
    rangeUnit,
    rangeValue,
    aoeValue1,
    aoeUnit1,
    aoeShape1,
    aoeValue2,
    aoeUnit2,
    aoeShape2,
  } = match.groups;

  const range: Range = {
    type: type || "ranged",
  };

  if (match.groups.rangeUnit && match.groups.rangeValue) {
    range.distance = parseDistance(`${rangeValue} ${rangeUnit}`);
  }

  const aoeValue = aoeValue1 || aoeValue2;
  const aoeUnit = aoeUnit1 || aoeUnit2;
  const aoeShape = aoeShape1 || aoeShape2;

  if (!aoeShape) {
    return { range };
  }

  return {
    range,
    aoe: parseShape(aoeShape, aoeUnit, aoeValue),
  };
}

export function parseShape(shape: string, unit: string, value: string): Shape {
  switch (shape) {
    case "rayon":
    case "radius":
    case "radiuss":
      return {
        shape: "circle",
        radius: parseDistance(`${value} ${unit}`),
      };
    case "sphere":
    case "sphère":
      return {
        shape: "sphere",
        radius: parseDistance(`${value} ${unit}`),
      };
    case "hemisphere":
    case "hémisphère":
      return {
        shape: "hemisphere",
        radius: parseDistance(`${value} ${unit}`),
      };
    case "cone":
    case "cône":
      return {
        shape: "cone",
        length: parseDistance(`${value} ${unit}`),
      };
    case "line":
    case "ligne":
      return {
        shape: "line",
        length: parseDistance(`${value} ${unit}`),
      };
    case "cube":
      return {
        shape: "cube",
        edge: parseDistance(`${value} ${unit}`),
      };
    default:
      throw new Error(`Invalid shape "${shape}"`);
  }
}

export function mergeShapes(shapeEn: Shape, shapeFr: Shape): Shape {
  if (shapeEn.shape !== shapeFr.shape) {
    throw new Error(`Shape must be the same to be merged`);
  }

  switch (shapeEn.shape) {
    case "circle":
    case "sphere":
    case "hemisphere":
      return {
        shape: shapeEn.shape,
        radius: {
          meters: (shapeFr as Circle | Sphere).radius.meters,
          miles: shapeEn.radius.miles,
          feet: shapeEn.radius.feet,
        },
      };
    case "cone":
    case "line":
      return {
        shape: shapeEn.shape,
        length: {
          meters: (shapeFr as Cone | Line).length.meters,
          miles: shapeEn.length.miles,
          feet: shapeEn.length.feet,
        },
      };
    case "cube":
      return {
        shape: shapeEn.shape,
        edge: {
          meters: (shapeFr as Cube).edge.meters,
          miles: shapeEn.edge.miles,
          feet: shapeEn.edge.feet,
        },
      };
    default:
      throw new Error(`Unknown shape "${(shapeEn as Shape).shape}"`);
  }
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
    case "player´s handbook":
    case "player´s handbook (br+)":
      return "srd";
    case "xanathar´s guide to everything":
      return "xtge";
    case "tasha´s cauldron of everything":
      return "tcoe";
    default:
      throw new Error(`Unknow source "${str}"`);
  }
}
