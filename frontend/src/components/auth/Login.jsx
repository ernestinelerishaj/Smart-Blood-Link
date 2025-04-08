import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ setUser, setRole }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    role: 'user', // Default role
  });
  const [showBiometric, setShowBiometric] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simulate authentication
    if (formData.userId && formData.password) {
      setUser(formData.userId);
      setRole(formData.role);
      navigate('/dashboard');
    }
  };

  const handleBiometric = () => {
    // Simulate biometric verification
    setShowBiometric(true);
    setTimeout(() => {
      setShowBiometric(false);
      // Simulate successful biometric verification
      setUser('biometric_user');
      setRole('paramedic');
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">User ID</label>
          <input
            type="text"
            value={formData.userId}
            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          >
            <option value="user">User</option>
            <option value="paramedic">Paramedic</option>
            <option value="hospital">Hospital</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Login
        </button>
      </form>

      <div className="mt-6">
        <button
          onClick={handleBiometric}
          className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          {showBiometric ? 'Verifying...' : 'Use Biometric Authentication'}
        </button>
      </div>

      {showBiometric && (
        <div className="mt-4 text-center">
          <div className="animate-pulse text-gray-600">Simulating biometric verification...</div>
        </div>
      )}
    </div>
  );
};

export default Login; 