import { useState } from 'react';

const DonationHistory = ({ user }) => {
  const [donations, setDonations] = useState([
    {
      id: 1,
      date: '2024-03-15',
      bloodType: 'A+',
      units: 1,
      location: 'City Blood Center',
      verifiedBy: 'Dr. Smith',
      status: 'Completed',
      userId: 1,
    },
    {
      id: 2,
      date: '2024-01-20',
      bloodType: 'A+',
      units: 1,
      location: 'County Hospital',
      verifiedBy: 'Nurse Johnson',
      status: 'Completed',
      userId: 1,
    },
  ]);

  const [newDonation, setNewDonation] = useState({
    date: '',
    bloodType: '',
    units: '',
    location: '',
    verifiedBy: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const donation = {
      id: donations.length + 1,
      ...newDonation,
      status: 'Pending',
      userId: user.id,
    };
    setDonations([...donations, donation]);
    setNewDonation({
      date: '',
      bloodType: '',
      units: '',
      location: '',
      verifiedBy: '',
    });
  };

  const userDonations = donations.filter(donation => donation.userId === user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Donation History</h2>
      <p className="text-gray-600 mb-6">Welcome, {user.name}! Here's your donation history.</p>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold mb-4">New Donation Record</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                value={newDonation.date}
                onChange={(e) =>
                  setNewDonation({ ...newDonation, date: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Blood Type
              </label>
              <select
                value={newDonation.bloodType}
                onChange={(e) =>
                  setNewDonation({ ...newDonation, bloodType: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                required
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
                Units
              </label>
              <input
                type="number"
                value={newDonation.units}
                onChange={(e) =>
                  setNewDonation({ ...newDonation, units: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                required
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                value={newDonation.location}
                onChange={(e) =>
                  setNewDonation({ ...newDonation, location: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Verified By
              </label>
              <input
                type="text"
                value={newDonation.verifiedBy}
                onChange={(e) =>
                  setNewDonation({ ...newDonation, verifiedBy: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Add Donation Record
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Blood Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Units
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Verified By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {userDonations.map((donation) => (
              <tr key={donation.id}>
                <td className="px-6 py-4 whitespace-nowrap">{donation.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">{donation.bloodType}</td>
                <td className="px-6 py-4 whitespace-nowrap">{donation.units}</td>
                <td className="px-6 py-4 whitespace-nowrap">{donation.location}</td>
                <td className="px-6 py-4 whitespace-nowrap">{donation.verifiedBy}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      donation.status === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {donation.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DonationHistory; 