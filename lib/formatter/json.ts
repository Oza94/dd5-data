import path from "path";
import { promises as fs } from "fs";

const root = path.resolve(__dirname, "../../json");

export async function writeCollection(name: string, data: any) {
  await fs.writeFile(
    path.resolve(root, `${name}.json`),
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}
