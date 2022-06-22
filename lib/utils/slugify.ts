import baseSlugify from "slugify";

export function slugify(str: string) {
  return baseSlugify(str, {
    lower: true,
    remove: /[',]/,
  });
}
