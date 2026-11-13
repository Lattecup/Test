/** Ошибка домена: описывает ситуацию, которую должен исправить пользователь. */
export class DomainError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.status = status;
  }
}

/** Функциональность ещё не реализована на сервере. */
export class NotImplementedError extends Error {
  constructor(message = 'Серверное хранение данных ещё не реализовано') {
    super(message);
    this.name = 'NotImplementedError';
  }
}
