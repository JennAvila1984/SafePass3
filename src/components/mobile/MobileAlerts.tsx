import React, { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Alert {
  id: string;
  type: 'allergy' | 'unscanned' | 'late';
  studentName: string;
  message: string;
  timestamp: Date;
  severity: 'high' | 'medium' | 'low';
}

const MobileAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const { students, scanLogs } = useApp();
  const { user } = useAuth();

  useEffect(() => {
    generateAlerts();
  }, [students, scanLogs, user]);

  const generateAlerts = () => {
    const newAlerts: Alert[] = [];
    const assignedStudents = students.filter(s => s.busId === user?.busId);
    const scannedStudentIds = new Set(scanLogs.map(log => log.studentId));

    // Allergy alerts for assigned students
    assignedStudents.forEach(student => {
      if (student.allergies && student.allergies.length > 0) {
        newAlerts.push({
          id: `allergy-${student.id}`,
          type: 'allergy',
          studentName: student.name,
          message: `Has allergies: ${student.allergies.join(', ')}`,
          timestamp: new Date(),
          severity: 'high'
        });
      }
    });

    // Unscanned student alerts
    assignedStudents.forEach(student => {
      if (!scannedStudentIds.has(student.id)) {
        newAlerts.push({
          id: `unscanned-${student.id}`,
          type: 'unscanned',
          studentName: student.name,
          message: 'Not yet scanned today',
          timestamp: new Date(),
          severity: 'medium'
        });
      }
    });

    setAlerts(newAlerts.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    }));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'allergy':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'unscanned':
        return <Users className="h-4 w-4 text-yellow-600" />;
      case 'late':
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAlertBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Active Alerts</h3>
        <Badge variant="outline">{alerts.length}</Badge>
      </div>

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <p className="text-green-700 font-medium">All Clear!</p>
            <p className="text-sm text-gray-600">No active alerts</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <Card key={alert.id} className={`border-l-4 ${
              alert.severity === 'high' ? 'border-l-red-500' :
              alert.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.type)}
                    <div>
                      <h4 className="font-medium">{alert.studentName}</h4>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                    </div>
                  </div>
                  {getAlertBadge(alert.severity)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileAlerts;