import type { AxiosInstance } from 'axios'
import { createAuthApi } from './auth'
import type { AppDependencies } from './contracts'
import { api } from './http'
import { createInventoryApi } from './inventory'
import { createReceiptStorage } from './receiptStorage'
import { createSessionApi } from './session'

export function createAppDependencies(client: AxiosInstance): AppDependencies {
  return {
    authApi: createAuthApi(client),
    inventoryApi: createInventoryApi(client),
    sessionApi: createSessionApi(client),
    receiptStorage: createReceiptStorage(),
  }
}

export const appDependencies = createAppDependencies(api)
