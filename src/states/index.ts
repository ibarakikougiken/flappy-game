import type { Context } from "../main";
import { gameover } from "./gameover";
import { menu } from "./menu";
import { play } from "./play";

async function change_game_state(
  c: Context,
  state: Context["state"]["game"]
): Promise<Context> {
  if (c.state.game === state) return c;

  c.state.game = state;
  switch (state) {
    case "menu":
      await menu(c);
      break;
    case "playing":
      await play(c);
      break;
    case "gameover":
      await gameover(c);
      break;
    default:
      await menu(c);
      break;
  }
  return c;
}

export { change_game_state };
