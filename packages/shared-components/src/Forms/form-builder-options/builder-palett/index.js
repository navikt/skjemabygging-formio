import personPalett from "./personPalett";
import pengerOgKontoPalett from "./pengerOgKontoPalett";
import organisasjonPalett from "./organisasjonPalett";
import datoOgTidPalett from "./datoOgTidPalett";
import basicPalett from "./basicPalett";
import layoutPalett from "./layoutPalett";
import dataPalett from "./dataPalett";
import panelsPalett from "./panelsPalett";

const builderPalett = {
  advanced: null,
  premium: null,
  person: personPalett,
  pengerOgKonto: pengerOgKontoPalett,
  organisasjon: organisasjonPalett,
  datoOgTid: datoOgTidPalett,
  basic: basicPalett,
  layout: layoutPalett,
  data: dataPalett,
  panels: panelsPalett,

};

export default builderPalett;