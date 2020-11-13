import { ServerRequest } from 'https://deno.land/std@0.77.0/http/mod.ts';

export const allowCors = (fn: (headers: Headers, req: ServerRequest) => Promise<void>) => async (req: ServerRequest) => {
  const headers = new Headers();
  headers.append('Access-Control-Allow-Credentials', 'true');
  headers.append('Access-Control-Allow-Origin', '*');
  headers.append('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  // headers.append(
  //   'Access-Control-Allow-Headers',
  //   'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  // );

  if (req.method === 'OPTIONS') {
    req.respond({
      headers,
      status: 200
    });
    return;
  }

  return await fn(headers, req)
}
