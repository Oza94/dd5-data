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

export type Distance = {
  // Since feet & miles do not easily convert to each other these are optional and stored separatly
  feet?: number;
  miles?: number;
  meters: number;
};

export type Range = {
  type: string;
  distance?: Distance;
};

export type Circle = {
  shape: "circle";
  radius: Distance;
};

export type Sphere = {
  shape: "sphere";
  radius: Distance;
};

export type Hemisphere = {
  shape: "hemisphere";
  radius: Distance;
};

export type Cone = {
  shape: "cone";
  length: Distance;
};

export type Line = {
  shape: "line";
  length: Distance;
};

export type Cube = {
  shape: "cube";
  edge: Distance;
};

export type Shape = Circle | Sphere | Hemisphere | Cone | Line | Cube;

export type Duration = {
  unit: string;
  value: number;
  label: LocaleAttribute;
};

export type CastingTime = Omit<Duration, "value"> & {
  value?: number;
  condition?: LocaleAttribute;
  concentration: boolean;
};

export type SpellComponent = "V" | "S" | "M";

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

export type Spell = {
  id: string;
  name: LocaleAttribute;
  level: number;
  schoolId: string;
  ritual: boolean;
  range: Range;
  castingTime: CastingTime;
  aoe?: Shape;
  duration: Duration;
  description: LocaleAttribute;
  classes: { classId: string; sourceId: string }[];
  sourceId: string;
};
