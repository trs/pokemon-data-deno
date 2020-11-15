import {allowCors} from '../_cors.ts';
import {API_DIR} from '../../const.ts';

import type { Pokemon } from "../../src/pokedex.ts";

type PokedexEntry = Pick<Pokemon, 'id' | 'number' | 'form' | 'image' | 'name'> & {
  types: string[]
}

export default allowCors(async (headers, req) => {
  try {
    const pokedex: PokedexEntry[] = [];
    for await (const {name} of Deno.readDir(API_DIR)) {
      const pokemon = JSON.parse(await Deno.readTextFile(`${API_DIR}/${name}`));
      pokedex.push({
        id: pokemon.id,
        number: pokemon.number,
        form: pokemon.form,
        image: pokemon.image,
        name: pokemon.name,
        types: pokemon.types.map(({name}: any) => name)
      });
    }

    headers.set('Content-Type', 'application/json; charset=utf8');
    headers.set('Cache-Control', 'max-age=0, s-maxage=86400');
    req.respond({
      status: 200,
      // body: JSON.stringify(pokedex.sort((a, b) => a.number - b.number || a.form === null )),
      body: JSON.stringify(pokedex.sort((a, b) => a.id.localeCompare(b.id, 'en', {numeric: true}))),
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
