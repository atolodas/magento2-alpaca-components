'use-strict'

const dropdownCollapseLabel = '.dropdown-list__item--collapse .dropdown-list__label',
      dropdownItem          = [ ...document.querySelectorAll(dropdownCollapseLabel) ],
      openClass             = 'dropdown-list__item--open',
      contentClass          = 'dropdown-list__content',
      mqClass               = 'dropdown-list--is-open\\@screen-m',
      mq                    = '(min-width: 768px)';

function setListHeight(item) {
  return Array.from(item.children)
    .map(elem => elem.clientHeight)
    .reduce((a, b) => a + b, 0);
}

function setAriaAttributes(label, content, expanded) {
  if (expanded) {
    label.setAttribute('aria-expanded', 'false');
    content.setAttribute('aria-hidden', 'true');
  }
  else {
    label.setAttribute('aria-expanded', 'true');
    content.setAttribute('aria-hidden', 'false');
  }
}

function isMediumOpen(dropdownBlock) {
  return (dropdownBlock.classList.contains(mqClass)) && window.matchMedia(mq).matches;
}

function resetMqMediumOpen(item) {
  const dropdownItem = item.parentNode,
        dropdownContent = dropdownItem.querySelector(`.${contentClass}`);

  if (window.matchMedia(mq).matches) {
    dropdownContent.style.height = 'auto';
    dropdownItem.classList.remove(openClass);
    setAriaAttributes(item, dropdownContent, true);
  }
  else {
    dropdownContent.style.height = 0;
    dropdownItem.classList.remove(openClass);
    setAriaAttributes(item, dropdownContent, false);
  }
}

function toggleContent(item) {
  const dropdownId      = item.dataset.dropdown,
        dropdownItem    = item.parentNode,
        dropdownContent = dropdownItem.querySelector(`.${contentClass}[data-content="${dropdownId}"]`),
        dropdownBlock   = item.closest('.dropdown-list');

  if (!isMediumOpen(dropdownBlock)) {
    if (dropdownContent.clientHeight > 0) {
      dropdownContent.style.height = 0;
      dropdownItem.classList.remove(openClass);
      setAriaAttributes(item, dropdownContent, true);
    }
    else {
      dropdownContent.style.height = `${setListHeight(dropdownContent)}px`;
      dropdownItem.classList.add(openClass);
      setAriaAttributes(item, dropdownContent, false);
    }
  }
  else {
    dropdownContent.style.height = 'auto';
    dropdownItem.classList.remove(openClass);
    setAriaAttributes(item, dropdownContent, false);
  }
}

dropdownItem.forEach(
  key => key.addEventListener('click', (e) => {
    e.preventDefault();
    toggleContent(key, false);
  }, false)
);

window.addEventListener('resize', () => {
  const dropdownMediumOpen = document.querySelector(`.${mqClass}`);
  if (dropdownMediumOpen) {
    const dropdownItems =  [ ...dropdownMediumOpen.querySelectorAll(dropdownCollapseLabel)];
    dropdownItems.forEach(key => resetMqMediumOpen(key));
  }
});
