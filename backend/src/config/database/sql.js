import { ApiError } from '../../utils/ApiError.js';
import { models } from './models.js';

export function model(name) {
  return models[name];
}

export function col(meta, field, alias = '') {
  const column = meta.fields[field];
  if (!column) throw new ApiError(500, `Unknown field ${field} on ${meta.table}`);
  return alias ? `\`${alias}\`.\`${column}\`` : `\`${column}\``;
}

export function toDb(meta, data = {}) {
  const row = {};
  for (const [key, value] of Object.entries(data)) {
    if (!meta.fields[key]) continue;
    if (value && typeof value === 'object' && 'increment' in value) continue;
    row[meta.fields[key]] = meta.json?.includes(key) ? JSON.stringify(value) : value;
  }
  return row;
}

export function fromDb(meta, row) {
  if (!row) return null;
  const out = {};
  for (const [key, column] of Object.entries(meta.fields)) {
    let value = row[column];
    if (meta.json?.includes(key) && typeof value === 'string') {
      try { value = JSON.parse(value); } catch { /* keep raw */ }
    }
    out[key] = value;
  }
  return out;
}

export function whereSql(meta, where = {}, params = [], alias = '') {
  if (!where || Object.keys(where).length === 0) return '1=1';
  const clauses = [];
  for (const [key, value] of Object.entries(where)) {
    if (key === 'AND') {
      clauses.push(`(${value.map((v) => whereSql(meta, v, params, alias)).join(' AND ')})`);
    } else if (key === 'OR') {
      clauses.push(`(${value.map((v) => whereSql(meta, v, params, alias)).join(' OR ')})`);
    } else if (meta.relations?.[key]) {
      clauses.push(relationWhereSql(meta, key, value, params, alias));
    } else {
      appendFieldWhere(meta, key, value, clauses, params, alias);
    }
  }
  return clauses.length ? clauses.join(' AND ') : '1=1';
}

function relationWhereSql(meta, key, value, params, alias) {
  const rel = meta.relations[key];
  const relMeta = model(rel.model);
  const relWhere = whereSql(relMeta, value, params, 'r');
  return `EXISTS (SELECT 1 FROM \`${relMeta.table}\` \`r\` WHERE ${col(relMeta, rel.foreign, 'r')} = ${col(meta, rel.local, alias)} AND ${relWhere})`;
}

function appendFieldWhere(meta, key, value, clauses, params, alias = '') {
  const column = col(meta, key, alias);
  if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
    if ('contains' in value) {
      clauses.push(`${column} LIKE ?`);
      params.push(`%${value.contains}%`);
    } else if ('in' in value) {
      clauses.push(`${column} IN (${value.in.map(() => '?').join(',') || 'NULL'})`);
      params.push(...value.in);
    } else if ('notIn' in value) {
      clauses.push(`${column} NOT IN (${value.notIn.map(() => '?').join(',') || 'NULL'})`);
      params.push(...value.notIn);
    } else if ('not' in value) {
      clauses.push(`${column} <> ?`);
      params.push(value.not);
    } else if ('gte' in value) {
      clauses.push(`${column} >= ?`);
      params.push(value.gte);
    } else if ('lt' in value) {
      clauses.push(`${column} < ?`);
      params.push(value.lt);
    } else if ('array_contains' in value) {
      clauses.push(`JSON_CONTAINS(${column}, JSON_QUOTE(?))`);
      params.push(value.array_contains);
    }
  } else if (value === null) {
    clauses.push(`${column} IS NULL`);
  } else {
    clauses.push(`${column} = ?`);
    params.push(value);
  }
}

export function orderSql(meta, orderBy) {
  if (!orderBy) return '';
  const [key, value] = Object.entries(orderBy)[0];
  if (key === '_sum') {
    const [field, direction] = Object.entries(value)[0];
    return `ORDER BY SUM(${col(meta, field)}) ${direction.toUpperCase()}`;
  }
  return `ORDER BY ${col(meta, key)} ${String(value).toUpperCase()}`;
}

export function expandUnique(meta, where) {
  const [key, value] = Object.entries(where)[0];
  if (meta.unique?.[key]) {
    return Object.fromEntries(meta.unique[key].map((field) => [field, value[field]]));
  }
  return where;
}

export function limitSql(value, keyword) {
  return value === undefined ? '' : ` ${keyword} ${Math.max(0, Number(value) || 0)}`;
}
