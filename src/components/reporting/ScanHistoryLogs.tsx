import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Download, RefreshCw, ArrowUpDown } from 'lucide-react';

interface ScanHistoryLogsProps {
  selectedDate: string;
}

const ScanHistoryLogs: React.FC<ScanHistoryLogsProps> = ({ selectedDate }) => {
  const { students, scanLogs, refreshData } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'timestamp' | 'studentName' | 'location'>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshData]);

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown Student';
  };

  const getStudentGrade = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.grade : '';
  };

  // Filter logs by selected date
  const selectedDateObj = new Date(selectedDate);
  const dayScans = scanLogs.filter(log => 
    log.timestamp.toDateString() === selectedDateObj.toDateString()
  );

  const filteredAndSortedLogs = dayScans
    .filter(log => {
      const studentName = getStudentName(log.studentId).toLowerCase();
      const location = log.location.toLowerCase();
      const scannedBy = log.scannedBy.toLowerCase();
      const search = searchTerm.toLowerCase();
      
      return studentName.includes(search) || 
             location.includes(search) || 
             scannedBy.includes(search);
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'studentName':
          aValue = getStudentName(a.studentId);
          bValue = getStudentName(b.studentId);
          break;
        case 'location':
          aValue = a.location;
          bValue = b.location;
          break;
        default:
          aValue = a.timestamp.getTime();
          bValue = b.timestamp.getTime();
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'Student Name', 'Grade', 'Action', 'Location', 'Scanned By'];
    const csvData = filteredAndSortedLogs.map(log => [
      log.timestamp.toLocaleString(),
      getStudentName(log.studentId),
      getStudentGrade(log.studentId),
      log.action.toUpperCase(),
      log.location,
      log.scannedBy
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-history-${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Scan History Logs</h2>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by student, location, or staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Scan Activity for {selectedDateObj.toLocaleDateString()} 
            <span className="text-sm font-normal text-gray-600 ml-2">
              ({filteredAndSortedLogs.length} records)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('timestamp')}
                  >
                    <div className="flex items-center gap-2">
                      Timestamp
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('studentName')}
                  >
                    <div className="flex items-center gap-2">
                      Student Name
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('location')}
                  >
                    <div className="flex items-center gap-2">
                      Location
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Scanned By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedLogs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {log.timestamp.toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {getStudentName(log.studentId)}
                      <div className="text-sm text-gray-600">{getStudentGrade(log.studentId)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.action === 'in' ? 'default' : 'secondary'}>
                        {log.action.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.location}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {log.scannedBy}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredAndSortedLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No scans found matching your search.' : 'No scan activity for this date.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScanHistoryLogs;