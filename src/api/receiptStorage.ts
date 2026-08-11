import type { ReceiptStorage } from './contracts'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

function getExtension(file: File) {
  const extension = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '')
  return extension ? `.${extension.toLocaleLowerCase()}` : ''
}

function validateReceipt(file: File) {
  if (!file.type.startsWith('image/')) throw new Error('O comprovante PIX precisa ser uma imagem')
  if (file.size > 5 * 1024 * 1024) throw new Error('A imagem do PIX deve ter no máximo 5 MB')
}

export function createReceiptStorage(): ReceiptStorage {
  if (import.meta.env.VITE_ENABLE_API_MOCKS === 'true') {
    return {
      async uploadPixReceipt(sessionId, file) {
        validateReceipt(file)
        return `https://mock.local/pix/${sessionId}/${crypto.randomUUID()}`
      },
    }
  }

  return {
    async uploadPixReceipt(sessionId, file) {
      validateReceipt(file)
      if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.storageBucket) {
        throw new Error('Configure o Firebase para anexar comprovantes PIX')
      }

      const [{ initializeApp, getApps }, { getDownloadURL, getStorage, ref, uploadBytes }] =
        await Promise.all([import('firebase/app'), import('firebase/storage')])
      const app = getApps()[0] ?? initializeApp(firebaseConfig)
      const storage = getStorage(app)
      const fileName = `${crypto.randomUUID()}${getExtension(file)}`
      const receiptRef = ref(storage, `pix-receipts/${sessionId}/${fileName}`)

      await uploadBytes(receiptRef, file, {
        contentType: file.type || 'application/octet-stream',
      })

      return getDownloadURL(receiptRef)
    },
  }
}
