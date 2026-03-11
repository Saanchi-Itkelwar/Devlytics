export default function Placeholder({ page }) {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-[#131929] border border-[#1E2A3A] flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🚧</span>
        </div>
        <p className="text-white font-medium">{page}</p>
        <p className="text-xs text-[#4A5568] mt-1">Coming in a future phase</p>
      </div>
    </div>
  )
}