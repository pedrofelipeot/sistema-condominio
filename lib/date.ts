export function inicioDoDiaUTC(data: Date) {
  return new Date(
    Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate()),
  );
}

export function fimDoDiaUTC(data: Date) {
  return new Date(
    Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate() + 1) -
      1,
  );
}
