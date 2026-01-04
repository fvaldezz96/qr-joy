import axios from 'axios';

import { API_BASE_URL } from '../config';

// URL primaria (normalmente la API remota, definida vía EXPO_PUBLIC_API_BASE_URL)
const PRIMARY_API_BASE_URL = API_BASE_URL?.replace(/\/+$/, '') || '';

// URL secundaria/local para fallback (por ejemplo http://192.168.x.x:3001 o http://192.168.0.25:3001)
const LOCAL_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL_LOCAL?.replace(/\/+$/, '') || '';

const api = axios.create({
  baseURL: PRIMARY_API_BASE_URL || LOCAL_API_BASE_URL || '',
  timeout: 10000,
});

// Fallback automático: si falla la API primaria, intentamos una vez contra la API local
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config as any;

    // Si no hay config o ya reintentamos, propagamos el error
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Solo intentamos fallback si tenemos una URL local configurada y la primaria es distinta
    if (LOCAL_API_BASE_URL && api.defaults.baseURL !== LOCAL_API_BASE_URL) {
      originalRequest._retry = true;
      api.defaults.baseURL = LOCAL_API_BASE_URL;
      return api(originalRequest);
    }

    return Promise.reject(error);
  },
);

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
