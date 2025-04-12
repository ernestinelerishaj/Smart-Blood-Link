import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEnvelope, FaLock, FaIdCard, FaUserMd, FaHospital, FaPhone, FaMapMarkerAlt, FaTint, FaCalendar, FaFileAlt, FaFingerprint, FaCertificate, FaBriefcaseMedical, FaAward, FaClock, FaAmbulance, FaInfoCircle, FaHeartbeat, FaNewspaper, FaChartLine } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    full_name: '',
    role: 'user',
    phone_number: '',
    address: '',
    // User specific fields
    date_of_birth: '',
    blood_group: '',
    medical_history: '',
    biometric_data: '',
    consulting_hospital: '',
    consulting_doctors: '',
    medical_reports: [],
    // Hospital specific fields
    hospital_name: '',
    hospital_registration_number: '',
    emergency_contact: '',
    available_facilities: [],
    license_proof: null,
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
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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
          consulting_hospital: formData.consulting_hospital,
          consulting_doctors: formData.consulting_doctors,
          medical_reports: formData.medical_reports,
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
        // Get token for immediate login
        // Use FormData to match the expected format by FastAPI
        const formDataObj = new FormData();
        formDataObj.append('username', formData.username);
        formDataObj.append('password', formData.password);

        const tokenResponse = await axios.post('http://localhost:8000/token', formDataObj);

        if (tokenResponse.data.access_token) {
          // Store token and user data
          localStorage.setItem('token', tokenResponse.data.access_token);
          localStorage.setItem('user', formData.username);
          localStorage.setItem('role', formData.role);

          // Set success state
          setRegistrationSuccess(true);
          setSuccessMessage('Registration successful! You are now logged in.');

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
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
      } else if (err.response?.status === 400 && err.response?.data?.detail?.includes('already registered')) {
        setError('Username or email already registered. Please try different credentials.');
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
            <FaLock className="mr-2" /> Confirm Password
          </label>
          <input
            type="password"
            value={formData.confirm_password}
            onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaPhone className="mr-2" /> Contact Number
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
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            rows="3"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaHospital className="mr-2" /> Consulting Hospital
          </label>
          <input
            type="text"
            value={formData.consulting_hospital}
            onChange={(e) => setFormData({ ...formData, consulting_hospital: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="form-group">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FaUserMd className="mr-2" /> Consulting Doctor(s)
          </label>
          <input
            type="text"
            value={formData.consulting_doctors}
            onChange={(e) => setFormData({ ...formData, consulting_doctors: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Enter doctor names separated by commas"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
          <FaFileAlt className="mr-2" /> Medical Reports or Scans
        </label>
        <div className="relative">
          <input
            type="file"
            multiple
            accept=".pdf, .jpg, .png"
            onChange={(e) => {
              const files = Array.from(e.target.files);
              setFormData({ ...formData, medical_reports: files });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          {formData.medical_reports.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Selected files:</p>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {formData.medical_reports.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
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
            <span className="ml-2 text-gray-400 cursor-help" title="Issued by your state health authority or Drugs Control Department">
              <FaInfoCircle />
            </span>
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

      <div className="form-group">
        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
          <FaPhone className="mr-2" /> 24/7 Emergency Helpline (if any)
        </label>
        <input
          type="tel"
          value={formData.emergency_contact}
          onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div className="form-group">
        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
          <FaBriefcaseMedical className="mr-2" /> Available Facilities
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.available_facilities.includes('ICU')}
                onChange={(e) => {
                  const facilities = e.target.checked
                    ? [...formData.available_facilities, 'ICU']
                    : formData.available_facilities.filter(f => f !== 'ICU');
                  setFormData({ ...formData, available_facilities: facilities });
                }}
                className="form-checkbox h-5 w-5 text-red-600"
              />
              <span className="ml-2">ICU</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.available_facilities.includes('Emergency Room')}
                onChange={(e) => {
                  const facilities = e.target.checked
                    ? [...formData.available_facilities, 'Emergency Room']
                    : formData.available_facilities.filter(f => f !== 'Emergency Room');
                  setFormData({ ...formData, available_facilities: facilities });
                }}
                className="form-checkbox h-5 w-5 text-red-600"
              />
              <span className="ml-2">Emergency Room</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.available_facilities.includes('Blood Bank')}
                onChange={(e) => {
                  const facilities = e.target.checked
                    ? [...formData.available_facilities, 'Blood Bank']
                    : formData.available_facilities.filter(f => f !== 'Blood Bank');
                  setFormData({ ...formData, available_facilities: facilities });
                }}
                className="form-checkbox h-5 w-5 text-red-600"
              />
              <span className="ml-2">Blood Bank</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.available_facilities.includes('Pharmacy')}
                onChange={(e) => {
                  const facilities = e.target.checked
                    ? [...formData.available_facilities, 'Pharmacy']
                    : formData.available_facilities.filter(f => f !== 'Pharmacy');
                  setFormData({ ...formData, available_facilities: facilities });
                }}
                className="form-checkbox h-5 w-5 text-red-600"
              />
              <span className="ml-2">Pharmacy</span>
            </label>
          </div>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.available_facilities.includes('Lab Services')}
                onChange={(e) => {
                  const facilities = e.target.checked
                    ? [...formData.available_facilities, 'Lab Services']
                    : formData.available_facilities.filter(f => f !== 'Lab Services');
                  setFormData({ ...formData, available_facilities: facilities });
                }}
                className="form-checkbox h-5 w-5 text-red-600"
              />
              <span className="ml-2">Lab Services</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.available_facilities.includes('Inpatient/Outpatient')}
                onChange={(e) => {
                  const facilities = e.target.checked
                    ? [...formData.available_facilities, 'Inpatient/Outpatient']
                    : formData.available_facilities.filter(f => f !== 'Inpatient/Outpatient');
                  setFormData({ ...formData, available_facilities: facilities });
                }}
                className="form-checkbox h-5 w-5 text-red-600"
              />
              <span className="ml-2">Inpatient/Outpatient</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.available_facilities.includes('Ambulance')}
                onChange={(e) => {
                  const facilities = e.target.checked
                    ? [...formData.available_facilities, 'Ambulance']
                    : formData.available_facilities.filter(f => f !== 'Ambulance');
                  setFormData({ ...formData, available_facilities: facilities });
                }}
                className="form-checkbox h-5 w-5 text-red-600"
              />
              <span className="ml-2">Ambulance</span>
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.available_facilities.includes('Others')}
                onChange={(e) => {
                  const facilities = e.target.checked
                    ? [...formData.available_facilities, 'Others']
                    : formData.available_facilities.filter(f => f !== 'Others');
                  setFormData({ ...formData, available_facilities: facilities });
                }}
                className="form-checkbox h-5 w-5 text-red-600"
              />
              <span className="ml-2">Others</span>
              {formData.available_facilities.includes('Others') && (
                <input
                  type="text"
                  placeholder="Specify other facilities"
                  className="ml-2 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  onChange={(e) => {
                    const facilities = formData.available_facilities.filter(f => f !== 'Others');
                    setFormData({ ...formData, available_facilities: [...facilities, `Others: ${e.target.value}`] });
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
          <FaFileAlt className="mr-2" /> License/Registration Proof
        </label>
        <input
          type="file"
          accept=".pdf,.jpg,.png"
          onChange={(e) => setFormData({ ...formData, license_proof: e.target.files[0] })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        {formData.license_proof && (
          <p className="text-sm text-gray-600 mt-1">Selected file: {formData.license_proof.name}</p>
        )}
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      {/* Hero Section */}
      <div className="bg-red-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Join Smart Blood Link</h1>
            <p className="text-xl mb-8">Together, we can bridge the gap between blood donors and those in need</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Registration Form Section - Moved to top */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Registration Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
                {formData.role === 'user' ? 'User Registration' :
                 formData.role === 'hospital' ? 'Hospital Registration' :
                 formData.role === 'paramedic' ? 'Paramedic Registration' :
                 'Blood Bank Registration'}
              </h2>
              
              {/* Success and Error Messages */}
              {registrationSuccess && (
                <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-md">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="font-medium">{successMessage}</p>
                  </div>
                  <p className="mt-2 text-sm">Redirecting to your dashboard...</p>
                </div>
              )}
              
              {error && (
                <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md">
                  <p className="font-medium">Error</p>
                  <p style={{ whiteSpace: 'pre-line' }}>{error}</p>
                </div>
              )}
              
              {!registrationSuccess && (
                <>
                  {renderRoleSelection()}
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
                </>
              )}
            </div>
          </div>

          {/* Side Information */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg space-y-8">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <FaHeartbeat className="h-10 w-10 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Why Join Us?</h3>
                  <p className="text-gray-600">Be part of a life-saving network</p>
                </div>

                <div className="space-y-6">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">Instant Alerts</h4>
                    <p className="text-gray-700">Receive immediate notifications for blood needs in your area</p>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">Smart Matching</h4>
                    <p className="text-gray-700">Our AI matches donors with recipients efficiently</p>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">Save Lives</h4>
                    <p className="text-gray-700">Join thousands who've already made a difference</p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">Already have an account?</p>
                  <button
                    onClick={() => navigate('/login')}
                    className="inline-flex items-center px-6 py-3 border border-red-600 text-red-600 rounded-full hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                  >
                    Sign in to your account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Impact Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">5,000+</div>
              <div className="text-gray-600">Lives Saved</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">200+</div>
              <div className="text-gray-600">Connected Blood Banks</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">15,000+</div>
              <div className="text-gray-600">Registered Donors</div>
            </div>
          </div>
        </div>

        {/* Latest News */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Recent Blood Bank News</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* News Card 1 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <img 
                src="short.jpg" 
                alt="Blood shortage crisis" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="text-red-600 text-sm font-semibold mb-2">Breaking News</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Critical Blood Shortage Hits Major Cities</h3>
                <p className="text-gray-600 mb-4">Multiple hospitals report severe blood shortage, leading to delayed surgeries and emergency situations...</p>
                <div className="flex items-center text-sm text-gray-500">
                  <FaNewspaper className="mr-2" />
                  <span>2 hours ago</span>
                </div>
              </div>
            </div>

            {/* News Card 2 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <img 
                src="donor.png" 
                alt="Blood donation drive" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="text-red-600 text-sm font-semibold mb-2">Success Story</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Blood Link Saves Lives in Emergency</h3>
                <p className="text-gray-600 mb-4">Quick response through our platform helped connect a rare blood type donor with a patient in critical condition...</p>
                <div className="flex items-center text-sm text-gray-500">
                  <FaNewspaper className="mr-2" />
                  <span>1 day ago</span>
                </div>
              </div>
            </div>

            {/* News Card 3 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <img 
                src="digital.jpg" 
                alt="Digital healthcare" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="text-red-600 text-sm font-semibold mb-2">Feature Update</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">New Real-time Blood Bank Locator</h3>
                <p className="text-gray-600 mb-4">Smart Blood Link introduces real-time tracking of blood availability across registered blood banks...</p>
                <div className="flex items-center text-sm text-gray-500">
                  <FaNewspaper className="mr-2" />
                  <span>3 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 