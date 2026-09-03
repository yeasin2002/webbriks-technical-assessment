export interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  order: number;
}

export interface Column {
  id: string;
  name: string;
  order: number;
}

export interface BoardMember {
  id: string;
  email: string;
  name?: string;
  role: "OWNER" | "COLLABORATOR";
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  ownerId: string;
  members: BoardMember[];
  columns: Column[];
}
