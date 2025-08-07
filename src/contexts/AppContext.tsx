import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface Student {
  id: string;
  name: string;
  grade: string;
  student_id: string;
  allergies: string[];
  medical_notes: string;
  emergency_contact: string;
  emergency_phone: string;
  transportation_status: string;
  bus_route: string;
  teacher_name: string;
  classroom_number: string;
}

interface ScanLog {
  id: string;
  student_id: string;
  scanned_by: string;
  timestamp: string;
  action: 'in' | 'out';
  location: string;
  notes?: string;
}

interface AppContextType {
  students: Student[];
  scanLogs: ScanLog[];
  addScanLog: (log: Omit<ScanLog, 'id' | 'timestamp'>) => Promise<void>;
  refreshData: () => Promise<void>;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchScanLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('scan_events')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      setScanLogs(data || []);
    } catch (error) {
      console.error('Error fetching scan logs:', error);
    }
  };

  const addScanLog = async (log: Omit<ScanLog, 'id' | 'timestamp'>) => {
    try {
      const { data, error } = await supabase
        .from('scan_events')
        .insert([{ ...log, scanned_by: user?.id }])
        .select()
        .single();
      
      if (error) throw error;
      setScanLogs(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding scan log:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchStudents(), fetchScanLogs()]);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]);

  return (
    <AppContext.Provider value={{
      students,
      scanLogs,
      addScanLog,
      refreshData,
      loading
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
