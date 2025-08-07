import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QrCode, Scan, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const MobileQRScanner: React.FC = () => {
  const [studentId, setStudentId] = useState('');
  const [action, setAction] = useState<'in' | 'out'>('in');
  const [isScanning, setIsScanning] = useState(false);
  const { students, addScanLog } = useApp();
  const { user } = useAuth();

  const location = user?.busId || 'Mobile Device';

  const handleQuickScan = async () => {
    if (!studentId) {
      toast.error('Please enter student ID');
      return;
    }

    setIsScanning(true);

    const student = students.find(s => s.id === studentId);
    if (!student) {
      toast.error('Student not found');
      setIsScanning(false);
      return;
    }

    try {
      // Save scan event to Supabase
      const { error } = await supabase
        .from('scan_events')
        .insert({
          student_id: studentId,
          location,
          action,
          timestamp: new Date().toISOString(),
          scanned_by: user?.name || 'Mobile User'
        });

      if (error) throw error;

      // Add to local state
      addScanLog({
        studentId,
        location,
        action,
        timestamp: new Date(),
        scannedBy: user?.name || 'Mobile User'
      });

      // Show allergy alert if needed
      if (student.allergies && student.allergies.length > 0) {
        toast.error(`⚠️ ALLERGY ALERT: ${student.name} - ${student.allergies.join(', ')}`, {
          duration: 8000,
        });
        
        // Notify nurse
        await supabase.functions.invoke('allergy-notification', {
          body: { 
            studentName: student.name, 
            allergies: student.allergies, 
            location, 
            scannedBy: user?.name,
            timestamp: new Date().toISOString()
          }
        });
      }

      toast.success(`✅ ${student.name} scanned ${action}`);
      setStudentId('');
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Failed to process scan');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-4">
        <div className="text-center mb-6">
          <QrCode className="h-12 w-12 mx-auto text-blue-600 mb-2" />
          <h3 className="text-lg font-semibold">Quick Scan</h3>
          <p className="text-sm text-gray-600">Location: {location}</p>
        </div>

        <div>
          <Input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value.toUpperCase())}
            placeholder="Enter Student ID"
            className="text-center text-lg font-mono h-12"
            autoFocus
          />
        </div>

        <div>
          <Select value={action} onValueChange={(value: 'in' | 'out') => setAction(value)}>
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in">✅ Check In</SelectItem>
              <SelectItem value="out">❌ Check Out</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleQuickScan} 
          className="w-full h-12 text-lg"
          disabled={isScanning || !studentId}
        >
          {isScanning ? (
            'Processing...'
          ) : (
            <>
              <Scan className="h-5 w-5 mr-2" />
              Scan Student
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MobileQRScanner;