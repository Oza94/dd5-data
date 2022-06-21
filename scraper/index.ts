import scrapeIt from "scrape-it";
import slugify from "slugify";
import { evaluate } from "mathjs";
import { promises as fs } from "fs";
import path from "path";

type ADDPriceUnitScrap = "gp" | "cp" | "sp";

type ADDPriceScrap = `${number} ${ADDPriceUnitScrap}`;

type ADDWeaponScrap = {
  name: string;
  price: ADDPriceScrap;
  damage: string;
  weight: string;
};

type ADDWeaponListScrap = {
  weapons: Partial<ADDWeaponScrap>[];
};

type Locale = string;

type LocaleAttribute = {
  [key: Locale]: string;
};

type Damage = {
  formula: string;
  type: string;
};

type Weight = {
  kg: number;
  lb: number;
};

type Weapon = {
  id: string;
  name: LocaleAttribute;
  price: number;
  damage?: Damage;
  weight: Weight;
  source: string;
};

const RE_PRICE = /^[0-9]+ [gsc]p$/;
const RE_DAMAGE =
  /^(?<formula>[0-9]+(d[0-9]+)?) (?<type>bludgeoning|piercing|slashing)$/;
const RE_WEIGHT = /^(?<value>[0-9]+(,[0-9]+|\/[0-9]+)?) (?<unit>(lb\.|kg))$/;
const KG_LB_RATIO = 2;

function parsePrice(str: ADDPriceScrap) {
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

function parseDamage(str: string): Damage {
  const match = str.match(RE_DAMAGE);

  if (!match || !match.groups?.type || !match.groups?.formula) {
    throw new Error(`Invalid damage format "${str}"`);
  }

  return { formula: match.groups.formula, type: match.groups.type };
}

function parseWeight(str: string) {
  const match = str.match(RE_WEIGHT);

  if (!match || !match.groups?.value || !match.groups?.unit) {
    throw new Error(`Invalid weight format "${str}"`);
  }

  // We may have stuff like "1/4 lb." that requires something more robust than parseFloat
  const parsed: number = evaluate(match.groups.value);
  let kg = 0;
  let lb = 0;

  switch (match.groups.unit) {
    case "kg": {
      kg = parsed;
      lb = parsed * KG_LB_RATIO;
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

function transform(raw: ADDWeaponScrap): Weapon {
  return {
    id: slugify(raw.name, {
      lower: true,
      remove: /[',]/,
    }),
    name: { en: raw.name },
    price: parsePrice(raw.price),
    damage: raw.damage !== "-" ? parseDamage(raw.damage) : undefined,
    weight: raw.weight !== "-" ? parseWeight(raw.weight) : { kg: 0, lb: 0 },
    source: "srd",
  };
}

function isFull(raw: Partial<ADDWeaponScrap>): raw is ADDWeaponScrap {
  return !!raw.price;
}

async function main() {
  const { data } = await scrapeIt<ADDWeaponListScrap>(
    "https://www.aidedd.org/en/rules/equipment/weapons/",
    {
      weapons: {
        listItem: ".content table tr",
        data: {
          name: "td:nth-child(1)",
          price: "td:nth-child(2)",
          damage: "td:nth-child(3)",
          weight: "td:nth-child(4)",
        },
      },
    }
  );

  const spells = data.weapons.slice(1).filter(isFull).map(transform);

  await fs.writeFile(
    path.resolve(__dirname, "../json/weapons.json"),
    JSON.stringify(spells, null, 2),
    "utf-8"
  );

  console.log("Done.");
}

main();
