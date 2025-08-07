import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Settings, Users, Bell, Upload, UserPlus } from 'lucide-react';
import UserManagement from './settings/UserManagement';
import AlertSettings from './settings/AlertSettings';
import DataUpload from './settings/DataUpload';
import ProfileFields from './settings/ProfileFields';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

interface SystemSettings {
  alert_thresholds: {
    unscanned_minutes: number;
    late_arrival_minutes: number;
    missed_scan_hours: number;
  };
  student_profile_fields: string[];
  notification_settings: {
    email_enabled: boolean;
    sms_enabled: boolean;
    push_enabled: boolean;
  };
}

const AdminSettings: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchSettings();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({ title: 'Error', description: 'Failed to fetch users', variant: 'destructive' });
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');
      
      if (error) throw error;
      
      const settingsObj: any = {};
      data?.forEach(setting => {
        settingsObj[setting.setting_key] = setting.setting_value;
      });
      
      setSettings(settingsObj);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Settings className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Admin Settings</h1>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>User Management</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Alert Settings</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Data Upload</span>
          </TabsTrigger>
          <TabsTrigger value="profiles" className="flex items-center space-x-2">
            <UserPlus className="h-4 w-4" />
            <span>Profile Fields</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <UserManagement users={users} onUserUpdate={fetchUsers} />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {settings && (
            <AlertSettings
              alertThresholds={settings.alert_thresholds}
              notificationSettings={settings.notification_settings}
              onSettingsUpdate={fetchSettings}
            />
          )}
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <DataUpload />
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4">
          {settings && (
            <ProfileFields
              fields={settings.student_profile_fields}
              onFieldsUpdate={fetchSettings}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
