import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

import { db } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

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
    let sessionId = request.cookies.sessionId

    // todo: aula utilizando cookies no Fastify revisar

    if (!sessionId) {
      sessionId = randomUUID()
      response.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 365,
      })
    }

    await db('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      description,
      session_id: sessionId,
    })

    response.status(201).send()
  })

  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, response) => {
      const { sessionId } = request.cookies

      const transactions = await db('transactions')
        .where({ session_id: sessionId })
        .select()
      return {
        transactions,
      }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const getTransactionSchema = z.object({
        id: z.string(),
      })
      const { id } = getTransactionSchema.parse(request.params)
      const transaction = await db('transactions')
        .where({ id, session_id: sessionId })
        .first()

      return {
        transaction,
      }
    },
  )

  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies
      const summary = await db('transactions')
        .where({ session_id: sessionId })
        .sum('amount', {
          as: 'amount',
        })
        .first()

      return {
        summary,
      }
    },
  )
}
