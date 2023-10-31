'use client';
import { useUser } from '@/states/user';
import { refreshToken } from './api';
import { throwError } from './ui';

// refresh token on failure
export async function httpGet(url: string, retry: boolean = true, credentials: boolean = false) {
  const headers = createHeaders();
  const getRes = (headers: Headers) =>
    fetch(url, {
      method: 'GET',
      headers: headers,
      credentials: credentials ? 'include' : undefined,
    });
  return doGetRes(getRes, headers, retry);
}

export async function httpPost(url: string, body: any, retry: boolean = true) {
  const headers = createHeaders();
  headers.set('Content-Type', 'application/json');
  const getRes = (headers: Headers) =>
    fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });

  return doGetRes(getRes, headers, retry);
}

export async function httpPut(url: string, body: any, retry: boolean = true) {
  const headers = createHeaders();
  const getRes = (headers: Headers) =>
    fetch(url, { method: 'PUT', headers: headers, body: JSON.stringify(body) });

  return doGetRes(getRes, headers, retry);
}

export async function httpDelete(url: string, body: any, retry: boolean = true) {
  const headers = createHeaders();
  const getRes = (headers: Headers) =>
    fetch(url, { method: 'DELETE', headers: headers, body: JSON.stringify(body) });

  return doGetRes(getRes, headers, retry);
}

function createHeaders() {
  const accessToken = useUser.getState().accessToken;
  const headers = new Headers();
  if (accessToken.length > 0) headers.set('Authorization', accessToken);
  return headers;
}

async function preRetry(headers: Headers) {
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
): Promise<Response | undefined> {
  try {
    const res = await getRes(headers);
    if (res.status >= 400) throw Error;
    return res;
  } catch (e) {
    if (e instanceof Error && e.message.length > 0) throwError(e.message);
    if (!retry) return;
    if ((await preRetry(headers)) === false) return;
  }
  return await doGetRes(getRes, headers, false);
}
