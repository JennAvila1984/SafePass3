import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ScheduleUpload: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleScheduleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        // Expected format: Student ID, Period, Subject, Room, Teacher
        let processedCount = 0;
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          if (values.length >= 4) {
            // Here you would typically update the student's schedule
            // For now, just count processed rows
            processedCount++;
          }
        }
        
        toast({
          title: "Schedule Upload Complete",
          description: `Processed ${processedCount} schedule entries successfully.`,
        });
      };
      
      reader.readAsText(file);
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to process the schedule file.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Schedule Management</h1>
        <p className="text-gray-600">Upload class schedules via CSV</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Class Schedules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="schedule-file">CSV File</Label>
                <Input
                  id="schedule-file"
                  type="file"
                  accept=".csv"
                  onChange={handleScheduleUpload}
                  disabled={uploading}
                />
              </div>
              
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-2">CSV Format Requirements:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Student ID, Period, Subject, Room, Teacher</li>
                  <li>First row should contain headers</li>
                  <li>Use comma separation</li>
                  <li>Example: STU001,1st,Math,205,Ms. Johnson</li>
                </ul>
              </div>
              
              {uploading && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Processing schedule data...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Sample CSV Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="text-sm">
{`Student ID,Period,Subject,Room,Teacher
STU001,1st,Mathematics,205,Ms. Johnson
STU001,2nd,Science,301,Mr. Smith
STU001,3rd,English,102,Mrs. Davis
STU002,1st,History,203,Mr. Wilson`}
              </pre>
            </div>
            <Button 
              variant="outline" 
              className="mt-4 w-full"
              onClick={() => {
                const csvContent = `Student ID,Period,Subject,Room,Teacher
STU001,1st,Mathematics,205,Ms. Johnson
STU001,2nd,Science,301,Mr. Smith
STU001,3rd,English,102,Mrs. Davis`;
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'schedule_template.csv';
                a.click();
                window.URL.revokeObjectURL(url);
              }}
            >
              Download Template
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScheduleUpload;