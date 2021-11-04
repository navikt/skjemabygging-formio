import React, { useState } from "react";
import PublishSettingsModal from "./PublishSettingsModal";
import ConfirmPublishModal from "./ConfirmPublishModal";
import { useModal } from "../util/useModal";

const PublishModalComponents = ({ form, onPublish, openPublishSettingModal, setOpenPublishSettingModal }) => {
  const [openConfirmPublishModal, setOpenConfirmPublishModal] = useModal(false);
  const [selectedLanguageCodeList, setSelectedLanguageCodeList] = useState([]);

  return (
    <>
      <PublishSettingsModal
        openModal={openPublishSettingModal}
        closeModal={() => setOpenPublishSettingModal(false)}
        publishModal={(languageCode) => {
          setOpenPublishSettingModal(false);
          setOpenConfirmPublishModal(true);
          setSelectedLanguageCodeList(languageCode);
        }}
        form={form}
      />
      <ConfirmPublishModal
        openModal={openConfirmPublishModal}
        closeModal={() => setOpenConfirmPublishModal(false)}
        form={form}
        onPublish={onPublish}
        publishLanguageCodeList={selectedLanguageCodeList}
      />
    </>
  );
};

export default PublishModalComponents;
