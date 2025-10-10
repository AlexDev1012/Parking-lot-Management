import {
  LotType,
  PayingApp,
  PortalItemType,
  ZoneType,
  LocationType,
  DriverInfoType,
  ViolationLogType,
} from "../types";

export const getPortalItems = (year: number): PortalItemType[] => [
  {
    name: year.toString(),
    period: [new Date(year, 0, 1), new Date(year, 11, 31)],
  },
  ...Array.from({ length: 12 }, (_, monthIndex) => ({
    name: new Date(year, monthIndex).toLocaleString("default", {
      month: "long",
    }),
    period: [
      new Date(year, monthIndex, 1),
      new Date(year, monthIndex + 1, 1),
    ] as [Date, Date],
  })),
];

export const selectableYears: { year: number }[] = [
  { year: 2024 },
  { year: 2025 },
  { year: 2026 },
  { year: 2027 },
  { year: 2028 },
  { year: 2029 },
  { year: 2030 },
];

export type ChartFlagType = { flag: string; value: number };

export const chartFlags: ChartFlagType[] = [
  { flag: "Total Commission", value: 0 },
  { flag: "CPA Revenue", value: 1 },
  { flag: "Lot Revenue", value: 2 },
];

export const payingApps: PayingApp[] = [
  {
    name: "Flowbird",
    url: "https://weboffice.us.flowbird.io/cwo2/images/favicon.ico",
  },
  {
    name: "T2",
    url: "https://www.t2systems.com/wp-content/uploads/2020/10/cropped-favicon-32x32.png",
  },
  { name: "Citypark PayingApp", url: "https://i.ibb.co/HhCHXCY/fav-bg.jpg" },
];

export const defaultLocation: LocationType = {
  locationId: [],
  locationName: [],
  description: [],
};

export const defaultZone: ZoneType = {
  Description: [],
  Name: [],
};

export const defaultLotData: LotType = {
  _id: "",
  locations: [],
  zone: "",
  enterToken: "",
  exitToken: "",
  cover: "",
  siteCode: "",
  address: "",
  priceId: "",
  payTime: 0,
  firstFine: 0,
  secondFine: 0,
  thirdFine: 0,
  payingFee: 0,
  violationFee: 0,
  ticketThreshold: 0,
  towEmail: "",
  percentage: 0,
  stripePublicKey: "",
  pApps: [],
  owners: [],
  validations: [],
  customPrices: [],
};

export const defaultAllLot: LotType = {
  _id: "",
  locations: [],
  zone: "",
  enterToken: "",
  exitToken: "",
  cover: "",
  siteCode: "ALL LOTS",
  address: "",
  priceId: "",
  payTime: 0,
  firstFine: 0,
  secondFine: 0,
  thirdFine: 0,
  payingFee: 0,
  violationFee: 0,
  ticketThreshold: 0,
  towEmail: "",
  percentage: 0,
  stripePublicKey: "",
  owners: [],
  pApps: [],
  validations: [],
  customPrices: [],
};

export const defaultDriverInfo: DriverInfoType = {
  name: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  plateNumber: "",
};

export const defaultViolationInfo: ViolationLogType = {
  firstName: "",
  lastName: "",
  email: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  phoneNumber: "",
};

export const ParkingSessionStatus = {
  LPR: "OK",
  ERROR: "ERROR",
  NOPAY: "NOPAY",
  NOTFULL: "NOTFULL",
  MISTAKE: "MISTAKE",
  RESOLVED: "RESOLVED",
  PAID: "PAID",
};
