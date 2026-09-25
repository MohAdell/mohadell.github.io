import { blendShots, SHOTS, type Shot } from './shots';

export interface DirectorFrame {
  shot: Shot;
  /** 0 while holding a frame, peaks at 1 halfway through a cut. Drives the letterbox. */
  cut: number;
  /** Index of the anchor currently framed (or being cut away from). */
  index: number;
  /** Raw progress between the current anchor and the next one, 0..1. */
  progress: number;
  /** Id of the anchor that owns the frame. */
  id: string;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
// Hold the frame over the first and last quarter of the distance between anchors; cut in between.
const HOLD = 0.24;
const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

/**
 * Maps the page scroll position onto the shot list. Anchors are `[data-shot]` elements in
 * document order; their centres are re-measured whenever the layout changes.
 */
export function createDirector() {
  let anchors: { id: string; centre: number }[] = [];

  function measure() {
    const scrollY = window.scrollY;
    anchors = Array.from(document.querySelectorAll<HTMLElement>('[data-shot]'))
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return { id: el.dataset.shot ?? '', centre: rect.top + scrollY + rect.height / 2 };
      })
      .filter((a) => a.id in SHOTS)
      .sort((a, b) => a.centre - b.centre);
  }

  const observer = new ResizeObserver(() => measure());
  observer.observe(document.body);
  measure();

  function frame(): DirectorFrame {
    if (anchors.length === 0) return { shot: SHOTS.hero, cut: 0, index: 0, progress: 0, id: 'hero' };
    const focus = window.scrollY + window.innerHeight * 0.5;
    // The first anchor owns the top of the page, the last one owns the bottom.
    const first = anchors[0];
    const last = anchors[anchors.length - 1];
    const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
    if (focus <= first.centre) return { shot: SHOTS[first.id], cut: 0, index: 0, progress: 0, id: first.id };
    if (focus >= last.centre || atBottom) {
      return { shot: SHOTS[last.id], cut: 0, index: anchors.length - 1, progress: 0, id: last.id };
    }

    let i = 0;
    while (i < anchors.length - 2 && focus >= anchors[i + 1].centre) i++;
    const a = anchors[i];
    const b = anchors[i + 1];
    const progress = clamp01((focus - a.centre) / Math.max(1, b.centre - a.centre));
    const t = smootherstep(clamp01((progress - HOLD) / (1 - HOLD * 2)));
    return {
      shot: blendShots(SHOTS[a.id], SHOTS[b.id], t),
      cut: Math.sin(Math.PI * t),
      index: t < 0.5 ? i : i + 1,
      progress,
      id: t < 0.5 ? a.id : b.id,
    };
  }

  return {
    frame,
    measure,
    dispose: () => observer.disconnect(),
  };
}

export type Director = ReturnType<typeof createDirector>;
