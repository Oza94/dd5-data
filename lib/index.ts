import { writeCollection } from "./formatter/json";
import { aideddScrapWeapons } from "./scraper/aidedd";

async function weapons() {
  const weapons = await aideddScrapWeapons();
  writeCollection("weapons", weapons);
}

async function main() {
  await weapons();
}

main();
