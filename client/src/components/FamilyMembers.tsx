import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/hooks/useFirestore';
import { useAuth } from '@/contexts/AuthContext';

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
  
  const { data: members } = useFirestore<FamilyMember>('family_members',
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
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getAvatarIcon = (relation: string) => {
    switch (relation.toLowerCase()) {
      case 'daughter':
      case 'son':
        return 'child_care';
      default:
        return 'person';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Family Members</CardTitle>
          <Button variant="ghost" size="sm" style={{ color: 'hsl(207, 90%, 54%)' }}>
            <span className="material-icons">person_add</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No family members added yet</p>
          ) : (
            members.map((member) => (
              <div 
                key={member.id}
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              >
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
            ))
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button variant="link" className="w-full text-center p-0 h-auto hover:text-blue-700" style={{ color: 'hsl(207, 90%, 54%)' }}>
            Manage Family →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FamilyMembers;
