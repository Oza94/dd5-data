import scrapeIt from "scrape-it";
import {
  ADDWeaponListScrap,
  ADDWeaponScrapEN,
  ADDWeaponScrapFR,
} from "./types";
import { parseDamage, parsePrice, parseWeight } from "./utils";
import { RecursivePartial, Weapon } from "../../types";
import { slugify } from "../../utils/slugify";
import { mergeById } from "../../utils/collections";

function transformEN(raw: ADDWeaponScrapEN): Weapon {
  return {
    id: slugify(raw.name),
    name: { en: raw.name },
    price: parsePrice(raw.price),
    damage: raw.damage !== "-" ? parseDamage(raw.damage) : undefined,
    weight: raw.weight !== "-" ? parseWeight(raw.weight) : { kg: 0, lb: 0 },
    source: "srd",
  };
}

function transformFR(raw: ADDWeaponScrapFR): RecursivePartial<Weapon> {
  return {
    id: slugify(raw.vo),
    name: {
      fr: raw.name,
    },
    weight:
      raw.weight !== "-"
        ? {
            kg: parseWeight(raw.weight).kg,
          }
        : { kg: 0 },
  };
}

function isFullEN(raw?: Partial<ADDWeaponScrapEN>): raw is ADDWeaponScrapEN {
  return !!raw?.price;
}

function isFullFR(raw?: Partial<ADDWeaponScrapFR>): raw is ADDWeaponScrapFR {
  return !!raw?.vo;
}

export async function aideddScrapWeapons(): Promise<Weapon[]> {
  const { data: data_en } = await scrapeIt<
    ADDWeaponListScrap<ADDWeaponScrapEN>
  >("https://www.aidedd.org/en/rules/equipment/weapons/", {
    weapons: {
      listItem: ".content table tr",
      data: {
        name: "td:nth-child(1)",
        price: "td:nth-child(2)",
        damage: "td:nth-child(3)",
        weight: "td:nth-child(4)",
      },
    },
  });

  const { data: data_fr } = await scrapeIt<
    ADDWeaponListScrap<ADDWeaponScrapFR>
  >("https://www.aidedd.org/regles/equipement/armes/", {
    weapons: {
      listItem: ".content table tr",
      data: {
        name: "td:nth-child(1)",
        vo: "td:nth-child(2)",
        weight: "td:nth-child(4)",
      },
    },
  });

  const weapons_en = data_en.weapons.slice(1).filter(isFullEN).map(transformEN);
  const partials_fr = data_fr.weapons
    .slice(1)
    .filter(isFullFR)
    .map(transformFR);

  return mergeById(weapons_en, partials_fr);
}
