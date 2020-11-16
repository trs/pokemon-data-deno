import { GameMaster, GameMasterTemplate } from "../game.ts";

export const TEMPLATE_MOVE_REGEX = /^V(\d+)_MOVE_(.+)$/;

export interface GameMasterTemplateMove extends GameMasterTemplate {
  data: {
    move: {
      uniqueId: string;
      animationId: number;
      type: string;
      power: number;
      accuracyChance: number;
      criticalChance: number;
      staminaLossScalar: number;
      trainerLevelMin: number;
      trainerLevelMax: number;
      durationMs: number;
      damageWindowStartMs: number;
      damageWindowEndMs: number;
      energyDelta: number;
      vfxName: string;
    }
  }
}


export const isMoveTemplate = (template: GameMasterTemplate): template is GameMasterTemplateMove =>
  TEMPLATE_MOVE_REGEX.test(template.templateId)
  && typeof template?.data?.move === 'object';

export const buildMoveTemplateId = (number: string, name: string): string => `V${number.padStart(4, '0')}_MOVE_${name}`;
