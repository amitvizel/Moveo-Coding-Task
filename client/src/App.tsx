import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import { useAuth } from './context/AuthContext';

// Protected route wrapper using AuthContext
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to onboarding if preferences are missing
  // But don't redirect if we are already on the onboarding page
  if (!user?.preferences && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
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
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div className="p-8">
                  <h1 className="text-3xl font-bold">Welcome to the Dashboard, {user?.name || user?.email}!</h1>
                  
                  {user?.preferences && (
                    <div className="mt-4 p-4 bg-white rounded shadow">
                      <h2 className="text-xl font-bold mb-2">Your Preferences:</h2>
                      <p><strong>Risk Tolerance:</strong> {user.preferences.riskTolerance}</p>
                      <p><strong>Favorite Coins:</strong> {user.preferences.favoriteCoins.join(', ')}</p>
                      <p><strong>Content Focus:</strong> {user.preferences.contentFocus.join(', ')}</p>
                    </div>
                  )}

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
