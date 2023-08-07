const API_ACCESS_TOKEN = process.env.NEXT_PUBLIC_API_ACCESS_TOKEN || '';

export async function httpGet(url: string) {
  const headers = new Headers({ Accept: 'application/json' });
  headers.set('accessToken', API_ACCESS_TOKEN);
  return await fetch(url, {
    method: 'GET',
    headers: headers,
  });
}

export async function httpPost(url: string, body: any) {
  const headers = new Headers({
    'Content-Type': 'application/json',
  });
  headers.set('accessToken', API_ACCESS_TOKEN);
  return await fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body),
  });
}

export async function httpDelete(url: string) {
  const headers = new Headers();
  headers.set('accessToken', API_ACCESS_TOKEN);
  return await fetch(url, { method: 'DELETE', headers: headers });
}
