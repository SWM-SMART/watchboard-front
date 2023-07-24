import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { httpDelete, httpGet, httpPost } from './http';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getDocumentList(
  cookieStore?: ReadonlyRequestCookies,
): Promise<WBDocumentListReponse> {
  return (await httpGet(`${API_BASE_URL}/documents`, cookieStore)).json();
}

export async function getDocument(
  document_id: number,
  cookieStore?: ReadonlyRequestCookies,
): Promise<WBDocumentReponse> {
  return (await httpGet(`${API_BASE_URL}/documents/${document_id}`, cookieStore)).json();
}

export async function createDocument(
  document_name: string,
  cookieStore?: ReadonlyRequestCookies,
): Promise<WBDocumentCreateResponse> {
  return (
    await httpPost(`${API_BASE_URL}/documents`, { document_name: document_name }, cookieStore)
  ).json();
}

export async function deleteDocument(document_id: number, cookieStore?: ReadonlyRequestCookies) {
  await httpDelete(`${API_BASE_URL}/documents/${document_id}`, cookieStore);
}
