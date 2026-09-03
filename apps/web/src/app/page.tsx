import { KanbanBoard } from "@/components/board/kanban-board";

export default function Home() {
  return (
    <main className="h-full w-full overflow-hidden">
      <KanbanBoard />
    </main>
  );
}
