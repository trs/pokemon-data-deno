import {allowCors} from '../_cors.ts';
import {API_DIR} from '../../const.ts';

interface PokedexEntry {
  id: number;
  form: string;
  image: string;
  name: string;
  types: string[];
}

export default allowCors(async (headers, req) => {
  try {
    const pokedex: PokedexEntry[] = [];
    for await (const {name} of Deno.readDir(API_DIR)) {
      const pokemon = JSON.parse(await Deno.readTextFile(`${API_DIR}/${name}`));
      pokedex.push({
        id: pokemon.id,
        form: pokemon.form,
        image: pokemon.image,
        name: pokemon.name,
        types: pokemon.types
      });
    }

    headers.set('Content-Type', 'application/json; charset=utf8');
    headers.set('Cache-Control', 'max-age=0, s-maxage=86400');
    req.respond({
      status: 200,
      body: JSON.stringify(pokedex.sort((a, b) => `${a.id}${a.form}`.localeCompare(`${b.id}${b.form}`, 'en', {numeric: true}))),
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
