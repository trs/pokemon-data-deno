import { paramCase } from 'https://deno.land/x/case@v2.1.0/mod.ts';

import {API_POKEMON_DIR, API_TYPES_DIR, IMG_DIR} from '../const.ts';
import { master, assets } from '../src/mod.ts';
import { resolveImageRecord } from "./img/mod.ts";

await Promise.allSettled([
  Deno.mkdir(API_POKEMON_DIR, {recursive: true}),
  Deno.mkdir(API_TYPES_DIR, {recursive: true}),
  Deno.mkdir(IMG_DIR, {recursive: true})
]);

const gm = await master.getGameMaster();
const textAssets = await assets.getAssetTexts();
const pokemonNamesAssetMap = await assets.getAssetPokemonNames(textAssets);
const pokemonTypeNamesAssetMap = await assets.getAssetPokemonTypeNames(textAssets);

async function generatePokemon(pokemon: master.PokemonMaster) {
  const nameAsset = pokemonNamesAssetMap.get(pokemon.number);
  const name = nameAsset
    ? nameAsset.name
    : pokemon.uniqueId; // TODO convert into usable name

  const id = paramCase([
    pokemon.number,
    ...pokemon.forms.map(({code}) => code).filter((form) => form !== 'normal')
  ].join('-'));

  const types = pokemon.types.map((templateId) => pokemonTypeNamesAssetMap.get(templateId)!.name);

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
    await resolveImageRecord(imgNormal),
    await resolveImageRecord(imgShiny),
    await resolveImageRecord(gifNormal),
    await resolveImageRecord(gifShiny),
  ]);

  delete (pokemon as any).templateId;
  delete (pokemon as any).uniqueId;
  delete (pokemon as any).assetId;

  await Deno.writeTextFile(`${API_POKEMON_DIR}/${id}.json`, JSON.stringify({
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

async function generateDefenderType(type: master.PokemonMasterTypeDefend) {
  const typeNames = type.templateId.map((templateId) => pokemonTypeNamesAssetMap.get(templateId)!.name);
  const defendEffectiveness = type.defendScalar.map((eff) => {
    return {
      types: eff.templateId.map((templateId) => pokemonTypeNamesAssetMap.get(templateId)!.name),
      value: eff.value
    };
  });

  const name = typeNames.join(',').toLocaleLowerCase();

  await Deno.writeTextFile(`${API_TYPES_DIR}/${name}.json`, JSON.stringify({
    types: typeNames,
    defendEffectiveness
  }, null, 2));
}

const promises: Promise<any>[] = [];

for await (const pokemon of master.getPokemon(gm)) {
  promises.push(generatePokemon(pokemon));
}

for (const type of master.getDefenderTypeEffectiveness(gm)) {
  promises.push(generateDefenderType(type));
}

await Promise.all(promises);
