export interface TES {
  [key: string]: number;
}

export interface TESSQUARE {
  type: string;
  mult?: number;
  sizeRest?: {
    [index: number]: number;
  };
}

export interface VENTDATA {
  name: string;
  //size - teshours
  [index: number]: number;
}

const ventiil: VENTDATA = {
  name: 'plafoon',
  100: 0.3,
  125: 0.3,
  160: 0.32,
  200: 0.34,
  250: 0.38,
  315: 0.43,
  400: 0.5,
};

const rest: VENTDATA = {
  name: 'kasti plafoon',
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
  name: 'piennopeuslaite',
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
  name: 'kast',
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
  name: 'toru',
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
  name: 'osa',
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
  name: 'summuti',
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
  name: 'eyma',
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
  name: 'luuk',
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
  name: 'eristatud luuk',
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
  name: 'tuleklapp',
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
  name: 'ims',
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

const valisrest: VENTDATA = {
  name: 'välisrest',
  125: 0.38,
  200: 0.48,
  250: 0.54,
  315: 0.61,
};

export const round: VENTDATA[] = [
  toru,
  osa,
  eyma,
  summuti,
  luuk,
  eristatud_luuk,
  tuleklapp,
  ims,
  ventiil,
  kast,
  rest,
  valisrest,
  piennopeuslaite,
];

export const tesValuesSquare: TESSQUARE[] = [
  {
    type: 'Eristamata',
    mult: 0.45,
  },
  {
    type: 'Eristatud',
    mult: 1.1,
  },
  {
    type: 'Rest',
    //TesHours: size
    sizeRest: {
      0.96: 0.16,
      1.09: 0.2,
      1.45: 0.36,
      1.72: 0.64,
      2.06: 1,
      2.4: 1.44,
      2.72: 1.96,
      4.05: 3.24,
      4.5: 4,
    },
  },
];

export interface Cat {
  name: string;
  link: string;
}

//list of NAV tabs with routerlinks
export const cats: Cat[] = [
  { name: 'Ümarad', link: 'round' },
  { name: 'Kandilised', link: 'square' },
  {
    name: 'Ax Vendikad',
    link: 'axial',
  },
  {
    name: 'Ventagregaadid',
    link: 'machine',
  },
];
