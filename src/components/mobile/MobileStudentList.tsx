import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const MobileStudentList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { students, scanLogs } = useApp();
  const { user } = useAuth();

  // Filter students assigned to this user (bus driver/monitor)
  const assignedStudents = useMemo(() => {
    return students.filter(student => {
      // If user has busId, show students assigned to that bus
      if (user?.busId && student.busId === user.busId) return true;
      // If user is a monitor, show all students (or implement specific logic)
      if (user?.role === 'monitor') return true;
      return false;
    });
  }, [students, user]);

  // Filter by search term
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return assignedStudents;
    return assignedStudents.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [assignedStudents, searchTerm]);

  // Get latest scan status for each student
  const getStudentStatus = (studentId: string) => {
    const studentScans = scanLogs.filter(log => log.studentId === studentId);
    if (studentScans.length === 0) return 'unscanned';
    
    const latestScan = studentScans.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
    
    return latestScan.action === 'in' ? 'checked-in' : 'checked-out';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checked-in':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'checked-out':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'checked-in':
        return <Badge variant="default" className="bg-green-100 text-green-800">On Board</Badge>;
      case 'checked-out':
        return <Badge variant="secondary">Off Board</Badge>;
      default:
        return <Badge variant="destructive">Not Scanned</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="text-sm text-gray-600 mb-2">
        Showing {filteredStudents.length} of {assignedStudents.length} assigned students
      </div>

      <div className="space-y-2">
        {filteredStudents.map((student) => {
          const status = getStudentStatus(student.id);
          return (
            <Card key={student.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h4 className="font-medium">{student.name}</h4>
                      <p className="text-sm text-gray-600">{student.id}</p>
                      {student.grade && (
                        <p className="text-xs text-gray-500">Grade {student.grade}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-1">
                    {getStatusIcon(status)}
                    {getStatusBadge(status)}
                  </div>
                </div>

                {student.allergies && student.allergies.length > 0 && (
                  <div className="mt-3 p-2 bg-red-50 rounded-md border border-red-200">
                    <div className="flex items-center space-x-1">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">Allergies:</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                      {student.allergies.join(', ')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No students found</p>
        </div>
      )}
    </div>
  );
};

export default MobileStudentList;