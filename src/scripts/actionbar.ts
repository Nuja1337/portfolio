/** Action bar: number keys press the matching slot, and a pressed slot plays its cooldown sweep. */

export function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement && (target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName))
  );
}

export function initActionBar(): void {
  const slots = [...document.querySelectorAll<HTMLAnchorElement>('.actionbar .slot')];
  for (const slot of slots) {
    slot.addEventListener('click', () => {
      slot.classList.remove('cd');
      void slot.offsetWidth; // restart the animation
      slot.classList.add('cd');
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
    const slot = slots.find((s) => s.dataset.key === e.key);
    if (!slot) return;
    e.preventDefault();
    slot.click();
  });
}
