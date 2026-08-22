import Link from 'next/link'
import VolunteerRegistrationForm from '@/components/volunteer/VolunteerRegistrationForm'

export default function VolunteerRegisterPage() {
  return <main className="min-h-screen bg-gray-50"><div className="max-w-4xl mx-auto px-4 py-10">
    <Link href="/volunteer" className="inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-800 mb-6">← Back to Volunteer & Community Service</Link>
    <div className="mb-8"><p className="text-sm font-semibold text-emerald-700 mb-2">Vallalar Jeevakarunyam</p><h1 className="text-3xl md:text-4xl font-bold text-gray-900">Volunteer With Us</h1><p className="text-gray-600 mt-3 max-w-3xl leading-7">Help identify useful listings, verify information submitted by the public and report outdated details so the platform remains accurate and useful.</p></div>
    <VolunteerRegistrationForm />
  </div></main>
}
