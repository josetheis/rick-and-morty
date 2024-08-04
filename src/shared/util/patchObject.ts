export const patchObject = <S, T>(source: S, target: T) => {
  const patchedObject = { ...target };
  Object.entries(source).forEach(([key, value]) => {
    patchedObject[key] = value;
  });

  return patchedObject;
};
