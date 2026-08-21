import { createTestMellomlagringForms } from '../shared/createTestMellomlagringForms';

const conditionalRenderingMellomlagringForm = () =>
  createTestMellomlagringForms('conditionalrenderingmellomlagring').form;
const conditionalRenderingMellomlagringFormV2 = () =>
  createTestMellomlagringForms('conditionalrenderingmellomlagring').formV2;

export { conditionalRenderingMellomlagringForm, conditionalRenderingMellomlagringFormV2 };
