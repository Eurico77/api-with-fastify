import request from 'supertest'
import { describe, expect, beforeAll, afterAll, it } from 'vitest'
import { app } from '../src/app'

// import { execSync } from 'node:child_process'

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  // beforeEach(() => {
  //   execSync('yarn knex migrate:rollback --all NODE_ENV=test ')
  //   execSync('yarn knex migrate:latest NODE_ENV=test ')
  // })

  it('user can create a new transaction', async () => {
    const response = await request(app.server).post('/transactions').send({
      title: 'Transaction 1',
      amount: 100,
      description: 'Transaction 1 description',
      type: 'credit',
    })

    expect(response.status).toBe(201)
  })

  it('user can list all transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Transaction 1',
        amount: 100,
        description: 'Transaction 1 description',
        type: 'credit',
      })
    const cookie = createTransactionResponse.get('Set-Cookie')

    const listAllTransactions = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookie)
      .expect(200)

    expect(listAllTransactions.body.transactions).toEqual([
      expect.objectContaining({
        title: 'Transaction 1',
        description: 'Transaction 1 description',
      }),
    ])
  })

  it('should be able to get a specific transaction', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Transaction 1',
        amount: 100,
        description: 'Transaction 1 description',
        type: 'credit',
      })

    const cookie = createTransactionResponse.get('Set-Cookie')

    const listAllTransactions = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookie)
      .expect(200)

    const transactionId = listAllTransactions.body.transactions[0].id

    const getTransaction = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookie)
      .expect(200)

    expect(getTransaction.body.transaction).toEqual(
      expect.objectContaining({
        title: 'Transaction 1',
        description: 'Transaction 1 description',
      }),
    )
  })

  it('Should be able to get the summary', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'credit transaction',
        amount: 5000,
        description: 'Transaction 1 description',
        type: 'credit',
      })

    const cookie = createTransactionResponse.get('Set-Cookie')

    await request(app.server).post('/transactions').set('Cookie', cookie).send({
      title: 'debit transaction',
      amount: 2000,
      description: 'Transaction 2 description',
      type: 'debit',
    })

    const getSummary = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookie)
      .expect(200)

    expect(getSummary.body.summary).toEqual(
      expect.objectContaining({
        amount: 3000,
      }),
    )
  })
})
