export interface State {
  id: number
  name: string
}

export interface District {
  id: number
  state_id: number
  name: string
}

export interface LocationValue {
  state_id: number | null
  district_id: number | null
}

export interface LocationSelectorProps {
  value: LocationValue
  onChange: (value: LocationValue) => void
}