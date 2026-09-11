import pg from 'pg';

export type DbClient = {
  query: <T extends pg.QueryResultRow = pg.QueryResultRow>(
    text: string,
    params?: unknown[],
  ) => Promise<pg.QueryResult<T>>;
  ping: () => Promise<void>;
  close: () => Promise<void>;
};

export const createDbClient = (connectionString: string): DbClient => {
  const pool = new pg.Pool({ connectionString, max: 10 });
  return {
    query: (text, params) => pool.query(text, params),
    ping: async () => {
      await pool.query('SELECT 1');
    },
    close: () => pool.end(),
  };
};
