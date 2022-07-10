import express from 'express';

const router = express.Router();

router.post('/api/users/signin12', (req, res) => {
  res.send('hi there!');
});

router.get('/test', (req, res) => {
  res.send('hi there!');
});

export { router as signInRouter };
