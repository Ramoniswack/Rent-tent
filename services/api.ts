const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper function for API requests
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log('API Request:', {
    url: `${API_BASE_URL}${endpoint}`,
    method: options.method || 'GET',
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
  });

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers as Record<string, string>),
      },
    });

    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      let errorData: any = {};
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: 'Failed to parse error response' };
        }
      } else {
        try {
          const text = await response.text();
          errorData = { error: text || 'Request failed' };
        } catch (e) {
          errorData = { error: 'Request failed' };
        }
      }
      
      // Only log meaningful error responses (not empty objects)
      const hasError = errorData && 
        typeof errorData === 'object' && 
        Object.keys(errorData).length > 0 &&
        (errorData.error || errorData.message);
      
      if (hasError) {
        // Don't log expected error messages
        const errorMessage = errorData.error || errorData.message || '';
        const isExpectedError = 
          errorMessage.includes('not found') ||
          errorMessage.includes('Unauthorized') ||
          errorMessage.includes('Access denied');
        
        if (!isExpectedError) {
          console.error('API Error Response:', errorData);
        }
      }
      
      // Handle specific status codes
      if (response.status === 401) {
        // Don't throw for 401 on optional endpoints
        if (endpoint.includes('/bookings/my-bookings') || endpoint.includes('/reviews')) {
          throw new Error('Please log in to view this content');
        }
        throw new Error('Unauthorized. Please log in again.');
      } else if (response.status === 403) {
        throw new Error('Access denied. You do not have permission.');
      } else if (response.status === 404) {
        throw new Error('Resource not found.');
      } else if (response.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw new Error(errorData.error || errorData.message || `Request failed with status ${response.status}`);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      return {};
    }
  } catch (error) {
    // Only log meaningful and unexpected errors
    if (error instanceof Error && error.message && error.message.trim()) {
      // Don't log expected errors
      const isExpectedError = 
        error.message.includes('Please log in') ||
        error.message.includes('Unauthorized') ||
        error.message.includes('Access denied') ||
        error.message.includes('Resource not found') ||
        error.message.includes('not found');
      
      if (!isExpectedError) {
        console.error('API Request Error:', error.message);
      }
    }
    throw error;
  }
}

// Gear API
export const gearAPI = {
  // Get all gear with filters
  getAll: async (filters?: {
    category?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    available?: boolean;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const query = params.toString();
    return apiRequest(`/gear${query ? `?${query}` : ''}`);
  },

  // Get single gear by ID
  getById: async (id: string) => {
    return apiRequest(`/gear/${id}`);
  },

  // Get user's listed gear
  getMyGear: async () => {
    return apiRequest('/gear/my-gear');
  },

  // Get gear by specific user (public)
  getGearByUser: async (username: string) => {
    return apiRequest(`/gear/user/${username}`);
  },

  // Create new gear listing
  create: async (gearData: {
    title: string;
    description: string;
    category: string;
    condition: string;
    pricePerDay: number;
    currency?: string;
    location: string;
    images?: string[];
    specifications?: Record<string, any>;
    minimumRentalDays?: number;
    deposit?: number;
  }) => {
    return apiRequest('/gear', {
      method: 'POST',
      body: JSON.stringify(gearData),
    });
  },

  // Update gear listing
  update: async (id: string, gearData: Partial<{
    title: string;
    description: string;
    category: string;
    condition: string;
    pricePerDay: number;
    currency: string;
    location: string;
    images: string[];
    available: boolean;
    specifications: Record<string, any>;
    minimumRentalDays: number;
    deposit: number;
  }>) => {
    return apiRequest(`/gear/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(gearData),
    });
  },

  // Delete gear listing
  delete: async (id: string) => {
    return apiRequest(`/gear/${id}`, {
      method: 'DELETE',
    });
  },

  // Get reviews for gear
  getReviews: async (id: string) => {
    return apiRequest(`/gear/${id}/reviews`);
  },
};

// Booking API
export const bookingAPI = {
  // Create booking
  create: async (bookingData: {
    gearId: string;
    startDate: string;
    endDate: string;
    pickupLocation: string;
    notes?: string;
  }) => {
    return apiRequest('/gear/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  // Get user's bookings (as renter)
  getMyBookings: async () => {
    return apiRequest('/gear/bookings/my-rentals');
  },

  // Get bookings for user's gear (as owner)
  getGearBookings: async () => {
    return apiRequest('/gear/bookings/my-gear');
  },

  // Update booking status
  updateStatus: async (id: string, status: string) => {
    return apiRequest(`/gear/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Add review
  addReview: async (id: string, rating: number, review: string) => {
    return apiRequest(`/gear/bookings/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ rating, review }),
    });
  },
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
  }) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },
};

// User API
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    return apiRequest('/user/profile');
  },

  // Update user profile
  updateProfile: async (userData: {
    name?: string;
    username?: string;
    profilePicture?: string;
    coverPhoto?: string;
    bio?: string;
    gender?: string;
    location?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    age?: string;
    languages?: string[];
    interests?: string[];
    travelStyle?: string;
    billingAddress?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    matchPreferences?: {
      ageRange: [number, number];
      travelStyles: string[];
      interests: string[];
      locationRange: number;
      genders: string[];
    };
    preferences?: {
      language?: string;
      currency?: string;
      emailNotifications?: boolean;
      publicProfile?: boolean;
      shareLocation?: boolean;
    };
  }) => {
    return apiRequest('/user/profile', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  },

  // Get user profile by username
  getUserByUsername: async (username: string) => {
    return apiRequest(`/user/profile/${username}`);
  },

  // Get all users for matching
  getAllUsers: async () => {
    return apiRequest('/user/all');
  },

  // Get user statistics
  getStats: async () => {
    return apiRequest('/user/stats');
  },

  // Follow a user
  followUser: async (userId: string) => {
    return apiRequest(`/user/follow/${userId}`, {
      method: 'POST',
    });
  },

  // Unfollow a user
  unfollowUser: async (userId: string) => {
    return apiRequest(`/user/unfollow/${userId}`, {
      method: 'DELETE',
    });
  },

  // Get follow status for a user
  getFollowStatus: async (userId: string) => {
    return apiRequest(`/user/follow-status/${userId}`);
  },
};

// Match API
export const matchAPI = {
  // Discover potential matches
  discover: async () => {
    return apiRequest('/matches/discover');
  },

  // Like a user
  likeUser: async (likedUserId: string) => {
    return apiRequest('/matches/like', {
      method: 'POST',
      body: JSON.stringify({ likedUserId }),
    });
  },

  // Pass on a user
  passUser: async (passedUserId: string) => {
    return apiRequest('/matches/pass', {
      method: 'POST',
      body: JSON.stringify({ passedUserId }),
    });
  },

  // Get all matches
  getMatches: async () => {
    return apiRequest('/matches');
  },

  // Check if matched with a specific user
  checkMatch: async (userId: string) => {
    return apiRequest(`/matches/check/${userId}`);
  },

  // Get users who liked current user
  getLikes: async () => {
    return apiRequest('/matches/likes');
  },

  // Get all user IDs that current user has interacted with (liked or passed)
  getInteractedUsers: async () => {
    return apiRequest('/matches/interacted');
  },

  // Reset all interactions (clear match history)
  resetInteractions: async () => {
    return apiRequest('/matches/reset', {
      method: 'DELETE',
    });
  },

  // Cancel a sent connection request
  cancelConnection: async (targetUserId: string) => {
    return apiRequest('/matches/cancel', {
      method: 'POST',
      body: JSON.stringify({ targetUserId }),
    });
  },
};

// Trip API
export const tripAPI = {
  getAll: async () => {
    return apiRequest('/trips');
  },

  getById: async (id: string) => {
    return apiRequest(`/trips/${id}`);
  },

  create: async (tripData: any) => {
    return apiRequest('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  },

  update: async (id: string, tripData: any) => {
    return apiRequest(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tripData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/trips/${id}`, {
      method: 'DELETE',
    });
  },

  // Itinerary endpoints
  getItinerary: async (tripId: string) => {
    return apiRequest(`/trips/${tripId}/itinerary`);
  },

  addItineraryStop: async (tripId: string, stopData: {
    name: string;
    activity: string;
    time: string;
  }) => {
    return apiRequest(`/trips/${tripId}/itinerary`, {
      method: 'POST',
      body: JSON.stringify(stopData),
    });
  },

  updateItineraryStop: async (stopId: string, stopData: any) => {
    return apiRequest(`/destinations/${stopId}`, {
      method: 'PATCH',
      body: JSON.stringify(stopData),
    });
  },

  deleteItineraryStop: async (stopId: string) => {
    return apiRequest(`/destinations/${stopId}`, {
      method: 'DELETE',
    });
  },

  // Expense endpoints
  getExpenses: async (tripId: string) => {
    return apiRequest(`/trips/${tripId}/expenses`);
  },

  addExpense: async (tripId: string, expenseData: {
    item: string;
    amount: number;
    category: string;
  }) => {
    return apiRequest(`/trips/${tripId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  },

  deleteExpense: async (expenseId: string) => {
    return apiRequest(`/expenses/${expenseId}`, {
      method: 'DELETE',
    });
  },

  // Collaborator endpoints
  inviteCollaborator: async (tripId: string, username: string, role: string = 'editor') => {
    return apiRequest(`/trips/${tripId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ username, role }),
    });
  },

  // Packing list endpoints
  getPackingList: async (tripId: string) => {
    return apiRequest(`/trips/${tripId}/packing`);
  },

  addPackingItem: async (tripId: string, itemData: {
    name: string;
    category: string;
    quantity?: number;
    notes?: string;
  }) => {
    return apiRequest(`/trips/${tripId}/packing`, {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  },

  updatePackingItem: async (itemId: string, itemData: {
    name?: string;
    category?: string;
    quantity?: number;
    isPacked?: boolean;
    notes?: string;
  }) => {
    return apiRequest(`/trips/packing/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(itemData),
    });
  },

  deletePackingItem: async (itemId: string) => {
    return apiRequest(`/trips/packing/${itemId}`, {
      method: 'DELETE',
    });
  },
};

// Message API
export const messageAPI = {
  // Get all matches/conversations
  getMatches: async () => {
    return apiRequest('/messages/matches');
  },

  // Get messages with a specific user
  getMessages: async (otherUserId: string) => {
    return apiRequest(`/messages/${otherUserId}`);
  },

  // Send a message with client-side ID for deduplication
  sendMessage: async (receiverId: string, text: string, clientSideId: string, replyToId?: string) => {
    return apiRequest('/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, text, clientSideId, replyToId }),
    });
  },

  // Send an image message
  sendImageMessage: async (receiverId: string, imageUrl: string, clientSideId: string, imagePublicId: string, text?: string, replyToId?: string) => {
    return apiRequest('/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, image: imageUrl, imagePublicId, text, clientSideId, replyToId }),
    });
  },

  // Get Cloudinary signature for secure uploads
  getCloudinarySignature: async () => {
    return apiRequest('/messages/cloudinary-sign');
  },

  // Get WebRTC configuration with TURN server credentials
  getWebRTCConfig: async () => {
    return apiRequest('/messages/webrtc-config');
  },

  // Create a match
  createMatch: async (otherUserId: string) => {
    return apiRequest('/messages/matches', {
      method: 'POST',
      body: JSON.stringify({ otherUserId }),
    });
  },

  // Mark message as read
  markAsRead: async (messageId: string) => {
    return apiRequest(`/messages/${messageId}/read`, {
      method: 'PUT',
    });
  },

  // Mark multiple messages as read (batch operation)
  markMultipleAsRead: async (messageIds: string[]) => {
    return apiRequest('/messages/bulk-read', {
      method: 'PUT',
      body: JSON.stringify({ messageIds }),
    });
  },

  // Get unread count
  getUnreadCount: async () => {
    return apiRequest('/messages/unread/count');
  },

  // Delete single message
  deleteMessage: async (messageId: string) => {
    return apiRequest(`/messages/message/${messageId}`, {
      method: 'DELETE',
    });
  },

  // Delete entire conversation
  deleteConversation: async (otherUserId: string) => {
    return apiRequest(`/messages/conversation/${otherUserId}`, {
      method: 'DELETE',
    });
  },

  // Block user
  blockUser: async (otherUserId: string) => {
    return apiRequest(`/messages/block/${otherUserId}`, {
      method: 'POST',
    });
  },

  // Unblock user
  unblockUser: async (otherUserId: string) => {
    return apiRequest(`/messages/unblock/${otherUserId}`, {
      method: 'POST',
    });
  },

  // Pin conversation
  pinConversation: async (otherUserId: string) => {
    return apiRequest(`/messages/pin/${otherUserId}`, {
      method: 'POST',
    });
  },

  // Unpin conversation
  unpinConversation: async (otherUserId: string) => {
    return apiRequest(`/messages/unpin/${otherUserId}`, {
      method: 'POST',
    });
  },

  // Set nickname
  setNickname: async (otherUserId: string, nickname: string) => {
    return apiRequest(`/messages/nickname/${otherUserId}`, {
      method: 'POST',
      body: JSON.stringify({ nickname }),
    });
  },

  // Mute conversation
  muteConversation: async (otherUserId: string) => {
    return apiRequest(`/messages/mute/${otherUserId}`, {
      method: 'POST',
    });
  },

  // Unmute conversation
  unmuteConversation: async (otherUserId: string) => {
    return apiRequest(`/messages/unmute/${otherUserId}`, {
      method: 'POST',
    });
  },

  // Get blocked users
  getBlockedUsers: async () => {
    return apiRequest('/messages/blocked');
  },

  // Unmatch user
  unmatchUser: async (otherUserId: string) => {
    return apiRequest(`/messages/unmatch/${otherUserId}`, {
      method: 'DELETE',
    });
  },

  // Add reaction to message
  addReaction: async (messageId: string, emoji: string) => {
    return apiRequest(`/messages/reaction/${messageId}`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    });
  },

  // Remove reaction from message
  removeReaction: async (messageId: string, emoji: string) => {
    return apiRequest(`/messages/reaction/${messageId}`, {
      method: 'DELETE',
      body: JSON.stringify({ emoji }),
    });
  },

  // Clear message notifications
  clearMessageNotifications: async (otherUserId: string) => {
    return apiRequest(`/messages/notifications/clear/${otherUserId}`, {
      method: 'POST',
    });
  },
};

// Admin API
export const adminAPI = {
  // Get dashboard stats
  getStats: async () => {
    return apiRequest('/admin/stats');
  },

  // User management
  getUsers: async (page = 1, limit = 20, search = '') => {
    const params = new URLSearchParams({ 
      page: page.toString(), 
      limit: limit.toString(),
      ...(search && { search })
    });
    return apiRequest(`/admin/users?${params.toString()}`);
  },

  updateUser: async (id: string, userData: {
    name?: string;
    email?: string;
    username?: string;
    isAdmin?: boolean;
    password?: string;
  }) => {
    return apiRequest(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  },

  deleteUser: async (id: string) => {
    return apiRequest(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Trip management
  getTrips: async (page = 1, limit = 20, search = '') => {
    const params = new URLSearchParams({ 
      page: page.toString(), 
      limit: limit.toString(),
      ...(search && { search })
    });
    return apiRequest(`/admin/trips?${params.toString()}`);
  },

  deleteTrip: async (id: string) => {
    return apiRequest(`/admin/trips/${id}`, {
      method: 'DELETE',
    });
  },

  // Gear management
  getGear: async (page = 1, limit = 20, search = '') => {
    const params = new URLSearchParams({ 
      page: page.toString(), 
      limit: limit.toString(),
      ...(search && { search })
    });
    return apiRequest(`/admin/gear?${params.toString()}`);
  },

  updateGear: async (id: string, gearData: {
    available?: boolean;
  }) => {
    return apiRequest(`/admin/gear/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(gearData),
    });
  },

  deleteGear: async (id: string) => {
    return apiRequest(`/admin/gear/${id}`, {
      method: 'DELETE',
    });
  },
};

export default {
  gear: gearAPI,
  booking: bookingAPI,
  auth: authAPI,
  trip: tripAPI,
  user: userAPI,
  message: messageAPI,
  admin: adminAPI,
};


// Notification API
export const notificationAPI = {
  // Get all notifications
  getNotifications: async (page = 1, limit = 20, unreadOnly = false) => {
    return apiRequest(`/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`);
  },

  // Get unread count
  getUnreadCount: async () => {
    return apiRequest('/notifications/unread/count');
  },

  // Mark notification as read
  markAsRead: async (notificationId: string) => {
    return apiRequest(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },

  // Mark all as read
  markAllAsRead: async () => {
    return apiRequest('/notifications/read-all', {
      method: 'PUT',
    });
  },

  // Delete notification
  deleteNotification: async (notificationId: string) => {
    return apiRequest(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },

  // Delete all read notifications
  deleteAllRead: async () => {
    return apiRequest('/notifications/read/all', {
      method: 'DELETE',
    });
  },
};
