import { useUser } from '@/states/user';
import { refreshToken } from './api';

// refresh token on failure
export async function httpGet(url: string, retry: boolean = true) {
  const headers = createHeaders();
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: headers,
  });
  if (res.status >= 400 && retry) {
    await preRetry(headers);
    const newres = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: headers,
    });
    return newres;
  }
  return res;
}

export async function httpPost(url: string, body: any, retry: boolean = true) {
  const headers = createHeaders();
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: headers,
    body: JSON.stringify(body),
  });
  if (res.status >= 400 && retry) {
    await preRetry(headers);
    return await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: headers,
      body: JSON.stringify(body),
    });
  }
  return res;
}

export async function httpDelete(url: string, retry: boolean = true) {
  const headers = createHeaders();
  const res = await fetch(url, { method: 'DELETE', credentials: 'include', headers: headers });
  if (res.status >= 400 && retry) {
    await preRetry(headers);
    return await fetch(url, { method: 'DELETE', credentials: 'include', headers: headers });
  }
  return res;
}

function createHeaders() {
  const accessToken = useUser.getState().accessToken;
  const headers = new Headers();
  headers.set('Authorization', accessToken);
  return headers;
}

async function preRetry(headers: Headers) {
  const newAccessToken = (await refreshToken()) || '';
  headers.set('Authorization', newAccessToken);
  useUser.setState((state) => ({ accessToken: newAccessToken }));
}
