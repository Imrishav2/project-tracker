// apiConfig.js
const API_BASE = process.env.VITE_API_URL || 
                 (window.location.hostname === 'localhost' ? 
                  "http://localhost:5000" : 
                  "https://project-tracker-0ahq.onrender.com");
export default API_BASE;