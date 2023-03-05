import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

import { db } from '../database'

export async function transactionsRoutes(app: FastifyInstance) {
  app.post('/', async (request, response) => {
    const createTransactionSchema = z.object({
      title: z.string(),
      amount: z.number(),
      description: z.string(),
      type: z.enum(['credit', 'debit']),
    })
    const { amount, title, type, description } = createTransactionSchema.parse(
      request.body,
    )
    await db('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      description,
    })

    response.status(201).send()
  })

  app.get('/', async () => {
    const transactions = await db('transactions').select()
    return {
      transactions,
    }
  })

  app.get('/:id', async (request) => {
    const getTransactionSchema = z.object({
      id: z.string(),
    })
    const { id } = getTransactionSchema.parse(request.params)
    const transaction = await db('transactions').where({ id }).first()

    return {
      transaction,
    }
  })

  app.get('/summary', async () => {
    const summary = await db('transactions')
      .sum('amount', {
        as: 'amount',
      })
      .first()
    return {
      summary,
    }
  })
}
