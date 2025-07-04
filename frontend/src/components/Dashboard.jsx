import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFingerprint, FaUserCheck, FaHistory, FaCheckCircle, FaTimesCircle, FaSpinner, 
         FaUserPlus, FaTimes, FaUser, FaEnvelope, FaPhone, FaIdCard, FaTint, FaMapMarkerAlt,
         FaCalendarAlt, FaNotesMedical, FaClock, FaFileAlt } from 'react-icons/fa';
import { MdVerified, MdPerson } from 'react-icons/md';

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
    email: '',
    phone_number: '',
    address: '',
  });

  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportStatus, setReportStatus] = useState(null);
  const [selectedBloodBanks, setSelectedBloodBanks] = useState([]);
  const [selectedHospitals, setSelectedHospitals] = useState([]);
  const [availableBloodBanks, setAvailableBloodBanks] = useState([]);
  const [availableHospitals, setAvailableHospitals] = useState([]);
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

  const [registrationStatus, setRegistrationStatus] = useState({
    success: false,
    error: false,
    message: '',
    existingUser: false
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
          email: response.data.email,
          phone_number: response.data.phone_number,
          address: response.data.address,
        });

        console.log('Updated user data state:', {
          blood_group: response.data.blood_group || 'Not specified',
          last_donation: lastDonation,
          next_eligible_date: nextEligibleDate,
          email: response.data.email,
          phone_number: response.data.phone_number,
          address: response.data.address,
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

  useEffect(() => {
    const fetchBloodBanksAndHospitals = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch blood banks
        const bloodBanksResponse = await axios.get('http://localhost:8000/users/', {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { role: 'blood_bank' }
        });
        setAvailableBloodBanks(bloodBanksResponse.data);

        // Fetch hospitals
        const hospitalsResponse = await axios.get('http://localhost:8000/users/', {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { role: 'hospital' }
        });
        setAvailableHospitals(hospitalsResponse.data);
      } catch (error) {
        console.error('Error fetching blood banks and hospitals:', error);
      }
    };

    fetchBloodBanksAndHospitals();
  }, []);

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
    } catch (error) {
      console.error('Verification error:', error);
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
        setRegistrationStatus({
          success: true,
          error: false,
          message: 'Patient registered successfully!',
          existingUser: false
        });
        
        // Add to recent verifications
        const newVerification = {
          id: Date.now(),
          name: newUserData.full_name,
          status: 'verified',
          timestamp: new Date().toLocaleString(),
        };
        setRecentVerifications(prev => [newVerification, ...prev.slice(0, 4)]);
        
        // Don't immediately close modal - let user see success message
        setTimeout(() => {
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
          setRegistrationStatus({
            success: false,
            error: false,
            message: '',
            existingUser: false
          });
        }, 3000);
      }
    } catch (error) {
      if (error.response?.data?.detail?.includes('already registered')) {
        setRegistrationStatus({
          success: false,
          error: true,
          message: 'User already exists in the database',
          existingUser: true
        });
      } else {
        setRegistrationStatus({
          success: false,
          error: true,
          message: error.response?.data?.detail || 'Registration failed. Please try again.',
          existingUser: false
        });
      }
      console.error('Registration error:', error.response?.data || error.message);
    }
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setReportStatus(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Get the last verified patient
      const lastVerifiedPatient = recentVerifications[0];

      // Prepare report data
      const reportData = {
        patient_id: lastVerifiedPatient.id,
        patient_name: lastVerifiedPatient.name,
        verification_timestamp: lastVerifiedPatient.timestamp,
        blood_banks: selectedBloodBanks,
        hospitals: selectedHospitals,
        status: 'pending'
      };

      // Send report to backend
      const response = await axios.post('http://localhost:8000/reports/', reportData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        setReportStatus('success');
        // Clear selections after successful report generation
        setSelectedBloodBanks([]);
        setSelectedHospitals([]);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setReportStatus('error');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const renderUserDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center">
        <FaUser className="mr-2 text-red-600" /> Welcome, {user}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <FaTint className="mr-2 text-red-600" /> Your Blood Group
          </h3>
          <p className="text-3xl font-bold text-red-600">
            {userData.blood_group || 'Not specified'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <FaEnvelope className="mr-2 text-red-600" /> Email
          </h3>
          <p className="text-gray-600">{userData.email}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <FaPhone className="mr-2 text-red-600" /> Contact Number
          </h3>
          <p className="text-gray-600">{userData.phone_number}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <FaMapMarkerAlt className="mr-2 text-red-600" /> Address
          </h3>
          <p className="text-gray-600">{userData.address}</p>
        </div>
      </div>
    </div>
  );

  const renderRegistrationModal = () => (
    showRegistrationModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Register New Patient</h2>
            <button 
              onClick={() => {
                setShowRegistrationModal(false);
                setRegistrationStatus({
                  success: false,
                  error: false,
                  message: '',
                  existingUser: false
                });
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
          
          {/* Success Message */}
          {registrationStatus.success && (
            <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700 rounded">
              <div className="flex">
                <FaCheckCircle className="h-5 w-5 mr-2" />
                <p>{registrationStatus.message}</p>
              </div>
              <p className="mt-2 text-sm">Patient has been added to the system.</p>
            </div>
          )}
          
          {/* Error Message */}
          {registrationStatus.error && (
            <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
              <div className="flex">
                <FaTimesCircle className="h-5 w-5 mr-2" />
                <p>{registrationStatus.message}</p>
              </div>
              {registrationStatus.existingUser && (
                <div className="mt-3">
                  <p className="font-semibold">This user already exists in our database.</p>
                  <button 
                    onClick={() => {
                      setShowRegistrationModal(false);
                      setVerificationStatus('success');
                      setRegistrationStatus({
                        success: false,
                        error: false,
                        message: '',
                        existingUser: false
                      });
                    }}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    View Dashboard
                  </button>
                </div>
              )}
            </div>
          )}
          
          <form onSubmit={handleNewUserRegistration} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaUser className="mr-1" /> Username
                </label>
                <input
                  type="text"
                  value={newUserData.username}
                  onChange={(e) => setNewUserData({...newUserData, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaEnvelope className="mr-1" /> Email
                </label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaLock className="mr-1" /> Password
              </label>
              <input
                type="password"
                value={newUserData.password}
                onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaIdCard className="mr-1" /> Full Name
              </label>
              <input
                type="text"
                value={newUserData.full_name}
                onChange={(e) => setNewUserData({...newUserData, full_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaPhone className="mr-1" /> Phone Number
                </label>
                <input
                  type="tel"
                  value={newUserData.phone_number}
                  onChange={(e) => setNewUserData({...newUserData, phone_number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaTint className="mr-1" /> Blood Group
                </label>
                <select
                  value={newUserData.blood_group}
                  onChange={(e) => setNewUserData({...newUserData, blood_group: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
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
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaMapMarkerAlt className="mr-1" /> Address
              </label>
              <textarea
                value={newUserData.address}
                onChange={(e) => setNewUserData({...newUserData, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                rows="3"
                required
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              {!registrationStatus.success && (
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Register Patient
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    )
  );

  const renderParamedicDashboard = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <MdPerson className="mr-3 text-red-600 text-3xl" />
        Paramedic Dashboard
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Fingerprint Verification Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:border-red-100 transition-all duration-300">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaFingerprint className="mr-2 text-red-600" />
              Patient Fingerprint Verification
            </h3>
            
            <div className="space-y-4">
              <div className="text-center">
                {verificationStatus === 'success' ? (
                  <div className="flex flex-col items-center justify-center text-green-500 mb-4">
                    <FaCheckCircle className="text-6xl mb-2" />
                    <p className="text-sm text-green-600 font-medium">Verification Successful</p>
                  </div>
                ) : verificationStatus === 'failed' ? (
                  <div className="flex flex-col items-center justify-center text-red-500 mb-4">
                    <FaTimesCircle className="text-6xl mb-2" />
                    <p className="text-sm text-red-600 font-medium">Verification Failed</p>
                  </div>
                ) : verificationStatus === 'error' ? (
                  <div className="flex flex-col items-center justify-center text-red-500 mb-4">
                    <FaTimesCircle className="text-6xl mb-2" />
                    <p className="text-sm text-red-600 font-medium">Error occurred during verification</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400 mb-4">
                    <FaFingerprint className="text-6xl mb-2" />
                    <p className="text-sm text-gray-500 font-medium">Ready to verify</p>
                  </div>
                )}
                
                <button
                  onClick={handlePatientVerification}
                  disabled={isVerifying}
                  className={`w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2 ${
                    isVerifying
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600'
                  } transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-md`}
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
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg animate-fadeIn">
                    <div className="flex items-center text-green-700 mb-2">
                      <MdVerified className="mr-2 text-xl" />
                      <span className="font-medium">Patient verified successfully!</span>
                    </div>
                    <p className="text-sm text-green-600">Patient information has been recorded.</p>
                  </div>

                  {/* Report Generation Section */}
                  <div className="mt-6 space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Generate Report</h4>
                    
                    {/* Blood Banks Selection */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Select Blood Banks
                      </label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {availableBloodBanks.map((bank) => (
                          <label key={bank.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedBloodBanks.includes(bank.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedBloodBanks([...selectedBloodBanks, bank.id]);
                                } else {
                                  setSelectedBloodBanks(selectedBloodBanks.filter(id => id !== bank.id));
                                }
                              }}
                              className="rounded text-red-600 focus:ring-red-500"
                            />
                            <span>{bank.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Hospitals Selection */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Select Hospitals
                      </label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {availableHospitals.map((hospital) => (
                          <label key={hospital.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedHospitals.includes(hospital.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedHospitals([...selectedHospitals, hospital.id]);
                                } else {
                                  setSelectedHospitals(selectedHospitals.filter(id => id !== hospital.id));
                                }
                              }}
                              className="rounded text-red-600 focus:ring-red-500"
                            />
                            <span>{hospital.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Report Status Messages */}
                    {reportStatus === 'success' && (
                      <div className="p-3 bg-green-100 border-l-4 border-green-500 text-green-700 rounded">
                        <p>Report generated and sent successfully!</p>
                      </div>
                    )}
                    {reportStatus === 'error' && (
                      <div className="p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
                        <p>Failed to generate report. Please try again.</p>
                      </div>
                    )}

                    {/* Generate Report Button */}
                    <button
                      onClick={handleGenerateReport}
                      disabled={isGeneratingReport || selectedBloodBanks.length === 0 || selectedHospitals.length === 0}
                      className={`w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2 ${
                        isGeneratingReport || selectedBloodBanks.length === 0 || selectedHospitals.length === 0
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600'
                      } transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-md`}
                    >
                      {isGeneratingReport ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" />
                          <span>Generating Report...</span>
                        </>
                      ) : (
                        <>
                          <FaFileAlt className="mr-2" />
                          <span>Generate and Send Report</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Previous Patient Details Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:border-red-100 transition-all duration-300">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaHistory className="mr-2 text-red-600" />
              Previous Patient Details
            </h3>
            
            <div className="divide-y divide-gray-200">
              {recentVerifications.map((verification) => (
                <div key={verification.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 rounded-full p-2 ${
                      verification.status === 'verified' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {verification.status === 'verified' ? (
                        <FaUserCheck className={`text-xl ${
                          verification.status === 'verified' ? 'text-green-600' : 'text-red-600'
                        }`} />
                      ) : (
                        <FaTimes className="text-xl text-red-600" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-800">{verification.name}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          verification.status === 'verified'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {verification.status === 'verified' ? 'Verified' : 'Failed'}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <FaClock className="mr-1" />
                        {verification.timestamp}
                      </div>
                      {verification.status === 'verified' && (
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center text-gray-600">
                            <FaTint className="mr-1 text-red-500" />
                            {verification.blood_group || 'N/A'}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <FaMapMarkerAlt className="mr-1 text-gray-400" />
                            {verification.location || 'N/A'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {recentVerifications.length === 0 && (
                <div className="py-4 text-center text-gray-500">
                  No previous patient records found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:border-red-100 transition-all duration-300">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-700">Total Patients</h4>
            <div className="p-2 bg-red-50 rounded-lg">
              <FaUserCheck className="text-red-600 text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {recentVerifications.length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Processed today</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:border-red-100 transition-all duration-300">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-700">Success Rate</h4>
            <div className="p-2 bg-green-50 rounded-lg">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {Math.round((recentVerifications.filter(v => v.status === 'verified').length / recentVerifications.length) * 100)}%
          </p>
          <p className="text-sm text-gray-500 mt-1">Average success rate</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:border-red-100 transition-all duration-300">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-700">Pending Cases</h4>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <FaSpinner className="text-yellow-600 text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {recentVerifications.length - recentVerifications.filter(v => v.status === 'verified').length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Awaiting verification</p>
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