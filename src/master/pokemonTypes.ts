import {isPokemonTypeTemplate, buildTypeTemplateId} from './templates/mod.ts';

import type {GameMaster} from './mod.ts';

const TYPES_ORDER = [
  'NORMAL',
  'FIGHTING',
  'FLYING',
  'POISON',
  'GROUND',
  'ROCK',
  'BUG',
  'GHOST',
  'STEEL',
  'FIRE',
  'WATER',
  'GRASS',
  'ELECTRIC',
  'PSYCHIC',
  'ICE',
  'DRAGON',
  'DARK',
  'FAIRY'
];

export interface PokemonMasterTypeAttack {
  templateId: string;
  attackScalar: PokemonMasterTypeEffectiveness[];
}

export interface PokemonMasterTypeDefend {
  templateId: string[];
  defendScalar: PokemonMasterTypeEffectiveness[];
}

export interface PokemonMasterTypeEffectiveness {
  templateId: string[];
  value: number;
}

export function * getPokemonTypes(gm: GameMaster): Generator<PokemonMasterTypeAttack> {
  for (const template of gm) {
    if (!isPokemonTypeTemplate(template)) continue;

    const attackScalar = template.data.typeEffective.attackScalar.map((value, index) => ({
      templateId: [buildTypeTemplateId(TYPES_ORDER[index])],
      value
    }))

    yield {
      templateId: template.templateId,
      attackScalar
    }
  }
}

function getTypeCombinations(gm: GameMaster) {
  const typeTemplateIds = [...getPokemonTypes(gm)].map(({templateId}) => [templateId]);

  const combinations: string[][] = [];
  for (let i = 0; i < typeTemplateIds.length; i++) {
    const templateId1 = typeTemplateIds[i];
    for (const templateId2 of typeTemplateIds.slice(i + 1)) {
      if (combinations.some((templateId) =>
        templateId.join('') === [...templateId1, ...templateId2].join('')
        || templateId.join('') === [...templateId2, ...templateId1].join('')
      )) continue;

      combinations.push([...templateId1, ...templateId2]);
    }
  }

  return [
    ...typeTemplateIds,
    ...combinations
  ]
}

export function * getAttackerTypeEffectiveness(gm: GameMaster): Generator<PokemonMasterTypeAttack> {
  for (const {attackScalar, templateId} of getPokemonTypes(gm)) {
    // Build unique combinations of type effectiveness scalars
    const combinations: PokemonMasterTypeEffectiveness[] = [];
    for (let i = 0; i < attackScalar.length; i++) {
      let scalar1 = attackScalar[i];
      for (const scalar2 of attackScalar.slice(i + 1)) {
        if (combinations.some(({templateId}) =>
          templateId.join('') === [...scalar1.templateId, ...scalar2.templateId].join('')
          || templateId.join('') === [...scalar2.templateId, ...scalar1.templateId].join('')
        )) continue;

        combinations.push({
          templateId: [...scalar1.templateId, ...scalar2.templateId],
          value: Number((scalar1.value * scalar2.value).toFixed(6))
        })
      }
    }

    yield {
      templateId,
      attackScalar: [
        ...attackScalar,
        ...combinations
      ]
    }
  }
}

export function * getDefenderTypeEffectiveness(gm: GameMaster): Generator<PokemonMasterTypeDefend> {
  const typeCombinations = getTypeCombinations(gm);

  for (const defender of typeCombinations) {
    const defendScalar: PokemonMasterTypeEffectiveness[] = []
    for (const attacker of getAttackerTypeEffectiveness(gm)) {
      const scalar = attacker.attackScalar.find(({templateId: [type1, type2]}) =>
        [type1, type2].filter(Boolean).join('') === defender.join('')
        || [type2, type1].filter(Boolean).join('') === defender.join('')
      )!;

      defendScalar.push({
        templateId: [attacker.templateId],
        value: scalar.value
      });
    }

    yield {
      templateId: defender,
      defendScalar
    };
  }

}
