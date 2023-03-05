import { env } from './env'
import { db } from './database'

import crypto from 'node:crypto'
import fastify from 'fastify'

const app = fastify()

app.get('/', async () => {
  const transactions = await db('transactions')
    .insert({
      id: crypto.randomUUID(),
      title: 'Test',
      description: 'Test',
      amount: 100,
    })
    .returning('*')

  return transactions
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log(`Server listening on port ${env.PORT} 🚀`)
  })
