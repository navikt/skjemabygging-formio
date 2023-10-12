import FileSaver from 'file-saver';
import { b64toBlob } from './blob';

export const lastNedFilBase64 = (base64, tittel, filtype) => {
  try {
    FileSaver.saveAs(b64toBlob(base64), `${tittel}.${filtype}`);
  } catch (e) {
    console.error(e, `Klarte ikke å laste ned førstesideark.`);
  }
};

const pdf = {
  lastNedFilBase64,
};

export default pdf;
