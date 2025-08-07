import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AllergyAlertProps {
  studentName: string;
  allergies: string[];
  onClose: () => void;
  onNotifyNurse?: () => void;
}

const AllergyAlert: React.FC<AllergyAlertProps> = ({ 
  studentName, 
  allergies, 
  onClose, 
  onNotifyNurse 
}) => {
  useEffect(() => {
    // Auto-close after 10 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-bold text-red-800">🚨 ALLERGY ALERT</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-3">
          <p className="text-lg font-semibold text-red-800">
            Student: {studentName}
          </p>
          
          <div className="bg-red-100 p-3 rounded-md">
            <p className="font-medium text-red-800 mb-2">Known Allergies:</p>
            <ul className="list-disc list-inside space-y-1">
              {allergies.map((allergy, index) => (
                <li key={index} className="text-red-700 font-medium">
                  {allergy}
                </li>
              ))}
            </ul>
          </div>
          
          <p className="text-sm text-red-700 bg-red-100 p-2 rounded">
            ⚠️ Notify nurse immediately if exposure occurs
          </p>
        </div>
        
        <div className="flex space-x-2 mt-4">
          {onNotifyNurse && (
            <Button 
              onClick={onNotifyNurse}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Notify Nurse
            </Button>
          )}
          <Button 
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Acknowledge
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AllergyAlert;