import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFingerprint, FaUserCheck, FaHistory, FaCheckCircle, FaTimesCircle, FaSpinner, 
         FaUserPlus, FaTimes, FaUser, FaEnvelope, FaPhone, FaIdCard, FaTint } from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';

const Dashboard = ({ user, role }) => {
  const [stats, setStats] = useState({
    totalDonations: 0,
    pendingRequests: 0,
    availableUnits: 0,
  });

  const [userData, setUserData] = useState({
    blood_group: '',
    last_donation: null,
    next_eligible_date: null,
  });

  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [recentVerifications, setRecentVerifications] = useState([
    { id: 1, name: 'John Doe', status: 'verified', timestamp: '2024-03-10 10:30 AM' },
    { id: 2, name: 'Jane Smith', status: 'failed', timestamp: '2024-03-10 09:15 AM' },
    { id: 3, name: 'Mike Johnson', status: 'verified', timestamp: '2024-03-09 03:45 PM' },
  ]);

  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone_number: '',
    blood_group: '',
    address: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          return;
        }

        // Fetch user data from the backend
        const response = await axios.get('http://localhost:8000/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('User data from backend:', response.data); // Debug log

        // Get user's donation history
        const donationsResponse = await axios.get('http://localhost:8000/donations/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Donations data:', donationsResponse.data); // Debug log

        // Find the user's latest donation
        const userDonations = donationsResponse.data.filter(
          donation => donation.user_id === response.data.id
        );
        const lastDonation = userDonations.length > 0 
          ? new Date(Math.max(...userDonations.map(d => new Date(d.date))))
          : null;

        // Calculate next eligible date (3 months after last donation)
        const nextEligibleDate = lastDonation 
          ? new Date(lastDonation.getTime() + (90 * 24 * 60 * 60 * 1000))
          : new Date();

        setUserData({
          blood_group: response.data.blood_group || 'Not specified',
          last_donation: lastDonation,
          next_eligible_date: nextEligibleDate,
        });

        console.log('Updated user data state:', {
          blood_group: response.data.blood_group || 'Not specified',
          last_donation: lastDonation,
          next_eligible_date: nextEligibleDate,
        }); // Debug log

        // Update stats if needed
        if (role === 'hospital' || role === 'admin') {
          setStats({
            totalDonations: userDonations.length,
            pendingRequests: 5,
            availableUnits: 75,
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error.response?.data || error.message);
      }
    };

    fetchUserData();
  }, [user, role]);

  const formatDate = (date) => {
    if (!date) return 'No donations yet';
    
    const now = new Date();
    const diffTime = Math.abs(now - new Date(date));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else {
      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    }
  };

  const formatNextEligible = (date) => {
    if (!date) return 'Eligible now';
    
    const now = new Date();
    const diffTime = new Date(date) - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return 'Eligible now';
    } else if (diffDays < 30) {
      return `In ${diffDays} days`;
    } else {
      const diffMonths = Math.floor(diffDays / 30);
      return `In ${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
    }
  };

  const handlePatientVerification = async () => {
    setIsVerifying(true);
    setVerificationStatus(null);

    try {
      // Simulate fingerprint verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful verification 80% of the time
      const isSuccess = Math.random() < 0.8;
      
      if (isSuccess) {
        setVerificationStatus('success');
        // Add to recent verifications
        const newVerification = {
          id: Date.now(),
          name: 'Patient #' + Math.floor(Math.random() * 1000),
          status: 'verified',
          timestamp: new Date().toLocaleString()
        };
        setRecentVerifications(prev => [newVerification, ...prev.slice(0, 4)]);
      } else {
        setVerificationStatus('failed');
      }
    } catch (_) {
      setVerificationStatus('error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleNewUserRegistration = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8000/users/',
        {
          ...newUserData,
          role: 'user',
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data) {
        // Add to recent verifications
        const newVerification = {
          id: Date.now(),
          name: newUserData.full_name,
          status: 'verified',
          timestamp: new Date().toLocaleString(),
        };
        setRecentVerifications(prev => [newVerification, ...prev.slice(0, 4)]);
        setShowRegistrationModal(false);
        setVerificationStatus('success');
        setNewUserData({
          username: '',
          email: '',
          password: '',
          full_name: '',
          phone_number: '',
          blood_group: '',
          address: '',
        });
      }
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
    }
  };

  const renderUserDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Welcome, {user}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Your Blood Group</h3>
          <p className="text-3xl font-bold text-red-600">
            {userData.blood_group || 'Not specified'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Last Donation</h3>
          <p className="text-gray-600">{formatDate(userData.last_donation)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Next Eligible</h3>
          <p className="text-gray-600">{formatNextEligible(userData.next_eligible_date)}</p>
        </div>
      </div>
    </div>
  );

  const renderRegistrationModal = () => (
    showRegistrationModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={() => setShowRegistrationModal(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <FaTimes className="text-xl" />
          </button>

          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FaUserPlus className="mr-2 text-red-600" />
            New Patient Registration
          </h3>

          <form onSubmit={handleNewUserRegistration} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaUser className="mr-2 text-gray-400" />
                  Username
                </label>
                <input
                  type="text"
                  value={newUserData.username}
                  onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaEnvelope className="mr-2 text-gray-400" />
                  Email
                </label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaIdCard className="mr-2 text-gray-400" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUserData.full_name}
                  onChange={(e) => setNewUserData({ ...newUserData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaPhone className="mr-2 text-gray-400" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newUserData.phone_number}
                  onChange={(e) => setNewUserData({ ...newUserData, phone_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaTint className="mr-2 text-gray-400" />
                  Blood Group
                </label>
                <select
                  value={newUserData.blood_group}
                  onChange={(e) => setNewUserData({ ...newUserData, blood_group: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={newUserData.address}
                  onChange={(e) => setNewUserData({ ...newUserData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows="3"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowRegistrationModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Register Patient
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );

  const renderParamedicDashboard = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Paramedic Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Fingerprint Verification Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaFingerprint className="mr-2 text-red-600" />
              Patient Fingerprint Verification
            </h3>
            
            <div className="space-y-4">
              <div className="text-center">
                {verificationStatus === 'success' ? (
                  <div className="flex items-center justify-center text-green-500 mb-4">
                    <FaCheckCircle className="text-5xl" />
                  </div>
                ) : verificationStatus === 'failed' ? (
                  <div className="flex items-center justify-center text-red-500 mb-4">
                    <FaTimesCircle className="text-5xl" />
                  </div>
                ) : verificationStatus === 'error' ? (
                  <div className="text-red-500 mb-4">
                    Error occurred during verification
                  </div>
                ) : null}
                
                <button
                  onClick={handlePatientVerification}
                  disabled={isVerifying}
                  className={`w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2 ${
                    isVerifying
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`}
                >
                  {isVerifying ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <FaFingerprint className="mr-2" />
                      <span>Start Fingerprint Verification</span>
                    </>
                  )}
                </button>
              </div>

              {verificationStatus === 'success' && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center text-green-700">
                    <MdVerified className="mr-2" />
                    <span>Patient verified successfully!</span>
                  </div>
                </div>
              )}

              {verificationStatus === 'failed' && (
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center text-red-700">
                      <FaTimesCircle className="mr-2" />
                      <span>Verification failed. Patient not found in system.</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowRegistrationModal(true)}
                    className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center"
                  >
                    <FaUserPlus className="mr-2" />
                    Register New Patient
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Verifications Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaHistory className="mr-2 text-red-600" />
              Recent Verifications
            </h3>
            
            <div className="divide-y divide-gray-200">
              {recentVerifications.map((verification) => (
                <div key={verification.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`mr-3 ${
                      verification.status === 'verified' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {verification.status === 'verified' ? (
                        <FaCheckCircle />
                      ) : (
                        <FaTimesCircle />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{verification.name}</p>
                      <p className="text-sm text-gray-500">{verification.timestamp}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    verification.status === 'verified'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {verification.status === 'verified' ? 'Verified' : 'Failed'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-700">Total Verifications</h4>
            <FaUserCheck className="text-red-600 text-xl" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {recentVerifications.length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Last 24 hours</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-700">Success Rate</h4>
            <FaCheckCircle className="text-green-500 text-xl" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {Math.round((recentVerifications.filter(v => v.status === 'verified').length / recentVerifications.length) * 100)}%
          </p>
          <p className="text-sm text-gray-500 mt-1">Average success rate</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-700">Pending Verifications</h4>
            <FaSpinner className="text-yellow-500 text-xl" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          <p className="text-sm text-gray-500 mt-1">No pending requests</p>
        </div>
      </div>

      {renderRegistrationModal()}
    </div>
  );

  const renderHospitalDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Hospital Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Pending Requests</h3>
          <p className="text-3xl font-bold text-red-600">{stats.pendingRequests}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Available Units</h3>
          <p className="text-3xl font-bold text-green-600">{stats.availableUnits}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Donations</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalDonations}</p>
        </div>
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">System Statistics</h3>
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span>Total Users</span>
              <span>1,234</span>
            </li>
            <li className="flex justify-between">
              <span>Active Hospitals</span>
              <span>45</span>
            </li>
            <li className="flex justify-between">
              <span>Registered Paramedics</span>
              <span>89</span>
            </li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700">
              Manage Users
            </button>
            <button className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700">
              View Reports
            </button>
            <button className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700">
              System Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {role === 'user' && renderUserDashboard()}
      {role === 'paramedic' && renderParamedicDashboard()}
      {role === 'hospital' && renderHospitalDashboard()}
      {role === 'admin' && renderAdminDashboard()}
    </div>
  );
};

export default Dashboard; 