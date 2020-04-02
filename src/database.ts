
import { development, production } from './knexfile';
import * as Knex from 'knex';

const initialize = async (): Promise<Knex>  => {
  const environment: string = process.env.BLOG_DATABASE || 'development'
  const connection = environment === 'production'? production: development
  const knexdb = Knex(connection)
  await knexdb.migrate.latest()
  return knexdb
}
export {
  initialize
};