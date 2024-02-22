import { initFilters } from './positionsFilters';

window.Webflow ||= [];
window.Webflow.push(() => {
  const list = document.querySelector('[ponty-element="list"]');
  const number = document.querySelector('[ponty-element="number"]');
  if (!list || !number) return;

  number.textContent = String(list.childElementCount);

  initFilters();
});
