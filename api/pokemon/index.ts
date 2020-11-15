import {allowCors} from '../_cors.ts';
import {API_DIR} from '../../const.ts';

import type { Pokemon } from "../../src/pokedex.ts";

type PokedexEntry = Pick<Pokemon, 'id' | 'number' | 'forms' | 'image' | 'name'> & {
  types: string[]
}

export default allowCors(async (headers, req) => {
  try {
    const {searchParams} = new URL(req.url, 'https://127.0.0.1/');

    const pokedex = await listPokemon();

    const count = Number(searchParams.get('count') ?? 50);
    const page = Number(searchParams.get('page') ?? 0);
    const start = page * count;
    const end = start + count;

    headers.set('Content-Type', 'application/json; charset=utf8');
    headers.set('Cache-Control', 'max-age=0, s-maxage=86400');
    req.respond({
      status: 200,
      body: JSON.stringify(pokedex.slice(start, end)),
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

async function listPokemon() {
  const pokedex: PokedexEntry[] = [];
  for await (const {name} of Deno.readDir(API_DIR)) {
    const pokemon = JSON.parse(await Deno.readTextFile(`${API_DIR}/${name}`));
    pokedex.push({
      id: pokemon.id,
      number: pokemon.number,
      forms: pokemon.forms,
      image: pokemon.image,
      name: pokemon.name,
      types: pokemon.types.map(({name}: any) => name)
    });
  }

  return pokedex.sort((a, b) => alphanumSort(a.id, b.id));
}

function alphanumSort(a: string, b: string) {
  let aa = a.split(/(\d+)/);
  let bb = b.split(/(\d+)/);

  for(var x = 0; x < Math.max(aa.length, bb.length); x++) {
    if(aa[x] != bb[x]) {
      var cmp1 = (isNaN(parseInt(aa[x],10)))? aa[x] : parseInt(aa[x],10);
      var cmp2 = (isNaN(parseInt(bb[x],10)))? bb[x] : parseInt(bb[x],10);
      if(cmp1 == undefined || cmp2 == undefined)
        return aa.length - bb.length;
      else
        return (cmp1 < cmp2) ? -1 : 1;
    }
  }
  return 0;
}
