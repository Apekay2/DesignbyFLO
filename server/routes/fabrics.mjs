import { Router } from 'express';
import { FABRICS, toPublicFabric } from '../data/fabrics.seed.mjs';

export const fabricsRouter = Router();

fabricsRouter.get('/fabrics', (req, res) => {
  res.json(FABRICS.map(toPublicFabric));
});

fabricsRouter.get('/fabrics/:id', (req, res) => {
  const f = FABRICS.find(x => x.id === req.params.id);
  if (!f) return res.status(404).json({ error: 'fabric not found' });
  res.json(toPublicFabric(f));
});

fabricsRouter.get('/fabrics/:id/suppliers', (req, res) => {
  const f = FABRICS.find(x => x.id === req.params.id);
  if (!f) return res.status(404).json({ error: 'fabric not found' });
  res.json(f.sup || []);
});
