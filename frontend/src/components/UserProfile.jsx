import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheckCircle } from 'react-icons/fa';

const UserProfile = () => {
  const [profile, setProfile] = useState({
    username: '',
    full_name: '',
    email: '',
    date_of_birth: '',
    phone_number: '',
    address: '',
    blood_group: '',
    medical_history: '',
    biometric_data: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await axios.get('http://localhost:8000/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setProfile({
        username: response.data.username || '',
        full_name: response.data.full_name || '',
        email: response.data.email || '',
        date_of_birth: response.data.date_of_birth || '',
        phone_number: response.data.phone_number || '',
        address: response.data.address || '',
        blood_group: response.data.blood_group || '',
        medical_history: response.data.medical_history || '',
        biometric_data: response.data.biometric_data || '',
      });
      setLoading(false);
    } catch (error) {
      console.error('Profile fetch error:', error.response?.data || error.message);
      setError(error.response?.data?.detail || 'Failed to fetch user profile');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      await axios.put('http://localhost:8000/users/me', profile, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    }
  };

  const handleBiometric = async () => {
    try {
      setError('');
      // Simulate biometric data collection
      const biometricData = 'bio_' + Math.random().toString(36).substr(2, 9);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      // Update user with new biometric data
      await axios.put(
        'http://localhost:8000/users/me',
        { biometric_data: biometricData },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update local state
      setProfile(prev => ({
        ...prev,
        biometric_data: biometricData
      }));

      setSuccessMessage('Biometric data verified and stored successfully!');
    } catch (error) {
      console.error('Biometric update error:', error.response?.data || error.message);
      setError(error.response?.data?.detail || 'Failed to update biometric data');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">User Profile</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
                {successMessage}
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    value={profile.date_of_birth}
                    onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    value={profile.phone_number}
                    onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Medical History</label>
                  <textarea
                    value={profile.medical_history}
                    onChange={(e) => setProfile({ ...profile, medical_history: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Save Changes
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <p className="mt-1">{profile.username}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1">{profile.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1">{profile.full_name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <p className="mt-1">{profile.date_of_birth}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <p className="mt-1">{profile.phone_number}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <p className="mt-1">{profile.address}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                  <p className="mt-1">{profile.blood_group}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Medical History</label>
                  <p className="mt-1">{profile.medical_history || 'No medical history recorded'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Biometric Data</label>
                  <div className="mt-1 flex items-center">
                    {profile.biometric_data ? (
                      <div className="flex items-center text-green-600">
                        <FaCheckCircle className="mr-2" />
                        <span>Verified and Stored</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleBiometric}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                      >
                        Verify Biometric Data
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 