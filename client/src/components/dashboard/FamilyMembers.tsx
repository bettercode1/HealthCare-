import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore } from '@/hooks/useFirestore';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loading } from '@/components/ui/loading';

interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  relation: string;
  age: number;
  createdAt?: any;
}

const FamilyMembers: React.FC = () => {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    relation: '',
    age: ''
  });
  
  const { data: members, add: addMember, remove: removeMember, loading: membersLoading } = useFirestore<FamilyMember>('family_members',
    userData ? [{ field: 'userId', operator: '==', value: userData.id }] : undefined
  );

  const getAvatarColor = (relation: string) => {
    switch (relation.toLowerCase()) {
      case 'wife': return 'bg-purple-100 text-purple-600';
      case 'husband': return 'bg-blue-100 text-blue-600';
      case 'daughter': return 'bg-pink-100 text-pink-600';
      case 'son': return 'bg-green-100 text-green-600';
      case 'mother': return 'bg-red-100 text-red-600';
      case 'father': return 'bg-indigo-100 text-indigo-600';
      case 'sister': return 'bg-yellow-100 text-yellow-600';
      case 'brother': return 'bg-teal-100 text-teal-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getAvatarIcon = (relation: string) => {
    switch (relation.toLowerCase()) {
      case 'daughter':
      case 'son':
        return 'child_care';
      case 'father':
      case 'mother':
        return 'elderly';
      default:
        return 'person';
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData || !newMember.name || !newMember.relation || !newMember.age) return;

    try {
      await addMember({
        userId: userData.id,
        name: newMember.name,
        relation: newMember.relation,
        age: parseInt(newMember.age),
      });

      setNewMember({
        name: '',
        relation: '',
        age: ''
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
      await removeMember(memberId);
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

  const relations = [
    'Spouse', 'Wife', 'Husband', 'Mother', 'Father', 
    'Son', 'Daughter', 'Brother', 'Sister', 
    'Grandfather', 'Grandmother', 'Uncle', 'Aunt', 'Other'
  ];

  return (
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
            <DialogContent>
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
                  <Label htmlFor="relation">Relation</Label>
                  <Select 
                    value={newMember.relation} 
                    onValueChange={(value) => setNewMember(prev => ({ ...prev, relation: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relation" />
                    </SelectTrigger>
                    <SelectContent>
                      {relations.map((relation) => (
                        <SelectItem key={relation} value={relation}>
                          {relation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
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
          {membersLoading ? (
            <Loading text="Loading family members..." />
          ) : members.length === 0 ? (
            <div className="text-center py-4">
              <span className="material-icons text-gray-400 text-3xl mb-2">family_restroom</span>
              <p className="text-gray-500">No family members added yet</p>
              <p className="text-sm text-gray-400">Add family members to manage their health</p>
            </div>
          ) : (
            members.map((member) => (
              <div 
                key={member.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAvatarColor(member.relation)}`}>
                    <span className="material-icons">{getAvatarIcon(member.relation)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-600">
                      {member.relation} • Age {member.age}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    title="View Health Profile"
                  >
                    <span className="material-icons text-sm">visibility</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleRemoveMember(member.id, member.name)}
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
  );
};

export default FamilyMembers;
