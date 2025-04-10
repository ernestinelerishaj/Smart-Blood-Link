import { useState, useEffect } from 'react';
import axios from 'axios';

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

  const renderParamedicDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Paramedic Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Verify Donor</h3>
          <button className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700">
            Start Biometric Verification
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Recent Verifications</h3>
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span>John Doe</span>
              <span className="text-green-600">Verified</span>
            </li>
            <li className="flex justify-between">
              <span>Jane Smith</span>
              <span className="text-green-600">Verified</span>
            </li>
          </ul>
        </div>
      </div>
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