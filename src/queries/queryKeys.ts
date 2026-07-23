export const candyKeys = {
  all: ['candies'] as const,
}

export const sessionKeys = {
  all: ['sessions'] as const,
  current: ['sessions', 'current'] as const,
  orders: (sessionId: string) => ['sessions', sessionId, 'orders'] as const,
}

export const mutationKeys = {
  login: ['auth', 'login'] as const,
  createCandy: ['candies', 'create'] as const,
  updateCandy: ['candies', 'update'] as const,
  createSession: ['sessions', 'create'] as const,
  createSessionOrder: ['sessions', 'orders', 'create'] as const,
  deleteSessionOrder: ['sessions', 'orders', 'delete'] as const,
  closeSession: ['sessions', 'close'] as const,
}
