import React, { useEffect, useState } from "react";
import Modal from "nav-frontend-modal";

const RefreshModal = () => {
  let [isOpen, setIsOpen] = useState(false);
  console.log("I am here");

  const openModal = (event) => {
    console.log("Finally, I am here");
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
    //browser default onBeforeunload popup
    //event.returnValue = '';
    setIsOpen(true);
  };

  useEffect(() => {
    window.addEventListener("beforeunload", openModal, false);
    console.log("I am in useEffect, mount");

    return () => {
      window.removeEventListener("beforeunload", openModal, false);
      console.log("I am in useEffect, unMount");
    };
  }, []);

  function closeModal() {
    setIsOpen(false);
  }

  function afterOpenModal() {
    //focus the button
  }

  return (
    <Modal
      isOpen={isOpen}
      onAfterOpen={afterOpenModal}
      onRequestClose={closeModal}
      closeButton={true}
      contentLabel="Advarsel"
    >
      <div style={{ padding: "2rem 2.5rem" }}>
        <h1>Advarsel!</h1>
        <p>
          Hvis du laster siden på nytt vil du miste alle opplysningene du har fylt ut i skjemaet. Du må da fylle ut
          skjemaet på nytt. Er du sikker på at du vil laste siden på nytt?
        </p>

        <nav className="list-inline">
          <div className="list-inline-item">
            <div
              className="knapp knapp--hoved btn-wizard-nav-cancel"
              onClick={(event) => {
                event.preventDefault();
              }}
            >
              Avbryt
            </div>
          </div>
          <div className="list-inline-item">
            <a className="knapp knapp--hoved" href={"/"}>
              Ja, last siden på nytt
            </a>
          </div>
        </nav>
      </div>
    </Modal>
  );
};

export default RefreshModal;
