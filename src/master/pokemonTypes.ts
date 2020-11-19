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

export interface PokemonMasterType {
  templateId: string;
  attackScalar: PokemonMasterTypeEffectiveness[];
}

export interface PokemonMasterTypeEffectiveness {
  templateId: string[];
  value: number;
}

export function * getPokemonTypes(gm: GameMaster): Generator<PokemonMasterType> {
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

export function * getPokemonTypeEffectiveness(gm: GameMaster): Generator<PokemonMasterType> {
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
