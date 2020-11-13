import * as path from "https://deno.land/std@0.77.0/path/mod.ts";

import { getPokedex, getTypes, getFastMoves, getChargeMoves } from '../mod.ts';
import { Type, Move, MoveCategory } from '../mod.ts';

const outputDir = path.resolve(Deno.args[0]);
await Deno.mkdir(outputDir, {recursive: true});

async function mapTypes() {
  const types = new Map<string, Type>();
  for await (const type of getTypes()) {
    types.set(type.name, type);
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
  const moves = pokemon.moves.map((move) => movesMap.get(move.category));
  const types = pokemon.types.map((type) => typesMap.get(type));

  const pokemonData = {
    ...pokemon,
    moves,
    types
  };

  await Deno.writeFile(
    `${outputDir}/${pokemon.id}.json`,
    new TextEncoder().encode(JSON.stringify(pokemonData))
  );
}
