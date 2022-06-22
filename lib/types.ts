// Utils types

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P];
};

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

// modal types

export interface Model {
  id: string;
}

export type Weapon = {
  id: string;
  name: LocaleAttribute;
  price: number;
  damage?: Damage;
  weight: Weight;
  source: string;
};
