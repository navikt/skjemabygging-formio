import { Component, SubmissionData } from '../form';

type ComponentError = {
  elementId?: string;
  message: string;
  path: string;
  level: 'error';
};

type FormioChangeEvent = {
  changed?: { component?: Component; instance?: any; value?: any; flags?: any };
  data?: SubmissionData;
  isValid?: boolean;
  metadata?: object;
};

export type { ComponentError, FormioChangeEvent };
