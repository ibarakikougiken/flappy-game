import { Container, Sprite, Text } from "pixi.js";
import { change_game_state } from ".";
import type { Context } from "../main";

export async function menu(c: Context): Promise<Context> {
  const container = new Container();

  const text = new Text({
    text: "タップ・スペースキーでスタート",
    style: {
      fontSize: Math.max(c.app.screen.height / 10, 24),
      fill: 0xffffff,
    },
  });
  text.scale.set(c.app.screen.height / 10 / text.height);
  text.anchor.set(0.5);
  text.x = c.app.screen.width / 2;
  text.y = c.app.screen.height / 2;
  container.addChild(text);

  const rule = new Text({
    text: "空中のリングをくぐってスコアを稼げ！",
    style: {
      fontSize: Math.max(c.app.screen.height / 20, 12),
      fill: 0xffffff,
    },
  });
  rule.scale.set(c.app.screen.height / 20 / rule.height);
  rule.anchor.set(0.5);
  rule.x = c.app.screen.width / 2;
  rule.y = text.y + text.height * 2;
  container.addChild(rule);

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
