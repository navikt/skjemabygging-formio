import datepickerBuilder from '../../components/core/datepicker/Datepicker.builder';
import dayBuilder from '../../components/core/day/Day.builder';
import timeBuilder from '../../components/core/time/Time.builder';

const datoOgTidPalett = {
  title: 'Dato og tid',
  components: {
    datetime: null,
    datoVelger: datepickerBuilder(),
    time: timeBuilder(),
    day: dayBuilder(),
  },
};

export default datoOgTidPalett;
