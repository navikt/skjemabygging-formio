import basicPalett from "./basicPalett";
import dataPalett from "./dataPalett";
import datoOgTidPalett from "./datoOgTidPalett";
import layoutPalett from "./layoutPalett";
import organisasjonPalett from "./organisasjonPalett";
import panelsPalett from "./panelsPalett";
import pengerOgKontoPalett from "./pengerOgKontoPalett";
import personPalett from "./personPalett";

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
