import { json } from 'body-parser'
import express from 'express'

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

app.listen(3000, () => {
  console.log('Listening on port 3000!!')
})
