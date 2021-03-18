import React, { useEffect, useRef, useState } from "react";
import { Collapse, Expand } from "@navikt/ds-icons";
import { Link } from "react-router-dom";

const closeOnEscape = (event, close, buttonRef) => {
  if (event.key === "Escape") {
    close();
    buttonRef.current.focus();
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
  useEffect(() => {
    if (showItems && firstListItemLinkRef.current) {
      firstListItemLinkRef.current.focus();
    }
  }, [firstListItemLinkRef, showItems]);
  return (
    <nav className={className} onKeyUp={(event) => closeOnEscape(event, () => setShowItems(false), buttonRef)}>
      <button className="select-button" onClick={() => setShowItems(!showItems)} ref={buttonRef}>
        {label}
        {showItems ? <Collapse className="select__chevron" /> : <Expand className="select__chevron" />}
      </button>
      {showItems && (
        <ul className="select-list">
          {options.map(({ href, optionLabel }, index) => (
            <li
              className="select-list__option"
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
  );
};

export default Select;
