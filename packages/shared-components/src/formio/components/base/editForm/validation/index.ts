import editFormCustomError from './editFormCustomError';
import editFormCustomMessage from './editFormCustomMessage';
import editFormCustomValidation from './editFormCustomValidation';
import editFormMaxLength from './editFormMaxLength';
import editFormMinLength from './editFormMinLength';
import editFormRequired from './editFormRequired';

const editFormValidation = {
  customError: editFormCustomError,
  customValidation: editFormCustomValidation,
  maxLength: editFormMaxLength,
  minLength: editFormMinLength,
  required: editFormRequired,
  customMessage: editFormCustomMessage,
};

export default editFormValidation;
