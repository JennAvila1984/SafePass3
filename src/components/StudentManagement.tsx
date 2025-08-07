import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Plus } from 'lucide-react';

const StudentManagement: React.FC = () => {
  const { addStudent } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    emergencyContact: '',
    allergies: '',
    transportationStatus: 'walker' as 'bus' | 'pickup' | 'walker',
    teacherName: '',
    classroomNumber: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allergiesArray = formData.allergies.split(',').map(a => a.trim()).filter(a => a);
    
    addStudent({
      id: 'STU' + Date.now(),
      name: formData.name,
      grade: formData.grade,
      emergencyContact: formData.emergencyContact,
      allergies: allergiesArray,
      transportationStatus: formData.transportationStatus,
      teacherName: formData.teacherName || undefined,
      classroomNumber: formData.classroomNumber || undefined
    });

    setFormData({
      name: '',
      grade: '',
      emergencyContact: '',
      allergies: '',
      transportationStatus: 'walker',
      teacherName: '',
      classroomNumber: ''
    });
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          if (values.length >= 4) {
            addStudent({
              id: 'STU' + Date.now() + i,
              name: values[0]?.trim() || '',
              grade: values[1]?.trim() || '',
              emergencyContact: values[2]?.trim() || '',
              allergies: values[3]?.trim().split(';').filter(a => a),
              transportationStatus: (values[4]?.trim() as any) || 'walker'
            });
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Student Management</h1>
      
      <Tabs defaultValue="add" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add">Add Student</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
        </TabsList>
        
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Student
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Student Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="grade">Grade</Label>
                    <Input
                      id="grade"
                      value={formData.grade}
                      onChange={(e) => setFormData({...formData, grade: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="contact">Emergency Contact</Label>
                  <Input
                    id="contact"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="allergies">Allergies (comma separated)</Label>
                  <Input
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                    placeholder="Peanuts, Dairy, etc."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Transportation</Label>
                    <Select value={formData.transportationStatus} onValueChange={(value: any) => setFormData({...formData, transportationStatus: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bus">Bus</SelectItem>
                        <SelectItem value="pickup">Pickup</SelectItem>
                        <SelectItem value="walker">Walker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="teacher">Teacher Name</Label>
                    <Input
                      id="teacher"
                      value={formData.teacherName}
                      onChange={(e) => setFormData({...formData, teacherName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="classroom">Classroom</Label>
                    <Input
                      id="classroom"
                      value={formData.classroomNumber}
                      onChange={(e) => setFormData({...formData, classroomNumber: e.target.value})}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full">Add Student</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Bulk Import Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Upload a CSV file with columns: Name, Grade, Emergency Contact, Allergies (semicolon separated), Transportation Status
                </p>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentManagement;