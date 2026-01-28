// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Task, Priority, SortOption } from "@/types";

export default function Home() {
  // Estados
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  
  // Estado do Formulário
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "baixa" as Priority,
    dueDate: "",
  });

  // Carregar tarefas ao iniciar
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data);
    setLoading(false);
  };

  // --- Funções CRUD ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    await fetch("/api/tasks", {
      method: "POST",
      body: JSON.stringify(formData),
      headers: { "Content-Type": "application/json" },
    });
    
    // Limpar form e recarregar
    setFormData({ title: "", description: "", priority: "baixa", dueDate: "" });
    fetchTasks();
  };

  const toggleComplete = async (task: Task) => {
    await fetch("/api/tasks", {
      method: "PUT",
      body: JSON.stringify({ id: task.id, isCompleted: !task.isCompleted }),
    });
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    if(!confirm("Deseja realmente excluir?")) return;
    await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
    fetchTasks();
  };

  // --- Lógica de Ordenação e Filtragem ---

  const priorityWeight = { alta: 3, media: 2, baixa: 1 };

  const pendingTasks = tasks
    .filter((t) => !t.isCompleted)
    .sort((a, b) => {
      if (sortBy === 'priority') {
        // Ordena por peso da prioridade (Alta -> Baixa)
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      } else {
        // Ordena por data de término (Mais cedo -> Mais tarde)
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
    });

  const completedTasks = tasks.filter((t) => t.isCompleted);

  // --- Componentes Visuais ---

  // Helper para cor da badge
  const getBadgeColor = (p: Priority) => {
    if (p === 'alta') return 'bg-danger';
    if (p === 'media') return 'bg-warning text-dark';
    return 'bg-success';
  };

  return (
    <div className="container py-5">
      <h1 className="text-center mb-5">Gerenciador de Tarefas</h1>

      {/* Formulário de Criação */}
      <div className="card mb-5 shadow-sm">
        <div className="card-header bg-primary text-white">Nova Tarefa</div>
        <div className="card-body">
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Título *</label>
              <input
                type="text"
                className="form-control"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Prioridade</label>
              <select
                className="form-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Data de Término</label>
              <input
                type="date"
                className="form-control"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            <div className="col-12">
              <label className="form-label">Descrição</label>
              <textarea
                className="form-control"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-primary w-100">Adicionar Tarefa</button>
            </div>
          </form>
        </div>
      </div>

      {/* Controles de Ordenação */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>A Fazer ({pendingTasks.length})</h3>
        <div className="btn-group">
          <button 
            className={`btn btn-outline-secondary ${sortBy === 'priority' ? 'active' : ''}`}
            onClick={() => setSortBy('priority')}
          >
            Ordenar por Prioridade
          </button>
          <button 
            className={`btn btn-outline-secondary ${sortBy === 'date' ? 'active' : ''}`}
            onClick={() => setSortBy('date')}
          >
            Ordenar por Data
          </button>
        </div>
      </div>

      {/* Lista de Pendentes */}
      <div className="list-group mb-5">
        {pendingTasks.length === 0 && !loading && <div className="text-muted text-center">Nenhuma tarefa pendente.</div>}
        
        {pendingTasks.map((task) => (
          <div key={task.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
            <div>
              <div className="d-flex align-items-center gap-2">
                <input 
                  type="checkbox" 
                  className="form-check-input mt-0"
                  checked={task.isCompleted}
                  onChange={() => toggleComplete(task)}
                />
                <h5 className="mb-0">{task.title}</h5>
                <span className={`badge ${getBadgeColor(task.priority)}`}>{task.priority}</span>
              </div>
              <p className="mb-1 text-muted small">{task.description}</p>
              {task.dueDate && (
                <small className="text-danger">
                  Prazo: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                </small>
              )}
            </div>
            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteTask(task.id)}>Excluir</button>
          </div>
        ))}
      </div>

      {/* Lista de Concluídas */}
      <h3 className="text-muted">Concluídas ({completedTasks.length})</h3>
      <div className="list-group">
        {completedTasks.map((task) => (
          <div key={task.id} className="list-group-item list-group-item-light d-flex justify-content-between align-items-center opacity-75">
            <div>
              <div className="d-flex align-items-center gap-2">
                <input 
                  type="checkbox" 
                  className="form-check-input mt-0"
                  checked={task.isCompleted}
                  onChange={() => toggleComplete(task)}
                />
                <h5 className="mb-0 text-decoration-line-through">{task.title}</h5>
                <span className="badge bg-secondary">{task.priority}</span>
              </div>
            </div>
            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteTask(task.id)}>Excluir</button>
          </div>
        ))}
      </div>
    </div>
  );
}