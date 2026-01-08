import axios from 'axios';

// Construct base URL - append /api if not already present
export const getBaseURL = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }
  // Use relative URL to avoid CORS issues
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // 30 second timeout for deployed backend (Render can be slow on first request)
});

// Note: Auth token is now handled in request interceptor for dynamic updates

// Add response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error but don't throw - let individual calls handle it
    if (error.code === 'ECONNABORTED') {
      console.warn('Request timeout - backend may not be running');
    } else if (error.code === 'ERR_NETWORK') {
      console.warn('Network error - backend may not be running');
    } else if (error.response) {
      // Server responded with error status
      console.warn('API Error:', error.response.status, error.response.data);
    }
    return Promise.reject(error);
  }
);

// Request interceptor to update auth token dynamically
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Product API functions
export const productApi = {
  // Get products with optional search and category filter
  getProducts: async (search?: string, category?: string) => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category && category !== 'All') params.append('category', category);
      
      const response = await api.get(`/products?${params.toString()}`);
      return response.data.products || [];
    } catch (error: any) {
      console.warn('Failed to fetch products from API:', error.message);
      throw error;
    }
  },

  // Get single product by ID
  getProductById: async (id: string) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data; // Return the full response which contains {product: {...}}
    } catch (error: any) {
      console.warn('Failed to fetch product from API:', error.message);
      throw error;
    }
  },

  // Get all categories
  getCategories: async () => {
    try {
      const response = await api.get('/products/categories/list');
      return response.data.categories || [];
    } catch (error: any) {
      console.warn('Failed to fetch categories from API:', error.message);
      throw error;
    }
  },
};

export default api;
