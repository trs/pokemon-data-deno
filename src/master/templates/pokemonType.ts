import { GameMaster, GameMasterTemplate } from "../game.ts";

export const TEMPLATE_TYPE_REGEX = /^POKEMON_TYPE_(.+)$/;

export interface GameMasterTemplatePokemonType extends GameMasterTemplate {
  data: {
    typeEffective: {
      attackScalar: number[];
      attackType: string;
    }
  }
}

export const isPokemonTypeTemplate = (template: GameMasterTemplate): template is GameMasterTemplatePokemonType =>
  TEMPLATE_TYPE_REGEX.test(template.templateId)
  && typeof template?.data?.typeEffective === 'object';

export const buildTypeTemplateId = (name: string): string => `POKEMON_TYPE_${name}`;
