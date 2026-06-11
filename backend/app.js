import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config({ path: new URL('.env', import.meta.url).pathname });

import authRoutes        from './src/routes/auth.js';
import cardsRoutes       from './src/routes/cards.js';
import runsRoutes        from './src/routes/runs.js';
import usersRoutes       from './src/routes/users.js';
import leaderboardRoutes from './src/routes/leaderboard.js';
import shopRoutes        from './src/routes/shop.js';
import statsRoutes       from './src/routes/stats.js';
import adminRoutes       from './src/routes/admin.js';

const app  = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.use('/auth',        authRoutes);
app.use('/cards',       cardsRoutes);
app.use('/runs',        runsRoutes);
app.use('/users',       usersRoutes);
app.use('/leaderboard', leaderboardRoutes);
app.use('/shop',        shopRoutes);
app.use('/stats',       statsRoutes);
app.use('/admin',       adminRoutes);

app.listen(PORT, () => console.log(`Dimension Deck API running on port ${PORT}`));
