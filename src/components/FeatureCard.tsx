import Link from 'next/link'

interface FeatureCardProps {
  title: string
  description: string
  icon: React.ReactNode
  href?: string
}

export default function FeatureCard({
  title,
  description,
  icon,
  href,
}: FeatureCardProps) {
  const content = (
    <>
      <div className="flex justify-center mb-4 text-4xl text-emerald-700">
        {icon}
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
        {title}
      </h3>

      <p className="text-gray-600 text-center">
        {description}
      </p>

      {href && (
        <div className="mt-5 text-center">
          <span className="text-emerald-700 font-semibold">
            View Listings →
          </span>
        </div>
      )}
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="block bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
      >
        {content}
      </Link>
    )
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      {content}
    </div>
  )
}