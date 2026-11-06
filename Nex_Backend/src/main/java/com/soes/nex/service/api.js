import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // ඔයාගේ Spring Boot සර්වර් එකේ URL එක
});

// හැම API Request එකක්ම යන්න කලින් Token එක ඔටෝම එකතු කරන Interceptor එක
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Login වෙද්දී සේව් කරපු ටෝකන් එක
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;