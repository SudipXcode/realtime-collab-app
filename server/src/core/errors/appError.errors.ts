// // src/core/errors/appError.errors.ts
// export class AppError extends Error {
//   public statusCode: number;
//   public isOperational: boolean;
//   public errorCode?: string;
//   public details?: unknown;

//   constructor(
//     message: string,
//     statusCode = 500,
//     errorCode?: string,
//     details?: unknown
//   ) {
//     super(message);
//     this.statusCode = statusCode;
//     this.errorCode = errorCode;
//     this.details = details;
//     this.isOperational = true;

//     Error.captureStackTrace(this, this.constructor);
//   }
// }
export class AppError extends Error {
  public statusCode: number;
  public status: "fail" | "error";
  public isOperational: boolean;
  public errorCode?: string;
  public details?: Record<string, any>;

  constructor(
    message: string,
    statusCode = 500,
    errorCode?: string,
    details?: Record<string, any>,
    isOperational = true
  ) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      message: this.message,
      statusCode: this.statusCode,
      status: this.status,
      errorCode: this.errorCode,
      details: this.details,
    };
  }
}