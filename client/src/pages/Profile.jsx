import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

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
    <div className="container mx-auto px-4 py-8">
      {/* Profile Section */}
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="bg-red-600 p-4">
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-red-500">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                  </div>
                )}
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                  style={{ display: imageLoading ? 'none' : 'block' }}
                  onLoad={() => setImageLoading(false)}
                />
              </div>
              <label className="absolute bottom-0 right-0 bg-red-500 p-2 rounded-full cursor-pointer hover:bg-red-600 transition-colors">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={imageLoading}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </label>
            </div>

            {/* Profile Info */}
            <div className="flex-grow text-center md:text-left">
              {!isEditing ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{user.name}</h2>
                  <p className="text-gray-600 mb-4">{user.email}</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Edit Profile
                  </button>
                </>
              ) : (
                <form onSubmit={handleNameUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={user.name}
                      onChange={(e) => setUser({ ...user, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Route History */}
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-red-600 p-4">
          <h2 className="text-xl font-bold text-white">Route History</h2>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
            </div>
          ) : routes.length === 0 ? (
            <p className="text-gray-500 text-center">No routes found</p>
          ) : (
            <div className="space-y-4">
              {routes.map((route) => (
                <div
                  key={route._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <div className="flex items-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-medium">From: {route.source}</p>
                        <p className="font-medium">To: {route.destination}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>{new Date(route.createdAt).toLocaleDateString()}</span>
                      <span className="mx-2">•</span>
                      <span>₹{route.price}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteRoute(route._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 