import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    name: localStorage.getItem('name') || 'User',
    email: localStorage.getItem('email') || 'user@example.com',
    profileImage: '/default-avatar.png'
  });

  // Dummy route history data
  const [routes] = useState([
    {
      id: 1,
      source: 'Mumbai',
      destination: 'Pune',
      date: '2024-03-15',
      totalToll: 230
    },
    {
      id: 2,
      source: 'Delhi',
      destination: 'Agra',
      date: '2024-03-14',
      totalToll: 345
    }
  ]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
    }
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser(prev => ({ ...prev, profileImage: reader.result }));
        toast.success('Profile picture updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameUpdate = (e) => {
    e.preventDefault();
    localStorage.setItem('name', user.name);
    setIsEditing(false);
    toast.success('Name updated successfully!');
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
              <img
                src={user.profileImage}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-red-500"
              />
              <label className="absolute bottom-0 right-0 bg-red-500 p-2 rounded-full cursor-pointer hover:bg-red-600">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
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
          {routes.length === 0 ? (
            <p className="text-gray-500 text-center">No routes found</p>
          ) : (
            <div className="space-y-4">
              {routes.map((route) => (
                <div
                  key={route.id}
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
                      <span>{route.date}</span>
                      <span className="mx-2">•</span>
                      <span>₹{route.totalToll}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      toast.success('Route deleted!');
                    }}
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