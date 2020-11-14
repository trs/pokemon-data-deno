import {allowCors} from '../../_cors.ts';
import {IMG_DIR} from '../../../const.ts';

export default allowCors(async (headers, req) => {
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

    const pokemonImagePath = `${IMG_DIR}/${id}.png`;

    const exists = await Deno.stat(pokemonImagePath)
      .then((info) => info.isFile)
      .catch(() => false);

    if (!exists) {
      req.respond({
        status: 400,
        body: JSON.stringify({message: `No pokemon with that ID found: ${id}`})
      });
      return;
    }

    const pokemonImage = await Deno.readFile(pokemonImagePath);

    headers.set('Content-Type', 'image/png; charset=utf8');
    headers.set('Cache-Control', 's-maxage=86400');

    req.respond({
      status: 200,
      body: pokemonImage,
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
