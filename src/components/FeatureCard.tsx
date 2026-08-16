interface FeatureCardProps {
  title: string
  description: string
  icon: React.ReactNode
}

export default function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex justify-center mb-4 text-4xl text-emerald-700">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
        {title}
      </h3>
      <p className="text-gray-600 text-center">
        {description}
      </p>
    </div>
  )
}
