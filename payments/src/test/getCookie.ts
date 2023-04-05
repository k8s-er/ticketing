import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const getCookie = async (id?: string) => {
  // build a JWT payload, {id, email}
  const payload = {
    id: id ?? new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
  };

  // create JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // create session object => {jwt: MY_JWT}
  const session = { jwt: token };

  // turn that session into json
  const sessionJSON = JSON.stringify(session);

  // take json and encode it in base64
  const base64 =
    Buffer.from(sessionJSON).toString('base64');

  // return a string thats a cookie with cookie env
  return [`session=${base64}`];
};

export default getCookie;
