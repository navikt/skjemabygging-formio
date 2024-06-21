import editFormFromDate from './editFormFromDate';
import editFormLimitRelativelyToToday from './editFormLimitRelativelyToToday';
import editFormLimitToEarliestLatest from './editFormLimitToEarliestLatest';

const editFormDateValidation = {
  fromDate: editFormFromDate,
  limitRelativelyToToday: editFormLimitRelativelyToToday,
  limitToEarliestLatest: editFormLimitToEarliestLatest,
};

export default editFormDateValidation;
