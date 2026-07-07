import { query } from './connection.js';
import {
  col,
  expandUnique,
  fromDb,
  limitSql,
  model,
  orderSql,
  toDb,
  whereSql,
} from './sql.js';

export function createModel(modelName) {
  const meta = model(modelName);
  return {
    async findMany({ where, skip, take, orderBy, include, select } = {}) {
      const params = [];
      const sql = [
        `SELECT * FROM \`${meta.table}\``,
        `WHERE ${whereSql(meta, where, params)}`,
        orderSql(meta, orderBy),
        limitSql(take, 'LIMIT'),
        limitSql(skip, 'OFFSET'),
      ].filter(Boolean).join(' ');
      const rows = await query(sql, params);
      const records = rows.map((row) => fromDb(meta, row));
      await attachIncludes(modelName, records, include || select);
      return records.map((record) => applySelect(record, select));
    },

    async findFirst(args = {}) {
      const rows = await this.findMany({ ...args, take: 1 });
      return rows[0] || null;
    },

    async findUnique({ where, include, select }) {
      return this.findFirst({ where: expandUnique(meta, where), include, select });
    },

    async count({ where } = {}) {
      const params = [];
      const rows = await query(
        `SELECT COUNT(*) AS count FROM \`${meta.table}\` WHERE ${whereSql(meta, where, params)}`,
        params,
      );
      return rows[0].count;
    },

    async create({ data, include, select }) {
      const row = toDb(meta, { ...data, updatedAt: data.updatedAt ?? new Date() });
      const columns = Object.keys(row);
      const values = Object.values(row);
      const sql = `INSERT INTO \`${meta.table}\` (${columns.map((c) => `\`${c}\``).join(',')}) VALUES (${columns.map(() => '?').join(',')})`;
      const result = await query(sql, values);
      return this.findUnique({ where: { id: result.insertId }, include, select });
    },

    async update({ where, data, include, select }) {
      const params = [];
      const sets = updateAssignments(meta, data, params);
      const whereParams = [];
      await query(
        `UPDATE \`${meta.table}\` SET ${sets.join(', ')} WHERE ${whereSql(meta, expandUnique(meta, where), whereParams)}`,
        [...params, ...whereParams],
      );
      return this.findUnique({ where: expandUnique(meta, where), include, select });
    },

    async updateMany({ where, data }) {
      const params = [];
      const sets = Object.entries(toDb(meta, data)).map(([column, value]) => {
        params.push(value);
        return `\`${column}\` = ?`;
      });
      const whereParams = [];
      const result = await query(
        `UPDATE \`${meta.table}\` SET ${sets.join(', ')} WHERE ${whereSql(meta, where, whereParams)}`,
        [...params, ...whereParams],
      );
      return { count: result.affectedRows };
    },

    async delete({ where }) {
      const existing = await this.findUnique({ where });
      const params = [];
      await query(`DELETE FROM \`${meta.table}\` WHERE ${whereSql(meta, expandUnique(meta, where), params)}`, params);
      return existing;
    },

    async deleteMany({ where } = {}) {
      const params = [];
      const result = await query(`DELETE FROM \`${meta.table}\` WHERE ${whereSql(meta, where, params)}`, params);
      return { count: result.affectedRows };
    },

    async aggregate(args = {}) {
      const fields = Object.keys(args._sum || {});
      const rows = await query(`SELECT ${fields.map((f) => `SUM(${col(meta, f)}) AS \`${f}\``).join(', ')} FROM \`${meta.table}\``);
      return { _sum: Object.fromEntries(fields.map((f) => [f, rows[0][f]])) };
    },

    async groupBy({ by, where, _sum, _avg, _count, orderBy, take }) {
      const params = [];
      const selects = groupSelects(meta, by, { _sum, _avg, _count });
      let sql = `SELECT ${selects.join(', ')} FROM \`${meta.table}\` WHERE ${whereSql(meta, where, params)} GROUP BY ${by.map((f) => col(meta, f)).join(', ')}`;
      if (orderBy) sql += ` ${orderSql(meta, orderBy)}`;
      sql += limitSql(take, 'LIMIT');
      const rows = await query(sql, params);
      return rows.map((row) => groupRow(meta, by, row, { _sum, _avg, _count }));
    },
  };
}

function updateAssignments(meta, data, params) {
  const sets = [];
  for (const [key, value] of Object.entries(data)) {
    if (!meta.fields[key]) continue;
    if (value && typeof value === 'object' && 'increment' in value) {
      sets.push(`${col(meta, key)} = ${col(meta, key)} + ?`);
      params.push(value.increment);
    } else {
      sets.push(`${col(meta, key)} = ?`);
      params.push(meta.json?.includes(key) ? JSON.stringify(value) : value);
    }
  }
  if (meta.fields.updatedAt && !('updatedAt' in data)) {
    sets.push(`${col(meta, 'updatedAt')} = NOW(3)`);
  }
  return sets;
}

async function attachIncludes(modelName, records, include) {
  if (!include || records.length === 0) return records;
  const meta = model(modelName);
  await Promise.all(Object.entries(include).map(async ([key, options]) => {
    if (key === '_count') {
      await attachCounts(meta, records, options.select || {});
      return;
    }
    const rel = meta.relations?.[key];
    if (!rel) return;
    const relApi = createModel(rel.model);
    await Promise.all(records.map(async (record) => {
      const nestedInclude = options === true ? undefined : options.include;
      const nestedSelect = options === true ? undefined : options.select;
      const where = { [rel.foreign]: record[rel.local] };
      record[key] = rel.many
        ? await relApi.findMany({ where, include: nestedInclude, select: nestedSelect })
        : await relApi.findFirst({ where, include: nestedInclude, select: nestedSelect });
    }));
  }));
  return records;
}

async function attachCounts(meta, records, select) {
  await Promise.all(records.map(async (record) => {
    record._count = {};
    await Promise.all(Object.keys(select).map(async (relName) => {
      const rel = meta.relations?.[relName];
      if (!rel) return;
      const relMeta = model(rel.model);
      const rows = await query(
        `SELECT COUNT(*) AS count FROM \`${relMeta.table}\` WHERE ${col(relMeta, rel.foreign)} = ?`,
        [record[rel.local]],
      );
      record._count[relName] = rows[0].count;
    }));
  }));
}

function applySelect(record, select) {
  if (!select || !record) return record;
  const out = {};
  for (const [key, enabled] of Object.entries(select)) {
    if (enabled === true) out[key] = record[key];
    else if (record[key] !== undefined) out[key] = record[key];
  }
  return out;
}

function groupSelects(meta, by, { _sum, _avg, _count }) {
  const selects = by.map((f) => col(meta, f));
  if (_sum) Object.keys(_sum).forEach((f) => selects.push(`SUM(${col(meta, f)}) AS sum_${f}`));
  if (_avg) Object.keys(_avg).forEach((f) => selects.push(`AVG(${col(meta, f)}) AS avg_${f}`));
  if (_count) Object.keys(_count).forEach((f) => selects.push(`COUNT(${f === '_all' ? '*' : col(meta, f)}) AS count_${f}`));
  return selects;
}

function groupRow(meta, by, row, { _sum, _avg, _count }) {
  return {
    ...Object.fromEntries(by.map((f) => [f, row[meta.fields[f]]])),
    _sum: Object.fromEntries(Object.keys(_sum || {}).map((f) => [f, row[`sum_${f}`]])),
    _avg: Object.fromEntries(Object.keys(_avg || {}).map((f) => [f, row[`avg_${f}`]])),
    _count: Object.fromEntries(Object.keys(_count || {}).map((f) => [f, row[`count_${f}`]])),
  };
}
