import {allowCors} from '../_cors.ts';
import {API_TYPES_DIR} from '../../const.ts';

export default allowCors(async (headers, req) => {
  try {
    const params = new URLSearchParams(req.url.split('?')?.[1] ?? '');
    const id = params.get('id');
    if (!id) {
      req.respond({
        status: 400,
        body: JSON.stringify({message: 'Missing name parameter'})
      });
      return;
    }

    const typeFilePath = `${API_TYPES_DIR}/${id}.json`;

    const exists = await Deno.stat(typeFilePath)
      .then((info) => info.isFile)
      .catch(() => false);

    if (!exists) {
      req.respond({
        status: 400,
        body: JSON.stringify({message: `No type with that name found: ${id}`})
      });
      return;
    }

    const pokemonFile = await Deno.readTextFile(typeFilePath);

    headers.set('Content-Type', 'application/json; charset=utf8');
    headers.set('Cache-Control', 'max-age=0, s-maxage=86400');
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
});
