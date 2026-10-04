export class WorkerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkerError';
  }
}

export class DependencyError extends WorkerError {
  constructor(message: string) {
    super(message);
    this.name = 'DependencyError';
  }
}

export class TransientError extends WorkerError {
  constructor(message: string) {
    super(message);
    this.name = 'TransientError';
  }
}

export class BudgetError extends WorkerError {
  constructor(message: string) {
    super(message);
    this.name = 'BudgetError';
  }
}

export class PermanentError extends WorkerError {
  constructor(message: string) {
    super(message);
    this.name = 'PermanentError';
  }
}

export class RateLimitError extends WorkerError {
  public readonly isGlobal: boolean;
  constructor(message: string, isGlobal: boolean = false) {
    super(message);
    this.name = 'RateLimitError';
    this.isGlobal = isGlobal;
  }
}
