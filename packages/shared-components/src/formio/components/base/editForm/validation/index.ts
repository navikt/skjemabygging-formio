import editFormCustomError from './editFormCustomError';
import editFormCustomMessage from './editFormCustomMessage';
import editFormCustomValidation from './editFormCustomValidation';
import editFormDigitsOnly from './editFormDigitsOnly';
import editFormMaxLength from './editFormMaxLength';
import editFormMaxNumber from './editFormMaxNumber';
import editFormMaxYear from './editFormMaxYear';
import editFormMinLength from './editFormMinLength';
import editFormMinNumber from './editFormMinNumber';
import editFormMinYear from './editFormMinYear';
import editFormRequired from './editFormRequired';

const editFormValidation = {
  customError: editFormCustomError,
  customValidation: editFormCustomValidation,
  digitsOnly: editFormDigitsOnly,
  maxLength: editFormMaxLength,
  minLength: editFormMinLength,
  required: editFormRequired,
  customMessage: editFormCustomMessage,
  maxNumber: editFormMaxNumber,
  minNumber: editFormMinNumber,
  minYear: editFormMinYear,
  maxYear: editFormMaxYear,
};

export default editFormValidation;
