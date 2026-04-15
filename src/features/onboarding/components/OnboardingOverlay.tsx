'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useOnboardingUIStore } from '../stores/onboardingUIStore';

const CUTOUT_RADIUS = 12;
const MASK_ID = 'onboarding-overlay-mask';
/** Drop sub-pixel rects (e.g. zero-width chat wrapper before it animates open) */
const MIN_CUTOUT_DIMENSION = 4;

/**
 * Build a `clip-path: path(...)` value that covers the full viewport with
 * rectangular holes punched at every cutout. The click-catcher layer uses
 * this so clicks inside cutouts pass through to the highlighted element
 * while clicks on the blurred area dismiss the guide.
 *
 * Sharp rectangles instead of rounded — `clip-path` actually affects
 * pointer events, and rounded arcs add a lot of path noise for ~12px of
 * corner that the user is unlikely to click anyway.
 */
function buildClickClipPath(cutouts: DOMRect[]): string | undefined {
  if (cutouts.length === 0) return undefined;
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  let d = `M0,0 H${vw} V${vh} H0 Z`;
  for (const r of cutouts) {
    d += ` M${r.x},${r.y} h${r.width} v${r.height} h${-r.width} Z`;
  }
  return `path(evenodd, "${d}")`;
}

/**
 * Full-screen onboarding backdrop. Blurs and dims everything except the
 * elements currently flagged with `data-glow-active` (or their containing
 * `data-glow-container` ancestor — used to e.g. expose the whole Sidebar
 * when a small button inside is highlighted).
 *
 * Two layers stacked at the same z-index, both driven from the same
 * `cutouts` state:
 *
 * 1. **Visual layer** — `pointer-events: none`, `backdrop-filter: blur`,
 *    masked by an SVG `<mask>` so cutouts are visually transparent
 *    (rounded rects via JSX, no path string gymnastics).
 *
 * 2. **Click layer** — invisible, `clip-path: path(evenodd, …)` so it
 *    only catches clicks in the *blurred* area. Clicks inside cutouts
 *    pass through to the highlighted element.
 *
 * `mask` would be enough on its own for visuals, but it does NOT affect
 * pointer events (the masked-out area is still clickable), so the
 * separate clip-path layer is required for the click-through behaviour.
 */
export function OnboardingOverlay() {
  const isGuideOpen = useOnboardingUIStore((s) => s.isGuideOpen);
  const closeGuide = useOnboardingUIStore((s) => s.closeGuide);
  const activeHighlightTarget = useOnboardingUIStore(
    (s) => s.activeHighlightTarget
  );
  const [cutouts, setCutouts] = useState<DOMRect[]>([]);
  const rafRef = useRef(0);
  // Holds the ResizeObserver across renders. Targets are re-observed
  // inside `measure` whenever the active set changes.
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const observedTargetsRef = useRef<Set<Element>>(new Set());

  const measure = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const els = document.querySelectorAll('[data-glow-active]');

      // Expand each glow-active element up to its `data-glow-container`
      // ancestor, then dedupe by DOM containment. Required because the
      // click layer uses evenodd fill: two overlapping cutouts (e.g.
      // ChatManager + its outer GlowBorder wrapper) would otherwise
      // cancel each other and re-cover the area.
      const targets: Element[] = [];
      for (const el of els) {
        const target = el.closest('[data-glow-container]') ?? el;

        let dominated = false;
        for (const existing of targets) {
          if (existing === target || existing.contains(target)) {
            dominated = true;
            break;
          }
        }
        if (dominated) continue;

        for (let i = targets.length - 1; i >= 0; i--) {
          if (target.contains(targets[i])) {
            targets.splice(i, 1);
          }
        }
        targets.push(target);
      }

      // Re-observe whenever the target set changes. This catches layout
      // shifts that aren't tied to data-glow-active mutations or window
      // events — e.g. framer-motion animating the chat panel closed,
      // which causes the content area cutout to grow over several frames.
      const newSet = new Set(targets);
      const oldSet = observedTargetsRef.current;
      let changed = newSet.size !== oldSet.size;
      if (!changed) {
        for (const t of newSet) {
          if (!oldSet.has(t)) {
            changed = true;
            break;
          }
        }
      }
      if (changed) {
        resizeObserverRef.current?.disconnect();
        if (targets.length > 0) {
          const ro = new ResizeObserver(() => measure());
          for (const t of targets) ro.observe(t);
          resizeObserverRef.current = ro;
        } else {
          resizeObserverRef.current = null;
        }
        observedTargetsRef.current = newSet;
      }

      const rects = targets
        .map((t) => t.getBoundingClientRect())
        .filter(
          (r) =>
            r.width >= MIN_CUTOUT_DIMENSION && r.height >= MIN_CUTOUT_DIMENSION
        );

      setCutouts(rects);
    });
  }, []);

  useEffect(() => {
    if (!isGuideOpen) return;
    measure();

    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);

    const mo = new MutationObserver(measure);
    mo.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-glow-active'],
      childList: true,
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
      mo.disconnect();
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      observedTargetsRef.current = new Set();
    };
  }, [isGuideOpen, measure]);

  // Re-measure immediately when the highlight target changes
  useEffect(() => {
    if (isGuideOpen) measure();
  }, [activeHighlightTarget, isGuideOpen, measure]);

  if (!isGuideOpen) return null;

  const clickClipPath = buildClickClipPath(cutouts);

  return (
    <>
      {/* SVG mask defining the visual cutouts (rounded rects). */}
      <svg
        aria-hidden
        className="fixed inset-0 w-screen h-screen pointer-events-none"
      >
        <defs>
          <mask id={MASK_ID}>
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {cutouts.map((r, i) => (
              <rect
                key={i}
                x={r.x}
                y={r.y}
                width={r.width}
                height={r.height}
                rx={CUTOUT_RADIUS}
                ry={CUTOUT_RADIUS}
                fill="black"
              />
            ))}
          </mask>
        </defs>
      </svg>

      {/* Visual layer: blurred backdrop, masked to expose the cutouts.
          pointer-events: none — clicks fall through to the click layer. */}
      <div
        aria-hidden
        className="fixed inset-0 z-[1300] backdrop-blur-[12px] bg-[rgba(4,4,5,0.12)] animate-overlay-fade-in pointer-events-none"
        style={{
          mask: `url(#${MASK_ID})`,
          WebkitMask: `url(#${MASK_ID})`,
        }}
      />

      {/* Click layer: invisible. clip-path leaves cutout regions outside
          the element so clicks there pass straight through to the
          highlighted UI; clicks on the blurred area hit this div and
          dismiss the guide.
          Only rendered when cutouts exist — without a clip-path the div
          covers the entire viewport and would swallow every click,
          accidentally closing the guide during transient DOM states
          (e.g. page transitions that briefly remove data-glow-active). */}
      {clickClipPath && (
        <div
          className="fixed inset-0 z-[1300]"
          style={{ clipPath: clickClipPath }}
          onClick={closeGuide}
          role="button"
          tabIndex={-1}
          aria-label="Close onboarding guide"
        />
      )}
    </>
  );
}
