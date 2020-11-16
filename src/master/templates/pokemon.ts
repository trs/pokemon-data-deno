import { GameMaster, GameMasterTemplate } from "../game.ts";

export const TEMPLATE_POKEMON_REGEX = /^V(\d{4})_POKEMON_(.+)$/;

export interface GameMasterTemplatePokemon extends GameMasterTemplate {
  data: {
    pokemon: {
      uniqueId: string;
      type1: string;
      type2?: string;
      stats: {
        baseStamina: number;
        baseAttack: number;
        baseDefense: number;
      };
      quickMoves: string[];
      cinematicMoves: string[];
      evolution: string[];
      evolutionBranch: {
        evolution: string;
        candyCost: number;
        form: string;
        questDisplay?: {
          questRequirementTemplateId: string;
        }[]
      }[];
      familyId: string;
      candyToEvolve: number;
      kmBuddyDistance: number;
      form?: string;
      tempEvoOverrides?: {
        tempEvoId: string;
        stats: {
          baseStamina: number;
          baseAttack: number;
          baseDefense: number;
        };
        typeOverride1: string;
        typeOverride2?: string;
      }[]
    }
  }
}

export const isPokemonTemplate = (template: GameMasterTemplate): template is GameMasterTemplatePokemon =>
  TEMPLATE_POKEMON_REGEX.test(template.templateId)
  && typeof template?.data?.pokemon === 'object';

export const buildPokemonTemplateId = (number: string, name: string): string => `V${number.padStart(4, '0')}_POKEMON_${name}`;

export const extractPokemonTemplateValues = (template: GameMasterTemplate) =>
  TEMPLATE_POKEMON_REGEX.exec(template.templateId)?.slice?.(1) ?? [];
