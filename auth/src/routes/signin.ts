import { BadRequestError, validateRequest } from '@hrdev/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { User } from '../models/users';
import { Password } from '../services/password';

const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().notEmpty().withMessage('you must apply the password'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   throw new RequestValidationError(errors.array());
    // }
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }
    const passMatch = await Password.compare(existingUser.password, password);
    if (!passMatch) {
      throw new BadRequestError('Invalid credentials');
    }
    // generate JWT
    const jwtToken = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY!,
    );

    req.session = {
      ...(req.session ? req.session : {}),
      jwt: jwtToken,
    };

    console.log('Logging a user...');

    res.status(201).send(existingUser);
  },
);

router.get('/test', (req, res) => {
  res.send('hi there!');
});

export { router as signInRouter };
