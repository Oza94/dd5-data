import { writeCollection } from "./formatter/json";
import { aideddScrapWeapons } from "./scraper/aidedd";
import { aideddScrapSpells } from "./scraper/aidedd/scrap-spells";
import logger from "./utils/logger";

async function weapons() {
  logger.info("🗡️  Scraping weapons ...");

  const weapons = await aideddScrapWeapons();

  logger.info("🗡️  Done scraping weapons. Writing output ...");

  writeCollection("weapons", weapons);

  logger.info("🗡️  All done for weapons.");
}

async function spells() {
  logger.info("✨  Scraping spells ...");

  const spells = await aideddScrapSpells();

  logger.info("✨  Done scraping spells. Writing output ...");

  writeCollection("spells", spells);

  logger.info("✨  All done for spells.");
}

async function main() {
  logger.info("Starting scraping & output.");
  await weapons();
  await spells();
  logger.info("✅ All done");
}

main();
