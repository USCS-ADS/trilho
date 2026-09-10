export function Input({ type, placeholder, label }: { type: string; placeholder?: string; label?: string }) {
    return (
        <fieldset className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                {label}
            </label>
            <input
                type={type}
                placeholder={placeholder}
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
        </fieldset>
    )
}