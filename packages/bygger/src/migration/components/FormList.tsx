import { Undertittel } from "nav-frontend-typografi";
import React from "react";

export const FormList = ({
  heading,
  listElements,
}: {
  heading: string;
  listElements: { name: string; path: string }[];
}) => {
  return (
    <>
      <Undertittel className="margin-bottom-default">{heading}</Undertittel>
      <ul>
        {listElements.length > 0 ? (
          listElements.map(({ name, path }) => (
            <li key={path} className="list-inline-item">
              {name}
            </li>
          ))
        ) : (
          <li className="list-inline-item">N/A</li>
        )}
      </ul>
    </>
  );
};

export default FormList;
