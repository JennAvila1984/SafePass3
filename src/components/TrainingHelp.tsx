import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Scan, 
  List, 
  User, 
  MessageCircle, 
  Play, 
  Book, 
  HelpCircle,
  Shield,
  Users,
  Bus,
  School,
  Heart
} from 'lucide-react';

const TrainingHelp: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('guides');

  const roleGuides = {
    teacher: [
      {
        title: 'How to Scan Students',
        icon: <Scan className="h-5 w-5" />,
        steps: [
          'Click "QR Scanner" from your dashboard',
          'Point camera at student\'s QR code',
          'Wait for green confirmation',
          'Check for allergy alerts (red banner)',
          'Notify nurse if allergy alert appears'
        ],
        tips: 'Ensure good lighting for best scanning results'
      },
      {
        title: 'View Your Student List',
        icon: <List className="h-5 w-5" />,
        steps: [
          'Go to Dashboard → Student List',
          'View all assigned students',
          'Look for 🚨 icons for allergy alerts',
          'Click student name for details',
          'Check attendance status'
        ],
        tips: 'Students with allergies show warning icons'
      }
    ],
    driver: [
      {
        title: 'Bus Scanning Process',
        icon: <Bus className="h-5 w-5" />,
        steps: [
          'Open SafePass app before route',
          'Scan students boarding the bus',
          'Watch for allergy alerts',
          'Scan students getting off',
          'Review daily scan summary'
        ],
        tips: 'Always scan both on and off the bus'
      }
    ],
    monitor: [
      {
        title: 'Campus Monitoring',
        icon: <School className="h-5 w-5" />,
        steps: [
          'Use QR Scanner for student check-ins',
          'Monitor for allergy alerts',
          'Report any issues immediately',
          'Track student movements',
          'Assist with attendance verification'
        ],
        tips: 'Keep scanner ready during peak times'
      }
    ],
    nurse: [
      {
        title: 'Managing Allergy Alerts',
        icon: <Heart className="h-5 w-5" />,
        steps: [
          'Monitor real-time allergy notifications',
          'Respond to emergency alerts quickly',
          'Update student medical information',
          'Coordinate with teachers on protocols',
          'Maintain allergy action plans'
        ],
        tips: 'Keep emergency contacts updated'
      }
    ],
    admin: [
      {
        title: 'System Administration',
        icon: <Shield className="h-5 w-5" />,
        steps: [
          'Manage users and permissions',
          'Monitor unscanned students',
          'Configure notification settings',
          'Review system reports',
          'Handle technical issues'
        ],
        tips: 'Regular system health checks recommended'
      }
    ]
  };

  const commonGuides = [
    {
      title: 'Update Your Profile',
      icon: <User className="h-5 w-5" />,
      steps: [
        'Click your name in top right corner',
        'Select "Profile Settings"',
        'Update contact information',
        'Change notification preferences',
        'Save changes'
      ],
      tips: 'Keep contact info current for alerts'
    },
    {
      title: 'Report Issues',
      icon: <MessageCircle className="h-5 w-5" />,
      steps: [
        'Click "Help" in navigation',
        'Select "Report Issue"',
        'Describe the problem clearly',
        'Include screenshots if helpful',
        'Submit for admin review'
      ],
      tips: 'Include device and browser information'
    }
  ];

  const getCurrentRoleGuides = () => {
    const role = user?.role || 'teacher';
    return roleGuides[role as keyof typeof roleGuides] || roleGuides.teacher;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Book className="h-8 w-8 text-blue-500" />
          Training & Help
        </h1>
        <p className="text-gray-600 mt-2">
          Learn how to use SafePass effectively in your role as {user?.role?.toUpperCase()}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="guides">User Guides</TabsTrigger>
          <TabsTrigger value="videos">Quick Tips</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="guides" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Badge variant="outline">{user?.role?.toUpperCase()}</Badge>
              Role-Specific Guides
            </h2>
            <div className="grid gap-4">
              {getCurrentRoleGuides().map((guide, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {guide.icon}
                      {guide.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal list-inside space-y-2 mb-4">
                      {guide.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="text-sm">{step}</li>
                      ))}
                    </ol>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>💡 Tip:</strong> {guide.tips}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Common Tasks</h2>
            <div className="grid gap-4">
              {commonGuides.map((guide, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {guide.icon}
                      {guide.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal list-inside space-y-2 mb-4">
                      {guide.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="text-sm">{step}</li>
                      ))}
                    </ol>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>💡 Tip:</strong> {guide.tips}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Quick Start Video
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <Play className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Video tutorial coming soon</p>
                  <p className="text-sm text-gray-500 mt-2">
                    3-minute overview of SafePass basics
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Reference Cards</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800">🔴 Red Alert = Allergy</h4>
                  <p className="text-sm text-blue-700">Always notify nurse immediately</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800">✅ Green = Successful Scan</h4>
                  <p className="text-sm text-green-700">Student attendance recorded</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800">⚠️ Yellow = Missing Scan</h4>
                  <p className="text-sm text-yellow-700">Student needs manual check-in</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">What if a QR code won't scan?</h4>
                <p className="text-sm text-gray-600">
                  Check lighting, clean camera lens, or manually mark attendance in admin dashboard.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">How do I handle allergy alerts?</h4>
                <p className="text-sm text-gray-600">
                  Immediately notify the school nurse and follow the student's allergy action plan.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">What if I miss scanning a student?</h4>
                <p className="text-sm text-gray-600">
                  Contact admin to manually mark attendance. Parents will be notified of missing scans.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">How do I update student information?</h4>
                <p className="text-sm text-gray-600">
                  Only admins can update student profiles. Submit changes through the help system.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need More Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Book className="h-4 w-4 mr-2" />
                  Download User Manual
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainingHelp;