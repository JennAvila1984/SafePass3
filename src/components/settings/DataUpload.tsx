import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';

const DataUpload: React.FC = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<string>('students');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      setResult(null);
    } else {
      toast({
        title: 'Invalid File',
        description: 'Please select a CSV file',
        variant: 'destructive',
      });
    }
  };

  const processCSV = async () => {
    if (!csvFile) return;

    setUploading(true);
    setProgress(0);

    try {
      // Read file content
      const csvContent = await csvFile.text();
      setProgress(25);

      // Send to edge function for processing
      const { data, error } = await supabase.functions.invoke('csv-processor', {
        body: {
          csvData: csvContent,
          type: uploadType
        }
      });

      setProgress(75);

      if (error) throw error;

      setResult(data);
      setProgress(100);

      toast({
        title: 'Upload Complete',
        description: `Processed ${data.processed} records successfully`,
      });

    } catch (error) {
      console.error('Error processing CSV:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to process CSV file',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    let csvContent = '';
    
    if (uploadType === 'students') {
      csvContent = 'name,student_id,grade,allergies,parent_contact,emergency_contact,medical_notes,bus_route\n';
      csvContent += 'John Doe,12345,5,None,555-1234,555-5678,None,Route A\n';
      csvContent += 'Jane Smith,12346,3,Peanuts,555-2345,555-6789,Inhaler needed,Route B';
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${uploadType}_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>CSV Data Upload</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Upload Type</Label>
              <Select value={uploadType} onValueChange={setUploadType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="students">Student List</SelectItem>
                  <SelectItem value="schedules">Class Schedules</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>CSV File</Label>
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download Template</span>
            </Button>
          </div>

          {uploadType === 'students' && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                CSV should include: name, student_id, grade, allergies, parent_contact, emergency_contact, medical_notes, bus_route
              </AlertDescription>
            </Alert>
          )}

          {csvFile && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{csvFile.name}</span>
                <span className="text-sm text-gray-600">
                  ({(csvFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              
              {uploading && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-gray-600">Processing CSV...</p>
                </div>
              )}

              <Button
                onClick={processCSV}
                disabled={uploading || !csvFile}
                className="mt-2"
              >
                {uploading ? 'Processing...' : 'Upload CSV Data'}
              </Button>
            </div>
          )}

          {result && (
            <Alert className={result.errors.length > 0 ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}>
              {result.errors.length > 0 ? (
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">
                    Upload completed: {result.processed} records processed successfully
                  </p>
                  {result.errors.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-yellow-800 mb-1">
                        {result.errors.length} errors encountered:
                      </p>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {result.errors.slice(0, 5).map((error: string, index: number) => (
                          <li key={index}>• {error}</li>
                        ))}
                        {result.errors.length > 5 && (
                          <li>• ... and {result.errors.length - 5} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataUpload;