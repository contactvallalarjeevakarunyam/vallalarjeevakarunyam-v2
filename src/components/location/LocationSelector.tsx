'use client'

import { useEffect, useState } from 'react'

import { getStates, getDistricts } from '@/lib/queries/location'

import StateSelect from './StateSelect'
import DistrictSelect from './DistrictSelect'

import {
  State,
  District,
  LocationSelectorProps,
} from './types'

export default function LocationSelector({
  value,
  onChange,
}: LocationSelectorProps) {
  const [states, setStates] = useState<State[]>([])
  const [districts, setDistricts] = useState<District[]>([])

  const [loadingStates, setLoadingStates] = useState(true)
  const [loadingDistricts, setLoadingDistricts] = useState(false)

  useEffect(() => {
    async function loadStates() {
      try {
        const data = await getStates()
        setStates(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingStates(false)
      }
    }

    loadStates()
  }, [])

  useEffect(() => {
    async function loadDistricts() {
      if (!value.state_id) {
        setDistricts([])
        return
      }

      try {
        setLoadingDistricts(true)

        const data = await getDistricts(value.state_id)

        setDistricts(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingDistricts(false)
      }
    }

    loadDistricts()
  }, [value.state_id])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      <StateSelect
        states={states}
        loading={loadingStates}
        value={value.state_id}
        onChange={(state_id) =>
          onChange({
            state_id,
            district_id: null,
          })
        }
      />

      <DistrictSelect
        districts={districts}
        loading={loadingDistricts}
        disabled={!value.state_id}
        value={value.district_id}
        onChange={(district_id) =>
          onChange({
            ...value,
            district_id,
          })
        }
      />

    </div>
  )
}