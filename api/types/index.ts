import {allowCors} from '../_cors.ts';
import {API_TYPES_DIR} from '../../const.ts';

export default allowCors(async (headers, req) => {
  try {
    const types = await listTypes();

    headers.set('Content-Type', 'application/json; charset=utf8');
    headers.set('Cache-Control', 'max-age=0, s-maxage=86400');
    req.respond({
      status: 200,
      body: JSON.stringify(types),
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

async function listTypes() {
  const pokedex: any[] = [];
  for await (const {name} of Deno.readDir(API_TYPES_DIR)) {
    const type = JSON.parse(await Deno.readTextFile(`${API_TYPES_DIR}/${name}`));
    pokedex.push({
      type: type.type
    });
  }

  return pokedex.sort((a, b) => a - b);
}
