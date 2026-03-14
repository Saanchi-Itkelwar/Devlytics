import { useMemo } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const WEEKS = 53
const DAYS = 7

function getColor(count) {
  if (count === 0) return "#1E2A3A"
  if (count <= 2) return "#1e3a5f"
  if (count <= 5) return "#1d5494"
  if (count <= 9) return "#2563eb"
  return "#5B8CFF"
}

export default function CommitHeatmap({ data = [] }) {
  const grid = useMemo(() => {
    const map = {}
    data.forEach(({ date, count }) => { map[date] = count })

    const today = new Date()
    const cells = []

    for (let w = WEEKS - 1; w >= 0; w--) {
      const week = []
      for (let d = 0; d < DAYS; d++) {
        const date = new Date(today)
        date.setDate(today.getDate() - (w * 7 + (DAYS - 1 - d)))
        const key = date.toISOString().split("T")[0]
        week.push({ date: key, count: map[key] || 0 })
      }
      cells.push(week)
    }

    return cells
  }, [data])

  const months = useMemo(() => {
    const labels = []
    const today = new Date()
    for (let w = 0; w < WEEKS; w += 4) {
      const date = new Date(today)
      date.setDate(today.getDate() - ((WEEKS - 1 - w) * 7))
      labels.push({
        label: date.toLocaleString("default", { month: "short" }),
        week: w,
      })
    }
    return labels
  }, [])

  return (
    <TooltipProvider delayDuration={0}>
      <div className="overflow-x-auto">
        {/* Month labels */}
        <div className="flex mb-1 ml-8">
          {months.map(({ label, week }) => (
            <div
              key={week}
              className="text-[10px] text-muted"
              style={{ width: `${(4 / WEEKS) * 100}%` }}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-1">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} className="w-6 h-3 text-[10px] text-muted flex items-center">
                {i % 2 !== 0 ? d : ""}
              </div>
            ))}
          </div>

          {/* Grid */}
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((cell, di) => (
                <Tooltip key={di}>
                  <TooltipTrigger asChild>
                    <div
                      className="w-3 h-3 rounded-sm cursor-pointer transition-opacity hover:opacity-80"
                      style={{ backgroundColor: getColor(cell.count) }}
                    />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="bg-[#1E2A3A] border-border-custom text-white text-xs"
                  >
                    <p className="font-medium">{cell.date}</p>
                    <p className="text-muted">{cell.count} commit{cell.count !== 1 ? "s" : ""}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}