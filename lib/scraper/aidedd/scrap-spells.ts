import { Spell } from "../../types";
import logger from "../../utils/logger";
import { scrape } from "../../utils/scrapeIt";
import {
  ADDListSpellScrap,
  ADDSpellCardScrapEN,
  ADDSpellCardScrapFR,
} from "./types";
import {
  isNoUnitDuration,
  mergeShapes,
  parseDuration,
  parseRange,
  parseSchool,
  parseSourceId,
} from "./utils";

export async function scrapSpellCard(url: string) {
  const { data: data_en } = await scrape<ADDSpellCardScrapEN>(url, {
    nameEn: "h1",
    nameFr: ".trad a",
    urlFr: { selector: ".trad a", attr: "href" },
    school: ".ecole",
    castingTime: ".bloc > div:nth-child(4)",
    range: ".bloc > div:nth-child(5)",
    components: ".bloc > div:nth-child(6)",
    duration: ".bloc > div:nth-child(7)",
    description: { selector: ".description", how: "html" },
    classesSrd: { listItem: ".classe" },
    source: ".source",
  });

  if (!data_en.castingTime.startsWith("Casting Time: ")) {
    throw new Error('Mismatch with "Casting Time: " field');
  }

  if (!data_en.range.startsWith("Range: ")) {
    throw new Error('Mismatch with "Range: " field');
  }

  if (!data_en.components.startsWith("Components: ")) {
    throw new Error('Mismatch with "Components: " field');
  }

  if (!data_en.duration.startsWith("Duration: ")) {
    throw new Error('Mismatch with "Duration: " field');
  }

  const { data: data_fr } = await scrape<ADDSpellCardScrapFR>(
    `https://www.aidedd.org/dnd/${data_en.urlFr}`,
    {
      castingTime: ".bloc > div:nth-child(4)",
      range: ".bloc > div:nth-child(5)",
      components: ".bloc > div:nth-child(6)",
      duration: ".bloc > div:nth-child(7)",
      description: { selector: ".description", how: "html" },
    }
  );

  const id = url.split("vo=")[1];

  const { level, school, ritual } = parseSchool(data_en.school);
  const castingTime_en = parseDuration(
    data_en.castingTime
      .replace("Casting Time: ", "")
      .split(/ o[ur] /)[0]
      .trim()
  );
  const castingTime_fr = parseDuration(
    data_fr.castingTime
      .replace("Temps d'incantation : ", "")
      .split(/ o[ur] /)[0]
      .trim()
  );

  const duration_en = parseDuration(
    data_en.duration
      .replace("Duration: ", "")
      .split(/ o[ur] /)[0]
      .trim()
  );
  const duration_fr = parseDuration(
    data_fr.duration
      .replace("Durée : ", "")
      .split(/ o[ur] /)[0]
      .trim()
  );

  const { range: range_en, aoe: aoe_en } = parseRange(
    data_en.range.replace("Range: ", "")
  );
  const { range: range_fr, aoe: aoe_fr } = parseRange(
    data_fr.range.replace("Portée : ", "")
  );

  return {
    id,
    name: {
      fr: data_en.nameFr,
      en: data_en.nameEn,
    },
    level,
    ritual,
    schoolId: school,
    range: {
      type: range_en.type,
      distance:
        range_en.distance && range_fr.distance
          ? {
              meters: range_fr.distance.meters,
              feet: range_en.distance.feet,
              miles: range_en.distance.miles,
            }
          : undefined,
    },
    aoe: aoe_en && aoe_fr ? mergeShapes(aoe_en, aoe_fr) : undefined,
    castingTime: {
      value: isNoUnitDuration(castingTime_en.unit)
        ? undefined
        : castingTime_en.value,
      unit: castingTime_en.unit,
      label: {
        en: castingTime_en.label,
        fr: castingTime_fr.label,
      },
      condition: castingTime_en.condition
        ? {
            en: castingTime_en.condition as string,
            fr: castingTime_fr.condition as string,
          }
        : undefined,
      concentration: duration_en.concentration,
    },
    duration: {
      value: duration_en.value,
      unit: duration_en.unit,
      label: {
        fr: duration_fr.label,
        en: duration_en.label,
      },
    },
    description: {
      en: data_en.description,
      fr: data_fr.description,
    },
    classes: data_en.classesSrd.map((c) => ({
      classId: c.toLocaleLowerCase(),
      sourceId: parseSourceId(data_en.source),
    })),
    sourceId: parseSourceId(data_en.source),
  };
}

export async function aideddScrapSpells(): Promise<Spell[]> {
  const { data } = await scrape<ADDListSpellScrap>(
    "https://www.aidedd.org/dnd-filters/spells-5e.php",
    {
      spells: {
        listItem: "#liste tbody tr",
        data: {
          url: { selector: ".item a", attr: "href" },
        },
      },
    }
  );

  const spellsList = data.spells;
  const spells: Spell[] = [];

  for (let i = 0; i < spellsList.length; i++) {
    const { url } = spellsList[i];

    logger.info(`at index ${i}`);
    spells.push(await scrapSpellCard(url));
  }

  return spells;
}
