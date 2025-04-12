import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaUserMd, FaHospital, FaFingerprint, FaTint, FaNewspaper, FaHeartbeat, FaAmbulance } from 'react-icons/fa';
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      {/* Hero Section */}
      <div className="bg-red-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to Smart Blood Link</h1>
            <p className="text-xl">Connecting Lives Through Blood Donation</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Login Section - Moved to top */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div>
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                Sign In to Your Account
              </h2>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Role selection buttons */}
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

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-6">
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
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg space-y-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <FaHeartbeat className="h-10 w-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Why Join Smart Blood Link?</h3>
              <p className="text-gray-600">Be part of our life-saving mission</p>
            </div>

            <div className="space-y-6">
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">Real-time Emergency Alerts</h4>
                <p className="text-gray-700">Get instant notifications about blood needs in your area</p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">Nationwide Network</h4>
                <p className="text-gray-700">Connect with blood banks and hospitals across the country</p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">Make a Difference</h4>
                <p className="text-gray-700">Join thousands of donors who save lives every day</p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-800 font-medium mb-4">Not registered yet?</p>
              <button
                onClick={() => navigate('/register')}
                className="inline-flex items-center px-6 py-3 border border-red-600 text-red-600 rounded-full hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                Join us in saving lives
              </button>
            </div>
          </div>
        </div>

        {/* Latest Emergency Alerts */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Emergency Blood Needs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-red-50 p-6 rounded-xl border border-red-200">
              <div className="flex items-center mb-4">
                <FaAmbulance className="text-red-600 text-xl mr-2" />
                <span className="text-red-600 font-semibold">Urgent Need</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">O- Blood Required</h3>
              <p className="text-gray-600 text-sm mb-4">City Hospital needs O- blood for emergency surgery. Contact immediately.</p>
              <div className="text-sm text-gray-500">10 minutes ago</div>
            </div>

            <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
              <div className="flex items-center mb-4">
                <FaHeartbeat className="text-orange-600 text-xl mr-2" />
                <span className="text-orange-600 font-semibold">High Priority</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">AB+ Blood Needed</h3>
              <p className="text-gray-600 text-sm mb-4">Memorial Hospital requires AB+ blood for scheduled surgery.</p>
              <div className="text-sm text-gray-500">1 hour ago</div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
              <div className="flex items-center mb-4">
                <FaTint className="text-yellow-600 text-xl mr-2" />
                <span className="text-yellow-600 font-semibold">Regular Need</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">All Blood Types</h3>
              <p className="text-gray-600 text-sm mb-4">Central Blood Bank seeking donors for maintaining stock levels.</p>
              <div className="text-sm text-gray-500">3 hours ago</div>
            </div>
          </div>
        </div>

        {/* Recent News */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest News</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <img 
                src="blood.jpg" 
                alt="Blood donation news" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center mb-2">
                  <FaNewspaper className="text-red-600 mr-2" />
                  <span className="text-red-600 text-sm font-semibold">Critical Update</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Blood Shortage Crisis in Major Cities</h3>
                <p className="text-gray-600 mb-4">Hospitals across major cities are facing severe blood shortages, leading to delayed surgeries...</p>
                <div className="text-sm text-gray-500">2 days ago</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <img 
                src="bl.jpg" 
                alt="Success story" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center mb-2">
                  <FaNewspaper className="text-green-600 mr-2" />
                  <span className="text-green-600 text-sm font-semibold">Success Story</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Blood Link Connects Rare Blood Donor</h3>
                <p className="text-gray-600 mb-4">Our platform successfully connected a rare blood type donor with a patient in critical condition...</p>
                <div className="text-sm text-gray-500">1 week ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;