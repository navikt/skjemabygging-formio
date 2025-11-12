export interface ConditionalComponentType {
  show?: boolean;
  when?: string;
  eq?: string;
}

const conditionalComponent = (props?: ConditionalComponentType) => {
  const { show, when, eq } = props ?? {};

  return {
    show: show ?? null,
    when: when ?? null,
    eq: eq ?? '',
  };
};

export default conditionalComponent;
