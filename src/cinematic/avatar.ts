// The hologram guide: a stylized likeness of Mohamed built from his photos (slim build, cropped
// fade, full beard, dark rectangular glasses, black tee with a gold round emblem, black joggers,
// white sneakers, watch on the left wrist, left hand in the pocket as a resting pose).
// It is an articulated rig driven procedurally: it walks between nearby scenes with the scroll
// (stride matched to distance so the feet do not skate), beams out/in between distant sets, and
// holds a gesture that belongs to each scene. Any rigged model can later replace the geometry as
// long as it exposes the same joints.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { DirectorFrame } from './director';
import { RAIL_END, RAIL_START, SHOTS, WORK_ANGLES, WORK_POSITIONS, type Vec3 } from './shots';

// ---------------------------------------------------------------------------------------------
// Hologram material

const HOLO_VERTEX = /* glsl */ `
varying vec3 vNormalW;
varying vec3 vViewW;
varying float vHeight;
uniform float uBase;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vHeight = world.y - uBase;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vViewW = normalize(cameraPosition - world.xyz);
  gl_Position = projectionMatrix * viewMatrix * world;
}`;

const HOLO_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uRim;
uniform float uTime;
uniform float uReveal;
uniform float uHeight;
uniform float uOpacity;
varying vec3 vNormalW;
varying vec3 vViewW;
varying float vHeight;
void main() {
  float h = vHeight / uHeight;
  if (h > uReveal) discard;
  float facing = abs(dot(normalize(vNormalW), normalize(vViewW)));
  float fresnel = pow(1.0 - facing, 2.0);
  float scan = 0.82 + 0.18 * sin(vHeight * 150.0 - uTime * 5.0);
  float sweep = smoothstep(0.08, 0.0, abs(fract(uTime * 0.18) * 1.3 - h)) * 0.6;
  float edge = uReveal < 0.999 ? smoothstep(0.05, 0.0, uReveal - h) : 0.0;
  vec3 color = uColor * (0.55 + 0.45 * facing) * scan + uRim * (fresnel * 1.5 + sweep + edge * 3.0);
  gl_FragColor = vec4(color, uOpacity * (0.62 + 0.38 * fresnel));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

interface HoloShared {
  uTime: { value: number };
  uReveal: { value: number };
  uBase: { value: number };
}

function holoFactory(shared: HoloShared) {
  const cache = new Map<string, THREE.ShaderMaterial>();
  return (color: string, rim = '#67e8f9', rimStrength = 1.4, opacity = 0.92) => {
    const key = `${color}|${rim}|${rimStrength}|${opacity}`;
    const hit = cache.get(key);
    if (hit) return hit;
    const material = new THREE.ShaderMaterial({
      uniforms: {
        ...shared,
        uColor: { value: new THREE.Color(color) },
        uRim: { value: new THREE.Color(rim).multiplyScalar(rimStrength) },
        uHeight: { value: 1.9 },
        uOpacity: { value: opacity },
      },
      vertexShader: HOLO_VERTEX,
      fragmentShader: HOLO_FRAGMENT,
      transparent: true,
      depthWrite: true,
      toneMapped: false,
    });
    cache.set(key, material);
    return material;
  };
}

// ---------------------------------------------------------------------------------------------
// Figure

const JOINTS = [
  'root', 'spine', 'neck', 'head',
  'shL', 'elL', 'wrL', 'shR', 'elR', 'wrR',
  'hipL', 'knL', 'anL', 'hipR', 'knR', 'anR',
] as const;
type Joint = (typeof JOINTS)[number];
type Pose = Partial<Record<Joint, [number, number, number]>>;

const COLORS = {
  skin: '#c08a68',
  hair: '#06080b',
  tee: '#0e1720',
  pants: '#0b131b',
  sneaker: '#eef8fb',
  sole: '#ffffff',
  frame: '#0c1218',
  gold: '#f5c46b',
  watch: '#0b1016',
};

function buildFigure(holo: ReturnType<typeof holoFactory>) {
  const j = {} as Record<Joint, THREE.Group>;
  const mk = (name: Joint, parent: THREE.Object3D | null, x: number, y: number, z: number) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent?.add(g);
    j[name] = g;
    return g;
  };
  /** Tapered segment hanging down from a joint, with a sphere at the joint so joins read continuous. */
  const limb = (parent: THREE.Object3D, length: number, rTop: number, rBottom: number, material: THREE.Material) => {
    const segment = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, length, 14), material);
    segment.position.y = -length / 2;
    const cap = new THREE.Mesh(new THREE.SphereGeometry(rTop, 14, 10), material);
    parent.add(segment, cap);
    return segment;
  };

  // Contrast carries identity at distance: warm skin, near-black hair/beard/outfit, white sneakers.
  const skin = holo(COLORS.skin, '#8ff3ff', 0.55, 0.96);
  const tee = holo(COLORS.tee, '#67e8f9', 1.0);
  const pants = holo(COLORS.pants, '#67e8f9', 0.9);
  const hair = holo(COLORS.hair, '#67e8f9', 0.45, 0.98);
  const eye = holo('#05070a', '#000000', 0, 1);
  const sneaker = holo(COLORS.sneaker, '#e0fbff', 1.1, 0.98);
  const frame = holo(COLORS.frame, '#a5f3fc', 2.6, 1);
  const gold = holo(COLORS.gold, '#f5c46b', 2.4, 1);

  const root = mk('root', null, 0, 0.95, 0);
  // Pelvis (joggers).
  const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.15, 0.2, 16), pants);
  pelvis.scale.z = 0.7;
  root.add(pelvis);

  const spine = mk('spine', root, 0, 0.08, 0);
  // Tee: a capsule body (rounded shoulders) over a slightly narrower waist hem.
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.26, 8, 20), tee);
  torso.scale.set(1.33, 1, 0.78);
  torso.position.y = 0.3;
  const hem = new THREE.Mesh(new THREE.CylinderGeometry(0.182, 0.176, 0.12, 20), tee);
  hem.scale.z = 0.72;
  hem.position.y = 0.06;
  spine.add(torso, hem);
  // Gold round emblem on the chest (the leaf graphic from the photo is deliberately left out).
  const emblem = new THREE.Group();
  emblem.position.set(0, 0.34, 0.118);
  emblem.add(new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.008, 6, 32), gold));
  const star = new THREE.Mesh(new THREE.CircleGeometry(0.018, 5), gold);
  star.position.z = 0.002;
  emblem.add(star);
  spine.add(emblem);

  const neck = mk('neck', spine, 0, 0.52, 0);
  const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.054, 0.12, 14), skin);
  neckMesh.position.y = 0.04;
  neck.add(neckMesh);
  const head = mk('head', neck, 0, 0.08, 0.01);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), skin);
  skull.scale.set(0.094, 0.118, 0.108);
  skull.position.y = 0.1;
  head.add(skull);
  // Cropped hair: a cap over the top of the skull.
  const cap = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI * 0.37), hair);
  cap.scale.set(0.1, 0.126, 0.113);
  cap.position.y = 0.106;
  cap.rotation.x = 0.1;
  head.add(cap);
  // Full beard: the lower front of the head, ear to ear.
  const beard = new THREE.Mesh(
    new THREE.SphereGeometry(1, 28, 14, Math.PI / 2 - 2.0, 4.0, Math.PI * 0.47, Math.PI * 0.46),
    hair,
  );
  beard.scale.set(0.103, 0.128, 0.12);
  beard.position.y = 0.098;
  const chin = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), hair);
  chin.scale.set(0.056, 0.038, 0.036);
  chin.position.set(0, 0.012, 0.072);
  const moustache = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), hair);
  moustache.scale.set(0.036, 0.011, 0.014);
  moustache.position.set(0, 0.071, 0.104);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.045, 10), skin);
  nose.rotation.x = Math.PI * 0.62;
  nose.position.set(0, 0.093, 0.112);
  head.add(beard, chin, moustache, nose);
  // Eyes behind the lenses.
  [-1, 1].forEach((side) => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.0075, 10, 8), eye);
    e.scale.set(1.3, 0.75, 0.5);
    e.position.set(side * 0.038, 0.119, 0.1);
    head.add(e);
  });
  const ears = [-1, 1].map((side) => {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), skin);
    ear.scale.set(0.6, 1, 0.8);
    ear.position.set(side * 0.097, 0.1, -0.005);
    head.add(ear);
    return ear;
  });
  void ears;
  // Dark rectangular glasses: two rounded frames, bridge and temples.
  const lensShape = (w: number, h: number, r: number) => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2 + r, -h / 2);
    s.lineTo(w / 2 - r, -h / 2);
    s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r);
    s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2);
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r);
    s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    return s;
  };
  const rim = lensShape(0.07, 0.05, 0.012);
  rim.holes.push(new THREE.Path(lensShape(0.058, 0.038, 0.008).getPoints(12)));
  const rimGeometry = new THREE.ExtrudeGeometry(rim, { depth: 0.008, bevelEnabled: false, curveSegments: 6 });
  const glasses = new THREE.Group();
  glasses.position.set(0, 0.118, 0.104);
  [-1, 1].forEach((side) => {
    const lens = new THREE.Mesh(rimGeometry, frame);
    lens.position.x = side * 0.043;
    glasses.add(lens);
    const temple = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.008, 0.11), frame);
    temple.position.set(side * 0.08, 0.012, -0.055);
    glasses.add(temple);
  });
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.006, 0.006), frame);
  bridge.position.set(0, 0.012, 0.004);
  glasses.add(bridge);
  head.add(glasses);

  // Arms: short sleeves over the upper arm, bare forearms, a watch on the left wrist.
  const arm = (side: 1 | -1) => {
    const L = side === 1;
    const sh = mk(L ? 'shL' : 'shR', spine, side * 0.215, 0.45, 0);
    const sleeve = limb(sh, 0.16, 0.072, 0.066, tee);
    void sleeve;
    limb(sh, 0.29, 0.046, 0.041, skin);
    const el = mk(L ? 'elL' : 'elR', sh, 0, -0.29, 0);
    limb(el, 0.25, 0.041, 0.033, skin);
    const wr = mk(L ? 'wrL' : 'wrR', el, 0, -0.25, 0);
    const hand = new THREE.Mesh(new RoundedBoxGeometry(0.035, 0.09, 0.07, 2, 0.014), skin);
    hand.position.y = -0.05;
    wr.add(hand);
    if (L) {
      const watch = new THREE.Mesh(new RoundedBoxGeometry(0.048, 0.022, 0.05, 2, 0.008), holo(COLORS.watch, '#6ee7b7', 2.2, 1));
      watch.position.set(0, 0.03, 0);
      wr.add(watch);
    }
  };
  arm(1);
  arm(-1);

  // Legs: joggers with cuffed ankles, white sneakers.
  const leg = (side: 1 | -1) => {
    const L = side === 1;
    const hip = mk(L ? 'hipL' : 'hipR', root, side * 0.088, -0.03, 0);
    limb(hip, 0.45, 0.085, 0.064, pants);
    const kn = mk(L ? 'knL' : 'knR', hip, 0, -0.45, 0);
    limb(kn, 0.42, 0.062, 0.047, pants);
    const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.047, 0.012, 6, 16), pants);
    cuff.rotation.x = Math.PI / 2;
    cuff.position.y = -0.4;
    kn.add(cuff);
    const an = mk(L ? 'anL' : 'anR', kn, 0, -0.42, 0);
    const shoe = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.07, 0.27, 3, 0.03), sneaker);
    shoe.position.set(0, -0.025, 0.055);
    const sole = new THREE.Mesh(new RoundedBoxGeometry(0.106, 0.022, 0.278, 2, 0.01), holo(COLORS.sole, '#ffffff', 1.8, 1));
    sole.position.set(0, -0.058, 0.055);
    an.add(shoe, sole);
  };
  leg(1);
  leg(-1);

  return { root, joints: j };
}

// ---------------------------------------------------------------------------------------------
// Poses (joint rotations in radians). The character faces +z; its left is +x.
// Arm forward = negative x on the shoulder; left arm outward = +z, right arm outward = -z.

const POSES: Record<string, Pose> = {
  // The resting pose from the photos: left hand in the pocket, weight on one leg.
  idle: {
    shL: [0.18, 0, 0.14], elL: [-0.55, 0, 0], wrL: [0, 0, 0.2],
    shR: [0.04, 0, -0.07], elR: [-0.14, 0, 0],
    hipL: [-0.04, 0, 0.02], knL: [0.08, 0, 0], hipR: [0.02, 0, -0.03],
    spine: [0.02, 0, 0.02], head: [0.06, 0, 0],
  },
  present: {
    shL: [0.18, 0, 0.14], elL: [-0.55, 0, 0], wrL: [0, 0, 0.2],
    shR: [-0.75, 0.2, -0.55], elR: [-0.55, 0, 0], wrR: [0, 0, -0.3],
    spine: [0, 0.12, 0],
  },
  point: {
    shL: [0.18, 0, 0.14], elL: [-0.55, 0, 0], wrL: [0, 0, 0.2],
    shR: [-1.4, 0.1, -0.12], elR: [-0.08, 0, 0], wrR: [0.1, 0, 0],
    spine: [0, 0.18, 0],
  },
  reach: {
    shL: [-1.05, 0, 0.12], elL: [-0.45, 0, 0],
    shR: [-1.15, 0, -0.1], elR: [-0.4, 0, 0],
    spine: [0.12, 0, 0], head: [0.1, 0, 0],
  },
  expand: {
    shL: [-0.5, 0, 1.55], elL: [-0.35, 0, 0],
    shR: [-0.5, 0, -1.55], elR: [-0.35, 0, 0],
    spine: [-0.05, 0, 0], head: [-0.18, 0, 0],
  },
  wave: {
    shL: [0.18, 0, 0.14], elL: [-0.55, 0, 0], wrL: [0, 0, 0.2],
    shR: [-0.25, 0, -2.45], elR: [0, 0, -0.9],
    spine: [0, -0.06, -0.03],
  },
  // Arms while walking: relaxed, swing is added on top.
  walk: {
    shL: [0, 0, 0.08], elL: [-0.25, 0, 0], shR: [0, 0, -0.08], elR: [-0.25, 0, 0],
  },
};
type PoseName = keyof typeof POSES;

// ---------------------------------------------------------------------------------------------
// Choreography: where the guide stands and what it does in each shot.

interface Mark {
  pos: Vec3;
  /** Point to face while standing ('camera' faces the shot camera). */
  face: Vec3 | 'camera';
  pose: PoseName;
  /** Follows the funnel's hero lead instead of standing on a fixed mark. */
  followLead?: boolean;
}

const deg = (d: number) => (d * Math.PI) / 180;

function workMark(index: number, pose: PoseName, side = 1): Mark {
  const a = deg(WORK_ANGLES[index]);
  const [px, , pz] = WORK_POSITIONS[index];
  const out = [Math.cos(a), Math.sin(a)];
  const tangent = [-out[1], out[0]];
  return {
    pos: [px + out[0] * 2.3 + tangent[0] * 1.5 * side, 0.16, pz + out[1] * 2.3 + tangent[1] * 1.5 * side],
    face: [px, 1.2, pz],
    pose,
  };
}

const MARKS: Record<string, Mark> = {
  hero: { pos: [3.1, 0, 2.2], face: 'camera', pose: 'present' },
  // Standing on the core ("Marketing is the core"), above the About cards.
  about: { pos: [0.55, 3.08, 0.55], face: 'camera', pose: 'present' },
  capabilities: { pos: [0.2, 0, 3.3], face: 'camera', pose: 'idle' },
  funnel: { pos: [0, 0, 0], face: 'camera', pose: 'present', followLead: true },
  'work-1': workMark(0, 'point'),
  'work-2': workMark(1, 'reach'),
  'work-3': workMark(2, 'point'),
  'work-4': workMark(3, 'present', -1),
  // On top of the exploded layers, holding them apart.
  systems: { pos: [0.55, 4.94, 0.55], face: 'camera', pose: 'expand' },
  stack: { pos: [0, 0, 3.4], face: 'camera', pose: 'idle' },
  'exp-2': { pos: [RAIL_END[0] - 2.3, 0, RAIL_END[2] + 1.4], face: [RAIL_END[0], 0.8, RAIL_END[2]], pose: 'present' },
  'exp-1': { pos: [RAIL_START[0] + 2.3, 0, RAIL_START[2] + 1.4], face: [RAIL_START[0], 1.2, RAIL_START[2]], pose: 'point' },
  // On his own projector pad at the source of both streams (marketing + implementation).
  style: { pos: [1.78, 4.6, -6.67], face: 'camera', pose: 'expand' },
  contact: { pos: [8, 0, 2], face: 'camera', pose: 'wave' },
};

/** Transitions longer than this beam out and back in instead of walking. */
const WALK_LIMIT = 7.5;
/** Long walks that carry meaning (along the experience timeline). */
const WALKS = new Set(['exp-2>exp-1', 'exp-1>exp-2']);

// ---------------------------------------------------------------------------------------------

export interface AvatarContext {
  frame: DirectorFrame;
  lead: number | null;
  leadPoint: (step: number, out: THREE.Vector3) => THREE.Vector3;
  time: number;
  dt: number;
  dampDt: number;
  reduced: boolean;
}

export function createAvatar() {
  const shared: HoloShared = { uTime: { value: 0 }, uReveal: { value: 1 }, uBase: { value: 0 } };
  const holo = holoFactory(shared);
  const group = new THREE.Group();
  const figure = buildFigure(holo);
  group.add(figure.root);

  // Projector pad: the emitter the hologram stands on.
  const pad = new THREE.Group();
  const padRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.012, 6, 64),
    new THREE.MeshBasicMaterial({ color: new THREE.Color('#67e8f9').multiplyScalar(2.2), toneMapped: false }),
  );
  padRing.rotation.x = Math.PI / 2;
  padRing.position.y = 0.01;
  const padGlow = new THREE.Mesh(
    new THREE.CircleGeometry(0.42, 48),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color('#67e8f9').multiplyScalar(0.35),
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  padGlow.rotation.x = -Math.PI / 2;
  padGlow.position.y = 0.008;
  const cone = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.42, 1.9, 32, 1, true),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color('#67e8f9').multiplyScalar(0.12),
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  cone.position.y = 0.95;
  pad.add(padRing, padGlow, cone);
  group.add(pad);

  const light = new THREE.PointLight(new THREE.Color('#67e8f9'), 3, 4, 2);
  light.position.y = 1.2;
  group.add(light);

  const weights: Record<string, number> = Object.fromEntries(Object.keys(POSES).map((k) => [k, k === 'idle' ? 1 : 0]));
  const position = new THREE.Vector3(...MARKS.hero.pos);
  const target = new THREE.Vector3();
  const facePoint = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const tmp2 = new THREE.Vector3();
  let yaw = 0;
  let phase = 0;
  let walkWeight = 0;
  let spot = 'hero';
  let first = true;
  const euler: Record<Joint, THREE.Vector3> = Object.fromEntries(JOINTS.map((k) => [k, new THREE.Vector3()])) as Record<
    Joint,
    THREE.Vector3
  >;

  function markPosition(id: string, ctx: AvatarContext, out: THREE.Vector3) {
    const mark = MARKS[id] ?? MARKS.hero;
    if (mark.followLead) {
      // Walk beside the hero lead, a step outside the path.
      ctx.leadPoint(ctx.lead ?? 0, out);
      tmp2.set(out.x, 0, out.z).normalize();
      out.addScaledVector(tmp2, 1.15).setY(0);
      return out;
    }
    return out.set(...mark.pos);
  }

  function faceOf(id: string, out: THREE.Vector3) {
    const mark = MARKS[id] ?? MARKS.hero;
    if (mark.face === 'camera') return out.set(...(SHOTS[id]?.pos ?? SHOTS.hero.pos));
    return out.set(...mark.face);
  }

  function update(ctx: AvatarContext) {
    const { frame, dt, dampDt, reduced, time } = ctx;
    shared.uTime.value = time;

    // Resolve the mark for this frame of the cut.
    const { from, to, t } = frame;
    const a = markPosition(from, ctx, new THREE.Vector3());
    const b = markPosition(to, ctx, new THREE.Vector3());
    const pair = `${from}>${to}`;
    let reveal = 1;
    let pose: PoseName;
    let owner: string;
    const walkable = Math.abs(a.y - b.y) < 0.3 && (a.distanceTo(b) <= WALK_LIMIT || WALKS.has(pair));
    if (from === to || walkable) {
      target.copy(a).lerp(b, t);
      owner = t < 0.5 ? from : to;
      pose = t > 0.04 && t < 0.96 ? 'walk' : MARKS[owner]?.pose ?? 'idle';
    } else {
      // Beam: dissolve out at the first mark, re-materialize at the next one.
      owner = t < 0.5 ? from : to;
      target.copy(t < 0.5 ? a : b);
      reveal = t < 0.5 ? 1 - smooth(0.12, 0.44, t) : smooth(0.56, 0.88, t);
      pose = MARKS[owner]?.pose ?? 'idle';
    }
    const jumped = owner !== spot && target.distanceTo(position) > WALK_LIMIT;
    spot = owner;
    shared.uReveal.value = reveal;

    // Move (teleport on a beam, damped otherwise) and derive the walk from real displacement.
    const before = tmp.copy(position);
    if (first || jumped || reduced) position.copy(target);
    else position.lerp(target, 1 - Math.exp(-dampDt * 5));
    first = false;
    const moved = jumped ? 0 : Math.hypot(position.x - before.x, position.z - before.z);
    const speed = dampDt > 0 ? moved / dampDt : 0;
    walkWeight += ((reduced ? 0 : smooth(0.15, 0.9, speed)) - walkWeight) * Math.min(1, dampDt * 8);
    phase += (moved / 0.72) * Math.PI;

    // Heading: along the motion while walking, toward the scene's focus while standing.
    faceOf(owner, facePoint);
    let wantYaw = Math.atan2(facePoint.x - position.x, facePoint.z - position.z);
    if (speed > 0.25 && !jumped) wantYaw = Math.atan2(position.x - before.x, position.z - before.z);
    let delta = wantYaw - yaw;
    delta = Math.atan2(Math.sin(delta), Math.cos(delta));
    yaw += reduced || jumped ? delta : delta * Math.min(1, dampDt * 6);

    // Blend pose weights toward the scene pose.
    const gesture = walkWeight > 0.5 ? 'walk' : pose;
    for (const name of Object.keys(weights)) {
      const want = name === gesture ? 1 : 0;
      weights[name] += (want - weights[name]) * (reduced ? 1 : Math.min(1, dampDt * 5));
    }

    for (const joint of JOINTS) euler[joint].set(0, 0, 0);
    let total = 0;
    for (const [name, w] of Object.entries(weights)) {
      if (w < 0.001) continue;
      total += w;
      const p = POSES[name];
      for (const joint of JOINTS) {
        const r = p[joint];
        if (r) euler[joint].add(tmp2.set(r[0], r[1], r[2]).multiplyScalar(w));
      }
    }
    if (total > 0) for (const joint of JOINTS) euler[joint].multiplyScalar(1 / total);

    // Walk cycle, scaled by how fast the guide is actually moving.
    const s = Math.sin(phase);
    const c = Math.cos(phase);
    const w = walkWeight;
    euler.hipL.x += -s * 0.5 * w;
    euler.hipR.x += s * 0.5 * w;
    euler.knL.x += Math.max(0, c) * 0.75 * w + 0.05 * w;
    euler.knR.x += Math.max(0, -c) * 0.75 * w + 0.05 * w;
    euler.anL.x += s * 0.2 * w;
    euler.anR.x += -s * 0.2 * w;
    euler.shL.x += s * 0.4 * w;
    euler.shR.x += -s * 0.4 * w;
    euler.spine.y += s * 0.08 * w;

    // Idle life: breathing, a wave that actually waves.
    if (!reduced) {
      euler.spine.x += Math.sin(time * 1.3) * 0.015;
      euler.elR.z += Math.sin(time * 7) * 0.35 * weights.wave;
      euler.head.y += Math.sin(time * 0.5) * 0.08 * weights.idle;
    }

    // Head turns toward the camera-facing point within a natural range.
    const localLook = Math.atan2(facePoint.x - position.x, facePoint.z - position.z) - yaw;
    euler.head.y += Math.max(-0.7, Math.min(0.7, Math.atan2(Math.sin(localLook), Math.cos(localLook)))) * (1 - w) * 0.5;

    for (const joint of JOINTS) figure.joints[joint].rotation.set(euler[joint].x, euler[joint].y, euler[joint].z);
    figure.root.position.y = 0.95 + Math.abs(s) * 0.035 * w - w * 0.02;

    group.position.copy(position);
    group.rotation.y = yaw;
    shared.uBase.value = position.y;
    pad.visible = reveal > 0.01;
    (padRing.material as THREE.MeshBasicMaterial).opacity = 1;
    padRing.scale.setScalar(0.9 + reveal * 0.1 + (reveal < 1 ? (1 - reveal) * 0.6 : 0));
    (cone.material as THREE.MeshBasicMaterial).opacity = 0.1 + (1 - reveal) * 0.6 * (reveal > 0 ? 1 : 0);
    light.intensity = 1.5 + reveal * 2.5;
    figure.root.visible = reveal > 0.001;
    void dt;
  }

  return { group, update };
}

function smooth(e0: number, e1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

export type Avatar = ReturnType<typeof createAvatar>;
