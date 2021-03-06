import React, { useEffect, useRef, useState } from "react";
import { Collapse, Expand } from "@navikt/ds-icons";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";

const useSelectStyle = makeStyles({
  overlay: {
    position: "fixed",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
  },
  nav: {
    position: "relative",
  },
});

const closeListAndResetFocus = (event, closeFunction, buttonRef) => {
  closeFunction();
  buttonRef.current.focus();
};

const closeOnEscape = (event, closeFunction, buttonRef) => {
  if (event.key === "Escape") {
    closeOnEscape(event, closeFunction, buttonRef);
  }
};

const handleTabKeyPressed = (event, firstItem, lastItem, index, numberOfItemsInList) => {
  if (event.key !== "Tab") {
    return;
  }
  if (event.shiftKey && index === 0) {
    event.preventDefault();
    lastItem.current.focus();
  } else if (!event.shiftKey && index === numberOfItemsInList - 1) {
    event.preventDefault();
    firstItem.current.focus();
  }
};

const Select = ({ label, className, options }) => {
  const buttonRef = useRef(null);
  const firstListItemLinkRef = useRef(null);
  const lastListItemLinkRef = useRef(null);
  const [showItems, setShowItems] = useState(false);
  const classes = useSelectStyle();
  useEffect(() => {
    if (showItems && firstListItemLinkRef.current) {
      firstListItemLinkRef.current.focus();
    }
  }, [firstListItemLinkRef, showItems]);
  return (
    <>
      {showItems && (
        <div
          className={classes.overlay}
          onClick={(event) => closeListAndResetFocus(event, () => setShowItems(false), buttonRef)}
        />
      )}
      <nav
        className={`${className} ${classes.nav}`}
        onKeyUp={(event) => closeOnEscape(event, () => setShowItems(false), buttonRef)}
      >
        <button className="select-button" onClick={() => setShowItems(!showItems)} ref={buttonRef}>
          {label}
          {showItems ? <Collapse className="select__chevron" /> : <Expand className="select__chevron" />}
        </button>
        {showItems && (
          <ul className="select-list">
            {options.map(({ href, optionLabel }, index) => (
              <li
                className="select-list__option"
                key={optionLabel}
                onKeyDown={(event) =>
                  handleTabKeyPressed(event, firstListItemLinkRef, lastListItemLinkRef, index, options.length)
                }
              >
                <Link
                  className="select-list__option__link"
                  to={href}
                  onClick={() => setShowItems(!showItems)}
                  ref={
                    index === 0 ? firstListItemLinkRef : index === options.length - 1 ? lastListItemLinkRef : undefined
                  }
                >
                  {optionLabel}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </>
  );
};

export default Select;
