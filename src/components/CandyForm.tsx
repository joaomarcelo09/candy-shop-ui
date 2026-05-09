import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { candySchema, type CandySchema } from '../schemas/candy'
import type { Candy } from '../types/domain'
import { fromCents, toCents } from '../utils/format'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

interface CandyFormProps {
  candy?: Candy | null
  loading: boolean
  onSubmit: (payload: { name: string; price: number }) => Promise<void>
}

export function CandyForm({ candy, loading, onSubmit }: CandyFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CandySchema>({
    resolver: zodResolver(candySchema),
    defaultValues: {
      name: candy?.name ?? '',
      price: candy ? fromCents(candy.price) : undefined,
    },
  })

  useEffect(() => {
    reset({
      name: candy?.name ?? '',
      price: candy ? fromCents(candy.price) : undefined,
    })
  }, [candy, reset])

  return (
    <form
      className="glass-card flex flex-col gap-4 p-5"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit({
          name: values.name.trim(),
          price: toCents(values.price),
        })

        if (!candy) {
          reset({
            name: '',
            price: undefined,
          })
        }
      })}
    >
      <div>
        <h3 className="text-lg font-bold text-cocoa-900">
          {candy ? 'Edit candy' : 'New candy'}
        </h3>
        <p className="mt-1 text-sm text-cocoa-800/65">
          Keep prices in reais. The form converts them to cents for the API.
        </p>
      </div>

      <Input label="Candy name" placeholder="Chocolate" error={errors.name?.message} {...register('name')} />
      <Input
        label="Price (R$)"
        type="number"
        step="0.01"
        min="0.01"
        placeholder="5.00"
        error={errors.price?.message}
        {...register('price', { valueAsNumber: true })}
      />

      <Button type="submit" disabled={loading}>
        {candy ? 'Save changes' : 'Create candy'}
      </Button>
    </form>
  )
}
