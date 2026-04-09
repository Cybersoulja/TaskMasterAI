import type { Context } from 'hono';

export function getToken(c: Context) {
  return c.get('token');
}

export function setToken(c: Context, newToken: any) {
  c.set('token', newToken);
}
