import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Clock, Download, Printer, Loader2 } from 'lucide-react';

interface AttendanceReportProps {
  selectedDate: string;
}

interface Student {
  id: string;
  name: string;
  grade: string;
}

interface ScanEvent {
  id: string;
  student_id: string;
  location: string;
  action: string;
  timestamp: string;
  scanned_by: string;
}

const AttendanceReport: React.FC<AttendanceReportProps> = ({ selectedDate }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [scanEvents, setScanEvents] = useState<ScanEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsResponse, scanEventsResponse] = await Promise.all([
        supabase.from('students').select('id, name, grade'),
        supabase.from('scan_events').select('*').order('timestamp', { ascending: false })
      ]);

      if (studentsResponse.data) setStudents(studentsResponse.data);
      if (scanEventsResponse.data) setScanEvents(scanEventsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedDateObj = new Date(selectedDate);
  const dayScans = scanEvents.filter(log => 
    new Date(log.timestamp).toDateString() === selectedDateObj.toDateString()
  );

  const getAttendanceStatus = (studentId: string) => {
    const studentScans = dayScans.filter(log => log.student_id === studentId);
    if (studentScans.length === 0) return 'missing';
    
    const firstScan = studentScans[studentScans.length - 1];
    const scanTime = new Date(firstScan.timestamp);
    const cutoffTime = new Date(selectedDateObj);
    cutoffTime.setHours(8, 30, 0, 0); // 8:30 AM cutoff
    
    if (scanTime > cutoffTime) return 'late';
    return 'present';
  };

  const gradeStats = students.reduce((acc, student) => {
    const grade = student.grade;
    if (!acc[grade]) {
      acc[grade] = { total: 0, present: 0, late: 0, missing: 0 };
    }
    acc[grade].total++;
    
    const status = getAttendanceStatus(student.id);
    acc[grade][status]++;
    
    return acc;
  }, {} as Record<string, { total: number; present: number; late: number; missing: number }>);

  const totalStats = Object.values(gradeStats).reduce(
    (acc, grade) => ({
      total: acc.total + grade.total,
      present: acc.present + grade.present,
      late: acc.late + grade.late,
      missing: acc.missing + grade.missing
    }),
    { total: 0, present: 0, late: 0, missing: 0 }
  );

  const exportToCsv = () => {
    const csvContent = [
      ['Grade', 'Total', 'Present', 'Late', 'Missing', 'Attendance Rate'],
      ...Object.entries(gradeStats).map(([grade, stats]) => [
        grade,
        stats.total,
        stats.present,
        stats.late,
        stats.missing,
        `${((stats.present + stats.late) / stats.total * 100).toFixed(1)}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${selectedDate}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading attendance data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Daily Attendance Report</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCsv}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{totalStats.present}</p>
                <p className="text-sm text-gray-600">Present</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{totalStats.late}</p>
                <p className="text-sm text-gray-600">Late</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{totalStats.missing}</p>
                <p className="text-sm text-gray-600">Missing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                %
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {totalStats.total > 0 ? ((totalStats.present + totalStats.late) / totalStats.total * 100).toFixed(1) : 0}%
                </p>
                <p className="text-sm text-gray-600">Attendance Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance by Grade</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grade</TableHead>
                <TableHead>Total Students</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Late</TableHead>
                <TableHead>Missing</TableHead>
                <TableHead>Attendance Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(gradeStats).map(([grade, stats]) => (
                <TableRow key={grade}>
                  <TableCell className="font-medium">{grade}</TableCell>
                  <TableCell>{stats.total}</TableCell>
                  <TableCell>
                    <Badge variant="default">{stats.present}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{stats.late}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="destructive">{stats.missing}</Badge>
                  </TableCell>
                  <TableCell>
                    {stats.total > 0 ? ((stats.present + stats.late) / stats.total * 100).toFixed(1) : 0}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceReport;