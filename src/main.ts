import { Application, Assets, Container, Sprite } from "pixi.js";
import { change_game_state } from "./states";

const CANVAS_ASPECT_RATIO = 16 / 9;

type State = {
  game: "new" | "menu" | "playing" | "gameover";
};

export type Context = {
  app: Application;
  state: State;
  screen: { width: number; height: number };
  score: score;
};

class score {
  constructor(
    private score: number,
    private highscore: number
  ) {
    this.score = score;
    this.highscore = highscore;
  }

  get() {
    return { score: this.score, highscore: this.highscore };
  }

  increment() {
    this.score += 1;
    if (this.score > this.highscore) {
      this.highscore = this.score;
    }
  }

  reset() {
    this.score = 0;
  }
}

const assets = {
  character: "../assets/character.png",
  ground: "../assets/maptile_jimen_sogen_02_center.png",
};
export async function load_assaet(
  asset: keyof typeof assets
): Promise<ReturnType<typeof Assets.load>> {
  return await Assets.load(assets[asset]);
}

export function speed(c: Context) {
  const speed = c.screen.width / 500;
  return speed;
}

async function create_app(): Promise<Context> {
  const app = new Application();
  const { clientWidth, clientHeight } = document.body;
  const aspect_ratio = clientWidth / clientHeight;
  const { width, height } = {
    width:
      aspect_ratio > CANVAS_ASPECT_RATIO
        ? clientHeight * CANVAS_ASPECT_RATIO
        : clientWidth,
    height:
      aspect_ratio > CANVAS_ASPECT_RATIO
        ? clientHeight
        : clientWidth / CANVAS_ASPECT_RATIO,
  };

  await app.init({
    background: "#1099bb",
    width,
    height,
  });

  app.ticker.speed = 1;

  document.body.appendChild(app.canvas);

  const c: Context = {
    app,
    state: { game: "new" },
    screen: { width, height },
    score: new score(0, 0),
  };
  return c;
}

async function create_stage(c: Context): Promise<Context> {
  const container = new Container();
  const ground = new Sprite(await load_assaet("ground"));
  const scale = c.screen.height / 10 / ground.height;
  ground.scale.set(scale);
  ground.anchor.set(0.5);
  const ground_width = ground.width;
  const counts = Math.ceil(c.screen.width / ground_width) + 3;
  for (let i = 0; i < counts; i++) {
    const g = new Sprite(ground.texture);
    g.scale.set(scale);
    g.anchor.set(0.5);
    g.x = i * ground_width;
    g.y = c.screen.height - ground.height / 2;
    container.addChild(g);
  }
  c.app.stage.addChild(container);

  c.app.ticker.add(() => {
    if (container.destroyed) return;
    container.x -= speed(c);
    if (container.x < -ground_width) {
      container.x += ground_width;
    }
  });

  return c;
}

async function main() {
  const context = await create_app()
    .then((c) => create_stage(c))
    .then((c) => change_game_state(c, "menu"));

  return context;
}

export default main;
