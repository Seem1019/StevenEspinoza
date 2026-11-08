/**
 * Isola H1 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â procedural headphone model + scroll-driven stage.
 * Loaded ONLY through dynamic import() from scripts/stage.ts (after IO + first interaction).
 * Named imports from 'three' so Rollup can tree-shake. No textures or models are fetched:
 * everything is primitives + a RoomEnvironment PMREM + one tiny canvas texture for the contact shadow.
 */
import {
  BoxGeometry,
  CanvasTexture,
  CircleGeometry,
  Color,
  CylinderGeometry,
  Curve,
  DirectionalLight,
  DoubleSide,
  Group,
  LatheGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NeutralToneMapping,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
  type BufferGeometry,
  type Material,
  type Object3D,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export interface FinishColors { shell: string; plate: string; cushion: string; metal: string }
export interface StageApi {
  setProgress(p: number): void;
  setFinish(c: FinishColors): void;
  setVisible(v: boolean): void;
  dispose(): void;
}

const SY = 1.18; // ear cups are ovals: taller than deep
const SZ = 0.92;
const CUP_X = 1.5;
const TAU = Math.PI * 2;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

class ArcCurve extends Curve<Vector3> {
  constructor(private rx: number, private ry: number, private y0: number, private a0: number, private a1: number) { super(); }
  getPoint(t: number, target = new Vector3()) {
    const a = lerp(this.a0, this.a1, t);
    return target.set(this.rx * Math.cos(a), this.y0 + this.ry * Math.sin(a), 0);
  }
}

/** Revolve a (radius, height) profile around Y, then turn it so height runs along +X (cup axis). */
function latheX(points: [number, number][], segments = 72) {
  const g = new LatheGeometry(points.map(([r, h]) => new Vector2(r, h)), segments);
  g.rotateZ(-Math.PI / 2);
  return g;
}
const ringX = (r: number, tube: number, rs = 16, ts = 96, arc = TAU) => new TorusGeometry(r, tube, rs, ts, arc).rotateY(Math.PI / 2);
const discX = (r: number, h: number, seg = 72) => new CylinderGeometry(r, r, h, seg).rotateZ(Math.PI / 2);

interface Part { obj: Object3D; base: Vector3; off: Vector3 }

export function createStage(canvas: HTMLCanvasElement, opts: { colors: FinishColors; narrow: () => boolean }): StageApi {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1.02;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envRT = pmrem.fromScene(room, 0.035);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.95;
  (room as unknown as { dispose?: () => void }).dispose?.();

  const key = new DirectionalLight(0xffffff, 1.4);
  key.position.set(-3, 6, 5);
  const rim = new DirectionalLight(0xdfe8f0, 0.9);
  rim.position.set(4, 2, -5);
  scene.add(key, rim);

  const camera = new PerspectiveCamera(30, 1, 0.1, 100);

  // ---------- materials ----------
  const m = {
    shell: new MeshPhysicalMaterial({ color: opts.colors.shell, roughness: 0.52, metalness: 0, clearcoat: 0.45, clearcoatRoughness: 0.42 }),
    plate: new MeshPhysicalMaterial({ color: opts.colors.plate, roughness: 0.36, metalness: 0.25, clearcoat: 0.5, clearcoatRoughness: 0.25 }),
    cushion: new MeshPhysicalMaterial({ color: opts.colors.cushion, roughness: 0.74, sheen: 1, sheenRoughness: 0.55, sheenColor: new Color('#9aa1a8') }),
    metal: new MeshStandardMaterial({ color: opts.colors.metal, metalness: 1, roughness: 0.24 }),
    fabric: new MeshStandardMaterial({ color: '#15171a', roughness: 0.95, side: DoubleSide }),
    accent: new MeshStandardMaterial({ color: '#7d9b8c', metalness: 0.9, roughness: 0.28 }),
    diaphragm: new MeshPhysicalMaterial({ color: '#23262b', metalness: 0.4, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.15, side: DoubleSide }),
    magnet: new MeshStandardMaterial({ color: '#9aa0a7', metalness: 1, roughness: 0.38 }),
    pcb: new MeshStandardMaterial({ color: '#1c2a2e', roughness: 0.5, metalness: 0.15 }),
    chip: new MeshStandardMaterial({ color: '#0c0e10', roughness: 0.3, metalness: 0.35 }),
    battery: new MeshPhysicalMaterial({ color: '#e7eaed', roughness: 0.4, clearcoat: 0.4 }),
    batteryBand: new MeshStandardMaterial({ color: '#4c6a5c', roughness: 0.45 }),
  };
  m.shell.side = DoubleSide;

  const mesh = (g: BufferGeometry, mat: Material, x = 0, y = 0, z = 0, oval = true) => {
    const o = new Mesh(g, mat);
    o.position.set(x, y, z);
    if (oval) o.scale.set(1, SY, SZ);
    return o;
  };

  // ---------- model ----------
  const pivot = new Group();
  const model = new Group();
  model.position.y = -0.9;
  pivot.add(model);
  scene.add(pivot);
  const parts: Part[] = [];
  const add = (parent: Group, obj: Object3D, ox: number, oy = 0) => {
    parent.add(obj);
    parts.push({ obj, base: obj.position.clone(), off: new Vector3(ox, oy, 0) });
  };

  // shared geometries (reused by both sides)
  const g = {
    cushion: new TorusGeometry(0.56, 0.17, 28, 96).rotateY(Math.PI / 2),
    fabric: new CircleGeometry(0.52, 64).rotateY(-Math.PI / 2),
    cone: latheX([[0.001, 0.075], [0.05, 0.08], [0.09, 0.092], [0.1, 0.1], [0.22, 0.06], [0.34, 0.018], [0.37, 0.004], [0.395, 0.0], [0.415, 0.012], [0.43, 0.03]], 64),
    frame: ringX(0.43, 0.022, 12, 96),
    magnet: discX(0.17, 0.16, 48),
    shell: latheX([[0.69, 0], [0.712, 0.04], [0.722, 0.12], [0.712, 0.22], [0.682, 0.3], [0.628, 0.37], [0.56, 0.42], [0.505, 0.445]], 96),
    shellRim: ringX(0.69, 0.02, 12, 120),
    plate: discX(0.508, 0.03, 96),
    plateRing: ringX(0.512, 0.013, 10, 120),
    yoke: new TorusGeometry(0.8, 0.04, 16, 96, Math.PI).rotateY(Math.PI / 2),
    pivotPin: new CylinderGeometry(0.055, 0.055, 0.16, 32).rotateX(Math.PI / 2),
    slider: new CylinderGeometry(0.028, 0.028, 0.52, 24),
    board: discX(0.4, 0.035, 64),
    chipBig: new BoxGeometry(0.03, 0.2, 0.2),
    chipCap: new BoxGeometry(0.006, 0.13, 0.13),
    chipSmall: new BoxGeometry(0.026, 0.08, 0.11),
    battery: new RoundedBoxGeometry(0.13, 0.72, 0.44, 4, 0.045),
    batteryBand: new BoxGeometry(0.134, 0.08, 0.444),
  };

  for (const s of [-1, 1] as const) {
    const side = new Group();
    side.position.x = s * CUP_X;
    side.scale.x = s; // mirror: local +X always points outward
    model.add(side);

    const cush = mesh(g.cushion, m.cushion, 0.17);
    cush.scale.x = 0.85;
    add(side, cush, -0.78);
    add(side, mesh(g.fabric, m.fabric, 0.09), -0.42);

    const driver = new Group();
    driver.position.x = 0.27;
    driver.add(mesh(g.cone, m.diaphragm, 0, 0, 0, false), mesh(g.frame, m.accent, 0, 0, 0, false), mesh(g.magnet, m.magnet, 0.16, 0, 0, false));
    add(side, driver, -0.02);

    if (s < 0) {
      const board = new Group();
      board.position.x = 0.52;
      board.add(mesh(g.board, m.pcb, 0, 0, 0));
      board.add(mesh(g.chipBig, m.chip, 0.03, 0.06, 0.02, false));
      board.add(mesh(g.chipCap, m.metal, 0.047, 0.06, 0.02, false));
      board.add(mesh(g.chipSmall, m.chip, 0.03, -0.26, 0.12, false));
      board.add(mesh(g.chipSmall, m.chip, 0.03, 0.34, -0.12, false));
      board.add(mesh(g.chipSmall, m.chip, 0.03, -0.22, -0.18, false));
      add(side, board, 0.42);
    } else {
      const batt = new Group();
      batt.position.x = 0.52;
      batt.add(mesh(g.battery, m.battery, 0, 0, 0, false), mesh(g.batteryBand, m.batteryBand, 0, 0.14, 0, false));
      add(side, batt, 0.42);
    }

    const shell = new Group();
    shell.position.x = 0.3;
    shell.add(mesh(g.shell, m.shell), mesh(g.shellRim, m.shell));
    const yoke = mesh(g.yoke, m.metal, 0.22, 0, 0, false);
    yoke.scale.set(1, 1.17, 1);
    shell.add(yoke, mesh(g.pivotPin, m.metal, 0.22, 0, 0.75, false), mesh(g.pivotPin, m.metal, 0.22, 0, -0.75, false));
    add(side, shell, 1.0);

    const plate = new Group();
    plate.position.x = 0.755;
    plate.add(mesh(g.plate, m.plate), mesh(g.plateRing, m.metal, 0.004));
    add(side, plate, 1.55);

    add(side, mesh(g.slider, m.metal, 0.52, 1.18, 0, false), 0.5, 0.42);
  }

  // headband (centre): outer aluminium band (flattened tube) + inner padding + hinge blocks
  const band = new Group();
  const outer = new Mesh(new TubeGeometry(new ArcCurve(CUP_X + 0.52, 1.15, 1.45, 0, Math.PI), 160, 0.062, 20), m.shell);
  outer.scale.z = 2.7;
  const pad = new Mesh(new TubeGeometry(new ArcCurve(CUP_X + 0.45, 1.06, 1.45, 0.22, Math.PI - 0.22), 140, 0.07, 20), m.cushion);
  pad.scale.z = 2.25;
  const hingeG = new RoundedBoxGeometry(0.15, 0.24, 0.22, 3, 0.05);
  band.add(outer, pad, mesh(hingeG, m.metal, CUP_X + 0.52, 1.47, 0, false), mesh(hingeG, m.metal, -(CUP_X + 0.52), 1.47, 0, false));
  add(model, band, 0, 0.9);

  // contact shadow (faux): radial gradient on a plane under the model
  const sc = document.createElement('canvas');
  sc.width = 256; sc.height = 128;
  const ctx = sc.getContext('2d')!;
  ctx.setTransform(2, 0, 0, 1, 0, 0); // ellipse: draw a circle in a 2x-wide space
  const grd = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(22,26,31,0.5)');
  grd.addColorStop(0.5, 'rgba(22,26,31,0.16)');
  grd.addColorStop(1, 'rgba(22,26,31,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 128, 128);
  const shadowTex = new CanvasTexture(sc);
  const shadowMat = new MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, toneMapped: false });
  const shadow = new Mesh(new PlaneGeometry(5.4, 2).rotateX(-Math.PI / 2), shadowMat);
  shadow.position.y = -1.86;
  scene.add(shadow);

  // ---------- animation state ----------
  let target = 0;
  let current = -1; // force first apply
  let visible = true;
  let raf = 0;
  let w = 1, h = 1;

  const apply = (p: number) => {
    const narrow = opts.narrow();
    const aspect = w / h;
    const yawEnd = (narrow ? -1.1 : -0.5) + TAU;
    const yaw0 = 0.9;
    const e = smooth(0.42, 0.76, p);
    const spin = smooth(0, 0.44, p);
    pivot.rotation.y = lerp(yaw0, yawEnd, spin) - smooth(0.76, 1, p) * (narrow ? 0.15 : 0.28);
    pivot.rotation.z = Math.sin(spin * Math.PI) * 0.05;
    for (const part of parts) part.obj.position.copy(part.base).addScaledVector(part.off, e);

    // Fit a bounding sphere (rotation-proof): radius grows while exploding.
    const radius = narrow ? lerp(2.7, 2.9, e) : lerp(2.45, 3.3, e);
    const tv = Math.tan((camera.fov * Math.PI) / 360);
    const half = Math.min(Math.atan(tv), Math.atan(tv * aspect));
    const dist = radius / Math.sin(half);
    const elev = 0.16;
    const ty = lerp(0, 0.3, e);
    camera.position.set(0, ty + dist * Math.sin(elev), dist * Math.cos(elev));
    camera.lookAt(0, ty, 0);

    shadow.scale.set(narrow ? lerp(0.8, 0.95, e) : lerp(1, 1.5, e), 1, lerp(1, 1.25, e));
    shadowMat.opacity = lerp(narrow ? 0.7 : 1, 0.45, e);
  };

  const frame = () => {
    raf = 0;
    if (current < 0) current = target;
    else current += (target - current) * 0.14;
    if (Math.abs(target - current) < 0.0004) current = target;
    apply(current);
    renderer.render(scene, camera);
    if (current !== target) kick();
  };
  const kick = () => { if (!raf && visible) raf = requestAnimationFrame(frame); };
  const redraw = () => { if (current >= 0) { apply(current); renderer.render(scene, camera); } else kick(); };

  const resize = () => {
    const box = canvas.parentElement!;
    w = Math.max(1, box.clientWidth);
    h = Math.max(1, box.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    redraw();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement!);
  resize();

  return {
    setProgress(p) { target = clamp01(p); kick(); },
    setFinish(c) {
      m.shell.color.set(c.shell);
      m.plate.color.set(c.plate);
      m.cushion.color.set(c.cushion);
      m.metal.color.set(c.metal);
      redraw();
    },
    setVisible(v) {
      visible = v;
      if (!v && raf) { cancelAnimationFrame(raf); raf = 0; }
      if (v) kick();
    },
    dispose() {
      visible = false;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      const geos = new Set<BufferGeometry>();
      const mats = new Set<Material>();
      scene.traverse((o) => {
        const me = o as Mesh;
        if (me.isMesh) {
          geos.add(me.geometry);
          (Array.isArray(me.material) ? me.material : [me.material]).forEach((x) => mats.add(x));
        }
      });
      geos.forEach((x) => x.dispose());
      mats.forEach((x) => x.dispose());
      shadowTex.dispose();
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
