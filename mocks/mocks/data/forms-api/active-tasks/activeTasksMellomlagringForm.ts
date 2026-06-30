import { createTestMellomlagringForms } from '../shared/createTestMellomlagringForms';

const activeTasksMellomlagringForm = () => createTestMellomlagringForms('activetasksmellomlagring').form;
const activeTasksMellomlagringFormV2 = () => createTestMellomlagringForms('activetasksmellomlagring').formV2;

export { activeTasksMellomlagringForm, activeTasksMellomlagringFormV2 };
