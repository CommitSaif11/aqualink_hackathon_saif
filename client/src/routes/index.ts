import { Router } from 'express';

const router = Router();

// Example API Route
router.get('/status', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Additional Routes
router.get('/example', (req, res) => {
  res.json({ message: 'This is an example endpoint.' });
});

export default router;