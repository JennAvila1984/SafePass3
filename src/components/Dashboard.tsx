import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import QRScanner from './QRScanner';
import StudentCard from './StudentCard';
import TeacherStudentList from './TeacherStudentList';
import StudentManagement from './StudentManagement';
import ScheduleUpload from './ScheduleUpload';
import UserManagement from './UserManagement';
import UnscannedStudents from './UnscannedStudents';
import TrainingHelp from './TrainingHelp';
import ReportingDashboard from './ReportingDashboard';
import { Users, Scan, Clock, BarChart3, UserPlus, Calendar, List, AlertTriangle, Book, Settings } from 'lucide-react';
import AdminSettings from './AdminSettings';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { students, scanLogs } = useApp();
  const [currentView, setCurrentView] = useState('dashboard');

  const todayScans = scanLogs.filter(log => 
    new Date(log.timestamp).toDateString() === new Date().toDateString()
  );
  
  const renderAdminDashboard = () => (
    <div className="space-y-6">
      <div className="flex gap-2 mb-4 flex-wrap">
        <Button 
          variant={currentView === 'dashboard' ? 'default' : 'outline'}
          onClick={() => setCurrentView('dashboard')}
        >
          Dashboard
        </Button>
        <Button 
          variant={currentView === 'users' ? 'default' : 'outline'}
          onClick={() => setCurrentView('users')}
        >
          <Users className="h-4 w-4 mr-2" />
          Manage Users
        </Button>
        <Button 
          variant={currentView === 'students' ? 'default' : 'outline'}
          onClick={() => setCurrentView('students')}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Manage Students
        </Button>
        <Button 
          variant={currentView === 'schedules' ? 'default' : 'outline'}
          onClick={() => setCurrentView('schedules')}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Schedules
        </Button>
        <Button 
          variant={currentView === 'unscanned' ? 'default' : 'outline'}
          onClick={() => setCurrentView('unscanned')}
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Unscanned
        </Button>
        <Button 
          variant={currentView === 'reports' ? 'default' : 'outline'}
          onClick={() => setCurrentView('reports')}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Reports
        </Button>
        <Button 
          variant={currentView === 'settings' ? 'default' : 'outline'}
          onClick={() => setCurrentView('settings')}
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
        <Button 
          variant={currentView === 'help' ? 'default' : 'outline'}
          onClick={() => setCurrentView('help')}
        >
          <Book className="h-4 w-4 mr-2" />
          Help
        </Button>
      </div>
      
      {currentView === 'dashboard' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{students.length}</p>
                    <p className="text-sm text-gray-600">Total Students</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Scan className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{todayScans.length}</p>
                    <p className="text-sm text-gray-600">Today's Scans</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Scan Activity</h3>
              <Card>
                <CardContent className="p-4">
                  {scanLogs.slice(0, 5).map(log => {
                    const student = students.find(s => s.id === log.studentId);
                    return (
                      <div key={log.id} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">{student?.name}</p>
                          <p className="text-sm text-gray-600">{log.location}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={log.action === 'in' ? 'default' : 'secondary'}>
                            {log.action}
                          </Badge>
                          <p className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
            <QRScanner />
          </div>
        </>
      )}
      {currentView === 'users' && <UserManagement />}
      {currentView === 'students' && <StudentManagement />}
      {currentView === 'schedules' && <ScheduleUpload />}
      {currentView === 'unscanned' && <UnscannedStudents />}
      {currentView === 'help' && <TrainingHelp />}
      {currentView === 'settings' && <AdminSettings />}
    </div>
  );

  const renderTeacherDashboard = () => (
    <div className="space-y-6">
      <div className="flex gap-2 mb-4">
        <Button 
          variant={currentView === 'dashboard' ? 'default' : 'outline'}
          onClick={() => setCurrentView('dashboard')}
        >
          Dashboard
        </Button>
        <Button 
          variant={currentView === 'students' ? 'default' : 'outline'}
          onClick={() => setCurrentView('students')}
        >
          <List className="h-4 w-4 mr-2" />
          Student List
        </Button>
        <Button 
          variant={currentView === 'help' ? 'default' : 'outline'}
          onClick={() => setCurrentView('help')}
        >
          <Book className="h-4 w-4 mr-2" />
          Help
        </Button>
      </div>

      {currentView === 'dashboard' && (
        <>
          <h2 className="text-2xl font-bold">My Students</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.slice(0, 4).map(student => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        </>
      )}

      {currentView === 'students' && <TeacherStudentList />}
      {currentView === 'help' && <TrainingHelp />}
    </div>
  );

  const renderDriverDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Bus Scanner</h2>
      <QRScanner />
      <div>
        <h3 className="text-lg font-semibold mb-4">Today's Bus Activity</h3>
        <Card>
          <CardContent className="p-4">
            {todayScans.filter(log => log.location.includes('Bus')).map(log => {
              const student = students.find(s => s.id === log.studentId);
              return (
                <div key={log.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{student?.name}</p>
                    <p className="text-sm text-gray-600">{log.location}</p>
                  </div>
                  <Badge variant={log.action === 'in' ? 'default' : 'secondary'}>
                    {log.action}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderMonitorDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Campus Monitor</h2>
      <QRScanner />
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
        <p className="text-gray-600">Role: {user?.role?.toUpperCase()}</p>
      </div>
      
      {user?.role === 'admin' && renderAdminDashboard()}
      {user?.role === 'teacher' && renderTeacherDashboard()}
      {user?.role === 'driver' && renderDriverDashboard()}
      {user?.role === 'monitor' && renderMonitorDashboard()}
      {user?.role === 'nurse' && renderTeacherDashboard()}
    </div>
  );
};

export default Dashboard;