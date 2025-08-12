import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { familyAPI, medicationAPI, doseAPI, reportAPI, diseaseAnalysisAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loading } from '@/components/ui/loading';
import FamilyMembers from './dashboard/FamilyMembers';
import FamilyMemberDetail from './FamilyMemberDetail';
import InsuranceManagement from './InsuranceManagement';

interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  age: number;
  gender: string;
  contactNumber: string;
  emergencyContact: boolean;
  bloodType: string;
  allergies: string[];
  medicalConditions: string[];
  medications: string[];
  lastCheckup: string;
  nextCheckup: string;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface DashboardStats {
  totalMembers: number;
  activeMedications: number;
  pendingDoses: number;
  upcomingCheckups: number;
  recentReports: number;
  aiAnalysisCount: number;
}

const FamilyManagement: React.FC = () => {
  const { t } = useTranslation();
  const { userData } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMedications: 0,
    pendingDoses: 0,
    upcomingCheckups: 0,
    recentReports: 0,
    aiAnalysisCount: 0
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (userData) {
      loadFamilyData();
    }
  }, [userData]);

  const loadFamilyData = async () => {
    try {
      setLoading(true);
      
      // Load all family-related data
      const [membersData, medicationsData, dosesData, reportsData, analysisData] = await Promise.all([
        familyAPI.getFamilyMembers(),
        medicationAPI.getMedications(),
        doseAPI.getDoseRecords(),
        reportAPI.getReports(),
        diseaseAnalysisAPI.getDiseaseAnalysis()
      ]);

      setMembers(membersData || []);

      // Calculate dashboard stats
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const upcomingCheckups = membersData?.filter((member: FamilyMember) => 
        new Date(member.nextCheckup) <= thirtyDaysFromNow
      ).length || 0;

      const pendingDoses = dosesData?.filter((dose: any) => 
        dose.status === 'pending' && new Date(dose.scheduledTime) <= now
      ).length || 0;

      const recentReports = reportsData?.filter((report: any) => 
        new Date(report.uploadDate) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      ).length || 0;

      setStats({
        totalMembers: membersData?.length || 0,
        activeMedications: medicationsData?.filter((m: any) => m.status === 'active').length || 0,
        pendingDoses,
        upcomingCheckups,
        recentReports,
        aiAnalysisCount: analysisData?.length || 0
      });

    } catch (error) {
      console.error('Error loading family data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load family data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSelect = (memberId: string) => {
    setSelectedMember(memberId);
  };

  const handleBackToList = () => {
    setSelectedMember(null);
    loadFamilyData(); // Refresh data when returning to list
  };

  const getHealthStatusColor = (member: FamilyMember) => {
    const daysUntilCheckup = Math.ceil(
      (new Date(member.nextCheckup).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntilCheckup <= 7) return 'text-red-600';
    if (daysUntilCheckup <= 30) return 'text-orange-600';
    return 'text-green-600';
  };

  const getHealthStatusText = (member: FamilyMember) => {
    const daysUntilCheckup = Math.ceil(
      (new Date(member.nextCheckup).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntilCheckup <= 0) return 'Overdue';
    if (daysUntilCheckup <= 7) return 'Due Soon';
    if (daysUntilCheckup <= 30) return 'Upcoming';
    return 'Good';
  };

  if (loading) {
    return <Loading text="Loading family management..." />;
  }

  // If a member is selected, show the detail view
  if (selectedMember) {
    return (
      <FamilyMemberDetail 
        memberId={selectedMember} 
        isOpen={true}
        onClose={handleBackToList} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('familyHealthManagement')}</h1>
          <p className="text-gray-600 mt-2">{t('manageFamilyHealthRecords')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {stats.totalMembers} {t('familyMembers')}
          </Badge>
          <Badge variant="outline" className="text-sm">
            {stats.activeMedications} {t('activeMedications')}
          </Badge>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="material-icons text-blue-600 text-sm">family</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{t('totalMembers')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="material-icons text-green-600 text-sm">medication</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{t('activeMedications')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeMedications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="material-icons text-orange-600 text-sm">schedule</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{t('pendingDoses')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingDoses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="material-icons text-purple-600 text-sm">psychology</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{t('aiAnalysis')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.aiAnalysisCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="members">{t('familyMembers')}</TabsTrigger>
          <TabsTrigger value="health">{t('healthTracking')}</TabsTrigger>
          <TabsTrigger value="insurance">{t('insurance')}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>{t('recentActivity')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {stats.recentReports > 0 && (
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <span className="material-icons text-blue-600">description</span>
                      <div>
                        <p className="font-medium">{stats.recentReports} {t('newReportsUploaded')}</p>
                        <p className="text-sm text-gray-600">{t('inTheLast7Days')}</p>
                      </div>
                    </div>
                  )}
                  
                  {stats.pendingDoses > 0 && (
                    <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                      <span className="material-icons text-orange-600">medication</span>
                      <div>
                        <p className="font-medium">{stats.pendingDoses} {t('dosesPending')}</p>
                        <p className="text-sm text-gray-600">{t('requiresAttention')}</p>
                      </div>
                    </div>
                  )}
                  
                  {stats.upcomingCheckups > 0 && (
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <span className="material-icons text-green-600">event</span>
                      <div>
                        <p className="font-medium">{stats.upcomingCheckups} {t('checkupsDue')}</p>
                        <p className="text-sm text-gray-600">{t('within30Days')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('quickActions')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveTab('members')}
                >
                  <span className="material-icons mr-2">person_add</span>
                  {t('addFamilyMember')}
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveTab('health')}
                >
                  <span className="material-icons mr-2">upload</span>
                  {t('uploadHealthReport')}
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                >
                  <span className="material-icons mr-2">psychology</span>
                  {t('runAiAnalysis')}
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                >
                  <span className="material-icons mr-2">schedule</span>
                  {t('scheduleCheckup')}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Family Members Summary */}
          <Card>
            <CardHeader>
              <CardTitle>{t('familyMembersOverview')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                  <div 
                    key={member.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleMemberSelect(member.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="material-icons text-blue-600">person</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.relationship} • {t('age')} {member.age}</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={getHealthStatusColor(member)}
                      >
                        {getHealthStatusText(member)}
                      </Badge>
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t('nextCheckup')}:</span>
                        <span className="font-medium">
                          {new Date(member.nextCheckup).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t('bloodType')}:</span>
                        <span className="font-medium">{member.bloodType}</span>
                      </div>
                      
                      {member.emergencyContact && (
                        <Badge variant="destructive" className="text-xs">
                          {t('emergencyContact')}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Family Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <FamilyMembers />
        </TabsContent>

        {/* Health Tracking Tab */}
        <TabsContent value="health" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Medication Adherence */}
            <Card>
              <CardHeader>
                <CardTitle>{t('medicationAdherence')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{t('overallAdherence')}</span>
                    <span className="text-lg font-bold text-green-600">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">{t('takenToday')}</p>
                      <p className="font-medium">12/15 {t('doses')}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">{t('thisWeek')}</p>
                      <p className="font-medium">78/105 {t('doses')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Health Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>{t('healthMetrics')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{stats.recentReports}</p>
                    <p className="text-sm text-gray-600">{t('reports')}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{stats.aiAnalysisCount}</p>
                    <p className="text-sm text-gray-600">{t('aiAnalysis')}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t('averageBloodPressure')}</span>
                    <span className="font-medium">120/80</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t('averageHeartRate')}</span>
                    <span className="font-medium">72 bpm</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t('averageWeight')}</span>
                    <span className="font-medium">75.2 kg</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle>{t('recentHealthReports')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <span className="material-icons text-gray-400 text-4xl mb-4">description</span>
                <p className="text-gray-500">{t('noRecentReports')}</p>
                <p className="text-sm text-gray-400">{t('uploadHealthReportsToSeeThemHere')}</p>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                  <span className="material-icons mr-2">upload</span>
                  {t('uploadReport')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insurance Tab */}
        <TabsContent value="insurance" className="space-y-6">
          <div className="space-y-6">
            {/* Header with Quick Actions */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-blue-900">{t('familyInsuranceManagement')}</CardTitle>
                    <p className="text-blue-700">{t('manageInsurancePoliciesForAllFamilyMembers')}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <span className="material-icons mr-2">shield</span>
                      Add Policy
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
            
            {/* Insurance Management Component */}
            <InsuranceManagement />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FamilyManagement;
