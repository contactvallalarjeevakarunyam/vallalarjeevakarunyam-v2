interface FormFieldProps {
  label: string
  name: string
  type?: string
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  error?: string
  required?: boolean
  rows?: number
}

export default function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  rows,
}: FormFieldProps) {
  const isTextArea = type === 'textarea'

  return (
    <div className="mb-5">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {isTextArea ? (
        <textarea
          id={name}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          rows={rows || 4}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
      )}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}
