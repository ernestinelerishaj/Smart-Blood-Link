import { useState, useEffect } from 'react';

const Dashboard = ({ user, role }) => {
  const [stats, setStats] = useState({
    totalDonations: 0,
    pendingRequests: 0,
    availableUnits: 0,
  });

  useEffect(() => {
    // Simulate fetching dashboard data
    setStats({
      totalDonations: 150,
      pendingRequests: 5,
      availableUnits: 75,
    });
  }, []);

  const renderUserDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Welcome, {user}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Your Blood Group</h3>
          <p className="text-3xl font-bold text-red-600">A+</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Last Donation</h3>
          <p className="text-gray-600">3 months ago</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Next Eligible</h3>
          <p className="text-gray-600">In 1 month</p>
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