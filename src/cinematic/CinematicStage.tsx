import { useEffect, useRef } from 'react';

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * Fixed full-viewport WebGL stage behind the page. three.js is loaded only after the page has
 * painted; until then (and without WebGL) the existing CSS hero visual stays in place.
 */
export default function CinematicStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !supportsWebGL()) return;
    const root = document.documentElement;
    let disposed = false;
    let dispose: (() => void) | undefined;

    const boot = async () => {
      const { createWorld } = await import('./world');
      if (disposed) return;
      try {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const world = createWorld(canvas, { reduced });
        world.start();
        // Let the first frames settle before cross-fading from the CSS hero visual.
        window.setTimeout(() => {
          if (!disposed) root.dataset.stage = 'ready';
        }, 250);
        dispose = () => world.dispose();
      } catch {
        root.dataset.stage = 'failed';
      }
    };

    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const schedule = () => idle(() => void boot());
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });

    return () => {
      disposed = true;
      window.removeEventListener('load', schedule);
      dispose?.();
      delete root.dataset.stage;
    };
  }, []);

  return (
    <div className="stage" aria-hidden="true">
      <canvas ref={canvasRef} className="stage-canvas" />
      <div className="stage-vignette" />
      <div className="stage-grain" />
      <div className="stage-letterbox stage-letterbox-top" />
      <div className="stage-letterbox stage-letterbox-bottom" />
    </div>
  );
}
