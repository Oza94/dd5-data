import { merge } from "lodash";
import { Model, RecursivePartial } from "../types";

export function mergeById<T extends Model>(
  array: T[],
  source: RecursivePartial<T>[]
): T[] {
  return array.map((item) => {
    const sourceItem = source.find((sItem) => sItem.id === item.id);

    if (!sourceItem) {
      throw new Error(`Can't find item with id "${item.id}"`);
    }

    return merge(item, sourceItem);
  });
}
