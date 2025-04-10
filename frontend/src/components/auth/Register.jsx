import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEnvelope, FaLock, FaIdCard, FaUserMd, FaHospital, FaPhone, FaMapMarkerAlt, FaTint, FaCalendar, FaFileAlt, FaFingerprint, FaCertificate, FaBriefcaseMedical, FaAward, FaClock, FaAmbulance } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'user',
    phone_number: '',
    address: '',
    // User specific fields
    date_of_birth: '',
    blood_group: '',
    medical_history: '',
    biometric_data: '',
    // Hospital specific fields
    hospital_name: '',
    hospital_registration_number: '',
    emergency_contact: '',
    available_facilities: [],
    // Paramedic specific fields
    license_number: '',
    certification: '',
    years_of_experience: '',
    specialization: '',
    // Blood Bank specific fields
    blood_bank_name: '',
    storage_capacity: '',
    operating_hours: '',
    emergency_service: false,
    certification_details: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create a new object with only the common fields
      const submitData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role: formData.role,
        phone_number: formData.phone_number,
        address: formData.address,
      };

      // Add role-specific fields
      if (formData.role === 'user') {
        Object.assign(submitData, {
          date_of_birth: formData.date_of_birth,
          blood_group: formData.blood_group,
          medical_history: formData.medical_history,
          biometric_data: formData.biometric_data,
        });
      } else if (formData.role === 'hospital') {
        Object.assign(submitData, {
          hospital_name: formData.hospital_name,
          hospital_registration_number: formData.hospital_registration_number,
          emergency_contact: formData.emergency_contact,
          available_facilities: formData.available_facilities,
        });
      } else if (formData.role === 'paramedic') {
        Object.assign(submitData, {
          license_number: formData.license_number,
          certification: formData.certification,
          years_of_experience: parseInt(formData.years_of_experience, 10),
          specialization: formData.specialization,
        });
      } else if (formData.role === 'blood_bank') {
        Object.assign(submitData, {
          blood_bank_name: formData.blood_bank_name,
          license_number: formData.license_number,
          storage_capacity: parseInt(formData.storage_capacity, 10),
          operating_hours: formData.operating_hours,
          emergency_service: formData.emergency_service,
          certification_details: formData.certification_details,
        });
      }

      const userResponse = await axios.post('http://localhost:8000/users/', submitData);

      if (userResponse.data) {
        navigate('/login', { 
          state: { 
            message: 'Registration successful! Please login with your credentials.' 
          } 
        });
      }
    } catch (err) {
      // Handle validation errors from FastAPI
      if (err.response?.status === 422) {
        const validationErrors = err.response.data.detail;
        if (Array.isArray(validationErrors)) {
          // Format validation errors into readable messages
          const errorMessages = validationErrors.map(error => 
            `${error.loc[1]}: ${error.msg}`
          ).join('\n');
          setError(errorMessages);
        } else {
          setError('Invalid form data. Please check your inputs.');
        }
      } else {
        setError(err.response?.data?.detail || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBiometric = () => {
    setFormData({
      ...formData,
      biometric_data: 'biometric_data_' + Math.random().toString(36).substr(2, 9),
    });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const renderRoleSelection = () => (
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
  );

  const renderCommonFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaUser className="mr-2" /> Username
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        <div className="form-group">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaEnvelope className="mr-2" /> Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaLock className="mr-2" /> Password
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        <div className="form-group">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaIdCard className="mr-2" /> Full Name
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaPhone className="mr-2" /> Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone_number}
            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        <div className="form-group">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaMapMarkerAlt className="mr-2" /> Address
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
      </div>
    </>
  );

  const renderUserFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaCalendar className="mr-2" /> Date of Birth
          </label>
          <input
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        <div className="form-group">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaTint className="mr-2" /> Blood Group
          </label>
          <select
            value={formData.blood_group}
            onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
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

      <div className="form-group">
        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
          <FaFileAlt className="mr-2" /> Medical History
        </label>
        <textarea
          value={formData.medical_history}
          onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Enter any relevant medical history"
        />
      </div>

      <div className="form-group">
        <button
          type="button"
          onClick={handleBiometric}
          className="flex items-center justify-center w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <FaFingerprint className="mr-2" />
          {formData.biometric_data ? 'Biometric Data Collected' : 'Collect Biometric Data'}
        </button>
      </div>
    </>
  );

  const renderHospitalFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaHospital className="mr-2" /> Hospital Name
          </label>
          <input
            type="text"
            value={formData.hospital_name}
            onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        <div className="form-group">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaCertificate className="mr-2" /> Registration Number
          </label>
          <input
            type="text"
            value={formData.hospital_registration_number}
            onChange={(e) => setFormData({ ...formData, hospital_registration_number: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaPhone className="mr-2" /> Emergency Contact
          </label>
          <input
            type="tel"
            value={formData.emergency_contact}
            onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        <div className="form-group">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaBriefcaseMedical className="mr-2" /> Available Facilities
          </label>
          <input
            type="text"
            value={formData.available_facilities.join(', ')}
            onChange={(e) => setFormData({ ...formData, available_facilities: e.target.value.split(',').map(f => f.trim()) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Enter facilities separated by commas"
            required
          />
        </div>
      </div>
    </>
  );

  const renderParamedicFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaIdCard className="mr-2" /> License Number
          </label>
          <input
            type="text"
            value={formData.license_number}
            onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        <div className="form-group">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaAward className="mr-2" /> Certification
          </label>
          <input
            type="text"
            value={formData.certification}
            onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaBriefcaseMedical className="mr-2" /> Years of Experience
          </label>
          <input
            type="number"
            value={formData.years_of_experience}
            onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        <div className="form-group">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaUserMd className="mr-2" /> Specialization
          </label>
          <input
            type="text"
            value={formData.specialization}
            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
      </div>
    </>
  );

  const renderBloodBankFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaHospital className="mr-2" /> Blood Bank Name
          </label>
          <input
            type="text"
            value={formData.blood_bank_name}
            onChange={(e) => setFormData({ ...formData, blood_bank_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        <div className="form-group">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaCertificate className="mr-2" /> License Number
          </label>
          <input
            type="text"
            value={formData.license_number}
            onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaBriefcaseMedical className="mr-2" /> Storage Capacity (units)
          </label>
          <input
            type="number"
            value={formData.storage_capacity}
            onChange={(e) => setFormData({ ...formData, storage_capacity: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        <div className="form-group">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaClock className="mr-2" /> Operating Hours
          </label>
          <input
            type="text"
            value={formData.operating_hours}
            onChange={(e) => setFormData({ ...formData, operating_hours: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="e.g., Mon-Fri: 9AM-5PM"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="form-group">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaAmbulance className="mr-2" /> Emergency Service
          </label>
          <div className="mt-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData.emergency_service}
                onChange={(e) => setFormData({ ...formData, emergency_service: e.target.checked })}
                className="form-checkbox h-5 w-5 text-red-600"
              />
              <span className="ml-2 text-gray-700">Available 24/7 for emergencies</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaCertificate className="mr-2" /> Certification Details
          </label>
          <textarea
            value={formData.certification_details}
            onChange={(e) => setFormData({ ...formData, certification_details: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Enter certification details and validity"
            required
          />
        </div>
      </div>
    </>
  );

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
        {formData.role === 'user' ? 'User Registration' :
         formData.role === 'hospital' ? 'Hospital Registration' :
         formData.role === 'paramedic' ? 'Paramedic Registration' :
         'Blood Bank Registration'}
      </h2>
      
      {renderRoleSelection()}
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md">
          <p className="font-medium">Error</p>
          <p style={{ whiteSpace: 'pre-line' }}>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {renderCommonFields()}
        
        {formData.role === 'user' && renderUserFields()}
        {formData.role === 'hospital' && renderHospitalFields()}
        {formData.role === 'paramedic' && renderParamedicFields()}
        {formData.role === 'blood_bank' && renderBloodBankFields()}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register; 