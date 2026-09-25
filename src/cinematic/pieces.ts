// Procedural set pieces for the Growth Engine world. Every object stands for a real part of the
// portfolio (see docs/cinematic-3d/PLAN.md): shapes echo the section icons, colours encode lead
// state (cyan = new, emerald = qualified, gold = meeting) and motion only shows a process.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {
  CONSTELLATION_Y,
  RAIL_END,
  RAIL_START,
  STATION_POSITIONS,
  WORK_ANGLES,
  WORK_POSITIONS,
} from './shots';

export const PALETTE = {
  ink: new THREE.Color('#020817'),
  steel: new THREE.Color('#0b1a2a'),
  glass: new THREE.Color('#0d2a3a'),
  cyan: new THREE.Color('#67e8f9'),
  emerald: new THREE.Color('#6ee7b7'),
  blue: new THREE.Color('#60a5fa'),
  gold: new THREE.Color('#f5c46b'),
  slate: new THREE.Color('#3b4d63'),
};

export interface PieceContext {
  time: number;
  dt: number;
  /** 0..1, how close the camera's focus is to this piece. */
  activity: number;
  energy: number;
  split: number;
  reduced: boolean;
  /** Scroll-driven hero lead along the funnel (station index 0..4), null when hidden. */
  lead: number | null;
}

export interface Piece {
  group: THREE.Group;
  centre: THREE.Vector3;
  /** Focus radius used for the activity falloff. */
  reach: number;
  update(ctx: PieceContext): void;
}

export interface Quality {
  particles: number;
  low: boolean;
}

// ---------------------------------------------------------------------------------------------
// Shared helpers

const hdr = (color: THREE.Color, strength: number) => color.clone().multiplyScalar(strength);

/** Materials whose brightness follows a piece's activity. */
class Dimmer {
  private entries: { mat: THREE.Material & { color: THREE.Color }; base: THREE.Color }[] = [];
  private uniforms: { u: { value: number }; base: number }[] = [];
  add<M extends THREE.Material & { color: THREE.Color }>(mat: M): M {
    this.entries.push({ mat, base: mat.color.clone() });
    return mat;
  }
  addUniform(u: { value: number }) {
    this.uniforms.push({ u, base: u.value });
  }
  apply(level: number) {
    for (const { mat, base } of this.entries) mat.color.copy(base).multiplyScalar(level);
    for (const { u, base } of this.uniforms) u.value = base * level;
  }
}

function glowLine(color: THREE.Color, strength = 1.6, opacity = 1) {
  return new THREE.LineBasicMaterial({
    color: hdr(color, strength),
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
}

function glowBasic(color: THREE.Color, strength = 2, opacity = 1) {
  return new THREE.MeshBasicMaterial({
    color: hdr(color, strength),
    transparent: opacity < 1,
    opacity,
    toneMapped: false,
  });
}

function glassMaterial(tint: THREE.Color, opacity = 0.5) {
  return new THREE.MeshPhysicalMaterial({
    color: PALETTE.glass.clone().lerp(tint, 0.12),
    metalness: 0.05,
    roughness: 0.14,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    transparent: true,
    opacity,
    emissive: tint.clone().multiplyScalar(0.08),
    envMapIntensity: 1.4,
    depthWrite: false,
  });
}

const steelMaterial = () =>
  new THREE.MeshStandardMaterial({ color: PALETTE.steel, metalness: 0.65, roughness: 0.42, envMapIntensity: 0.8 });

/** Arc-length sampled curve for cheap per-frame lookups. */
export class Track {
  readonly points: THREE.Vector3[];
  constructor(curve: THREE.Curve<THREE.Vector3>, samples = 240) {
    this.points = curve.getSpacedPoints(samples);
  }
  at(u: number, out: THREE.Vector3) {
    const f = Math.min(0.99999, Math.max(0, u)) * (this.points.length - 1);
    const i = Math.floor(f);
    return out.copy(this.points[i]).lerp(this.points[i + 1], f - i);
  }
  /** Parameter of the sample closest to a point (used to find where a station sits on a path). */
  nearest(p: THREE.Vector3) {
    let best = 0;
    let bestD = Infinity;
    this.points.forEach((q, i) => {
      const d = q.distanceToSquared(p);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best / (this.points.length - 1);
  }
}

const DASH_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const DASH_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
uniform float uTime;
uniform float uDash;
uniform float uLevel;
varying vec2 vUv;
void main() {
  float d = fract(vUv.x * uDash - uTime);
  float pulse = smoothstep(0.0, 0.12, d) * (1.0 - smoothstep(0.28, 0.46, d));
  gl_FragColor = vec4(uColor * (0.22 + pulse * 1.1) * uLevel, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

/** A thin tube whose dashes travel in the flow direction. */
function dashedTube(curve: THREE.Curve<THREE.Vector3>, color: THREE.Color, radius = 0.025, dashes = 30) {
  const uniforms = {
    uColor: { value: hdr(color, 1.4) },
    uTime: { value: 0 },
    uDash: { value: dashes },
    uLevel: { value: 1 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: DASH_VERTEX,
    fragmentShader: DASH_FRAGMENT,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 160, radius, 6, false), material);
  return { mesh, uniforms };
}

/** Instanced glowing beads: one draw call per flow. */
function beads(count: number, radius: number) {
  const mesh = new THREE.InstancedMesh(
    new THREE.SphereGeometry(radius, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
    count,
  );
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  const white = new THREE.Color(1, 1, 1);
  for (let i = 0; i < count; i++) mesh.setColorAt(i, white);
  return mesh;
}

function makeRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function label(text: string, color: string, width = 1.3) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const g = canvas.getContext('2d')!;
  g.font = '700 64px "Space Grotesk", Inter, system-ui, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.letterSpacing = '10px';
  g.shadowColor = color;
  g.shadowBlur = 18;
  g.fillStyle = color;
  g.fillText(text, 256, 66);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false }),
  );
  sprite.scale.set(width, width / 4, 1);
  return sprite;
}

const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

// ---------------------------------------------------------------------------------------------
// Floor and atmosphere

export function createFloor() {
  const uniforms = { uLine: { value: new THREE.Color('#0b2738') }, uGlow: { value: hdr(PALETTE.emerald, 0.5) } };
  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vWorld = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uLine;
      uniform vec3 uGlow;
      varying vec3 vWorld;
      float grid(vec2 p, float s) {
        vec2 q = p / s;
        vec2 g = abs(fract(q - 0.5) - 0.5) / fwidth(q);
        return 1.0 - min(min(g.x, g.y), 1.0);
      }
      void main() {
        float d = length(vWorld.xz);
        float lines = grid(vWorld.xz, 1.0) * 0.35 + grid(vWorld.xz, 5.0) * 0.9;
        float fade = exp(-d * 0.04);
        vec3 col = uLine * lines * fade + uGlow * exp(-d * 0.38) * 0.4;
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), material);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

export function createDust(count: number) {
  const random = makeRandom(7);
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 3 + random() * 30;
    const a = random() * Math.PI * 2;
    positions.set([Math.cos(a) * r, 0.4 + random() * 12, Math.sin(a) * r], i * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: hdr(PALETTE.cyan, 0.9),
      size: 0.06,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    }),
  );
  return {
    points,
    update(time: number) {
      points.rotation.y = time * 0.006;
      points.position.y = Math.sin(time * 0.15) * 0.25;
    },
  };
}

// ---------------------------------------------------------------------------------------------
// The core: four glass layers (lead infrastructure, automation, publishing, creative operations)

const LAYER_TINTS = [PALETTE.emerald, PALETTE.cyan, PALETTE.blue, PALETTE.gold];

function coreLayers(scale = 1) {
  const group = new THREE.Group();
  const slabGeometry = new RoundedBoxGeometry(2.4, 0.4, 2.4, 3, 0.1);
  const edgeGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(2.42, 0.42, 2.42));
  const slabs: THREE.Group[] = [];
  const lattice = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), glowBasic(PALETTE.cyan, 1.2), 36);
  const m = new THREE.Matrix4();
  LAYER_TINTS.forEach((tint, i) => {
    const slab = new THREE.Group();
    slab.add(new THREE.Mesh(slabGeometry, glassMaterial(tint, 0.46)));
    slab.add(new THREE.LineSegments(edgeGeometry, glowLine(tint, 1.5, 0.85)));
    slabs.push(slab);
    group.add(slab);
  });
  group.add(lattice);
  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1, 0.2), glowBasic(PALETTE.cyan, 2.6));
  group.add(spine);
  group.scale.setScalar(scale);

  function layout(split: number) {
    let k = 0;
    slabs.forEach((slab, i) => {
      slab.position.y = 0.3 + i * 0.48 + split * i * 1.0;
      // A 3 x 3 lattice inside each slab: the technical layer seen through the glass.
      for (let x = -1; x <= 1; x++) {
        for (let z = -1; z <= 1; z++) {
          m.makeTranslation(x * 0.62, slab.position.y, z * 0.62);
          lattice.setMatrixAt(k++, m);
        }
      }
    });
    lattice.instanceMatrix.needsUpdate = true;
    const top = slabs[slabs.length - 1].position.y + 0.25;
    spine.scale.y = top + 0.5;
    spine.position.y = (top + 0.5) / 2 - 0.1;
  }
  layout(0);
  return { group, layout, top: () => slabs[slabs.length - 1].position.y };
}

export function createCore(): Piece & { lightTarget: THREE.Vector3 } {
  const group = new THREE.Group();
  const layers = coreLayers();
  group.add(layers.group);

  const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.012, 6, 160), glowBasic(PALETTE.emerald, 2));
  ringA.rotation.x = Math.PI / 2;
  const ringB = new THREE.Mesh(new THREE.TorusGeometry(2.45, 0.008, 6, 160), glowBasic(PALETTE.cyan, 1.6, 0.8));
  ringB.rotation.x = Math.PI / 2 + 0.22;
  group.add(ringA, ringB);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.4, 0.1, 64), steelMaterial());
  base.position.y = 0.05;
  const baseRing = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.02, 4, 96), glowBasic(PALETTE.emerald, 1.8));
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = 0.1;
  group.add(base, baseRing);

  const light = new THREE.PointLight(PALETTE.emerald, 14, 14, 2);
  light.position.y = 1.2;
  group.add(light);

  let split = -1;
  return {
    group,
    centre: new THREE.Vector3(0, 1, 0),
    reach: 6,
    lightTarget: new THREE.Vector3(0, 1, 0),
    update({ time, split: s, energy, reduced }) {
      if (Math.abs(s - split) > 0.0005) {
        split = s;
        layers.layout(s);
      }
      const top = layers.top();
      ringA.position.y = 0.3 + top * 0.5;
      ringB.position.y = 0.3 + top * 0.62;
      if (!reduced) {
        ringA.rotation.z = time * 0.25;
        ringB.rotation.z = -time * 0.18;
      }
      light.intensity = 10 + energy * 10 + (reduced ? 0 : Math.sin(time * 1.6) * 2);
    },
  };
}

// ---------------------------------------------------------------------------------------------
// Stations: pedestal + an object echoing the section icon (Target, BarChart3, Database,
// Workflow, MessageCircle) + the short label already used in the hero visual.

const STATION_LABELS = ['ADS', 'DATA', 'CRM', 'OPS', 'FOLLOW'];
const STATION_TINTS = [PALETTE.cyan, PALETTE.cyan, PALETTE.emerald, PALETTE.emerald, PALETTE.gold];

function stationIcon(index: number, tint: THREE.Color) {
  const g = new THREE.Group();
  const steel = steelMaterial();
  const glow = glowBasic(tint, 2.2);
  switch (index) {
    case 0: {
      // Target: concentric rings.
      [0.55, 0.38, 0.21].forEach((r, i) => {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.035, 8, 64), i === 1 ? steel : glow);
        g.add(ring);
      });
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 12), glowBasic(PALETTE.gold, 3)));
      g.position.y = 0.95;
      break;
    }
    case 1: {
      // Bar chart.
      [0.35, 0.62, 0.46, 0.88].forEach((h, i) => {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.17, h, 0.17), steel);
        bar.position.set(-0.33 + i * 0.22, h / 2, 0);
        const cap = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.04, 0.17), glow);
        cap.position.set(bar.position.x, h + 0.02, 0);
        g.add(bar, cap);
      });
      g.position.y = 0.3;
      break;
    }
    case 2: {
      // Database: stacked discs with glowing seams.
      for (let i = 0; i < 3; i++) {
        const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.2, 40), steel);
        disc.position.y = i * 0.26;
        const seam = new THREE.Mesh(new THREE.TorusGeometry(0.455, 0.014, 6, 64), glow);
        seam.rotation.x = Math.PI / 2;
        seam.position.y = i * 0.26 + 0.1;
        g.add(disc, seam);
      }
      g.position.y = 0.42;
      break;
    }
    case 3: {
      // Workflow: two blocks joined by an elbow connector.
      const a = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.36, 0.36, 2, 0.06), steel);
      const b = a.clone();
      a.position.set(-0.32, 0.78, 0);
      b.position.set(0.32, 0.22, 0);
      const path = new THREE.CatmullRomCurve3(
        [new THREE.Vector3(-0.32, 0.6, 0), new THREE.Vector3(-0.32, 0.22, 0), new THREE.Vector3(0.14, 0.22, 0)],
        false,
        'catmullrom',
        0.01,
      );
      g.add(a, b, new THREE.Mesh(new THREE.TubeGeometry(path, 24, 0.03, 6), glow));
      g.position.y = 0.25;
      break;
    }
    default: {
      // Message bubble.
      const bubble = new THREE.Mesh(new RoundedBoxGeometry(0.95, 0.62, 0.26, 3, 0.14), steel);
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 4), steel);
      tail.position.set(-0.28, -0.38, 0);
      tail.rotation.z = 0.5;
      g.add(bubble, tail);
      [-0.22, 0, 0.22].forEach((x) => {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), glow);
        dot.position.set(x, 0, 0.14);
        g.add(dot);
      });
      g.position.y = 0.95;
    }
  }
  return g;
}

export function createStations(): Piece[] {
  return STATION_POSITIONS.map((p, index) => {
    const tint = STATION_TINTS[index];
    const group = new THREE.Group();
    group.position.set(...p);
    const dimmer = new Dimmer();

    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.12, 0.22, 6), steelMaterial());
    pedestal.position.y = 0.11;
    const hex = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.022, 4, 6), dimmer.add(glowBasic(tint, 1.8)));
    hex.rotation.x = Math.PI / 2;
    hex.rotation.z = Math.PI / 6;
    hex.position.y = 0.23;
    const icon = stationIcon(index, tint);
    // Face the core so the silhouette reads from the hero camera.
    icon.rotation.y = Math.atan2(-p[0], -p[2]);
    const iconY = icon.position.y;
    const tag = label(STATION_LABELS[index], `#${tint.getHexString()}`);
    tag.position.y = 2.05;
    group.add(pedestal, hex, icon, tag);


    return {
      group,
      centre: new THREE.Vector3(p[0], 1, p[2]),
      reach: 7,
      update({ time, activity, reduced }) {
        dimmer.apply(0.45 + activity * 0.75);
        icon.position.y = iconY + (reduced ? 0 : Math.sin(time * 1.2 + index) * 0.05);
      },
    };
  });
}

// ---------------------------------------------------------------------------------------------
// Main funnel flow: ad click → stations → meetings, absorbed back into the core.

export function createFunnelFlow(quality: Quality): Piece {
  const group = new THREE.Group();
  const [first] = STATION_POSITIONS;
  // Leads arrive from above the Acquisition station (the ad click), then run the funnel.
  const pts = [
    new THREE.Vector3(first[0] * 1.15, 4, first[2] * 1.15),
    new THREE.Vector3(first[0] * 1.12, 2.6, first[2] * 1.12),
    ...STATION_POSITIONS.map((p) => new THREE.Vector3(p[0], 0.95, p[2])),
    new THREE.Vector3(STATION_POSITIONS[4][0] * 0.55, 0.7, STATION_POSITIONS[4][2] * 0.55),
    new THREE.Vector3(0, 0.9, 0),
  ];
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const track = new Track(curve, 400);
  const tube = dashedTube(curve, PALETTE.cyan, 0.022, 60);
  group.add(tube.mesh);

  const stationU = STATION_POSITIONS.map((p) => track.nearest(new THREE.Vector3(p[0], 0.95, p[2])));

  // The hero lead: one larger bead with a halo that follows the reader's scroll through the funnel.
  const heroLead = new THREE.Group();
  const leadCore = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 14), glowBasic(PALETTE.cyan, 3));
  const leadHalo = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.018, 6, 48), glowBasic(PALETTE.cyan, 2.2));
  heroLead.add(leadCore, leadHalo);
  heroLead.visible = false;
  group.add(heroLead);
  let leadShown = 0;
  const count = quality.particles;
  const flow = beads(count, 0.075);
  group.add(flow);

  const random = makeRandom(42);
  const phase = Array.from({ length: count }, () => random());
  // 40% of leads never qualify: they fade between Measurement and CRM.
  const unqualified = Array.from({ length: count }, (_, i) => i % 5 === 1 || i % 5 === 3);
  const dropAt = unqualified.map(() => stationU[1] + (stationU[2] - stationU[1]) * (0.2 + random() * 0.6));

  const m = new THREE.Matrix4();
  const p = new THREE.Vector3();
  const c = new THREE.Color();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  let clock = 0;

  return {
    group,
    centre: new THREE.Vector3(0, 1, -2),
    reach: 12,
    update({ dt, time, energy, reduced, activity, lead }) {
      clock += reduced ? 0 : dt * (0.035 + energy * 0.05);
      leadShown += ((lead === null ? 0 : 1) - leadShown) * Math.min(1, dt * 5 || 1);
      heroLead.visible = leadShown > 0.02;
      if (heroLead.visible) {
        const step = lead ?? 4;
        const i = Math.min(3, Math.floor(step));
        const u = stationU[i] + (stationU[i + 1] - stationU[i]) * (step - i);
        track.at(u, heroLead.position);
        heroLead.position.y += 0.35;
        const tint = step < 2 ? PALETTE.cyan : step < 3.5 ? PALETTE.emerald : PALETTE.gold;
        (leadCore.material as THREE.MeshBasicMaterial).color.copy(tint).multiplyScalar(3);
        (leadHalo.material as THREE.MeshBasicMaterial).color.copy(tint).multiplyScalar(2.2);
        heroLead.scale.setScalar(leadShown * (1 + (reduced ? 0 : Math.sin(time * 4) * 0.08)));
        leadHalo.lookAt(heroLead.position.clone().add(new THREE.Vector3(0, 0, 1)));
      }
      tube.uniforms.uTime.value = clock * 16;
      tube.uniforms.uLevel.value = 0.55 + activity * 0.6;
      for (let i = 0; i < count; i++) {
        const u = (phase[i] + clock) % 1;
        track.at(u, p);
        let scale = 1;
        if (u < stationU[2]) c.copy(PALETTE.cyan);
        else if (u < stationU[4]) c.copy(PALETTE.emerald);
        else c.copy(PALETTE.gold);
        if (unqualified[i] && u > dropAt[i]) {
          const t = smooth(dropAt[i], dropAt[i] + 0.05, u);
          scale = 1 - t;
          c.copy(PALETTE.slate);
          p.y -= t * 0.6;
        }
        scale *= smooth(0, 0.03, u) * (1 - smooth(0.96, 1, u));
        c.multiplyScalar(2.2);
        m.compose(p, q, s.setScalar(Math.max(0.0001, scale)));
        flow.setMatrixAt(i, m);
        flow.setColorAt(i, c);
      }
      flow.instanceMatrix.needsUpdate = true;
      if (flow.instanceColor) flow.instanceColor.needsUpdate = true;
    },
  };
}

// ---------------------------------------------------------------------------------------------
// Selected work set pieces

function workBase(index: number, tint: THREE.Color, dimmer: Dimmer) {
  const group = new THREE.Group();
  const [x, , z] = WORK_POSITIONS[index];
  group.position.set(x, 0, z);
  // Face outward so the camera (outside the ring) sees the front.
  group.rotation.y = -((WORK_ANGLES[index] * Math.PI) / 180) + Math.PI / 2;
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.6, 0.16, 64), steelMaterial());
  plinth.position.y = 0.08;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(3.5, 0.02, 4, 128), dimmer.add(glowBasic(tint, 1.6)));
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.17;
  group.add(plinth, rim);
  return group;
}

/** 01 — High-ticket lead generation: a funnel of rings where only qualified leads reach the meeting pad. */
export function createLeadFunnel(quality: Quality): Piece {
  const dimmer = new Dimmer();
  const group = workBase(0, PALETTE.cyan, dimmer);
  const rings = 7;
  const radiusAt = (y: number) => 0.28 + ((y - 0.9) / 2.6) * 1.5;
  for (let i = 0; i < rings; i++) {
    const y = 0.9 + (i / (rings - 1)) * 2.6;
    const tint = PALETTE.emerald.clone().lerp(PALETTE.cyan, i / (rings - 1));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radiusAt(y), 0.03, 8, 96), dimmer.add(glowBasic(tint, 1.9)));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    group.add(ring);
  }
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.12, 40), dimmer.add(glowBasic(PALETTE.gold, 1.6)));
  pad.position.y = 0.3;
  group.add(pad);

  const count = Math.round(quality.particles * 0.7);
  const flow = beads(count, 0.07);
  group.add(flow);
  const random = makeRandom(11);
  const phase = Array.from({ length: count }, () => random());
  const unqualified = Array.from({ length: count }, (_, i) => i % 5 === 0 || i % 5 === 2);
  const m = new THREE.Matrix4();
  const p = new THREE.Vector3();
  const c = new THREE.Color();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  let clock = 0;
  let padPulse = 0;

  return {
    group,
    centre: new THREE.Vector3(WORK_POSITIONS[0][0], 1.4, WORK_POSITIONS[0][2]),
    reach: 9,
    update({ dt, activity, energy, reduced }) {
      dimmer.apply(0.35 + activity * 0.8);
      clock += reduced ? 0 : dt * (0.05 + energy * 0.08) * (0.3 + activity);
      padPulse = Math.max(0, padPulse - dt * 1.5);
      for (let i = 0; i < count; i++) {
        const u = (phase[i] + clock) % 1;
        const y = 3.9 - u * 3.6;
        const r = y > 0.9 ? radiusAt(Math.min(3.5, y)) * 0.8 : 0.2 * (y / 0.9);
        const a = phase[i] * 40 + u * Math.PI * 7;
        p.set(Math.cos(a) * r, y, Math.sin(a) * r);
        let scale = 1;
        c.copy(u < 0.55 ? PALETTE.cyan : PALETTE.emerald);
        if (unqualified[i] && u > 0.42) {
          // Filtered out: drift outward and fade instead of reaching the meeting pad.
          const t = smooth(0.42, 0.55, u);
          p.x *= 1 + t * 1.2;
          p.z *= 1 + t * 1.2;
          scale = 1 - t;
          c.copy(PALETTE.slate);
        }
        if (!unqualified[i] && u > 0.9) {
          c.copy(PALETTE.gold);
          if (u > 0.985) padPulse = 1;
        }
        scale *= smooth(0, 0.05, u);
        c.multiplyScalar(2.3);
        m.compose(p, q, s.setScalar(Math.max(0.0001, scale)));
        flow.setMatrixAt(i, m);
        flow.setColorAt(i, c);
      }
      flow.instanceMatrix.needsUpdate = true;
      if (flow.instanceColor) flow.instanceColor.needsUpdate = true;
      pad.scale.setScalar(1 + padPulse * 0.12);
    },
  };
}

/** 02 — Custom CRM: intake → router hub (with a sweeping SLA ring) → three follow-up owners. */
export function createCrmRouter(quality: Quality): Piece {
  const dimmer = new Dimmer();
  const group = workBase(1, PALETTE.emerald, dimmer);

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.85, 0.34, 48), steelMaterial());
  hub.position.y = 0.45;
  const hubRing = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.025, 6, 64), dimmer.add(glowBasic(PALETTE.emerald, 2)));
  hubRing.rotation.x = Math.PI / 2;
  hubRing.position.y = 0.63;
  const sla = new THREE.Mesh(
    new THREE.TorusGeometry(1.25, 0.03, 6, 96, Math.PI * 1.5),
    dimmer.add(glowBasic(PALETTE.gold, 1.8)),
  );
  sla.rotation.x = Math.PI / 2;
  sla.position.y = 0.66;
  const slaTrack = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.008, 4, 96), dimmer.add(glowBasic(PALETTE.slate, 1.2)));
  slaTrack.rotation.x = Math.PI / 2;
  slaTrack.position.y = 0.66;
  group.add(hub, hubRing, sla, slaTrack);

  const intake = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.2, 1.8, 0.4),
    new THREE.Vector3(-2, 0.9, 0.2),
    new THREE.Vector3(-0.8, 0.65, 0),
    new THREE.Vector3(0, 0.65, 0),
  ]);
  const owners = [-1.5, 0, 1.5].map((zz) => new THREE.Vector3(2.4, 0.4, zz));
  const lanes = owners.map(
    (o) => new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.65, 0), new THREE.Vector3(1.2, 0.7, o.z * 0.6), o.clone().setY(0.62)]),
  );
  const intakeTube = dashedTube(intake, PALETTE.cyan, 0.02, 18);
  const laneTubes = lanes.map((l) => dashedTube(l, PALETTE.emerald, 0.02, 12));
  group.add(intakeTube.mesh, ...laneTubes.map((t) => t.mesh));
  dimmer.addUniform(intakeTube.uniforms.uLevel);
  laneTubes.forEach((t) => dimmer.addUniform(t.uniforms.uLevel));

  const ownerPads = owners.map((o) => {
    const pad = new THREE.Group();
    pad.position.copy(o);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.1, 32), steelMaterial());
    const person = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.28, 6, 12), steelMaterial());
    person.position.y = 0.35;
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.018, 4, 48), dimmer.add(glowBasic(PALETTE.gold, 1.6)));
    halo.rotation.x = Math.PI / 2;
    halo.position.y = 0.07;
    pad.add(disc, person, halo);
    group.add(pad);
    return halo;
  });

  const intakeTrack = new Track(intake, 120);
  const laneTracks = lanes.map((l) => new Track(l, 120));
  const count = Math.round(quality.particles * 0.6);
  const flow = beads(count, 0.07);
  group.add(flow);
  const phase = Array.from({ length: count }, (_, i) => i / count);
  const m = new THREE.Matrix4();
  const p = new THREE.Vector3();
  const c = new THREE.Color();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  const pulses = [0, 0, 0];
  let clock = 0;

  return {
    group,
    centre: new THREE.Vector3(WORK_POSITIONS[1][0], 1.2, WORK_POSITIONS[1][2]),
    reach: 9,
    update({ dt, time, activity, energy, reduced }) {
      dimmer.apply(0.35 + activity * 0.8);
      const speed = reduced ? 0 : dt * (0.06 + energy * 0.08) * (0.3 + activity);
      clock += speed;
      intakeTube.uniforms.uTime.value = clock * 10;
      laneTubes.forEach((t) => (t.uniforms.uTime.value = clock * 10));
      if (!reduced) sla.rotation.z = -time * 0.9;
      for (let i = 0; i < 3; i++) pulses[i] = Math.max(0, pulses[i] - dt * 1.6);
      for (let i = 0; i < count; i++) {
        const u = (phase[i] + clock) % 1;
        const lane = Math.floor((phase[i] * count) % 3);
        if (u < 0.5) {
          intakeTrack.at(u / 0.5, p);
          c.copy(PALETTE.cyan);
        } else {
          laneTracks[lane].at((u - 0.5) / 0.5, p);
          c.copy(u > 0.92 ? PALETTE.gold : PALETTE.emerald);
          if (u > 0.985) pulses[lane] = 1;
        }
        const scale = smooth(0, 0.04, u) * (1 - smooth(0.97, 1, u));
        c.multiplyScalar(2.3);
        m.compose(p, q, s.setScalar(Math.max(0.0001, scale)));
        flow.setMatrixAt(i, m);
        flow.setColorAt(i, c);
      }
      flow.instanceMatrix.needsUpdate = true;
      if (flow.instanceColor) flow.instanceColor.needsUpdate = true;
      ownerPads.forEach((halo, i) => halo.scale.setScalar(1 + pulses[i] * 0.35));
    },
  };
}

/** 03 — Dashboards, APIs and scheduled utilities: a panel whose bars refresh on each scheduled run. */
export function createDashboard(): Piece {
  const dimmer = new Dimmer();
  const group = workBase(2, PALETTE.blue, dimmer);

  const panel = new THREE.Group();
  panel.position.set(0, 2.15, -1.1);
  const frame = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(3.6, 2.1, 0.06)),
    dimmer.add(glowLine(PALETTE.blue, 1.6)),
  );
  const glass = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.1, 0.04), glassMaterial(PALETTE.blue, 0.35));
  panel.add(glass, frame);
  const linePoints = Array.from({ length: 14 }, (_, i) => new THREE.Vector3(-1.55 + i * 0.24, 0, 0.05));
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
  const chart = new THREE.Line(lineGeometry, dimmer.add(glowLine(PALETTE.emerald, 2.2)));
  panel.add(chart);
  group.add(panel);

  const cols = 5;
  const rows = 3;
  const bars = new THREE.InstancedMesh(new THREE.BoxGeometry(0.34, 1, 0.34), steelMaterial(), cols * rows);
  const caps = new THREE.InstancedMesh(new THREE.BoxGeometry(0.34, 0.04, 0.34), dimmer.add(glowBasic(PALETTE.cyan, 2)), cols * rows);
  group.add(bars, caps);
  const random = makeRandom(5);
  const current = Array.from({ length: cols * rows }, () => 0.3 + random());
  let target = current.map(() => 0.3 + random() * 1.3);
  const series = linePoints.map(() => random());

  const pulse = new THREE.Mesh(new THREE.TorusGeometry(1, 0.02, 4, 96), glowBasic(PALETTE.blue, 2, 0.9));
  pulse.rotation.x = Math.PI / 2;
  pulse.position.y = 0.2;
  group.add(pulse);

  const m = new THREE.Matrix4();
  let untilRun = 0;
  let sincePulse = 10;
  const refresh = () => {
    target = target.map(() => 0.3 + random() * 1.3);
    series.shift();
    series.push(random());
    const pos = lineGeometry.attributes.position as THREE.BufferAttribute;
    series.forEach((v, i) => pos.setY(i, -0.7 + v * 1.3));
    pos.needsUpdate = true;
    sincePulse = 0;
  };
  refresh();

  return {
    group,
    centre: new THREE.Vector3(WORK_POSITIONS[2][0], 1.4, WORK_POSITIONS[2][2]),
    reach: 9,
    update({ dt, activity, reduced }) {
      dimmer.apply(0.35 + activity * 0.8);
      if (!reduced && activity > 0.2) {
        untilRun -= dt;
        if (untilRun <= 0) {
          untilRun = 2.6;
          refresh();
        }
      }
      sincePulse += dt;
      const k = Math.min(1, sincePulse / 1.4);
      pulse.scale.setScalar(0.6 + k * 2.6);
      (pulse.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.9 * activity;
      let i = 0;
      for (let r = 0; r < rows; r++) {
        for (let col = 0; col < cols; col++, i++) {
          current[i] += (target[i] - current[i]) * Math.min(1, dt * (reduced ? 60 : 3));
          const h = current[i];
          const x = -1.1 + col * 0.55;
          const z = -0.2 + r * 0.55;
          m.makeScale(1, h, 1).setPosition(x, 0.16 + h / 2, z);
          bars.setMatrixAt(i, m);
          m.makeTranslation(x, 0.18 + h, z);
          caps.setMatrixAt(i, m);
        }
      }
      bars.instanceMatrix.needsUpdate = true;
      caps.instanceMatrix.needsUpdate = true;
    },
  };
}

/** 04 — SEO content and publishing automation: pages pass a validation gate and stack into two properties. */
export function createPublisher(quality: Quality): Piece {
  const dimmer = new Dimmer();
  const group = workBase(3, PALETTE.emerald, dimmer);

  const belt = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.08, 0.9), steelMaterial());
  belt.position.set(-0.7, 0.42, 0);
  const beltEdge = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(4.6, 0.08, 0.9)),
    dimmer.add(glowLine(PALETTE.cyan, 1.1, 0.8)),
  );
  beltEdge.position.copy(belt.position);
  group.add(belt, beltEdge);

  const gate = new THREE.Group();
  const postGeometry = new THREE.BoxGeometry(0.1, 1.3, 0.1);
  const gateGlow = dimmer.add(glowBasic(PALETTE.cyan, 2.2));
  const left = new THREE.Mesh(postGeometry, gateGlow);
  const right = left.clone();
  left.position.set(0, 1.1, -0.55);
  right.position.set(0, 1.1, 0.55);
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 1.2), gateGlow);
  top.position.set(0, 1.75, 0);
  const scan = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 1.2),
    new THREE.MeshBasicMaterial({
      color: hdr(PALETTE.cyan, 0.5),
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  scan.rotation.y = Math.PI / 2;
  scan.position.set(0, 1.1, 0);
  dimmer.add(scan.material as THREE.MeshBasicMaterial);
  gate.add(left, right, top, scan);
  group.add(gate);

  // Two published properties.
  const towers = [-0.8, 0.8].map((zz) => {
    const t = new THREE.InstancedMesh(new THREE.BoxGeometry(0.62, 0.03, 0.8), dimmer.add(glowBasic(PALETTE.emerald, 0.4)), 22);
    t.position.set(2.3, 0.2, zz);
    group.add(t);
    return t;
  });

  const count = Math.max(8, Math.round(quality.particles * 0.3));
  const pages = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.55, 0.035, 0.72),
    new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
    count,
  );
  pages.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const white = new THREE.Color(1, 1, 1);
  for (let i = 0; i < count; i++) pages.setColorAt(i, white);
  group.add(pages);
  const m = new THREE.Matrix4();
  const c = new THREE.Color();
  let clock = 0;

  return {
    group,
    centre: new THREE.Vector3(WORK_POSITIONS[3][0], 1.2, WORK_POSITIONS[3][2]),
    reach: 9,
    update({ dt, time, activity, energy, reduced }) {
      dimmer.apply(0.35 + activity * 0.8);
      clock += reduced ? 0 : dt * (0.05 + energy * 0.05) * (0.3 + activity);
      if (!reduced) (scan.material as THREE.MeshBasicMaterial).opacity = (0.18 + Math.sin(time * 5) * 0.08) * activity;
      for (let i = 0; i < count; i++) {
        const u = (i / count + clock) % 1;
        const tower = i % 2;
        if (u < 0.7) {
          const x = -2.9 + (u / 0.7) * 3.6;
          m.makeTranslation(x, 0.5, 0);
          c.copy(x < 0 ? PALETTE.slate : PALETTE.emerald).multiplyScalar(x < 0 ? 1.6 : 2);
        } else {
          const k = (u - 0.7) / 0.3;
          const zz = tower ? 0.8 : -0.8;
          m.makeTranslation(0.7 + k * 1.6, 0.5 + Math.sin(k * Math.PI) * 1.2 + k * 0.9, k * zz);
          c.copy(PALETTE.emerald).multiplyScalar(2);
        }
        pages.setMatrixAt(i, m);
        pages.setColorAt(i, c);
      }
      pages.instanceMatrix.needsUpdate = true;
      if (pages.instanceColor) pages.instanceColor.needsUpdate = true;
      // Towers grow as pages are published, then settle back (a continuous publishing cycle).
      towers.forEach((t, k) => {
        const level = Math.floor(10 + ((time * 0.8 + k * 3) % 12));
        t.count = reduced ? 16 : level;
        for (let j = 0; j < t.count; j++) {
          m.makeTranslation(0, j * 0.11, 0);
          t.setMatrixAt(j, m);
        }
        t.instanceMatrix.needsUpdate = true;
      });
    },
  };
}

// ---------------------------------------------------------------------------------------------
// Tools & stack: five orbits above the core, one tile per listed tool.

const STACK_COUNTS = [4, 6, 9, 8, 5];

export function createConstellation(): Piece {
  const group = new THREE.Group();
  group.position.y = CONSTELLATION_Y;
  const dimmer = new Dimmer();
  const tints = [PALETTE.cyan, PALETTE.emerald, PALETTE.emerald, PALETTE.blue, PALETTE.gold];
  const orbits = STACK_COUNTS.map((n, k) => {
    const orbit = new THREE.Group();
    orbit.rotation.x = (k - 2) * 0.09;
    orbit.rotation.z = (k % 2 ? 1 : -1) * 0.06;
    const radius = 1.8 + k * 0.72;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.008, 4, 160), dimmer.add(glowBasic(tints[k], 1.3, 0.7)));
    ring.rotation.x = Math.PI / 2;
    orbit.add(ring);
    const tiles = new THREE.InstancedMesh(new RoundedBoxGeometry(0.34, 0.1, 0.34, 2, 0.04), dimmer.add(glowBasic(tints[k], 1.7)), n);
    const m = new THREE.Matrix4();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      m.makeRotationY(-a).setPosition(Math.cos(a) * radius, 0, Math.sin(a) * radius);
      tiles.setMatrixAt(i, m);
    }
    orbit.add(tiles);
    group.add(orbit);
    return orbit;
  });
  return {
    group,
    centre: new THREE.Vector3(0, CONSTELLATION_Y, 0),
    reach: 6,
    update({ time, activity, reduced }) {
      dimmer.apply(0.1 + activity * 1.0);
      group.visible = activity > 0.02;
      if (!reduced) orbits.forEach((o, k) => (o.rotation.y = time * (0.05 + k * 0.02) * (k % 2 ? -1 : 1)));
    },
  };
}

// ---------------------------------------------------------------------------------------------
// Experience: a timeline rail from the multi-platform freelance years to the system built today.

export function createTimeline(quality: Quality): Piece {
  const group = new THREE.Group();
  const dimmer = new Dimmer();
  const start = new THREE.Vector3(...RAIL_START);
  const end = new THREE.Vector3(...RAIL_END);
  const curve = new THREE.LineCurve3(start.clone().setY(0.25), end.clone().setY(0.25));
  const rail = dashedTube(curve, PALETTE.emerald, 0.035, 40);
  dimmer.addUniform(rail.uniforms.uLevel);
  group.add(rail.mesh);

  const pylon = (at: THREE.Vector3, tint: THREE.Color) => {
    const g = new THREE.Group();
    g.position.copy(at);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.3, 0.2, 6), steelMaterial());
    base.position.y = 0.1;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.022, 4, 6), dimmer.add(glowBasic(tint, 1.8)));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.22;
    g.add(base, ring);
    group.add(g);
    return g;
  };

  // 2021: four website platforms (WordPress, Shopify, Joomla, Drupal) orbiting one practice.
  const early = pylon(start, PALETTE.cyan);
  const platforms = new THREE.Group();
  platforms.position.y = 1.2;
  for (let i = 0; i < 4; i++) {
    const cube = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.34, 0.34, 2, 0.05), steelMaterial());
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.36, 0.36, 0.36)), dimmer.add(glowLine(PALETTE.cyan, 1.8)));
    const a = (i / 4) * Math.PI * 2;
    cube.position.set(Math.cos(a) * 0.7, Math.sin(i * 1.7) * 0.15, Math.sin(a) * 0.7);
    edge.position.copy(cube.position);
    platforms.add(cube, edge);
  }
  early.add(platforms);

  // Present: a scale model of the growth system built in the current role.
  const present = pylon(end, PALETTE.emerald);
  const model = coreLayers(0.42);
  model.group.position.y = 0.22;
  present.add(model.group);

  const count = Math.max(6, Math.round(quality.particles * 0.2));
  const flow = beads(count, 0.08);
  group.add(flow);
  const m = new THREE.Matrix4();
  const p = new THREE.Vector3();
  const c = new THREE.Color();
  let clock = 0;

  return {
    group,
    centre: start.clone().lerp(end, 0.5).setY(1),
    reach: 14,
    update({ dt, time, activity, reduced }) {
      dimmer.apply(0.25 + activity * 0.9);
      clock += reduced ? 0 : dt * 0.05;
      rail.uniforms.uTime.value = clock * 20;
      if (!reduced) {
        platforms.rotation.y = time * 0.4;
        model.group.rotation.y = -time * 0.15;
      }
      for (let i = 0; i < count; i++) {
        const u = (i / count + clock) % 1;
        p.copy(start).lerp(end, u).setY(0.3);
        c.copy(PALETTE.cyan).lerp(PALETTE.emerald, u).multiplyScalar(2.2);
        m.makeTranslation(p.x, p.y, p.z);
        flow.setMatrixAt(i, m);
        flow.setColorAt(i, c);
      }
      flow.instanceMatrix.needsUpdate = true;
      if (flow.instanceColor) flow.instanceColor.needsUpdate = true;
    },
  };
}

// ---------------------------------------------------------------------------------------------
// Working style: marketing (emerald) and implementation (cyan) streams merging into the core.

export function createStreams(quality: Quality): Piece {
  const group = new THREE.Group();
  const make = (side: number) => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const r = 5.5 * (1 - t) + 0.25;
      const a = side * (1 - t) * Math.PI * 1.6 + (side > 0 ? 0 : Math.PI);
      pts.push(new THREE.Vector3(Math.cos(a) * r, 6.5 - t * 3.6, Math.sin(a) * r - 1.2 * (1 - t)));
    }
    return new THREE.CatmullRomCurve3(pts);
  };
  const curves = [make(1), make(-1)];
  const tints = [PALETTE.emerald, PALETTE.cyan];
  const tracks = curves.map((cv) => new Track(cv, 200));
  const tubes = curves.map((cv, k) => dashedTube(cv, tints[k], 0.02, 36));
  tubes.forEach((t) => group.add(t.mesh));
  const count = Math.round(quality.particles * 0.5);
  const flows = tints.map(() => beads(count, 0.06));
  flows.forEach((f) => group.add(f));
  const m = new THREE.Matrix4();
  const p = new THREE.Vector3();
  const c = new THREE.Color();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  let clock = 0;
  return {
    group,
    centre: new THREE.Vector3(0, 2.6, 0),
    reach: 5,
    update({ dt, activity, reduced }) {
      group.visible = activity > 0.02;
      if (!group.visible) return;
      clock += reduced ? 0 : dt * 0.09;
      tubes.forEach((t) => {
        t.uniforms.uTime.value = clock * 14;
        t.uniforms.uLevel.value = activity;
      });
      flows.forEach((flow, k) => {
        for (let i = 0; i < count; i++) {
          const u = (i / count + clock + k * 0.5 / count) % 1;
          tracks[k].at(u, p);
          c.copy(tints[k]).multiplyScalar(2.4 * activity);
          m.compose(p, q, s.setScalar(Math.max(0.0001, activity * smooth(0, 0.1, u))));
          flow.setMatrixAt(i, m);
          flow.setColorAt(i, c);
        }
        flow.instanceMatrix.needsUpdate = true;
        if (flow.instanceColor) flow.instanceColor.needsUpdate = true;
      });
    },
  };
}
