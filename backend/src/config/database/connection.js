import { env } from '../env.js';

let poolPromise;

function parseDatabaseUrl(value) {
  const raw = value.replace(/^['"]|['"]$/g, '');
  const prefix = 'mysql://';
  if (!raw.startsWith(prefix)) return { uri: raw };

  const body = raw.slice(prefix.length);
  const at = body.lastIndexOf('@');
  if (at === -1) return { uri: raw };

  const auth = body.slice(0, at);
  const hostPart = body.slice(at + 1);
  const colon = auth.indexOf(':');
  const user = colon === -1 ? auth : auth.slice(0, colon);
  const password = colon === -1 ? '' : auth.slice(colon + 1);
  const slash = hostPart.indexOf('/');
  const hostPort = slash === -1 ? hostPart : hostPart.slice(0, slash);
  const database = slash === -1 ? undefined : hostPart.slice(slash + 1).split('?')[0];
  const [host, port] = hostPort.split(':');

  return {
    host,
    port: port ? Number(port) : 3306,
    user,
    password,
    database,
  };
}

async function getPool() {
  if (!poolPromise) {
    poolPromise = import('mysql2/promise').then(({ default: mysql }) =>
      mysql.createPool({
        ...parseDatabaseUrl(env.databaseUrl),
        waitForConnections: true,
        connectionLimit: 10,
        namedPlaceholders: false,
        dateStrings: false,
      }));
  }
  return poolPromise;
}

export async function query(sql, params = []) {
  const pool = await getPool();
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export async function transaction(work) {
  const pool = await getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const txQuery = async (sql, params = []) => {
      const [rows] = await connection.execute(sql, params);
      return rows;
    };
    const result = await work(txQuery);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function disconnect() {
  if (!poolPromise) return;
  const pool = await poolPromise;
  await pool.end();
  poolPromise = null;
}
