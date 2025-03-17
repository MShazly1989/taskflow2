import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTaskStore } from '@/store/taskStore';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ChartBar as BarChart2, TrendingUp, Users } from 'lucide-react-native';

export default function ReportsScreen() {
  const tasks = useTaskStore((state) => state.tasks);
  const [selectedMetric, setSelectedMetric] = useState<'completion' | 'priority' | 'collaboration'>('completion');

  const getMonthlyStats = () => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const completedTasks = tasks.filter(task => task.completionPercentage === 100).length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const priorityDistribution = {
      urgent: tasks.filter(task => task.priority === 'urgent').length,
      medium: tasks.filter(task => task.priority === 'medium').length,
      normal: tasks.filter(task => task.priority === 'normal').length,
    };

    const averageCollaborators = tasks.reduce((acc, task) => acc + task.partners.length, 0) / (tasks.length || 1);

    return {
      completionRate,
      priorityDistribution,
      averageCollaborators,
      daysInMonth: daysInMonth.length,
    };
  };

  const stats = getMonthlyStats();

  const metrics = [
    { id: 'completion', icon: BarChart2, label: 'Completion Rate' },
    { id: 'priority', icon: TrendingUp, label: 'Priority Distribution' },
    { id: 'collaboration', icon: Users, label: 'Team Collaboration' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Reports</Text>
        <Text style={styles.subtitle}>
          {format(new Date(), 'MMMM yyyy')} Overview
        </Text>

        <View style={styles.metricsContainer}>
          {metrics.map((metric) => (
            <Pressable
              key={metric.id}
              style={[
                styles.metricButton,
                selectedMetric === metric.id && styles.metricButtonActive,
              ]}
              onPress={() => setSelectedMetric(metric.id as typeof selectedMetric)}
            >
              <metric.icon
                size={24}
                color={selectedMetric === metric.id ? '#FFFFFF' : '#8E8E93'}
              />
              <Text
                style={[
                  styles.metricButtonText,
                  selectedMetric === metric.id && styles.metricButtonTextActive,
                ]}
              >
                {metric.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.statsCard}>
          {selectedMetric === 'completion' && (
            <View style={styles.statContent}>
              <Text style={styles.statTitle}>Task Completion Rate</Text>
              <Text style={styles.statValue}>{stats.completionRate.toFixed(1)}%</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${stats.completionRate}%` },
                  ]}
                />
              </View>
              <Text style={styles.statDescription}>
                Based on {tasks.length} total tasks this month
              </Text>
            </View>
          )}

          {selectedMetric === 'priority' && (
            <View style={styles.statContent}>
              <Text style={styles.statTitle}>Task Priority Distribution</Text>
              {Object.entries(stats.priorityDistribution).map(([priority, count]) => (
                <View key={priority} style={styles.priorityRow}>
                  <View style={styles.priorityLabelContainer}>
                    <View
                      style={[
                        styles.priorityDot,
                        {
                          backgroundColor:
                            priority === 'urgent'
                              ? '#FF3B30'
                              : priority === 'medium'
                              ? '#FF9500'
                              : '#34C759',
                        },
                      ]}
                    />
                    <Text style={styles.priorityLabel}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </View>
                  <Text style={styles.priorityCount}>{count} tasks</Text>
                </View>
              ))}
            </View>
          )}

          {selectedMetric === 'collaboration' && (
            <View style={styles.statContent}>
              <Text style={styles.statTitle}>Team Collaboration</Text>
              <Text style={styles.statValue}>
                {stats.averageCollaborators.toFixed(1)}
              </Text>
              <Text style={styles.statDescription}>
                Average team members per task
              </Text>
            </View>
          )}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Monthly Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{tasks.length}</Text>
              <Text style={styles.summaryLabel}>Total Tasks</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {tasks.filter(task => task.completionPercentage === 100).length}
              </Text>
              <Text style={styles.summaryLabel}>Completed</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {tasks.filter(task => task.completionPercentage < 100).length}
              </Text>
              <Text style={styles.summaryLabel}>In Progress</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{stats.daysInMonth}</Text>
              <Text style={styles.summaryLabel}>Days</Text>
            </View>
          </View>
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
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B6B6B',
    marginBottom: 24,
  },
  metricsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  metricButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  metricButtonActive: {
    backgroundColor: '#007AFF',
  },
  metricButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#8E8E93',
  },
  metricButtonTextActive: {
    color: '#FFFFFF',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statContent: {
    alignItems: 'center',
  },
  statTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 48,
    color: '#007AFF',
    marginBottom: 16,
  },
  statDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 4,
  },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  priorityLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  priorityLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#000000',
  },
  priorityCount: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B6B6B',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#000000',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -8,
  },
  summaryItem: {
    width: '50%',
    padding: 8,
  },
  summaryValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#000000',
    marginBottom: 4,
  },
  summaryLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B6B6B',
  },
});