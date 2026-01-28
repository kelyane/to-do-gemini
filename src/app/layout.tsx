// src/app/layout.tsx
import 'bootstrap/dist/css/bootstrap.min.css';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gerenciador de Tarefas",
  description: "Lista de tarefas com CRUD e Prioridades",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}