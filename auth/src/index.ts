import 'express-async-errors'

import { json } from 'body-parser'
import express from 'express'
import mongoose from 'mongoose'

import { NotFoundError } from './errors/notFoundError'
import { errorHandler } from './middlewares/errorHandler'
import { currentUserRouter } from './routes/currentUser'
import { signInRouter } from './routes/signin'
import { signOutRouter } from './routes/signout'
import { signUpRouter } from './routes/signup'

const app = express()
app.use(json())

app.use(currentUserRouter)
app.use(signInRouter)
app.use(signOutRouter)
app.use(signUpRouter)

app.all('*', async () => {
  throw new NotFoundError()
})

app.use(errorHandler)

const start = async () => {
  try {
    await mongoose.connect('mongodb://auth-mongo-srv:27017/auth')
    console.log('connected to mongo')
  } catch (error) {
    console.error({
      error,
    })
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000!')
  })
}

start()
