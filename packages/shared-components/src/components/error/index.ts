export interface HttpError {
  message: string;
  status: number;
  correlationId: string;
}
