interface BaseComponentModel {
  id?: string;
  navId?: string;
  key: string;
  label: string;
  type: string;
  description?: string;
  disabled?: boolean;
  hideLabel?: boolean;
  readOnly?: boolean;
}

export type { BaseComponentModel };
