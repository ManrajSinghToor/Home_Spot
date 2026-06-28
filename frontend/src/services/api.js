const USE_MOCK = false;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// Helper to get auth headers with Bearer token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Helper to simulate network latency
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Initial properties list (18 properties across Punjab)
const INITIAL_PROPERTIES = [
  {
    id: 1,
    title: 'Modern Punjabi Villa',
    city: 'ludhiana',
    rooms: 4,
    beds: 4,
    baths: 3,
    sqft: '2,200',
    price: '₹45,000/month',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2070&auto=format&fit=crop',
    address: '125 Model Town, Ludhiana, Punjab',
    phone: '+91 98765-43210'
  },
  {
    id: 2,
    title: 'Amritsar City Apartment',
    city: 'amritsar',
    rooms: 2,
    beds: 2,
    baths: 2,
    sqft: '1,100',
    price: '₹35,000/month',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070&auto=format&fit=crop',
    address: '18 Mall Road, Amritsar, Punjab',
    phone: '+91 98765-43211'
  },
  {
    id: 3,
    title: 'Jalandhar Family Home',
    city: 'jalandhar',
    rooms: 3,
    beds: 3,
    baths: 2,
    sqft: '1,800',
    price: '₹28,000/month',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
    address: '42 Civil Lines, Jalandhar, Punjab',
    phone: '+91 98765-43212'
  },
  {
    id: 4,
    title: 'Mohali Luxury Villa',
    city: 'mohali',
    rooms: 5,
    beds: 5,
    baths: 5,
    sqft: '4,500',
    price: '₹85,000/month',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974&auto=format&fit=crop',
    address: '9 Green Avenue, Mohali, Punjab',
    phone: '+91 98765-43213'
  },
  {
    id: 5,
    title: 'Mohali Studio Apartment',
    city: 'mohali',
    rooms: 1,
    beds: 1,
    baths: 1,
    sqft: '750',
    price: '₹18,000/month',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop',
    address: '55 Sector 70, Mohali, Punjab',
    phone: '+91 98765-43214'
  },
  {
    id: 6,
    title: 'Mohali Townhouse',
    city: 'mohali',
    rooms: 3,
    beds: 3,
    baths: 2.5,
    sqft: '1,950',
    price: '₹42,000/month',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2070&auto=format&fit=crop',
    address: '210 Phase 8, Mohali, Punjab',
    phone: '+91 98765-43215'
  },
  {
    id: 7,
    title: 'Ludhiana Modern Flat',
    city: 'ludhiana',
    rooms: 2,
    beds: 2,
    baths: 2,
    sqft: '1,200',
    price: '₹25,000/month',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070&auto=format&fit=crop',
    address: '78 Model Town Extension, Ludhiana, Punjab',
    phone: '+91 98765-43216'
  },
  {
    id: 8,
    title: 'Amritsar Heritage House',
    city: 'amritsar',
    rooms: 4,
    beds: 4,
    baths: 3,
    sqft: '2,500',
    price: '₹55,000/month',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
    address: '12 Heritage Street, Amritsar, Punjab',
    phone: '+91 98765-43217'
  },
  {
    id: 9,
    title: 'Jalandhar Executive Suite',
    city: 'jalandhar',
    rooms: 1,
    beds: 1,
    baths: 1,
    sqft: '800',
    price: '₹20,000/month',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop',
    address: '45 Executive Plaza, Jalandhar, Punjab',
    phone: '+91 98765-43218'
  },
  {
    id: 10,
    title: 'Mohali Garden Villa',
    city: 'mohali',
    rooms: 4,
    beds: 4,
    baths: 3,
    sqft: '2,800',
    price: '₹65,000/month',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974&auto=format&fit=crop',
    address: '33 Garden Estate, Mohali, Punjab',
    phone: '+91 98765-43219'
  },
  {
    id: 11,
    title: 'Ludhiana Business Center',
    city: 'ludhiana',
    rooms: 3,
    beds: 3,
    baths: 2,
    sqft: '1,600',
    price: '₹38,000/month',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2070&auto=format&fit=crop',
    address: '67 Business Park, Ludhiana, Punjab',
    phone: '+91 98765-43220'
  },
  {
    id: 12,
    title: 'Amritsar Golden Temple View',
    city: 'amritsar',
    rooms: 2,
    beds: 2,
    baths: 2,
    sqft: '1,300',
    price: '₹32,000/month',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070&auto=format&fit=crop',
    address: '89 Golden View, Amritsar, Punjab',
    phone: '+91 98765-43221'
  },
  {
    id: 13,
    title: 'Jalandhar Sports Complex',
    city: 'jalandhar',
    rooms: 5,
    beds: 5,
    baths: 4,
    sqft: '3,200',
    price: '₹75,000/month',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
    address: '156 Sports Avenue, Jalandhar, Punjab',
    phone: '+91 98765-43222'
  },
  {
    id: 14,
    title: 'Mohali IT Hub Apartment',
    city: 'mohali',
    rooms: 2,
    beds: 2,
    baths: 2,
    sqft: '1,100',
    price: '₹30,000/month',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop',
    address: '234 IT Park, Mohali, Punjab',
    phone: '+91 98765-43223'
  },
  {
    id: 15,
    title: 'Ludhiana Textile District',
    city: 'ludhiana',
    rooms: 3,
    beds: 3,
    baths: 2,
    sqft: '1,800',
    price: '₹40,000/month',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2070&auto=format&fit=crop',
    address: '345 Textile Market, Ludhiana, Punjab',
    phone: '+91 98765-43224'
  },
  {
    id: 16,
    title: 'Amritsar Airport View',
    city: 'amritsar',
    rooms: 4,
    beds: 4,
    baths: 3,
    sqft: '2,200',
    price: '₹48,000/month',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974&auto=format&fit=crop',
    address: '456 Airport Road, Amritsar, Punjab',
    phone: '+91 98765-43225'
  },
  {
    id: 17,
    title: 'Jalandhar University Area',
    city: 'jalandhar',
    rooms: 1,
    beds: 1,
    baths: 1,
    sqft: '700',
    price: '₹15,000/month',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop',
    address: '567 University Road, Jalandhar, Punjab',
    phone: '+91 98765-43226'
  },
  {
    id: 18,
    title: 'Mohali Golf Course Villa',
    city: 'mohali',
    rooms: 6,
    beds: 6,
    baths: 5,
    sqft: '5,000',
    price: '₹120,000/month',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2070&auto=format&fit=crop',
    address: '678 Golf Course Road, Mohali, Punjab',
    phone: '+91 98765-43227'
  }
];

// Normalize property to make it compatible with both formats
// (Listings page uses property.image & property.address; FeaturedListings uses imgSrc & dataAddress)
export function normalizeProperty(p) {
  if (!p) return null;
  const addressVal = p.address || p.dataAddress || '';
  const phoneVal = p.phone || p.dataPhone || '';
  const imgVal = p.image || p.imgSrc || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2070&auto=format&fit=crop';
  
  return {
    ...p,
    id: p.id || addressVal,
    image: imgVal,
    imgSrc: imgVal,
    imgAlt: p.imgAlt || p.title || 'Property Image',
    address: addressVal,
    dataAddress: addressVal,
    phone: phoneVal,
    dataPhone: phoneVal,
    beds: p.beds ? (String(p.beds).includes('Bed') ? p.beds : `${p.beds} Beds`) : '3 Beds',
    baths: p.baths ? (String(p.baths).includes('Bath') ? p.baths : `${p.baths} Baths`) : '2 Baths',
    sqft: p.sqft ? (String(p.sqft).includes('sqft') ? p.sqft : `${p.sqft} sqft`) : '1,500 sqft',
    rooms: parseInt(p.rooms || p.beds || 3),
    city: (p.city || '').toLowerCase(),
  };
}

// Get initial database state
const getMockDatabase = () => {
  const users = JSON.parse(localStorage.getItem('users_db') || '[]');
  const landlordProps = JSON.parse(localStorage.getItem('landlordProperties') || '[]');
  const bookings = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  
  return { users, landlordProps, bookings, favorites };
};

export const api = {
  // Authentication
  auth: {
    login: async (username, password, role) => {
      await delay(200);
      let response;
      try {
        response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, role })
        });
      } catch (e) {
        throw new Error('Connection refused. Please make sure the backend server is running on port 5001.');
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('Server returned an empty or invalid response. Please check if the backend server is running.');
      }

      if (!response.ok || !data.success) throw new Error(data.message || 'Login failed.');
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      return data;
    },

    signup: async (userData) => {
      await delay(200);
      let response;
      try {
        response = await fetch(`${API_URL}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
      } catch (e) {
        throw new Error('Connection refused. Please make sure the backend server is running on port 5001.');
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('Server returned an empty or invalid response. Please check if the backend server is running.');
      }

      if (!response.ok || !data.success) throw new Error(data.message || 'Signup failed.');
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      return data;
    },

    updateProfile: async (username) => {
      await delay(200);
      const response = await fetch(`${API_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ username })
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Profile update failed.');
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      return data;
    },

    changePassword: async (currentPassword, newPassword) => {
      await delay(200);
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Password update failed.');
      return data;
    }
  },

  // Properties Listings
  properties: {
    getListings: async () => {
      await delay(200);
      const response = await fetch(`${API_URL}/api/properties`);
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to fetch properties.');
      return data.properties.map(normalizeProperty);
    },

    createListing: async (listingData) => {
      await delay(200);
      const response = await fetch(`${API_URL}/api/properties`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(listingData)
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to create listing.');
      return normalizeProperty(data.property);
    },

    deleteListing: async (id) => {
      await delay(200);
      const response = await fetch(`${API_URL}/api/properties/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to delete listing.');
      return { success: true };
    }
  },

  // Bookings
  bookings: {
    createBooking: async (bookingData) => {
      await delay(200);
      const propertyId = bookingData.propertyId || bookingData.property?._id || bookingData.property?.id;
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          propertyId,
          name: bookingData.name,
          email: bookingData.email,
          phone: bookingData.phone,
          moveInDate: bookingData.moveInDate || bookingData.date,
          duration: bookingData.duration,
          message: bookingData.message
        })
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to submit booking inquiry.');
      return data.booking;
    },

    getBookings: async (username) => {
      await delay(200);
      const response = await fetch(`${API_URL}/api/bookings`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to fetch bookings.');
      return data.bookings;
    }
  },

  // Favorites
  favorites: {
    getFavorites: async () => {
      await delay(200);
      const response = await fetch(`${API_URL}/api/favorites`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to fetch favorites.');
      return data.favorites.map(normalizeProperty);
    },

    toggleFavorite: async (property, isFavorited) => {
      await delay(100);
      const propertyId = property._id || property.id;
      const response = await fetch(`${API_URL}/api/favorites/toggle`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ propertyId, isFavorited })
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to toggle favorite.');
      return data.favorites.map(normalizeProperty);
    }
  }
};
