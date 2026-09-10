import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { FABRICS } from '../data/fabrics.seed.mjs';
import { listQuotes, addQuote } from '../data/store.mjs';

export const quotesRouter = Router();

quotesRouter.get('/quotes', (req, res) => {
  res.json(listQuotes());
});

quotesRouter.post('/quotes', (req, res) => {
  const { fabricId, supplierName, qty, qtyUnit } = req.body || {};
  if (typeof fabricId !== 'string' || typeof supplierName !== 'string' ||
      typeof qty !== 'string' || typeof qtyUnit !== 'string') {
    return res.status(400).json({ error: 'fabricId, supplierName, qty, qtyUnit are required strings' });
  }
  const fabric = FABRICS.find(f => f.id === fabricId);
  if (!fabric) return res.status(404).json({ error: 'fabric not found' });
  const supplier = (fabric.sup || []).find(s => s.n === supplierName);
  if (!supplier) return res.status(404).json({ error: 'supplier not found for this fabric' });

  const quote = {
    id: randomUUID(),
    ts: new Date().toISOString(),
    fabricId,
    fabricName: fabric.name,
    supplierName,
    qty,
    qtyUnit,
    status: 'submitted',
  };
  addQuote(quote);
  res.status(201).json(quote);
});
