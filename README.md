# Smart Blood Link

## 🩸 Project Overview

Smart Blood Link is a full-stack blood bank management system designed to improve the efficiency and accessibility of blood donation services. By leveraging role-based access, real-time updates, and biometric authentication, it streamlines operations for hospitals, paramedics, and donors while ensuring secure data handling. The project addresses the growing need for **digitized emergency blood management**, especially in underserved regions.

## Features

- Role-based access control (User, Paramedic, Hospital, Admin)
- User registration with biometric data
- Blood request management
- Donation tracking
- Real-time status updates
- Secure authentication
- Biometric verification (simulated)

## Tech Stack

## 🌐 Live Demo

🩸 **Smart Blood Link is live!**  
🔗 [Visit the App](https://smart-blood-link.vercel.app/)  

### Frontend
- React
- Tailwind CSS
- React Router
- Axios

### Backend
- FastAPI
- SQLite
- JWT Authentication
- Python

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/smart-blood-link.git
cd smart-blood-link
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
pip install -r requirements.txt
```

### Running the Application

1. Start the backend server:
```bash
cd backend
uvicorn main:app --reload
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Project Structure

```
smart-blood-link/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── admin/
│   │   │   └── ...
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── bloodbank.db
└── README.md
```

## API Endpoints

### Authentication
- POST /token - Login and get access token
- POST /users/ - Register new user
- GET /users/me - Get current user profile

### Blood Requests
- POST /blood-requests/ - Create new blood request
- GET /blood-requests/ - Get all blood requests

### Donations
- POST /donations/ - Create new donation record
- GET /donations/ - Get all donations

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- CORS enabled for frontend access
- Secure session management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- FastAPI documentation
- React documentation
- Tailwind CSS documentation 
