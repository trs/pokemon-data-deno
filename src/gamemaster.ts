export async function getGameMaster() {
  const result = await fetch('https://raw.githubusercontent.com/pokemongo-dev-contrib/pokemongo-game-master/master/versions/latest/V2_GAME_MASTER.json');
  const json = await result.json();
  return json;
}
