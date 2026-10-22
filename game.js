// EuclideanSkirmish — scratch modern-FPS vector prototype for Platanus Hack 26
// Camera-first: the right stick free-looks (yaw + pitch) while the body keeps its
// movement vector. Triple jump with float. One rifle, auto-reload.
// Three decks above the base floor, with enemies up top.

const W = 800;
const H = 600;
const F = 520;
const HORIZON = 300;
const NEAR = 1.2;
const R = 500;
const EYE = 34;
const BODY_H = 54;
const WALL_H = 620;
const CEIL_H = WALL_H;
const GREEN = 0x7dffb0;

const CABINET_KEYS = {
  P1_U: ['w'], P1_D: ['s'], P1_L: ['a'], P1_R: ['d'],
  P1_1: ['u', 'Shift'], P1_2: ['i'], P1_3: ['o', ' '],
  P1_4: ['j', 'p'], P1_5: ['k'], P1_6: ['l'],
  P2_U: ['ArrowUp'], P2_D: ['ArrowDown'], P2_L: ['ArrowLeft'], P2_R: ['ArrowRight'],
  P2_1: ['r'], P2_2: ['t'], P2_3: ['y'],
  P2_4: ['f'], P2_5: ['g'], P2_6: ['h'],
  START1: ['Enter'], START2: ['2'],
};

const KEY_TO_ARCADE = {};
for (const [code, keys] of Object.entries(CABINET_KEYS)) {
  for (const key of keys) KEY_TO_ARCADE[key.length === 1 ? key.toLowerCase() : key] = code;
}

const held = Object.create(null);
const pressed = Object.create(null);

window.addEventListener('keydown', (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  const code = KEY_TO_ARCADE[key];
  if (!code) return;
  event.preventDefault();
  if (!held[code]) pressed[code] = true;
  held[code] = true;
});
window.addEventListener('keyup', (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  const code = KEY_TO_ARCADE[key];
  if (code) held[code] = false;
});

const anyHeld = (...codes) => codes.some((c) => held[c]);
const anyPressed = (...codes) => {
  for (const c of codes) if (pressed[c]) { pressed[c] = false; return true; }
  return false;
};

const PILLARS = [
  { x: -235, z: -195, w: 46, d: 46, h: 120 },
  { x: 235, z: -195, w: 46, d: 46, h: 120 },
  { x: -235, z: 205, w: 46, d: 46, h: 120 },
  { x: 235, z: 205, w: 46, d: 46, h: 120 },
  { x: 0, z: 0, w: 55, d: 55, h: 150 },
  { x: -300, z: 10, w: 30, d: 30, h: 90 },
  { x: 300, z: -10, w: 30, d: 30, h: 90 },
  { x: -310, z: -310, w: 26, d: 26, h: 420 },
  { x: 310, z: 310, w: 26, d: 26, h: 420 },
  { x: 310, z: -310, w: 26, d: 26, h: 280 },
  { x: -310, z: 310, w: 26, d: 26, h: 280 },
  { x: -140, z: 0, w: 34, d: 34, h: 70 },
  { x: 140, z: 0, w: 34, d: 34, h: 70 },
  { x: 0, z: 140, w: 34, d: 34, h: 70 },
  { x: -360, z: -260, w: 34, d: 34, h: 160 },
  { x: 360, z: -260, w: 34, d: 34, h: 160 },
  { x: -360, z: 260, w: 34, d: 34, h: 220 },
  { x: 390, z: 260, w: 34, d: 34, h: 220 },
  { x: -430, z: -430, w: 30, d: 30, h: 360 },
  { x: 430, z: -430, w: 30, d: 30, h: 300 },
  { x: 430, z: 430, w: 30, d: 30, h: 360 },
  { x: -430, z: 430, w: 30, d: 30, h: 300 },
];

const CEIL_PILLARS = PILLARS.splice(0, 4);

// Reachable decks and catwalks. Each is a solid slab you can land on.
const PLATFORMS = [
  { x: 0, z: -90, w: 220, d: 120, h: 80, tone: 0xffc46b },
  { x: 170, z: 80, w: 170, d: 150, h: 165, tone: 0xb388ff },
  { x: -60, z: 230, w: 170, d: 120, h: 250, tone: 0xf2f6ff },
  { x: -270, z: -110, w: 160, d: 120, h: 110, tone: 0x41f5ff },
  { x: 300, z: -150, w: 150, d: 110, h: 190, tone: 0xffc46b },
  { x: -330, z: 120, w: 140, d: 130, h: 270, tone: 0xb388ff },
  { x: 260, z: 300, w: 170, d: 120, h: 330, tone: 0xf2f6ff },
  { x: 0, z: 400, w: 260, d: 70, h: 120, tone: 0x41f5ff },
  { x: 100, z: 190, w: 80, d: 180, h: 285, tone: 0x41f5ff },
  { x: -150, z: 20, w: 70, d: 180, h: 215, tone: 0x41f5ff },
  { x: 0, z: -270, w: 190, d: 80, h: 145, tone: 0x41f5ff },
  { x: 0, z: 60, w: 170, d: 110, h: 305, tone: 0x41f5ff },
  { x: -150, z: 360, w: 180, d: 90, h: 345, tone: 0xf2f6ff },
  { x: 370, z: 370, w: 110, d: 110, h: 380, tone: GREEN, flip: true },
  { x: -370, z: 370, w: 110, d: 100, h: 360, tone: GREEN, flip: true },
  { x: -220, z: -300, w: 120, d: 100, h: 470, tone: GREEN, flip: true },
  { x: 320, z: -300, w: 120, d: 100, h: 490, tone: GREEN, flip: true },
  { x: -320, z: 300, w: 120, d: 100, h: 510, tone: GREEN, flip: true },
  { x: 320, z: 300, w: 120, d: 100, h: 530, tone: GREEN, flip: true },
  { x: 0, z: -160, w: 180, d: 70, h: 545, tone: GREEN, flip: true },
  { x: 0, z: 160, w: 180, d: 70, h: 560, tone: GREEN, flip: true },
];

for (const i of [19, 18, 17, 16, 15, 10, 9, 7, 5, 3]) PLATFORMS.splice(i, 1);

const BARRIERS = [
  { x: 0, z: -200, w: 200, d: 14, h: 42 },
  { x: -260, z: 40, w: 14, d: 150, h: 42 },
  { x: 260, z: 40, w: 14, d: 150, h: 42 },
  { x: 0, z: 310, w: 180, d: 14, h: 42 },
  { x: -180, z: -270, w: 150, d: 14, h: 42 },
  { x: 180, z: -270, w: 150, d: 14, h: 42 },
  { x: -210, z: 140, w: 14, d: 180, h: 42 },
  { x: 210, z: 140, w: 14, d: 180, h: 42 },
  { x: 0, z: 120, w: 220, d: 14, h: 42 },
  { x: 0, z: 440, w: 200, d: 14, h: 42 },
];

const GUN = { name: 'PULSO', mag: 18, dmg: 20, cone: 0.09, range: 720, cd: 120, reload: 1.3 };
const MENU = '   K REINICIAR   L MÚSICA: ';
const JUMP_V = [292, 341, 406];
const GRAVITY = 620;
const FLOAT_GRAVITY = 80;

const TYPES = {
  grunt: { hp: 40, speed: 44, r: 14, color: 0xff3355, dmg: 12, shape: 'horror', points: 100 },
  spitter: { hp: 30, speed: 26, r: 15, color: 0xffd23f, dmg: 0, shape: 'horror', outer: 'hexa', points: 150 },
  brute: { hp: 90, speed: 27, r: 30, color: 0xff69b4, dmg: 22, shape: 'horror', outer: 'pink', points: 250 },
};

const HORROR_GHOST = 0xaaaaff;

const cam = {
  x: 0, z: -380, yaw: 0, pitch: 0, height: 0,
  vy: 0, jumps: 3, recoil: 0, bob: 0, homeYaw: 0,
};

const game = {
  phase: 'title',
  music: true,
  health: 100,
  shield: 50,
  shieldDelay: 0,
  score: 0,
  wave: 0,
  enemies: [],
  orbs: [],
  tokens: [],
  shots: [],
  bursts: [],
  rings: [],
  mag: GUN.mag,
  reload: 0,
  fireCd: 0,
  look: false,
  lookVec: { x: 0, z: 0 },
  moveX: 0,
  moveZ: 0,
  aiming: false,
  deckHint: 0,
  waveTimer: 0,
  breakTimer: 0,
  waveClear: false,
  slow: false,
  slowToken: 0,
  zoom: 1,
  flash: 0,
  flip: false,
  flipFlash: 0,
  muzzle: 0,
  hitMark: 0,
  pausedAt: 0,
};

let scene;
let g;
let inv = null;
let tTitle, tSub, tCenter, tHint, tDeck, tTopL, tTopR, tAmmo, tLook;

const config = {
  type: Phaser.AUTO,
  width: W,
  height: H,
  parent: 'game-root',
  backgroundColor: '#05040c',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: W, height: H },
  scene: { create, update },
};

class Invention13 {
  constructor() {
    const C = window.AudioContext || window.webkitAudioContext;
    this.c = new C();
    this.m = this.c.createGain();
    this.m.gain.value = 0.6;
    this.m.connect(this.c.destination);
    this.bpm = 90;
    this.stepSec = 60 / this.bpm / 4;
    this.step = 0;
    this.next = 0;
    this.timer = null;
    this.playing = false;
    const d = atob('AC0AAMAgATnAAUUgAcggAkcgAsAgAzhAA0cgA8ogBDkABEggBLQABTkABUwgBbwABjsABkQgBrQABzsAB0wgB74ACDxACEUgCMAgCTkACUUgCcggCjgACkcgCsAgCzQAC0cgC8ogDDkADEggDLQADTkADUUgDbwADjsADrQADzsAD74AEDwAEMwgETkAEUggEcwgEjwAEkUgEsggEzkAE0AgE8MgFD4AFEEgFLkAFTUAFUUgFbkAFjIAFkogFrUAFy0AF02gF7AAGC8AGMogGUcgGbIAGcogGkMgGrcAGscgGz4gG7uAG8EgHEAgHTcAHUMgHbQAHjcAHkggHrAAHzQAH0ygH6sAIC0AIMggITAAIUUgIcggIjIAIkEgIrUAIy8AI0qgI7IAJCsAJMcgJS8AJUMgJccgJjAAJkAgJrQAJy0AJ0igJ7AAKCkAKMUgKSYAKUEgKcUgKisAKj4gKrcAKzUAK0cgK7cALCQALEhgLKsALTAALbQALjIALqsALzIAL7UAMDQAMMMgMTAAMUggMcwgMi8AMkogMsMgMysAM0ogM80gNDAANEwgNKsANTAANU8gNbQANjIANkcgNqsANzIAN08gN7UAODQAOEggOMMgOTAAOUggOcwgOkogOsMgO0ogO80gPEwgPLcAPTQAPUggPbcAPjAAPk8gPrQAPysAP0wgP68AQC0AQFQgQNEgQTAAQUwgQdEgQjQAQkggQswgQzcAQ0UgQ8ggRDYAREogRLkARTIARU4gRbYARi0ARlEgRrIARyoAR1QgR60ASCsASFMgSM8gSS8ASUogSc8gSjIASkcgSsogSzYAS0MgS8cgTDQATEggTLcATTAATUwgTbQATisATk8gTrAATygAT1MgT6sAUCoAUFEgUM4gUS0AUUsgUc4gUi8AUkcgUssgUzMAU0IgU8UgVEMgVLQAVTAAVU-gVbQAVi0AVrAAVswgVzQAV0ggV7cAV8wgWDYAWEVgWLIAWS8AWU6gWbIAWisAWq8AWsogWzIAW0cgW7YAW8ogXDQAXEMgXLAAXS0AXUygXbAAXioAXq0AXsggXzCAX0UgX8ggYEIgYK8AYM8gYTAAYU4gYa0AYcwgYi9AYksgYs4gYztAY0cgY8sgZCgAZExgZLQAZS8AZasAZigAZq8AZysAZ68AaChAaM8gaTQAaVIgac8gajcAakwgas8gazoAa0kga8wgbDEAbE8gbMwgbUkgbcwgbkUgbrcAbzUAb7QAcDIAcM0gcTIAcVEgcc0gcjUAckogcs0gczgAc0cgc8ogdC9AdE0gdMogdUcgdcogdkMgdrUAdzQAd7IAeDAAeMwgeTAAeU8gecwgejQAekggeswgezYAe0Uge8ggfC1AfEsgfMggfUUgfcggfkIgfrQAfzMAf7EAgC8AgMoggS8AgU0ggcoggjIAgkcggsoggzUAg0Qgg8cghCwAhEoghMcghUQghccghkAghrIAhzAAh68A'.replace(/-/g, '+').replace(/_/g, '/'));
    this.notes = [];
    for (let i = 0; i < d.length; i += 3) {
      const x = (d.charCodeAt(i) << 16) | (d.charCodeAt(i + 1) << 8) | d.charCodeAt(i + 2);
      this.notes.push([x >> 15, (x >> 8) & 127, ((x >> 6) & 3) + 1, (x >> 5) & 1]);
    }
  }

  start() {
    if (this.playing) return;
    this.playing = true;
    this.step = 0;
    this.c.resume();
    this.next = this.c.currentTime + 0.08;
    this.timer = setInterval(() => this.tick(), 25);
    this.tick();
  }

  stop() {
    this.playing = false;
    clearInterval(this.timer);
    this.timer = null;
  }

  pause() {
    if (this.playing) this.c.suspend();
  }

  resume() {
    if (this.playing) this.c.resume();
  }

  tick() {
    while (this.playing && this.next < this.c.currentTime + 0.15) {
      for (const [s, m, d, v] of this.notes) {
        if (s === this.step) this.note(m, d, v, this.next);
      }
      this.next += this.stepSec;
      this.step = (this.step + 1) % 272;
    }
  }

  note(m, d, v, t) {
    const C = this.c, o = C.createOscillator(), f = C.createBiquadFilter(), g = C.createGain();
    o.type = v ? 'sawtooth' : 'triangle';
    o.frequency.setValueAtTime(440 * Math.pow(2, (m - 69) / 12), t);
    f.type = 'lowpass';
    f.frequency.value = v ? 1800 : 900;
    f.Q.value = 0.7;
    const dur = Math.min(0.55, d * this.stepSec * 0.9);
    g.gain.setValueAtTime(v ? 0.16 : 0.22, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(f);
    f.connect(g);
    g.connect(this.m);
    o.start(t);
    o.stop(t + dur + 0.02);
  }
}

new Phaser.Game(config);

function create() {
  scene = this;
  g = this.add.graphics().setDepth(0);
  tTitle = mk(400, 140, '', 40, '#d9ccff', 0.5, 10);
  tSub = mk(400, 195, '', 12, '#a99cc8', 0.5, 10);
  tCenter = mk(400, 300, '', 22, '#f2f6ff', 0.5, 10);
  tDeck = mk(400, 356, '', 11, '#ffc46b', 0.5, 10);
  tHint = mk(400, 440, '', 11, '#8d84a8', 0.5, 10);
  tTopL = mk(24, 24, '', 11, '#b388ff', 0, 10);
  tTopR = mk(776, 24, '', 11, '#ffc46b', 1, 10);
  tAmmo = mk(24, 548, '', 12, '#f2f6ff', 0, 10);
  tLook = mk(24, 568, '', 10, '#ffc46b', 0, 10);
  showTitle();
}

function mk(x, y, text, size, color, originX, depth) {
  const t = scene.add.text(x, y, text, {
    fontFamily: 'monospace', fontSize: size + 'px', color, fontStyle: 'bold',
    align: 'center', lineSpacing: 8,
  });
  t.setOrigin(originX, 0.5).setDepth(depth);
  return t;
}

function showTitle() {
  game.phase = 'title';
  tTitle.setText('EuclideanSkirmish').setVisible(true);
  tSub.setText('DOS PALANCAS  ·  TRES NIVELES  ·  TRIPLE SALTO').setVisible(true);
  tCenter.setText('').setVisible(false);
  tDeck.setVisible(false);
  tHint.setText('PULSA START\nPALANCA 1 (WASD)  MOVER     PALANCA 2 (FLECHAS)  MIRAR\nESPACIO  SALTO x3      SHIFT  DISPARAR      P  PAUSA\n' + MENU + (game.music ? 'SÍ' : 'NO')).setVisible(true);
  tTopL.setVisible(false);
  tTopR.setVisible(false);
  tAmmo.setVisible(false);
  tLook.setVisible(false);
}

function startGame() {
  cam.x = 0; cam.z = -380; cam.yaw = 0; cam.pitch = 0; cam.height = 0;
  cam.homeYaw = 0;
  cam.vy = 0; cam.jumps = 3; cam.recoil = 0;
  game.health = 100;
  game.shield = 50;
  game.shieldDelay = 0;
  game.score = 0;
  game.wave = 0;
  game.enemies = [];
  game.orbs = [];
  game.tokens = [];
  game.shots = [];
  game.bursts = [];
  game.rings = [];
  game.mag = GUN.mag;
  game.reload = 0;
  game.fireCd = 0;
  game.look = false;
  game.lookVec = { x: 0, z: 0 };
  game.moveX = 0;
  game.moveZ = 0;
  game.aiming = false;
  game.deckHint = 0;
  game.waveTimer = 0;
  game.breakTimer = 0;
  game.waveClear = false;
  game.slow = false;
  game.slowToken = 0;
  game.zoom = 1;
  game.flash = 0;
  game.flip = false;
  game.flipFlash = 0;
  game.muzzle = 0;
  game.hitMark = 0;
  game.pausedAt = 0;
  game.phase = 'play';
  inv?.stop();
  playMusic();
  tTitle.setVisible(false);
  tSub.setVisible(false);
  tHint.setVisible(false);
  tCenter.setVisible(false);
  tDeck.setVisible(false);
  tTopL.setVisible(true);
  tTopR.setVisible(true);
  tAmmo.setVisible(true);
  tLook.setVisible(true);
  spawnWave(1);
}

function playMusic() {
  if (!game.music) return;
  if (!inv) inv = new Invention13();
  if (inv.playing) inv.resume(); else inv.start();
}

function toggleMusic() {
  game.music = !game.music;
  if (!game.music) inv?.pause();
  else if (game.phase === 'play') playMusic();
  if (game.phase === 'title') showTitle();
  else if (game.phase === 'paused') tHint.setText('P CONTINUAR' + MENU + (game.music ? 'SÍ' : 'NO'));
  else if (game.phase === 'over') tHint.setText('START REINTENTAR' + MENU + (game.music ? 'SÍ' : 'NO'));
}

function spawnWave(n) {
  game.wave = n;
  game.waveClear = false;
  game.breakTimer = 0;
  game.enemies = [];
  game.orbs = [];
  game.deckHint = 0;
  tDeck.setVisible(false);

  const ground = Math.min(2 + n, 7);
  for (let i = 0; i < ground; i++) {
    const type = n >= 3 && i === 0 ? 'brute' : 'grunt';
    const def = TYPES[type];
    let ex, ez, tries = 0;
    do {
      const a = Math.random() * Math.PI * 2;
      const rad = 380 + Math.random() * 50;
      ex = Math.cos(a) * rad;
      ez = Math.sin(a) * rad;
      tries++;
    } while ((Math.hypot(ex - cam.x, ez - cam.z) < 220 || blockedSolid(ex, ez, 12, 0)) && tries < 60);
    game.enemies.push({
      type, x: ex, z: ez, baseY: 0, platform: null,
      hp: def.hp, speed: (def.speed + n * 2) * (type === 'brute' ? 2.805 : 1.65), r: def.r,
      dead: false, hit: 0, burst: 3 + Math.random() * 4, burstT: 0, stuck: 0, fireCd: 1 + Math.random() * 1.5,
    });
  }

  if (n >= 2) addDeckEnemy('spitter', PLATFORMS[0]);
  if (n >= 3) addDeckEnemy('spitter', PLATFORMS[1]);
  if (n >= 4) addDeckEnemy('brute', PLATFORMS[2]);
  if (n >= 5) addDeckEnemy('spitter', PLATFORMS[2]);
  if (n >= 6) addDeckEnemy('spitter', PLATFORMS[3]);
  if (n >= 7) addDeckEnemy('brute', PLATFORMS[4]);
  if (n >= 8) addDeckEnemy('spitter', PLATFORMS[5]);
  if (n >= 9) addDeckEnemy('brute', PLATFORMS[6]);
  if (n >= 10) addDeckEnemy('spitter', PLATFORMS[7]);

  tCenter.setText('OLEADA ' + n).setVisible(true);
  game.waveTimer = 1400;
  topToken();
  beep(392, 0.12, 'square', 0.05);
  beep(587, 0.2, 'square', 0.04);
}

function addDeckEnemy(type, p) {
  const def = TYPES[type];
  game.enemies.push({
    type,
    x: p.x + (Math.random() - 0.5) * (p.w - 50),
    z: p.z + (Math.random() - 0.5) * (p.d - 50),
    baseY: p.h,
    platform: p,
    hp: def.hp,
    speed: (def.speed + game.wave * 2) * (type === 'brute' ? 2.805 : 1.65),
    r: def.r,
    dead: false,
    hit: 0,
    burst: 3 + Math.random() * 4,
    burstT: 0,
    stuck: 0,
    fireCd: 1.5 + Math.random() * 1.5,
  });
}

function update(time, delta) {
  const dt = Math.min(delta, 50) / 1000;

  if (anyPressed('P1_5') && game.phase !== 'play') startGame();
  if (anyPressed('P1_6')) toggleMusic();

  if (anyPressed('P1_4')) {
    if (game.phase === 'play') {
      game.phase = 'paused';
      game.pausedAt = time;
      inv?.pause();
      tCenter.setText('PAUSA').setVisible(true);
      tHint.setText('P CONTINUAR' + MENU + (game.music ? 'SÍ' : 'NO')).setVisible(true);
      tDeck.setVisible(false);
    } else if (game.phase === 'paused') {
      game.phase = 'play';
      playMusic();
      tCenter.setVisible(false);
      tHint.setVisible(false);
    }
  }

  if (game.phase === 'title' || game.phase === 'over') {
    game.slow = false;
    if (anyPressed('START1', 'START2', 'P1_1', 'P2_1')) startGame();
  } else if (game.phase === 'play') {
    const groundNow = game.flip ? flipGroundAt(cam.x, cam.z, cam.height) : groundAt(cam.x, cam.z, cam.height);
    const airborne = game.flip ? cam.height < groundNow - 2 : cam.height > groundNow + 2;
    const falling = game.flip ? true : cam.vy < 0;
    game.slowToken = Math.max(0, game.slowToken - dt);
    game.slow = game.slowToken > 0 || (airborne && falling && anyHeld('P1_3', 'P2_3'));
    const sdt = dt * (game.slow ? 0.35 : 1);
    const targetZoom = game.slow ? 1.92 : 1;
    game.zoom += (targetZoom - game.zoom) * Math.min(1, dt * 8);

    updateJump(sdt);
    updatePlayer(dt, sdt);
    updateTokens();
    updateEnemies(sdt, dt, time);
    updateOrbs(sdt);
    updateShots(sdt);
    updateBursts(sdt);
    updateRings(sdt);
    updateDeckHint(dt);

    if (game.reload > 0) {
      game.reload -= sdt;
      if (game.reload <= 0) {
        game.mag = GUN.mag;
        beep(620, 0.05, 'square', 0.04);
      }
    }
    if (game.shieldDelay > 0) game.shieldDelay -= sdt;
    else if (game.shield < 50) game.shield = Math.min(50, game.shield + 14 * sdt);

    game.fireCd -= sdt * 1000;
    game.recoil = Math.max(0, game.recoil - sdt * 60);
    game.flash = Math.max(0, game.flash - sdt * 3);
    game.flipFlash = Math.max(0, game.flipFlash - dt * 2.5);
    game.muzzle = Math.max(0, game.muzzle - sdt * 3);
    game.hitMark = Math.max(0, game.hitMark - sdt * 4);
    game.aiming = !!findTarget(GUN.cone, GUN.range);

    if (game.waveTimer > 0) {
      game.waveTimer -= delta;
      if (game.waveTimer <= 0) tCenter.setVisible(false);
    }
    if (game.health <= 0) {
      game.phase = 'over';
      game.slow = false;
      game.flip = false;
      game.flipFlash = 0;
      inv?.stop();
      tCenter.setText('CAÍSTE\nPUNTOS ' + game.score).setVisible(true);
      tHint.setText('START REINTENTAR' + MENU + (game.music ? 'SÍ' : 'NO')).setVisible(true);
      tDeck.setVisible(false);
      beep(80, 0.6, 'sawtooth', 0.12);
    }
  }

  updateHud();
  draw(game.phase === 'paused' ? game.pausedAt : time);
  for (const k in pressed) pressed[k] = false;
}

function updateJump(dt) {
  if (anyPressed('P1_3', 'P2_3') && cam.jumps > 0) {
    cam.vy = (game.flip ? -1 : 1) * JUMP_V[3 - cam.jumps];
    cam.jumps--;
    beep(300 + (3 - cam.jumps) * 140, 0.08, 'sine', 0.05);
  }

  const ground = game.flip ? flipGroundAt(cam.x, cam.z, cam.height) : groundAt(cam.x, cam.z, cam.height);
  const airborne = game.flip ? cam.height < ground - 0.1 : cam.height > ground + 0.1;
  if (airborne || cam.vy !== 0) {
    const holding = anyHeld('P1_3', 'P2_3');
    const grav = game.flip ? 1 : -1;
    const gravity = holding && cam.vy * grav > 0 ? FLOAT_GRAVITY : GRAVITY;
    const prev = cam.height;
    cam.vy += grav * gravity * dt;
    cam.height += cam.vy * dt;

    const dir = game.flip ? -1 : 1;
    const headNow = cam.height + dir * BODY_H;

    if (game.flip ? cam.vy < 0 : cam.vy > 0) {
      if (!game.flip) {
        if (headNow >= CEIL_H) { cam.height = CEIL_H - BODY_H; cam.vy = 0; return; }
        let block = null;
        for (const p of PLATFORMS) {
          if (!inFootprint(cam.x, cam.z, p)) continue;
          const bot = p.h - 12;
          if (prev < bot - 0.5 && headNow >= bot && (block === null || bot < block)) block = bot;
        }
        if (block !== null) {
          cam.height = block - BODY_H;
          cam.vy = 0;
          return;
        }
      } else {
        if (headNow <= 0) { cam.height = BODY_H; cam.vy = 0; return; }
        let block = null;
        for (const p of PLATFORMS) {
          if (!inFootprint(cam.x, cam.z, p)) continue;
          if (prev > p.h + 0.5 && headNow <= p.h && (block === null || p.h > block)) block = p.h;
        }
        if (block !== null) {
          cam.height = block + BODY_H;
          cam.vy = 0;
          return;
        }
      }
    }

    if (game.flip) {
      if (cam.height >= ground && cam.vy >= 0) {
        cam.height = ground;
        cam.vy = 0;
        cam.jumps = 3;
        if (ground < CEIL_H) beep(460, 0.05, 'sine', 0.035);
      }
    } else if (cam.height <= ground && cam.vy <= 0) {
      cam.height = ground;
      cam.vy = 0;
      cam.jumps = 3;
      if (ground > 0) beep(460, 0.05, 'sine', 0.035);
    }
  } else {
    cam.height = ground;
    cam.vy = 0;
  }
}

function inFootprint(x, z, p) {
  return x > p.x - p.w / 2 && x < p.x + p.w / 2 && z > p.z - p.d / 2 && z < p.z + p.d / 2;
}

function flipTo(y, flipped) {
  cam.height = y;
  cam.vy = 0;
  cam.jumps = 3;
  game.flip = flipped;
  game.flipFlash = 1;
  game.slow = false;
  scene.cameras.main.shake(180, 0.008);
  beep(flipped ? 150 : 330, 0.18, 'sawtooth', 0.08);
}

function groundAt(x, z, height) {
  let best = 0;
  for (const p of PLATFORMS) {
    if (inFootprint(x, z, p)) {
      if (p.h <= height + 6 && p.h > best) best = p.h;
    }
  }
  return best;
}

function flipGroundAt(x, z, height) {
  let best = CEIL_H;
  for (const p of PLATFORMS) {
    if (inFootprint(x, z, p)) {
      const bot = p.h - 12;
      if (bot >= height - 6 && bot < best) best = bot;
    }
  }
  return best;
}

function updatePlayer(dt, wdt) {
  const yawIn = (anyHeld('P2_R') ? 1 : 0) - (anyHeld('P2_L') ? 1 : 0);
  const pitchIn = ((anyHeld('P2_U') ? 1 : 0) - (anyHeld('P2_D') ? 1 : 0)) * (game.flip ? -1 : 1);
  const lookDt = game.slow ? wdt : dt;
  cam.yaw += yawIn * 2.61 * lookDt;
  cam.pitch = Phaser.Math.Clamp(cam.pitch + pitchIn * 2.07 * lookDt, -1.55, 1.55);

  const strafe = (anyHeld('P1_R') ? 1 : 0) - (anyHeld('P1_L') ? 1 : 0);
  const forward = (anyHeld('P1_U') ? 1 : 0) - (anyHeld('P1_D') ? 1 : 0);

  if (forward > 0) cam.homeYaw = cam.yaw;

  if (pitchIn === 0) {
    const step = Math.min(Math.abs(cam.pitch), 0.06 * lookDt);
    cam.pitch -= Math.sign(cam.pitch) * step;
  }
  if (yawIn === 0 && strafe === 0 && forward === 0) {
    let dy = cam.homeYaw - cam.yaw;
    dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    cam.yaw += Math.sign(dy) * Math.min(Math.abs(dy), 0.04 * lookDt);
  }

  if (strafe !== 0 || forward !== 0) {
    const len = Math.hypot(strafe, forward) || 1;
    const s = strafe / len;
    const f = forward / len;
    const grounded = cam.height <= groundAt(cam.x, cam.z, cam.height) + 2;
    const speed = 165 * (grounded ? 1 : 0.78);
    const dx = (Math.cos(cam.yaw) * s + Math.sin(cam.yaw) * f) * speed * wdt;
    const dz = (-Math.sin(cam.yaw) * s + Math.cos(cam.yaw) * f) * speed * wdt;
    if (!blockedSolid(cam.x + dx, cam.z, 14, cam.height, game.flip)) cam.x += dx;
    if (!blockedSolid(cam.x, cam.z + dz, 14, cam.height, game.flip)) cam.z += dz;
    cam.bob += wdt * 10;
  }
  if (yawIn !== 0) cam.bob += dt * 7;

  resolveOverlap();
  cam.x = Phaser.Math.Clamp(cam.x, -R + 16, R - 16);
  cam.z = Phaser.Math.Clamp(cam.z, -R + 16, R - 16);

  if (anyHeld('P1_1', 'P2_1') && game.fireCd <= 0 && game.reload <= 0) fireWeapon();
}

function blockedSolid(x, z, radius, height, flipped) {
  const lo = flipped ? height - BODY_H : height;
  const hi = flipped ? height : height + BODY_H;
  const hits = (x1, x2, z1, z2, y1, y2) => {
    if (hi <= y1 + 0.5 || lo >= y2 - 0.5) return false;
    const cx = Phaser.Math.Clamp(x, x1, x2);
    const cz = Phaser.Math.Clamp(z, z1, z2);
    return Math.hypot(x - cx, z - cz) < radius;
  };
  for (const p of PILLARS) {
    if (hits(p.x - p.w / 2, p.x + p.w / 2, p.z - p.d / 2, p.z + p.d / 2, 0, p.h)) return true;
  }
  for (const p of CEIL_PILLARS) {
    if (hits(p.x - p.w / 2, p.x + p.w / 2, p.z - p.d / 2, p.z + p.d / 2, CEIL_H - p.h, CEIL_H)) return true;
  }
  for (const p of PLATFORMS) {
    if (hits(p.x - p.w / 2, p.x + p.w / 2, p.z - p.d / 2, p.z + p.d / 2, p.h - 12, p.h)) return true;
  }
  return false;
}

function resolveOverlap() {
  const lo = game.flip ? cam.height - BODY_H : cam.height;
  const hi = game.flip ? cam.height : cam.height + BODY_H;
  const pushOut = (x1, x2, z1, z2) => {
    const cx = Phaser.Math.Clamp(cam.x, x1, x2);
    const cz = Phaser.Math.Clamp(cam.z, z1, z2);
    const dx = cam.x - cx, dz = cam.z - cz;
    const d = Math.hypot(dx, dz);
    if (d >= 14) return;
    if (d < 0.001) {
      const l = cam.x - x1, r = x2 - cam.x;
      const t = cam.z - z1, b = z2 - cam.z;
      const m = Math.min(l, r, t, b);
      if (m === l) cam.x = x1 - 14;
      else if (m === r) cam.x = x2 + 14;
      else if (m === t) cam.z = z1 - 14;
      else cam.z = z2 + 14;
    } else {
      cam.x = cx + (dx / d) * 14;
      cam.z = cz + (dz / d) * 14;
    }
  };
  for (const p of PILLARS) {
    if (hi <= 0.5 || lo >= p.h - 0.5) continue;
    pushOut(p.x - p.w / 2, p.x + p.w / 2, p.z - p.d / 2, p.z + p.d / 2);
  }
  for (const p of CEIL_PILLARS) {
    if (hi <= CEIL_H - p.h + 0.5 || lo >= CEIL_H - 0.5) continue;
    pushOut(p.x - p.w / 2, p.x + p.w / 2, p.z - p.d / 2, p.z + p.d / 2);
  }
  for (const p of PLATFORMS) {
    if (hi <= p.h - 11.5 || lo >= p.h - 0.5) continue;
    pushOut(p.x - p.w / 2, p.x + p.w / 2, p.z - p.d / 2, p.z + p.d / 2);
  }
}

function blockedPoint(x, y, z) {
  if (y <= 0 || y >= CEIL_H || Math.abs(x) >= R || Math.abs(z) >= R) return true;
  for (const p of PILLARS) {
    if (x > p.x - p.w / 2 && x < p.x + p.w / 2 && z > p.z - p.d / 2 && z < p.z + p.d / 2 && y <= p.h) return true;
  }
  for (const p of CEIL_PILLARS) {
    if (x > p.x - p.w / 2 && x < p.x + p.w / 2 && z > p.z - p.d / 2 && z < p.z + p.d / 2 && y >= CEIL_H - p.h) return true;
  }
  for (const p of PLATFORMS) {
    if (x > p.x - p.w / 2 && x < p.x + p.w / 2 && z > p.z - p.d / 2 && z < p.z + p.d / 2 && y >= p.h - 12 && y <= p.h) return true;
  }
  for (const b of BARRIERS) {
    if (x > b.x - b.w / 2 && x < b.x + b.w / 2 && z > b.z - b.d / 2 && z < b.z + b.d / 2 && y <= b.h) return true;
  }
  return false;
}

function fireWeapon() {
  if (game.mag <= 0) {
    startReload();
    return;
  }

  game.mag--;
  game.fireCd = GUN.cd;
  game.muzzle = 0.14;
  cam.recoil = 9;

  const target = findTarget(GUN.cone, GUN.range);
  const ox = cam.x + Math.sin(cam.yaw) * 18;
  const oy = cam.height + (game.flip ? -EYE : EYE) - 4;
  const oz = cam.z + Math.cos(cam.yaw) * 18;
  let tx, ty, tz;

  if (target) {
    tx = target.x;
    ty = target.baseY + 26;
    tz = target.z;
  } else {
    const cp = Math.cos(cam.pitch);
    tx = ox + Math.sin(cam.yaw) * cp * GUN.range;
    ty = oy + Math.sin(cam.pitch) * GUN.range;
    tz = oz + Math.cos(cam.yaw) * cp * GUN.range;
  }

  const dx = tx - ox, dy = ty - oy, dz = tz - oz;
  const d = Math.hypot(dx, dy, dz) || 1;
  const sp = 800;
  game.shots.push({
    x: ox, y: oy, z: oz,
    vx: (dx / d) * sp,
    vy: (dy / d) * sp,
    vz: (dz / d) * sp,
    target,
    life: d / sp + 0.2,
  });

  rifleBang();
  if (game.mag <= 0) startReload();
}

function startReload() {
  if (game.reload > 0) return;
  game.reload = GUN.reload;
  beep(220, 0.08, 'square', 0.04);
}

function findTarget(cone, range) {
  let best = null;
  let bestDist = 1e9;
  const eyeY = cam.height + (game.flip ? -EYE : EYE);

  for (const e of game.enemies) {
    if (e.dead) continue;
    const dx = e.x - cam.x;
    const dz = e.z - cam.z;
    const dist = Math.hypot(dx, dz);
    if (dist > range || dist < 1) continue;

    let diff = Math.atan2(dx, dz) - cam.yaw;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    if (Math.abs(diff) > cone) continue;

    const vAngle = Math.atan2(e.baseY + 26 - eyeY, dist);
    if (Math.abs(vAngle - cam.pitch) > 0.16) continue;
    if (lineBlocked(cam.x, cam.z, e.x, e.z)) continue;

    if (dist < bestDist) { best = e; bestDist = dist; }
  }
  return best;
}

function lineBlocked(x1, z1, x2, z2) {
  for (let i = 1; i < 16; i++) {
    const t = i / 16;
    const x = x1 + (x2 - x1) * t;
    const z = z1 + (z2 - z1) * t;
    for (const p of PILLARS) {
      if (x > p.x - p.w / 2 && x < p.x + p.w / 2 && z > p.z - p.d / 2 && z < p.z + p.d / 2) return true;
    }
    if (cam.height < 8) {
      for (const b of BARRIERS) {
        if (x > b.x - b.w / 2 && x < b.x + b.w / 2 && z > b.z - b.d / 2 && z < b.z + b.d / 2) return true;
      }
    }
  }
  return false;
}

function damageEnemy(e, dmg) {
  if (e.dead) return;
  e.hp -= dmg;
  e.hit = 1;
  if (e.hp <= 0) {
    e.dead = true;
    game.score += TYPES[e.type].points;
    if (Math.random() < 0.16) dropToken(e.x, e.baseY + (game.flip ? -28 : 28), e.z);
    burst(e.x, e.baseY + 28, e.z, 18);
    beep(160, 0.1, 'sawtooth', 0.07);
    explode(e, false);
  } else {
    beep(480, 0.04, 'square', 0.035);
  }
}

function explode(e, hurtPlayer) {
  const def = TYPES[e.type];
  const heavy = e.type === 'brute';
  const mult = heavy ? 4.5 : 3;
  const boom = Math.max(12, def.dmg) * mult;
  const rad = (90 + e.r * 2) * (heavy ? 1.5 : 1);
  const ey = e.baseY + 26;
  game.rings.push({ x: e.x, y: ey, z: e.z, r: rad, l: 0.55, m: 0.55 });
  burst(e.x, ey, e.z, 24);
  beep(70, 0.35, 'sawtooth', 0.13);
  beep(150, 0.15, 'square', 0.05);
  if (hurtPlayer) {
    const pc = cam.height + (game.flip ? -26 : 26);
    if (Math.hypot(cam.x - e.x, cam.z - e.z) < rad && Math.abs(pc - ey) < 80) {
      hurt(def.dmg * mult);
    }
  }
  for (const o of game.enemies) {
    if (o === e || o.dead) continue;
    if (Math.hypot(o.x - e.x, o.z - e.z) < rad && Math.abs((o.baseY + 26) - ey) < 80) {
      damageEnemy(o, boom);
    }
  }
}

function updateEnemies(dt, rdt, time) {
  for (const e of game.enemies) {
    if (e.dead) continue;
    e.px = e.x;
    e.pz = e.z;
    let spd = e.speed;
    if (e.type === 'brute') {
      if (e.burstT > 0) e.burstT -= dt;
      else if ((e.burst -= dt) <= 0) {
        e.burstT = 4;
        e.burst = 3 + Math.random() * 4;
      }
      if (e.burstT > 0) spd *= 2;
    }
    if (!e.hist) e.hist = [];
    e.hist.push({ x: e.x, z: e.z, y: e.baseY, t: time });
    while (e.hist.length > 2 && time - e.hist[0].t > 300) e.hist.shift();
    const dx = cam.x - e.x;
    const dz = cam.z - e.z;
    const d = Math.hypot(dx, dz) || 1;
    const py = cam.height + (game.flip ? -26 : 26);
    const dy = py - (e.baseY + 26);
    const def = TYPES[e.type];

    let moving = false;
    if (e.type === 'spitter') {
      const want = d > 250 ? 1 : d < 175 ? -1 : 0;
      const vy = Math.abs(dy) < 1 ? 0 : Math.sign(dy) * Math.min(spd * dt, Math.abs(dy));
      if (want) {
        moving = true;
        moveEnemy(e, (dx / d) * spd * want * dt, vy, (dz / d) * spd * want * dt);
      }
      e.fireCd -= dt;
      if (e.fireCd <= 0 && d < 440) {
        e.fireCd = 1.6;
        const len = Math.hypot(dx, dy, dz) || 1;
        game.orbs.push({
          x: e.x, z: e.z, y: e.baseY + 26,
          vx: (dx / len) * 155,
          vy: (dy / len) * 155,
          vz: (dz / len) * 155,
          life: 3,
        });
        beep(300, 0.1, 'sine', 0.035);
      }
    } else {
      const d3 = Math.hypot(dx, dy, dz) || 1;
      const step = spd * dt;
      moving = true;
      moveEnemy(e, (dx / d3) * step, (dy / d3) * step, (dz / d3) * step);
      if (Math.hypot(dx, dz) < 30 && Math.abs(dy) < 40) {
        e.dead = true;
        explode(e, true);
      }
    }

    if (moving && Math.hypot(e.x - e.px, e.z - e.pz) < 0.05) e.stuck += dt;
    else e.stuck = 0;
    if (e.stuck > 0.5) {
      const baseA = Math.atan2(cam.z - e.z, cam.x - e.x);
      for (const sign of [1, -1]) {
        const a = baseA + sign * Math.PI / 2;
        const ox = e.x, oz = e.z;
        moveEnemy(e, Math.cos(a) * spd * dt * 2, 0, Math.sin(a) * spd * dt * 2);
        if (Math.hypot(e.x - ox, e.z - oz) > 0.01) break;
      }
      e.stuck = 0;
    }

    e.hit = Math.max(0, e.hit - dt * 4);
  }

  for (let i = 0; i < game.enemies.length; i++) {
    const a = game.enemies[i];
    if (a.dead) continue;
    for (let j = i + 1; j < game.enemies.length; j++) {
      const b = game.enemies[j];
      if (b.dead) continue;
      const dx = b.x - a.x, dz = b.z - a.z;
      const dy = (b.baseY + 26) - (a.baseY + 26);
      const d = Math.hypot(dx, dy, dz);
      const min = a.r + b.r;
      if (d > 0.001 && d < min) {
        const push = (min - d) / 2;
        a.x -= (dx / d) * push;
        a.z -= (dz / d) * push;
        a.baseY -= (dy / d) * push;
        b.x += (dx / d) * push;
        b.z += (dz / d) * push;
        b.baseY += (dy / d) * push;
      }
    }
  }

  for (const e of game.enemies) {
    if (e.dead) continue;
    e.x = Phaser.Math.Clamp(e.x, -R + 20, R - 20);
    e.z = Phaser.Math.Clamp(e.z, -R + 20, R - 20);
    e.baseY = Phaser.Math.Clamp(e.baseY, e.r + 4, CEIL_H - e.r - 4);
  }

  if (!game.waveClear && game.enemies.every((e) => e.dead)) {
    game.waveClear = true;
    game.waveTimer = 0;
    game.breakTimer = 10;
    tCenter.setText('OLEADA SUPERADA\nSIGUIENTE EN 10').setVisible(true);
  }
  if (game.waveClear && game.breakTimer > 0) {
    game.breakTimer -= rdt;
    if (game.breakTimer <= 0) spawnWave(game.wave + 1);
    else tCenter.setText('OLEADA SUPERADA\nSIGUIENTE EN ' + Math.ceil(game.breakTimer));
  }
}

function moveEnemy(e, dx, dy, dz) {
  if (!blockedSolid(e.x + dx, e.z, e.r, e.baseY)) e.x += dx;
  if (!blockedSolid(e.x, e.z + dz, e.r, e.baseY)) e.z += dz;
  if (!blockedSolid(e.x, e.z, e.r, e.baseY + dy)) e.baseY += dy;
  e.x = Phaser.Math.Clamp(e.x, -R + 20, R - 20);
  e.z = Phaser.Math.Clamp(e.z, -R + 20, R - 20);
  e.baseY = Phaser.Math.Clamp(e.baseY, e.r + 4, CEIL_H - e.r - 4);
}

function updateOrbs(dt) {
  for (let i = game.orbs.length - 1; i >= 0; i--) {
    const o = game.orbs[i];
    o.life -= dt;
    o.x += o.vx * dt;
    o.y += (o.vy || 0) * dt;
    o.z += o.vz * dt;
    if (o.life <= 0) { game.orbs.splice(i, 1); continue; }

    let gone = false;
    if (blockedPoint(o.x, o.y, o.z)) gone = true;
    if (gone) { game.orbs.splice(i, 1); continue; }

    const pc = cam.height + (game.flip ? -20 : 20);
    if (Math.hypot(o.x - cam.x, o.z - cam.z) < 18 && Math.abs(o.y - pc) < 26) {
      hurt(12);
      game.orbs.splice(i, 1);
    }
  }
}

function dropToken(x, y, z, rev) {
  game.tokens.push({ x, y, z, rev: !!rev });
}

function topToken() {
  if (game.tokens.some((t) => t.rev)) return;
  const p = PLATFORMS.reduce((a, b) => (b.h > a.h ? b : a));
  dropToken(p.x, p.h + (game.flip ? -22 : 20), p.z, true);
}

function updateTokens() {
  const py = cam.height + (game.flip ? -26 : 26);
  for (let i = game.tokens.length - 1; i >= 0; i--) {
    const t = game.tokens[i];
    if (Math.hypot(t.x - cam.x, t.z - cam.z) < 38 && Math.abs(t.y - py) < 62) {
      game.tokens.splice(i, 1);
      if (t.rev) flipTo(game.flip ? 0 : CEIL_H, !game.flip);
      game.slowToken = 5;
      burst(t.x, t.y, t.z, 14);
      beep(720, 0.12, 'sine', 0.07);
    }
  }
}

function hurt(n) {
  if (game.shield > 0) {
    game.shield -= n;
    if (game.shield < 0) {
      game.health += game.shield;
      game.shield = 0;
    }
  } else {
    game.health -= n;
  }
  game.shieldDelay = 4;
  game.flash = 1;
  scene.cameras.main.shake(120, 0.006);
  beep(110, 0.16, 'sawtooth', 0.09);
}

function burst(x, y, z, count) {
  for (let i = 0; i < count; i++) {
    game.bursts.push({
      x, y, z,
      vx: (Math.random() - 0.5) * 140,
      vy: Math.random() * 90,
      vz: (Math.random() - 0.5) * 140,
      life: 0.5 + Math.random() * 0.35,
      max: 0.85,
    });
  }
}

function updateRings(dt) {
  for (let i = game.rings.length - 1; i >= 0; i--) {
    const r = game.rings[i];
    r.l -= dt;
    if (r.l <= 0) game.rings.splice(i, 1);
  }
}

function updateBursts(dt) {
  for (let i = game.bursts.length - 1; i >= 0; i--) {
    const b = game.bursts[i];
    b.life -= dt;
    if (b.life <= 0) { game.bursts.splice(i, 1); continue; }
    b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
    b.vy -= 140 * dt;
  }
}

function updateShots(dt) {
  for (let i = game.shots.length - 1; i >= 0; i--) {
    const s = game.shots[i];
    s.life -= dt;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.z += s.vz * dt;

    const mx = s.x - s.vx * dt * 0.5;
    const my = s.y - s.vy * dt * 0.5;
    const mz = s.z - s.vz * dt * 0.5;
    if (blockedPoint(s.x, s.y, s.z) || blockedPoint(mx, my, mz)) {
      burst(s.x, s.y, s.z, 3);
      game.shots.splice(i, 1);
      continue;
    }

    let hit = false;
    if (s.target && !s.target.dead) {
      const dx = s.target.x - s.x;
      const dy = s.target.baseY + 26 - s.y;
      const dz = s.target.z - s.z;
      if (dx * dx + dy * dy + dz * dz < 400) hit = true;
    }

    if (hit || s.life <= 0) {
      if (hit && s.target && !s.target.dead) {
        damageEnemy(s.target, GUN.dmg);
        burst(s.target.x, s.target.baseY + 26, s.target.z, 4);
        game.hitMark = 1;
      }
      game.shots.splice(i, 1);
    }
  }
}

function updateDeckHint(dt) {
  const groundAlive = game.enemies.some((e) => !e.dead && e.baseY === 0);
  const upperAlive = game.enemies.some((e) => !e.dead && e.baseY > 0);
  if (!groundAlive && upperAlive && game.deckHint <= 0 && cam.height < 20) {
    game.deckHint = 4.5;
    tDeck.setText('TRIPLE SALTO PARA SUBIR A LAS PLATAFORMAS').setVisible(true);
  }
  if (game.deckHint > 0) {
    game.deckHint -= dt;
    if (game.deckHint <= 0) tDeck.setVisible(false);
  }
}

function deckName(h) {
  if (h >= 240) return 'C';
  if (h >= 155) return 'B';
  if (h >= 70) return 'A';
  return 'BASE';
}

function updateHud() {
  tTopL.setText(
    'VIDA ' + Math.max(0, Math.round(game.health)) +
    '  ESCUDO ' + Math.round(game.shield) +
    '  ALTURA ' + Math.round(cam.height) + ' ' + deckName(cam.height) + (game.flip ? '  INVERTIDO' : ''),
  );
  tTopR.setText(game.phase === 'title' ? '' : 'OLEADA ' + game.wave + '   PUNTOS ' + game.score);
  if (game.reload > 0) {
    tAmmo.setText(GUN.name + '  RECARGANDO');
  } else {
    tAmmo.setText(GUN.name + '  ' + game.mag + ' / ' + GUN.mag);
  }
  if (game.slowToken > 0) {
    tLook.setText('TIEMPO LENTO ' + game.slowToken.toFixed(1) + 's');
    tLook.setColor('#9a7cff');
  } else if (game.flip) {
    tLook.setText('TECHO');
    tLook.setColor('#41f5ff');
  } else if (game.slow) {
    tLook.setText('CAÍDA LENTA');
    tLook.setColor('#9a7cff');
  } else {
    const deg = Math.round((cam.pitch * 180) / Math.PI);
    tLook.setText(deg === 0 ? 'FLECHAS  MIRAR' : 'MIRAR ' + (deg > 0 ? '+' : '') + deg + '\u00b0');
    tLook.setColor(deg === 0 ? '#6f6488' : '#ffd98a');
  }
}

function camSpace(x, y, z) {
  const dx = x - cam.x;
  const dz = z - cam.z;
  const cs = Math.cos(cam.yaw);
  const sn = Math.sin(cam.yaw);

  const rx = dx * cs - dz * sn;
  const rz = dx * sn + dz * cs;
  const ry = y - (cam.height + (game.flip ? -EYE : EYE));

  const cp = Math.cos(cam.pitch);
  const sp = Math.sin(cam.pitch);
  return {
    x: rx,
    y: ry * cp - rz * sp,
    z: ry * sp + rz * cp,
  };
}

function projectPoint(x, y, z) {
  const c = camSpace(x, y, z);
  if (c.z < NEAR) return null;
  const sy = game.flip ? 1 : -1;
  return { x: W / 2 + (c.x * F * game.zoom) / c.z, y: HORIZON + sy * (c.y * F * game.zoom) / c.z, z: c.z };
}

function line3(ax, ay, az, bx, by, bz, color, alpha, width) {
  let A = camSpace(ax, ay, az);
  let B = camSpace(bx, by, bz);
  if (A.z < NEAR && B.z < NEAR) return;

  if (A.z < NEAR) {
    const t = (NEAR - A.z) / (B.z - A.z);
    A = { x: A.x + (B.x - A.x) * t, y: A.y + (B.y - A.y) * t, z: NEAR };
  } else if (B.z < NEAR) {
    const t = (NEAR - B.z) / (A.z - B.z);
    B = { x: B.x + (A.x - B.x) * t, y: B.y + (A.y - B.y) * t, z: NEAR };
  }

  const sy = game.flip ? 1 : -1;
  const x1 = W / 2 + (A.x * F * game.zoom) / A.z;
  const y1 = HORIZON + sy * (A.y * F * game.zoom) / A.z;
  const x2 = W / 2 + (B.x * F * game.zoom) / B.z;
  const y2 = HORIZON + sy * (B.y * F * game.zoom) / B.z;

  g.lineStyle(width, color, alpha);
  g.lineBetween(x1, y1, x2, y2);
}

function fill3(points, color, alpha) {
  const pts = [];
  for (const [x, y, z] of points) {
    const p = projectPoint(x, y, z);
    if (!p) return;
    pts.push(p);
  }
  g.fillStyle(color, alpha);
  g.fillPoints(pts, true);
}

function draw(time) {
  g.clear();
  g.fillStyle(0x05040c, 1);
  g.fillRect(0, 0, W, H);

  for (let i = 0; i < 9; i++) {
    g.lineStyle(1, 0x6b5cff, 0.045);
    g.lineBetween(0, HORIZON - 72 + i * 18, W, HORIZON - 72 + i * 18);
  }

  if (game.phase === 'title' || game.phase === 'over') {
    drawFloor(0.18);
    drawWalls();
    drawCeiling();
    drawPillars();
    drawCeilPillars();
    drawPlatforms();
    drawBarriers();
    if (game.phase === 'over') {
      drawEnemies(time);
      drawOrbs();
      drawTokens(time);
      drawBursts();
    }
    g.fillStyle(0x03020a, 0.5);
    g.fillRect(0, 0, W, H);
    drawGun(time);
    drawCrosshair(0.3);
    return;
  }

  drawFloor(0.28);
  drawWalls();
  drawCeiling();
  drawPillars();
  drawCeilPillars();
  drawPlatforms();
  drawBarriers();
  drawEnemies(time);
  drawOrbs();
  drawTokens(time);
  drawBursts();
  drawRings();
  drawShots();
  if (game.zoom < 1.02) drawGun(time);
  drawCrosshair(0.9);
  drawRadar();
  drawJumpPips();
  drawBars();

  if (game.slow) {
    g.fillStyle(0x6b5cff, 0.05);
    g.fillRect(0, 0, W, H);
    g.lineStyle(1, 0x9a7cff, 0.14);
    for (let y = 12; y < H; y += 24) g.lineBetween(0, y, W, y);
  }

  if (game.flipFlash > 0) {
    g.fillStyle(0xf2f6ff, Math.min(0.3, game.flipFlash * 0.3));
    g.fillRect(0, 0, W, H);
  }

  if (game.flash > 0) {
    g.fillStyle(0xff1f3d, Math.min(0.45, game.flash * 0.4));
    g.fillRect(0, 0, W, H);
  }
}

function drawFloor(alpha) {
  const step = 70;
  for (let i = -R; i <= R; i += step) {
    line3(i, 0, -R, i, 0, R, 0x6b5cff, alpha * 0.55, 1);
    line3(-R, 0, i, R, 0, i, 0x6b5cff, alpha * 0.55, 1);
  }
}

function drawCeiling() {
  const c = 0x8a6dd8;
  fill3([[-R, CEIL_H, -R], [R, CEIL_H, -R], [R, CEIL_H, R], [-R, CEIL_H, R]], 0x0d0820, 0.16);
  for (let i = -R; i <= R; i += 70) {
    line3(i, CEIL_H, -R, i, CEIL_H, R, c, 0.13, 1);
    line3(-R, CEIL_H, i, R, CEIL_H, i, c, 0.13, 1);
  }
  line3(-R, CEIL_H, -R, R, CEIL_H, -R, c, 0.55, 1.5);
  line3(R, CEIL_H, -R, R, CEIL_H, R, c, 0.55, 1.5);
  line3(R, CEIL_H, R, -R, CEIL_H, R, c, 0.55, 1.5);
  line3(-R, CEIL_H, R, -R, CEIL_H, -R, c, 0.55, 1.5);
}

function drawWalls() {
  const c = 0xb388ff;
  for (const [x1, z1, x2, z2] of [
    [-R, -R, R, -R], [R, -R, R, R], [R, R, -R, R], [-R, R, -R, -R],
  ]) {
    fill3([[x1, 0, z1], [x2, 0, z2], [x2, WALL_H, z2], [x1, WALL_H, z1]], 0x2a1b4a, 0.06);
    line3(x1, 0, z1, x2, 0, z2, c, 0.7, 2);
    line3(x1, WALL_H, z1, x2, WALL_H, z2, c, 0.22, 1);
    const n = Math.floor(Math.hypot(x2 - x1, z2 - z1) / 70);
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const px = x1 + (x2 - x1) * t;
      const pz = z1 + (z2 - z1) * t;
      line3(px, 0, pz, px, WALL_H, pz, c, 0.16, 1);
    }
  }

  for (const h of [80, 165, 250, 335, 420, 505, 590]) {
    line3(-R, h, -R, R, h, -R, c, 0.13, 1);
    line3(R, h, -R, R, h, R, c, 0.13, 1);
    line3(R, h, R, -R, h, R, c, 0.13, 1);
    line3(-R, h, R, -R, h, -R, c, 0.13, 1);
  }
}

function drawPillars() {
  for (const p of PILLARS) {
    const x1 = p.x - p.w / 2, x2 = p.x + p.w / 2;
    const z1 = p.z - p.d / 2, z2 = p.z + p.d / 2;
    const c = 0x8a6dd8;
    fill3([[x1, 0, z1], [x2, 0, z1], [x2, p.h, z1], [x1, p.h, z1]], 0x1a1030, 0.08);
    fill3([[x2, 0, z1], [x2, 0, z2], [x2, p.h, z2], [x2, p.h, z1]], 0x1a1030, 0.08);
    fill3([[x2, 0, z2], [x1, 0, z2], [x1, p.h, z2], [x2, p.h, z2]], 0x1a1030, 0.08);
    fill3([[x1, 0, z2], [x1, 0, z1], [x1, p.h, z1], [x1, p.h, z2]], 0x1a1030, 0.08);
    fill3([[x1, p.h, z1], [x2, p.h, z1], [x2, p.h, z2], [x1, p.h, z2]], 0x8a6dd8, 0.06);
    for (const [x, z] of [[x1, z1], [x2, z1], [x2, z2], [x1, z2]]) {
      line3(x, 0, z, x, p.h, z, c, 0.8, 2);
    }
    for (const [ax, az, bx, bz] of [[x1, z1, x2, z1], [x2, z1, x2, z2], [x2, z2, x1, z2], [x1, z2, x1, z1]]) {
      line3(ax, p.h, az, bx, p.h, bz, c, 0.55, 1);
      line3(ax, 0, az, bx, 0, bz, c, 0.3, 1);
    }
  }
}

function drawCeilPillars() {
  for (const p of CEIL_PILLARS) {
    const x1 = p.x - p.w / 2, x2 = p.x + p.w / 2;
    const z1 = p.z - p.d / 2, z2 = p.z + p.d / 2;
    const y0 = CEIL_H - p.h, c = 0x8a6dd8;
    fill3([[x1, y0, z1], [x2, y0, z1], [x2, CEIL_H, z1], [x1, CEIL_H, z1]], 0x1a1030, 0.08);
    fill3([[x2, y0, z1], [x2, y0, z2], [x2, CEIL_H, z2], [x2, CEIL_H, z1]], 0x1a1030, 0.08);
    fill3([[x2, y0, z2], [x1, y0, z2], [x1, CEIL_H, z2], [x2, CEIL_H, z2]], 0x1a1030, 0.08);
    fill3([[x1, y0, z2], [x1, y0, z1], [x1, CEIL_H, z1], [x1, CEIL_H, z2]], 0x1a1030, 0.08);
    for (const [x, z] of [[x1, z1], [x2, z1], [x2, z2], [x1, z2]]) {
      line3(x, y0, z, x, CEIL_H, z, c, 0.8, 2);
    }
    for (const [ax, az, bx, bz] of [[x1, z1, x2, z1], [x2, z1, x2, z2], [x2, z2, x1, z2], [x1, z2, x1, z1]]) {
      line3(ax, CEIL_H, az, bx, CEIL_H, bz, c, 0.55, 1);
      line3(ax, y0, az, bx, y0, bz, c, 0.3, 1);
    }
  }
}

function drawPlatforms() {
  for (const p of PLATFORMS) {
    const x1 = p.x - p.w / 2, x2 = p.x + p.w / 2;
    const z1 = p.z - p.d / 2, z2 = p.z + p.d / 2;
    const top = p.h, bot = p.h - 12;

    fill3([[x1, top, z1], [x2, top, z1], [x2, top, z2], [x1, top, z2]], p.tone, 0.12);
    fill3([[x1, bot, z1], [x2, bot, z1], [x2, top, z1], [x1, top, z1]], 0x1a1030, 0.08);
    fill3([[x2, bot, z1], [x2, bot, z2], [x2, top, z2], [x2, top, z1]], 0x1a1030, 0.08);
    fill3([[x2, bot, z2], [x1, bot, z2], [x1, top, z2], [x2, top, z2]], 0x1a1030, 0.08);
    fill3([[x1, bot, z2], [x1, bot, z1], [x1, top, z1], [x1, top, z2]], 0x1a1030, 0.08);

    for (const [x, z] of [[x1, z1], [x2, z1], [x2, z2], [x1, z2]]) {
      line3(x, bot, z, x, top, z, p.tone, 0.7, 2);
      line3(x, 0, z, x, bot, z, p.tone, 0.08, 1);
    }

    line3(x1, top, z1, x2, top, z1, p.tone, 0.85, 2);
    line3(x2, top, z1, x2, top, z2, p.tone, 0.85, 2);
    line3(x2, top, z2, x1, top, z2, p.tone, 0.85, 2);
    line3(x1, top, z2, x1, top, z1, p.tone, 0.85, 2);

    line3(x1, bot, z1, x2, bot, z1, 0xb388ff, 0.35, 1);
    line3(x2, bot, z1, x2, bot, z2, 0xb388ff, 0.35, 1);
    line3(x2, bot, z2, x1, bot, z2, 0xb388ff, 0.35, 1);
    line3(x1, bot, z2, x1, bot, z1, 0xb388ff, 0.35, 1);

    for (let i = 1; i < 4; i++) {
      const gx = x1 + (p.w * i) / 4;
      const gz = z1 + (p.d * i) / 4;
      line3(gx, top + 0.2, z1, gx, top + 0.2, z2, p.tone, 0.18, 1);
      line3(x1, top + 0.2, gz, x2, top + 0.2, gz, p.tone, 0.18, 1);
    }
  }
}

function drawBarriers() {
  for (const b of BARRIERS) {
    const x1 = b.x - b.w / 2, x2 = b.x + b.w / 2;
    const z1 = b.z - b.d / 2, z2 = b.z + b.d / 2;
    const c = 0xffc46b;
    fill3([[x1, 0, z1], [x2, 0, z1], [x2, b.h, z1], [x1, b.h, z1]], 0xffc46b, 0.05);
    fill3([[x2, 0, z1], [x2, 0, z2], [x2, b.h, z2], [x2, b.h, z1]], 0xffc46b, 0.05);
    fill3([[x2, 0, z2], [x1, 0, z2], [x1, b.h, z2], [x2, b.h, z2]], 0xffc46b, 0.05);
    fill3([[x1, 0, z2], [x1, 0, z1], [x1, b.h, z1], [x1, b.h, z2]], 0xffc46b, 0.05);
    for (const [x, z] of [[x1, z1], [x2, z1], [x2, z2], [x1, z2]]) {
      line3(x, 0, z, x, b.h, z, c, 0.45, 1.5);
    }
    line3(x1, b.h, z1, x2, b.h, z1, c, 0.4, 1);
    line3(x2, b.h, z1, x2, b.h, z2, c, 0.4, 1);
    line3(x2, b.h, z2, x1, b.h, z2, c, 0.4, 1);
    line3(x1, b.h, z2, x1, b.h, z1, c, 0.4, 1);
  }
}

const CUBE_V = [
  [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
  [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
];
const CUBE_E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];

const HEXA_V = [
  [1, 0, 0, 0], [-1, 0, 0, 0], [0, 1, 0, 0], [0, -1, 0, 0],
  [0, 0, 1, 0], [0, 0, -1, 0], [0, 0, 0, 1], [0, 0, 0, -1],
];
const HEXA_E = [];
for (let i = 0; i < 8; i++) {
  for (let j = i + 1; j < 8; j++) {
    if ((i ^ j) !== 1) HEXA_E.push([i, j]);
  }
}

const PHI = (1 + Math.sqrt(5)) / 2;
const IPHI = 1 / PHI;
const DODECA_V = [
  [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1],
  [1, -1, -1], [1, -1, 1], [1, 1, -1], [1, 1, 1],
  [0, -IPHI, -PHI], [0, -IPHI, PHI], [0, IPHI, -PHI], [0, IPHI, PHI],
  [-IPHI, -PHI, 0], [-IPHI, PHI, 0], [IPHI, -PHI, 0], [IPHI, PHI, 0],
  [-PHI, 0, -IPHI], [PHI, 0, -IPHI], [-PHI, 0, IPHI], [PHI, 0, IPHI],
];
const DODECA_E = [];
const DODECA_EDGE2 = 4 / (PHI * PHI);
for (let i = 0; i < 20; i++) {
  for (let j = i + 1; j < 20; j++) {
    const a = DODECA_V[i], b = DODECA_V[j];
    const d2 = (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
    if (Math.abs(d2 - DODECA_EDGE2) < 0.01) DODECA_E.push([i, j]);
  }
}

const DODECA_ADJ = Array.from({ length: 20 }, () => []);
for (const [a, b] of DODECA_E) {
  DODECA_ADJ[a].push(b);
  DODECA_ADJ[b].push(a);
}
const DODECA_F = [];
const FACE_SEEN = new Set();
for (let s = 0; s < 20; s++) {
  const path = [s];
  const walk = (v) => {
    if (path.length === 5) {
      if (DODECA_ADJ[v].includes(s)) {
        const key = [...path].sort((x, y) => x - y).join(',');
        if (!FACE_SEEN.has(key)) {
          FACE_SEEN.add(key);
          DODECA_F.push([...path]);
        }
      }
      return;
    }
    for (const n of DODECA_ADJ[v]) {
      if (!path.includes(n)) {
        path.push(n);
        walk(n);
        path.pop();
      }
    }
  };
  walk(s);
}

const F0 = DODECA_F[0];
const FV0 = DODECA_V[F0[0]], FV1 = DODECA_V[F0[1]], FV2 = DODECA_V[F0[2]];
let fnx = (FV1[1] - FV0[1]) * (FV2[2] - FV0[2]) - (FV1[2] - FV0[2]) * (FV2[1] - FV0[1]);
let fny = (FV1[2] - FV0[2]) * (FV2[0] - FV0[0]) - (FV1[0] - FV0[0]) * (FV2[2] - FV0[2]);
let fnz = (FV1[0] - FV0[0]) * (FV2[1] - FV0[1]) - (FV1[1] - FV0[1]) * (FV2[0] - FV0[0]);
let ffl = Math.hypot(fnx, fny, fnz) || 1;
fnx /= ffl; fny /= ffl; fnz /= ffl;
let fcx = 0, fcy = 0, fcz = 0;
for (const i of F0) {
  fcx += DODECA_V[i][0];
  fcy += DODECA_V[i][1];
  fcz += DODECA_V[i][2];
}
fcx /= 5; fcy /= 5; fcz /= 5;
if (fnx * fcx + fny * fcy + fnz * fcz < 0) {
  fnx = -fnx; fny = -fny; fnz = -fnz;
}
const fvx = -fny, fvy = fnx, fvz = 0;
const fct = -fnz;
let FACE_R;
if (fct < -0.999) {
  FACE_R = [1, 0, 0, 0, -1, 0, 0, 0, -1];
} else {
  const fk = 1 / (1 + fct);
  FACE_R = [
    1 - (fvy * fvy + fvz * fvz) * fk, -fvz + fvx * fvy * fk, fvy + fvx * fvz * fk,
    fvz + fvx * fvy * fk, 1 - (fvx * fvx + fvz * fvz) * fk, -fvx + fvy * fvz * fk,
    -fvy + fvx * fvz * fk, fvx + fvy * fvz * fk, 1 - (fvx * fvx + fvy * fvy) * fk,
  ];
}

function drawFlower(cx, cy, r, time, color = 0xff0033) {
  const k = r / 64;
  const wave = (rad) => 0.5 + 0.5 * Math.sin(time / 420 - rad * 0.1);
  const stroke = (x, y, rr, a) => {
    g.lineStyle(2.6, 0xf2f6ff, a);
    g.strokeCircle(x, y, rr);
    g.lineStyle(1.2, color, a);
    g.strokeCircle(x, y, rr);
  };
  const ring = (rad, count, cr) => {
    const a = wave(rad);
    if (a < 0.02) return;
    for (let i = 0; i < count; i++) {
      const t = (i * Math.PI * 2) / count;
      stroke(cx + Math.cos(t) * rad * k, cy + Math.sin(t) * rad * k, cr * k, a);
    }
  };
  stroke(cx, cy, r, wave(64));
  ring(54, 12, 27);
  ring(27, 6, 27);
  stroke(cx, cy, 27 * k, wave(0));
}

function drawHorror(e, color, time, ghost, variant) {
  const a = Math.atan2(cam.x - e.x, cam.z - e.z);
  const S = e.r * 1.1;
  const cy = e.baseY + 1.35 * S;
  const ca = Math.cos(a), sa = Math.sin(a);
  const rx = time / 900, ry = time / 650, rz = time / 1200;
  const cx = Math.cos(rx), sx = Math.sin(rx);
  const cyy = Math.cos(ry), sy = Math.sin(ry);
  const cz = Math.cos(rz), sz = Math.sin(rz);

  const world = (v, scale) => {
    const x = v[0] * scale, y = v[1] * scale, z = v[2] * scale;
    const y1 = y * cx - z * sx;
    const z1 = y * sx + z * cx;
    const x1 = x * cyy + z1 * sy;
    const z2 = -x * sy + z1 * cyy;
    const x2 = x1 * cz - y1 * sz;
    const y2 = x1 * sz + y1 * cz;
    return {
      x: e.x + x2 * ca - z2 * sa,
      y: cy + y2,
      z: e.z - x2 * sa - z2 * ca,
    };
  };
  const line = (A, B, col, alpha, width) => line3(A.x, A.y, A.z, B.x, B.y, B.z, col, alpha, width);

  const srx = -time / 220, sry = -time / 170, srz = -time / 260;
  const scx = Math.cos(srx), ssx = Math.sin(srx);
  const scy = Math.cos(sry), ssy = Math.sin(sry);
  const scz = Math.cos(srz), ssz = Math.sin(srz);
  const sWorld = (lx, ly, lz) => {
    const y1 = ly * scx - lz * ssx;
    const z1 = ly * ssx + lz * scx;
    const x1 = lx * scy + z1 * ssy;
    const z2 = -lx * ssy + z1 * scy;
    const x2 = x1 * scz - y1 * ssz;
    const y2 = x1 * ssz + y1 * scz;
    return {
      x: e.x + x2 * ca - z2 * sa,
      y: cy + y2,
      z: e.z - x2 * sa - z2 * ca,
    };
  };

  const dS = 0.13 * S;
  const jx = Math.sin(time / 140) * 0.04 * S + Math.sin(time / 80) * 0.015 * S;
  const jy = Math.cos(time / 115) * 0.04 * S + Math.cos(time / 190) * 0.015 * S;
  const jz = Math.sin(time / 95) * 0.015 * S;
  const ax = Math.sin(time / 120) * 0.24;
  const ay = Math.cos(time / 140) * 0.24;
  const az = Math.sin(time / 100) * 0.18;
  const dcx = Math.cos(ax), dsx = Math.sin(ax);
  const dcy = Math.cos(ay), dsy = Math.sin(ay);
  const dcz = Math.cos(az), dsz = Math.sin(az);
  const dv = DODECA_V.map(([x0, y0, z0]) => {
    const xr = FACE_R[0] * x0 + FACE_R[1] * y0 + FACE_R[2] * z0;
    const yr = FACE_R[3] * x0 + FACE_R[4] * y0 + FACE_R[5] * z0;
    const zr = FACE_R[6] * x0 + FACE_R[7] * y0 + FACE_R[8] * z0;
    const lx = xr * dS, ly = yr * dS, lz = zr * dS;
    const y1 = ly * dcx - lz * dsx;
    const z1 = ly * dsx + lz * dcx;
    const x1 = lx * dcy + z1 * dsy;
    const z2 = -lx * dsy + z1 * dcy;
    const x2 = x1 * dcz - y1 * dsz;
    const y2 = x1 * dsz + y1 * dcz;
    return {
      x: e.x + jx + x2 * ca - z2 * sa,
      y: cy + jy + y2,
      z: e.z + jz - x2 * sa - z2 * ca,
    };
  });

  const drawTess = (col) => {
    const outer = CUBE_V.map((v) => world(v, S));
    const inner = CUBE_V.map((v) => world(v, S * 0.45));
    for (const [i, j] of CUBE_E) {
      line(outer[i], outer[j], col, 0.65, 1.2);
      line(inner[i], inner[j], col, 0.85, 1.2);
    }
    for (let i = 0; i < 8; i++) line(outer[i], inner[i], col, 0.45, 1);
  };
  const drawHexa = (col) => {
    const pca = Math.cos(time / 900), psa = Math.sin(time / 900);
    const pcb = Math.cos(time / 650), psb = Math.sin(time / 650);
    const hv = HEXA_V.map((v) => {
      const qx = v[0] * pca - v[1] * psa;
      const qy = v[0] * psa + v[1] * pca;
      const qz = v[2] * pcb - v[3] * psb;
      const qw = v[2] * psb + v[3] * pcb;
      const k = 2.4 / (2.4 - qw * 0.5);
      return world([qx * k, qy * k, qz * k], S * 1.3);
    });
    for (const [i, j] of HEXA_E) line(hv[i], hv[j], col, 0.6, 1.2);
  };
  if (variant === 'pink') {
    if (ghost) drawTess(color); else drawTess(0xff69b4);
  } else if (variant === 'both') {
    if (ghost) { drawTess(color); drawHexa(color); }
    else { drawTess(0xff3355); drawHexa(0xffd23f); }
  } else if (variant === 'hexa') drawHexa(ghost ? color : 0xffd23f);
  else drawTess(ghost ? color : 0xff3355);

  if (ghost) {
    for (const [i, j] of DODECA_E) {
      line(dv[i], dv[j], color, 0.7, 1.6);
    }
    return;
  }

  const orbR = 0.55 * S;
  for (let k = 0; k < 5; k++) {
    let prev = null;
    for (let i = 0; i <= 14; i++) {
      const th = (i / 14) * Math.PI * 2;
      let lx, ly, lz;
      if (k < 3) {
        const yy = (k - 1) * 0.55 * orbR;
        const rr = Math.sqrt(Math.max(0.01, orbR * orbR - yy * yy));
        lx = Math.cos(th) * rr;
        ly = yy;
        lz = Math.sin(th) * rr;
      } else if (k === 3) {
        lx = Math.cos(th) * orbR;
        ly = Math.sin(th) * orbR;
        lz = 0;
      } else {
        lx = 0;
        ly = Math.sin(th) * orbR;
        lz = Math.cos(th) * orbR;
      }
      const p = sWorld(lx, ly, lz);
      if (prev) line(prev, p, 0xf2f6ff, 0.5, 1.2);
      prev = p;
    }
  }


  const faceData = DODECA_F.map((f) => {
    const pts = f.map((i) => projectPoint(dv[i].x, dv[i].y, dv[i].z));
    if (!pts.every((p) => p)) return null;
    let z = 0;
    for (const p of pts) z += p.z;
    return { pts, z: z / 5 };
  }).filter((f) => f);
  faceData.sort((a, b) => b.z - a.z);
  for (const f of faceData) {
    g.fillStyle(0x000000, 1);
    g.fillPoints(f.pts, true);
    g.lineStyle(1.7, 0xf2f6ff, 0.95);
    g.strokePoints(f.pts, true);
  }

  const facePts = DODECA_F[0].map((i) => projectPoint(dv[i].x, dv[i].y, dv[i].z));
  if (facePts.every((p) => p)) {
    let cx = 0, cy2 = 0;
    for (const p of facePts) {
      cx += p.x;
      cy2 += p.y;
    }
    cx /= 5;
    cy2 /= 5;
    let fr = 0;
    for (const p of facePts) fr += Math.hypot(p.x - cx, p.y - cy2);
    fr /= 5;

    g.fillStyle(0x000000, 1);
    g.fillPoints(facePts, true);
    g.lineStyle(1.7, 0xf2f6ff, 0.95);
    g.strokePoints(facePts, true);

    drawFlower(cx - fr * 0.12, cy2 - fr * 0.2, fr * 1.17, time, variant === 'pink' ? 0xff69b4 : variant === 'hexa' ? 0xffd23f : variant === 'both' ? GREEN : 0xff0033);
  }
}

function drawEnemies(time) {
  const list = game.enemies.filter((e) => !e.dead).sort((a, b) => {
    const da = (a.x - cam.x) ** 2 + (a.z - cam.z) ** 2;
    const db = (b.x - cam.x) ** 2 + (b.z - cam.z) ** 2;
    return db - da;
  });

  for (const e of list) {
    const def = TYPES[e.type];
    const color = e.hit > 0 ? 0xffffff : def.color;

    if (def.shape === 'horror') {
      let ghost = null;
      if (e.hist) {
        for (let h = e.hist.length - 1; h >= 0; h--) {
          if (time - e.hist[h].t >= 100) {
            ghost = e.hist[h];
            break;
          }
        }
      }
      if (ghost) {
        drawHorror({ ...e, x: ghost.x, z: ghost.z, baseY: ghost.y ?? e.baseY }, HORROR_GHOST, ghost.t, true, def.outer);
      }
      drawHorror(e, color, time, false, def.outer);
    }

    for (let i = 0; i < 8; i++) {
      const a1 = (i / 8) * Math.PI * 2 + time / 900;
      const a2 = ((i + 1) / 8) * Math.PI * 2 + time / 900;
      line3(e.x + Math.cos(a1) * e.r * 1.5, e.baseY + 1, e.z + Math.sin(a1) * e.r * 1.5,
            e.x + Math.cos(a2) * e.r * 1.5, e.baseY + 1, e.z + Math.sin(a2) * e.r * 1.5,
            color, 0.24, 1);
    }
  }
}

function drawOrbs() {
  for (const o of game.orbs) {
    const p = pointAt(o.x, o.y, o.z);
    if (!p) continue;
    g.lineStyle(7, 0xffc46b, 0.12);
    g.strokeCircle(p.x, p.y, 9);
    g.lineStyle(1.5, 0xffc46b, 0.9);
    g.strokeCircle(p.x, p.y, 6);
    g.fillStyle(0xfff2b0, 0.95);
    g.fillCircle(p.x, p.y, 2);
  }
}

function drawTokens(time) {
  for (const t of game.tokens) {
    const p = pointAt(t.x, t.y + Math.sin(time / 280) * 4, t.z);
    if (!p) continue;
    const r = Phaser.Math.Clamp(900 / p.z, 6, 16);
    const c = t.rev ? GREEN : 0xffd23f;
    g.lineStyle(2, c, 0.95);
    g.strokeCircle(p.x, p.y, r);
    g.lineBetween(p.x - r, p.y, p.x + r, p.y);
    g.lineBetween(p.x, p.y - r, p.x, p.y + r);
  }
}

function pointAt(x, y, z) {
  const p = projectPoint(x, y, z);
  return p && p.z > NEAR ? p : null;
}

function drawRings() {
  for (const r of game.rings) {
    const t = 1 - r.l / r.m, a = r.l / r.m;
    for (const dy of [-30, 0, 30]) {
      let prev = null;
      for (let i = 0; i <= 24; i++) {
        const th = (i / 24) * Math.PI * 2;
        const p = { x: r.x + Math.cos(th) * r.r * t, y: r.y + dy, z: r.z + Math.sin(th) * r.r * t };
        if (prev) line3(prev.x, prev.y, prev.z, p.x, p.y, p.z, 0xffc46b, a * 0.8, 1.5);
        prev = p;
      }
    }
  }
}

function drawBursts() {
  for (const b of game.bursts) {
    const a = Math.max(0, b.life / b.max);
    line3(b.x, b.y, b.z, b.x - b.vx * 0.02, b.y - b.vy * 0.02, b.z - b.vz * 0.02, 0xd9ccff, a, 1.5);
  }
}

const GUN_PARTS = [
  { kind: 'box', x: 0, y: 0, z: 0, w: 0.18, h: 0.2, d: 1.1, tone: 0 },
  { kind: 'box', x: 0, y: -0.16, z: 0.05, w: 0.15, h: 0.18, d: 0.7, tone: 1 },
  { kind: 'cyl', x: 0, y: 0.03, z: -0.7, r: 0.1, len: 0.9, sides: 8, rings: 4, verticals: 8, tone: 0 },
  { kind: 'cyl', x: 0, y: 0.03, z: -1.05, r: 0.035, len: 1.3, sides: 6, rings: 2, verticals: 3, tone: 1 },
  { kind: 'cyl', x: 0, y: 0.03, z: -1.75, r: 0.06, r2: 0.045, len: 0.3, sides: 8, rings: 2, verticals: 4, tone: 0 },
  { kind: 'box', x: 0, y: 0.15, z: -0.1, w: 0.12, h: 0.06, d: 0.4, tone: 1 },
  { kind: 'cyl', x: 0, y: 0.23, z: -0.1, r: 0.08, len: 0.5, sides: 8, rings: 2, verticals: 4, lens: true, tone: 0 },
  { kind: 'box', x: 0, y: -0.34, z: 0.25, w: 0.11, h: 0.42, d: 0.15, rx: 0.45, tone: 1 },
  { kind: 'box', x: 0, y: -0.42, z: -0.15, w: 0.11, h: 0.55, d: 0.22, rx: -0.35, tone: 0 },
  { kind: 'cyl', x: 0, y: 0.02, z: 0.6, r: 0.03, len: 0.5, sides: 6, rings: 2, verticals: 3, tone: 1 },
  { kind: 'box', x: 0, y: -0.05, z: 0.95, w: 0.14, h: 0.35, d: 0.35, tone: 0 },
];

function drawShots() {
  const mx = 400 + Math.sin(cam.bob) * 3;
  const my = 566 + cam.recoil + Math.cos(cam.bob * 0.55) * 2 - 142;
  for (const s of game.shots) {
    const tx = s.x - s.vx * 0.02;
    const ty = s.y - s.vy * 0.02;
    const tz = s.z - s.vz * 0.02;
    line3(tx, ty, tz, s.x, s.y, s.z, 0xffd98a, 0.16, 6);
    line3(tx, ty, tz, s.x, s.y, s.z, 0xfff2b0, 0.95, 2);
    const p = projectPoint(s.x, s.y, s.z);
    if (p) {
      const ddx = p.x - mx, ddy = p.y - my;
      if (game.zoom < 1.02 && ddx * ddx + ddy * ddy < 3600) {
        g.lineStyle(1, 0xfff2b0, 0.35);
        g.lineBetween(mx, my, p.x, p.y);
      }
      g.fillStyle(0xfff2b0, 0.9);
      g.fillCircle(p.x, p.y, 2);
    }
  }
}

function drawGun(time) {
  const paths = [[], []];
  const kick = Math.min(1, cam.recoil / 9);
  const prog = game.reload > 0 ? 1 - game.reload / GUN.reload : 0;
  const dip = game.reload > 0 ? Math.sin(prog * Math.PI) * 0.1 : 0;
  const rootX = 0.16 + Math.sin(cam.bob) * 0.008;
  const rootY = -0.15 + Math.cos(cam.bob * 0.55) * 0.005 - dip;
  const rootZ = -0.75 + kick * 0.04;
  const pitch = kick * 0.08;
  const roll = Math.sin(cam.bob) * 0.008 + (Math.random() - 0.5) * 0.025 * kick;
  const S = 0.42;

  const p = (x, y, z, rx) => {
    const cr = Math.cos(rx || 0), sr = Math.sin(rx || 0);
    const y1 = y * cr - z * sr;
    const z1 = y * sr + z * cr;
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    let y2 = y1 * cp - z1 * sp;
    const z2 = y1 * sp + z1 * cp;
    const cg = Math.cos(roll), sg = Math.sin(roll);
    const x2 = x * cg - y2 * sg;
    y2 = x * sg + y2 * cg;
    return { x: rootX + x2 * S, y: rootY + y2 * S, z: rootZ + z2 * S };
  };

  const add = (tone, a, b) => {
    if (a.z > -0.08 || b.z > -0.08) return;
    const ia = 1 / -a.z, ib = 1 / -b.z;
    paths[tone].push([
      400 + a.x * 620 * ia, 300 - a.y * 620 * ia,
      400 + b.x * 620 * ib, 300 - b.y * 620 * ib,
    ]);
  };

  const parts = GUN_PARTS.slice().sort((a, b) => a.z - b.z);
  for (const part of parts) {
    if (part.kind === 'box') {
      const hx = part.w / 2, hy = part.h / 2, hz = part.d / 2;
      const base = [
        [-hx, -hy, -hz], [hx, -hy, -hz], [hx, hy, -hz], [-hx, hy, -hz],
        [-hx, -hy, hz], [hx, -hy, hz], [hx, hy, hz], [-hx, hy, hz],
      ];
      const v = base.map(([x, y, z]) => p(x + part.x, y + part.y, z + part.z, part.rx));
      for (const [a, b] of [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]) {
        add(part.tone, v[a], v[b]);
      }
    } else {
      const sides = part.sides;
      const rings = part.rings;
      const r2 = part.r2 === undefined ? part.r : part.r2;
      let first = null;
      for (let ring = 0; ring < rings; ring++) {
        const t = rings === 1 ? 0 : ring / (rings - 1);
        const z = part.z - part.len / 2 + part.len * t;
        const r = part.r + (r2 - part.r) * t;
        const pts = [];
        for (let i = 0; i < sides; i++) {
          const a = (i / sides) * Math.PI * 2;
          pts.push(p(part.x + Math.cos(a) * r, part.y + Math.sin(a) * r, z));
        }
        for (let i = 0; i < sides; i++) add(part.tone, pts[i], pts[(i + 1) % sides]);
        if (ring === 0) first = pts;
        if (ring === rings - 1) {
          const verts = part.verticals || Math.ceil(sides / 2);
          for (let i = 0; i < verts; i++) {
            const idx = Math.floor((i * sides) / verts);
            add(part.tone, first[idx], pts[idx]);
          }
          if (part.lens) {
            add(part.tone, pts[0], pts[Math.floor(sides / 2)]);
            add(part.tone, pts[Math.floor(sides / 4)], pts[Math.floor((3 * sides) / 4)]);
          }
        }
      }
    }
  }

  for (let tone = 0; tone < 2; tone++) {
    const list = paths[tone];
    if (!list.length) continue;
    g.lineStyle(1.4, tone ? 0x8f8fd6 : 0xccccff, tone ? 0.45 : 0.62);
    g.beginPath();
    for (const [x1, y1, x2, y2] of list) { g.moveTo(x1, y1); g.lineTo(x2, y2); }
    g.strokePath();
  }

  const segments = paths[0].concat(paths[1]);
  const wave = [[], [], [], [], [], [], [], []];
  for (const seg of segments) {
    const [x1, y1, x2, y2] = seg;
    const v = 0.5 + 0.5 * Math.sin(time / 320 - ((x1 + x2) * 0.3 + (y1 + y2) * 0.5) * 0.06);
    wave[Math.min(7, Math.floor(v * 8))].push(seg);
  }
  for (let i = 0; i < 8; i++) {
    const mid = (i + 0.5) / 4;
    const dark = Math.max(0, 1 - mid) * 0.45;
    if (dark > 0.01) {
      g.lineStyle(2, 0x05040c, dark);
      g.beginPath();
      for (const [x1, y1, x2, y2] of wave[i]) { g.moveTo(x1, y1); g.lineTo(x2, y2); }
      g.strokePath();
    }
    const lit = Math.max(0, (mid - 1) / 0.875);
    if (lit > 0.01) {
      g.lineStyle(5, 0xf2f6ff, 0.08 * lit);
      g.beginPath();
      for (const [x1, y1, x2, y2] of wave[i]) { g.moveTo(x1, y1); g.lineTo(x2, y2); }
      g.strokePath();
      g.lineStyle(1.2 + lit * 0.6, 0xf2f6ff, lit);
      g.beginPath();
      for (const [x1, y1, x2, y2] of wave[i]) { g.moveTo(x1, y1); g.lineTo(x2, y2); }
      g.strokePath();
    }
  }

  if (game.muzzle > 0) {
    const outer = [];
    const inner = [];
    for (const [sides, rad, list] of [[5, 0.18, outer], [4, 0.09, inner]]) {
      const base = [];
      for (let i = 0; i < sides; i++) {
        const a = (i / sides) * Math.PI * 2;
        base.push(p(Math.cos(a) * rad, 0.03 + Math.sin(a) * rad, -2));
      }
      const tip = p(0, 0.03, -2.42);
      for (let i = 0; i < sides; i++) {
        list.push([base[i], base[(i + 1) % sides]]);
        list.push([base[i], tip]);
      }
    }
    for (const [list, color, width] of [[outer, 0xff5500, 2], [inner, 0xffffff, 1.5]]) {
      for (const pass of [[width + 4, 0.15], [width, 0.95]]) {
        g.lineStyle(pass[0], color, pass[1]);
        g.beginPath();
        for (const [a, b] of list) {
          const ia = 1 / -a.z, ib = 1 / -b.z;
          g.moveTo(400 + a.x * 620 * ia, 300 - a.y * 620 * ia);
          g.lineTo(400 + b.x * 620 * ib, 300 - b.y * 620 * ib);
        }
        g.strokePath();
      }
    }
  }
}

function drawCrosshair(alpha) {
  const c = game.aiming ? 0xffc46b : 0xff3355;
  g.lineStyle(1.5, c, alpha);
  g.lineBetween(400 - 14, 300, 400 - 5, 300);
  g.lineBetween(400 + 5, 300, 400 + 14, 300);
  g.lineBetween(400, 300 - 14, 400, 300 - 5);
  g.lineBetween(400, 300 + 5, 400, 300 + 14);
  const b = 18, l = 6;
  g.lineStyle(1.5, c, alpha * 0.9);
  g.lineBetween(400 - b, 300 - b, 400 - b + l, 300 - b);
  g.lineBetween(400 - b, 300 - b, 400 - b, 300 - b + l);
  g.lineBetween(400 + b, 300 - b, 400 + b - l, 300 - b);
  g.lineBetween(400 + b, 300 - b, 400 + b, 300 - b + l);
  g.lineBetween(400 - b, 300 + b, 400 - b + l, 300 + b);
  g.lineBetween(400 - b, 300 + b, 400 - b, 300 + b - l);
  g.lineBetween(400 + b, 300 + b, 400 + b - l, 300 + b);
  g.lineBetween(400 + b, 300 + b, 400 + b, 300 + b - l);
  if (game.slow) {
    const sc = 0xffc46b;
    g.lineStyle(1, sc, alpha * 0.55);
    g.strokeCircle(400, 300, 86);
    g.lineStyle(1.5, sc, alpha * 0.8);
    g.lineBetween(400, 300 - 86, 400, 300 - 76);
    g.lineBetween(400, 300 + 86, 400, 300 + 76);
    g.lineBetween(400 - 86, 300, 400 - 76, 300);
    g.lineBetween(400 + 86, 300, 400 + 76, 300);
    for (let i = 1; i <= 3; i++) {
      g.lineBetween(400 - 8, 300 + i * 16, 400 + 8, 300 + i * 16);
    }
  }
  g.fillStyle(c, 0.9 * alpha);
  g.fillCircle(400, 300, 1.6);
  if (game.hitMark > 0) {
    g.lineStyle(2, 0xffc46b, game.hitMark);
    g.lineBetween(400 - 9, 300 - 9, 400 - 3, 300 - 3);
    g.lineBetween(400 + 9, 300 - 9, 400 + 3, 300 - 3);
    g.lineBetween(400 - 9, 300 + 9, 400 - 3, 300 + 3);
    g.lineBetween(400 + 9, 300 + 9, 400 + 3, 300 + 3);
  }
}

function drawRadar() {
  const cx = 735, cy = 530, rad = 52;
  g.lineStyle(1, 0x6b5cff, 0.6);
  g.strokeCircle(cx, cy, rad);
  g.lineBetween(cx - rad, cy, cx + rad, cy);
  g.lineBetween(cx, cy - rad, cx, cy + rad);
  g.fillStyle(0xf2f6ff, 0.9);
  g.fillCircle(cx, cy, 2);

  const cs = Math.cos(cam.yaw);
  const sn = Math.sin(cam.yaw);
  for (const e of game.enemies) {
    if (e.dead) continue;
    const dx = e.x - cam.x;
    const dz = e.z - cam.z;
    const rx = dx * cs - dz * sn;
    const rz = dx * sn + dz * cs;
    const s = rad / R;
    const px = Phaser.Math.Clamp(cx + rx * s, cx - rad + 3, cx + rad - 3);
    const py = Phaser.Math.Clamp(cy - rz * s, cy - rad + 3, cy + rad - 3);
    g.fillStyle(TYPES[e.type].color, 0.95);
    g.fillCircle(px, py, 2.5);
    if (e.baseY > 0) {
      g.lineStyle(1, TYPES[e.type].color, 0.5);
      g.strokeCircle(px, py, 5);
    }
  }
}

function drawJumpPips() {
  for (let i = 0; i < 3; i++) {
    const x = 30 + i * 18;
    const y = 68;
    const on = i < cam.jumps;
    g.fillStyle(on ? 0xb388ff : 0x2a2440, on ? 0.95 : 0.8);
    g.fillCircle(x, y, 4.5);
  }
}

function drawBars() {
  const h = Math.max(0, game.health) / 100;
  const s = Math.max(0, game.shield) / 50;
  g.fillStyle(0x1a1428, 0.9);
  g.fillRect(24, 38, 180, 8);
  g.fillRect(24, 52, 180, 6);
  g.fillStyle(0x7dffb0, 0.95);
  g.fillRect(24, 38, 180 * h, 8);
  g.fillStyle(0x7df9ff, 0.95);
  g.fillRect(24, 52, 180 * s, 6);
}

function rifleBang() {
  try {
    const ctx = scene.sound.context;
    if (!ctx) return;
    const now = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * 0.22);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);

    const src = ctx.createBufferSource();
    src.buffer = buf;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(900, now);
    lp.frequency.exponentialRampToValueAtTime(180, now + 0.18);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.3, now);
    ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    src.connect(lp);
    lp.connect(ng);
    ng.connect(ctx.destination);
    src.start(now);
    src.stop(now + 0.24);

    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(95, now);
    o.frequency.exponentialRampToValueAtTime(38, now + 0.16);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.22, now);
    og.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    o.connect(og);
    og.connect(ctx.destination);
    o.start(now);
    o.stop(now + 0.22);

    const crack = ctx.createBufferSource();
    crack.buffer = buf;
    const crackBp = ctx.createBiquadFilter();
    crackBp.type = 'bandpass';
    crackBp.frequency.setValueAtTime(2400, now);
    crackBp.Q.value = 0.7;
    const crackG = ctx.createGain();
    crackG.gain.setValueAtTime(0.1, now);
    crackG.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    crack.connect(crackBp);
    crackBp.connect(crackG);
    crackG.connect(ctx.destination);
    crack.start(now);
    crack.stop(now + 0.06);

    const echoAt = now + 0.12;
    const echo = ctx.createBufferSource();
    echo.buffer = buf;
    const echoBp = ctx.createBiquadFilter();
    echoBp.type = 'bandpass';
    echoBp.frequency.setValueAtTime(1200, echoAt);
    echoBp.Q.value = 0.6;
    const echoG = ctx.createGain();
    echoG.gain.setValueAtTime(0.1, echoAt);
    echoG.gain.exponentialRampToValueAtTime(0.0001, echoAt + 0.18);
    echo.connect(echoBp);
    echoBp.connect(echoG);
    echoG.connect(ctx.destination);
    echo.start(echoAt);
    echo.stop(echoAt + 0.2);

    const rumble = ctx.createBufferSource();
    rumble.buffer = buf;
    rumble.loop = true;
    const rumbleLp = ctx.createBiquadFilter();
    rumbleLp.type = 'lowpass';
    rumbleLp.frequency.setValueAtTime(220, now);
    rumbleLp.frequency.exponentialRampToValueAtTime(60, now + 0.35);
    const rumbleG = ctx.createGain();
    rumbleG.gain.setValueAtTime(0.07, now);
    rumbleG.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
    rumble.connect(rumbleLp);
    rumbleLp.connect(rumbleG);
    rumbleG.connect(ctx.destination);
    rumble.start(now);
    rumble.stop(now + 0.44);
  } catch (_) {}
}

function beep(freq, dur, type, vol) {
  try {
    const ctx = scene.sound.context;
    if (!ctx) return;
    const o = ctx.createOscillator();
    const gn = ctx.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    gn.gain.setValueAtTime(vol, ctx.currentTime);
    gn.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(gn);
    gn.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur + 0.02);
  } catch (_) {}
}
