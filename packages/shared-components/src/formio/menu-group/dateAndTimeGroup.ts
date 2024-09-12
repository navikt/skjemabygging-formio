import datePickerBuilder from '../components/core/datepicker/DatePicker.builder';
import dayBuilder from '../components/core/day/Day.builder';
import monthPickerBuilder from '../components/core/monthpicker/MonthPicker.builder';
import timeBuilder from '../components/core/time/Time.builder';
import yearBuilder from '../components/extensions/year/Year.builder';

const dateAndTimeGroup = {
  title: 'Dato og tid',
  components: {
    navDatepicker: datePickerBuilder(),
    time: timeBuilder(),
    day: dayBuilder(),
    monthPicker: monthPickerBuilder(),
    year: yearBuilder(),
  },
};

export default dateAndTimeGroup;
