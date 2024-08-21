export const EnvQualifier = {
  preprodIntern: 'preprodIntern',
  preprodAltIntern: 'preprodAltIntern',
  preprodAnsatt: 'preprodAnsatt',
  preprodAltAnsatt: 'preprodAltAnsatt',
  local: 'local',
} as const;

export type EnvQualifierType = (typeof EnvQualifier)[keyof typeof EnvQualifier];