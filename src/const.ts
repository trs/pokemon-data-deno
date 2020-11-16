export const URL_SEREBII = 'https://www.serebii.net/';
export const URL_PKMNDB = 'https://pokemondb.net/';
export const URL_HUB = 'https://db.pokemongohub.net/';
export const URL_PROJECT = 'https://projectpokemon.org/';
export const URL_ASSETS = 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/';

export const TYPE_IMG_SRC_REGEX = /\/(\w+).gif$/;
export const ID_IMG_SRC_REGEX = /\/(\d+)(?:\-(\w+))?\.png$/;
export const FORM_REGEX = /\((.+)\)/;
export const WORLD_AREA = /\(<i>(.+)<\/i>\)/;
export const NOT_AVAILABLE = /\(<i>Not currently available<\/i>\)/;

export const buildFormIDRegex = (num: number) => new RegExp(`^FORMS_V${String(num).padStart(4, '0')}_POKEMON_(.+)$`);
export const buildTempEvoIDRegex = (num: number) => new RegExp(`^TEMPORARY_EVOLUTION_V${String(num).padStart(4, '0')}_POKEMON_(.+)$`);

export type PokemonMoveCategory = 'fast' | 'charge';
