// src/utils/envLoader.js
export const loadEnvVariables = async () => {
    console.log('Loading environment variables...');
    const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
    console.log('Weather API Key:', WEATHER_API_KEY);
    
    if (!WEATHER_API_KEY) {
      console.warn('Weather API key not found in environment variables');
      throw new Error('Weather API key not found');
    }
    
    return { WEATHER_API_KEY };
};