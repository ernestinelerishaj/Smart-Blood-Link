import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaUserMd, FaHospital, FaFingerprint, FaTint } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import axios from 'axios';

const Login = ({ setUser, setRole }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user',
  });
  const [showBiometric, setShowBiometric] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Create form data for token endpoint
      const formDataObj = new FormData();
      formDataObj.append('username', formData.username);
      formDataObj.append('password', formData.password);

      // Get token from backend
      const tokenResponse = await axios.post('http://localhost:8000/token', formDataObj);
      
      if (tokenResponse.data.access_token) {
        // Store token
        localStorage.setItem('token', tokenResponse.data.access_token);
        
        // Get user data
        const userResponse = await axios.get('http://localhost:8000/users/me', {
          headers: {
            'Authorization': `Bearer ${tokenResponse.data.access_token}`
          }
        });

        // Set user data in app state
        setUser(userResponse.data.username);
        setRole(userResponse.data.role);
        
        // Store user data in localStorage
        localStorage.setItem('user', userResponse.data.username);
        localStorage.setItem('role', userResponse.data.role);

        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometric = () => {
    setShowBiometric(true);
    setTimeout(() => {
      setShowBiometric(false);
      setError('Biometric authentication not implemented yet.');
    }, 2000);
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please sign in to your account
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 justify-center mb-6">
          <button
            type="button"
            onClick={() => handleRoleSelect('user')}
            className={`flex items-center px-4 py-2 rounded-full ${
              formData.role === 'user'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition-colors duration-200`}
          >
            <FaUser className="mr-2" />
            User
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('paramedic')}
            className={`flex items-center px-4 py-2 rounded-full ${
              formData.role === 'paramedic'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition-colors duration-200`}
          >
            <FaUserMd className="mr-2" />
            Paramedic
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('hospital')}
            className={`flex items-center px-4 py-2 rounded-full ${
              formData.role === 'hospital'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition-colors duration-200`}
          >
            <FaHospital className="mr-2" />
            Hospital
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('blood_bank')}
            className={`flex items-center px-4 py-2 rounded-full ${
              formData.role === 'blood_bank'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition-colors duration-200`}
          >
            <FaTint className="mr-2" />
            Blood Bank
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdEmail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBiometric}
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 disabled:opacity-50"
            >
              <FaFingerprint className="mr-2 h-5 w-5" />
              {showBiometric ? 'Verifying...' : 'Use Biometric Authentication'}
            </button>
          </div>
        </form>

        {showBiometric && (
          <div className="mt-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse"></div>
              <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse delay-100"></div>
              <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse delay-200"></div>
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">
              Verifying your biometric data...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;