import type { CMSFilters } from 'src/types/CMSFilters';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fsAttributes: any;
  }
}

export function initFilters() {
  // Get jobs
  const jobs: HTMLElement[] = Array.from(document.querySelectorAll('.positions_item.w-dyn-item'));
  if (!jobs.length) return;

  window.fsAttributes = window.fsAttributes || [];
  window.fsAttributes.push([
    'cmsfilter',
    (filtersInstances: CMSFilters[]) => {
      // Get filters instance
      const [filtersInstance] = filtersInstances;

      // Get radio template telement
      const filtersRadioTemplateElement = filtersInstance.form.querySelector(
        '[data-element="filter"]'
      ) as HTMLElement;
      if (!filtersRadioTemplateElement) return;

      // Get parent of radios
      const filtersWrapperElement = filtersRadioTemplateElement.parentElement;
      if (!filtersWrapperElement) return;

      // Remove template radio element
      filtersRadioTemplateElement.remove();

      // Collect all the categories
      const locations = collectCategories(jobs, 'location') as string[];

      // Create new radio filters for each category and append
      for (const location of locations) {
        const newFilter = createFilter(location, filtersRadioTemplateElement);
        if (!newFilter) return;

        filtersWrapperElement.append(newFilter);
      }

      // Sync CMSFilters to read the new fitlers data
      filtersInstance.storeFiltersData();

      // Get all reset buttons
      const resetButtons = Array.from(
        filtersInstance.form.querySelectorAll('[fs-cmsfilter-element="clear"]')
      ) as HTMLElement[];

      // Get reset values for each and add event listener
      resetButtons.forEach((resetButton) => handleResetButton(resetButton, filtersInstance));

      // Get count elements
      const filterCountElements = Array.from(
        document.querySelectorAll('[data-element="filter-count"]')
      ) as HTMLElement[];

      // Get amount of active filters
      filtersInstance.listInstance.on('renderitems', () => {
        const { filtersData } = filtersInstance;
        let count = 0;

        for (const { values } of filtersData) {
          count = count + values.size;
        }

        // Hide if no active filters
        if (count === 0) {
          filterCountElements.forEach((el) => {
            el.style.display = 'none';
          });

          return;
        }

        // Display and set count if active filters
        filterCountElements.forEach((el) => {
          el.textContent = `(${count})`;
          el.style.display = 'block';
        });
      });
    },
  ]);
}

const handleResetButton = (resetButton: HTMLElement, filtersInstance: CMSFilters) => {
  const group = resetButton.getAttribute('fs-cmsfilter-clear');
  if (!group) return;

  resetButton.addEventListener('click', () => {
    filtersInstance.resetFilters([group]);
  });
};

const collectCategories = (jobs: HTMLElement[], categoryName: string) => {
  const categories = new Set();

  for (let i = 0; i < jobs.length; i++) {
    const item = jobs[i];
    const category = item.dataset[categoryName];

    if (category) categories.add(category);
  }

  return [...categories];
};

const createFilter = (category: string, templateElement: HTMLElement) => {
  // Clone template
  const newFilter = templateElement.cloneNode(true) as HTMLLabelElement;

  // Query
  const label = newFilter.querySelector('span');
  const input = newFilter.querySelector('input');
  const clear = newFilter.querySelector('a');
  if (!label || !input || !clear) return;

  // Populate
  label.textContent = category;
  input.value = category;
  input.id = `radio-${category}`;

  clear.setAttribute('fs-cmsfilter-clear', 'location');
  clear.setAttribute('fs-cmsfilter-element', 'clear');

  return newFilter;
};
