export interface Task {
  id: string;
  title: string;
  description?: string | null;
  columnId: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Column {
  id: string;
  name: string;
  order: number;
  boardId?: string;
  tasks?: Task[];
}

export interface BoardUser {
  id: string;
  email: string;
  name?: string | null;
}

export interface BoardMember {
  id: string;
  boardId: string;
  userId: string;
  user: BoardUser;
  createdAt?: string;
}

export interface BoardListItem {
  id: string;
  title: string;
  description?: string | null;
  ownerId: string;
  isOwner: boolean;
  owner: BoardUser;
  columnCount: number;
  memberCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BoardDetail {
  id: string;
  title: string;
  description?: string | null;
  ownerId: string;
  isOwner: boolean;
  owner: BoardUser;
  members: BoardMember[];
  columns: (Column & { tasks: Task[] })[];
  createdAt?: string;
  updatedAt?: string;
}
