import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { Knapp } from "nav-frontend-knapper";
import Modal from "nav-frontend-modal";
import { Normaltekst, Systemtittel } from "nav-frontend-typografi";
import React, { useState } from "react";
import { useLanguages } from "../../context/languages";

const WarningAboutDifficultDigitalSubmissionModal = () => {
  const { translate } = useLanguages();
  const [openModal, setOpenModal] = useState(true);
  const { title, text1, text2 } = TEXTS.statiske.warningAboutDifficultSubmission.modal;

  return (
    <Modal
      isOpen={openModal}
      onRequestClose={() => setOpenModal(false)}
      closeButton={true}
      contentLabel={title}
      ariaHideApp={false}
    >
      <div>
        <Systemtittel className="margin-bottom-double">{translate(title)}</Systemtittel>
        <Normaltekst className="margin-bottom-default">{translate(text1)}</Normaltekst>
        <Normaltekst className="margin-bottom-double">{translate(text2)}</Normaltekst>
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

export default WarningAboutDifficultDigitalSubmissionModal;
