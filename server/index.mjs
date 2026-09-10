import express from 'express';
import { apiCors } from './middleware/cors.mjs';
import { fabricsRouter } from './routes/fabrics.mjs';
import { quotesRouter } from './routes/quotes.mjs';

const PORT = process.env.PORT || 4000;

const app = express();
app.use(apiCors);
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api', fabricsRouter);
app.use('/api', quotesRouter);

app.use((err, req, res, next) => {
  if (err && /Origin not allowed/.test(err.message)) {
    return res.status(403).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'internal error' });
});

app.listen(PORT, () => {
  console.log(`FLO sourcing API listening on http://localhost:${PORT}`);
});
