import { Knapp } from "nav-frontend-knapper";
import React, { useState } from "react";

const PublishGlobalTranslationsButton = ({ languageCode, publishGlobalTranslations }) => {
  const [publishing, setPublishing] = useState(false);
  const publish = () => {
    setPublishing(true);
    publishGlobalTranslations(languageCode).finally(() => setPublishing(false));
  };

  return (
    <Knapp onClick={publish} spinner={publishing}>
      Publiser
    </Knapp>
  );
};

export default PublishGlobalTranslationsButton;
