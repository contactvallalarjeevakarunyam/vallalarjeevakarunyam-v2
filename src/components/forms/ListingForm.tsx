'use client'

import { useState } from 'react'
import { ZodError } from 'zod'
import LocationSelector from '@/components/location/LocationSelector'
import { listingFormSchema, type ListingFormData } from '@/lib/validations/listing'
import FormField from './FormField'
import FormSelect from './FormSelect'

const listingTypes = [
  { value: 'annadhanam', label: 'Annadhanam' }, { value: 'jeeva_samadhi', label: 'Jeeva Samadhi' },
  { value: 'temple', label: 'Temples & Meditation Centres' }, { value: 'stay', label: 'Affordable Stays' },
  { value: 'medical', label: 'Affordable Healthcare' }, { value: 'education', label: 'Affordable Education' },
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

type FormState = { listingType:string; serviceType:string; name:string; description:string; country:string; taluk:string; panchayat:string; village:string; timing:string; googleMapsUrl:string; latitude:string; longitude:string; contactPerson:string; mobileNumber:string; whatsapp:string; email:string; website:string; submitterName:string; submitterEmail:string; submitterPhone:string; submitterDeclaration:boolean }
type LocationState = { state_id:number|null; district_id:number|null }
const initialFormData: FormState = { listingType:'',serviceType:'',name:'',description:'',country:'india',taluk:'',panchayat:'',village:'',timing:'',googleMapsUrl:'',latitude:'',longitude:'',contactPerson:'',mobileNumber:'',whatsapp:'',email:'',website:'',submitterName:'',submitterEmail:'',submitterPhone:'',submitterDeclaration:false }
const initialLocation: LocationState = { state_id:null, district_id:null }

export default function ListingForm() {
  const [formData,setFormData]=useState<FormState>(initialFormData)
  const [location,setLocation]=useState<LocationState>(initialLocation)
  const [errors,setErrors]=useState<Record<string,string>>({})
  const [loading,setLoading]=useState(false)
  const [successMessage,setSuccessMessage]=useState('')
  const [errorMessage,setErrorMessage]=useState('')

  const handleChange=(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>)=>{
    const {name}=e.target
    const value=e.target instanceof HTMLInputElement && e.target.type==='checkbox' ? e.target.checked : e.target.value
    setFormData(prev=>({...prev,[name]:value,...(name==='listingType'&&value!=='community_service'?{serviceType:''}:{})}))
    if(errors[name]) setErrors(prev=>({...prev,[name]:''}))
  }
  const handleLocationChange=(value:LocationState)=>{setLocation(value);setErrors(prev=>({...prev,state_id:'',district_id:''}))}
  const handleReset=()=>{setFormData(initialFormData);setLocation(initialLocation);setErrors({});setSuccessMessage('');setErrorMessage('')}
  const useCurrentLocation=()=>{setErrorMessage('');if(!navigator.geolocation){setErrorMessage('Location access is not supported by this browser.');return}navigator.geolocation.getCurrentPosition(({coords})=>setFormData(prev=>({...prev,latitude:coords.latitude.toFixed(6),longitude:coords.longitude.toFixed(6)})),()=>setErrorMessage('Unable to access your location. You can enter the coordinates manually or leave them blank.'),{enableHighAccuracy:true,timeout:10000})}

  const handleSubmit=async(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();setErrors({});setSuccessMessage('');setErrorMessage('')
    try{
      const validatedData:ListingFormData=listingFormSchema.parse({...formData,state_id:location.state_id,district_id:location.district_id})
      setLoading(true)
      const response=await fetch('/api/listings',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(validatedData),
      })
      const result=await response.json().catch(()=>({}))
      if(!response.ok) throw new Error(result?.error||'Unable to submit the listing.')
      setSuccessMessage('Listing submitted successfully! Our admins have been alerted and will review it shortly.')
      setFormData(initialFormData);setLocation(initialLocation)
    }catch(error){if(error instanceof ZodError){const fieldErrors:Record<string,string>={};error.issues.forEach(issue=>{const path=issue.path[0]?.toString();if(path)fieldErrors[path]=issue.message});setErrors(fieldErrors)}else{console.error('Listing submission error:',error);setErrorMessage(error instanceof Error?error.message:'Unable to submit the listing. Please try again.')}}finally{setLoading(false)}
  }

  return <form onSubmit={handleSubmit} onReset={handleReset} className="space-y-6">
    {successMessage&&<div className="p-4 bg-green-50 border border-green-200 rounded-lg"><p className="text-green-800 font-medium">{successMessage}</p></div>}
    {errorMessage&&<div className="p-4 bg-red-50 border border-red-200 rounded-lg"><p className="text-red-800 font-medium">{errorMessage}</p></div>}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FormSelect label="Listing Type" name="listingType" options={listingTypes} value={formData.listingType} onChange={handleChange} error={errors.listingType} required/><FormField label={formData.listingType==='community_service'?'Organisation / Group Name':'Name'} name="name" type="text" placeholder="Name of place / organisation" value={formData.name} onChange={handleChange} error={errors.name} required/></div>
    {formData.listingType==='community_service'&&<div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5"><FormSelect label="Service Type" name="serviceType" options={serviceTypes} value={formData.serviceType} onChange={handleChange} error={errors.serviceType} required/></div>}
    <FormField label="Description" name="description" type="textarea" placeholder={formData.listingType==='education'?'Describe courses, education/skill services, eligibility and affordability...':'Describe the listing, services, or activities...'} value={formData.description} onChange={handleChange} error={errors.description} required rows={5}/>
    {formData.listingType==='education'&&<div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900"><strong>Affordable Education:</strong> Please mention whether the service is free, nominal-fee, scholarship-supported or otherwise affordable, and include known eligibility/admission details.</div>}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FormSelect label="Country" name="country" options={countries} value={formData.country} onChange={handleChange} error={errors.country} required/><div><label className="block text-sm font-medium text-gray-700 mb-2">Location</label><LocationSelector value={location} onChange={handleLocationChange}/>{(errors.state_id||errors.district_id)&&<p className="mt-2 text-sm text-red-600">{errors.state_id||errors.district_id}</p>}</div></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FormField label="Taluk / Sub-District" name="taluk" type="text" value={formData.taluk} onChange={handleChange} error={errors.taluk} required/><FormField label="Panchayat / Municipality" name="panchayat" type="text" value={formData.panchayat} onChange={handleChange} error={errors.panchayat} required/></div>
    <FormField label="Village / Town" name="village" type="text" value={formData.village} onChange={handleChange} error={errors.village} required/>
    <FormField label={formData.listingType==='community_service'?'Activity Timing / Schedule':formData.listingType==='education'?'Class / Office Timing':'Timing / Schedule'} name="timing" type="textarea" value={formData.timing} onChange={handleChange} error={errors.timing} required rows={3}/>
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-5"><div><h3 className="font-semibold text-gray-900">Map Location</h3><p className="text-sm text-gray-600 mt-1">Google Maps link is useful for directions. Coordinates allow the listing to appear on our combined map.</p></div><FormField label="Google Maps URL" name="googleMapsUrl" type="url" value={formData.googleMapsUrl} onChange={handleChange} error={errors.googleMapsUrl}/><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FormField label="Latitude" name="latitude" type="number" value={formData.latitude} onChange={handleChange} error={errors.latitude}/><FormField label="Longitude" name="longitude" type="number" value={formData.longitude} onChange={handleChange} error={errors.longitude}/></div><button type="button" onClick={useCurrentLocation} className="inline-flex px-4 py-2 border border-emerald-700 text-emerald-700 text-sm font-semibold rounded-lg hover:bg-emerald-50">📍 Use My Current Location</button><p className="text-xs text-gray-500">Use this only when you are physically at the listing location.</p></div>

    <div className="border-t pt-6"><h3 className="text-lg font-semibold text-gray-900">Place / Organisation Contact</h3><p className="text-sm text-gray-600 mt-1 mb-5">These contact details may be displayed publicly so visitors can enquire directly with the place, organiser or organisation.</p><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FormField label="Contact Person" name="contactPerson" type="text" value={formData.contactPerson} onChange={handleChange} error={errors.contactPerson} required/><FormField label="Contact Email" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} required/></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FormField label="Mobile Number" name="mobileNumber" type="tel" value={formData.mobileNumber} onChange={handleChange} error={errors.mobileNumber} required/><FormField label="WhatsApp Number" name="whatsapp" type="tel" value={formData.whatsapp} onChange={handleChange} error={errors.whatsapp}/></div><FormField label="Website / Social Media Page" name="website" type="url" value={formData.website} onChange={handleChange} error={errors.website}/></div>

    <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-5 md:p-6"><h3 className="text-lg font-semibold text-gray-900">Your Details — Submitter</h3><p className="text-sm text-gray-600 mt-1 mb-5"><strong>Private:</strong> These details are for administrator verification and clarification only. They will not be displayed on the public listing.</p><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FormField label="Your Name" name="submitterName" type="text" value={formData.submitterName} onChange={handleChange} error={errors.submitterName} required/><FormField label="Your Email" name="submitterEmail" type="email" value={formData.submitterEmail} onChange={handleChange} error={errors.submitterEmail} required/></div><FormField label="Your Mobile Number" name="submitterPhone" type="tel" value={formData.submitterPhone} onChange={handleChange} error={errors.submitterPhone} required/><label className="flex items-start gap-3 mt-5 cursor-pointer"><input type="checkbox" name="submitterDeclaration" checked={formData.submitterDeclaration} onChange={handleChange} className="mt-1 h-4 w-4 accent-emerald-700"/><span className="text-sm text-gray-700">I confirm that the information submitted is accurate to the best of my knowledge.</span></label>{errors.submitterDeclaration&&<p className="mt-2 text-sm text-red-600">{errors.submitterDeclaration}</p>}</div>

    <div className="flex gap-4"><button type="submit" disabled={loading} className="flex-1 bg-emerald-700 text-white font-semibold py-3 rounded-lg hover:bg-emerald-800 disabled:opacity-50">{loading?'Submitting...':'Submit Listing'}</button><button type="reset" disabled={loading} className="flex-1 bg-gray-200 text-gray-900 font-semibold py-3 rounded-lg hover:bg-gray-300">Clear</button></div>
  </form>
}
