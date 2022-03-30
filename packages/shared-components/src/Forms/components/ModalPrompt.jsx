import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { Knapp } from "nav-frontend-knapper";
import Modal from "nav-frontend-modal";
import { Normaltekst, Systemtittel } from "nav-frontend-typografi";
import React, { useEffect, useState } from "react";
import { useLanguages } from "../../context/languages/languages-context";

const ModalPrompt = () => {
  const { translate } = useLanguages();
  const [openModal, setOpenModal] = useState(false);
  const isiOS =
    ["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes("Mac") && "ontouchend" in document);

  useEffect(() => {
    if (isiOS) {
      setOpenModal(true);
    }

    console.log("userAgent", window.navigator.userAgent);
    console.log("platform", window.navigator.platform);
  }, []);

  return (
    <Modal
      isOpen={openModal}
      onRequestClose={() => setOpenModal(false)}
      closeButton={true}
      contentLabel={TEXTS.statiske.FormPageFyllUt.title}
      ariaHideApp={false}
    >
      <div>
        <Systemtittel className="margin-bottom-double">{translate(TEXTS.statiske.FormPageFyllUt.title)}</Systemtittel>
        <Normaltekst className="margin-bottom-double">{translate(TEXTS.statiske.FormPageFyllUt.content)}</Normaltekst>
        <nav className="list-inline">
          <div className="list-inline-item">
            <Knapp className="knapp" onClick={() => setOpenModal(false)}>
              {translate(TEXTS.grensesnitt.ok)}
            </Knapp>
          </div>
        </nav>
      </div>
    </Modal>
  );
};

export default ModalPrompt;
