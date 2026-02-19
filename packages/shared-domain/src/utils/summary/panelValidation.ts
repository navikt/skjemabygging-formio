import { Component } from '../../model/form';

type PanelValidation = {
  key: string;
  summaryComponents?: string[];
  firstInputComponent?: Component;
  hasValidationErrors: boolean;
  firstInputWithValidationError?: string;
};

export default PanelValidation;
