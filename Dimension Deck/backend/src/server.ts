import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { pingDatabase, printSchema } from './db';

import authRouter  from './routes/auth';
import runsRouter  from './routes/runs';
import hubRouter   from './routes/hub';
import homeRouter  from './routes/home';
import cardsRouter from './routes/cards';

const app  = express();
const PORT = Number(process.env.PORT ?? 3001);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/auth',  authRouter);
app.use('/runs',  runsRouter);
app.use('/hub',   hubRouter);
app.use('/cards', cardsRouter);
app.use('/',      homeRouter);   // /home, /settings, /statistics, /tutorial/complete

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', async (_req, res) => {
  const db = await pingDatabase();
  res.json({ server: 'ok', db });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ── Boot ──────────────────────────────────────────────────────────────────────
async function start() {
  const { ok, latencyMs } = await pingDatabase();
  if (!ok) {
    console.error('Cannot connect to MySQL — check .env');
    process.exit(1);
  }
  console.log(`DB connected (${latencyMs}ms)`);

  if (process.env.PRINT_SCHEMA === 'true') await printSchema();

  app.listen(PORT, () =>
    console.log(`Dimension Deck API → http://localhost:${PORT}`)
  );
}

start().catch(console.error);
