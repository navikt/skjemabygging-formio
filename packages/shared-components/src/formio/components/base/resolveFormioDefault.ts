const resolveFormioDefault = <T>(value: T): T => {
  const candidate = value as any;
  return (candidate?.default?.default ?? candidate?.default ?? candidate) as T;
};

export default resolveFormioDefault;
