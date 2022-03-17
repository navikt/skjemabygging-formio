import { Knapp } from "nav-frontend-knapper";
import Modal from "nav-frontend-modal";
import { Normaltekst, Systemtittel } from "nav-frontend-typografi";
import React from "react";

class ModalPrompt extends React.Component {
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
          <Normaltekst className="margin-bottom-double">{this.props.content}</Normaltekst>
          <nav className="list-inline">
            <div className="list-inline-item">
              <Knapp className="knapp" onClick={() => this.props.closeModal()}>
                OK
              </Knapp>
            </div>
          </nav>
        </div>
      </Modal>
    );
  }
}

export default ModalPrompt;
