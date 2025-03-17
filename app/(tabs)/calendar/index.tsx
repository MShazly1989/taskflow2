import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, startOfWeek, addDays, isSameDay, eachDayOfInterval, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { useTaskStore } from '@/store/taskStore';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

// Import and register Chart.js components for web
if (Platform.OS === 'web') {
  const {
    Chart: ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
  } = require('chart.js');

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
  );
}

// Only import chart on web platform
const Chart = Platform.select({
  web: () => require('react-chartjs-2').Line,
  default: () => require('react-native-chart-kit').LineChart,
})();

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const tasks = useTaskStore((state) => state.tasks);

  const getWeekDays = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const weekDays = getWeekDays(selectedDate);
  
  const getDayTasks = (date: Date) => {
    return tasks.filter(task => {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate);
      return isWithinInterval(date, { start: taskStart, end: taskEnd });
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = addDays(selectedDate, direction === 'prev' ? -7 : 7);
    setSelectedDate(newDate);
    setCurrentMonth(newDate);
  };

  // Calculate completion data for the graph
  const getCompletionData = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const completionData = days.map(day => {
      const dayTasks = getDayTasks(day);
      const completedTasks = dayTasks.filter(task => task.completionPercentage === 100);
      return completedTasks.length;
    });

    if (Platform.OS === 'web') {
      return {
        labels: days.map(day => format(day, 'd')),
        datasets: [{
          label: 'Completed Tasks',
          data: completionData,
          borderColor: '#007AFF',
          backgroundColor: 'rgba(0, 122, 255, 0.1)',
          tension: 0.4,
          fill: true
        }]
      };
    }

    return {
      labels: days.map(day => format(day, 'd')),
      datasets: [{
        data: completionData
      }]
    };
  };

  const chartConfig = Platform.OS === 'web' ? {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  } : {
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    style: {
      borderRadius: 16
    }
  };

  const renderChart = () => {
    const chartData = getCompletionData();
    const chartWidth = Dimensions.get('window').width - 40;

    if (Platform.OS === 'web') {
      return (
        <View style={{ height: 220 }}>
          <Chart data={chartData} options={chartConfig} />
        </View>
      );
    }

    return (
      <Chart
        data={chartData}
        width={chartWidth}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
      </View>

      <View style={styles.weekHeader}>
        <Pressable onPress={() => navigateWeek('prev')} style={styles.weekNavButton}>
          <ChevronLeft size={24} color="#007AFF" />
        </Pressable>
        <Text style={styles.weekTitle}>
          {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
        </Text>
        <Pressable onPress={() => navigateWeek('next')} style={styles.weekNavButton}>
          <ChevronRight size={24} color="#007AFF" />
        </Pressable>
      </View>

      <View style={styles.weekDays}>
        {weekDays.map((date) => (
          <Pressable
            key={date.toString()}
            style={[
              styles.dayCell,
              isSameDay(date, selectedDate) && styles.selectedDay
            ]}
            onPress={() => setSelectedDate(date)}
          >
            <Text style={[
              styles.dayName,
              isSameDay(date, selectedDate) && styles.selectedDayText
            ]}>
              {format(date, 'EEE')}
            </Text>
            <Text style={[
              styles.dayNumber,
              isSameDay(date, selectedDate) && styles.selectedDayText
            ]}>
              {format(date, 'd')}
            </Text>
            <View style={styles.taskIndicators}>
              {getDayTasks(date).map((task, index) => (
                <View
                  key={task.id}
                  style={[
                    styles.taskIndicator,
                    { backgroundColor: task.partners[0]?.color || '#007AFF' }
                  ]}
                />
              ))}
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Task Completion Trend</Text>
        {renderChart()}
      </View>

      <ScrollView style={styles.taskList}>
        <Text style={styles.dateTitle}>
          {format(selectedDate, 'MMMM d, yyyy')}
        </Text>
        {getDayTasks(selectedDate).map((task) => (
          <View key={task.id} style={styles.taskCard}>
            <View style={[styles.priorityIndicator, { backgroundColor: 
              task.priority === 'urgent' ? '#FF3B30' :
              task.priority === 'medium' ? '#FF9500' : '#34C759'
            }]} />
            <View style={styles.taskContent}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskTime}>
                {format(new Date(task.startDate), 'h:mm a')} - 
                {format(new Date(task.endDate), 'h:mm a')}
              </Text>
              {task.description && (
                <Text style={styles.taskDescription} numberOfLines={2}>
                  {task.description}
                </Text>
              )}
              <View style={styles.partnerCheckboxes}>
                {task.partners.map((partner) => (
                  <View key={partner.id} style={styles.partnerCheckbox}>
                    <View style={[
                      styles.checkbox,
                      partner.isComplete && styles.checkboxChecked,
                      { borderColor: partner.color }
                    ]}>
                      {partner.isComplete && (
                        <View style={[styles.checkmark, { backgroundColor: partner.color }]} />
                      )}
                    </View>
                    <Text style={styles.partnerName}>{partner.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}
        {getDayTasks(selectedDate).length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No tasks scheduled for this day</Text>
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
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#000000',
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  weekTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#000000',
  },
  weekNavButton: {
    padding: 8,
  },
  weekDays: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    minHeight: 80,
  },
  selectedDay: {
    backgroundColor: '#007AFF',
  },
  dayName: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  dayNumber: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#000000',
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  taskIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 4,
    gap: 2,
  },
  taskIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#000000',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  dateTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#000000',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  taskList: {
    flex: 1,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  priorityIndicator: {
    width: 4,
  },
  taskContent: {
    flex: 1,
    padding: 16,
  },
  taskTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#000000',
    marginBottom: 4,
  },
  taskTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  taskDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B6B6B',
    marginBottom: 12,
  },
  partnerCheckboxes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  partnerCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FFFFFF',
  },
  checkmark: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  partnerName: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#000000',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#8E8E93',
  },
});