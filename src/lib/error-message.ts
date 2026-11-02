export function getErrorMessage(error: { message: string; data?: unknown }) {
  return error.data ? error.message : "Could not connect. Please try again.";
}
