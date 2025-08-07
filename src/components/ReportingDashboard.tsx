import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LiveTracker from './reporting/LiveTracker';
import AttendanceReport from './reporting/AttendanceReport';
import ScanHistoryLogs from './reporting/ScanHistoryLogs';
import AlertsPanel from './reporting/AlertsPanel';
import AnalyticsView from './reporting/AnalyticsView';
import { BarChart3, Users, Clock, AlertTriangle, TrendingUp, Download } from 'lucide-react';

const ReportingDashboard: React.FC = () => {
  const { user } = useAuth();
  const { students, scanLogs } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Access control
  const canViewFullDashboard = user?.role === 'admin' || user?.role === 'principal';
  const canViewAlerts = canViewFullDashboard || user?.role === 'nurse';
  const canViewRecentScans = canViewFullDashboard || user?.role === 'driver' || user?.role === 'monitor';

  if (!canViewRecentScans) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
            <p className="text-gray-600">You don't have permission to view the reporting dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reporting Dashboard</h1>
        <div className="flex gap-2">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {canViewFullDashboard ? (
        <Tabs defaultValue="live" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="live">Live Tracker</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="history">Scan History</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="live">
            <LiveTracker />
          </TabsContent>
          
          <TabsContent value="attendance">
            <AttendanceReport selectedDate={selectedDate} />
          </TabsContent>
          
          <TabsContent value="history">
            <ScanHistoryLogs selectedDate={selectedDate} />
          </TabsContent>
          
          <TabsContent value="alerts">
            <AlertsPanel />
          </TabsContent>
          
          <TabsContent value="analytics">
            <AnalyticsView />
          </TabsContent>
        </Tabs>
      ) : canViewAlerts ? (
        <AlertsPanel />
      ) : (
        <ScanHistoryLogs selectedDate={selectedDate} />
      )}
    </div>
  );
};

export default ReportingDashboard;