import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Shield, RefreshCw, CheckCircle, Phone, Mail, Bell } from 'lucide-react';

interface Alert {
  id: string;
  type: 'allergy' | 'missed_scan' | 'late_arrival';
  studentId: string;
  message: string;
  timestamp: Date;
  severity: 'high' | 'medium' | 'low';
  resolved: boolean;
}

const AlertsPanel: React.FC = () => {
  const { students, scanLogs, refreshData } = useApp();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
      generateAlerts();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshData]);

  useEffect(() => {
    generateAlerts();
  }, [students, scanLogs]);

  const generateAlerts = () => {
    const newAlerts: Alert[] = [];
    const today = new Date().toDateString();
    const now = new Date();
    const schoolStartTime = new Date();
    schoolStartTime.setHours(8, 0, 0, 0); // 8:00 AM

    students.forEach(student => {
      // Check for allergy alerts from recent scans
      const recentScans = scanLogs.filter(log => 
        log.studentId === student.id && 
        log.timestamp.toDateString() === today &&
        now.getTime() - log.timestamp.getTime() < 60 * 60 * 1000 // Within last hour
      );

      if (recentScans.length > 0 && student.allergies && student.allergies.length > 0) {
        newAlerts.push({
          id: `allergy-${student.id}-${Date.now()}`,
          type: 'allergy',
          studentId: student.id,
          message: `${student.name} has allergies: ${student.allergies.join(', ')}. Recently scanned in.`,
          timestamp: recentScans[0].timestamp,
          severity: 'high',
          resolved: false
        });
      }

      // Check for missed scans (no scan today)
      const todayScans = scanLogs.filter(log => 
        log.studentId === student.id && 
        log.timestamp.toDateString() === today
      );

      if (todayScans.length === 0 && now > schoolStartTime) {
        newAlerts.push({
          id: `missed-${student.id}`,
          type: 'missed_scan',
          studentId: student.id,
          message: `${student.name} has not been scanned in today.`,
          timestamp: new Date(),
          severity: 'medium',
          resolved: false
        });
      }

      // Check for late arrivals (first scan after 8:30 AM)
      const firstScanToday = todayScans
        .filter(log => log.action === 'in')
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())[0];

      if (firstScanToday) {
        const lateThreshold = new Date();
        lateThreshold.setHours(8, 30, 0, 0); // 8:30 AM
        
        if (firstScanToday.timestamp > lateThreshold) {
          newAlerts.push({
            id: `late-${student.id}`,
            type: 'late_arrival',
            studentId: student.id,
            message: `${student.name} arrived late at ${firstScanToday.timestamp.toLocaleTimeString()}.`,
            timestamp: firstScanToday.timestamp,
            severity: 'low',
            resolved: false
          });
        }
      }
    });

    setAlerts(newAlerts);
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'allergy': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'missed_scan': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'late_arrival': return <Bell className="h-5 w-5 text-orange-500" />;
    }
  };

  const getAlertColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-blue-500 bg-blue-50';
    }
  };

  const activeAlerts = alerts.filter(alert => !alert.resolved);
  const resolvedAlerts = alerts.filter(alert => alert.resolved);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Alerts & Incidents</h2>
        <div className="flex gap-2 items-center">
          <Badge variant="destructive" className="text-sm">
            {activeAlerts.length} Active
          </Badge>
          <Badge variant="secondary" className="text-sm">
            {resolvedAlerts.length} Resolved
          </Badge>
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">
                  {alerts.filter(a => a.type === 'allergy' && !a.resolved).length}
                </p>
                <p className="text-sm text-gray-600">Allergy Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">
                  {alerts.filter(a => a.type === 'missed_scan' && !a.resolved).length}
                </p>
                <p className="text-sm text-gray-600">Missed Scans</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{resolvedAlerts.length}</p>
                <p className="text-sm text-gray-600">Resolved Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Active Alerts</h3>
        {activeAlerts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-green-700">All Clear!</p>
              <p className="text-gray-600">No active alerts at this time.</p>
            </CardContent>
          </Card>
        ) : (
          activeAlerts.map(alert => {
            const student = students.find(s => s.id === alert.studentId);
            return (
              <Card key={alert.id} className={`border-l-4 ${getAlertColor(alert.severity)}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {alert.timestamp.toLocaleTimeString()} • {student?.grade}
                        </p>
                        {student?.emergencyContact && (
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline">
                              <Phone className="h-3 w-3 mr-1" />
                              Call Parent
                            </Button>
                            {student.parentEmail && (
                              <Button size="sm" variant="outline">
                                <Mail className="h-3 w-3 mr-1" />
                                Email
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      Resolve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {resolvedAlerts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Resolved Alerts</h3>
          {resolvedAlerts.slice(0, 5).map(alert => {
            const student = students.find(s => s.id === alert.studentId);
            return (
              <Card key={alert.id} className="opacity-60">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-gray-600">
                        Resolved • {alert.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;