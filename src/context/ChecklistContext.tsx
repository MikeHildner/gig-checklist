import React, { createContext, useContext, useEffect, useState } from 'react';
import { GigChecklist, GigCategory, GigItem } from '../types';
import { loadChecklists, saveChecklists } from '../storage';
import { uuid } from '../utils/uuid';

interface ChecklistContextValue {
  lists: GigChecklist[];
  loading: boolean;
  createList: (name: string) => void;
  deleteList: (listId: string) => void;
  toggleItem: (listId: string, itemId: string) => void;
  addItem: (listId: string, label: string, categoryId: string) => void;
  deleteItem: (listId: string, itemId: string) => void;
  addCategory: (listId: string, name: string) => GigCategory;
  resetSession: (listId: string) => void;
}

const ChecklistContext = createContext<ChecklistContextValue | null>(null);

export function ChecklistProvider({ children }: { children: React.ReactNode }) {
  const [lists, setLists] = useState<GigChecklist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChecklists().then((loaded) => {
      setLists(loaded);
      setLoading(false);
    });
  }, []);

  function update(next: GigChecklist[]) {
    setLists(next);
    saveChecklists(next);
  }

  function createList(name: string) {
    const newList: GigChecklist = {
      id: uuid(),
      name,
      categories: [],
      items: [],
      createdAt: Date.now(),
    };
    update([...lists, newList]);
  }

  function deleteList(listId: string) {
    update(lists.filter((l) => l.id !== listId));
  }

  function toggleItem(listId: string, itemId: string) {
    update(
      lists.map((l) => {
        if (l.id !== listId) return l;
        return {
          ...l,
          items: l.items.map((item) =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
          ),
        };
      })
    );
  }

  function addItem(listId: string, label: string, categoryId: string) {
    const newItem: GigItem = { id: uuid(), label, categoryId, checked: false };
    update(
      lists.map((l) => (l.id !== listId ? l : { ...l, items: [...l.items, newItem] }))
    );
  }

  function deleteItem(listId: string, itemId: string) {
    update(
      lists.map((l) =>
        l.id !== listId ? l : { ...l, items: l.items.filter((i) => i.id !== itemId) }
      )
    );
  }

  function addCategory(listId: string, name: string): GigCategory {
    const cat: GigCategory = { id: uuid(), name };
    update(
      lists.map((l) =>
        l.id !== listId ? l : { ...l, categories: [...l.categories, cat] }
      )
    );
    return cat;
  }

  function resetSession(listId: string) {
    update(
      lists.map((l) =>
        l.id !== listId
          ? l
          : { ...l, items: l.items.map((item) => ({ ...item, checked: false })) }
      )
    );
  }

  return (
    <ChecklistContext.Provider
      value={{ lists, loading, createList, deleteList, toggleItem, addItem, deleteItem, addCategory, resetSession }}
    >
      {children}
    </ChecklistContext.Provider>
  );
}

export function useChecklists(): ChecklistContextValue {
  const ctx = useContext(ChecklistContext);
  if (!ctx) throw new Error('useChecklists must be used within ChecklistProvider');
  return ctx;
}
