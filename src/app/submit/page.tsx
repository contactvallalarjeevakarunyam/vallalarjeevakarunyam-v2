import ListingForm from '@/components/forms/ListingForm'

export const metadata = {
  title: 'Submit Listing - Vallalar Jeevakarunyam',
  description: 'Submit a listing for Annadhanam, spiritual places, affordable stays, Affordable Healthcare, Affordable Education, volunteer or community service.',
}

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Submit a Listing
          </h1>
          <p className="text-lg text-gray-600">
            Share information about Annadhanam, spiritual places, affordable stays, Affordable Healthcare, Affordable Education or community service.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <ListingForm />
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How it works</h3>
          <ul className="text-blue-800 space-y-2">
            <li>✓ Fill in all the details about your listing</li>
            <li>✓ Our team will review your submission</li>
            <li>✓ Your listing will appear on the platform once approved</li>
            <li>✓ You'll be notified via email when your listing goes live</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
