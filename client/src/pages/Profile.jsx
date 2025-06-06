import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Trash2 } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [user, setUser] = useState({
    name: localStorage.getItem('name') || 'User',
    email: localStorage.getItem('email') || 'user@example.com',
    profileImage: localStorage.getItem('profileImage') || '/default-avatar.png'
  });

  // Function to fetch user data and routes
  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId || userId === 'undefined') {
      localStorage.clear();
      toast.error('Please login to access your profile');
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      // Fetch user profile
      const profileResponse = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/profile?userId=${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (profileResponse.data.user) {
        const profileData = profileResponse.data.user;
        setUser(prev => ({
          ...prev,
          name: profileData.name || prev.name,
          email: profileData.email || prev.email,
          profileImage: profileData.profileImage || prev.profileImage
        }));

        // Update localStorage with latest data
        localStorage.setItem('name', profileData.name);
        if (profileData.profileImage) {
          localStorage.setItem('profileImage', profileData.profileImage);
        }
      }

      // Fetch routes
      const routesResponse = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/routes?userId=${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRoutes(routesResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      const errorMessage = error.response?.data?.message || error.message;
      
      if (error.response?.status === 401 || 
          errorMessage.includes('Invalid User ID') || 
          errorMessage.includes('User not found')) {
        localStorage.clear();
        toast.error('Session expired or invalid. Please login again');
        navigate('/auth');
      } else {
        toast.error('Failed to load profile data. Please try again');
      }
    } finally {
      setLoading(false);
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
        `${import.meta.env.VITE_API_BASE_URL}/api/users/routes/${routeId}?userId=${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Route deleted successfully!');
      // Refresh the routes data
      fetchUserData();
    } catch (error) {
      console.error('Error deleting route:', error);
      toast.error('Failed to delete route');
    }
  };

  // Use effect to fetch data on component mount
  useEffect(() => {
    fetchUserData();
  }, [navigate]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
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

        // Show loading toast
        const loadingToast = toast.loading('Processing image...');
        setImageLoading(true);

        // Create an image element for resizing
        const img = new Image();
        const reader = new FileReader();

        reader.onload = () => {
          img.src = reader.result;
        };

        img.onload = async () => {
          try {
            // Create canvas for resizing
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Maximum dimensions
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;

            // Resize image while maintaining aspect ratio
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

            // Draw resized image to canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Get resized image as base64
            const resizedImage = canvas.toDataURL('image/jpeg', 0.7); // Reduce quality to 70%

            // Upload to server
            const response = await axios.put(
              `${import.meta.env.VITE_API_BASE_URL}/api/users/profile?userId=${userId}`,
              { image: resizedImage },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            );

            if (response.data.user) {
              setUser(prev => ({
                ...prev,
                profileImage: response.data.user.profileImage
              }));
              localStorage.setItem('profileImage', response.data.user.profileImage);
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
    }
  };

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (!token || !userId) {
        toast.error('Please login again');
        navigate('/auth');
        return;
      }

      const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/users/profile?userId=${userId}`, 
        { name: user.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        localStorage.setItem('name', user.name);
        setIsEditing(false);
        toast.success('Name updated successfully!');
      }
    } catch (error) {
      console.error('Error updating name:', error);
      toast.error(error.response?.data?.message || 'Failed to update name');
    }
  };

  const handleImageError = () => {
    // If the image fails to load, fall back to default avatar
    setUser(prev => ({
      ...prev,
      profileImage: '/default-avatar.png'
    }));
  };

  return (
    <div className="min-h-screen p-4 lg:p-8 bg-gray-50 dark:bg-black text-gray-900 dark:text-red-100">
      <div className="max-w-4xl mx-auto">
        {/* Loading indicator */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-xl dark:text-white">Loading profile...</p>
        </div>
        ) : (
          <div className="bg-white dark:bg-black dark:border dark:border-red-900 rounded-2xl shadow-xl dark:shadow-red-900 p-6 mb-8">
            {/* Profile Header */}
            <div className="flex items-center space-x-6 mb-8">
            <div className="relative">
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-24 h-24 object-cover rounded-full border-4 border-red-500 shadow-lg dark:border-red-700"
                  onError={handleImageError}
                />
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700"></div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                {!isEditing ? (
                  <div className="flex items-center space-x-3">
                    <h2 className="text-3xl font-bold dark:text-white">{user.name}</h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-red-900 transition"
                    >
                      <svg className="w-5 h-5 text-gray-500 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    onBlur={handleNameUpdate}
                    onKeyPress={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                    className="text-3xl font-bold bg-transparent border-b border-gray-300 dark:border-red-700 focus:outline-none focus:border-red-500 dark:focus:border-red-400 dark:text-white"
                  />
                )}
                <p className="text-gray-600 dark:text-white">{user.email}</p>
              </div>
              {/* Profile image upload input */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                className="hidden"
                id="profileImageInput"
                />
              <label
                htmlFor="profileImageInput"
                className="cursor-pointer p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-red-900 dark:hover:bg-red-800 transition"
              >
                <svg className="w-6 h-6 text-gray-600 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.894-1.789A2 2 0 0113.71 3h1.58a2 2 0 011.664.89l.894 1.789A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
            </div>

            {/* Saved Routes Section */}
            <div>
              <h3 className="text-2xl font-bold mb-4 dark:text-white">Saved Routes</h3>
              {routes.length === 0 ? (
                <p className="text-gray-600 dark:text-white">No saved routes yet.</p>
          ) : (
                <ul className="space-y-4">
              {routes.map((route) => (
                    <li key={route._id} className="bg-gray-100 dark:bg-red-900 rounded-lg p-4 shadow flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-red-700 dark:text-white">{route.source} to {route.destination}</p>
                        <p className="text-sm text-gray-600 dark:text-white">Vehicle: {route.vehicleType}</p>
                        <p className="text-lg font-bold text-green-700 dark:text-white">₹{route.price?.toFixed(2) ?? 'N/A'}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteRoute(route._id)}
                        className="p-2 rounded-full text-red-600 hover:bg-red-100 dark:text-white dark:hover:bg-red-800 transition"
                        aria-label="Delete route"
                  >
                        <Trash2 className="w-5 h-5" />
                  </button>
                    </li>
              ))}
                </ul>
              )}
            </div>
            </div>
          )}
      </div>
    </div>
  );
} 