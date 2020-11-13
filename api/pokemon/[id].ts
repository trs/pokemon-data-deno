import { ServerRequest } from 'https://deno.land/std@0.77.0/http/mod.ts';

import {DATA_PATH} from '../_const.ts';

export default async (req: ServerRequest) => {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json; charset=utf8');
  headers.set('Cache-Control', 'max-age=0, s-maxage=86400');

  try {
    const params = new URLSearchParams(req.url.split('?')?.[1] ?? '');
    const id = params.get('id');
    if (!id) {
      req.respond({
        status: 400,
        body: JSON.stringify({message: 'Missing ID parameter'})
      });
      return;
    }

    const pokemonFilePath = `${DATA_PATH}/${id}.json`;
    console.log(pokemonFilePath)

    const exists = await Deno.stat(pokemonFilePath)
      .then((info) => info.isFile)
      .catch(() => false);

    if (!exists) {
      req.respond({
        status: 400,
        body: JSON.stringify({message: `No pokemon with that ID found: ${id}`})
      });
      return;
    }

    const pokemonFile = await Deno.readTextFile(pokemonFilePath);

    req.respond({
      status: 200,
      body: pokemonFile,
      headers
    });
  } catch (err) {
    console.error(err);
    req.respond({
      status: 500,
      body: JSON.stringify(err),
      headers
    });
  }
};
