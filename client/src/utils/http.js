// client/src/utils/http.js
import axios from "axios";

const http = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  withCredentials: true, // cookie bo'lsa ham yuboradi
});

http.interceptors.request.use((config) => {
  const t = localStorage.getItem("token");
  if (t) {
    config.headers.Authorization = `Bearer ${t}`; // JWT standarti
    config.headers.auth = t;                      // agar server 'auth' ham qabul qilsa
  }
  return config;
});

export default http;
