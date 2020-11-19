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

    const [type1, type2] = id.split(',');

    const combinations = [
      [type1, type2].filter(Boolean),
      [type2, type1].filter(Boolean)
    ];

    let path: string | undefined;
    for (const combination of combinations) {
      const typeFilePath = `${API_TYPES_DIR}/${combination.join(',')}.json`;
      try {
        const exists = await Deno.stat(typeFilePath);
        if (exists.isFile) {
          path = typeFilePath;
          break;
        }
      } catch {
        continue;
      }
    }

    if (!path) {
      req.respond({
        status: 400,
        body: JSON.stringify({message: `No type with that name found: ${id}`})
      });
      return;
    }

    const typeFile = await Deno.readTextFile(path);

    headers.set('Content-Type', 'application/json; charset=utf8');
    headers.set('Cache-Control', 'max-age=0, s-maxage=86400');
    req.respond({
      status: 200,
      body: typeFile,
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
