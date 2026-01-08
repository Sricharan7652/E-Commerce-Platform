import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000, // 10 second timeout
});

// Add auth token to requests if available
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Set default timeout for all requests
  api.defaults.timeout = 10000;
}

// Add response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error but don't throw - let individual calls handle it
    if (error.code === 'ECONNABORTED') {
      console.warn('Request timeout - backend may not be running');
    } else if (error.code === 'ERR_NETWORK') {
      console.warn('Network error - backend may not be running');
    }
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
      return response.data.product;
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
