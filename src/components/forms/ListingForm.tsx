'use client'

import { useState } from 'react'
import { ZodError } from 'zod'
import LocationSelector from '@/components/location/LocationSelector'
import { createClient } from '@/lib/supabase/client'
import { listingFormSchema, type ListingFormData } from '@/lib/validations/listing'
import type { TablesInsert } from '@/types/database.generated'
import FormField from './FormField'
import FormSelect from './FormSelect'

const listingTypes = [
  { value: 'annadhanam', label: 'Annadhanam' },
  { value: 'jeeva_samadhi', label: 'Jeeva Samadhi' },
  { value: 'temple', label: 'Temples & Meditation Centres' },
  { value: 'stay', label: 'Affordable Stays' },
  { value: 'medical', label: 'Affordable Medical Services' },
  { value: 'community_service', label: 'Community Service' },
]
const serviceTypes = [
  { value: 'ulavara_pani', label: 'Ulavara Pani' }, { value: 'water_body_restoration', label: 'Water Body Restoration' },
  { value: 'tree_planting', label: 'Tree Planting' }, { value: 'environmental_conservation', label: 'Environmental Conservation' },
  { value: 'temple_service', label: 'Temple Service' }, { value: 'heritage_conservation', label: 'Heritage Conservation' },
  { value: 'food_service', label: 'Annadhanam / Food Service' }, { value: 'animal_welfare', label: 'Animal Welfare' },
  { value: 'community_social_service', label: 'Community / Social Service' }, { value: 'other', label: 'Other' },
]
const countries = [{ value: 'india', label: 'India' }]

type FormState = { listingType:string; serviceType:string; name:string; description:string; country:string; taluk:string; panchayat:string; village:string; timing:string; googleMapsUrl:string; latitude:string; longitude:string; contactPerson:string; mobileNumber:string; whatsapp:string; email:string; website:string }
type LocationState = { state_id:number|null; district_id:number|null }
const initialFormData: FormState = { listingType:'',serviceType:'',name:'',description:'',country:'india',taluk:'',panchayat:'',village:'',timing:'',googleMapsUrl:'',latitude:'',longitude:'',contactPerson:'',mobileNumber:'',whatsapp:'',email:'',website:'' }
const initialLocation: LocationState = { state_id:null, district_id:null }

export default function ListingForm() {
  const [formData,setFormData]=useState<FormState>(initialFormData)
  const [location,setLocation]=useState<LocationState>(initialLocation)
  const [errors,setErrors]=useState<Record<string,string>>({})
  const [loading,setLoading]=useState(false)
  const [successMessage,setSuccessMessage]=useState('')
  const [errorMessage,setErrorMessage]=useState('')

  const handleChange=(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>)=>{
    const {name,value}=e.target
    setFormData(prev=>({...prev,[name]:value,...(name==='listingType'&&value!=='community_service'?{serviceType:''}:{})}))
    if(errors[name]) setErrors(prev=>({...prev,[name]:''}))
    if(name==='listingType'&&value!=='community_service'&&errors.serviceType) setErrors(prev=>({...prev,serviceType:''}))
  }
  const handleLocationChange=(value:LocationState)=>{setLocation(value);setErrors(prev=>({...prev,state_id:'',district_id:''}))}
  const handleReset=()=>{setFormData(initialFormData);setLocation(initialLocation);setErrors({});setSuccessMessage('');setErrorMessage('')}

  const useCurrentLocation=()=>{
    setErrorMessage('')
    if(!navigator.geolocation){setErrorMessage('Location access is not supported by this browser.');return}
    navigator.geolocation.getCurrentPosition(
      ({coords})=>setFormData(prev=>({...prev,latitude:coords.latitude.toFixed(6),longitude:coords.longitude.toFixed(6)})),
      ()=>setErrorMessage('Unable to access your location. You can enter the coordinates manually or leave them blank.'),
      {enableHighAccuracy:true,timeout:10000}
    )
  }

  const handleSubmit=async(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();setErrors({});setSuccessMessage('');setErrorMessage('')
    try{
      const payload={...formData,state_id:location.state_id,district_id:location.district_id}
      const validatedData:ListingFormData=listingFormSchema.parse(payload)
      setLoading(true)
      const supabase=createClient()
      const insertData:TablesInsert<'listings'>={
        listing_type:validatedData.listingType,
        service_type:validatedData.listingType==='community_service'?validatedData.serviceType?.trim()||null:null,
        name:validatedData.name.trim(),description:validatedData.description.trim(),state_id:validatedData.state_id,district_id:validatedData.district_id,
        taluk:validatedData.taluk.trim(),panchayat:validatedData.panchayat.trim(),village:validatedData.village.trim(),timing:validatedData.timing?.trim()||null,
        google_maps_url:validatedData.googleMapsUrl?.trim()||null,
        latitude:validatedData.latitude?.trim()?Number(validatedData.latitude):null,
        longitude:validatedData.longitude?.trim()?Number(validatedData.longitude):null,
        contact_person:validatedData.contactPerson.trim(),phone:validatedData.mobileNumber.trim(),whatsapp:validatedData.whatsapp?.trim()||null,
        email:validatedData.email.trim(),website:validatedData.website?.trim()||null,status:'pending',sub_district_id:null,local_body_id:null,settlement_id:null,image_url:null,
      }
      const {error}=await supabase.from('listings').insert(insertData)
      if(error) throw error
      setSuccessMessage('Listing submitted successfully! We will review it shortly.')
      setFormData(initialFormData);setLocation(initialLocation)
    }catch(error){
      if(error instanceof ZodError){const fieldErrors:Record<string,string>={};error.issues.forEach(issue=>{const path=issue.path[0]?.toString();if(path)fieldErrors[path]=issue.message});setErrors(fieldErrors)}
      else{console.error('Listing submission error:',error);setErrorMessage('Unable to submit the listing. Please try again.')}
    }finally{setLoading(false)}
  }

  return <form onSubmit={handleSubmit} onReset={handleReset} className="space-y-6">
    {successMessage&&<div className="p-4 bg-green-50 border border-green-200 rounded-lg"><p className="text-green-800 font-medium">{successMessage}</p></div>}
    {errorMessage&&<div className="p-4 bg-red-50 border border-red-200 rounded-lg"><p className="text-red-800 font-medium">{errorMessage}</p></div>}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FormSelect label="Listing Type" name="listingType" options={listingTypes} value={formData.listingType} onChange={handleChange} error={errors.listingType} required/><FormField label={formData.listingType==='community_service'?'Organisation / Group Name':'Name'} name="name" type="text" placeholder={formData.listingType==='community_service'?'e.g., Community Service Organisation':'e.g., Sri Vallalar Annadhanam Center'} value={formData.name} onChange={handleChange} error={errors.name} required/></div>
    {formData.listingType==='community_service'&&<div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5"><FormSelect label="Service Type" name="serviceType" options={serviceTypes} value={formData.serviceType} onChange={handleChange} error={errors.serviceType} required/><p className="text-sm text-gray-600 mt-2">Select the main type of community or social service carried out by this organisation or group.</p></div>}
    <FormField label="Description" name="description" type="textarea" placeholder={formData.listingType==='community_service'?'Describe the organisation, its activities and how people can participate...':'Describe the listing, services, or activities...'} value={formData.description} onChange={handleChange} error={errors.description} required rows={5}/>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FormSelect label="Country" name="country" options={countries} value={formData.country} onChange={handleChange} error={errors.country} required/><div><label className="block text-sm font-medium text-gray-700 mb-2">Location</label><LocationSelector value={location} onChange={handleLocationChange}/>{(errors.state_id||errors.district_id)&&<p className="mt-2 text-sm text-red-600">{errors.state_id||errors.district_id}</p>}</div></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FormField label="Taluk / Sub-District" name="taluk" type="text" placeholder="e.g., Gingee" value={formData.taluk} onChange={handleChange} error={errors.taluk} required/><FormField label="Panchayat / Municipality" name="panchayat" type="text" placeholder="e.g., Avalurpet" value={formData.panchayat} onChange={handleChange} error={errors.panchayat} required/></div>
    <FormField label="Village / Town" name="village" type="text" placeholder="e.g., Avalurpet" value={formData.village} onChange={handleChange} error={errors.village} required/>
    <div><FormField label={formData.listingType==='community_service'?'Activity Timing / Schedule':'Timing / Schedule'} name="timing" type="textarea" placeholder={formData.listingType==='community_service'?'e.g., Every Sunday 7:00 AM or activities announced periodically':'e.g., Daily - 12:00 PM to 2:00 PM'} value={formData.timing} onChange={handleChange} error={errors.timing} rows={3}/><p className="text-sm text-gray-500 mt-1">{formData.listingType==='community_service'?'Mention regular activity days, timings, or how upcoming service activities are announced.':'Example: Daily 12:00 PM - 2:00 PM, Every Sunday 1:00 PM, or Pournami days from 12:30 PM.'}</p></div>
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-5">
      <div><h3 className="font-semibold text-gray-900">Map Location</h3><p className="text-sm text-gray-600 mt-1">Google Maps link is useful for directions. Coordinates allow the listing to appear as a marker on our combined map.</p></div>
      <FormField label="Google Maps URL" name="googleMapsUrl" type="url" placeholder="https://maps.google.com/..." value={formData.googleMapsUrl} onChange={handleChange} error={errors.googleMapsUrl}/>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FormField label="Latitude" name="latitude" type="number" placeholder="e.g., 12.971599" value={formData.latitude} onChange={handleChange} error={errors.latitude}/><FormField label="Longitude" name="longitude" type="number" placeholder="e.g., 77.594566" value={formData.longitude} onChange={handleChange} error={errors.longitude}/></div>
      <button type="button" onClick={useCurrentLocation} className="inline-flex px-4 py-2 border border-emerald-700 text-emerald-700 text-sm font-semibold rounded-lg hover:bg-emerald-50 transition">📍 Use My Current Location</button>
      <p className="text-xs text-gray-500">Use this only when you are physically at the listing location. Coordinates are optional.</p>
    </div>
    <div className="border-t pt-6"><h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>{formData.listingType==='community_service'&&<p className="text-sm text-gray-600 mb-5">Provide contact details that members of the public can use to enquire about volunteering or participating in service activities.</p>}<div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FormField label="Contact Person" name="contactPerson" type="text" placeholder="Full name" value={formData.contactPerson} onChange={handleChange} error={errors.contactPerson} required/><FormField label="Email" name="email" type="email" placeholder="contact@example.com" value={formData.email} onChange={handleChange} error={errors.email} required/></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FormField label="Mobile Number" name="mobileNumber" type="tel" placeholder="10-digit number" value={formData.mobileNumber} onChange={handleChange} error={errors.mobileNumber} required/><FormField label="WhatsApp Number" name="whatsapp" type="tel" placeholder="10-digit number (optional)" value={formData.whatsapp} onChange={handleChange} error={errors.whatsapp}/></div><FormField label="Website / Social Media Page" name="website" type="url" placeholder="https://example.com (optional)" value={formData.website} onChange={handleChange} error={errors.website}/></div>
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200"><p className="text-sm text-gray-600">📷 <span className="font-medium">Image Upload:</span> This feature will be available in the next update to enhance your listing with photos.</p></div>
    <div className="flex gap-4"><button type="submit" disabled={loading} className="flex-1 bg-emerald-700 text-white font-semibold py-3 rounded-lg hover:bg-emerald-800 transition disabled:opacity-50 disabled:cursor-not-allowed">{loading?'Submitting...':'Submit Listing'}</button><button type="reset" disabled={loading} className="flex-1 bg-gray-200 text-gray-900 font-semibold py-3 rounded-lg hover:bg-gray-300 transition disabled:opacity-50">Clear</button></div>
  </form>
}
