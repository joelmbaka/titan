export function handleError(error: unknown) {
  console.error("Error:", error);
  return { error: 'An error occurred', details: error instanceof Error ? error.message : 'Unknown error' };
} 