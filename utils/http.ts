'use client';
import { useUser } from '@/states/user';
import { refreshToken } from './api';
import { throwError } from './ui';

// refresh token on failure
export async function httpGet(
  url: string,
  retry: boolean = true,
  credentials: boolean = false,
  silent: boolean = false,
  signal?: AbortSignal,
) {
  const headers = createHeaders();
  const getRes = (headers: Headers) =>
    fetch(url, {
      method: 'GET',
      headers: headers,
      credentials: credentials ? 'include' : undefined,
      signal: signal,
    });
  return doGetRes(getRes, headers, retry, silent);
}

export async function httpPost(
  url: string,
  body: any,
  retry: boolean = true,
  json: boolean = true,
  silent: boolean = false,
) {
  const headers = createHeaders();
  if (json) headers.set('Content-Type', 'application/json');
  const getRes = (headers: Headers) =>
    fetch(url, {
      method: 'POST',
      headers: headers,
      body: json ? JSON.stringify(body) : body,
    });
  return doGetRes(getRes, headers, retry, silent);
}

export async function httpPut(
  url: string,
  body: any,
  retry: boolean = true,
  json: boolean = true,
  silent: boolean = false,
) {
  const headers = createHeaders();
  if (json) headers.set('Content-Type', 'application/json');
  const getRes = (headers: Headers) =>
    fetch(url, { method: 'PUT', headers: headers, body: JSON.stringify(body) });

  return doGetRes(getRes, headers, retry, silent);
}

export async function httpDelete(
  url: string,
  body: any,
  retry: boolean = true,
  silent: boolean = false,
) {
  const headers = createHeaders();
  const getRes = (headers: Headers) =>
    fetch(url, { method: 'DELETE', headers: headers, body: JSON.stringify(body) });

  return doGetRes(getRes, headers, retry, silent);
}

export function createHeaders() {
  const accessToken = useUser.getState().accessToken;
  const headers = new Headers();
  if (accessToken.length > 0) headers.set('Authorization', accessToken);
  return headers;
}

export async function preRetry(headers: Headers) {
  const newAccessToken = await refreshToken();
  if (newAccessToken === null || newAccessToken.length === 0) return false;
  headers.set('Authorization', newAccessToken);
  useUser.setState(() => ({ accessToken: newAccessToken }));
  return true;
}

async function doGetRes(
  getRes: (headers: Headers) => Promise<Response>,
  headers: Headers,
  retry: boolean,
  silent?: boolean,
): Promise<Response | undefined> {
  try {
    const res = await getRes(headers);
    // todo: retry only 401
    if (res.status >= 300) throw Error();
    return res;
  } catch (e) {
    if (!retry) {
      // abort 무시
      if (!silent && e instanceof Error && !(e instanceof DOMException) && e.message.length > 0)
        throwError(e.message);
      return;
    }
    if ((await preRetry(headers)) === false) return;
  }
  return await doGetRes(getRes, headers, false);
}
