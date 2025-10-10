import { Dispatch } from "react";

import { SetStateAction } from "react";

export type DataItem = {
  _id: string;
  lot: string;
  camera: string;
  plateNumber: string;
  plate: string;
  vehicle: string;
  direction: string;
  match: string;
  createdAt: string;
};

export type PermitType = {
  _id?: string;
  createdBy?: string;
  name: string;
  reason: string;
  plate: string;
  startDate?: string;
  endDate?: string;
  lot?: LotType;
  paidStatus?: boolean;
};

export type ValidationType = {
  _id?: string;
  user: string;
  duration: number;
  price: number;
};

export type CustomPriceType = {
  _id?: string;
  activeDays: number[];
  rangeStart: string;
  rangeEnd: string;
  specificDate: string;
  expirationDate: string;
  duration: number;
  price: number;
  description: string;
  detail: string;
};

export type LotType = {
  _id: string;
  locations: string[];
  zone: string | null;
  enterToken: string;
  exitToken: string;
  cover: string;
  siteCode: string;
  address: string;
  priceId: string;
  payTime: number;
  firstFine: number;
  secondFine: number;
  thirdFine: number;
  payingFee: number;
  violationFee: number;
  ticketThreshold: number;
  towEmail?: string;
  percentage: number;
  stripePublicKey: string;
  owners: string[];
  pApps: string[];
  validations: ValidationType[];
  customPrices: CustomPriceType[];
  createdAt?: string;
  updatedAt?: string;
};

export type UserType = {
  uid: string;
  email: string;
  emailVerified: boolean;
  disabled: boolean;
  displayName?: string;
  photoURL?: string;
  customClaims: {
    level: number;
  };
  metadata: {
    lastSignInTime: string;
    creationTime: string;
    lastRefreshTime: string;
  };
  passwordHash?: string;
  passwordSalt?: string;
};

export type LocationType = {
  locationId: string[];
  locationName: string[];
  description: string[];
};

export type ZoneType = {
  Description: string[];
  Name: string[];
};

export interface PayingApp {
  name: string;
  url: string;
}

export interface LprSessionType {
  _id: string;
  lot: LotType;
  driverInfo: DriverInfoType;
  paymentLogs: PaymentSessionType[];
  violationLog: ViolationLogType | null;
  outstandingViolations?: number;
  camera1: string;
  camera2: string;
  plateNumber: string;
  plate1?: string;
  plate2?: string;
  country: string;
  vehicle1?: string;
  vehicle2?: string;
  entryTime?: string;
  exitTime?: string;
  status: string;
  fine: number;
  noticeNumber?: string;
  printedAt?: string;
}

export interface PaymentSessionType {
  _id: string;
  chargedAmount: number;
  plateNumber: string;
  purchasedDate: string;
  expirationDate: string;
  lot: LotType;
  zone: string;
  appType: string;
  lprSession?: LprSessionType;
}

export interface ViolationLogType {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  payLog?: PaymentSessionType;
  lprSession?: LprSessionType;
  createdAt?: string;
}

export interface LogType {
  createDate: string;
  status: string;
  amount: number;
}

export type MessageType = {
  sender: string;
  content: string;
};

export type MessageContent = {
  id: string;
  content: string;
  createdAt: string;
};

export type InboxType = {
  sender: string;
  contents: MessageContent[];
  count: number;
};

export interface PortalItemType {
  name: string;
  period: [Date, Date];
}

export interface PortalOnDashboardType {
  item: PortalItemType;
  selectedItem: PortalItemType;
  setSelectedItem: Dispatch<SetStateAction<PortalItemType>>;
}

export interface PortalComponentProps {
  item: PortalItemType;
  selectedItem: PortalItemType;
  setSelectedItem: (item: PortalItemType) => void; // Adjusting the type for correct usage
  paymentSessions: PaymentSessionType[];
}

export interface ChatDataType {
  Date: string;
  Revenue: number;
}

export interface DriverInfoType {
  _id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  plateNumber: string;
}

export interface SessionGraphType {
  Day: string;
  Amount: number;
  Type: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  plateNumber?: string;
  sortOrder?: "asc" | "desc";
}
export interface SessionsState<T = any> {
  data: T[];
  isLoading: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}
