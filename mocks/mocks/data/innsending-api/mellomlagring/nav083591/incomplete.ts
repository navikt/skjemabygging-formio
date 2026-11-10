import completeDraft from './complete.json';

const incompleteDraft = structuredClone(completeDraft);
incompleteDraft.hoveddokumentVariant.document.data.data.fornavnSoker = '';

export default incompleteDraft;
