import { ServerRequest } from 'https://deno.land/std@0.77.0/http/mod.ts';

import type {Pokemon} from '../../mod.ts';
import {DATA_PATH} from '../../src/utils.ts';

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

  try {
    const decoder = new TextDecoder('utf-8');

    const pokedex: PokedexEntry[] = [];
    for await (const {name} of Deno.readDir(DATA_PATH)) {
      const pokemonData = await Deno.readFile(`${DATA_PATH}/${name}`);
      const pokemon = JSON.parse(decoder.decode(pokemonData)) as Pokemon;
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
