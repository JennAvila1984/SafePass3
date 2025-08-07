import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Phone } from 'lucide-react';

const TeacherStudentList: React.FC = () => {
  const { students } = useApp();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Students</h1>
        <p className="text-gray-600">Student roster with allergy information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map(student => (
          <Card key={student.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                {student.name}
                {student.allergies && student.allergies.length > 0 && (
                  <AlertTriangle className="h-4 w-4 text-red-500" title="Has allergies" />
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{student.grade} Grade</Badge>
                {student.teacherName && (
                  <Badge variant="secondary">{student.classroomNumber}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {student.allergies.length > 0 && (
                  <div className="flex items-start gap-2 p-2 bg-red-50 rounded-md">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-700">Allergies:</p>
                      <p className="text-sm text-red-600">{student.allergies.join(', ')}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{student.emergencyContact}</span>
                </div>
                
                <div className="text-sm">
                  <span className="font-medium">Transportation: </span>
                  <Badge variant={student.transportationStatus === 'bus' ? 'default' : 'secondary'}>
                    {student.transportationStatus}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeacherStudentList;