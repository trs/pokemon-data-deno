import { snakeCase } from 'https://deno.land/x/case@v2.1.0/mod.ts';

import {API_DIR, IMG_DIR} from '../const.ts';
import { master, assets } from '../src/mod.ts';
import { resolveImageRecord } from "./img/mod.ts";

await Deno.mkdir(API_DIR).catch(() => void 0);
await Deno.mkdir(IMG_DIR).catch(() => void 0);

const gm = await master.getGameMaster();
const textAssets = await assets.getAssetTexts();
const pokemonNamesAssetMap = await assets.getAssetPokemonNames(textAssets);
const pokemonTypeNamesAssetMap = await assets.getAssetPokemonTypeNames(textAssets);

async function generatePokemon(pokemon: master.PokemonMaster) {
  const nameAsset = pokemonNamesAssetMap.get(pokemon.dex);
  const name = nameAsset
    ? nameAsset.name
    : pokemon.uniqueId; // TODO convert into usable name

  const id = snakeCase([pokemon.dex, ...pokemon.forms.map(({code}) => code)].join(' '));

  const types = pokemon.types.map((type) => pokemonTypeNamesAssetMap.get(type)?.name);

  const [imgNormal, gifNormal] = await Promise.all([
    assets.getAssetPokemonIcon(pokemon.assetId, {
      dir: IMG_DIR,
      file: `${id}.png`
    }),
    assets.getAssetPokemonGif(name, pokemon.forms.map(({name}) => name), {
      dir: IMG_DIR,
      file: `${id}.gif`
    })
  ]);

  const [imgShiny, gifShiny] = await Promise.all([
    assets.getAssetPokemonIcon(pokemon.assetId, {
      dir: IMG_DIR,
      file: `${id}_shiny.png`
    }, true),
    assets.getAssetPokemonGif(name, pokemon.forms.map(({name}) => name), {
      dir: IMG_DIR,
      file: `${id}_shiny.gif`
    }, true)
  ]);

  const [normal, shiny, normalAnimated, shinyAnimated] = await Promise.all([
    await resolveImageRecord(imgNormal, 'png'),
    await resolveImageRecord(imgShiny, 'png'),
    await resolveImageRecord(gifNormal, 'gif'),
    await resolveImageRecord(gifShiny, 'gif'),
  ]);

  delete (pokemon as any).templateId;
  delete (pokemon as any).uniqueId;
  delete (pokemon as any).assetId;

  await Deno.writeTextFile(`${API_DIR}/${id}.json`, JSON.stringify({
    id,
    name,
    ...pokemon,
    types,
    images: {
      normal,
      shiny,
      normalAnimated,
      shinyAnimated
    }
  }, null, 2));
}

for await (const pokemon of master.getPokemon(gm)) {
  generatePokemon(pokemon);
}
