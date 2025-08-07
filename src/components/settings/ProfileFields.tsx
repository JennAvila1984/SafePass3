import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { UserPlus, X, Plus, Settings } from 'lucide-react';

interface ProfileFieldsProps {
  fields: string[];
  onFieldsUpdate: () => void;
}

const ProfileFields: React.FC<ProfileFieldsProps> = ({ fields, onFieldsUpdate }) => {
  const [newField, setNewField] = useState('');
  const [fieldSettings, setFieldSettings] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const defaultFields = ['name', 'student_id', 'grade'];
  const customizableFields = fields.filter(field => !defaultFields.includes(field));

  const addField = async () => {
    if (!newField.trim()) return;

    const fieldName = newField.trim().toLowerCase().replace(/\s+/g, '_');
    
    if (fields.includes(fieldName)) {
      toast({
        title: 'Field Exists',
        description: 'This field already exists',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const updatedFields = [...fields, fieldName];
      
      const { error } = await supabase
        .from('system_settings')
        .update({ 
          setting_value: updatedFields,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'student_profile_fields');

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Field added successfully',
      });
      
      setNewField('');
      onFieldsUpdate();
    } catch (error) {
      console.error('Error adding field:', error);
      toast({
        title: 'Error',
        description: 'Failed to add field',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const removeField = async (fieldToRemove: string) => {
    if (defaultFields.includes(fieldToRemove)) {
      toast({
        title: 'Cannot Remove',
        description: 'This is a required field and cannot be removed',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const updatedFields = fields.filter(field => field !== fieldToRemove);
      
      const { error } = await supabase
        .from('system_settings')
        .update({ 
          setting_value: updatedFields,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'student_profile_fields');

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Field removed successfully',
      });
      
      onFieldsUpdate();
    } catch (error) {
      console.error('Error removing field:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove field',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const formatFieldName = (field: string) => {
    return field.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Student Profile Fields</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Required Fields (Cannot be removed)
            </Label>
            <div className="flex flex-wrap gap-2 mb-4">
              {defaultFields.map(field => (
                <Badge key={field} variant="secondary" className="bg-blue-100 text-blue-800">
                  <Settings className="h-3 w-3 mr-1" />
                  {formatFieldName(field)}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Custom Fields
            </Label>
            <div className="flex flex-wrap gap-2 mb-4">
              {customizableFields.map(field => (
                <Badge 
                  key={field} 
                  variant="outline" 
                  className="flex items-center space-x-1 pr-1"
                >
                  <span>{formatFieldName(field)}</span>
                  <button
                    onClick={() => removeField(field)}
                    disabled={saving}
                    className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3 text-red-500" />
                  </button>
                </Badge>
              ))}
              
              {customizableFields.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  No custom fields added yet
                </p>
              )}
            </div>
          </div>

          <div className="flex space-x-2">
            <Input
              placeholder="Enter field name (e.g., medical conditions)"
              value={newField}
              onChange={(e) => setNewField(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addField()}
              className="flex-1"
            />
            <Button 
              onClick={addField} 
              disabled={!newField.trim() || saving}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Field</span>
            </Button>
          </div>

          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Field Naming Guidelines:</p>
            <ul className="space-y-1">
              <li>• Use descriptive names (e.g., "emergency_contact" not "ec")</li>
              <li>• Spaces will be converted to underscores automatically</li>
              <li>• Fields will appear in student registration and profile forms</li>
              <li>• Consider data privacy when adding sensitive fields</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Field Visibility Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Control which fields are visible to different user roles
          </p>
          
          {fields.map(field => (
            <div key={field} className="flex items-center justify-between py-2">
              <div>
                <Label className="font-medium">{formatFieldName(field)}</Label>
                <p className="text-xs text-gray-600">
                  {defaultFields.includes(field) ? 'Required field' : 'Custom field'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Label className="text-xs">Teachers</Label>
                  <Switch 
                    defaultChecked={true}
                    disabled={defaultFields.includes(field)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label className="text-xs">Drivers</Label>
                  <Switch 
                    defaultChecked={field === 'allergies' || field === 'medical_notes'}
                    disabled={defaultFields.includes(field)}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileFields;