import { GameMaster, GameMasterTemplate } from "../game.ts";

export const TEMPLATE_WEATHER_REGEX = /^WEATHER_AFFINITY_(.+)$/;

export interface GameMasterDataWeatherAffinity extends GameMasterTemplate {
  data: {
    weatherAffinities: {
      weatherCondition: 'string';
      pokemonType: string[];
    }
  }
}

export const isWeatherAffinityTemplate = (template: GameMasterTemplate): template is GameMasterDataWeatherAffinity =>
  TEMPLATE_WEATHER_REGEX.test(template.templateId)
  && typeof template?.data?.weatherAffinities === 'object';

export const buildWeatherAffinityTemplateId = (name: string): string => `WEATHER_AFFINITY_${name}`;
