import React, { useState } from "react";
import PublishSettingsModal from "./PublishSettingsModal";
import ConfirmPublishModal from "./ConfirmPublishModal";
import { useModal } from "../util/useModal";

const PublishModalComponents = ({ form, onPublish, openPublishSettingModal, setOpenPublishSettingModal }) => {
  const [openConfirmPublishModal, setOpenConfirmPublishModal] = useModal(false);
  const [languageCodeList, setLanguageCodeList] = useState([]);

  return (
    <>
      <PublishSettingsModal
        openModal={openPublishSettingModal}
        closeModal={() => setOpenPublishSettingModal(false)}
        publishModal={(languageCode) => {
          setOpenConfirmPublishModal(true);
          setOpenPublishSettingModal(false);
          setLanguageCodeList(languageCode);
        }}
        form={form}
      />

      <ConfirmPublishModal
        openModal={openConfirmPublishModal}
        closeModal={() => setOpenConfirmPublishModal(false)}
        form={form}
        onPublish={onPublish}
        publishLanguageCode={languageCodeList}
      />
    </>
  );
};

export default PublishModalComponents;
