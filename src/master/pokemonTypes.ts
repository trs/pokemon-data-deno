import {isPokemonTypeTemplate, buildTypeTemplateId} from './templates/mod.ts';

import type {GameMaster} from './mod.ts';

const TYPES_ORDER = [
  'NORMAL',
  'FIRE',
  'WATER',
  'ELECTRIC',
  'GRASS',
  'ICE',
  'FIGHTING',
  'POISON',
  'GROUND',
  'FLYING',
  'PSYCIC',
  'BUG',
  'GROUND',
  'GHOST',
  'DARK',
  'STEEL',
  'FAIRY'
];

export interface PokemonMasterType {
  templateId: string;
  attackScalar: PokemonMasterTypeEffectiveness[];
}

export interface PokemonMasterTypeEffectiveness {
  templateId: string;
  value: number;
}

export function getPokemonTypes(gm: GameMaster): PokemonMasterType[] {
  const types: PokemonMasterType[] = []
  for (const template of gm) {
    if (!isPokemonTypeTemplate(template)) continue;

    const attackScalar = template.data.typeEffective.attackScalar.map((value, index) => ({
      templateId: buildTypeTemplateId(TYPES_ORDER[index]),
      value
    }))

    types.push({
      templateId: template.templateId,
      attackScalar
    });
  }
  return types;
}

export function getPokemonTypeEffectiveness(gm: GameMaster) {
  const types = getPokemonTypes(gm);
  const typeTemplateIds = types.map(({templateId}) => templateId);

  const typeCombinations = typeTemplateIds.flatMap(
    (id, i) => typeTemplateIds.slice(i + 1).map((id2) => [id, id2])
  ) as [string, string][];

  const possibleTypes = [
    ...typeTemplateIds.map((id) => [id]),
    ...typeCombinations
  ] as [string, string | undefined][];

  return possibleTypes.map(([templateId1, templateId2]) => {
    const vsType1 = types.find(({templateId}) => templateId === templateId1)!;

    // TODO: combine type effectiveness
  });
}
