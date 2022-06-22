import scrapeIt from "scrape-it";
import slugify from "slugify";
import { ADDWeaponListScrap, ADDWeaponScrap } from "./types";
import { parseDamage, parsePrice, parseWeight } from "./utils";
import { Weapon } from "../../types";

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

export async function aideddScrapWeapons(): Promise<Weapon[]> {
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

  return data.weapons.slice(1).filter(isFull).map(transform);
}
