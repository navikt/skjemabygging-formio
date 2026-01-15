// TODO: Remove this when we upgrade to @navikt packages 3.x. Just keep margin and maybe color.
const readMore = {
  '& .aksel-read-more': {
    margin: 'var(--ax-space-8) 0',
    color: 'var(--ax-neutral-800)',
    '&__content': {
      '&--closed': {
        display: 'none',
      },
    },
    '&__button:hover': {
      '& > .aksel-read-more__expand-icon': {
        transform: 'translateY(1px)',
        display: 'inherit',
      },
    },
    '&--open': {
      '& > .aksel-read-more__button': {
        '& > .aksel-read-more__expand-icon': {
          transform: 'rotate(-180deg)',
        },
        '&:hover > .aksel-read-more__expand-icon': {
          transform: 'translateY(-1px) rotate(-180deg)',
        },
      },
    },
  },
};
export default readMore;
