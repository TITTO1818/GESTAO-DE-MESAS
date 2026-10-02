import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { generateInitialTables } from './src/data/tablesConfig.ts';
import { TableData } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const STATE_FILE_PATH = path.resolve(__dirname, 'tables-state.json');

// Server-authoritative in-memory state
let tables: TableData[] = [];

// Load existing state from disk or initialize
function loadInitialState(): TableData[] {
  const defaults = generateInitialTables();
  if (fs.existsSync(STATE_FILE_PATH)) {
    try {
      const data = fs.readFileSync(STATE_FILE_PATH, 'utf-8');
      const saved: TableData[] = JSON.parse(data);
      if (Array.isArray(saved) && saved.length > 0) {
        return defaults.map((def) => {
          const found = saved.find((p) => p.id === def.id);
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
    } catch (err) {
      console.error('Erro ao carregar tables-state.json:', err);
    }
  }
  return defaults;
}

function saveStateToDisk() {
  try {
    fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(tables, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao salvar tables-state.json:', err);
  }
}

tables = loadInitialState();

const app = express();
app.use(express.json());

const server = http.createServer(app);

// WebSocket Server attached to the same HTTP server
const wss = new WebSocketServer({ server, path: '/ws' });

function broadcast(data: object) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function broadcastPresence() {
  broadcast({
    type: 'presence',
    connectedClients: wss.clients.size,
  });
}

wss.on('connection', (ws: WebSocket) => {
  // Send current state to newly connected client
  ws.send(
    JSON.stringify({
      type: 'init',
      tables,
      connectedClients: wss.clients.size,
    })
  );

  // Notify everyone of updated presence
  broadcastPresence();

  ws.on('message', (messageBuffer) => {
    try {
      const payload = JSON.parse(messageBuffer.toString());

      if (payload.type === 'table:toggle' && typeof payload.id === 'number') {
        const tableIndex = tables.findIndex((t) => t.id === payload.id);
        if (tableIndex !== -1) {
          const current = tables[tableIndex];
          const nextOccupied =
            typeof payload.isOccupied === 'boolean'
              ? payload.isOccupied
              : !current.isOccupied;
          const nextOccupiedAt =
            typeof payload.occupiedAt !== 'undefined'
              ? payload.occupiedAt
              : nextOccupied
              ? Date.now()
              : null;

          const updatedTable: TableData = {
            ...current,
            isOccupied: nextOccupied,
            occupiedAt: nextOccupiedAt,
          };
          tables[tableIndex] = updatedTable;
          saveStateToDisk();

          // Broadcast to ALL clients
          broadcast({
            type: 'table:updated',
            table: updatedTable,
          });
        }
      } else if (payload.type === 'table:note' && typeof payload.id === 'number') {
        const tableIndex = tables.findIndex((t) => t.id === payload.id);
        if (tableIndex !== -1) {
          const updatedTable: TableData = {
            ...tables[tableIndex],
            note: String(payload.note || ''),
          };
          tables[tableIndex] = updatedTable;
          saveStateToDisk();

          broadcast({
            type: 'table:updated',
            table: updatedTable,
          });
        }
      } else if (payload.type === 'tables:reset') {
        tables = tables.map((t) => ({
          ...t,
          isOccupied: false,
          occupiedAt: null,
        }));
        saveStateToDisk();

        broadcast({
          type: 'tables:reset',
          tables,
        });
      }
    } catch (err) {
      console.error('Erro ao processar mensagem do WebSocket:', err);
    }
  });

  ws.on('close', () => {
    broadcastPresence();
  });

  ws.on('error', (err) => {
    console.error('WebSocket client error:', err);
  });
});

// REST API routes for fallback and health check
app.get('/api/tables', (_req, res) => {
  res.json({
    tables,
    connectedClients: wss.clients.size,
  });
});

app.post('/api/tables/:id/toggle', (req, res) => {
  const id = Number(req.params.id);
  const tableIndex = tables.findIndex((t) => t.id === id);
  if (tableIndex === -1) {
    res.status(404).json({ error: 'Mesa não encontrada' });
    return;
  }

  const current = tables[tableIndex];
  const nextOccupied = !current.isOccupied;
  const updatedTable: TableData = {
    ...current,
    isOccupied: nextOccupied,
    occupiedAt: nextOccupied ? Date.now() : null,
  };
  tables[tableIndex] = updatedTable;
  saveStateToDisk();

  broadcast({
    type: 'table:updated',
    table: updatedTable,
  });

  res.json({ success: true, table: updatedTable });
});

app.post('/api/tables/:id/note', (req, res) => {
  const id = Number(req.params.id);
  const tableIndex = tables.findIndex((t) => t.id === id);
  if (tableIndex === -1) {
    res.status(404).json({ error: 'Mesa não encontrada' });
    return;
  }

  const updatedTable: TableData = {
    ...tables[tableIndex],
    note: String(req.body.note || ''),
  };
  tables[tableIndex] = updatedTable;
  saveStateToDisk();

  broadcast({
    type: 'table:updated',
    table: updatedTable,
  });

  res.json({ success: true, table: updatedTable });
});

app.post('/api/tables/reset', (_req, res) => {
  tables = tables.map((t) => ({
    ...t,
    isOccupied: false,
    occupiedAt: null,
  }));
  saveStateToDisk();

  broadcast({
    type: 'tables:reset',
    tables,
  });

  res.json({ success: true, tables });
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor El Cardal rodando na porta ${PORT} (${isDev ? 'Dev' : 'Prod'})`);
  });
}

startServer().catch((err) => {
  console.error('Falha ao iniciar servidor:', err);
  process.exit(1);
});
