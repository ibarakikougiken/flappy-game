import { Container, Sprite, Text, TextStyle } from "pixi.js";
import { change_game_state } from ".";
import type { Context } from "../main";

export async function gameover(c: Context): Promise<Context> {
  const container = new Container();
  const text = new Text({
    text: "ゲームオーバー",
    style: {
      fontSize: c.screen.width / 20,
      fill: 0xffffff,
    },
  });
  text.anchor.set(0.5);
  text.x = c.app.screen.width / 2;
  text.y = c.app.screen.height / 2 - c.screen.height / 6;
  container.addChild(text);

  const score = c.score.get();
  const score_text = new Text({
    text: `
      スコア: ${score.score}
      ハイスコア: ${score.highscore}
    `,
    style: new TextStyle({
      fontFamily: "monospace",
      fontSize: c.screen.width / 30,
      fill: 0xffffff,
    }),
  });
  score_text.anchor.set(0.5);
  score_text.x = c.app.screen.width / 2 - score_text.width / 4;
  score_text.y = c.app.screen.height / 2;
  container.addChild(score_text);

  const retry_text = new Text({
    text: "タップ・スペースキーでリトライ",
    style: {
      fontSize: c.screen.width / 25,
      fill: 0xffffff,
    },
  });
  retry_text.anchor.set(0.5);
  retry_text.x = c.app.screen.width / 2;
  retry_text.y = c.app.screen.height / 2 + c.screen.height / 4;
  container.addChild(retry_text);

  async function exit() {
    container.destroy();
    await change_game_state(c, "playing");
    window.removeEventListener("keydown", async (e) => {
      if (e.key === " ") await exit();
    });
  }

  const bg = new Sprite();
  bg.width = c.app.screen.width;
  bg.height = c.app.screen.height;
  bg.interactive = true;
  bg.on("pointerup", async () => await exit());
  window.addEventListener("keydown", async (e) => {
    if (e.key === " ") await exit();
  });
  container.addChild(bg);

  c.app.stage.addChild(container);

  return c;
}
