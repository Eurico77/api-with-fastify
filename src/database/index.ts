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

const configTestEnv: Knex.Config = {
  client: 'sqlite3',
  connection: {
    filename: './db/app.db',
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './src/database/migrations',
  },
}

export const db = knex(env.NODE_ENV === 'test' ? configTestEnv : config)
