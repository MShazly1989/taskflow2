export type Priority = 'urgent' | 'medium' | 'normal';

export interface Partner {
  id: string;
  name: string;
  color: string;
  isComplete?: boolean;
}

export interface Subtask {
  id: string;
  title: string;
  isComplete: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: Date;
  mentions: string[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  priority: Priority;
  partners: Partner[];
  completionPercentage: number;
  notes?: string;
  attachments?: string[];
  subtasks?: Subtask[];
  comments?: Comment[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  modificationLog: ModificationLog[];
}

export interface ModificationLog {
  timestamp: Date;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete';
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}