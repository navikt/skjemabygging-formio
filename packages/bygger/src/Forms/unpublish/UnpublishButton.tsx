import { NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import { Knapp } from "nav-frontend-knapper";
import React from "react";
import { useModal } from "../../util/useModal";
import ConfirmUnpublishModal from "./ConfirmUnpublishModal";

interface UnpublishButtonProps {
  onUnpublish: (form) => void;
  form: NavFormType;
  appElement?: string | HTMLElement;
}

const UnpublishButton = ({ onUnpublish, form, appElement }: UnpublishButtonProps) => {
  const [openConfirmModal, setOpenConfirmModal] = useModal(false);

  return (
    <>
      {form.properties?.published && (
        <>
          <Knapp onClick={() => setOpenConfirmModal(true)}>Avpubliser</Knapp>

          <ConfirmUnpublishModal
            openModal={openConfirmModal}
            closeModal={() => setOpenConfirmModal(false)}
            onUnpublish={onUnpublish}
            form={form}
            appElement={appElement}
          />
        </>
      )}
    </>
  );
};

export default UnpublishButton;
