import Link from 'next/link'

export default function AdminManagementLayout({ children }: { children: React.ReactNode }) {
  return <>
    <div className="max-w-5xl mx-auto px-6 pt-6">
      <nav className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
        <Link href="/admin/admins" className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700">Administrators</Link>
        <Link href="/admin/admins/scopes" className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700">District & Category Scopes</Link>
      </nav>
    </div>
    {children}
  </>
}
