import { ServerRequest } from 'https://deno.land/std@0.77.0/http/mod.ts';

import {__dirname} from './_utils.ts';

const DATA_PATH = `${__dirname}/data`;

export default async (req: ServerRequest) => {
  try {
    const pokedex: string[] = [];
    for await (const {name} of Deno.readDir(DATA_PATH)) {
      const pokemon = await Deno.readFile(`${DATA_PATH}/${name}`)
      pokedex.push(pokemon.toString());
    }

    req.respond({
      status: 200,
      body: `[${pokedex.join(',')}]`,
      headers: new Headers({'content-type': 'application/json'})
    });
  } catch (err) {
    req.respond({
      status: 500,
      body: JSON.stringify(err)
    });
  }
};
