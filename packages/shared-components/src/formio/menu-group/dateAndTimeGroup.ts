import datePickerBuilder from '../components/core/datepicker/DatePicker.builder';
import dayBuilder from '../components/core/day/Day.builder';
import monthPickerBuilder from '../components/core/monthpicker/MonthPicker.builder';
import timeBuilder from '../components/core/time/Time.builder';

const dateAndTimeGroup = {
  title: 'Dato og tid',
  components: {
    navDatepicker: datePickerBuilder(),
    time: timeBuilder(),
    day: dayBuilder(),
    monthPicker: monthPickerBuilder(),
  },
};

export default dateAndTimeGroup;
