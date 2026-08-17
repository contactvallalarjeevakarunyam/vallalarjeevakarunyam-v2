'use client'

import { State } from './types'

interface Props {
  states: State[]
  value: number | null
  loading: boolean
  onChange: (id: number | null) => void
}

export default function StateSelect({
  states,
  value,
  loading,
  onChange,
}: Props) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        State
      </label>

      <select
        value={value ?? ''}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : null)
        }
        disabled={loading}
        className="w-full rounded-lg border border-gray-300 px-4 py-2"
      >
        <option value="">
          {loading ? 'Loading states...' : 'Select State'}
        </option>

        {states.map((state) => (
          <option key={state.id} value={state.id}>
            {state.name}
          </option>
        ))}
      </select>
    </div>
  )
}