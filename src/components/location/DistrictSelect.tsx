'use client'

import { District } from './types'

interface Props {
  districts: District[]
  value: number | null
  loading: boolean
  disabled: boolean
  onChange: (id: number | null) => void
}

export default function DistrictSelect({
  districts,
  value,
  loading,
  disabled,
  onChange,
}: Props) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        District
      </label>

      <select
        value={value ?? ''}
        disabled={disabled || loading}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : null)
        }
        className="w-full rounded-lg border border-gray-300 px-4 py-2"
      >
        <option value="">
          {loading ? 'Loading districts...' : 'Select District'}
        </option>

        {districts.map((district) => (
          <option key={district.id} value={district.id}>
            {district.name}
          </option>
        ))}
      </select>
    </div>
  )
}