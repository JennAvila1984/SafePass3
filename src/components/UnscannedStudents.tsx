import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, Send } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

const UnscannedStudents: React.FC = () => {
  const { students, scanLogs } = useApp();
  const { user } = useAuth();
  const [unscannedStudents, setUnscannedStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const checkUnscannedStudents = () => {
    const now = new Date();
    const morningCutoff = new Date();
    morningCutoff.setHours(8, 30, 0, 0);
    
    const afternoonCutoff = new Date();
    afternoonCutoff.setHours(15, 30, 0, 0);

    const today = now.toDateString();
    const todayScans = scanLogs.filter(log => 
      new Date(log.timestamp).toDateString() === today
    );

    const unscanned = students.filter(student => {
      if (student.transportationStatus === 'walker') return false;
      
      const studentScans = todayScans.filter(log => log.studentId === student.id);
      const hasMorningScan = studentScans.some(log => {
        const scanTime = new Date(log.timestamp);
        return scanTime.getHours() < 12 && log.action === 'in';
      });
      
      const hasAfternoonScan = studentScans.some(log => {
        const scanTime = new Date(log.timestamp);
        return scanTime.getHours() >= 12 && log.action === 'out';
      });

      if (now > morningCutoff && !hasMorningScan) return true;
      if (now > afternoonCutoff && !hasAfternoonScan) return true;
      
      return false;
    }).map(student => ({
      ...student,
      missedType: getMissedType(student, todayScans, now, morningCutoff, afternoonCutoff)
    }));

    setUnscannedStudents(unscanned);
  };

  const getMissedType = (student: any, todayScans: any[], now: Date, morningCutoff: Date, afternoonCutoff: Date) => {
    const studentScans = todayScans.filter(log => log.studentId === student.id);
    const hasMorningScan = studentScans.some(log => {
      const scanTime = new Date(log.timestamp);
      return scanTime.getHours() < 12 && log.action === 'in';
    });
    
    if (now > morningCutoff && !hasMorningScan) return 'morning';
    if (now > afternoonCutoff) return 'afternoon';
    return 'unknown';
  };

  const sendNotification = async (student: any) => {
    setLoading(true);
    try {
      const message = student.missedType === 'morning' 
        ? `⚠️ SafePass Alert: ${student.name} has not scanned in this morning. Please confirm attendance.`
        : `⚠️ SafePass Alert: ${student.name} has not scanned out this afternoon. Please confirm pickup.`;

      const { data, error } = await supabase.functions.invoke('attendance-notification', {
        body: {
          studentId: student.id,
          studentName: student.name,
          message,
          parentEmail: student.parentEmail,
          parentPhone: student.parentPhone,
          notificationType: student.missedType
        }
      });

      if (error) throw error;
      toast({ title: 'Notification sent successfully', description: `Alert sent for ${student.name}` });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({ title: 'Error', description: 'Failed to send notification', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const markManually = (studentId: string, action: 'in' | 'out') => {
    // This would typically update the scan logs
    toast({ title: 'Manual scan recorded', description: `Student marked as ${action}` });
    checkUnscannedStudents(); // Refresh the list
  };

  useEffect(() => {
    checkUnscannedStudents();
    const interval = setInterval(checkUnscannedStudents, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [students, scanLogs]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-8 w-8 text-orange-500" />
          Unscanned Students
        </h1>
        <p className="text-gray-600">Students who missed required scan times</p>
      </div>

      <div className="mb-4">
        <Button onClick={checkUnscannedStudents} variant="outline">
          <Clock className="h-4 w-4 mr-2" />
          Refresh Check
        </Button>
      </div>

      {unscannedStudents.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-700">All Students Accounted For</h3>
            <p className="text-gray-600">No missing scans detected at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {unscannedStudents.map(student => (
            <Card key={student.id} className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{student.name}</span>
                  <Badge variant={student.missedType === 'morning' ? 'destructive' : 'secondary'}>
                    {student.missedType === 'morning' ? 'Morning' : 'Afternoon'}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-gray-600">Grade {student.grade} • {student.teacherName}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p><strong>Transportation:</strong> {student.transportationStatus}</p>
                  <p><strong>Parent:</strong> {student.parentPhone || 'No contact'}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => sendNotification(student)}
                    disabled={loading || !student.parentEmail}
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Notify Parent
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => markManually(student.id, 'in')}
                    className="flex-1"
                  >
                    Mark In
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => markManually(student.id, 'out')}
                    className="flex-1"
                  >
                    Mark Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UnscannedStudents;