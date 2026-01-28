export type Priority = 'baixa' | 'media' | 'alta';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string; // Formato ISO date string
  isCompleted: boolean;
  createdAt: string;
}

export type SortOption = 'date' | 'priority';