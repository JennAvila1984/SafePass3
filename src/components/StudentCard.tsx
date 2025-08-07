import React from 'react';
import { Student } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, AlertTriangle, Bus, MapPin, Calendar } from 'lucide-react';

interface StudentCardProps {
  student: Student;
}

const StudentCard: React.FC<StudentCardProps> = ({ student }) => {
  const isElementary = ['K', '1st', '2nd', '3rd', '4th', '5th'].includes(student.grade);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{student.name}</span>
          </div>
          <Badge variant="secondary">{student.grade} Grade</Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">ID: {student.id}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2">
          <Bus className="h-4 w-4 text-blue-500" />
          <span className="text-sm">
            Transportation: {student.transportationStatus}
          </span>
        </div>

        {student.allergies.length > 0 && (
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">Allergies:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {student.allergies.map((allergy, index) => (
                  <Badge key={index} variant="destructive" className="text-xs">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {isElementary && student.teacherName && (
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-green-500" />
            <span className="text-sm">
              {student.teacherName} - Room {student.classroomNumber}
            </span>
          </div>
        )}

        {!isElementary && student.schedule && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Schedule:</span>
            </div>
            <div className="grid gap-1 ml-6">
              {student.schedule.map((period, index) => (
                <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                  <span className="font-medium">{period.period}:</span> {period.subject} - Room {period.room}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500">
            Emergency Contact: {student.emergencyContact}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentCard;