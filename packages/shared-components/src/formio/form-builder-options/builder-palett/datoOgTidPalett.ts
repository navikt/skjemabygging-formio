import datePickerBuilder from '../../components/core/datepicker/DatePicker.builder';
import dayBuilder from '../../components/core/day/Day.builder';
import timeBuilder from '../../components/core/time/Time.builder';

const datoOgTidPalett = {
  title: 'Dato og tid',
  components: {
    navDatepicker: datePickerBuilder(),
    time: timeBuilder(),
    day: dayBuilder(),
  },
};

export default datoOgTidPalett;
