interface AttachmentSettingValues {
  leggerVedNaa?: AttachmentSettingValue;
  ettersender?: AttachmentSettingValue;
  nei?: AttachmentSettingValue;
  levertTidligere?: AttachmentSettingValue;
  harIkke?: AttachmentSettingValue;
  andre?: AttachmentSettingValue;
  nav?: AttachmentSettingValue;
}

interface AttachmentSettingValue {
  enabled: boolean;
  showDeadline?: boolean;
  additionalDocumentation?: {
    enabled: boolean;
    label: string;
    description: string;
  };
}

interface AttachmentValue {
  key: keyof AttachmentSettingValues;
  description: string;
  additionalDocumentation?: string;
  additionalDocumentationLabel?: string;
  deadlineWarning?: string;
}

export type { AttachmentSettingValues, AttachmentValue };
