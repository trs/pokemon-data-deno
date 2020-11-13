import {allowCors} from '../_cors.ts';
import {DATA_PATH} from '../_const.ts';

interface PokedexEntry {
  id: number;
  image: string;
  name: string;
  types: string[];
}

export default allowCors(async (headers, req) => {
  headers.set('Content-Type', 'application/json; charset=utf8');
  headers.set('Cache-Control', 'max-age=0, s-maxage=86400');

  try {
    const pokedex: PokedexEntry[] = [];
    for await (const {name} of Deno.readDir(DATA_PATH)) {
      const pokemon = JSON.parse(await Deno.readTextFile(`${DATA_PATH}/${name}`));
      pokedex.push({
        id: pokemon.id,
        image: pokemon.image,
        name: pokemon.name,
        types: pokemon.types
      });
    }

    req.respond({
      status: 200,
      body: JSON.stringify(pokedex),
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
