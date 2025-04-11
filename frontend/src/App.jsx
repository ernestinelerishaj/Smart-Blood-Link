import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard';
import UserProfile from './components/UserProfile';
import BloodRequest from './components/BloodRequest';
import DonationHistory from './components/DonationHistory';
import AdminPanel from './components/admin/AdminPanel';

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar user={user} role={role} />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Login setUser={setUser} setRole={setRole} />} />
            <Route path="/login" element={<Login setUser={setUser} setRole={setRole} />} />
            <Route path="/register" element={<Register setUser={setUser} setRole={setRole} />} />
            <Route path="/dashboard" element={<Dashboard user={user} role={role} />} />
            <Route path="/profile" element={<UserProfile user={user} />} />
            <Route path="/blood-request" element={<BloodRequest role={role} />} />
            <Route path="/donation-history" element={<DonationHistory user={user} />} />
            <Route path="/admin" element={<AdminPanel role={role} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
