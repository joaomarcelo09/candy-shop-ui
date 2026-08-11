import axios from 'axios'
import toast from 'react-hot-toast'

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message as string | string[] | undefined
    if (Array.isArray(message)) return message.join(', ')
    if (message) return message
  }

  if (error instanceof Error && error.message) return error.message
  return 'Não foi possível concluir a solicitação'
}

export function handleError(error: unknown) {
  toast.error(getErrorMessage(error))
}
