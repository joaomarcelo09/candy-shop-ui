import { describe, expect, it } from 'vitest'
import { getSessionAvailability } from './sessionSchedule'

describe('getSessionAvailability', () => {
  it('permite abrir a sessão de domingo pela manhã e agenda o fechamento ao meio-dia', () => {
    const result = getSessionAvailability(new Date(2026, 7, 9, 11, 20))

    expect(result.available).toBe(true)
    expect(result.period).toBe('morning')
    expect(result.scheduledCloseAt?.getHours()).toBe(12)
    expect(result.scheduledCloseAt?.getMinutes()).toBe(0)
  })

  it('permite abrir a sessão de domingo à noite e agenda o fechamento às 22h', () => {
    const result = getSessionAvailability(new Date(2026, 7, 9, 18, 15))

    expect(result.available).toBe(true)
    expect(result.period).toBe('evening')
    expect(result.scheduledCloseAt?.getHours()).toBe(22)
  })

  it('impede novas sessões fora das janelas de domingo', () => {
    expect(getSessionAvailability(new Date(2026, 7, 9, 14, 0)).available).toBe(false)
    expect(getSessionAvailability(new Date(2026, 7, 10, 11, 20)).available).toBe(false)
  })
})
