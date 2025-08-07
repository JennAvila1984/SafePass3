import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QrCode, Scan } from 'lucide-react';
import { toast } from 'sonner';
import AllergyAlert from '@/components/AllergyAlert';
import { supabase } from '@/lib/supabase';
const QRScanner: React.FC = () => {
  const [studentId, setStudentId] = useState('');
  const [location, setLocation] = useState('');
  const [action, setAction] = useState<'in' | 'out'>('in');
  const [showAllergyAlert, setShowAllergyAlert] = useState(false);
  const [alertStudent, setAlertStudent] = useState<any>(null);
  const { students, addScanLog } = useApp();
  const { user } = useAuth();

  const notifyNurse = async (studentName: string, allergies: string[]) => {
    try {
      await supabase.functions.invoke('allergy-notification', {
        body: { 
          studentName, 
          allergies, 
          location, 
          scannedBy: user?.name,
          timestamp: new Date().toISOString()
        }
      });
      toast.success('Nurse has been notified');
    } catch (error) {
      console.error('Failed to notify nurse:', error);
      toast.error('Failed to notify nurse');
    }
  };

  const handleScan = async () => {
    if (!studentId || !location) {
      toast.error('Please enter student ID and location');
      return;
    }

    const student = students.find(s => s.id === studentId);
    if (!student) {
      toast.error('Student not found');
      return;
    }

    try {
      // Save scan event to Supabase database
      const { error } = await supabase
        .from('scan_events')
        .insert({
          student_id: studentId,
          location,
          action,
          timestamp: new Date().toISOString(),
          scanned_by: user?.name || 'Unknown'
        });

      if (error) {
        console.error('Error saving scan event:', error);
        toast.error('Failed to save scan event');
        return;
      }

      // Also add to local state for immediate UI update
      addScanLog({
        studentId,
        location,
        action,
        timestamp: new Date(),
        scannedBy: user?.name || 'Unknown'
      });

      // Check for allergies
      if (student.allergies && student.allergies.length > 0) {
        setAlertStudent(student);
        setShowAllergyAlert(true);
      }

      toast.success(`${student.name} scanned ${action} at ${location}`);
      setStudentId('');
    } catch (error) {
      console.error('Error during scan:', error);
      toast.error('Failed to process scan');
    }
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="h-5 w-5" />
            <span>QR Scanner</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Student ID</label>
            <Input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter or scan student ID"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Try: STU001 or STU002</p>
          </div>
          
          <div>
            <label className="text-sm font-medium">Location</label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bus #1">Bus #1</SelectItem>
                <SelectItem value="Bus #2">Bus #2</SelectItem>
                <SelectItem value="Classroom 101">Classroom 101</SelectItem>
                <SelectItem value="Classroom 205">Classroom 205</SelectItem>
                <SelectItem value="Main Entrance">Main Entrance</SelectItem>
                <SelectItem value="Cafeteria">Cafeteria</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Action</label>
            <Select value={action} onValueChange={(value: 'in' | 'out') => setAction(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Check In</SelectItem>
                <SelectItem value="out">Check Out</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleScan} className="w-full">
            <Scan className="h-4 w-4 mr-2" />
            Scan Student
          </Button>
        </CardContent>
      </Card>

      {showAllergyAlert && alertStudent && (
        <AllergyAlert
          studentName={alertStudent.name}
          allergies={alertStudent.allergies}
          onClose={() => setShowAllergyAlert(false)}
          onNotifyNurse={() => notifyNurse(alertStudent.name, alertStudent.allergies)}
        />
      )}
    </>
  );
};

export default QRScanner;