import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { Knapp } from "nav-frontend-knapper";
import Lenke from "nav-frontend-lenker";
import Modal from "nav-frontend-modal";
import { Normaltekst, Systemtittel } from "nav-frontend-typografi";
import React from "react";

class ModalPrompt extends React.Component {
  componentWillUnmount = () => {
    //setOpenModal(false)
    console.log("componentWillUnmount");
  };

  componentDidMount() {
    console.log("componentDidMount");
  }

  render() {
    return (
      <Modal
        isOpen={this.props.openModal}
        onRequestClose={() => this.props.closeModal()}
        closeButton={true}
        contentLabel={this.props.contentLabel}
        ariaHideApp={false}
      >
        <div>
          <Systemtittel className="margin-bottom-double">{this.props.title}</Systemtittel>
          <Normaltekst className="margin-bottom-double">{this.props.promptText}</Normaltekst>
          <nav className="list-inline">
            <div className="list-inline-item">
              <Lenke className="knapp" href="https://www.nav.no">
                {TEXTS.common.yes}
              </Lenke>
            </div>
            <div className="list-inline-item">
              <Knapp className="knapp" onClick={() => this.props.closeModal()}>
                {TEXTS.common.no}
              </Knapp>
            </div>
          </nav>
        </div>
      </Modal>
    );
  }
}

export default ModalPrompt;
