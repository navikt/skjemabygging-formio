import { Button } from "@navikt/ds-react";
import { NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import React from "react";
import { useModal } from "../../util/useModal";
import ConfirmUnpublishModal from "./ConfirmUnpublishModal";

interface UnpublishButtonProps {
  onUnpublish: (form) => void;
  form: NavFormType;
}

const UnpublishButton = ({ onUnpublish, form }: UnpublishButtonProps) => {
  const [openConfirmModal, setOpenConfirmModal] = useModal(false);

  return (
    <>
      {form.properties?.published && (
        <>
          <Button variant="secondary" onClick={() => setOpenConfirmModal(true)} type="button">
            Avpubliser
          </Button>

          <ConfirmUnpublishModal
            openModal={openConfirmModal}
            closeModal={() => setOpenConfirmModal(false)}
            onUnpublish={onUnpublish}
            form={form}
          />
        </>
      )}
    </>
  );
};

export default UnpublishButton;
