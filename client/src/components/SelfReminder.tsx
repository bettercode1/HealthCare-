import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { selfRemindersAPI } from '@/lib/api';
import { sampleSelfReminders } from '@/lib/demoData';
import { X, Plus } from 'lucide-react';

interface SelfReminder {
  id: string;
  userId: string;
  title: string;
  description: string;
  medicationName: string;
  dosage: string;
  doseStrength?: string;
  doseForm?: string;
  administrationMethod?: string;
  type: 'medication' | 'appointment' | 'checkup' | 'vaccination' | 'custom';
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';
  times: string[];
  days?: string[];
  isActive: boolean;
  nextReminder: string;
  lastReminder?: string;
  instructions?: string;
  specialInstructions?: string;
  sideEffects?: string[];
  category?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

const SelfReminder: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { userData } = useAuth();
  const [selfReminders, setSelfReminders] = useState<SelfReminder[]>([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<SelfReminder | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState(new Date());
  
  const [newReminder, setNewReminder] = useState<Partial<SelfReminder>>({
    title: '',
    description: '',
    medicationName: '',
    dosage: '',
    doseStrength: '',
    doseForm: '',
    administrationMethod: '',
    type: 'medication',
    frequency: 'daily',
    times: ['08:00'],
    days: [],
    isActive: true,
    nextReminder: new Date().toISOString(),
    category: 'general',
    color: 'blue',
    instructions: '',
    specialInstructions: '',
    sideEffects: []
  });

  useEffect(() => {
    if (userData) {
      loadSelfReminders();
    } else {
      // Load demo data if no user data (for demo purposes)
      loadSelfReminders();
    }
  }, [userData]);

  const loadSelfReminders = async () => {
    try {
      const reminders = await selfRemindersAPI.getSelfReminders(userData?.id || 'demo-patient-1');
      if (reminders && reminders.length > 0) {
        setSelfReminders(reminders);
      } else {
        // Use demo data if no reminders found
        const demoReminders = sampleSelfReminders.map(reminder => ({
          ...reminder,
          userId: userData?.id || 'demo-patient-1'
        }));
        setSelfReminders(demoReminders);
      }
    } catch (error) {
      console.error('Error loading self reminders:', error);
      // Use demo data as fallback
      const demoReminders = sampleSelfReminders.map(reminder => ({
        ...reminder,
        userId: userData?.id || 'demo-patient-1'
      }));
      setSelfReminders(demoReminders);
      toast({
        title: t('demoMode'),
        description: t('usingDemoDataForSelfReminders'),
      });
    }
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newReminder.title || !newReminder.medicationName || !newReminder.dosage) {
      toast({
        title: t('error'),
        description: t('pleaseFillInAllRequiredFields'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const reminderData = {
        ...newReminder,
        userId: userData?.id || 'demo-patient-1',
        id: `reminder-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const addedReminder = await selfRemindersAPI.addSelfReminder(reminderData);
      
      if (addedReminder) {
        setSelfReminders(prev => [...prev, addedReminder]);
        setShowAddModal(false);
        resetForm();
        
        toast({
          title: t('success'),
          description: t('selfReminderAdded'),
        });
      }
    } catch (error) {
      console.error('Error adding reminder:', error);
      toast({
        title: t('error'),
        description: t('failedToAddSelfReminder'),
        variant: 'destructive',
      });
    }
  };

  const handleEditReminder = (reminder: SelfReminder) => {
    setEditingReminder(reminder);
    setNewReminder(reminder);
    setShowAddModal(true);
  };

  const handleUpdateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingReminder || !newReminder.title || !newReminder.medicationName || !newReminder.dosage) {
      toast({
        title: t('error'),
        description: t('pleaseFillInAllRequiredFields'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const updatedReminder = await selfRemindersAPI.updateSelfReminder(editingReminder.id, {
        ...newReminder,
        updatedAt: new Date().toISOString(),
      });
      
      if (updatedReminder) {
        setSelfReminders(prev => prev.map(r => r.id === editingReminder.id ? updatedReminder : r));
        setShowAddModal(false);
        setEditingReminder(null);
        resetForm();
        
        toast({
          title: t('success'),
          description: t('selfReminderUpdated'),
        });
      }
    } catch (error) {
      console.error('Error updating reminder:', error);
      toast({
        title: t('error'),
        description: t('failedToUpdateSelfReminder'),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    try {
      const deleted = await selfRemindersAPI.deleteSelfReminder(reminderId);
      
      if (deleted) {
        setSelfReminders(prev => prev.filter(r => r.id !== reminderId));
        
        toast({
          title: t('success'),
          description: t('selfReminderDeleted'),
        });
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast({
        title: t('error'),
        description: t('failedToDeleteSelfReminder'),
        variant: 'destructive',
      });
    }
  };

  const toggleReminderStatus = async (reminderId: string) => {
    try {
      const reminder = selfReminders.find(r => r.id === reminderId);
      if (!reminder) return;

      const updatedReminder = await selfRemindersAPI.updateSelfReminder(reminderId, {
        isActive: !reminder.isActive,
        updatedAt: new Date().toISOString(),
      });
      
      if (updatedReminder) {
        setSelfReminders(prev => prev.map(r => r.id === reminderId ? updatedReminder : r));
        
        toast({
          title: t('success'),
          description: t('reminderStatusUpdated'),
        });
      }
    } catch (error) {
      console.error('Error updating reminder status:', error);
      toast({
        title: t('error'),
        description: t('failedToUpdateReminderStatus'),
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setNewReminder({
      title: '',
      description: '',
      medicationName: '',
      dosage: '',
      doseStrength: '',
      doseForm: '',
      administrationMethod: '',
      type: 'medication',
      frequency: 'daily',
      times: ['08:00'],
      days: [],
      isActive: true,
      nextReminder: new Date().toISOString(),
      category: 'general',
      color: 'blue',
      instructions: '',
      specialInstructions: '',
      sideEffects: []
    });
  };

  const addTimeSlot = () => {
    setNewReminder(prev => ({
      ...prev,
      times: [...(prev.times || []), '12:00']
    }));
  };

  const removeTimeSlot = (index: number) => {
    setNewReminder(prev => ({
      ...prev,
      times: prev.times?.filter((_, i) => i !== index) || []
    }));
  };

  const updateTimeSlot = (index: number, time: string) => {
    setNewReminder(prev => ({
      ...prev,
      times: prev.times?.map((t, i) => i === index ? time : t) || []
    }));
  };

  const getReminderIcon = (type: SelfReminder['type']) => {
    const icons = {
      medication: 'medication',
      appointment: 'event',
      checkup: 'health_and_safety',
      vaccination: 'vaccines',
      custom: 'alarm'
    };
    return icons[type] || 'alarm';
  };

  const getReminderColor = (type: SelfReminder['type'], color?: string) => {
    if (color) {
      return `bg-${color}-500`;
    }
    const colors = {
      medication: 'bg-blue-500',
      appointment: 'bg-green-500',
      checkup: 'bg-purple-500',
      vaccination: 'bg-orange-500',
      custom: 'bg-gray-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const getFrequencyText = (frequency: SelfReminder['frequency']) => {
    const texts = {
      once: 'Once',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      custom: 'Custom'
    };
    return texts[frequency] || 'Custom';
  };

  const getDaysText = (days: string[]) => {
    if (!days || days.length === 0) return 'Every day';
    return days.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ');
  };

  const getDoseFormLabel = (form?: string) => {
    if (!form) return 'Not specified';
    const labels = {
      tablet: 'Tablet',
      capsule: 'Capsule',
      liquid: 'Liquid',
      injection: 'Injection',
      cream: 'Cream',
      inhaler: 'Inhaler',
      drops: 'Drops',
      patch: 'Patch'
    };
    return labels[form as keyof typeof labels] || form;
  };

  const getAdministrationLabel = (method?: string) => {
    if (!method) return 'Not specified';
    const labels = {
      oral: 'Oral',
      topical: 'Topical',
      injection: 'Injection',
      rectal: 'Rectal',
      nasal: 'Nasal',
      inhalation: 'Inhalation'
    };
    return labels[method as keyof typeof labels] || method;
  };

  const getCategoryIcon = (category?: string) => {
    if (!category) return 'medication';
    const categoryIcons: Record<string, string> = {
      'cardiovascular': 'favorite',
      'diabetes': 'bloodtype',
      'vitamins': 'eco',
      'antibiotics': 'healing',
      'pain': 'local_hospital',
      'mental_health': 'psychology',
      'respiratory': 'air',
      'gastrointestinal': 'stomach'
    };
    return categoryIcons[category] || 'medication';
  };

  const syncWithPrescriptions = async () => {
    // Implementation for syncing with prescriptions
  };

  const syncWithFamilyData = async () => {
    // Implementation for syncing with family data
  };

  const exportRemindersData = () => {
    const dataStr = JSON.stringify(selfReminders, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `self-reminders-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: t('success'),
      description: t('remindersExportedSuccessfully'),
    });
  };

  const importRemindersData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedData)) {
          setSelfReminders(importedData);
          toast({
            title: t('success'),
            description: t('remindersImportedSuccessfully'),
          });
        } else {
          throw new Error('Invalid data format');
        }
      } catch (error) {
        toast({
          title: t('error'),
          description: t('failedToImportReminders'),
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <motion.div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white p-6 rounded-b-3xl shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <motion.h1 
                className="text-4xl lg:text-5xl font-bold mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {t('selfReminders')}
              </motion.h1>
              <motion.p 
                className="text-xl text-blue-100 max-w-2xl"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {t('selfRemindersDescription')}
              </motion.p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 transition-all duration-200"
                onClick={async () => {
                  setSyncStatus('syncing');
                  try {
                    await Promise.all([
                      syncWithPrescriptions(),
                      syncWithFamilyData()
                    ]);
                    setLastSyncTime(new Date());
                    setSyncStatus('success');
                    toast({
                      title: t('manualSyncComplete'),
                      description: t('allDataSynchronizedSuccessfully'),
                    });
                  } catch (error) {
                    setSyncStatus('error');
                    toast({
                      title: t('syncFailed'),
                      description: t('someDataFailedToSync'),
                      variant: 'destructive',
                    });
                  }
                }}
              >
                <span className={`material-icons mr-2 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}>
                  {syncStatus === 'syncing' ? 'sync' : 'sync'}
                </span>
                <span className="hidden sm:inline">{syncStatus === 'syncing' ? t('syncing') : t('fullSync')}</span>
                <span className="sm:hidden">{syncStatus === 'syncing' ? t('sync') : t('sync')}</span>
              </Button>
              
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 transition-all duration-200"
                onClick={exportRemindersData}
              >
                <span className="material-icons mr-2">download</span>
                <span className="hidden sm:inline">{t('export')}</span>
                <span className="sm:hidden">{t('export')}</span>
              </Button>
              
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    importRemindersData(file);
                    e.target.value = ''; // Reset input
                  }
                }}
                className="hidden"
                id="import-reminders"
              />
              
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 transition-all duration-200"
                onClick={() => document.getElementById('import-reminders')?.click()}
              >
                <span className="material-icons mr-2">upload</span>
                <span className="hidden sm:inline">{t('import')}</span>
                <span className="sm:hidden">{t('import')}</span>
              </Button>

              <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogTrigger asChild>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <span className="material-icons mr-2">add_alarm</span>
                    <span className="hidden sm:inline">{t('addReminder')}</span>
                    <span className="sm:hidden">{t('add')}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl w-[95vw] sm:w-auto max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="material-icons text-blue-600 text-xl">add_alarm</span>
                        </div>
                        <div>
                          <DialogTitle className="text-2xl font-bold text-blue-900">
                            {editingReminder ? t('editSelfReminder') : t('addNewSelfReminder')}
                          </DialogTitle>
                          <p className="text-sm text-blue-700">
                            {editingReminder ? t('modifyYourReminderSettings') : t('createNewMedicationOrHealthReminder')}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAddModal(false)}
                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </DialogHeader>
                  <form onSubmit={editingReminder ? handleUpdateReminder : handleAddReminder} className="space-y-4">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label htmlFor="title" className="text-gray-700">{t('reminderTitle')}</Label>
                        <Input
                          id="title"
                          value={newReminder.title}
                          onChange={(e) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
                          placeholder={t('reminderTitlePlaceholder')}
                          className="h-11 focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="medicationName" className="text-gray-700">{t('medicationName')}</Label>
                        <Input
                          id="medicationName"
                          value={newReminder.medicationName}
                          onChange={(e) => setNewReminder(prev => ({ ...prev, medicationName: e.target.value }))}
                          placeholder={t('medicationNamePlaceholder')}
                          className="h-11 focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-gray-700">{t('description')}</Label>
                      <Textarea
                        id="description"
                        value={newReminder.description}
                        onChange={(e) => setNewReminder(prev => ({ ...prev, description: e.target.value }))}
                        placeholder={t('descriptionPlaceholder')}
                        className="focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Dose Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <Label htmlFor="dosage" className="text-gray-700">{t('dosage')}</Label>
                        <Input
                          id="dosage"
                          value={newReminder.dosage}
                          onChange={(e) => setNewReminder(prev => ({ ...prev, dosage: e.target.value }))}
                          placeholder={t('dosagePlaceholder')}
                          className="h-11 focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="doseStrength" className="text-gray-700">{t('doseStrength')}</Label>
                        <Input
                          id="doseStrength"
                          value={newReminder.doseStrength}
                          onChange={(e) => setNewReminder(prev => ({ ...prev, doseStrength: e.target.value }))}
                          placeholder={t('doseStrengthPlaceholder')}
                          className="h-11 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="doseForm" className="text-gray-700">{t('doseForm')}</Label>
                        <Select 
                          value={newReminder.doseForm} 
                          onValueChange={(value) => setNewReminder(prev => ({ ...prev, doseForm: value }))}
                        >
                          <SelectTrigger className="h-11 focus:ring-2 focus:ring-blue-500">
                            <SelectValue placeholder={t('selectForm')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tablet">{t('tablet')}</SelectItem>
                            <SelectItem value="capsule">{t('capsule')}</SelectItem>
                            <SelectItem value="liquid">{t('liquid')}</SelectItem>
                            <SelectItem value="injection">{t('injection')}</SelectItem>
                            <SelectItem value="cream">{t('cream')}</SelectItem>
                            <SelectItem value="inhaler">{t('inhaler')}</SelectItem>
                            <SelectItem value="drops">{t('drops')}</SelectItem>
                            <SelectItem value="patch">{t('patch')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label htmlFor="administrationMethod">{t('administrationMethod')}</Label>
                        <Select 
                          value={newReminder.administrationMethod} 
                          onValueChange={(value) => setNewReminder(prev => ({ ...prev, administrationMethod: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectMethod')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="oral">{t('oral')}</SelectItem>
                            <SelectItem value="topical">{t('topical')}</SelectItem>
                            <SelectItem value="injection">{t('injection')}</SelectItem>
                            <SelectItem value="inhalation">{t('inhalation')}</SelectItem>
                            <SelectItem value="sublingual">{t('sublingual')}</SelectItem>
                            <SelectItem value="rectal">{t('rectal')}</SelectItem>
                            <SelectItem value="nasal">{t('nasal')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="type">{t('reminderType')}</Label>
                        <Select 
                          value={newReminder.type} 
                          onValueChange={(value: any) => setNewReminder(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="medication">{t('medication')}</SelectItem>
                            <SelectItem value="appointment">{t('appointment')}</SelectItem>
                            <SelectItem value="checkup">{t('checkup')}</SelectItem>
                            <SelectItem value="vaccination">{t('vaccination')}</SelectItem>
                            <SelectItem value="custom">{t('custom')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Frequency and Timing */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label htmlFor="frequency">{t('frequency')}</Label>
                        <Select 
                          value={newReminder.frequency} 
                          onValueChange={(value: any) => setNewReminder(prev => ({ ...prev, frequency: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="once">{t('once')}</SelectItem>
                            <SelectItem value="daily">{t('daily')}</SelectItem>
                            <SelectItem value="weekly">{t('weekly')}</SelectItem>
                            <SelectItem value="monthly">{t('monthly')}</SelectItem>
                            <SelectItem value="custom">{t('custom')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>{t('reminderTimes')}</Label>
                        <div className="space-y-2">
                          {newReminder.times?.map((time, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                type="time"
                                value={time}
                                onChange={(e) => updateTimeSlot(index, e.target.value)}
                                className="flex-1"
                              />
                              {newReminder.times && newReminder.times.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeTimeSlot(index)}
                                  className="px-2"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addTimeSlot}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            {t('addTime')}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Days Selection for Weekly/Monthly */}
                    {(newReminder.frequency === 'weekly' || newReminder.frequency === 'monthly') && (
                      <div>
                        <Label>{t('reminderDays')}</Label>
                        <div className="grid grid-cols-7 gap-2 mt-2">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                            <Checkbox
                              key={day}
                              id={`day-${index}`}
                              checked={newReminder.days?.includes(day) || false}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setNewReminder(prev => ({
                                    ...prev,
                                    days: [...(prev.days || []), day]
                                  }));
                                } else {
                                  setNewReminder(prev => ({
                                    ...prev,
                                    days: prev.days?.filter(d => d !== day) || []
                                  }));
                                }
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional Settings */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label htmlFor="category">{t('category')}</Label>
                        <Select 
                          value={newReminder.category} 
                          onValueChange={(value) => setNewReminder(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">{t('general')}</SelectItem>
                            <SelectItem value="cardiac">{t('cardiac')}</SelectItem>
                            <SelectItem value="diabetes">{t('diabetes')}</SelectItem>
                            <SelectItem value="hypertension">{t('hypertension')}</SelectItem>
                            <SelectItem value="mental-health">{t('mentalHealth')}</SelectItem>
                            <SelectItem value="vitamins">{t('vitamins')}</SelectItem>
                            <SelectItem value="supplements">{t('supplements')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="color">{t('color')}</Label>
                        <Select 
                          value={newReminder.color} 
                          onValueChange={(value) => setNewReminder(prev => ({ ...prev, color: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="blue">{t('blue')}</SelectItem>
                            <SelectItem value="green">{t('green')}</SelectItem>
                            <SelectItem value="red">{t('red')}</SelectItem>
                            <SelectItem value="purple">{t('purple')}</SelectItem>
                            <SelectItem value="orange">{t('orange')}</SelectItem>
                            <SelectItem value="pink">{t('pink')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Instructions and Notes */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="instructions">{t('instructions')}</Label>
                        <Textarea
                          id="instructions"
                          value={newReminder.instructions}
                          onChange={(e) => setNewReminder(prev => ({ ...prev, instructions: e.target.value }))}
                          placeholder={t('instructionsPlaceholder')}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="specialInstructions">{t('specialInstructions')}</Label>
                        <Textarea
                          id="specialInstructions"
                          value={newReminder.specialInstructions}
                          onChange={(e) => setNewReminder(prev => ({ ...prev, specialInstructions: e.target.value }))}
                          placeholder={t('specialInstructionsPlaceholder')}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Status Toggle */}
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={newReminder.isActive}
                        onCheckedChange={(checked) => setNewReminder(prev => ({ ...prev, isActive: checked }))}
                      />
                      <Label htmlFor="isActive">{t('reminderActive')}</Label>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddModal(false)}
                        className="flex-1"
                      >
                        {t('cancel')}
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        {editingReminder ? t('updateReminder') : t('addReminder')}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

        {/* Data Sync Status */}
        <Card className="rounded-t-none">
          <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 rounded-t-lg">
             <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0">
               <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                 <div className="flex items-center space-x-2">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                   <span className="text-xs sm:text-sm text-blue-700 font-medium">Data Sync Active</span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <span className="material-icons text-blue-600 text-sm">medication</span>
                   <span className="text-xs sm:text-sm text-blue-600">
                     {selfReminders?.filter(r => r.category === 'prescription').length || 0} <span className="hidden sm:inline">Prescription Reminders</span><span className="sm:hidden">Prescription</span>
                   </span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <span className="material-icons text-purple-600 text-sm">family_restroom</span>
                   <span className="text-xs sm:text-sm text-purple-600">
                     {selfReminders?.filter(r => r.category === 'family_medication').length || 0} <span className="hidden sm:inline">Family Reminders</span><span className="sm:hidden">Family</span>
                   </span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <span className="material-icons text-orange-600 text-sm">schedule</span>
                   <span className="text-xs sm:text-sm text-orange-600">
                     {selfReminders?.filter(r => r.category === 'custom').length || 0} <span className="hidden sm:inline">Custom Reminders</span><span className="sm:hidden">Custom</span>
                   </span>
                 </div>
               </div>
               <div className="text-xs text-blue-600">
                 Last sync: {lastSyncTime.toLocaleTimeString()}
               </div>
             </div>
           </div>
           
           <CardContent className="p-6">
            {/* Self Reminders List with Image Part List Design */}
            <div className="space-y-6">
              {!selfReminders || selfReminders.length === 0 ? (
                <motion.div 
                  className="text-center py-16 px-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                    <span className="material-icons text-purple-500 text-4xl">medication</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">No Self Reminders Set</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm sm:text-base">
                    Start setting up your personal medication reminders to ensure you never miss a dose.
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {selfReminders.map((reminder, index) => (
                    <motion.div 
                      key={reminder.id}
                      className={`p-6 rounded-xl border transition-all duration-300 ${
                        reminder.isActive 
                          ? 'bg-white border-purple-200 hover:border-purple-300 hover:shadow-lg' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: 0.1 + index * 0.05,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{ 
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex items-start space-x-4 flex-1">
                          {/* Image Part - Medication Icon with Color */}
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getReminderColor(reminder.type, reminder.color)} flex-shrink-0 shadow-lg`}>
                            <span className="material-icons text-2xl">{getReminderIcon(reminder.type)}</span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                                {reminder.title || reminder.medicationName || 'Untitled Reminder'}
                              </h3>
                              <Badge 
                                variant={reminder.isActive ? "default" : "secondary"}
                                className={`${reminder.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
                              >
                                {reminder.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {getFrequencyText(reminder.frequency)}
                              </Badge>
                              {reminder.category && (
                                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                  <span className="material-icons text-xs mr-1">{getCategoryIcon(reminder.category)}</span>
                                  {reminder.category.replace('_', ' ')}
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-gray-600 mb-3">
                              {reminder.description || `Reminder to take ${reminder.medicationName || 'medication'} ${reminder.dosage || ''}`}
                            </p>
                            
                            {/* Medication Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3">
                              <div>
                                <p className="text-sm text-gray-500">
                                  <span className="font-semibold">Medication:</span> {reminder.medicationName || 'Not specified'}
                                </p>
                                <p className="text-sm text-gray-500">
                                  <span className="font-semibold">Dosage:</span> {reminder.dosage || 'Not specified'}
                                </p>
                                {reminder.doseStrength && (
                                  <p className="text-sm text-gray-500">
                                    <span className="font-semibold">Strength:</span> {reminder.doseStrength}
                                  </p>
                                )}
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">
                                  <span className="font-semibold">Form:</span> {getDoseFormLabel(reminder.doseForm) || 'Not specified'}
                                </p>
                                <p className="text-sm text-gray-500">
                                  <span className="font-semibold">Method:</span> {getAdministrationLabel(reminder.administrationMethod) || 'Not specified'}
                                </p>
                                <p className="text-sm text-gray-500">
                                  <span className="font-semibold">Times:</span> {reminder.times?.length > 0 ? reminder.times.join(', ') : 'Not specified'}
                                </p>
                              </div>
                            </div>

                            {/* Instructions */}
                            {(reminder.instructions || reminder.specialInstructions) && (
                              <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                {reminder.instructions && (
                                  <p className="text-sm text-blue-800 mb-1">
                                    <span className="font-semibold">Instructions:</span> {reminder.instructions}
                                  </p>
                                )}
                                {reminder.specialInstructions && (
                                  <p className="text-sm text-blue-800">
                                    <span className="font-semibold">Special:</span> {reminder.specialInstructions}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Visual Reminder Status */}
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${reminder.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                <span className="text-xs text-gray-500">
                                  {reminder.isActive ? 'Reminder Active' : 'Reminder Paused'}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <span className="material-icons text-purple-500 text-sm">schedule</span>
                                <span className="text-xs text-purple-600">Personal Medication</span>
                              </div>
                              
                              {reminder.days && reminder.days.length > 0 && (
                                <div className="flex items-center space-x-1">
                                  <span className="material-icons text-blue-500 text-sm">calendar_today</span>
                                  <span className="text-xs text-blue-600">{getDaysText(reminder.days)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-4 sm:mt-0 sm:ml-4">
                          {/* Enhanced Toggle Switch */}
                          <div className="flex items-center space-x-3">
                            <Switch
                              checked={reminder.isActive}
                              onCheckedChange={() => toggleReminderStatus(reminder.id)}
                              className="enhanced-toggle data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-gray-300"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {reminder.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditReminder(reminder)}
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-colors duration-200"
                            title="Edit Self Reminder"
                          >
                            <span className="material-icons text-sm">edit</span>
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteReminder(reminder.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                            title="Delete Self Reminder"
                          >
                            <span className="material-icons text-sm">delete</span>
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Self Reminders Summary */}
            {selfReminders && selfReminders.length > 0 && (
              <motion.div 
                className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600">
                      {selfReminders.filter(r => r.isActive).length}
                    </div>
                    <div className="text-xs text-purple-600">Active Self Reminders</div>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">
                      {selfReminders.filter(r => r.type === 'medication').length}
                    </div>
                    <div className="text-xs text-blue-600">Medication Reminders</div>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">
                      {selfReminders.filter(r => r.frequency === 'daily').length}
                    </div>
                    <div className="text-xs text-green-600">Daily Reminders</div>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg border border-orange-200">
                    <div className="text-2xl font-bold text-orange-600">
                      {selfReminders.filter(r => r.times.length > 1).length}
                    </div>
                    <div className="text-xs text-orange-600">Multiple Times</div>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default SelfReminder;
