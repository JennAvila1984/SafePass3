import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Bell, Clock, AlertTriangle, Phone, Mail } from 'lucide-react';

interface AlertThresholds {
  unscanned_minutes: number;
  late_arrival_minutes: number;
  missed_scan_hours: number;
}

interface NotificationSettings {
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
}

interface AlertSettingsProps {
  alertThresholds: AlertThresholds;
  notificationSettings: NotificationSettings;
  onSettingsUpdate: () => void;
}

const AlertSettings: React.FC<AlertSettingsProps> = ({ 
  alertThresholds, 
  notificationSettings, 
  onSettingsUpdate 
}) => {
  const [thresholds, setThresholds] = useState(alertThresholds);
  const [notifications, setNotifications] = useState(notificationSettings);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const saveAlertSettings = async () => {
    setSaving(true);
    try {
      // Update alert thresholds
      const { error: thresholdError } = await supabase
        .from('system_settings')
        .update({ 
          setting_value: thresholds,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'alert_thresholds');

      if (thresholdError) throw thresholdError;

      // Update notification settings
      const { error: notificationError } = await supabase
        .from('system_settings')
        .update({ 
          setting_value: notifications,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'notification_settings');

      if (notificationError) throw notificationError;

      toast({
        title: 'Success',
        description: 'Alert settings saved successfully',
      });
      onSettingsUpdate();
    } catch (error) {
      console.error('Error saving alert settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save alert settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Alert Thresholds</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="unscanned">Unscanned Alert (minutes)</Label>
              <Input
                id="unscanned"
                type="number"
                min="1"
                max="120"
                value={thresholds.unscanned_minutes}
                onChange={(e) => setThresholds({
                  ...thresholds,
                  unscanned_minutes: parseInt(e.target.value) || 30
                })}
                className="mt-1"
              />
              <p className="text-xs text-gray-600 mt-1">
                Alert when student hasn't been scanned for this duration
              </p>
            </div>

            <div>
              <Label htmlFor="late">Late Arrival Alert (minutes)</Label>
              <Input
                id="late"
                type="number"
                min="1"
                max="60"
                value={thresholds.late_arrival_minutes}
                onChange={(e) => setThresholds({
                  ...thresholds,
                  late_arrival_minutes: parseInt(e.target.value) || 15
                })}
                className="mt-1"
              />
              <p className="text-xs text-gray-600 mt-1">
                Alert when student arrives after expected time
              </p>
            </div>

            <div>
              <Label htmlFor="missed">Missed Scan Alert (hours)</Label>
              <Input
                id="missed"
                type="number"
                min="1"
                max="24"
                value={thresholds.missed_scan_hours}
                onChange={(e) => setThresholds({
                  ...thresholds,
                  missed_scan_hours: parseInt(e.target.value) || 2
                })}
                className="mt-1"
              />
              <p className="text-xs text-gray-600 mt-1">
                Alert when no scan activity detected for this duration
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Methods</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-600">Send alerts via email</p>
                </div>
              </div>
              <Switch
                checked={notifications.email_enabled}
                onCheckedChange={(checked) => setNotifications({
                  ...notifications,
                  email_enabled: checked
                })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-green-600" />
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-gray-600">Send alerts via text message</p>
                </div>
              </div>
              <Switch
                checked={notifications.sms_enabled}
                onCheckedChange={(checked) => setNotifications({
                  ...notifications,
                  sms_enabled: checked
                })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-600">Send browser push notifications</p>
                </div>
              </div>
              <Switch
                checked={notifications.push_enabled}
                onCheckedChange={(checked) => setNotifications({
                  ...notifications,
                  push_enabled: checked
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveAlertSettings} disabled={saving}>
          {saving ? 'Saving...' : 'Save Alert Settings'}
        </Button>
      </div>
    </div>
  );
};

export default AlertSettings;