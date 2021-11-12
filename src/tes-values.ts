import { TES, TESSQUARE } from './app/TES';

export interface VENTDATA {
  [index: number]: number;
}

const ventiil: VENTDATA = {
  100: 0.3,
  125: 0.3,
  160: 0.32,
  200: 0.34,
  250: 0.38,
  315: 0.43,
  400: 0.5,
};

const rest: VENTDATA = {
  100: 0.5,
  125: 0.5,
  160: 0.6,
  200: 0.6,
  250: 0.6,
  315: 0.6,
  400: 0.73,
  500: 0.98,
  630: 1.25,
  800: 1.43,
  1000: 1.76,
  1250: 2.16,
  1400: 2.55,
  1600: 3.01,
  1800: 3.46,
  2000: 3.97,
  2400: 4.4,
};

const piennopeuslaite: VENTDATA = {
  100: 0.85,
  125: 0.91,
  160: 1,
  200: 1.05,
  250: 1.14,
  315: 1.48,
  400: 1.7,
  500: 1.93,
  630: 2.38,
};

const kast: VENTDATA = {
  100: 0.9,
  125: 0.9,
  160: 0.9,
  200: 1,
  250: 1,
  315: 1,
  400: 1.21,
  500: 1.81,
  630: 2.42,
};

const toru: VENTDATA = {
  125: 0.18,
  200: 0.21,
  250: 0.25,
  315: 0.28,
  400: 0.32,
  500: 0.41,
  630: 0.54,
  800: 0.6,
  1000: 1.02,
  1250: 1.34,
};
const osa: VENTDATA = {
  125: 0.18,
  200: 0.3,
  250: 0.35,
  315: 0.44,
  400: 0.53,
  500: 0.67,
  630: 0.8,
  800: 1.07,
  1000: 1.34,
  1250: 1.79,
};
const summuti: VENTDATA = {
  125: 0.37,
  200: 0.4,
  250: 0.48,
  315: 0.6,
  400: 0.68,
  500: 0.85,
  630: 0.96,
  800: 1.3,
  1000: 1.59,
  1250: 1.87,
};
const eyma: VENTDATA = {
  125: 1.98,
  200: 1.98,
  250: 1.98,
  315: 1.98,
  400: 2.84,
  500: 2.84,
  630: 2.84,
  800: 3.97,
  1000: 3.97,
  1250: 3.97,
};
const luuk: VENTDATA = {
  125: 0.43,
  200: 0.43,
  250: 0.43,
  315: 0.43,
  400: 0.43,
  500: 0.55,
  630: 0.55,
  800: 0.55,
  1000: 0.55,
  1250: 0.55,
};
const eristatud_luuk: VENTDATA = {
  125: 0.86,
  200: 0.86,
  250: 0.86,
  315: 0.86,
  400: 0.86,
  500: 1.01,
  630: 1.01,
  800: 1.01,
  1000: 1.01,
  1250: 1.01,
};
const tuleklapp: VENTDATA = {
  100: 0.6,
  125: 0.6,
  160: 0.8,
  200: 0.8,
  250: 0.8,
  315: 0.95,
  400: 1.1,
  500: 1.28,
  630: 1.6,
  800: 1.88,
  1000: 2.23,
  1250: 2.57,
  1400: 2.94,
  1600: 3.31,
  1800: 3.67,
  2000: 4.05,
  2400: 4.43,
};
const ims: VENTDATA = {
  100: 0.6,
  125: 0.6,
  160: 0.8,
  200: 0.8,
  250: 0.8,
  315: 0.95,
  400: 1.1,
  500: 1.28,
  630: 1.6,
  800: 1.88,
  1000: 2.23,
  1250: 2.57,
  1400: 2.94,
  1600: 3.31,
  1800: 3.67,
  2000: 4.05,
  2400: 4.43,
};

export const ventData: VENTDATA[] = [
  toru,
  osa,
  eyma,
  summuti,
  luuk,
  tuleklapp,
  ims,
  ventiil,
  kast,
  rest,
  piennopeuslaite,
];

export const tesValuesSquare: TESSQUARE[] = [
  {
    Type: 'Eristamata',
    Mult: 0.45,
  },
  {
    Type: 'Eristatud',
    Mult: 1.1,
  },
];
export const tesValues: TES[] = [
  {
    Type: 125,
    Toru: 0.18,
    Osa: 0.18,
    Eyma: 1.98,
    Summuti: 0.37,
    Puhastusluuk: 0.43,
    Tuleklapp: 0.6,
    IMS: 0.6,
  },
  {
    Type: 200,
    Toru: 0.18,
    Osa: 0.3,
    Eyma: 1.98,
    Summuti: 0.4,
    Puhastusluuk: 0.43,
    Tuleklapp: 0.8,
    IMS: 0.8,
  },
  {
    Type: 250,
    Toru: 0.25,
    Osa: 0.35,
    Eyma: 1.98,
    Summuti: 0.48,
    Puhastusluuk: 0.43,
    Tuleklapp: 0.8,
    IMS: 0.8,
  },
  {
    Type: 315,
    Toru: 0.28,
    Osa: 0.44,
    Eyma: 1.98,
    Summuti: 0.6,
    Puhastusluuk: 0.43,
    Tuleklapp: 0.95,
    IMS: 0.95,
  },
  {
    Type: 400,
    Toru: 0.32,
    Osa: 0.53,
    Eyma: 2.84,
    Summuti: 0.68,
    Puhastusluuk: 0.43,
    Tuleklapp: 1.1,
    IMS: 1.1,
  },
  {
    Type: 500,
    Toru: 0.41,
    Osa: 0.67,
    Eyma: 2.84,
    Summuti: 0.85,
    Puhastusluuk: 0.55,
    Tuleklapp: 1.28,
    IMS: 1.28,
  },
  {
    Type: 630,
    Toru: 0.54,
    Osa: 0.8,
    Eyma: 2.84,
    Summuti: 0.96,
    Puhastusluuk: 0.55,
    Tuleklapp: 1.6,
    IMS: 1.6,
  },
  {
    Type: 800,
    Toru: 0.6,
    Osa: 1.07,
    Eyma: 3.97,
    Summuti: 1.3,
    Puhastusluuk: 0.55,
    Tuleklapp: 1.88,
    IMS: 1.88,
  },
  {
    Type: 1000,
    Toru: 1.02,
    Osa: 1.34,
    Eyma: 3.97,
    Summuti: 1.59,
    Puhastusluuk: 0.55,
    Tuleklapp: 2.23,
    IMS: 2.23,
  },
  {
    Type: 1250,
    Toru: 1.34,
    Osa: 1.79,
    Eyma: 3.97,
    Summuti: 1.87,
    Puhastusluuk: 0.55,
    Tuleklapp: 2.57,
    IMS: 2.57,
  },
];
export interface Cat {
  name: string;
  link: string;
}

export const cats: Cat[] = [
  { name: 'Ümarad', link: 'round' },
  { name: 'Kandilised', link: 'square' },
  //{ name: 'plafoonid', link: 'air-supply' },
  {
    name: 'Ax Vendikad',
    link: 'axial',
  },
  {
    name: 'Ventagregaadid',
    link: 'machine',
  },
];

// export const types: string[] = [
//   'Toru',
//   'Osa',
//   'Eyma',
//   'Summuti',
//   'PuhastusPuhastusluuk',
//   'Tuleklapp',
//   'IMS',
// ];
