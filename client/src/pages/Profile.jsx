import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  User, MapPin, Clock, DollarSign, Settings, History, Star, Plus, Award, Target, 
  Calendar, TrendingUp, Trash2, Camera, Edit3, Check, X, AlertCircle, Save, Filter, Search, MoreVertical, Edit2, ExternalLink
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('routes');
  const [isEditing, setIsEditing] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [tripHistory, setTripHistory] = useState([]);
  const [totalTrips, setTotalTrips] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [filterVehicleType, setFilterVehicleType] = useState('all');
  const [defaultVehicleType, setDefaultVehicleType] = useState('Car');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [adminRequestStatus, setAdminRequestStatus] = useState('none'); // none, pending, accepted, rejected
  const [showAdminRequest, setShowAdminRequest] = useState(false);
  const [adminRequestReason, setAdminRequestReason] = useState('');
  const [requests, setRequests] = useState([
    {
      _id: '1',
      issueType: 'Incorrect Toll Price',
      source: 'Mumbai',
      destination: 'Pune',
      description: 'The calculated toll price seems higher than the actual toll price charged at the booth.',
      expectedPrice: 150,
      calculatedPrice: 200,
      status: 'pending',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      _id: '2',
      issueType: 'Missing Toll Booth',
      source: 'Delhi',
      destination: 'Jaipur',
      description: 'There is a toll booth on NH-8 that is not included in the route calculation.',
      status: 'under_review',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      _id: '3',
      issueType: 'Route Error',
      source: 'Bangalore',
      destination: 'Chennai',
      description: 'The suggested route takes a longer path. There is a shorter route available.',
      status: 'resolved',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    }
  ]);
  const [user, setUser] = useState({
    name: localStorage.getItem('name') || 'User',
    email: localStorage.getItem('email') || 'user@example.com',
    profileImage: localStorage.getItem('profileImage') || '/default-avatar.png',
    isAdmin: localStorage.getItem('isAdmin') === 'true'
  });

  // Add state for admin requests
  const [adminRequests, setAdminRequests] = useState([]);

  // Mock data for enhanced features (replace with real data later)
  const achievements = [
    { id: 1, title: 'Money Saver', description: 'Saved over $100', icon: DollarSign, earned: true },
    { id: 2, title: 'Route Master', description: 'Used 10+ different routes', icon: MapPin, earned: true },
    { id: 3, title: 'Frequent Traveler', description: 'Completed 25+ trips', icon: Target, earned: false },
    { id: 4, title: 'Eco Warrior', description: 'Reduced CO2 by 50kg', icon: Award, earned: true },
  ];

  const tabs = [
    { id: 'routes', label: 'Saved Routes', icon: MapPin },
    { id: 'history', label: 'Trip History', icon: History },
    { id: 'requests', label: 'My Requests', icon: AlertCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Fetch user data including admin status
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        toast.error('Please login to view profile');
        navigate('/auth');
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.user) {
        setUser(response.data.user);
        console.log('Profile.jsx: fetchUserData - User state after update:', response.data.user);
        console.log('Profile.jsx: fetchUserData - User isAdmin flag from API:', response.data.user.isAdmin);
        // If user is admin, set adminRequestStatus to 'accepted'
        if (response.data.user.isAdmin) {
          setAdminRequestStatus('accepted');
          console.log('Profile.jsx: fetchUserData - User is admin, setting adminRequestStatus to accepted.');
        } else {
          // If not admin, fetch their request status
          fetchUserAdminRequest();
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false); // Ensure loading is set to false after attempt
    }
  };

  // Function to fetch saved routes and trip history
  const fetchRoutesAndHistory = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      console.log('No token or userId for fetching routes, skipping.');
      return;
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/routes`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Routes API response:', response.data);
      const fetchedRoutes = response.data.filter(route => route.isSaved);
      const fetchedTripHistory = response.data.filter(route => !route.isSaved);
      setRoutes(fetchedRoutes);
      setTripHistory(fetchedTripHistory);
      setTotalTrips(fetchedTripHistory.length);
      setSavedCount(fetchedRoutes.length);
    } catch (error) {
      console.error('Error fetching routes and history:', error);
      toast.error('Failed to load routes and trip history.');
    } finally {
      setLoading(false); // Ensure loading is set to false after attempt
    }
  };

  // Delete route
  const handleDeleteRoute = async (routeId) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        toast.error('Please login again');
        navigate('/auth');
        return;
      }

      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/routes/${routeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Route deleted successfully!');
      fetchRoutesAndHistory(); // Refresh routes after deletion
    } catch (error) {
      console.error('Error deleting route:', error);
      toast.error('Failed to delete route');
    }
  };

  // Use effect to fetch data on component mount
  useEffect(() => {
    setLoading(true); // Set loading to true when starting data fetch
    fetchUserData();
    fetchRoutesAndHistory(); // Call to fetch routes and history
    if (!user.isAdmin) { // Only fetch user admin request if not an admin
      fetchUserAdminRequest();
    }
    if (user.isAdmin) {
      fetchAdminRequests();
    }
  }, [navigate, user.isAdmin]);

  // Consolidated Profile Update Handler
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    console.log('handleProfileUpdate function called');
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId'); // This will be adminId if isAdmin is true

    const apiUrl = user.isAdmin 
      ? `${import.meta.env.VITE_API_BASE_URL}/api/users/admin-profile` 
      : `${import.meta.env.VITE_API_BASE_URL}/api/users/profile`;

    if (!token || !userId) {
      toast.error('Please login again');
      navigate('/auth');
      return;
    }

    let updatePayload = {};

    if (e.target.files && e.target.files[0]) { // Check if it's a file input change
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      const loadingToast = toast.loading('Processing image...');
      setImageLoading(true);

      try {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = () => {
          img.src = reader.result;
        };

        img.onload = async () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const resizedImage = canvas.toDataURL('image/jpeg', 0.7);
          
          const formData = new FormData();
          formData.append('image', resizedImage);
          formData.append(user.isAdmin ? 'adminId' : 'userId', userId); // Use userId from localStorage

          console.log('Frontend: FormData payload before sending:', formData);

          // Send the API request after image processing
          try {
            const response = await axios.put(
              apiUrl,
              formData,
              {
                headers: { Authorization: `Bearer ${token}` }, // Axios automatically sets Content-Type for FormData
              }
            );

            if (response.data) {
              console.log('Image update response data:', response.data);
              setUser(prev => ({
                ...prev,
                profileImage: response.data[user.isAdmin ? 'admin' : 'user'].profileImage
              }));
              localStorage.setItem('profileImage', response.data[user.isAdmin ? 'admin' : 'user'].profileImage);
              toast.dismiss(loadingToast);
              toast.success('Profile picture updated successfully!');
            }
          } catch (error) {
            console.error('Error uploading image:', error);
            toast.dismiss(loadingToast);
            toast.error(error.response?.data?.message || 'Failed to update profile picture');
          } finally {
            setImageLoading(false);
          }
        };

        img.onerror = () => {
          toast.dismiss(loadingToast);
          setImageLoading(false);
          toast.error('Error processing image');
        };

        reader.readAsDataURL(file);

      } catch (error) {
        console.error('Error processing image:', error);
        toast.error('Failed to process image');
        setImageLoading(false);
      }
    } else { // Assume it's a name update
      updatePayload = { name: user.name };
      if (user.isAdmin) {
        updatePayload.adminId = userId; // Add adminId to payload for admin profile update
      } else {
        updatePayload.userId = userId; // Add userId to payload for user profile update
      }

      try {
        const response = await axios.put(
          apiUrl,
          updatePayload,
          {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          }
        );

        if (response.data) {
          setUser(prev => ({
            ...prev,
            name: response.data[user.isAdmin ? 'admin' : 'user'].name
          }));
          localStorage.setItem('name', response.data[user.isAdmin ? 'admin' : 'user'].name);
          toast.success('Profile updated successfully!');
          setIsEditing(false);
        }
      } catch (error) {
        console.error('Error updating name:', error);
        if (error.response?.status === 401) {
          toast.error('Session expired. Please login again');
          navigate('/auth');
        } else {
          toast.error('Failed to update profile');
        }
      }
    }
  };

  // Update default vehicle type
  const handleVehicleTypeUpdate = async (newVehicleType) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (!token || !userId) {
        toast.error('Please login again');
        navigate('/auth');
        return;
      }

      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/users/profile?userId=${userId}`, 
        { defaultVehicleType: newVehicleType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDefaultVehicleType(newVehicleType);
      toast.success('Default vehicle type updated!');
    } catch (error) {
      console.error('Error updating vehicle type:', error);
      toast.error('Failed to update vehicle type');
    }
  };

  const handleImageError = () => {
    setUser(prev => ({
      ...prev,
      profileImage: '/default-avatar.png'
    }));
  };

  // Handle clear all routes
  const handleClearAllRoutes = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        toast.error('Please login again');
        navigate('/auth');
        return;
      }

      // Delete all routes one by one
      const deletePromises = routes.map(route => 
        axios.delete(
          `${import.meta.env.VITE_API_BASE_URL}/api/users/routes/${route._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );

      await Promise.all(deletePromises);
      
      setShowClearConfirm(false);
      toast.success('All routes cleared successfully!');
      fetchRoutesAndHistory(); // Refresh routes after clearing
    } catch (error) {
      console.error('Error clearing routes:', error);
      toast.error('Failed to clear routes');
      setShowClearConfirm(false);
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      toast.error('Please enter your password to confirm');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        toast.error('Please login again');
        navigate('/auth');
        return;
      }

      // Here you would typically verify password and delete account
      // For now, just showing the flow
      toast.error('Account deletion feature not implemented yet');
      setShowDeleteConfirm(false);
      setDeletePassword('');
      
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
      setShowDeleteConfirm(false);
      setDeletePassword('');
    }
  };

  // Calculate stats from routes
  const savedRoutes = routes.filter(route => route.isSaved === true);
  const totalSaved = savedRoutes.reduce((sum, route) => sum + (route.price || 0), 0);
  const totalSavedRoutes = savedRoutes.length;

  // Fetch user's admin request status
  const fetchUserAdminRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/user-admin-request`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.status) {
        setAdminRequestStatus(response.data.status);
        console.log('Profile.jsx: fetchUserAdminRequest - Admin request status set to:', response.data.status);
      }
    } catch (error) {
      console.error('Error fetching admin request status:', error);
    }
  };

  // Submit admin request
  const handleAdminRequest = async () => {
    if (!adminRequestReason.trim()) {
      toast.error('Please provide a reason for admin request');
      return;
    }
    try {
      const userId = localStorage.getItem('userId');
      const email = localStorage.getItem('email');
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('You must be logged in to submit an admin request.');
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/admin-request`,
        { userId, userEmail: email, reason: adminRequestReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdminRequestStatus('pending');
      setShowAdminRequest(false);
      setAdminRequestReason('');
      toast.success('Admin request submitted successfully!');
    } catch (error) {
      console.error('Error submitting admin request:', error);
      toast.error(error.response?.data?.message || 'Failed to submit admin request');
    }
  };

  // Fetch all admin requests (admin side)
  const fetchAdminRequests = async () => {
    if (!user.isAdmin) return;
    try {
      const token = localStorage.getItem('token'); // Simplified token retrieval
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/admin-requests`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdminRequests(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch admin requests');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.clear();
    toast.success('Logged out successfully!');
    navigate('/auth');
  };

  // Approve/reject admin request (admin side)
  const handleAdminRequestAction = async (requestId, action) => {
    try {
      const token = localStorage.getItem('token'); // Simplified token retrieval

      // Map the action string to the correct enum value for the backend
      const backendAction = action === 'accept' ? 'accepted' : 'rejected';

      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/admin-request/${requestId}`,
        { action: backendAction }, // Send the corrected action string
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Request ${action}ed successfully`);
      fetchAdminRequests();
    } catch (error) {
      console.error('Error updating admin request action:', error);
      toast.error(error.response?.data?.message || `Failed to ${action} request`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-black dark:via-gray-900 dark:to-black">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-red-900/95 to-red-800/90 dark:from-black dark:to-red-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div 
              className="relative w-32 h-32 mx-auto mb-6"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <img
                src={user.profileImage}
                alt="Profile"
                className="w-32 h-32 object-cover rounded-full border-4 border-white/20 shadow-xl"
                onError={handleImageError}
              />
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileUpdate}
                className="hidden"
                id="profileImageInput"
              />
              <label
                htmlFor="profileImageInput"
                className="absolute bottom-0 right-0 cursor-pointer p-2 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transition-all"
              >
                <Camera className="w-4 h-4" />
              </label>
            </motion.div>
            
            <div className="flex items-center justify-center space-x-3 mb-2">
              {!isEditing ? (
                <>
                  <h1 className="text-4xl font-bold text-white">{user.name}</h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 rounded-full hover:bg-white/10 transition"
                  >
                    <Edit3 className="w-5 h-5 text-white" />
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    className="text-4xl font-bold bg-transparent border-b border-white/30 focus:outline-none focus:border-white text-white text-center"
                  />
                  <button
                    onClick={handleProfileUpdate}
                    className="p-2 rounded-full hover:bg-white/10 transition text-green-400"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-2 rounded-full hover:bg-white/10 transition text-red-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            
                                     <p className="text-white/80 text-lg mb-4">{user.email}</p>
            
            {/* Admin Request Section - Only show if not admin */}
            <div className="mb-6">
              {!user.isAdmin && adminRequestStatus === 'none' && (
                <motion.button
                  onClick={() => setShowAdminRequest(true)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg transition-all backdrop-blur-sm border border-white/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🛡️ Become Admin
                </motion.button>
              )}
              
              {!user.isAdmin && adminRequestStatus === 'pending' && (
                <div className="bg-yellow-500 bg-opacity-20 text-yellow-100 px-6 py-3 rounded-lg backdrop-blur-sm border border-yellow-300/20 flex items-center justify-center space-x-2">
                  <span>⏳</span>
                  <span>Admin Request Pending</span>
                </div>
              )}
              
              {user.isAdmin && (
                <div className="bg-green-500 bg-opacity-20 text-green-100 px-6 py-3 rounded-lg backdrop-blur-sm border border-green-300/20 flex items-center justify-center space-x-2">
                  <span>✅</span>
                  <span>Admin Access Granted</span>
                </div>
              )}
              
              {!user.isAdmin && adminRequestStatus === 'rejected' && (
                <div className="bg-red-500 bg-opacity-20 text-red-100 px-6 py-3 rounded-lg backdrop-blur-sm border border-red-300/20 flex items-center justify-center space-x-2">
                  <span>❌</span>
                  <span>Admin Request Rejected</span>
                  <button
                    onClick={() => setAdminRequestStatus('none')}
                    className="text-white hover:text-gray-200 underline text-sm ml-4"
                  >
                    Request Again
                  </button>
                </div>
              )}
            </div>
            
            <p className="text-white/70 text-lg mb-6">Track your savings, manage routes, and optimize your travels</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Loading indicator */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
        ) : (
          <>
                         {/* Enhanced Stats Cards */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
             >
               <motion.div 
                 className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 text-center"
                 whileHover={{ scale: 1.02, y: -2 }}
               >
                 <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                   <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalSavedRoutes}</h3>
                 <p className="text-gray-600 dark:text-gray-400">Routes Saved</p>
                 <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Ready to use</div>
               </motion.div>
 
               <motion.div 
                 className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 text-center"
                 whileHover={{ scale: 1.02, y: -2 }}
               >
                 <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                   <History className="h-6 w-6 text-green-600 dark:text-green-400" />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalTrips}</h3>
                 <p className="text-gray-600 dark:text-gray-400">Total Trips</p>
                 <div className="text-xs text-green-600 dark:text-green-400 mt-1">All calculated</div>
               </motion.div>
             </motion.div>

            {/* Enhanced Tab Navigation */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg mb-8">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6 overflow-x-auto">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-2 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
                          activeTab === tab.id
                            ? 'border-red-500 text-red-600 dark:text-red-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Icon className="h-5 w-5" />
                          <span>{tab.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

                             <div className="p-6">
                 {/* Enhanced Saved Routes Tab */}
                {activeTab === 'routes' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Your Saved Routes</h3>
                      <motion.button 
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/calculator')}
                      >
                        <Plus className="h-5 w-5" />
                        <span>Add Route</span>
                      </motion.button>
                    </div>

                                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                       {savedRoutes.map((route) => (
                        <motion.div 
                          key={route._id} 
                          className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all"
                          whileHover={{ scale: 1.02, y: -2 }}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {route.source} → {route.destination}
                              </h4>
                            </div>
                            <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-2 py-1 rounded-full text-xs font-medium">
                              {route.vehicleType}
                            </span>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <p className="text-gray-600 dark:text-gray-400 flex items-center">
                              <MapPin className="h-4 w-4 inline mr-2" />
                              Route optimized for cost efficiency
                            </p>
                          </div>

                          <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Toll Cost</p>
                              <p className="text-xl font-bold text-green-600 dark:text-green-400">₹{route.price?.toFixed(2) ?? 'N/A'}</p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  localStorage.setItem('routeToUse', JSON.stringify({
                                    source: route.source,
                                    destination: route.destination,
                                    vehicleType: route.vehicleType
                                  }));
                                  navigate('/calculator');
                                }}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition"
                                title="Use this route"
                              >
                                Use Route
                              </button>
                              <button
                                onClick={() => handleDeleteRoute(route._id)}
                                className="p-2 rounded-full text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30 transition"
                                aria-label="Delete route"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                                         {savedRoutes.length === 0 && (
                      <div className="text-center py-12">
                        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No saved routes yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Start by calculating your first route</p>
                        <motion.button 
                          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate('/calculator')}
                        >
                          Calculate Route
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                )}

                                                  {/* Trip History Tab */}
                 {activeTab === 'history' && (
                   <motion.div
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="space-y-6"
                   >
                     <div className="flex justify-between items-center">
                       <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Trip History</h3>
                       <div className="flex space-x-2">
                         <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                           <option>All Time</option>
                           <option>This Month</option>
                           <option>Last 3 Months</option>
                         </select>
                         <select 
                           value={filterVehicleType}
                           onChange={(e) => setFilterVehicleType(e.target.value)}
                           className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                         >
                           <option value="all">All Vehicles</option>
                           <option value="Car">Car</option>
                           <option value="Light Commercial Vehicle">Light Commercial Vehicle</option>
                           <option value="Bus">Bus</option>
                           <option value="3 Axle Truck">3 Axle Truck</option>
                           <option value="4 Axle Truck">4 Axle Truck</option>
                           <option value="Heavy Commercial Vehicle">Heavy Commercial Vehicle</option>
                           <option value="5 or More Axle Truck">5 or More Axle Truck</option>
                         </select>
                       </div>
                     </div>
                     
                     {tripHistory.length === 0 ? (
                       <div className="text-center py-12">
                         <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                         <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No trip history yet</h3>
                         <p className="text-gray-600 dark:text-gray-400 mb-4">Start by calculating and saving your first route</p>
                         <motion.button 
                           className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                           whileHover={{ scale: 1.05 }}
                           whileTap={{ scale: 0.95 }}
                           onClick={() => navigate('/calculator')}
                         >
                           Calculate Route
                         </motion.button>
                       </div>
                     ) : (
                       <>
                         {tripHistory.filter(route => filterVehicleType === 'all' || route.vehicleType === filterVehicleType).length === 0 ? (
                           <div className="text-center py-12">
                             <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                             <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No trips found</h3>
                             <p className="text-gray-600 dark:text-gray-400 mb-4">Try changing your filter criteria</p>
                             <motion.button 
                               className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                               whileHover={{ scale: 1.05 }}
                               whileTap={{ scale: 0.95 }}
                               onClick={() => setFilterVehicleType('all')}
                             >
                               Clear Filters
                             </motion.button>
                           </div>
                         ) : (
                           <div className="overflow-x-auto">
                             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                           <thead className="bg-gray-50 dark:bg-gray-800">
                             <tr>
                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                 Route
                               </th>
                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                 Vehicle Type
                               </th>
                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                 Toll Cost
                               </th>
                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                 Date Saved
                               </th>
                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                 Status
                               </th>
                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                 Actions
                               </th>
                             </tr>
                           </thead>
                           <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                             {tripHistory
                               .filter(route => 
                                 filterVehicleType === 'all' || route.vehicleType === filterVehicleType
                               )
                               .map((route, index) => (
                               <motion.tr 
                                 key={route._id} 
                                 className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                 initial={{ opacity: 0, y: 20 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 transition={{ delay: index * 0.1 }}
                               >
                                 <td className="px-6 py-4 whitespace-nowrap">
                                   <div className="text-sm font-medium text-gray-900 dark:text-white">
                                     {route.source} → {route.destination}
                                   </div>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                                     {route.vehicleType}
                                   </span>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                   ₹{route.price?.toFixed(2) ?? 'N/A'}
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                   {new Date().toLocaleDateString('en-IN')}
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                                     {route.isSaved ? 'Saved' : 'Calculated'}
                                   </span>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                   <button
                                     onClick={() => {
                                       // Save route data to localStorage for Calculator to pick up
                                       localStorage.setItem('routeToUse', JSON.stringify({
                                         source: route.source,
                                         destination: route.destination,
                                         vehicleType: route.vehicleType
                                       }));
                                       navigate('/calculator');
                                     }}
                                     className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 mr-3"
                                   >
                                     Use Route
                                   </button>
                                   <button
                                     onClick={() => handleDeleteRoute(route._id)}
                                     className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                   >
                                     Delete
                                   </button>
                                 </td>
                               </motion.tr>
                             ))}
                                                          </tbody>
                           </table>
                                                    </div>
                         )}
                       </>
                     )}
                   </motion.div>
                 )}

                 {/* Requests Tab - Add admin request management for admins */}
                 {activeTab === 'requests' && (
                   <motion.div
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="space-y-6"
                   >
                     <div className="flex justify-between items-center">
                       <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                         {user.isAdmin ? 'Admin Requests' : 'My Requests'}
                       </h3>
                     </div>
                     
                     {user.isAdmin ? (
                       // Admin view for managing requests
                       <div className="overflow-x-auto">
                         <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                           <thead className="bg-gray-50 dark:bg-gray-800">
                             <tr>
                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                 User
                               </th>
                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                 Email
                               </th>
                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                 Reason
                               </th>
                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                 Status
                               </th>
                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                 Requested At
                               </th>
                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                 Actions
                               </th>
                             </tr>
                           </thead>
                           <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                             {adminRequests.map((request) => (
                               <motion.tr 
                                 key={request._id}
                                 className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                               >
                                 <td className="px-6 py-4 whitespace-nowrap">
                                   <div className="text-sm font-medium text-gray-900 dark:text-white">
                                     {request.userName}
                                   </div>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                   <div className="text-sm text-gray-500 dark:text-gray-400">
                                     {request.userEmail}
                                   </div>
                                 </td>
                                 <td className="px-6 py-4">
                                   <div className="text-sm text-gray-900 dark:text-white">
                                     {request.reason}
                                   </div>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                     ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                       request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                       'bg-red-100 text-red-800'}`}>
                                     {request.status}
                                   </span>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                   <div className="text-sm text-gray-500 dark:text-gray-400">
                                     {new Date(request.createdAt).toLocaleDateString()}
                                   </div>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                   {request.status === 'pending' && (
                                     <div className="flex space-x-2">
                                       <button
                                         onClick={() => handleAdminRequestAction(request._id, 'accept')}
                                         className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                       >
                                         Accept
                                       </button>
                                       <button
                                         onClick={() => handleAdminRequestAction(request._id, 'reject')}
                                         className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                       >
                                         Reject
                                       </button>
                                     </div>
                                   )}
                                 </td>
                               </motion.tr>
                             ))}
                           </tbody>
                         </table>
                       </div>
                     ) : (
                       // Regular user view for their requests
                       <>
                         {requests.length === 0 ? (
                           <div className="text-center py-12">
                             <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No requests yet</h3>
                             <p className="text-gray-600 dark:text-gray-400 mb-4">Start by reporting a new issue</p>
                             <motion.button 
                               className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                               whileHover={{ scale: 1.05 }}
                               whileTap={{ scale: 0.95 }}
                               onClick={() => navigate('/report-issue')}
                             >
                               Report Issue
                             </motion.button>
                           </div>
                         ) : (
                           <div className="overflow-x-auto">
                             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                               <thead className="bg-gray-50 dark:bg-gray-800">
                                 <tr>
                                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                     Issue Type
                                   </th>
                                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                     Source
                                   </th>
                                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                     Destination
                                   </th>
                                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                     Description
                                   </th>
                                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                     Expected Price
                                   </th>
                                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                     Calculated Price
                                   </th>
                                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                     Status
                                   </th>
                                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                     Date Reported
                                   </th>
                                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                     Actions
                                   </th>
                                 </tr>
                               </thead>
                               <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                 {requests.map((request, index) => (
                                   <motion.tr 
                                     key={request._id} 
                                     className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                     initial={{ opacity: 0, y: 20 }}
                                     animate={{ opacity: 1, y: 0 }}
                                     transition={{ delay: index * 0.1 }}
                                   >
                                     <td className="px-6 py-4 whitespace-nowrap">
                                       <div className="text-sm font-medium text-gray-900 dark:text-white">
                                         {request.issueType}
                                       </div>
                                     </td>
                                     <td className="px-6 py-4 whitespace-nowrap">
                                       <div className="text-sm font-medium text-gray-900 dark:text-white">
                                         {request.source}
                                       </div>
                                     </td>
                                     <td className="px-6 py-4 whitespace-nowrap">
                                       <div className="text-sm font-medium text-gray-900 dark:text-white">
                                         {request.destination}
                                       </div>
                                     </td>
                                     <td className="px-6 py-4 whitespace-nowrap">
                                       <div className="text-sm font-medium text-gray-900 dark:text-white">
                                         {request.description}
                                       </div>
                                     </td>
                                     <td className="px-6 py-4 whitespace-nowrap">
                                       <div className="text-sm font-medium text-gray-900 dark:text-white">
                                         ₹{request.expectedPrice}
                                       </div>
                                     </td>
                                     <td className="px-6 py-4 whitespace-nowrap">
                                       <div className="text-sm font-medium text-gray-900 dark:text-white">
                                         ₹{request.calculatedPrice}
                                       </div>
                                     </td>
                                     <td className="px-6 py-4 whitespace-nowrap">
                                       <div className="text-sm font-medium text-gray-900 dark:text-white">
                                         {request.status}
                                       </div>
                                     </td>
                                     <td className="px-6 py-4 whitespace-nowrap">
                                       <div className="text-sm font-medium text-gray-900 dark:text-white">
                                         {new Date(request.createdAt).toLocaleDateString('en-IN')}
                                       </div>
                                     </td>
                                     <td className="px-6 py-4 whitespace-nowrap">
                                       <div className="text-sm font-medium text-gray-900 dark:text-white">
                                         <button
                                           onClick={() => navigate('/view-issue', { state: request })}
                                           className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 mr-3"
                                         >
                                           View
                                         </button>
                                         <button
                                           onClick={() => handleDeleteRoute(request._id)}
                                           className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                         >
                                           Delete
                                         </button>
                                       </div>
                                     </td>
                                   </motion.tr>
                                 ))}
                               </tbody>
                             </table>
                           </div>
                         )}
                       </>
                     )}
                   </motion.div>
                 )}

                 {/* Settings Tab */}
                 {activeTab === 'settings' && (
                   <motion.div
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="space-y-6"
                   >
                     <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h3>
                     <div className="space-y-6">
                       {/* Profile Settings */}
                       <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                         <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Profile Settings</h4>
                         <div className="space-y-4">
                           {user.isAdmin ? (
                             <form onSubmit={handleProfileUpdate} className="space-y-4">
                               <div>
                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                   Name
                                 </label>
                                 <input
                                   type="text"
                                   value={user.name}
                                   onChange={(e) => setUser({ ...user, name: e.target.value })}
                                   className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                 />
                               </div>
                               <div>
                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                   Email Address
                                 </label>
                                 <input
                                   type="email"
                                   value={user.email}
                                   onChange={(e) => setUser({ ...user, email: e.target.value })}
                                   className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                 />
                               </div>
                               <div>
                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                   New Password
                                 </label>
                                 <input
                                   type="password"
                                   value={user.password || ''}
                                   onChange={(e) => setUser({ ...user, password: e.target.value })}
                                   className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                   placeholder="Enter new password"
                                 />
                               </div>
                               <motion.button
                                 whileHover={{ scale: 1.02 }}
                                 whileTap={{ scale: 0.98 }}
                                 type="submit"
                                 className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                               >
                                 Update Admin Profile
                               </motion.button>
                             </form>
                           ) : (
                             <>
                               <div className="space-y-4">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   <div>
                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                       Display Name
                                     </label>
                                     <input
                                       type="text"
                                       value={user.name}
                                       onChange={(e) => setUser({ ...user, name: e.target.value })}
                                       className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                     />
                                   </div>
                                   <div>
                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                       Email Address
                                     </label>
                                     <input
                                       type="email"
                                       value={user.email}
                                       disabled
                                       className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                                     />
                                   </div>
                                 </div>
                                 <div className="flex space-x-4">
                                   <motion.button
                                     whileHover={{ scale: 1.02 }}
                                     whileTap={{ scale: 0.98 }}
                                     onClick={handleProfileUpdate}
                                     className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                   >
                                     Update Profile
                                   </motion.button>
                                   <motion.button
                                     whileHover={{ scale: 1.02 }}
                                     whileTap={{ scale: 0.98 }}
                                     onClick={() => navigate('/forget-password')}
                                     className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                   >
                                     Reset Password
                                   </motion.button>
                                 </div>
                               </div>
                             </>
                           )}
                         </div>
                       </div>

                       {/* App Preferences */}
                       <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                         <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Preferences</h4>
                         <div className="space-y-4">
                           <div className="flex items-center justify-between">
                             <div>
                               <p className="font-medium text-gray-900 dark:text-white">Default Vehicle Type</p>
                               <p className="text-sm text-gray-600 dark:text-gray-400">Set your preferred vehicle for calculations</p>
                             </div>
                             <select 
                               value={defaultVehicleType}
                               onChange={(e) => handleVehicleTypeUpdate(e.target.value)}
                               className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                             >
                               <option value="Car">Car</option>
                               <option value="Light Commercial Vehicle">Light Commercial Vehicle</option>
                               <option value="Bus">Bus</option>
                               <option value="3 Axle Truck">3 Axle Truck</option>
                               <option value="4 Axle Truck">4 Axle Truck</option>
                               <option value="Heavy Commercial Vehicle">Heavy Commercial Vehicle</option>
                               <option value="5 or More Axle Truck">5 or More Axle Truck</option>
                             </select>
                           </div>
                           


                           <div className="flex items-center justify-between">
                             <div>
                               <p className="font-medium text-gray-900 dark:text-white">Auto-save Routes</p>
                               <p className="text-sm text-gray-600 dark:text-gray-400">Automatically save calculated routes</p>
                             </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                               <input type="checkbox" className="sr-only peer" />
                               <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                             </label>
                           </div>
                         </div>
                       </div>



                       {/* Danger Zone */}
                       <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
                         <h4 className="text-lg font-medium text-red-900 dark:text-red-300 mb-4">Danger Zone</h4>
                         <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                           These actions cannot be undone. Please be careful.
                         </p>
                         <div className="space-y-2">
                           <motion.button 
                             whileHover={{ scale: 1.02 }}
                             whileTap={{ scale: 0.98 }}
                             onClick={() => setShowClearConfirm(true)}
                             className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors mr-2"
                           >
                             Clear All Route Data
                           </motion.button>
                           <motion.button 
                             whileHover={{ scale: 1.02 }}
                             whileTap={{ scale: 0.98 }}
                             onClick={() => setShowDeleteConfirm(true)}
                             className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-colors mr-2"
                           >
                             Delete Account
                           </motion.button>
                         </div>
                       </div>
                     </div>
                   </motion.div>
                 )}
              </div>
            </div>
          </>
        )}

        {/* Clear All Routes Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Clear All Route Data?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete all your saved routes? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClearAllRoutes}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Yes, Clear All
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Account Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Delete Account?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  This will permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enter your password to confirm:
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeletePassword('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDeleteAccount}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete Account
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Admin Request Modal */}
        {showAdminRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Request Admin Access
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Please provide a reason for requesting admin privileges. This will be reviewed by our team.
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason for admin request:
                  </label>
                  <textarea
                    value={adminRequestReason}
                    onChange={(e) => setAdminRequestReason(e.target.value)}
                    placeholder="Explain why you need admin access..."
                    rows={4}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowAdminRequest(false);
                      setAdminRequestReason('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAdminRequest}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit Request
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}