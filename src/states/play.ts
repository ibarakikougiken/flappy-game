import { Graphics, Container, Sprite, Text, TextStyle } from "pixi.js";
import { change_game_state } from ".";
import { type Context, load_assaet, speed } from "../main";

function circle_radius(c: Context) {
  return c.screen.height / 8;
}

async function create_circle(
  c: Context,
  { y }: { y: number }
): Promise<Container> {
  const container = new Container({
    width: c.screen.height / 10,
    height: c.screen.height,
    x: c.screen.width + c.screen.height / 4,
  });

  const r = circle_radius(c);
  const circle = new Graphics();
  circle.circle(0, y, r).stroke({
    width: r / 10,
    color: 0xffffff,
  });
  container.addChild(circle);

  const line = new Graphics();
  line
    .beginPath()
    .lineTo(0, 0)
    .lineTo(0, y - r)
    .stroke({
      width: r / 10,
      color: 0xffffff,
    });
  container.addChild(line);

  c.app.ticker.add(() => {
    if (!container.destroyed) {
      container.x -= speed(c);
      if (container.x < c.app.screen.width / 3) {
        container.zIndex -= 1;
      }
      if (container.x < -container.width * 2) {
        container.destroy();
      }
    }
  });

  return container;
}

export async function play(c: Context): Promise<Context> {
  c.score.reset();

  const container = new Container();

  const character = new Sprite(await load_assaet("character"));
  const scale = c.screen.width / 14 / character.width;
  character.scale.set(scale);
  character.anchor.set(0.5);
  character.x = c.app.screen.width / 3;
  character.y = c.app.screen.height / 2;
  container.addChild(character);

  function score() {
    return `
      スコア: ${c.score.get().score}
      ハイスコア: ${c.score.get().highscore}
	  `;
  }
  const score_text = new Text({
    text: score(),
    style: new TextStyle({
      fontSize: Math.max(c.screen.height / 25, 12),
      fill: 0xffffff,
    }),
  });
  score_text.scale.set((c.screen.height / 25 / score_text.height) * 3);
  score_text.anchor.set(0);
  score_text.x = score_text.y = score_text.height / 3;
  container.addChild(score_text);

  let rising = false;

  const bg = new Sprite();
  bg.width = c.app.screen.width;
  bg.height = c.app.screen.height;
  bg.x = 0;
  bg.y = 0;
  bg.interactive = true;
  bg.on("pointerdown", () => {
    if (!rising && !container.destroyed) {
      rising = true;
    }
  });
  bg.on("pointerup", () => {
    if (rising && !container.destroyed) {
      rising = false;
    }
  });
  container.addChild(bg);

  window.addEventListener("keydown", (e) => {
    if (e.key === " " && !rising && !container.destroyed) {
      rising = true;
    }
  });
  window.addEventListener("keyup", (e) => {
    if (e.key === " " && rising && !container.destroyed) {
      rising = false;
    }
  });

  function end_game() {
    if (!container.destroyed) {
      container.destroy();
      change_game_state(c, "gameover");
    }
  }

  const INITIAL_ACCELERATION = c.screen.height / 1000;
  let acceleration = INITIAL_ACCELERATION;

  c.app.ticker.add(() => {
    if (container.destroyed) return;
    if (rising) {
      character.y -= c.screen.height / 140;
      acceleration = INITIAL_ACCELERATION;
      character.rotation = -0.3;
    } else {
      character.y += acceleration;
      acceleration += INITIAL_ACCELERATION / 5;
      character.rotation += 0.01;
    }

    if (character.y - character.height < 0) {
      character.y = character.height;
    }
    if (character.y + character.height > c.screen.height) end_game();
  });

  const y_max = c.screen.height - c.screen.height / 4;
  const y_min = c.screen.height / 4;
  function circle_y(): number {
    const n = 5;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += Math.max(y_min, Math.min(y_max, Math.random() * c.screen.height));
    }
    return sum / n; // ちょっとだけ程度正規分布に従うコクのある乱数
  }
  const circles: { x: number; y: number }[] = [];
  const circle_r = circle_radius(c);

  let last = 0;
  c.app.ticker.add(async (ticker: { lastTime: number }) => {
    if (container.destroyed) return;

    circles.map(async (circle, index) => {
      if (
        character.x + character.width / 2 > circle.x - circle_r &&
        character.x - character.width / 2 < circle.x + circle_r
      ) {
        if (
          character.y - character.height / 4 < circle.y - circle_r ||
          character.y + character.height / 4 > circle.y + circle_r
        ) {
          end_game();
        }
      }

      circle.x -= speed(c);
      if (circle.x < character.x - circle_r) {
        circles.splice(index, 1);
        c.score.increment();
        score_text.text = score();
      }
    });

    if (ticker.lastTime - last > c.app.ticker.FPS * 120) {
      const y = circle_y();
      const circle = await create_circle(c, { y });
      container.addChild(circle);

      circles.push({ x: c.screen.width + c.screen.height / 4, y });
      last = ticker.lastTime;
    }
  });

  c.app.stage.addChild(container);

  return c;
}
