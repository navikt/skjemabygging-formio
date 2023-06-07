// TODO: Remove this when we upgrade to @navikt packages 3.x. Just keep margin and fontSize.
const readMore = {
  "& .navds-read-more": {
    margin: "var(--a-spacing-2) 0",
    fontSize: "var(--a-font-size-medium)",
    "&__content": {
      "&--closed": {
        display: "none",
      },
    },
    "&__button:hover": {
      "& > .navds-read-more__expand-icon": {
        transform: "translateY(1px)",
        display: "inherit",
      },
    },
    "&--open": {
      "& > .navds-read-more__button": {
        "& > .navds-read-more__expand-icon": {
          transform: "rotate(-180deg)",
        },
        "&:hover > .navds-read-more__expand-icon": {
          transform: "translateY(-1px) rotate(-180deg)",
        },
      },
    },
  },
};
export default readMore;
