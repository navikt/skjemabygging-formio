const tabs = {
  '& .aksel-tabs__tab.active': {
    // These settings are from Aksel and the rule: aksel-tabs__tab[aria-selected="true"]
    boxShadow: 'inset 0 -3px 0 0 var(--ac-tabs-selected-border, var(--ax-border-accent))',
    color: 'var(--ac-tabs-selected-text, var(--ax-text-neutral))',
  },
};

export default tabs;
