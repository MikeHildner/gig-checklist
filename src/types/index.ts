export interface GigItem {
  id: string;
  label: string;
  categoryId: string;
  checked: boolean;
  /** Optional count; absent or 1 means a single item (no badge shown). */
  quantity?: number;
  /** Optional free-text note shown under the label. */
  note?: string;
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
