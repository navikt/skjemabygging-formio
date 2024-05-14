import editFormCustomError from './editFormCustomError';
import editFormCustomMessage from './editFormCustomMessage';
import editFormCustomValidation from './editFormCustomValidation';
import editFormMaxLength from './editFormMaxLength';
import editFormMaxNumber from './editFormMaxNumber';
import editFormMinLength from './editFormMinLength';
import editFormMinNumber from './editFormMinNumber';
import editFormRequired from './editFormRequired';

const editFormValidation = {
  customError: editFormCustomError,
  customValidation: editFormCustomValidation,
  maxLength: editFormMaxLength,
  minLength: editFormMinLength,
  required: editFormRequired,
  customMessage: editFormCustomMessage,
  maxNumber: editFormMaxNumber,
  minNumber: editFormMinNumber,
};

export default editFormValidation;
