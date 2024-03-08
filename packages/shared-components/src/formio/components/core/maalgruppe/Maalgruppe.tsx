import BaseComponent from '../../base/BaseComponent';
import maalgruppeBuilder from './Maalgruppe.builder';
import maalgruppeForm from './Maalgruppe.form';

export interface MaalgruppeValueType {
  calculated?: string;
  prefilled?: string;
}

type MaalgruppeMapValue = { priority: number; kodeverkVerdi: string };

const maalgruppeMap: Record<string, MaalgruppeMapValue> = {
  aapUforeNedsattArbEvne: { priority: 1, kodeverkVerdi: 'NEDSARBEVN' },
  ensligUtdanning: { priority: 2, kodeverkVerdi: 'ENSFORUTD' },
  ensligArbSoker: { priority: 3, kodeverkVerdi: 'ENSFORARBS' },
  tidligereFamiliepleier: { priority: 4, kodeverkVerdi: 'TIDLFAMPL' },
  gjenlevendeUtdanning: { priority: 5, kodeverkVerdi: 'GJENEKUTD' },
  gjenlevendeArbSoker: { priority: 6, kodeverkVerdi: 'GJENEKARBS' },
  tiltakspenger: { priority: 7, kodeverkVerdi: 'MOTTILTPEN' },
  dagpenger: { priority: 8, kodeverkVerdi: 'MOTDAGPEN' },
  regArbSoker: { priority: 9, kodeverkVerdi: 'ARBSOKERE' },
  annet: { priority: 10, kodeverkVerdi: 'ANNET' },
};

const flattenedData = (data: { [key: string]: unknown }) =>
  Object.entries(data).reduce<{ [key: string]: unknown }>(
    (partialData, [key, value]) => ({
      ...partialData,
      ...(value && typeof value === 'object' ? value : { [key]: value }),
    }),
    {},
  );

const findSelectedMaalgruppe = (data: { [key: string]: unknown }) => {
  return Object.entries(flattenedData(data)).reduce<MaalgruppeMapValue | null>(
    (prevResult, [key, value]) =>
      (value === true || value === 'ja') &&
      maalgruppeMap[key] &&
      maalgruppeMap[key].priority < (prevResult?.priority || Infinity)
        ? maalgruppeMap[key]
        : prevResult,
    null,
  )?.kodeverkVerdi;
};

class Maalgruppe extends BaseComponent {
  static schema() {
    return BaseComponent.schema({
      label: 'Målgruppe',
      type: 'maalgruppe',
      key: 'maalgruppe',
      hideLabel: true,
      hidden: true,
      clearOnHide: false,
    });
  }

  static editForm() {
    return maalgruppeForm();
  }

  static get builderInfo() {
    return maalgruppeBuilder();
  }

  calculateMaalgruppeValue(): MaalgruppeValueType {
    const activityMaalgruppe = this.data?.aktivitet?.maalgruppe;
    const prefilledMaalgruppe = this.data?.maalgruppe?.prefilled || this.component?.defaultValue;
    return {
      calculated: activityMaalgruppe || findSelectedMaalgruppe(this.root?.data || {}) || 'ANNET',
      prefilled: prefilledMaalgruppe,
    };
  }

  renderReact(element: any) {
    element.render(<></>);
  }
}

export default Maalgruppe;
