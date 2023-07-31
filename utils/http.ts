import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

export async function httpGet(url: string, cookieStore?: ReadonlyRequestCookies) {
  const cookieString = cookieStoreToString(cookieStore);
  return await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json', Cookie: cookieString },
  });
}

export async function httpPost(url: string, body: any, cookieStore?: ReadonlyRequestCookies) {
  const cookieString = cookieStoreToString(cookieStore);
  return await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieString,
    },
    body: JSON.stringify(body),
  });
}

export async function httpDelete(url: string, cookieStore?: ReadonlyRequestCookies) {
  const cookieString = cookieStoreToString(cookieStore);
  return await fetch(url, { method: 'DELETE', headers: { Cookie: cookieString } });
}

function cookieStoreToString(cookieStore: ReadonlyRequestCookies | undefined) {
  if (cookieStore === undefined) return '';
  let cookieString = '';
  for (const cookie of cookieStore.getAll()) {
    cookieString += `${cookie.name}=${cookie.value}; `;
  }
  return cookieString.slice(0, -2);
}
