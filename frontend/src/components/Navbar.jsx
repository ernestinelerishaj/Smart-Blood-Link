import { Link } from 'react-router-dom';

const Navbar = ({ user, role }) => {
  return (
    <nav className="bg-red-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold">
            Smart Blood Link
          </Link>
          
          <div className="flex space-x-4">
            {!user ? (
              <>
                <Link to="/login" className="hover:text-gray-200">
                  Login
                </Link>
                <Link to="/register" className="hover:text-gray-200">
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="hover:text-gray-200">
                  Dashboard
                </Link>
                {role === 'admin' && (
                  <Link to="/admin" className="hover:text-gray-200">
                    Admin Panel
                  </Link>
                )}
                {role === 'hospital' && (
                  <Link to="/blood-request" className="hover:text-gray-200">
                    Blood Requests
                  </Link>
                )}
                {role === 'paramedic' && (
                  <Link to="/donation-history" className="hover:text-gray-200">
                    Donation History
                  </Link>
                )}
                <Link to="/profile" className="hover:text-gray-200">
                  Profile
                </Link>
                <button
                  onClick={() => {
                    // Handle logout
                    window.location.href = '/';
                  }}
                  className="hover:text-gray-200"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 