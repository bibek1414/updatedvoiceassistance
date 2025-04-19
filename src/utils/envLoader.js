// src/utils/envLoader.js
export const loadEnvVariables = async () => {
    const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
    if (!WEATHER_API_KEY) {
      console.warn('Weather API key not found in environment variables');
      throw new Error('Weather API key not found');
    }
    
    return { WEATHER_API_KEY };
};