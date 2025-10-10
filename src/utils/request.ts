import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { auth } from "../services/firebase";

// Setting a base URL for all requests
axios.defaults.baseURL = import.meta.env.VITE_API_BACKEND_URL;

// Set default headers and timeout
axios.defaults.headers.post["Content-Type"] = "application/json";

// Request interceptor
axios.interceptors.request.use(
  async (config) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        axios.defaults.headers.common["token"] = await currentUser.getIdToken();
      } catch (error) {
        console.error("Error refreshing token:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific HTTP error codes
      switch (error.response.status) {
        case 401:
          // Handle unauthorized access
          // You might want to redirect to login or refresh token
          break;
        case 403:
          // Handle forbidden access
          break;
        case 404:
          // Handle not found
          break;
        case 500:
          // Handle server error
          break;
      }
    } else if (error.request) {
      // Handle network errors
      console.error("Network Error:", error.message);
    }
    return Promise.reject(error);
  }
);

interface RequestProps {
  method: AxiosRequestConfig["method"];
  url: string;
  data?: any;
  headers?: Record<string, string>;
  timeout?: number;
}

export default async function request<T = any>({
  method,
  url,
  data,
  headers,
  timeout,
}: RequestProps): Promise<AxiosResponse<T>> {
  try {
    const response = await axios({
      method,
      url,
      data,
      headers,
      timeout: timeout || axios.defaults.timeout,
    });

    return response as AxiosResponse<T>;
  } catch (error) {
    // You can add custom error handling here
    throw error;
  }
}
