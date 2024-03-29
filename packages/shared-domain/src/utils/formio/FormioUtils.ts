import FormioUtilsOriginal from 'formiojs/utils';

/**
 * Etter oppgradering til Vite 5 fikk vi problemer i backend (node) med bruk av kode fra shared-domain som importerer
 * FormioUtils i lokalt utviklingsmiljø. Fikk følgende feilmelding:
 *
 *     __vite_ssr_import_0__.default.checkCondition is not a function
 *
 * Mistenker at det er relatert til at vi laster kode fra shared-domain via tsconfig paths, og at Vite da ikke fikser
 * opp i commonjs exports lenger (?), men kom aldri til bunns i saken. Det er kun kode i shared-domain som importerte
 * direkte fra 'formiojs/utils' som fikk problemet. Vil tro denne filen kan droppes den dagen Formio eksporterer
 * ES modules.
 *
 * Her kommer dirty hack for at ting også skal fungere under utvikling lokalt:
 */
const FormioUtils =
  Object.keys(FormioUtilsOriginal).length === 1 && FormioUtilsOriginal.default
    ? FormioUtilsOriginal.default
    : FormioUtilsOriginal;

export default FormioUtils;
