import { create } from 'zustand';
import { Task, Priority, Partner } from '@/types/task';

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'modificationLog'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTaskById: (id: string) => Task | undefined;
  getTasksByDate: (date: Date) => Task[];
  getTasksByPartner: (partnerId: string) => Task[];
  getTasksByPriority: (priority: Priority) => Task[];
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  
  addTask: (taskData) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date(),
      modificationLog: [{
        timestamp: new Date(),
        userId: 'current-user', // Replace with actual user ID
        userName: 'Current User', // Replace with actual user name
        action: 'create'
      }]
    };
    
    set((state) => ({
      tasks: [...state.tasks, newTask]
    }));
  },
  
  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id === id) {
          const updatedTask = {
            ...task,
            ...updates,
            updatedAt: new Date(),
            modificationLog: [
              ...task.modificationLog,
              {
                timestamp: new Date(),
                userId: 'current-user', // Replace with actual user ID
                userName: 'Current User', // Replace with actual user name
                action: 'update',
                changes: Object.entries(updates).map(([field, newValue]) => ({
                  field,
                  oldValue: task[field as keyof Task],
                  newValue
                }))
              }
            ]
          };
          return updatedTask;
        }
        return task;
      })
    }));
  },
  
  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id)
    }));
  },
  
  getTaskById: (id) => {
    return get().tasks.find((task) => task.id === id);
  },
  
  getTasksByDate: (date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return get().tasks.filter((task) => {
      return task.startDate >= startOfDay && task.startDate <= endOfDay;
    });
  },
  
  getTasksByPartner: (partnerId) => {
    return get().tasks.filter((task) => {
      return task.partners.some((partner) => partner.id === partnerId);
    });
  },
  
  getTasksByPriority: (priority) => {
    return get().tasks.filter((task) => task.priority === priority);
  }
}));