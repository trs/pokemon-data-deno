import { GameMaster, GameMasterTemplate } from "../game.ts";

export const TEMPLATE_TEMP_EVO_REGEX = /^TEMPORARY_EVOLUTION_V(\d{4})_POKEMON_(.+)$/;

export interface GameMasterTemplateTemporaryEvolution extends GameMasterTemplate {
  data: {
    temporaryEvolutionSettings: {
      pokemon: string;
      temporaryEvolutions: {
        temporaryEvolutionId: string;
        assetBundleValue: number;
      }[]
    }
  }
}

export const isTemporaryEvolutionTemplate = (template: GameMasterTemplate): template is GameMasterTemplateTemporaryEvolution =>
  TEMPLATE_TEMP_EVO_REGEX.test(template.templateId)
  && typeof template?.data?.temporaryEvolutionSettings === 'object';

export const buildTemporaryEvolutionTemplateId = (number: number, name: string): string => `TEMPORARY_EVOLUTION_V${String(number).padStart(4, '0')}_POKEMON_${name}`;
