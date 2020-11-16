import { download } from "https://deno.land/x/download@v1.0.1/mod.ts";
import * as path from "https://deno.land/std@0.77.0/path/mod.ts";

import { readDimensions } from "./img.ts";

import { getPokedex, getPokemon, getTypes, getFastMoves, getChargeMoves, getGameMaster } from '../mod.ts';
import type { PokemonType, PokemonMove, PokemonMoveCategory, PokemonImage } from '../mod.ts';

import {API_DIR, IMG_DIR} from '../const.ts';
import { PokedexEntry } from "../src/pokedex.ts";

await Deno.mkdir(API_DIR, {recursive: true});

async function mapTypes() {
  const types = new Map<string, PokemonType>();
  for await (const type of getTypes()) {
    types.set(type.name.toLocaleLowerCase(), type);
  }
  return types;
}

async function mapFastMoves() {
  const fastMoves = new Map<string, PokemonMove>();
  for await (const move of getFastMoves()) {
    fastMoves.set(move.name, move);
  }
  return fastMoves;
}

async function mapChargeMoves() {
  const chargeMoves = new Map<string, PokemonMove>();
  for await (const move of getChargeMoves()) {
    chargeMoves.set(move.name, move);
  }
  return chargeMoves;
}

const [gm, typesMap, fastMovesMap, chargeMovesMap] = await Promise.all([
  getGameMaster(),
  mapTypes(),
  mapFastMoves(),
  mapChargeMoves()
]);

// const movesMap = new Map<MoveCategory, Map<string, Move>>([
//   ['fast', fastMovesMap],
//   ['charge', chargeMovesMap]
// ]);

let promises: Promise<void>[] = [];
for await (const entry of getPokedex()) {
   promises.push(buildPokemon(entry));
}
await Promise.all(promises);

async function buildPokemon(entry: PokedexEntry) {
  const pokemon = await getPokemon(entry.number, entry.form?.name ?? null, gm);

  // const moves = pokemon.moves.map((move) => movesMap.get(move.category)?.get(move.name));
  const types = pokemon.types.map((type) => typesMap.get(type));

  const images = await Promise.all(pokemon.images
    .map(async (img) => {
      try {
        const image = await downloadImage(pokemon.id, img);
        return {
          url: `https://raw.githubusercontent.com/trs/pokemon-data-deno/main/public/images/${img.variant}/${image.name}`,
          path: `images/${img.variant}/${image.name}`,
          type: img.type,
          category: img.category,
          width: image.width,
          height: image.height,
          variant: img.variant
        }
      } catch (err) {
        console.log(img.urls);
        console.error(err);
        return null;
      }
    })
    .filter(Boolean)
  );

  const pokemonData = {
    ...pokemon,
    images,
    types
  };

  await Deno.writeTextFile(
    `${API_DIR}/${pokemon.id}.json`,
    JSON.stringify(pokemonData)
  );
}

async function downloadImage(id: string, img: PokemonImage) {
  const name = `${id}.${img.type}`;
  const dir = path.resolve(IMG_DIR, img.variant);

  await Deno.mkdir(dir, {recursive: true});

  const tryDownload = async (url: string, tries = 0): Promise<string | null> => {
    try {
      const {fullPath} = await download(url, {dir, file: name});
      return fullPath;
    } catch (err) {
      if (tries > 2) return null;
      return tryDownload(url, ++tries);
    }
  }

  let fullPath: string | null = null;
  for (const url of img.urls) {
    fullPath = await tryDownload(url);
    if (fullPath) break;
  }

  if (!fullPath) {
    throw new Error();
  }

  const {width, height} = await readDimensions(fullPath, img.type);

  return {
    name,
    width,
    height
  };
}
