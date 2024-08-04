export const transformSecondsToMinutes = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = time - minutes * 60;

  return (
    new String(minutes).padStart(2, '0') +
    ':' +
    new String(seconds).padStart(2, '0')
  );
};
