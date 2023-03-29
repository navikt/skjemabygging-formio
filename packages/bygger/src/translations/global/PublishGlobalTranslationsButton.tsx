import { Button } from "@navikt/ds-react";
import { useState } from "react";

const PublishGlobalTranslationsButton = ({ languageCode, publishGlobalTranslations }) => {
  const [publishing, setPublishing] = useState(false);
  const publish = () => {
    setPublishing(true);
    publishGlobalTranslations(languageCode).finally(() => setPublishing(false));
  };

  return (
    <Button variant="secondary" onClick={publish} loading={publishing} type="button">
      Publiser
    </Button>
  );
};

export default PublishGlobalTranslationsButton;
