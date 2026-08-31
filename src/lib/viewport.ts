/** Pin the app to the *visual* viewport, not the layout viewport.
 *
 * Every screen is absolutely positioned inside a full-height root with a bar
 * pinned to the bottom. iOS Safari overlays the keyboard without resizing
 * anything, so that bar ends up underneath it and Safari scrolls the document
 * to reveal the focused field — dragging the fixed header away with it.
 * Mirroring visualViewport.height into --app-height makes the shell shrink
 * instead, which keeps the bar directly above the keyboard.
 */
export function trackViewportHeight(): void {
  const viewport = window.visualViewport;

  const apply = () => {
    const height = viewport?.height ?? window.innerHeight;
    document.documentElement.style.setProperty('--app-height', `${height}px`);
  };

  apply();
  viewport?.addEventListener('resize', apply);
  viewport?.addEventListener('scroll', apply);
  window.addEventListener('resize', apply);
  window.addEventListener('orientationchange', apply);
}
