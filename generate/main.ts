import { download } from "https://deno.land/x/download@v1.0.1/mod.ts";
import * as path from "https://deno.land/std@0.77.0/path/mod.ts";

import { readDimensions } from "./img.ts";

import { getPokedex, getTypes, getFastMoves, getChargeMoves } from '../mod.ts';
import { Type, Move, MoveCategory } from '../mod.ts';

import {API_DIR, IMG_DIR} from '../const.ts';
import { Image } from "../src/pokedex.ts";

await Deno.mkdir(API_DIR, {recursive: true});

async function mapTypes() {
  const types = new Map<string, Type>();
  for await (const type of getTypes()) {
    types.set(type.name.toLocaleLowerCase(), type);
  }
  return types;
}

async function mapFastMoves() {
  const fastMoves = new Map<string, Move>();
  for await (const move of getFastMoves()) {
    fastMoves.set(move.name, move);
  }
  return fastMoves;
}

async function mapChargeMoves() {
  const chargeMoves = new Map<string, Move>();
  for await (const move of getChargeMoves()) {
    chargeMoves.set(move.name, move);
  }
  return chargeMoves;
}

const [typesMap, fastMovesMap, chargeMovesMap] = await Promise.all([
  mapTypes(),
  mapFastMoves(),
  mapChargeMoves()
]);

const movesMap = new Map<MoveCategory, Map<string, Move>>([
  ['fast', fastMovesMap],
  ['charge', chargeMovesMap]
]);

for await (const pokemon of getPokedex()) {
  const moves = pokemon.moves.map((move) => movesMap.get(move.category)?.get(move.name));
  const types = pokemon.types.map((type) => typesMap.get(type));

  // const [image, gif] = await Promise.all([
  //   downloadImage(pokemon.id, pokemon.image, 'png'),
  //   downloadImage(pokemon.id, pokemon.gif, 'gif').catch(() => null)
  // ]);

  const images = await Promise.all(pokemon.images.map(async (data) => {
    try {
      const image = await downloadImage(pokemon.id, data);
      return {
        path: `api/pokemon/${data.variant}/${image.name}`,
        type: data.type,
        width: image.width,
        height: image.height,
        variant: data.variant
      }
    } catch (err) {
      console.log(data.url, data.type);
      console.error(err);
      return null;
    }
  }));

  const imageMap = images.reduce((map, img) => {
    if (!img) return map;

    map.set(img.variant, {
      ...(map.get(img.variant) ?? {}),
      [img.type]: {
        path: img.path,
        width: img.width,
        height: img.height,
      }
    });

    return map
  }, new Map());

  const pokemonData = {
    ...pokemon,
    image: Object.fromEntries(imageMap),
    moves,
    types
  };

  await Deno.writeTextFile(
    `${API_DIR}/${pokemon.id}.json`,
    JSON.stringify(pokemonData)
  );
}

async function downloadImage(id: string, img: Image) {
  const name = `${id}.${img.type}`;
  const dir = path.resolve(IMG_DIR, img.variant);

  await Deno.mkdir(dir, {recursive: true});

  const {fullPath} = await download(img.url, {dir, file: name});
  const {width, height} = await readDimensions(fullPath, img.type);

  return {
    name,
    width,
    height
  };
}
