'use client'

import { useMemo, useState } from 'react'

type StateOption = {
  id: number
  name: string
}

type DistrictOption = {
  id: number
  name: string
  state_id: number
}

type CategoryOption = {
  value: string
  label: string
}

type AdminScopeFormProps = {
  userId: string
  states: StateOption[]
  districts: DistrictOption[]
  categories: CategoryOption[]
  action: (formData: FormData) => Promise<void>
}

export default function AdminScopeForm({ userId, states, districts, categories, action }: AdminScopeFormProps) {
  const [selectedState, setSelectedState] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')

  const visibleDistricts = useMemo(() => {
    if (!selectedState) return districts
    const stateId = Number(selectedState)
    return districts.filter(district => district.state_id === stateId)
  }, [districts, selectedState])

  return <form action={action} className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
    <input type="hidden" name="userId" value={userId}/>
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <h3 className="font-semibold text-gray-900">Add / reactivate a scope</h3>
      <a href="/admin/admins/notifications" className="text-xs font-semibold text-emerald-700 hover:underline">Manage alert settings →</a>
    </div>
    <p className="text-xs text-gray-600 mt-1">Examples: Karnataka + Davanagere + Affordable Education, or Tamil Nadu + All districts + Annadhanam.</p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">State</label>
        <select
          name="stateId"
          value={selectedState}
          onChange={(event) => {
            setSelectedState(event.target.value)
            setSelectedDistrict('')
          }}
          className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All states</option>
          {states.map(state => <option key={state.id} value={state.id}>{state.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">District</label>
        <select
          name="districtId"
          value={selectedDistrict}
          onChange={(event) => setSelectedDistrict(event.target.value)}
          className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All districts</option>
          {visibleDistricts.map(district => <option key={district.id} value={district.id}>{district.name}</option>)}
        </select>
        {selectedState && visibleDistricts.length === 0 && <p className="text-xs text-amber-700 mt-1">No districts are configured for this state yet.</p>}
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
        <select name="listingType" className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm">
          <option value="">All categories</option>
          {categories.map(category => <option key={category.value} value={category.value}>{category.label}</option>)}
        </select>
      </div>
    </div>

    <button className="mt-4 bg-emerald-700 text-white font-semibold rounded-lg px-5 py-2.5 hover:bg-emerald-800">Save Scope</button>
  </form>
}
