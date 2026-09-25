// Shot list for the scroll-driven camera. Every DOM element carrying `data-shot="<id>"` is an
// anchor; the director holds each anchor's frame and cuts smoothly to the next one in between.
// World units are abstract metres. Layout constants are shared with pieces.ts so the camera and
// the set pieces cannot drift apart.

export type Vec3 = [number, number, number];

export interface Shot {
  pos: Vec3;
  target: Vec3;
  fov: number;
  /** Horizontal framing: +0.2 pushes the subject toward the right third (text sits on the left). */
  frame: number;
  /** Canvas opacity; text-heavy shots dim the world. */
  dim: number;
  /** Core layer separation, 0 = stacked, 1 = exploded. */
  split: number;
  /** Flow speed / emissive energy, 0..1. */
  energy: number;
  /** FogExp2 density. */
  fog: number;
  /** Explicit visibility for pieces that share the core's space (working-style streams, tool orbits). */
  streams?: number;
  tools?: number;
  /** Portrait screens only: raise the subject by this fraction of the height (text sits below it). */
  lift?: number;
}

const deg = (d: number) => (d * Math.PI) / 180;
const polar = (radius: number, angleDeg: number, y = 0): Vec3 => [
  Math.cos(deg(angleDeg)) * radius,
  y,
  Math.sin(deg(angleDeg)) * radius,
];

/** Acquisition → Measurement → CRM → Operations → Follow-up, wrapped around the back of the core. */
export const STATION_RADIUS = 5.4;
export const STATION_ANGLES = [145, 190, 235, 280, 325];
export const STATION_POSITIONS: Vec3[] = STATION_ANGLES.map((a) => polar(STATION_RADIUS, a));

/** Selected-work set pieces sit on an outer ring behind the hero camera. */
export const WORK_RADIUS = 18;
export const WORK_ANGLES = [-12, 30, 72, 114];
export const WORK_POSITIONS: Vec3[] = WORK_ANGLES.map((a) => polar(WORK_RADIUS, a));

export const CONSTELLATION_Y = 5.4;

export const RAIL_Z = -26;
export const RAIL_START: Vec3 = [-15, 0, RAIL_Z];
export const RAIL_END: Vec3 = [7, 0, RAIL_Z];

/** Camera for a work piece: outside the ring looking inward, so the core glows behind it. */
function workShot(index: number, side = 1): Shot {
  const angle = WORK_ANGLES[index];
  const [px, , pz] = WORK_POSITIONS[index];
  const out = [Math.cos(deg(angle)), Math.sin(deg(angle))];
  const tangent = [-out[1], out[0]];
  return {
    pos: [px + out[0] * 11.5 + tangent[0] * 3.4 * side, 5.4, pz + out[1] * 11.5 + tangent[1] * 3.4 * side],
    target: [px, 1.5, pz],
    fov: 34,
    frame: 0.3,
    dim: 0.95,
    split: 0,
    energy: 0.8,
    fog: 0.022,
  };
}

export const SHOTS: Record<string, Shot> = {
  hero: {
    pos: [10.5, 7.6, 12.5],
    target: [0, 1, 0],
    fov: 36,
    frame: 0.23,
    lift: 0.27,
    dim: 1,
    split: 0,
    energy: 0.75,
    fog: 0.03,
  },
  about: {
    pos: [10.5, 5, 14.5],
    target: [0, 0.9, 0],
    fov: 32,
    frame: 0.22,
    dim: 0.8,
    split: 0.38,
    energy: 0.6,
    fog: 0.034,
  },
  capabilities: {
    pos: [-9, 13, 9.5],
    target: [0, 0, -1],
    fov: 38,
    frame: 0,
    dim: 0.34,
    split: 0.1,
    energy: 0.7,
    fog: 0.026,
  },
  funnel: {
    pos: [0.6, 2.3, 10.5],
    target: [0, 0.9, -2.4],
    fov: 44,
    frame: 0,
    dim: 0.6,
    split: 0,
    energy: 1,
    fog: 0.03,
  },
  'work-1': workShot(0),
  'work-2': workShot(1),
  'work-3': workShot(2),
  'work-4': { ...workShot(3, -1), frame: 0.24 },
  systems: {
    pos: [10, 6.4, 12],
    target: [0, 2.8, 0],
    fov: 36,
    frame: 0.12,
    dim: 0.7,
    split: 1,
    energy: 0.6,
    fog: 0.03,
  },
  stack: {
    pos: [0.4, 17.5, 3.2],
    target: [0, CONSTELLATION_Y - 0.4, 0],
    fov: 40,
    frame: 0,
    dim: 0.45,
    split: 0.2,
    energy: 0.65,
    fog: 0.018,
    tools: 1,
  },
  'exp-1': {
    pos: [RAIL_START[0] - 7.5, 8, RAIL_Z + 2.4],
    target: [RAIL_START[0] + 3, 0.2, RAIL_Z],
    fov: 38,
    frame: 0.3,
    dim: 0.85,
    split: 0,
    energy: 0.6,
    fog: 0.028,
  },
  'exp-2': {
    pos: [RAIL_END[0] + 7.5, 8, RAIL_Z + 2.4],
    target: [RAIL_END[0] - 3, 0.2, RAIL_Z],
    fov: 38,
    frame: 0.3,
    dim: 0.9,
    split: 0,
    energy: 0.75,
    fog: 0.028,
  },
  style: {
    pos: [7, 5.2, 10],
    target: [0, 3.6, 0],
    fov: 40,
    frame: 0,
    dim: 0.38,
    split: 0.15,
    energy: 0.9,
    fog: 0.03,
    streams: 1,
  },
  contact: {
    pos: [11, 4.5, 14],
    target: [0, 1.6, 0],
    fov: 40,
    frame: 0,
    dim: 0.7,
    split: 0,
    energy: 1,
    fog: 0.016,
  },
};

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mix3 = (a: Vec3, b: Vec3, t: number): Vec3 => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];

export function blendShots(a: Shot, b: Shot, t: number): Shot {
  return {
    pos: mix3(a.pos, b.pos, t),
    target: mix3(a.target, b.target, t),
    fov: mix(a.fov, b.fov, t),
    frame: mix(a.frame, b.frame, t),
    dim: mix(a.dim, b.dim, t),
    split: mix(a.split, b.split, t),
    energy: mix(a.energy, b.energy, t),
    fog: mix(a.fog, b.fog, t),
    streams: mix(a.streams ?? 0, b.streams ?? 0, t),
    tools: mix(a.tools ?? 0, b.tools ?? 0, t),
    lift: mix(a.lift ?? 0, b.lift ?? 0, t),
  };
}
