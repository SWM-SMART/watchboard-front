import { rest } from 'msw';
import { API_BASE_URL } from '../utils/api';

export const handlers = [
  rest.get(`${API_BASE_URL}`, (_, res, ctx) => {
    return res(ctx.status(200));
  }),
];
