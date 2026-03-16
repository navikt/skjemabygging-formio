import { FieldSize } from '../field-size';
import { RecipientRole } from '../form';

interface SenderLabels {
  nationalIdentityNumber?: string;
  firstName?: string;
  surname?: string;
  organizationNumber?: string;
  organizationName?: string;
}

interface SenderDescriptions {
  nationalIdentityNumber?: string;
  organizationNumber?: string;
}

interface SenderPerson {
  nationalIdentityNumber: string;
  firstName: string;
  surname: string;
}

interface SenderOrganization {
  number: string;
  name: string;
}

interface SubmissionSender {
  person?: SenderPerson;
  organization?: SenderOrganization;
}

interface SenderProps {
  role: RecipientRole;
  labels: SenderLabels;
  descriptions: SenderDescriptions;
  value?: SubmissionSender;
  onChange: (value: SubmissionSender) => void;
  fieldSize?: FieldSize;
  readOnly?: boolean;
}

export type { SenderProps, SubmissionSender };
