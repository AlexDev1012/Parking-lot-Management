import { format } from "date-fns";
import { toast } from "react-toastify";
import { io, Socket } from "socket.io-client";
import moment from "moment-timezone";

import { PaymentSessionType, ViolationLogType } from "../types";
import * as jose from "jose";

let socket: Socket;

export const showToast = (msg: string, success: boolean = false) => {
  const fn = success ? toast.info : toast.error;
  fn(msg, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
  });
};

// Utility function to calculate Parking in hours or minutes
export const calculateParkingTime = (
  entryTime: string,
  exitTime: string
): string => {
  const entryDate = new Date(entryTime);
  const exitDate = new Date(exitTime);
  const periodTimeInMs = exitDate.getTime() - entryDate.getTime();

  if (periodTimeInMs < 0) {
    return "Invalid time range";
  }

  const periodTimeInHours = periodTimeInMs / 3600000; // Convert milliseconds to hours

  if (periodTimeInHours < 1) {
    const periodTimeInMinutes = Math.floor(periodTimeInMs / 60000); // Convert milliseconds to minutes
    return `${periodTimeInMinutes} mins`;
  }

  return `${Math.floor(periodTimeInHours)} hours`;
};

export const calculateTotalAmount = (items: PaymentSessionType[]) => {
  return items.reduce((sum, log) => sum + log.chargedAmount, 0);
};

export const calculateViolationAmount = (items: ViolationLogType[]) => {
  return items.reduce(
    (sum, log) => sum + (log.payLog?.chargedAmount || 0),
    0 // Initial value for the accumulator
  );
};

// Convert timestamp to desired format using date-fns
export const formatTimestamp = (timestamp?: string): string => {
  const formattedTime = moment(timestamp)
    .tz("America/New_York")
    .format("MM/DD/YYYY HH:mm");
  return formattedTime;
};

export const calculatePaidEndTimeInHours = (
  startDate: string,
  paidAmount: number,
  hourlyRate: number | undefined
): string => {
  const date = new Date(startDate);
  const hours = Math.round((paidAmount - 0.5) * 0.93) / Number(hourlyRate);
  date.setHours(date.getHours() + hours);
  return format(date, "MM/dd/yyyy HH:mm:ss");
};

export const generateToken = async (payload: any, expireTime: string) => {
  try {
    const secret = new TextEncoder().encode(import.meta.env.VITE_SECRET_KEY);

    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(expireTime)
      .sign(secret);

    return token;
  } catch (error) {
    console.log(error);
  }
};

export const connectSocket = () => {
  socket = io(import.meta.env.VITE_SOCKET_URL, { transports: ["websocket"] });
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};

export const sendMessage = (message: string) => {
  if (socket) socket.emit("send_message", message);
};

export const subscribeToMessages = (callback: () => void) => {
  if (!socket) return;

  socket.on("receive_message", callback);
};

export const unsubscribeFromMessages = () => {
  if (socket) socket.off("receive_message");
};
