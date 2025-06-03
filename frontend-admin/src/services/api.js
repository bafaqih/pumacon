// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // Sesuaikan dengan URL backend Anda
  // Anda bisa menambahkan konfigurasi lain di sini jika perlu
});

// Token akan ditambahkan ke header oleh AuthContext useEffect
// atau Anda bisa menggunakan interceptor seperti ini jika mau:
// api.interceptors.request.use(config => {
//   const token = localStorage.getItem('adminAuthToken');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// }, error => {
//   return Promise.reject(error);
// });

export default api;