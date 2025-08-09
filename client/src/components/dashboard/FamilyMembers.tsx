import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { familyAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loading } from '@/components/ui/loading';
import FamilyMemberDetail from '../FamilyMemberDetail';

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
  createdAt?: any;
}

const FamilyMembers: React.FC = () => {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    relationship: '',
    age: '',
    gender: '',
    contactNumber: '',
    bloodType: '',
    emergencyContact: false,
    allergies: [] as string[],
    medicalConditions: [] as string[]
  });

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      try {
        setLoading(true);
        const data = await familyAPI.getFamilyMembers();
        setMembers(data || []);
      } catch (error) {
        console.error('Error fetching family members:', error);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      fetchFamilyMembers();
    }
  }, [userData]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData || !newMember.name || !newMember.relationship || !newMember.age) return;

    try {
      const memberData = {
        ...newMember,
        age: parseInt(newMember.age),
        userId: userData.id,
        lastCheckup: new Date().toISOString(),
        nextCheckup: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 6 months from now
        medications: [],
        allergies: newMember.allergies || [],
        medicalConditions: newMember.medicalConditions || []
      };

      await familyAPI.createFamilyMember(memberData);
      
      // Refresh the members list
      const updatedMembers = await familyAPI.getFamilyMembers();
      setMembers(updatedMembers || []);
      
      setNewMember({
        name: '',
        relationship: '',
        age: '',
        gender: '',
        contactNumber: '',
        bloodType: '',
        emergencyContact: false,
        allergies: [],
        medicalConditions: []
      });
      setShowAddModal(false);

      toast({
        title: 'Success',
        description: 'Family member added successfully',
      });
    } catch (error) {
      console.error('Add member error:', error);
      toast({
        title: 'Error',
        description: 'Failed to add family member',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from your family members?`)) return;

    try {
      await familyAPI.deleteFamilyMember(memberId);
      const updatedMembers = await familyAPI.getFamilyMembers();
      setMembers(updatedMembers || []);
      
      toast({
        title: 'Success',
        description: 'Family member removed successfully',
      });
    } catch (error) {
      console.error('Remove member error:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove family member',
        variant: 'destructive',
      });
    }
  };

  const getAvatarColor = (relationship: string | undefined) => {
    if (!relationship) return 'bg-gray-100 text-gray-600';
    
    switch (relationship.toLowerCase()) {
      case 'spouse':
      case 'wife':
      case 'husband':
        return 'bg-purple-100 text-purple-600';
      case 'daughter':
        return 'bg-pink-100 text-pink-600';
      case 'son':
        return 'bg-green-100 text-green-600';
      case 'mother':
        return 'bg-red-100 text-red-600';
      case 'father':
        return 'bg-indigo-100 text-indigo-600';
      case 'sister':
        return 'bg-yellow-100 text-yellow-600';
      case 'brother':
        return 'bg-teal-100 text-teal-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getAvatarIcon = (relationship: string | undefined) => {
    if (!relationship) return 'person';
    
    switch (relationship.toLowerCase()) {
      case 'daughter':
      case 'son':
        return 'child_care';
      case 'father':
      case 'mother':
        return 'elderly';
      case 'spouse':
      case 'wife':
      case 'husband':
        return 'favorite';
      default:
        return 'person';
    }
  };

  const relationships = [
    'Spouse', 'Wife', 'Husband', 'Mother', 'Father', 
    'Son', 'Daughter', 'Brother', 'Sister', 
    'Grandfather', 'Grandmother', 'Uncle', 'Aunt', 'Other'
  ];

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];



  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Family Members</CardTitle>
        </CardHeader>
        <CardContent>
          <Loading text="Loading family members..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Family Members ({members.length})
          </CardTitle>
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" style={{ color: 'hsl(207, 90%, 54%)' }}>
                <span className="material-icons">person_add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Family Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newMember.name}
                    onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="relationship">Relationship</Label>
                  <Select 
                    value={newMember.relationship} 
                    onValueChange={(value) => setNewMember(prev => ({ ...prev, relationship: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationships.map((relation) => (
                        <SelectItem key={relation} value={relation}>
                          {relation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      min="1"
                      max="120"
                      value={newMember.age}
                      onChange={(e) => setNewMember(prev => ({ ...prev, age: e.target.value }))}
                      placeholder="Enter age"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select 
                      value={newMember.gender} 
                      onValueChange={(value) => setNewMember(prev => ({ ...prev, gender: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    value={newMember.contactNumber}
                    onChange={(e) => setNewMember(prev => ({ ...prev, contactNumber: e.target.value }))}
                    placeholder="Enter contact number"
                  />
                </div>

                <div>
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Select 
                    value={newMember.bloodType} 
                    onValueChange={(value) => setNewMember(prev => ({ ...prev, bloodType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="emergencyContact"
                    checked={newMember.emergencyContact}
                    onChange={(e) => setNewMember(prev => ({ ...prev, emergencyContact: e.target.checked }))}
                  />
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    type="submit" 
                    className="flex-1 text-white hover:bg-blue-700"
                    style={{ backgroundColor: 'hsl(207, 90%, 54%)' }}
                  >
                    Add Member
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {members.length === 0 ? (
            <div className="text-center py-4">
              <span className="material-icons text-gray-400 text-3xl mb-2">family_restroom</span>
              <p className="text-gray-500">No family members added yet</p>
              <p className="text-sm text-gray-400">Add family members to manage their health</p>
            </div>
          ) : (
            members.map((member) => (
              <div 
                key={member.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group cursor-pointer"
                onClick={() => setSelectedMember(member.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAvatarColor(member.relationship)}`}>
                    <span className="material-icons">{getAvatarIcon(member.relationship)}</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">{member.name}</p>
                      {member.emergencyContact && (
                        <Badge variant="destructive" className="text-xs">Emergency</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {member.relationship} • Age {member.age}
                    </p>
                    <p className="text-xs text-gray-500">{member.contactNumber}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    title="View Health Profile"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMember(member.id);
                    }}
                  >
                    <span className="material-icons text-sm">visibility</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveMember(member.id, member.name);
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Remove Member"
                  >
                    <span className="material-icons text-sm">delete</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {userData?.plan === 'family' && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Family Plan Active</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    backgroundColor: 'hsl(153, 72%, 51%)',
                    width: `${Math.min((members.length / 10) * 100, 100)}%`
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{members.length} / 10 members</p>
            </div>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button variant="link" className="w-full text-center p-0 h-auto hover:text-blue-700" style={{ color: 'hsl(207, 90%, 54%)' }}>
            Manage Family Health →
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* Family Member Detail Popup */}
    {selectedMember && (
      <FamilyMemberDetail
        memberId={selectedMember}
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    )}
  </>
  );
};

export default FamilyMembers;
