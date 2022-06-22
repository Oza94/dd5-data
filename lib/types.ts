// Generic types

export type Locale = string;

export type LocaleAttribute = {
  [key: Locale]: string;
};

export type Damage = {
  formula: string;
  type: string;
};

export type Weight = {
  kg: number;
  lb: number;
};

// Documents types

export type Weapon = {
  id: string;
  name: LocaleAttribute;
  price: number;
  damage?: Damage;
  weight: Weight;
  source: string;
};
