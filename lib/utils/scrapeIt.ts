import scrapeIt from "scrape-it";
import logger from "./logger";
import { wait } from "./wait";

let lastScrap = 0;
const throttleDelay = 1000;

export async function scrape<T>(
  url: string | object,
  options: scrapeIt.ScrapeOptions
) {
  const now = Date.now();

  if (now - lastScrap < throttleDelay) {
    await wait(throttleDelay - (now - lastScrap));
  }

  lastScrap = now;

  logger.info(`GET ${url}`);
  return await scrapeIt<T>(url, options);
}
