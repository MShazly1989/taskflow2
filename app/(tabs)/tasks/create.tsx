import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { X, Plus, Minus, Clock } from 'lucide-react-native';
import { useTaskStore } from '@/store/taskStore';
import { Priority, Partner } from '@/types/task';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

const priorities: Priority[] = ['urgent', 'medium', 'normal'];
const partnerColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B786F'];

export default function CreateTaskScreen() {
  const addTask = useTaskStore((state) => state.addTask);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<Priority>('normal');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [newPartnerName, setNewPartnerName] = useState('');

  const handleCreateTask = () => {
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      description: description.trim(),
      priority: selectedPriority,
      startDate,
      endDate,
      partners,
      completionPercentage: 0,
      createdBy: 'current-user',
    });

    router.back();
  };

  const addPartner = () => {
    if (!newPartnerName.trim()) return;
    
    const newPartner: Partner = {
      id: Math.random().toString(36).substr(2, 9),
      name: newPartnerName.trim(),
      color: partnerColors[partners.length % partnerColors.length],
    };

    setPartners([...partners, newPartner]);
    setNewPartnerName('');
  };

  const removePartner = (partnerId: string) => {
    setPartners(partners.filter(p => p.id !== partnerId));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>New Task</Text>
          <Pressable 
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <X size={24} color="#8E8E93" />
          </Pressable>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter task description"
              placeholderTextColor="#8E8E93"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Time Period</Text>
            <View style={styles.timeInputs}>
              <Pressable
                style={styles.timeButton}
                onPress={() => setShowStartPicker(true)}
              >
                <Clock size={20} color="#007AFF" />
                <Text style={styles.timeButtonText}>
                  Start: {format(startDate, 'MMM d, yyyy h:mm a')}
                </Text>
              </Pressable>

              <Pressable
                style={styles.timeButton}
                onPress={() => setShowEndPicker(true)}
              >
                <Clock size={20} color="#007AFF" />
                <Text style={styles.timeButtonText}>
                  End: {format(endDate, 'MMM d, yyyy h:mm a')}
                </Text>
              </Pressable>
            </View>
          </View>

          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="datetime"
              onChange={(event, date) => {
                setShowStartPicker(false);
                if (date) setStartDate(date);
              }}
            />
          )}

          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="datetime"
              minimumDate={startDate}
              onChange={(event, date) => {
                setShowEndPicker(false);
                if (date) setEndDate(date);
              }}
            />
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityButtons}>
              {priorities.map((priority) => (
                <Pressable
                  key={priority}
                  style={[
                    styles.priorityButton,
                    selectedPriority === priority && styles.priorityButtonActive,
                    { backgroundColor: selectedPriority === priority ? '#007AFF' : '#FFFFFF' }
                  ]}
                  onPress={() => setSelectedPriority(priority)}
                >
                  <Text
                    style={[
                      styles.priorityButtonText,
                      selectedPriority === priority && styles.priorityButtonTextActive
                    ]}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Partners</Text>
            <View style={styles.partnerInput}>
              <TextInput
                style={styles.partnerTextInput}
                value={newPartnerName}
                onChangeText={setNewPartnerName}
                placeholder="Enter partner name"
                placeholderTextColor="#8E8E93"
                onSubmitEditing={addPartner}
              />
              <Pressable
                style={[styles.partnerAddButton, !newPartnerName.trim() && styles.partnerAddButtonDisabled]}
                onPress={addPartner}
                disabled={!newPartnerName.trim()}
              >
                <Plus size={20} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.partnersList}>
              {partners.map((partner) => (
                <View key={partner.id} style={styles.partnerChip}>
                  <View style={[styles.partnerColor, { backgroundColor: partner.color }]} />
                  <Text style={styles.partnerName}>{partner.name}</Text>
                  <Pressable
                    style={styles.removePartnerButton}
                    onPress={() => removePartner(partner.id)}
                  >
                    <Minus size={16} color="#FF3B30" />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable
            style={[styles.createButton, !title.trim() && styles.createButtonDisabled]}
            onPress={handleCreateTask}
            disabled={!title.trim()}
          >
            <Text style={styles.createButtonText}>Create Task</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 20,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#000000',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#000000',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    height: 120,
  },
  timeInputs: {
    gap: 12,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeButtonText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#000000',
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  priorityButtonActive: {
    backgroundColor: '#007AFF',
  },
  priorityButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#8E8E93',
  },
  priorityButtonTextActive: {
    color: '#FFFFFF',
  },
  partnerInput: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  partnerTextInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  partnerAddButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  partnerAddButtonDisabled: {
    backgroundColor: '#8E8E93',
    shadowColor: '#8E8E93',
  },
  partnersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  partnerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  partnerColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  partnerName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#000000',
  },
  removePartnerButton: {
    padding: 4,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonDisabled: {
    backgroundColor: '#8E8E93',
    shadowColor: '#8E8E93',
  },
  createButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
});