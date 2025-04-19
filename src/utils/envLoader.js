export const loadEnvVariables = async () => {
    const ENV = {};
    
    try {
      console.log('Loading environment variables...');
      
      // Load the weather API key from environment variables
      ENV.WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
      
      // Debug log to check the value
      console.log('Weather API Key:', ENV.WEATHER_API_KEY);
      
      if (!ENV.WEATHER_API_KEY) {
        console.warn('Weather API key not found in environment variables');
      }
      
      return ENV;
    } catch (error) {
      console.error('Error loading environment variables:', error);
      return ENV;
    }
};