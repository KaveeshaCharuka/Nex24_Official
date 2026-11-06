import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api', 
    headers: {
        'Content-Type': 'application/json'
    }
});

// ========================================================
// 1. Request Interceptor (Inject Bearer JWT Token)
// ========================================================
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ========================================================
// 2. Response Interceptor (Mid-Exam Silent Refresh & Auto-Logout)
// ========================================================
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Skip auto-logout for auth endpoints and face verification failures
        if (originalRequest && originalRequest.url) {
            if (originalRequest.url.includes('/auth/login') || 
                originalRequest.url.includes('/exams/verify-identity') || 
                originalRequest.url.includes('/auth/refresh-token')) {
                return Promise.reject(error);
            }
        }

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            // Check if student is actively taking an exam
            const isMidExam = window.location.pathname.includes('/LiveExam');
            const token = localStorage.getItem('token');

            if (isMidExam && token && !isRefreshing) {
                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const refreshRes = await axios.post('http://localhost:8080/api/auth/refresh-token', {}, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    const newToken = refreshRes.data.token;
                    if (newToken) {
                        localStorage.setItem('token', newToken);
                        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                        processQueue(null, newToken);
                        isRefreshing = false;
                        return api(originalRequest);
                    }
                } catch (refreshErr) {
                    processQueue(refreshErr, null);
                    isRefreshing = false;
                }
            }

            console.warn("🔒 Session expired. Redirecting to login...");
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('role');

            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;