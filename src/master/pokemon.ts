import { titleCase, paramCase } from 'https://deno.land/x/case@v2.1.0/mod.ts';

import { isFormsTemplate, buildPokemonTemplateId, buildTemporaryEvolutionTemplateId, extractFormsTemplateValues } from './templates/mod.ts';

import type {GameMaster} from './mod.ts';
import type {GameMasterTemplateTemporaryEvolution, GameMasterTemplatePokemon, GameMasterTemplateForm} from './templates/mod.ts';
import { buildAssetId } from "../assets/shared.ts";

const IGNORED_FORMS = [
  /SHADOW$/,
  /PURIFIED$/,
  /20\d{2}$/
];

const SPLIT_FORMS = [
  /^galarian \w+$/i,
];

export interface PokemonMaster {
  templateId: string;
  uniqueId: string;
  types: string[];
  dex: number;
  stats: PokemonStatsMaster;
  quickMoves: string[];
  chargeMoves: string[];
  assetId: string;
  forms: {
    name: string;
    code: string;
  }[];
}

export interface PokemonStatsMaster {
  stamina: number;
  attack: number;
  defence: number;
}

const isValidType = (type: any): type is string => typeof type === 'string';

export function * getPokemon(gm: GameMaster): Generator<PokemonMaster> {
  for (const formTemplate of gm) {
    if (!isFormsTemplate(formTemplate)) continue;
    const [dexStr] = extractFormsTemplateValues(formTemplate);

    // Gather valid forms
    const forms: GameMasterTemplateForm[] = (formTemplate.data.formSettings.forms ?? []).filter((form) =>
      !IGNORED_FORMS.some((ignore) => ignore.test(form.form))
    );

    // Find pokemon template for forms
    const pokemonTemplates: {template: GameMasterTemplatePokemon, form?: GameMasterTemplateForm}[] = forms.flatMap((form) => {
      const templateId = buildPokemonTemplateId(dexStr, form.form);
      const template = gm.find((t) => t.templateId === templateId) as GameMasterTemplatePokemon | undefined;
      if (!template) return [];

      return {template, form};
    });
    if (pokemonTemplates.length === 0) {
      // Use "default" form if none
      const templateId = buildPokemonTemplateId(dexStr, formTemplate.data.formSettings.pokemon);
      const template = gm.find((t) => t.templateId === templateId) as GameMasterTemplatePokemon | undefined;;
      if (template) {
        pokemonTemplates.push({template});
      }
    }

    if (pokemonTemplates.length === 0) {
      console.error('[X]', formTemplate.templateId);
    }

    // Loop through each template
    for (const {template: pokemonTemplate, form} of pokemonTemplates) {
      const dex = Number(dexStr);
      const uniqueId = pokemonTemplate.data.pokemon.uniqueId.replace(/(_FEMALE|_MALE)$/, '');
      const formName = getFormName(uniqueId, form?.form ?? `${uniqueId}_NORMAL)`);
      const forms = SPLIT_FORMS.some((split) => split.test(formName)) ? formName.split(' ') : [formName];

      const pokemon = {
        templateId: pokemonTemplate.templateId,
        uniqueId,
        types: [pokemonTemplate.data.pokemon.type1, pokemonTemplate.data.pokemon.type2].filter(isValidType),
        dex,
        stats: {
          stamina: pokemonTemplate.data.pokemon.stats.baseStamina,
          attack: pokemonTemplate.data.pokemon.stats.baseAttack,
          defence: pokemonTemplate.data.pokemon.stats.baseDefense
        },
        quickMoves: pokemonTemplate.data.pokemon.quickMoves,
        chargeMoves: pokemonTemplate.data.pokemon.cinematicMoves,
        assetId: buildAssetId(dex, form),
        forms: forms.map(getFormRecord)
      };

      yield pokemon;

      // Find associated temporary evolutions
      if (pokemonTemplate.data.pokemon.tempEvoOverrides) {
        const tempEvoTemplate = gm.find((t) => t.templateId === buildTemporaryEvolutionTemplateId(dex.toString(), pokemonTemplate.data.pokemon.uniqueId)) as GameMasterTemplateTemporaryEvolution | undefined;
        if (!tempEvoTemplate) continue;

        for (const evo of tempEvoTemplate.data.temporaryEvolutionSettings.temporaryEvolutions) {
          const tempEvo = pokemonTemplate.data.pokemon.tempEvoOverrides.find((t) => t.tempEvoId === evo.temporaryEvolutionId);
          if (!tempEvo) continue;

          yield {
            ...pokemon,
            templateId: [pokemon.templateId, evo.temporaryEvolutionId].join('_'),
            assetId: buildAssetId(dex, evo),
            stats: {
              stamina: tempEvo.stats.baseStamina,
              attack: tempEvo.stats.baseAttack,
              defence: tempEvo.stats.baseDefense
            },
            types: [tempEvo.typeOverride1, tempEvo.typeOverride2].filter(isValidType),
            forms: [...forms, getTempEvoName(evo.temporaryEvolutionId)].map(getFormRecord)
          }
        }
      }
    }
  }
}

function getFormName(uniqueId: string, formId: string) {
  const formName = formId.replace(uniqueId, '');
  return titleCase(formName);
}

function getTempEvoName(evoId: string) {
  const formName = evoId.replace('TEMP_EVOLUTION_', '');
  return titleCase(formName);
}

function getFormRecord(form: string) {
  return {
    name: form,
    code: paramCase(form)
  }
}
