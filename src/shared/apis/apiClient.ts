import axios from "axios";
import type { AxiosRequestConfig } from "axios";

const isMocking = import.meta.env.VITE_MOCKING === "true";
const BASE_URL = isMocking ? "/api/v1" : import.meta.env.VITE_BASE_URL;

// 1. axiosInstance 생성 (기본 설정)
const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// 2. request interceptor 적용
axiosInstance.interceptors.request.use(
  (config) => {
    // todo. 토큰 추가
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 3. response interceptor 적용
axiosInstance.interceptors.response.use(
  (response) => response,

  // todo. 에러 처리 로직 추가

  (error) => {
    return Promise.reject(error);
  },
);

/**
 * 공통 API response 타입 정의
 * @property {number} code - 응답 코드 (0: 성공, 1: 실패)
 * @property {string} msg - 응답 메시지 (성공 메시지 또는 에러 메시지)
 * @property {boolean} success - 성공 여부 (true: 성공, false: 실패)
 * @property {T} data - 응답 데이터 (성공 시 데이터, 실패 시 에러 메시지)
 */

interface ApiResponse<T = unknown> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

// 4. apiClient 객체 (외부에서 사용하는 실제 API)
export const apiClient = {
  get: async <T = unknown>(
    endpoint: string,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response = await axiosInstance.get<ApiResponse<T>>(endpoint, config);
    return response.data.data;
  },
  post: async <T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response = await axiosInstance.post<ApiResponse<T>>(
      endpoint,
      data,
      config,
    );
    return response.data.data;
  },
  delete: async <T = unknown>(
    endpoint: string,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response = await axiosInstance.delete<ApiResponse<T>>(
      endpoint,
      config,
    );
    return response.data.data;
  },
  put: async <T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response = await axiosInstance.put<ApiResponse<T>>(
      endpoint,
      data,
      config,
    );
    return response.data.data;
  },
};
