import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, CircleAlert as AlertCircle } from 'lucide-react-native';
import { useTaskStore } from '@/store/taskStore';
import { format } from 'date-fns';

const priorityColors = {
  urgent: '#FF3B30',
  medium: '#FF9500',
  normal: '#34C759',
};

export default function TasksScreen() {
  const tasks = useTaskStore((state) => state.tasks);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredTasks = tasks.filter((task) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'completed') return task.completionPercentage === 100;
    if (selectedFilter === 'in-progress') return task.completionPercentage > 0 && task.completionPercentage < 100;
    if (selectedFilter === 'not-started') return task.completionPercentage === 0;
    return true;
  });

  const filters = [
    { id: 'all', label: 'All Tasks' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'not-started', label: 'Not Started' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Tasks</Text>
          <Pressable 
            style={styles.addButton}
            onPress={() => router.push('/tasks/create')}
          >
            <Plus size={24} color="#FFFFFF" />
          </Pressable>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {filters.map((filter) => (
            <Pressable
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter === filter.id && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedFilter === filter.id && styles.filterButtonTextActive,
              ]}>
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1496115965489-21be7e6e59a0?auto=format&fit=crop&q=80&w=400' }}
              style={styles.emptyStateImage}
            />
            <Text style={styles.emptyStateTitle}>No tasks found</Text>
            <Text style={styles.emptyStateText}>
              Create your first task by tapping the + button above
            </Text>
          </View>
        ) : (
          <View style={styles.taskList}>
            {filteredTasks.map((task) => (
              <Pressable 
                key={task.id}
                style={styles.taskCard}
                onPress={() => {}}
              >
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View style={[
                    styles.priorityBadge,
                    { backgroundColor: priorityColors[task.priority] }
                  ]}>
                    <Text style={styles.priorityText}>{task.priority}</Text>
                  </View>
                </View>

                {task.description && (
                  <Text style={styles.taskDescription} numberOfLines={2}>
                    {task.description}
                  </Text>
                )}

                <View style={styles.taskFooter}>
                  <View style={styles.taskDates}>
                    <Text style={styles.taskDateLabel}>Due</Text>
                    <Text style={styles.taskDate}>
                      {format(task.endDate, 'MMM d, yyyy')}
                    </Text>
                  </View>

                  <View style={styles.taskProgress}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill,
                          { width: `${task.completionPercentage}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {task.completionPercentage}%
                    </Text>
                  </View>

                  <View style={styles.partnersContainer}>
                    {task.partners.slice(0, 3).map((partner, index) => (
                      <View
                        key={partner.id}
                        style={[
                          styles.partnerAvatar,
                          { backgroundColor: partner.color },
                          { marginLeft: index > 0 ? -12 : 0 }
                        ]}
                      >
                        <Text style={styles.partnerInitial}>
                          {partner.name[0]}
                        </Text>
                      </View>
                    ))}
                    {task.partners.length > 3 && (
                      <View style={[styles.partnerAvatar, styles.partnerMore]}>
                        <Text style={styles.partnerInitial}>
                          +{task.partners.length - 3}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {new Date(task.endDate) < new Date() && task.completionPercentage < 100 && (
                  <View style={styles.overdueBanner}>
                    <AlertCircle size={16} color="#FF3B30" />
                    <Text style={styles.overdueText}>Overdue</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#000000',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  filtersContainer: {
    paddingBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#8E8E93',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#000000',
    marginBottom: 8,
  },
  emptyStateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B6B6B',
    textAlign: 'center',
  },
  taskList: {
    gap: 16,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
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
    marginBottom: 8,
  },
  taskTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#000000',
    flex: 1,
    marginRight: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  taskDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B6B6B',
    marginBottom: 16,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskDates: {
    flex: 1,
  },
  taskDateLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  taskDate: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#000000',
  },
  taskProgress: {
    flex: 1,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 2,
  },
  progressText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#8E8E93',
  },
  partnersContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  partnerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  partnerInitial: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  partnerMore: {
    backgroundColor: '#8E8E93',
    marginLeft: -12,
  },
  overdueBanner: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  overdueText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#FF3B30',
  },
});