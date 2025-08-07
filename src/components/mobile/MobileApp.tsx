import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import MobileLayout from './MobileLayout';
import MobileAlerts from './MobileAlerts';
import MobileQRScanner from './MobileQRScanner';
import MobileStudentList from './MobileStudentList';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, Users, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
const MobileApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('scanner');
  const [alertCount, setAlertCount] = useState(0);
  const { user } = useAuth();
  const { students, scanLogs } = useApp();

  // Calculate alert count (unscanned students + allergy alerts)
  useEffect(() => {
    if (!user?.busId) return;

    const assignedStudents = students.filter(s => s.busId === user.busId);
    const scannedStudentIds = new Set(scanLogs.map(log => log.studentId));
    const unscannedCount = assignedStudents.filter(s => !scannedStudentIds.has(s.id)).length;
    
    const allergyCount = assignedStudents.filter(s => 
      s.allergies && s.allergies.length > 0
    ).length;

    setAlertCount(unscannedCount + allergyCount);
  }, [students, scanLogs, user]);

  if (!user || (user.role !== 'driver' && user.role !== 'monitor')) {
    return (
      <MobileLayout title="Access Denied">
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-lg font-semibold mb-2">Access Restricted</h2>
          <p className="text-gray-600">
            This mobile app is only available for bus drivers and monitors.
          </p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout 
      title={`${user.role === 'driver' ? 'Bus Driver' : 'Monitor'} Dashboard`}
      showAlerts={true}
      alertCount={alertCount}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="scanner" className="flex items-center space-x-1">
            <QrCode className="h-4 w-4" />
            <span>Scan</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>Students</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center space-x-1">
            <AlertTriangle className="h-4 w-4" />
            <span>Alerts</span>
            {alertCount > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {alertCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scanner" className="space-y-4">
          <MobileQRScanner />
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Quick Tips:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Scan students as they board/exit</li>
              <li>• Red alerts indicate allergies</li>
              <li>• Data syncs automatically</li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <MobileStudentList />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <MobileAlerts />
        </TabsContent>
      </Tabs>
    </MobileLayout>
  );
};

export default MobileApp;