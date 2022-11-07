import React, { useState } from "react";
import { useModal } from "../../util/useModal";
import ConfirmPublishModal from "./ConfirmPublishModal";
import PublishSettingsModal from "./PublishSettingsModal";

const PublishModalComponents = ({ form, onPublish, openPublishSettingModal, setOpenPublishSettingModal }) => {
  const [openConfirmPublishModal, setOpenConfirmPublishModal] = useModal(false);
  const [selectedLanguageCodeList, setSelectedLanguageCodeList] = useState([]);

  return (
    <>
      <PublishSettingsModal
        openModal={openPublishSettingModal}
        closeModal={() => setOpenPublishSettingModal(false)}
        onPublish={(languageCodes) => {
          setOpenPublishSettingModal(false);
          setOpenConfirmPublishModal(true);
          setSelectedLanguageCodeList(languageCodes);
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
