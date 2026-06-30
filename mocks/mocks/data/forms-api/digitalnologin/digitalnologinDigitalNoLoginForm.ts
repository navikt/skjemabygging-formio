import { createSubmissionTypeForm, createSubmissionTypeTranslations } from '../shared/createSubmissionTypeForm';

const digitalnologinDigitalNoLoginForm = () =>
  createSubmissionTypeForm({
    title: 'Digitalnologin digital no login form',
    formNumber: 'DIGITALNOLOGIN-DIGITAL-NO-LOGIN',
    path: 'digitalnologindigitalnologin',
    submissionTypes: ['DIGITAL', 'DIGITAL_NO_LOGIN'],
    ettersendelsesfrist: 14,
  });

const digitalnologinDigitalNoLoginTranslations = () =>
  createSubmissionTypeTranslations({
    title: 'Digitalnologin digital no login form',
    formNumber: 'DIGITALNOLOGIN-DIGITAL-NO-LOGIN',
    path: 'digitalnologindigitalnologin',
    submissionTypes: ['DIGITAL', 'DIGITAL_NO_LOGIN'],
    ettersendelsesfrist: 14,
  });

export { digitalnologinDigitalNoLoginForm, digitalnologinDigitalNoLoginTranslations };
