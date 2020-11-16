import { GameMaster, GameMasterTemplate } from "../game.ts";

export const TEMPLATE_COMBAT_REGEX = /^COMBAT_V(\d+)_MOVE_(.+)$/;

export interface GameMasterTemplateCombatMove extends GameMasterTemplate {
  data: {
    combatMove: {
      uniqueId: string;
      type: string;
      power: number;
      vfxName: string;
      energyDelta: number
      buffs?: {
        targetAttackStatStageChange?: number;
        targetDefenseStatStageChange?: number;
        attackerAttackStatStageChange?: number;
        attackerDefenseStatStageChange?: number;
        buffActivationChance: number;
      }
    }
  }
}

export const isCombatMoveTemplate = (template: GameMasterTemplate): template is GameMasterTemplateCombatMove =>
  TEMPLATE_COMBAT_REGEX.test(template.templateId)
  && typeof template?.data?.combarMove === 'object';

export const buildCombatMoveTemplateId = (number: string, name: string): string => `COMBAT_V${number.padStart(4, '0')}_MOVE_${name}`;
