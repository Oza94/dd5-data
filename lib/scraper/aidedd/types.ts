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
