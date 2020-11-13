import { ServerRequest } from 'https://deno.land/std@0.77.0/http/mod.ts';
import * as path from 'https://deno.land/std@0.77.0/path/mod.ts';

import {DATA_PATH} from '../_const.ts';
import type {Pokemon} from '../../mod.ts';

interface PokedexEntry {
  id: number;
  image: string;
  name: string;
  types: string[];
}

export default async (req: ServerRequest) => {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json; charset=utf8');
  headers.set('Cache-Control', 'max-age=0, s-maxage=86400');

  const dir = path.resolve(DATA_PATH);

  for await (const {name} of Deno.readDir(path.resolve('./api'))) {
    console.log(name)
  }

  console.log('dir', dir);



  try {
    const pokedex: PokedexEntry[] = [];
    for await (const {name} of Deno.readDir(DATA_PATH)) {
      const pokemon = JSON.parse(await Deno.readTextFile(`${DATA_PATH}/${name}`)) as Pokemon;
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
    console.log(err)
    req.respond({
      status: 500,
      body: JSON.stringify(err),
      headers
    });
  }
};
