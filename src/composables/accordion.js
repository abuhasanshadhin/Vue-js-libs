export function useAccordion(ref, { current = null }) {
    const toggles = ref.value.querySelectorAll('[data-accordion-target]');
    const targets = ref.value.querySelectorAll('[data-accordion-item]');

    const targetDefaultStyles = {
        height: '0',
        overflow: 'hidden',
        transition: 'all .3s linear',
    };

    [...targets].forEach(targetEl => {
        Object.keys(targetDefaultStyles).forEach(key => {
            targetEl.style[key] = targetDefaultStyles[key];
        });
    });

    [...toggles].forEach((toggle, index) => {
        toggle.addEventListener('click', (ev) => {
            if (!ev.currentTarget?.hasAttribute('data-accordion-target')) return;
            
            const target = ev.currentTarget.dataset.accordionTarget;
            const targetEl = ref.value.querySelector(`[data-accordion-item="${target}"]`);
            targetEl.classList.toggle('show');

            const data = { index: null, target: targetEl, toggle };

            if (targetEl.classList.contains('show')) {
                targetEl.style.height = `${targetEl.scrollHeight}px`;
                const showedItems = ref.value.querySelectorAll(
                    `[data-accordion-item]:not([data-accordion-item="${target}"]).show`
                );

                [...showedItems].forEach(item => {
                    item.style.height = '0';
                    item.classList.remove('show');
                });

                data.index = index;
            } else {
                targetEl.style.height = '0';
            }

            if (typeof current === 'function') {
                current(data);
            }
        });
    });
}