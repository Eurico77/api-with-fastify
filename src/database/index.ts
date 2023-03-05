import { knex, Knex } from 'knex'
import { env } from '../env'

export const config: Knex.Config = {
  client: 'pg',
  connection: env.DATABASE_URL,
  migrations: {
    extension: 'ts',
    directory: './src/database/migrations',
  },
}

export const db = knex(config)
