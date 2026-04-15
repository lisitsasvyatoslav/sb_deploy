import { useLayoutEffect } from 'react';

/**
 * Strips `data-theme="dark"` from Storybook ancestor elements so that
 * the light panel in side-by-side demos renders correctly even when
 * the global Storybook theme switcher is set to dark.
 *
 * Watches for re-application via MutationObserver and restores
 * original values on unmount.
 */
export function useStripDarkTheme(ref: React.RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    if (!ref.current) return;

    const stripped = new Map<Element, string>();
    let el: Element | null = ref.current.parentElement;
    while (el) {
      const val = el.getAttribute('data-theme');
      if (val === 'dark') {
        stripped.set(el, val);
        el.removeAttribute('data-theme');
      }
      el = el.parentElement;
    }

    const observer = new MutationObserver(() => {
      stripped.forEach((_, node) => {
        if (node.getAttribute('data-theme') === 'dark') {
          node.removeAttribute('data-theme');
        }
      });
    });

    stripped.forEach((_, node) => {
      observer.observe(node, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });
    });

    return () => {
      observer.disconnect();
      stripped.forEach((val, node) => node.setAttribute('data-theme', val));
    };
  }, [ref]);
}
