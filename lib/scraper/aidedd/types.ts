export type ADDPriceUnitScrap = "gp" | "cp" | "sp";

export type ADDPriceScrap = `${number} ${ADDPriceUnitScrap}`;

export type ADDWeaponScrapEN = {
  name: string;
  price: ADDPriceScrap;
  damage: string;
  weight: string;
};

export type ADDWeaponScrapFR = {
  name: string;
  vo: string;
  weight: string;
};

export type ADDWeaponListScrap<T> = {
  weapons: Partial<T>[];
};

export type ADDListSpellScrap = {
  spells: {
    name: string;
    url: string;
  }[];
};

export type ADDSpellCardScrapEN = {
  name: string;
  urlFr: string;
  nameEn: string;
  nameFr: string;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  classesSrd: string[];
  source: string;
};

export type ADDSpellCardScrapFR = {
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
};
