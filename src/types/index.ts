export interface GigItem {
  id: string;
  label: string;
  categoryId: string;
  checked: boolean;
}

export interface GigCategory {
  id: string;
  name: string;
}

export interface GigChecklist {
  id: string;
  name: string;
  categories: GigCategory[];
  items: GigItem[];
  createdAt: number;
}

export type RootStackParamList = {
  Home: undefined;
  Checklist: { listId: string };
};
