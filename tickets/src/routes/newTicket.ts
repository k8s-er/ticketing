import { requireAuth, validateRequest } from '@hrdev/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';

const router = express.Router();

router.post(
  '/api/tickets',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater that 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    res.send(200);
  },
);

export { router as createTicketRouter };