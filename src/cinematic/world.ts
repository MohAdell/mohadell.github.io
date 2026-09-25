// The Growth Engine world: one renderer behind the whole page. The director turns scroll into a
// shot; this module damps the camera toward it and lets each piece react to the camera's focus.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { createAvatar } from './avatar';
import { createDirector, funnelStep, type DirectorFrame } from './director';
import {
  createConstellation,
  createCore,
  createCrmRouter,
  createDashboard,
  createDust,
  createFloor,
  createFunnelFlow,
  createLeadFunnel,
  createPublisher,
  createStations,
  createStreams,
  createTimeline,
  PALETTE,
  type Piece,
  type Quality,
} from './pieces';

export interface WorldOptions {
  reduced: boolean;
  onFrame?: (frame: DirectorFrame) => void;
}

const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

function pickQuality(): Quality {
  const narrow = window.matchMedia('(max-width: 767px)').matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  const low = narrow || cores <= 4;
  return { particles: low ? 34 : 64, low };
}

export function createWorld(canvas: HTMLCanvasElement, options: WorldOptions) {
  const quality = pickQuality();
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !quality.low,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.low ? 1.25 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(PALETTE.ink, 1);

  const scene = new THREE.Scene();
  scene.background = PALETTE.ink.clone();
  const fog = new THREE.FogExp2(new THREE.Color('#03101f'), 0.03);
  scene.fog = fog;

  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.35;

  // Cool key from above-front, emerald rim from the opposite quadrant, dim tinted fill.
  scene.add(new THREE.HemisphereLight(new THREE.Color('#1d3b57'), PALETTE.ink, 0.6));
  const key = new THREE.DirectionalLight(new THREE.Color('#d6ecff'), 1.5);
  key.position.set(8, 12, 6);
  const rim = new THREE.DirectionalLight(PALETTE.emerald, 1.1);
  rim.position.set(-9, 5, -8);
  scene.add(key, rim);

  scene.add(createFloor());
  const dust = createDust(quality.low ? 220 : 480);
  scene.add(dust.points);

  const core = createCore();
  const stations = createStations();
  const constellation = createConstellation();
  const streams = createStreams(quality);
  const funnel = createFunnelFlow(quality);
  const avatar = createAvatar();
  scene.add(avatar.group);
  const pieces: Piece[] = [
    core,
    ...stations,
    funnel,
    createLeadFunnel(quality),
    createCrmRouter(quality),
    createDashboard(),
    createPublisher(quality),
    createTimeline(quality),
  ];
  for (const piece of [...pieces, constellation, streams]) scene.add(piece.group);

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 220);
  const composer = quality.low ? null : new EffectComposer(renderer);
  let bloom: UnrealBloomPass | null = null;
  if (composer) {
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.55, 0.6, 0.82);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }

  // Adaptive quality: if the first seconds run below ~35 fps, drop bloom and render at 1x.
  let useComposer = true;
  let sampled = 0;
  let sampledTime = 0;
  function watchPerformance(rawDt: number) {
    if (sampled < 0) return;
    if (document.hidden || rawDt > 0.5) return;
    sampled++;
    sampledTime += rawDt;
    if (sampled < 90) return;
    if (sampledTime / sampled > 1 / 35) {
      useComposer = false;
      renderer.setPixelRatio(1);
      resize();
    }
    sampled = -1;
  }

  const director = createDirector();
  let width = 1;
  let height = 1;
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer.setSize(width, height, false);
    composer?.setSize(width, height);
    bloom?.resolution.set(width / 2, height / 2);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // Pointer parallax (desktop only): a small drift of the camera, never of the subject.
  const pointer = new THREE.Vector2();
  const pointerTarget = new THREE.Vector2();
  const onPointer = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    pointerTarget.set(event.clientX / width - 0.5, event.clientY / height - 0.5);
  };
  window.addEventListener('pointermove', onPointer, { passive: true });

  const camPos = new THREE.Vector3();
  const camTarget = new THREE.Vector3();
  const wantPos = new THREE.Vector3();
  const wantTarget = new THREE.Vector3();
  const offset = new THREE.Vector3();
  let fov = 36;
  let frameShift = 0;
  let frameLift = 0;
  let split = 0;
  let energy = 0.7;
  let first = true;

  const root = document.documentElement;
  let lastDim = -1;
  let lastCut = -1;
  let lastId = '';
  const clock = new THREE.Clock();
  let time = 0;
  let raf = 0;
  let running = false;

  function tick() {
    raf = requestAnimationFrame(tick);
    const rawDt = clock.getDelta();
    // Animation steps are clamped; camera damping uses real time so a slow device never lags behind the scroll.
    const dt = Math.min(rawDt, 0.05);
    const dampDt = Math.min(rawDt, 0.5);
    time += options.reduced ? 0 : dt;

    const frame = director.frame();
    const shot = frame.shot;
    const narrow = width < 768;
    const portrait = height > width;

    wantTarget.set(...shot.target);
    wantPos.set(...shot.pos);
    if (narrow || portrait) {
      // Pull back and centre: the subject sits above the text instead of beside it.
      offset.copy(wantPos).sub(wantTarget).multiplyScalar(portrait ? 0.5 : 0.25);
      wantPos.add(offset);
    }

    const k = options.reduced || first ? 1 : 1 - Math.exp(-dampDt * 3.2);
    camPos.lerp(wantPos, k);
    camTarget.lerp(wantTarget, k);
    fov += (shot.fov - fov) * k;
    frameShift += ((narrow || portrait ? 0 : shot.frame) - frameShift) * k;
    frameLift += ((portrait ? shot.lift ?? 0 : 0) - frameLift) * k;
    split += (shot.split - split) * k;
    energy += (shot.energy - energy) * k;
    fog.density += (shot.fog - fog.density) * k;
    first = false;

    if (!options.reduced) pointer.lerp(pointerTarget, 1 - Math.exp(-dt * 2));
    camera.position.copy(camPos);
    camera.position.x += pointer.x * 0.6;
    camera.position.y -= pointer.y * 0.35;
    camera.lookAt(camTarget);
    camera.fov = fov;
    camera.setViewOffset(width, height, -frameShift * width, frameLift * height, width, height);
    camera.updateProjectionMatrix();

    const ctx = {
      time,
      dt: options.reduced ? 0 : dt,
      activity: 0,
      energy,
      split,
      reduced: options.reduced,
      lead: funnelStep(),
    };
    for (const piece of pieces) {
      const d = piece.centre.distanceTo(camTarget);
      ctx.activity = smooth(piece.reach * 1.8, piece.reach * 0.6, d);
      piece.update(ctx);
    }
    ctx.activity = shot.tools ?? 0;
    constellation.update(ctx);
    ctx.activity = shot.streams ?? 0;
    streams.update(ctx);
    avatar.update({
      frame,
      lead: ctx.lead,
      leadPoint: funnel.pointAt,
      time,
      dt: ctx.dt,
      dampDt: options.reduced ? 1 : dampDt,
      reduced: options.reduced,
    });
    dust.update(time);

    if (composer && useComposer) composer.render(dt);
    else renderer.render(scene, camera);
    watchPerformance(rawDt);

    // Hand the frame to the page chrome (dim, letterbox, chapter) without re-rendering React.
    const dim = Math.round(shot.dim * 100) / 100;
    if (dim !== lastDim) {
      root.style.setProperty('--stage-dim', String(dim));
      lastDim = dim;
    }
    const cut = Math.round(frame.cut * 100) / 100;
    if (cut !== lastCut) {
      root.style.setProperty('--stage-cut', String(cut));
      lastCut = cut;
    }
    if (frame.id !== lastId) {
      lastId = frame.id;
      root.dataset.scene = frame.id;
      options.onFrame?.(frame);
    }
  }

  function start() {
    if (running) return;
    running = true;
    clock.getDelta();
    raf = requestAnimationFrame(tick);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }
  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVisibility);

  return {
    start,
    stop,
    measure: director.measure,
    dispose() {
      stop();
      director.dispose();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        mesh.geometry?.dispose();
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material?.dispose();
      });
      environment.dispose();
      pmrem.dispose();
      composer?.dispose();
      renderer.dispose();
    },
  };
}

export type World = ReturnType<typeof createWorld>;
