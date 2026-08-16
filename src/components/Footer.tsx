export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold text-emerald-400 mb-4">
              Vallalar Jeevakarunyam
            </h3>
            <p className="text-gray-400">
              Serving all living beings without causing harm.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Get Involved</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Volunteer</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Submit Listing</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Donate</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8">
          <p className="text-center text-gray-400">
            &copy; {currentYear} Vallalar Jeevakarunyam. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
