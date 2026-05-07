import axios from "axios";
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

const SMS_API_URL = import.meta.env.VITE_SMS_API_URL;
const ACCESS_KEY = import.meta.env.VITE_NCP_ACCESS_KEY;
const SECRET_KEY = import.meta.env.VITE_NCP_SECRET_KEY;
const SERVICE_ID = import.meta.env.VITE_NCP_SMS_SERVICE_ID;

/**
 * Web Crypto API를 사용한 HMAC-SHA256 서명 생성
 * crypto-js 없이 브라우저 내장 API로 처리
 */

async function makeSignature(
  method: string,
  url: string,
  timestamp: string,
): Promise<string> {
  const message = `${method} ${url}\n${timestamp}\n${ACCESS_KEY}`;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(SECRET_KEY);
  const messageData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);

  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

const smsAxiosInstance = axios.create({
  baseURL: `${SMS_API_URL}/services/${SERVICE_ID}`,
});

smsAxiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const timestamp = Date.now().toString();
    const method = (config.method ?? "GET").toUpperCase();

    const baseURL = config.baseURL ?? "";
    const fullUrl = `${baseURL}${config.url ?? ""}`;
    const urlPath = new URL(fullUrl).pathname;

    const signature = await makeSignature(method, urlPath, timestamp);

    config.headers["Content-Type"] = "application/json; charset=utf-8";
    config.headers["x-ncp-apigw-timestamp"] = timestamp;
    config.headers["x-ncp-iam-access-key"] = ACCESS_KEY;
    config.headers["x-ncp-apigw-signature-v2"] = signature;

    return config;
  },
  (error) => Promise.reject(error),
);

export const messagingApiClient = {
  get: async <T = unknown>(
    endpoint: string,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response = await smsAxiosInstance.get<T>(endpoint, config);
    return response.data;
  },

  post: async <T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response = await smsAxiosInstance.post<T>(endpoint, data, config);
    return response.data;
  },

  delete: async <T = unknown>(
    endpoint: string,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response = await smsAxiosInstance.delete<T>(endpoint, config);
    return response.data;
  },
};
