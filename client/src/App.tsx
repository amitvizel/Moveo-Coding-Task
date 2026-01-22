import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useAuth } from './context/AuthContext';

// Protected route wrapper using AuthContext
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const { logout, user } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div className="p-8">
                  <h1 className="text-3xl font-bold">Welcome to the Dashboard, {user?.name || user?.email}!</h1>
                  <button 
                    onClick={logout}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
