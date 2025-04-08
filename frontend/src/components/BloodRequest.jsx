import { useState } from 'react';

const BloodRequest = ({ role }) => {
  const [requests, setRequests] = useState([
    {
      id: 1,
      bloodType: 'A+',
      units: 2,
      hospital: 'City General Hospital',
      location: '123 Main St, City',
      status: 'Pending',
      date: '2024-04-08',
    },
    {
      id: 2,
      bloodType: 'O-',
      units: 1,
      hospital: 'County Medical Center',
      location: '456 Oak Ave, County',
      status: 'Approved',
      date: '2024-04-07',
    },
  ]);

  const [newRequest, setNewRequest] = useState({
    bloodType: '',
    units: '',
    hospital: '',
    location: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const request = {
      id: requests.length + 1,
      ...newRequest,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
    };
    setRequests([...requests, request]);
    setNewRequest({
      bloodType: '',
      units: '',
      hospital: '',
      location: '',
    });
  };

  const handleStatusChange = (id, newStatus) => {
    setRequests(
      requests.map((request) =>
        request.id === id ? { ...request, status: newStatus } : request
      )
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Blood Requests</h2>

      {role === 'hospital' && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-lg font-semibold mb-4">New Blood Request</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Blood Type
                </label>
                <select
                  value={newRequest.bloodType}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, bloodType: e.target.value })
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
                  Units Required
                </label>
                <input
                  type="number"
                  value={newRequest.units}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, units: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Hospital Name
                </label>
                <input
                  type="text"
                  value={newRequest.hospital}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, hospital: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  value={newRequest.location}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, location: e.target.value })
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
              Submit Request
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Blood Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Units
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hospital
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              {role === 'admin' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 whitespace-nowrap">{request.bloodType}</td>
                <td className="px-6 py-4 whitespace-nowrap">{request.units}</td>
                <td className="px-6 py-4 whitespace-nowrap">{request.hospital}</td>
                <td className="px-6 py-4 whitespace-nowrap">{request.location}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      request.status === 'Approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{request.date}</td>
                {role === 'admin' && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleStatusChange(request.id, 'Approved')}
                      className="text-green-600 hover:text-green-900 mr-2"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(request.id, 'Rejected')}
                      className="text-red-600 hover:text-red-900"
                    >
                      Reject
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BloodRequest; 