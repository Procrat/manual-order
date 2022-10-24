export type Ok<T> = {
  isOk: true;
  isErr: false;
  value: T;
};

export type Err<E> = {
  isOk: false;
  isErr: true;
  error: E;
}

export function ok<T>(value: T): Ok<T> {
  return {
    isOk: true,
    isErr: false,
    value,
  };
}

export function err<E>(error: E): Err<E> {
  return {
    isOk: false,
    isErr: true,
    error,
  };
}

export type Result<T, E> = Ok<T> | Err<E>;
