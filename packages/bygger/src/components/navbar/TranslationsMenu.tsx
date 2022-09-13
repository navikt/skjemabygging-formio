import { useLanguageCodeFromURL } from "@navikt/skjemadigitalisering-shared-components";
import React from "react";
import { MenuLink } from "./MenuLink";

export const TranslationsMenu = () => {
  const currentLanguage = useLanguageCodeFromURL();
  return (
    <>
      <MenuLink
        to={`/translations/global/${currentLanguage}/skjematekster`}
        ariaLabel={"Skjematekster"}
        dataKey={"skjematekster"}
        noIconStyling={true}
      >
        Skjematekster
      </MenuLink>

      <MenuLink
        to={`/translations/global/${currentLanguage}/grensesnitt`}
        ariaLabel={"Grensesnitt"}
        dataKey={"grensesnitt"}
        noIconStyling={true}
      >
        Grensesnitt
      </MenuLink>

      <MenuLink
        to={`/translations/global/${currentLanguage}/statiske-tekster`}
        ariaLabel={"Statiske tekster"}
        dataKey={"statiske-tekster"}
        noIconStyling={true}
      >
        Statiske tekster
      </MenuLink>

      <MenuLink
        to={`/translations/global/${currentLanguage}/validering`}
        ariaLabel={"Validering"}
        dataKey={"validering"}
        noIconStyling={true}
      >
        Validering
      </MenuLink>
    </>
  );
};
