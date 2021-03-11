import React from "react";

const Select = ({ label, className, onChange, options }) => (
  <nav className={className}>
    <button className="select-button">{label}</button>
    <ul className="select-list">
      {options.map(({ optionLabel, value }) => (
        <li className="select-list__option" onClick={() => onChange(value)}>
          {optionLabel}
        </li>
      ))}
    </ul>
  </nav>
);

export default Select;
