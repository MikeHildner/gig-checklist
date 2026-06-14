import React, { createContext, useContext, useEffect, useState } from 'react';
import { GigChecklist, GigCategory, GigItem } from '../types';
import { loadChecklists, saveChecklists } from '../storage';
import { uuid } from '../utils/uuid';

interface ChecklistContextValue {
  lists: GigChecklist[];
  loading: boolean;
  createList: (name: string) => void;
  renameList: (listId: string, name: string) => void;
  duplicateList: (listId: string) => void;
  deleteList: (listId: string) => void;
  toggleItem: (listId: string, itemId: string) => void;
  addItem: (
    listId: string,
    label: string,
    categoryId: string,
    quantity?: number,
    note?: string
  ) => void;
  updateItem: (
    listId: string,
    itemId: string,
    fields: { label: string; quantity: number; note: string }
  ) => void;
  moveItem: (listId: string, itemId: string, direction: 'up' | 'down') => void;
  moveItemToCategory: (listId: string, itemId: string, categoryId: string) => void;
  deleteItem: (listId: string, itemId: string) => void;
  addCategory: (listId: string, name: string) => GigCategory;
  renameCategory: (listId: string, categoryId: string, name: string) => void;
  deleteCategory: (listId: string, categoryId: string) => void;
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

  function renameList(listId: string, name: string) {
    update(lists.map((l) => (l.id !== listId ? l : { ...l, name })));
  }

  function duplicateList(listId: string) {
    const orig = lists.find((l) => l.id === listId);
    if (!orig) return;
    // Fresh ids throughout; remap each item's categoryId to the cloned category.
    const catIdMap: Record<string, string> = {};
    const categories = orig.categories.map((c) => {
      const id = uuid();
      catIdMap[c.id] = id;
      return { ...c, id };
    });
    const items = orig.items.map((i) => ({
      ...i,
      id: uuid(),
      categoryId: catIdMap[i.categoryId] ?? i.categoryId, // uncategorised items stay "Other"
      checked: false,
    }));
    const copy: GigChecklist = {
      id: uuid(),
      name: `${orig.name} (copy)`,
      categories,
      items,
      createdAt: Date.now(),
    };
    const idx = lists.findIndex((l) => l.id === listId);
    const next = [...lists];
    next.splice(idx + 1, 0, copy); // place the copy right after the original
    update(next);
  }

  function deleteList(listId: string) {
    update(lists.filter((l) => l.id !== listId));
  }

  function toggleItem(listId: string, itemId: string) {
    update(
      lists.map((l) => {
        if (l.id !== listId) return l;
        const items = l.items.map((item) =>
          item.id === itemId ? { ...item, checked: !item.checked } : item
        );
        const fullyPacked = items.length > 0 && items.every((i) => i.checked);
        return { ...l, items, lastPackedAt: fullyPacked ? Date.now() : l.lastPackedAt };
      })
    );
  }

  // Keep stored items lean: a quantity of 1 and an empty note are dropped.
  function normalizeQuantity(quantity?: number): number | undefined {
    return quantity && quantity > 1 ? quantity : undefined;
  }
  function normalizeNote(note?: string): string | undefined {
    const trimmed = note?.trim();
    return trimmed ? trimmed : undefined;
  }

  function addItem(
    listId: string,
    label: string,
    categoryId: string,
    quantity?: number,
    note?: string
  ) {
    const newItem: GigItem = {
      id: uuid(),
      label,
      categoryId,
      checked: false,
      quantity: normalizeQuantity(quantity),
      note: normalizeNote(note),
    };
    update(
      lists.map((l) => (l.id !== listId ? l : { ...l, items: [...l.items, newItem] }))
    );
  }

  function updateItem(
    listId: string,
    itemId: string,
    fields: { label: string; quantity: number; note: string }
  ) {
    update(
      lists.map((l) =>
        l.id !== listId
          ? l
          : {
              ...l,
              items: l.items.map((i) =>
                i.id === itemId
                  ? {
                      ...i,
                      label: fields.label,
                      quantity: normalizeQuantity(fields.quantity),
                      note: normalizeNote(fields.note),
                    }
                  : i
              ),
            }
      )
    );
  }

  // Reorder within a category by swapping with the nearest same-category neighbour.
  function moveItem(listId: string, itemId: string, direction: 'up' | 'down') {
    update(
      lists.map((l) => {
        if (l.id !== listId) return l;
        const items = [...l.items];
        const idx = items.findIndex((i) => i.id === itemId);
        if (idx === -1) return l;
        const catId = items[idx].categoryId;
        let swap = -1;
        if (direction === 'up') {
          for (let j = idx - 1; j >= 0; j--) {
            if (items[j].categoryId === catId) { swap = j; break; }
          }
        } else {
          for (let j = idx + 1; j < items.length; j++) {
            if (items[j].categoryId === catId) { swap = j; break; }
          }
        }
        if (swap === -1) return l; // already first/last in its category
        [items[idx], items[swap]] = [items[swap], items[idx]];
        return { ...l, items };
      })
    );
  }

  // Move an item to another category, placed after that category's last item.
  function moveItemToCategory(listId: string, itemId: string, categoryId: string) {
    update(
      lists.map((l) => {
        if (l.id !== listId) return l;
        const moved = l.items.find((i) => i.id === itemId);
        if (!moved) return l;
        const rest = l.items.filter((i) => i.id !== itemId);
        let insertAt = rest.length;
        for (let j = rest.length - 1; j >= 0; j--) {
          if (rest[j].categoryId === categoryId) { insertAt = j + 1; break; }
        }
        const next = [
          ...rest.slice(0, insertAt),
          { ...moved, categoryId },
          ...rest.slice(insertAt),
        ];
        return { ...l, items: next };
      })
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

  function renameCategory(listId: string, categoryId: string, name: string) {
    update(
      lists.map((l) =>
        l.id !== listId
          ? l
          : {
              ...l,
              categories: l.categories.map((c) =>
                c.id === categoryId ? { ...c, name } : c
              ),
            }
      )
    );
  }

  // Removing a category leaves its items in place; they fall back to the
  // "Other" section (ChecklistScreen renders items whose category is missing).
  function deleteCategory(listId: string, categoryId: string) {
    update(
      lists.map((l) =>
        l.id !== listId
          ? l
          : { ...l, categories: l.categories.filter((c) => c.id !== categoryId) }
      )
    );
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
      value={{
        lists,
        loading,
        createList,
        renameList,
        duplicateList,
        deleteList,
        toggleItem,
        addItem,
        updateItem,
        moveItem,
        moveItemToCategory,
        deleteItem,
        addCategory,
        renameCategory,
        deleteCategory,
        resetSession,
      }}
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
