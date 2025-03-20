type ErrorType =
  | 'GET_FAILED'
  | 'CREATE_FAILED'
  | 'UPDATE_FAILED'
  | 'UPDATE_FAILED_NOT_FOUND'
  | 'DELETE_FAILED'
  | 'DELETE_FAILED_NOT_FOUND'
  | 'SUBMIT_FAILED'
  | 'SUBMIT_FAILED_NOT_FOUND'
  | 'SUBMIT_AND_UPDATE_FAILED';

export type MellomlagringError = {
  title?: string;
  message?: string;
  messageStart?: string;
  messageEnd?: string;
  linkText?: string;
  url?: string;
  type: ErrorType;
  messageParams?: Record<string, any>;
};

export interface FyllutState {
  mellomlagring?: {
    isActive?: boolean;
    savedDate?: string;
    deletionDate?: string;
    error?: MellomlagringError;
  };
}
