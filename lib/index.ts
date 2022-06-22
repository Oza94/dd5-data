import { writeCollection } from "./formatter/json";
import { aideddScrapWeapons } from "./scraper/aidedd";
import logger from "./utils/logger";

async function weapons() {
  logger.info("🗡️  Scraping weapons ...");

  const weapons = await aideddScrapWeapons();

  logger.info("🗡️  Done scraping weapons. Writing output ...");

  writeCollection("weapons", weapons);

  logger.info("🗡️  All done for weapons.");
}

async function main() {
  logger.info("Starting scraping & output.");
  await weapons();
  logger.info("✅ All done");
}

main();
