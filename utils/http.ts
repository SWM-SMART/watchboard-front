'use client';
import { useUser } from '@/states/user';
import { refreshToken } from './api';
import { throwError } from './ui';

// refresh token on failure
export async function httpGet(url: string, retry: boolean = true) {
  const headers = createHeaders();
  const getRes = (headers: Headers) =>
    fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: headers,
    });

  return doGetRes(getRes, headers, retry);
}

export async function httpPost(url: string, body: any, retry: boolean = true) {
  const headers = createHeaders();
  const getRes = (headers: Headers) =>
    fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: headers,
      body: JSON.stringify(body),
    });

  return doGetRes(getRes, headers, retry);
}

export async function httpDelete(url: string, retry: boolean = true) {
  const headers = createHeaders();
  const getRes = (headers: Headers) =>
    fetch(url, { method: 'DELETE', credentials: 'include', headers: headers });

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
) {
  try {
    return await getRes(headers);
  } catch (e) {
    if (!retry) {
      if (e instanceof Error) throwError(e.message);
      return;
    }
    if ((await preRetry(headers)) === false) return;
  }

  return await getRes(headers);
}
