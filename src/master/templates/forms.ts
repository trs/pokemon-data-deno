import { GameMaster, GameMasterTemplate } from "../game.ts";

export const TEMPLATE_FORMS_REGEX = /^FORMS_V(\d{4})_POKEMON_(.+)$/;

export interface GameMasterTemplateFormSettings extends GameMasterTemplate {
  data: {
    formSettings: {
      pokemon: string;
      forms?: [GameMasterTemplateForm]
    }
  }
}

export interface GameMasterTemplateForm {
  form: string;
  assetBundleValue?: number;
  assetBundleSuffix?: string;
}

export const isFormsTemplate = (template: GameMasterTemplate): template is GameMasterTemplateFormSettings =>
  TEMPLATE_FORMS_REGEX.test(template.templateId)
  && typeof template?.data?.formSettings === 'object';

export const buildFormsTemplateId = (number: string, name: string): string => `FORMS_V${number.padStart(4, '0')}_POKEMON_${name}`;

export const extractFormsTemplateValues = (template: GameMasterTemplate) =>
  TEMPLATE_FORMS_REGEX.exec(template.templateId)?.slice?.(1) ?? [];
