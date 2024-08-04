import { Request } from 'express';

export const getFullURL = (request: Request) => {
  const path = request.originalUrl.endsWith('/')
    ? request.originalUrl.slice(0, -1)
    : request.originalUrl;
  return `${request.protocol}://${request.get('Host')}${path}`;
};
