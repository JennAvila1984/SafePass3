import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3, Users, Clock, Loader2 } from 'lucide-react';

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

const AnalyticsView: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [scanEvents, setScanEvents] = useState<ScanEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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

  // Get data for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toDateString();
  }).reverse();

  const dailyScanTotals = last7Days.map(dateString => {
    const dayScans = scanEvents.filter(log => 
      new Date(log.timestamp).toDateString() === dateString
    );
    return {
      date: dateString,
      scans: dayScans.length,
      uniqueStudents: new Set(dayScans.map(log => log.student_id)).size
    };
  });

  // Calculate late arrivals by grade
  const lateArrivalsByGrade = students.reduce((acc, student) => {
    const grade = student.grade;
    if (!acc[grade]) acc[grade] = 0;
    
    const studentScans = scanEvents.filter(log => log.student_id === student.id);
    const lateScans = studentScans.filter(log => {
      const scanTime = new Date(log.timestamp);
      const cutoff = new Date(scanTime);
      cutoff.setHours(8, 30, 0, 0);
      return scanTime > cutoff;
    });
    
    acc[grade] += lateScans.length;
    return acc;
  }, {} as Record<string, number>);

  // Find students with frequent missed scans
  const missedScansByStudent = students.map(student => {
    const totalDays = 7; // Last 7 days
    const studentScanDays = new Set(
      scanEvents
        .filter(log => log.student_id === student.id)
        .map(log => new Date(log.timestamp).toDateString())
    ).size;
    
    const missedDays = totalDays - studentScanDays;
    return {
      student,
      missedDays,
      attendanceRate: ((studentScanDays / totalDays) * 100).toFixed(1)
    };
  }).sort((a, b) => b.missedDays - a.missedDays);

  const totalScansThisWeek = dailyScanTotals.reduce((sum, day) => sum + day.scans, 0);
  const avgScansPerDay = (totalScansThisWeek / 7).toFixed(1);
  const totalUniqueStudents = new Set(scanEvents.map(log => log.student_id)).size;
  const overallAttendanceRate = students.length > 0 ? ((totalUniqueStudents / students.length) * 100).toFixed(1) : '0';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics & Trends</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{totalScansThisWeek}</p>
                <p className="text-sm text-gray-600">Total Scans (7 days)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{avgScansPerDay}</p>
                <p className="text-sm text-gray-600">Avg Scans/Day</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{overallAttendanceRate}%</p>
                <p className="text-sm text-gray-600">Attendance Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {Object.values(lateArrivalsByGrade).reduce((sum, count) => sum + count, 0)}
                </p>
                <p className="text-sm text-gray-600">Late Arrivals</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Scan Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dailyScanTotals.map((day, index) => {
                const maxScans = Math.max(...dailyScanTotals.map(d => d.scans));
                const barWidth = maxScans > 0 ? (day.scans / maxScans) * 100 : 0;
                
                return (
                  <div key={day.date} className="flex items-center space-x-3">
                    <div className="w-20 text-sm text-gray-600">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                      <div 
                        className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${barWidth}%` }}
                      >
                        <span className="text-white text-xs font-medium">
                          {day.scans}
                        </span>
                      </div>
                    </div>
                    <div className="w-16 text-sm text-gray-600">
                      {day.uniqueStudents} students
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Late Arrivals by Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(lateArrivalsByGrade).map(([grade, count]) => {
                const maxLate = Math.max(...Object.values(lateArrivalsByGrade));
                const barWidth = maxLate > 0 ? (count / maxLate) * 100 : 0;
                
                return (
                  <div key={grade} className="flex items-center space-x-3">
                    <div className="w-16 text-sm font-medium">{grade}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                      <div 
                        className="bg-orange-500 h-6 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${barWidth}%` }}
                      >
                        <span className="text-white text-xs font-medium">
                          {count}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Students with Frequent Missed Scans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {missedScansByStudent.slice(0, 10).map((record, index) => (
              <div key={record.student.id} className="flex justify-between items-center p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{record.student.name}</p>
                    <p className="text-sm text-gray-600">{record.student.grade}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={record.missedDays > 2 ? 'destructive' : record.missedDays > 0 ? 'secondary' : 'default'}>
                    {record.missedDays} missed days
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">
                    {record.attendanceRate}% attendance
                  </p>
                </div>
              </div>
            ))}
            {missedScansByStudent.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No attendance data available for analysis.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsView;