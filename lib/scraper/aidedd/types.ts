export type ADDPriceUnitScrap = "gp" | "cp" | "sp";

export type ADDPriceScrap = `${number} ${ADDPriceUnitScrap}`;

export type ADDWeaponScrap = {
  name: string;
  price: ADDPriceScrap;
  damage: string;
  weight: string;
};

export type ADDWeaponListScrap = {
  weapons: Partial<ADDWeaponScrap>[];
};
