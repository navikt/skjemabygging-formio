import { Component } from '../form';

type PanelValidation = {
  key: string;
  summaryComponents?: string[];
  firstInputComponent?: Component;
  hasValidationErrors: boolean;
  firstInputWithValidationError?: string;
};

export default PanelValidation;
