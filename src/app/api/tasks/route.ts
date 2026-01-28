// src/app/api/tasks/route.ts
import { NextResponse } from 'next/server';
import { Task } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';

// Define o caminho do arquivo JSON na raiz do projeto
const DB_FILE_PATH = path.join(process.cwd(), 'tasks-db.json');

// --- Funções Auxiliares para manipular o arquivo ---

async function getTasksFromFile(): Promise<Task[]> {
  try {
    const data = await fs.readFile(DB_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Se o arquivo não existir (primeira execução), retorna array vazio
    return [];
  }
}

async function saveTasksToFile(tasks: Task[]): Promise<void> {
  // Salva formatado com identação para ficar legível
  await fs.writeFile(DB_FILE_PATH, JSON.stringify(tasks, null, 2));
}

// --- Rotas da API (CRUD) ---

// READ: Buscar todas as tarefas
export async function GET() {
  const tasks = await getTasksFromFile();
  return NextResponse.json(tasks);
}

// CREATE: Criar nova tarefa
export async function POST(request: Request) {
  const body = await request.json();
  
  if (!body.title) {
    return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 });
  }

  const tasks = await getTasksFromFile();

  const newTask: Task = {
    id: uuidv4(),
    title: body.title,
    description: body.description || '',
    priority: body.priority || 'baixa',
    dueDate: body.dueDate || undefined,
    isCompleted: false,
    createdAt: new Date().toISOString(),
  };

  tasks.push(newTask);
  await saveTasksToFile(tasks); // Persiste no arquivo

  return NextResponse.json(newTask, { status: 201 });
}

// UPDATE: Atualizar tarefa
export async function PUT(request: Request) {
  const body = await request.json();
  const { id, ...updates } = body;

  const tasks = await getTasksFromFile();
  const taskIndex = tasks.findIndex((t) => t.id === id);
  
  if (taskIndex === -1) {
    return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 });
  }

  // Atualiza apenas os campos enviados
  tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
  
  await saveTasksToFile(tasks); // Persiste no arquivo

  return NextResponse.json(tasks[taskIndex]);
}

// DELETE: Remover tarefa
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID necessário' }, { status: 400 });

  let tasks = await getTasksFromFile();
  const initialLength = tasks.length;
  
  tasks = tasks.filter((t) => t.id !== id);

  if (tasks.length === initialLength) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 });
  }

  await saveTasksToFile(tasks); // Persiste no arquivo

  return NextResponse.json({ success: true });
}