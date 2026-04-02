export class AppError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: unknown

  constructor(
    status: number,
    message: string,
    details?: unknown,
    code = 'APP_ERROR',
  ) {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Token de acesso inválido ou ausente.') {
    super(401, message, undefined, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acesso negado para esta operação.') {
    super(403, message, undefined, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso não encontrado.') {
    super(404, message, undefined, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Dados inválidos.', details?: unknown) {
    super(422, message, details, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}
