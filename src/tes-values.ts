import { TES, TESSQUARE } from './app/TES';

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
  {
    name: 'Ax Ventikat',
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
