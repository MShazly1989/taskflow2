import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useTaskStore } from '@/store/taskStore';
import { format } from 'date-fns';
import { ArrowLeft, Clock, MessageSquare, Paperclip, Send, CircleAlert as AlertCircle, SquareCheck as CheckSquare, Square } from 'lucide-react-native';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: Date;
  mentions: string[];
}

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const task = useTaskStore((state) => state.getTaskById(id as string));
  const updateTask = useTaskStore((state) => state.updateTask);
  const [newComment, setNewComment] = useState('');
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#000000" />
          </Pressable>
          <Text style={styles.title}>Task Not Found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handlePartnerProgress = (partnerId: string, isComplete: boolean) => {
    const updatedPartners = task.partners.map(partner => {
      if (partner.id === partnerId) {
        return { ...partner, isComplete };
      }
      return partner;
    });

    const completedPartners = updatedPartners.filter(p => p.isComplete).length;
    const completionPercentage = Math.round((completedPartners / updatedPartners.length) * 100);

    updateTask(task.id, {
      partners: updatedPartners,
      completionPercentage
    });
  };

  const addComment = () => {
    if (!newComment.trim()) return;

    const mentions = newComment.match(/@[\w-]+/g) || [];
    const comment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      userId: 'current-user',
      userName: 'Current User',
      text: newComment.trim(),
      timestamp: new Date(),
      mentions: mentions.map(m => m.slice(1))
    };

    updateTask(task.id, {
      comments: [...(task.comments || []), comment]
    });

    setNewComment('');
  };

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return;

    const subtask = {
      id: Math.random().toString(36).substr(2, 9),
      title: newSubtaskTitle.trim(),
      isComplete: false
    };

    updateTask(task.id, {
      subtasks: [...(task.subtasks || []), subtask]
    });

    setNewSubtaskTitle('');
    setShowSubtaskInput(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#000000" />
          </Pressable>
          <Text style={styles.title}>Task Details</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <View style={[styles.priorityBadge, { backgroundColor: 
              task.priority === 'urgent' ? '#FF3B30' :
              task.priority === 'medium' ? '#FF9500' : '#34C759'
            }]}>
              <Text style={styles.priorityText}>{task.priority}</Text>
            </View>
          </View>

          {task.description && (
            <Text style={styles.description}>{task.description}</Text>
          )}

          <View style={styles.timeInfo}>
            <Clock size={20} color="#8E8E93" />
            <Text style={styles.timeText}>
              {format(new Date(task.startDate), 'MMM d, yyyy h:mm a')} - 
              {format(new Date(task.endDate), 'MMM d, yyyy h:mm a')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Progress</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${task.completionPercentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{task.completionPercentage}% Complete</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Partners</Text>
            {task.partners.map((partner) => (
              <Pressable
                key={partner.id}
                style={styles.partnerRow}
                onPress={() => handlePartnerProgress(partner.id, !partner.isComplete)}
              >
                <View style={styles.partnerInfo}>
                  <View style={[styles.partnerAvatar, { backgroundColor: partner.color }]}>
                    <Text style={styles.partnerInitial}>{partner.name[0]}</Text>
                  </View>
                  <Text style={styles.partnerName}>{partner.name}</Text>
                </View>
                {partner.isComplete ? (
                  <CheckSquare size={24} color={partner.color} />
                ) : (
                  <Square size={24} color={partner.color} />
                )}
              </Pressable>
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Subtasks</Text>
              <Pressable
                style={styles.addButton}
                onPress={() => setShowSubtaskInput(true)}
              >
                <Text style={styles.addButtonText}>Add Subtask</Text>
              </Pressable>
            </View>
            {showSubtaskInput && (
              <View style={styles.subtaskInput}>
                <TextInput
                  style={styles.input}
                  value={newSubtaskTitle}
                  onChangeText={setNewSubtaskTitle}
                  placeholder="Enter subtask title"
                  placeholderTextColor="#8E8E93"
                  onSubmitEditing={addSubtask}
                />
              </View>
            )}
            {task.subtasks?.map((subtask) => (
              <Pressable
                key={subtask.id}
                style={styles.subtaskRow}
                onPress={() => {
                  updateTask(task.id, {
                    subtasks: task.subtasks?.map(st =>
                      st.id === subtask.id ? { ...st, isComplete: !st.isComplete } : st
                    )
                  });
                }}
              >
                {subtask.isComplete ? (
                  <CheckSquare size={20} color="#34C759" />
                ) : (
                  <Square size={20} color="#8E8E93" />
                )}
                <Text style={[
                  styles.subtaskTitle,
                  subtask.isComplete && styles.subtaskTitleComplete
                ]}>
                  {subtask.title}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comments</Text>
            <View style={styles.comments}>
              {task.comments?.map((comment) => (
                <View key={comment.id} style={styles.comment}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{comment.userName}</Text>
                    <Text style={styles.commentTime}>
                      {format(new Date(comment.timestamp), 'MMM d, h:mm a')}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              ))}
            </View>
            <View style={styles.commentInput}>
              <TextInput
                style={styles.input}
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Add a comment... Use @mention to notify"
                placeholderTextColor="#8E8E93"
                multiline
              />
              <Pressable
                style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
                onPress={addComment}
                disabled={!newComment.trim()}
              >
                <Send size={20} color={newComment.trim() ? '#FFFFFF' : '#8E8E93'} />
              </Pressable>
            </View>
          </View>

          {task.attachments && task.attachments.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Attachments</Text>
              {task.attachments.map((attachment, index) => (
                <View key={index} style={styles.attachment}>
                  <Paperclip size={20} color="#8E8E93" />
                  <Text style={styles.attachmentName}>{attachment}</Text>
                </View>
              ))}
            </View>
          )}

          {new Date(task.endDate) < new Date() && task.completionPercentage < 100 && (
            <View style={styles.overdueBanner}>
              <AlertCircle size={20} color="#FF3B30" />
              <Text style={styles.overdueText}>This task is overdue</Text>
            </View>
          )}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#000000',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  taskTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    color: '#000000',
    flex: 1,
    marginRight: 12,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priorityText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#000000',
    marginBottom: 16,
    lineHeight: 24,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  timeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#000000',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#000000',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 4,
  },
  progressText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#8E8E93',
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  partnerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerInitial: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  partnerName: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#000000',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  addButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  subtaskInput: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#000000',
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  subtaskTitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#000000',
  },
  subtaskTitleComplete: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  comments: {
    gap: 16,
  },
  comment: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentAuthor: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#000000',
  },
  commentTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#8E8E93',
  },
  commentText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#000000',
  },
  commentInput: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E5EA',
  },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  attachmentName: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#000000',
  },
  overdueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 24,
  },
  overdueText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FF3B30',
  },
});