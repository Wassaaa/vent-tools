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
  unit: string;
}

export interface MACHINE {
  name: string;
  sub: string;
  displayType: number;
  types: VENTDATA[];
}

const toru: MACHINE = {
  name: 'toru',
  sub: `mm`,
  displayType: 1,
  types: [
    {
      name: 'toru',
      unit: 'm',
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
    },
  ],
};

const ventiil: MACHINE = {
  name: 'plafoon',
  sub: `mm`,
  displayType: 1,
  types: [
    {
      name: 'plafoon',
      unit: 'tk',
      100: 0.3,
      125: 0.3,
      160: 0.32,
      200: 0.34,
      250: 0.38,
      315: 0.43,
      400: 0.5,
    },
  ],
};

const eristatudToru: MACHINE = {
  name: 'eristatud toru kuni 50mm',
  sub: `mm`,
  displayType: 1,
  types: [
    {
      name: 'eristatud toru kuni 50mm',
      unit: 'm',
      125: 0.37,
      200: 0.4,
      250: 0.48,
      315: 0.6,
      400: 0.68,
      500: 0.84,
      630: 1.08,
      800: 1.3,
      1000: 1.6,
      1250: 1.98,
    },
  ],
};

const eristatudToru50: MACHINE = {
  name: 'eristatud toru üle 50mm',
  sub: `mm`,
  displayType: 1,
  types: [
    {
      name: 'eristatud toru üle 50mm',
      unit: 'm',
      125: 0.58,
      200: 0.63,
      250: 0.75,
      315: 0.93,
      400: 1.06,
      500: 1.34,
      630: 1.69,
      800: 2.04,
      1000: 2.48,
      1250: 2.92,
    },
  ],
};

const eristatudOsa: MACHINE = {
  name: 'eristatud osa',
  sub: `mm`,
  displayType: 1,
  types: [
    {
      name: 'eristatud osa',
      unit: 'tk',
      125: 0.48,
      200: 0.53,
      250: 0.58,
      315: 0.75,
      400: 0.96,
      500: 1.03,
      630: 1.46,
      800: 1.98,
      1000: 2.65,
      1250: 3.44,
    },
  ],
};

const rest: MACHINE = {
  name: 'kasti plafoon',
  sub: `mm`,
  displayType: 1,
  types: [
    {
      name: 'kasti plafoon',
      unit: 'tk',
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
    },
  ],
};

const piennopeuslaite: MACHINE = {
  name: 'piennopeuslaite',
  sub: `mm`,
  displayType: 1,
  types: [
    {
      name: 'piennopeuslaite',
      unit: 'tk',
      100: 0.85,
      125: 0.91,
      160: 1,
      200: 1.05,
      250: 1.14,
      315: 1.48,
      400: 1.7,
      500: 1.93,
      630: 2.38,
    },
  ],
};

const kast: MACHINE = {
  name: 'kast',
  sub: `mm`,
  displayType: 1,
  types: [
    {
      name: 'kast',
      unit: 'tk',
      100: 0.9,
      125: 0.9,
      160: 0.9,
      200: 1,
      250: 1,
      315: 1,
      400: 1.21,
      500: 1.81,
      630: 2.42,
    },
  ],
};

const osa: MACHINE = {
  name: 'osa',
  sub: `mm`,
  displayType: 1,
  types: [
    {
      name: 'osa',
      unit: 'tk',
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
    },
  ],
};

const summuti: MACHINE = {
  name: 'summuti',
  sub: `mm`,
  displayType: 1,
  types: [
    {
      name: 'summuti',
      unit: 'tk',
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
    },
  ],
};

const eyma: MACHINE = {
  name: 'eyma',
  sub: `mm`,
  displayType: 1,
  types: [
    {
      name: 'eyma',
      unit: 'tk',
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
    },
  ],
};

const luuk: MACHINE = {
  name: 'luuk',
  sub: `mm`,
  displayType: 1,
  types: [
    {
      name: 'luuk',
      unit: 'tk',
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
    },
  ],
};

const eristatud_luuk: MACHINE = {
  name: 'eristatud luuk',
  sub: `mm`,
  displayType: 1,
  types: [
    {
      name: 'eristatud luuk',
      unit: 'tk',
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
    },
  ],
};

const tuleklapp: MACHINE = {
  name: 'tuleklapp',
  sub: `mm`,
  displayType: 1,
  types: [
    {
      name: 'tuleklapp',
      unit: 'tk',
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
    },
  ],
};

const ims: MACHINE = {
  name: 'ims',
  sub: `mm`,
  displayType: 1,
  types: [
    {
      name: 'ims',
      unit: 'tk',
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
    },
  ],
};

const valisrest: MACHINE = {
  name: 'valisrest',
  sub: `mm`,
  displayType: 1,
  types: [
    {
      name: 'välisrest',
      unit: 'tk',
      125: 0.38,
      200: 0.48,
      250: 0.54,
      315: 0.61,
    },
  ],
};

export const round: MACHINE[] = [
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
  eristatudToru,
  eristatudToru50,
  eristatudOsa,
];

////////////////////////////////////////////MACHINES/////////////////////////////////////////////////////

const tuloKone: MACHINE = {
  name: 'Sissepuhke masin',
  sub: `m&sup3/s`,
  displayType: 1,
  types: [
    {
      //m3/s - nh
      name: 'Sissepuhke masin',
      unit: 'tk',
      1.0: 3.8,
      2.0: 5.76,
      3.5: 7.67,
      5.0: 9.59,
      7.0: 11.5,
      10.0: 13.42,
    },
  ],
};

const tuloPoistoKone: MACHINE = {
  name: 'sisse + valjatome kone',
  sub: `m&sup3/s`,
  displayType: 1,
  types: [
    {
      //m3/s - nh
      name: 'sisse + valjatome kone',
      unit: 'tk',
      1.0: 6.88,
      2.0: 10.23,
      3.5: 13.74,
      5.0: 17.26,
      7.0: 20.77,
      10.0: 23.97,
    },
  ],
};

const machineParts: MACHINE = {
  name: 'osadest agregaat',
  sub: `m&sup3/s`,
  displayType: 2,
  types: [
    {
      //m3/s - nh
      name: 'vaheosa / filterkast',
      unit: 'tk',
      1.0: 1.11,
      2.0: 1.32,
      3.5: 2.04,
      5.0: 2.36,
      7.0: 2.68,
      10.0: 3.01,
    },
    {
      name: 'radikas',
      unit: 'tk',
      1.0: 1.41,
      2.0: 1.69,
      3.5: 2.69,
      5.0: 3.06,
      7.0: 3.49,
      10.0: 3.94,
    },
    {
      name: 'summuti',
      unit: 'tk',
      1.0: 1.66,
      2.0: 1.96,
      3.5: 2.95,
      5.0: 3.35,
      7.0: 3.74,
      10.0: 4.14,
    },
    {
      name: 'mootor',
      unit: 'tk',
      1.0: 1.66,
      2.0: 1.96,
      3.5: 2.95,
      5.0: 3.35,
      7.0: 3.74,
      10.0: 4.14,
    },
  ],
};

const axMachines: MACHINE = {
  name: 'Aksiaal Vendika süsteem',
  sub: `mm`,
  displayType: 2,
  types: [
    {
      //m3/s - nh
      name: 'tärinän eristimet',
      unit: 'tk',
      250: 0.17,
      400: 0.29,
      630: 0.37,
      1000: 0.46,
      1250: 0.57,
    },
    {
      name: 'suojaverkko',
      unit: 'tk',
      250: 0.17,
      400: 0.29,
      630: 0.37,
      1000: 0.46,
      1250: 0.57,
    },
    {
      name: 'jalat',
      unit: 'tk',
      250: 0.29,
      400: 0.37,
      630: 0.46,
      1000: 0.57,
      1250: 0.66,
    },
    {
      name: 'kangasliitin',
      unit: 'tk',
      250: 0.37,
      400: 0.57,
      630: 0.74,
      1000: 0.94,
      1250: 1.11,
    },
    {
      name: 'Johtosiivistö',
      unit: 'tk',
      250: 0.37,
      400: 0.57,
      630: 0.74,
      1000: 0.94,
      1250: 1.11,
    },
    {
      name: 'Imukartio',
      unit: 'tk',
      250: 0.57,
      400: 0.74,
      630: 0.94,
      1000: 1.11,
      1250: 1.31,
    },
    {
      name: 'Puhalluskartio',
      unit: 'tk',
      250: 0.57,
      400: 0.74,
      630: 0.94,
      1000: 1.11,
      1250: 1.31,
    },
    {
      name: 'Ääniloukku, Suodatinosa',
      unit: 'tk',
      250: 0.74,
      400: 0.94,
      630: 1.11,
      1000: 1.31,
      1250: 1.45,
    },
    {
      name: 'Moottoripelti',
      unit: 'tk',
      250: 0.74,
      400: 0.94,
      630: 1.11,
      1000: 1.31,
      1250: 1.45,
    },
    {
      name: 'Puhallin',
      unit: 'tk',
      250: 1.11,
      400: 1.31,
      630: 1.48,
      1000: 1.68,
      1250: 1.87,
    },
  ],
};

const smallMachines: MACHINE = {
  name: 'vaikesed masinad',
  sub: `tk`,
  displayType: 3,
  types: [
    // amount * NH 96 is nothing
    { name: 'väike köögikubu', 69: 2.28, unit: 'tk' },
    { name: 'VVS IV masin', 69: 3.7, unit: 'tk' },
    { name: 'Tuulikaappikoje', 69: 3.4, unit: 'tk' },
    { name: 'mürapadi', 69: 1.99, unit: 'tk' },
    { name: 'siirdeõhu masin', 69: 1.92, unit: 'tk' },
    { name: 'jahutus masin', 69: 1.92, unit: 'tk' },
    { name: 'toru vendikas 100-160', 69: 0.48, unit: 'tk' },
    { name: 'toru vendikas 200-315', 69: 0.64, unit: 'tk' },
    { name: 'Kohde poistopuhallin kone', 69: 1.75, unit: 'tk' },
    { name: 'Kohde poistopuhallin "Kärsä"', 69: 2.28, unit: 'tk' },
    { name: 'väike kone 40-100kg', 69: 6, unit: 'tk' },
    { name: 'väike kone 100-210kg', 69: 8, unit: 'tk' },
  ],
};

const palkit: MACHINE = {
  name: 'Soojendus ja jahutus palkit',
  sub: `kg`,
  displayType: 4,
  types: [
    {
      //kg / nh
      name: 'Soojendus ja jahutus palkit',
      unit: 'tk',
      15: 0.9,
      35: 1,
      60: 1.5,
      100: 2,
      150: 2.5,
      200: 3,
    },
  ],
};

const talotekniikkaPalkit: MACHINE = {
  name: 'taloteknikkapalkit',
  sub: `mm`,
  displayType: 5,
  types: [
    {
      //mm / nh
      name: 'taloteknikkapalkit',
      unit: 'tk',
      1500: 1.5,
      2000: 1.9,
      2500: 2.2,
      3000: 2.5,
      3500: 2.8,
      4000: 3.2,
      4500: 3.6,
      5000: 3.9,
    },
  ],
};

export const machines = [
  tuloKone,
  tuloPoistoKone,
  machineParts,
  smallMachines,
  palkit,
  talotekniikkaPalkit,
  axMachines,
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
    name: 'Ventagregaadid',
    link: 'machine',
  },
];
