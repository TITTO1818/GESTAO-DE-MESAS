import { useState, useEffect, useRef, useCallback } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase.ts';
import { WaitlistItem } from '../types.ts';

const STORAGE_KEY = 'el_cardal_waitlist_v2';

export function useRealtimeWaitlist() {
  const [items, setItems] = useState<WaitlistItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return [];
  });

  const itemsRef = useRef<WaitlistItem[]>(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Sync to local storage for offline resiliency
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  // Real-time synchronization with Firestore collection 'waitlist'
  useEffect(() => {
    const waitlistCollection = collection(db, 'waitlist');

    const unsubscribe = onSnapshot(
      waitlistCollection,
      (snapshot) => {
        const loadedItems: WaitlistItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && typeof data.name === 'string' && typeof data.places === 'number') {
            loadedItems.push({
              id: docSnap.id,
              name: data.name,
              places: data.places,
              completed: !!data.completed,
              order: typeof data.order === 'number' ? data.order : 0,
              completedAt: typeof data.completedAt === 'number' ? data.completedAt : null,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            });
          }
        });

        itemsRef.current = loadedItems;
        setItems(loadedItems);
      },
      (error) => {
        console.error('Erro na escuta em tempo real da fila de espera:', error);
        try {
          handleFirestoreError(error, OperationType.GET, 'waitlist');
        } catch {
          // Handled
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // Add new person to waitlist
  const addItem = useCallback(async (name: string, places: number) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const validPlaces = Math.max(1, Math.min(50, Math.floor(places) || 1));
    const now = Date.now();
    const id = `w_${now}_${Math.random().toString(36).substring(2, 7)}`;

    const newItem: WaitlistItem = {
      id,
      name: trimmedName,
      places: validPlaces,
      completed: false,
      order: now,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistic local update
    itemsRef.current = [newItem, ...itemsRef.current];
    setItems([...itemsRef.current]);

    // Persist to Firestore
    try {
      await setDoc(doc(db, 'waitlist', id), newItem);
    } catch (err) {
      console.error('Erro ao adicionar na fila de espera:', err);
      try {
        handleFirestoreError(err, OperationType.WRITE, `waitlist/${id}`);
      } catch {
        // Handled
      }
    }
  }, []);

  // Toggle item in checklist:
  // - If marked completed: moves to end of list, text strikethrough/lighter tone.
  // - If unmarked: moves back to the top of the pending list!
  const toggleItem = useCallback(async (id: string) => {
    const target = itemsRef.current.find((it) => it.id === id);
    if (!target) return;

    const nextCompleted = !target.completed;
    const now = Date.now();

    // When unmarking, assign highest order so it jumps right to the top of pending
    const nextOrder = nextCompleted ? target.order : now;
    const nextCompletedAt = nextCompleted ? now : null;

    const updatedItem: WaitlistItem = {
      ...target,
      completed: nextCompleted,
      order: nextOrder,
      completedAt: nextCompletedAt,
      updatedAt: new Date().toISOString(),
    };

    // Optimistic local update
    itemsRef.current = itemsRef.current.map((it) => (it.id === id ? updatedItem : it));
    setItems([...itemsRef.current]);

    // Persist to Firestore
    try {
      await setDoc(doc(db, 'waitlist', id), updatedItem, { merge: true });
    } catch (err) {
      console.error(`Erro ao atualizar item ${id} na fila de espera:`, err);
      try {
        handleFirestoreError(err, OperationType.WRITE, `waitlist/${id}`);
      } catch {
        // Handled
      }
    }
  }, []);

  // Delete a single item
  const deleteItem = useCallback(async (id: string) => {
    itemsRef.current = itemsRef.current.filter((it) => it.id !== id);
    setItems([...itemsRef.current]);

    try {
      await deleteDoc(doc(db, 'waitlist', id));
    } catch (err) {
      console.error(`Erro ao deletar item ${id} na fila de espera:`, err);
      try {
        handleFirestoreError(err, OperationType.DELETE, `waitlist/${id}`);
      } catch {
        // Handled
      }
    }
  }, []);

  // Clear all completed items
  const clearCompleted = useCallback(async () => {
    const completedItems = itemsRef.current.filter((it) => it.completed);
    if (completedItems.length === 0) return;

    itemsRef.current = itemsRef.current.filter((it) => !it.completed);
    setItems([...itemsRef.current]);

    try {
      const batch = writeBatch(db);
      completedItems.forEach((it) => {
        batch.delete(doc(db, 'waitlist', it.id));
      });
      await batch.commit();
    } catch (err) {
      console.error('Erro ao limpar itens concluídos da fila:', err);
      try {
        handleFirestoreError(err, OperationType.DELETE, 'waitlist');
      } catch {
        // Handled
      }
    }
  }, []);

  // Sorted items list:
  // 1. Pending items (completed === false) sorted by order descending (newest / just-unmarked at the very top!)
  // 2. Completed items (completed === true) sorted by completedAt ascending at the end
  const sortedItems = [...items].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1; // Incompleted first, completed at the bottom
    }
    if (!a.completed) {
      // Pending: newest order first (top of pending)
      return (b.order || 0) - (a.order || 0);
    }
    // Completed: at the bottom
    return (a.completedAt || 0) - (b.completedAt || 0);
  });

  return {
    items: sortedItems,
    addItem,
    toggleItem,
    deleteItem,
    clearCompleted,
  };
}
