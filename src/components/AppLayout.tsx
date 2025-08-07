import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from './Header';
import Login from './Login';
import SignUp from './SignUp';
import Dashboard from './Dashboard';
import ProfileSettings from './ProfileSettings';
import MobileApp from './mobile/MobileApp';
const AppLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = React.useState('login');

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          {currentView === 'login' ? (
            <div>
              <Login />
              <div className="text-center mt-4">
                <button 
                  onClick={() => setCurrentView('signup')}
                  className="text-blue-500 hover:underline"
                >
                  Need an account? Sign up
                </button>
              </div>
            </div>
          ) : (
            <div>
              <SignUp />
              <div className="text-center mt-4">
                <button 
                  onClick={() => setCurrentView('login')}
                  className="text-blue-500 hover:underline"
                >
                  Have an account? Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (user.status === 'pending') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Account Pending Approval</h2>
          <p>Your account is awaiting admin approval.</p>
        </div>
      </div>
    );
  }

  // Check if user is driver or monitor and should see mobile interface
  if (user.role === 'driver' || user.role === 'monitor') {
    return <MobileApp />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Dashboard />
    </div>
  );
};

export default AppLayout;