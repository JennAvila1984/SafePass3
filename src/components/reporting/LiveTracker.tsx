import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bus, School, AlertTriangle, RefreshCw, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LiveTracker: React.FC = () => {
  const { students, scanLogs, refreshData } = useApp();
  const [filterGrade, setFilterGrade] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshData]);

  const getStudentStatus = (studentId: string) => {
    const today = new Date().toDateString();
    const todayScans = scanLogs
      .filter(log => log.studentId === studentId && log.timestamp.toDateString() === today)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    if (todayScans.length === 0) return 'unaccounted';
    
    const latestScan = todayScans[0];
    if (latestScan.action === 'out') return 'unaccounted';
    
    if (latestScan.location.toLowerCase().includes('bus')) return 'on-bus';
    if (latestScan.location.toLowerCase().includes('classroom') || 
        latestScan.location.toLowerCase().includes('entrance') || 
        latestScan.location.toLowerCase().includes('cafeteria')) return 'on-campus';
    
    return 'unaccounted';
  };

  const getBusStatus = () => {
    const today = new Date().toDateString();
    const busScans = scanLogs.filter(log => 
      log.location.toLowerCase().includes('bus') && 
      log.timestamp.toDateString() === today
    );
    
    const recentBusActivity = busScans.filter(log => 
      new Date().getTime() - log.timestamp.getTime() < 30 * 60 * 1000
    );
    
    if (recentBusActivity.length > 0) return 'in-transit';
    if (busScans.length > 0) return 'arrived';
    return 'missing-scans';
  };

  const filteredStudents = students.filter(student => {
    if (filterGrade !== 'all' && student.grade !== filterGrade) return false;
    return true;
  });

  const onBusStudents = filteredStudents.filter(s => getStudentStatus(s.id) === 'on-bus');
  const onCampusStudents = filteredStudents.filter(s => getStudentStatus(s.id) === 'on-campus');
  const unaccountedStudents = filteredStudents.filter(s => getStudentStatus(s.id) === 'unaccounted');

  const busStatus = getBusStatus();
  const busStatusColors = {
    'in-transit': 'bg-blue-500',
    'arrived': 'bg-green-500',
    'missing-scans': 'bg-red-500'
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-6 items-center">
        <Select value={filterGrade} onValueChange={setFilterGrade}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            <SelectItem value="K">Kindergarten</SelectItem>
            <SelectItem value="1st">1st Grade</SelectItem>
            <SelectItem value="2nd">2nd Grade</SelectItem>
            <SelectItem value="3rd">3rd Grade</SelectItem>
            <SelectItem value="4th">4th Grade</SelectItem>
            <SelectItem value="5th">5th Grade</SelectItem>
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          onClick={refreshData}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bus className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{onBusStudents.length}</p>
                <p className="text-sm text-gray-600">On Bus</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{onCampusStudents.length}</p>
                <p className="text-sm text-gray-600">On Campus</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{unaccountedStudents.length}</p>
                <p className="text-sm text-gray-600">Unaccounted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${busStatusColors[busStatus]}`} />
              <div>
                <p className="text-sm font-medium capitalize">{busStatus.replace('-', ' ')}</p>
                <p className="text-xs text-gray-600">Bus Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bus className="h-5 w-5 text-blue-500" />
              On Bus ({onBusStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto">
            {onBusStudents.map(student => (
              <div key={student.id} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-gray-600">{student.grade}</p>
                </div>
                <Badge variant="default">On Bus</Badge>
              </div>
            ))}
            {onBusStudents.length === 0 && (
              <p className="text-gray-500 text-center py-4">No students on bus</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-500" />
              On Campus ({onCampusStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto">
            {onCampusStudents.map(student => (
              <div key={student.id} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-gray-600">{student.grade}</p>
                </div>
                <Badge variant="secondary">On Campus</Badge>
              </div>
            ))}
            {onCampusStudents.length === 0 && (
              <p className="text-gray-500 text-center py-4">No students on campus</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Unaccounted ({unaccountedStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto">
            {unaccountedStudents.map(student => (
              <div key={student.id} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-gray-600">{student.grade}</p>
                </div>
                <Badge variant="destructive">Missing</Badge>
              </div>
            ))}
            {unaccountedStudents.length === 0 && (
              <p className="text-gray-500 text-center py-4">All students accounted for</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveTracker;