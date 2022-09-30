import { useLanguageCodeFromURL } from "@navikt/skjemadigitalisering-shared-components";
import React from "react";
import { MenuLink } from "./MenuLink";

export const TranslationsMenu = () => {
  const currentLanguage = useLanguageCodeFromURL();
  return (
    <>
      <MenuLink
        to={`/translations/global/${currentLanguage}/skjematekster`}
        dataKey={"skjematekster"}
        noIconStyling={true}
      >
        Skjematekster
      </MenuLink>

      <MenuLink to={`/translations/global/${currentLanguage}/grensesnitt`} dataKey={"grensesnitt"} noIconStyling={true}>
        Grensesnitt
      </MenuLink>

      <MenuLink
        to={`/translations/global/${currentLanguage}/statiske-tekster`}
        dataKey={"statiske-tekster"}
        noIconStyling={true}
      >
        Statiske tekster
      </MenuLink>

      <MenuLink to={`/translations/global/${currentLanguage}/validering`} dataKey={"validering"} noIconStyling={true}>
        Validering
      </MenuLink>
    </>
  );
};
