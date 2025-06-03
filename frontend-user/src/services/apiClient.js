import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080', // baseURL tetap sama
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menambahkan token customer ke setiap request jika ada
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('customerAuthToken'); // Menggunakan key token yang berbeda
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;