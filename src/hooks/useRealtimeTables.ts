import { useState, useEffect, useRef, useCallback } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase.ts';
import { TableData } from '../types.ts';
import { generateInitialTables } from '../data/tablesConfig.ts';
import { playToggleSound } from '../utils/sound.ts';

const STORAGE_KEY = 'gestao_de_mesas_v2';
const SOUND_KEY = 'gestao_de_mesas_sound';

export function useRealtimeTables() {
  const [tables, setTables] = useState<TableData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const defaults = generateInitialTables();
        return defaults.map((def) => {
          const found = parsed.find((p: TableData) => p.id === def.id);
          return found
            ? {
                ...def,
                isOccupied: !!found.isOccupied,
                occupiedAt: found.occupiedAt || null,
                note: found.note || '',
              }
            : def;
        });
      }
    } catch {
      // fallback
    }
    return generateInitialTables();
  });

  // Maintain a synchronous ref to tables to prevent race conditions during rapid taps
  const tablesRef = useRef<TableData[]>(tables);
  useEffect(() => {
    tablesRef.current = tables;
  }, [tables]);

  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [connectedClients, setConnectedClients] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SOUND_KEY);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const wsRef = useRef<WebSocket | null>(null);
  const isSeedingRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tables));
    } catch {
      // ignore
    }
  }, [tables]);

  // Seed initial tables to Firestore if database collection is empty
  const seedTablesIfEmpty = useCallback(async () => {
    if (isSeedingRef.current) return;
    isSeedingRef.current = true;
    try {
      const initialList = generateInitialTables();
      const batch = writeBatch(db);
      initialList.forEach((t) => {
        const tableRef = doc(db, 'tables', String(t.id));
        batch.set(tableRef, {
          id: t.id,
          chairs: t.chairs,
          isOccupied: false,
          occupiedAt: null,
          note: '',
          updatedAt: new Date().toISOString(),
        });
      });
      await batch.commit();
      console.log('Coleção de mesas inicializada no Firestore com sucesso.');
    } catch (err) {
      console.error('Erro ao inicializar mesas no Firestore:', err);
    } finally {
      isSeedingRef.current = false;
    }
  }, []);

  // 1. Primary Real-Time Sync: Firebase Firestore onSnapshot
  useEffect(() => {
    isMountedRef.current = true;
    const tablesCollection = collection(db, 'tables');

    const unsubscribe = onSnapshot(
      tablesCollection,
      (snapshot) => {
        if (!isMountedRef.current) return;

        if (snapshot.empty) {
          // If Firestore collection is empty, seed it
          seedTablesIfEmpty();
          return;
        }

        const defaults = generateInitialTables();
        const firestoreMap = new Map<number, TableData>();

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && typeof data.id === 'number') {
            firestoreMap.set(data.id, {
              id: data.id,
              chairs: typeof data.chairs === 'number' ? data.chairs : 4,
              isOccupied: !!data.isOccupied,
              occupiedAt: typeof data.occupiedAt === 'number' ? data.occupiedAt : null,
              note: typeof data.note === 'string' ? data.note : '',
            });
          }
        });

        // Merge Firestore records with default configuration
        const mergedTables = defaults.map((def) => {
          const fromDb = firestoreMap.get(def.id);
          return fromDb
            ? {
                ...def,
                isOccupied: fromDb.isOccupied,
                occupiedAt: fromDb.occupiedAt,
                note: fromDb.note || '',
              }
            : def;
        });

        tablesRef.current = mergedTables;
        setTables(mergedTables);
        setIsConnected(true);
      },
      (error) => {
        console.error('Erro na escuta em tempo real do Firestore:', error);
        setIsConnected(false);
        try {
          handleFirestoreError(error, OperationType.GET, 'tables');
        } catch {
          // Handled and logged according to skill
        }
      }
    );

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, [seedTablesIfEmpty]);

  // 2. Secondary Sync: WebSockets for presence count and instant sub-millisecond local network broadcast
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;

    function connectWs() {
      try {
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (typeof data.connectedClients === 'number') {
              setConnectedClients(data.connectedClients);
            }
            if (data.type === 'table:updated' && data.table) {
              const updated: TableData = data.table;
              tablesRef.current = tablesRef.current.map((t) =>
                t.id === updated.id ? { ...t, ...updated } : t
              );
              setTables([...tablesRef.current]);
            } else if (data.type === 'tables:reset' && Array.isArray(data.tables)) {
              tablesRef.current = data.tables;
              setTables(data.tables);
            }
          } catch {
            // ignore
          }
        };

        ws.onclose = () => {
          reconnectTimer = setTimeout(connectWs, 3000);
        };

        ws.onerror = () => {
          ws?.close();
        };
      } catch {
        reconnectTimer = setTimeout(connectWs, 3000);
      }
    }

    connectWs();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, []);

  // Toggle single table status in Firestore
  const toggleTable = useCallback(
    async (id: number) => {
      // 1. Read directly from synchronous ref so multiple tables can be toggled without race conditions
      const current = tablesRef.current.find((t) => t.id === id);
      if (!current) return;

      const nextStatus = !current.isOccupied;
      const nextOccupiedAt = nextStatus ? Date.now() : null;

      // 2. Update ref and local state immediately (0ms visual latency)
      tablesRef.current = tablesRef.current.map((t) =>
        t.id === id
          ? {
              ...t,
              isOccupied: nextStatus,
              occupiedAt: nextOccupiedAt,
            }
          : t
      );
      setTables([...tablesRef.current]);

      // 3. Audio feedback
      playToggleSound(nextStatus, soundEnabled);

      // 4. Broadcast via WebSocket if available
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(
            JSON.stringify({
              type: 'table:toggle',
              id,
              isOccupied: nextStatus,
              occupiedAt: nextOccupiedAt,
            })
          );
        } catch {
          // ignore
        }
      }

      // 5. Persist to Firebase Firestore
      const tableRef = doc(db, 'tables', String(id));
      try {
        await setDoc(
          tableRef,
          {
            id: current.id,
            chairs: current.chairs,
            isOccupied: nextStatus,
            occupiedAt: nextOccupiedAt,
            note: current.note || '',
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.error(`Erro ao salvar mesa ${id} no Firestore:`, err);
        try {
          handleFirestoreError(err, OperationType.WRITE, `tables/${id}`);
        } catch {
          // handled
        }
      }
    },
    [soundEnabled]
  );

  // Reset all tables in Firestore
  const resetAllTables = useCallback(async () => {
    // Optimistic local update
    const resetList = tablesRef.current.map((t) => ({
      ...t,
      isOccupied: false,
      occupiedAt: null,
    }));
    tablesRef.current = resetList;
    setTables(resetList);

    // Send via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(
          JSON.stringify({
            type: 'tables:reset',
          })
        );
      } catch {
        // ignore
      }
    }

    // Persist to Firebase Firestore with batch write
    try {
      const batch = writeBatch(db);
      resetList.forEach((t) => {
        const tableRef = doc(db, 'tables', String(t.id));
        batch.set(
          tableRef,
          {
            id: t.id,
            chairs: t.chairs,
            isOccupied: false,
            occupiedAt: null,
            note: t.note || '',
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      });
      await batch.commit();
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, 'tables');
      } catch {
        // handled
      }
    }
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SOUND_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return {
    tables,
    isConnected,
    connectedClients,
    soundEnabled,
    toggleSound,
    toggleTable,
    resetAllTables,
  };
}
