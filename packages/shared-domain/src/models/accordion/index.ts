interface AccordionSettingValue {
  title: string;
  content: string;
  defaultOpen?: boolean;
}
type AccordionSettingValues = AccordionSettingValue[];

export type { AccordionSettingValue, AccordionSettingValues };
