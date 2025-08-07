import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Bus, Users, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MobileLayoutProps {
  children: React.ReactNode;
  title: string;
  showAlerts?: boolean;
  alertCount?: number;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ 
  children, 
  title, 
  showAlerts = false, 
  alertCount = 0 
}) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bus className="h-6 w-6" />
            <div>
              <h1 className="text-lg font-bold">SafePass Mobile</h1>
              <p className="text-xs text-blue-200">{user?.role} - {user?.name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {showAlerts && alertCount > 0 && (
              <div className="flex items-center space-x-1">
                <AlertTriangle className="h-4 w-4 text-yellow-300" />
                <Badge variant="destructive" className="text-xs">
                  {alertCount}
                </Badge>
              </div>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
              className="text-white hover:bg-blue-700"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="mt-2">
          <h2 className="text-sm font-medium">{title}</h2>
          {user?.busId && (
            <p className="text-xs text-blue-200">Assigned: {user.busId}</p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default MobileLayout;