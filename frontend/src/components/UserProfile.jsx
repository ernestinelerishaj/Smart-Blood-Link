import { useState } from 'react';

const UserProfile = ({ user }) => {
  const [profile, setProfile] = useState({
    name: user.name || '',
    dateOfBirth: user.dateOfBirth || '',
    phoneNumber: user.phoneNumber || '',
    address: user.address || '',
    bloodGroup: user.bloodGroup || '',
    medicalHistory: user.medicalHistory || 'No significant medical history',
    biometricData: user.biometricData || '',
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsEditing(false);
    // Here we would typically send the updated profile to the backend
    console.log('Updated profile:', { ...profile, userId: user.id });
  };

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

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) =>
                      setProfile({ ...profile, dateOfBirth: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phoneNumber}
                    onChange={(e) =>
                      setProfile({ ...profile, phoneNumber: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    value={profile.address}
                    onChange={(e) =>
                      setProfile({ ...profile, address: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Blood Group
                  </label>
                  <select
                    value={profile.bloodGroup}
                    onChange={(e) =>
                      setProfile({ ...profile, bloodGroup: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  >
                    <option value="">Select Blood Type</option>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Medical History
                  </label>
                  <textarea
                    value={profile.medicalHistory}
                    onChange={(e) =>
                      setProfile({ ...profile, medicalHistory: e.target.value })
                    }
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
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <p className="mt-1">{profile.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>
                  <p className="mt-1">{profile.dateOfBirth}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <p className="mt-1">{profile.phoneNumber}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <p className="mt-1">{profile.address}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Blood Group
                  </label>
                  <p className="mt-1">{profile.bloodGroup}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Medical History
                  </label>
                  <p className="mt-1">{profile.medicalHistory}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Biometric Data
                  </label>
                  <p className="mt-1 text-sm text-gray-500">
                    {profile.biometricData}
                  </p>
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