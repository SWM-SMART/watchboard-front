export async function httpGet(url: string) {
  return await fetch(url, { method: 'GET' });
}

export async function httpPost(url: string, body: any) {
  return await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

export async function httpDelete(url: string) {
  return await fetch(url, { method: 'DELETE' });
}
