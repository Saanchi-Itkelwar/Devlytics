import { useMemo } from "react"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

function getColor(count) {
  if (count === 0) return "#1E2A3A"
  if (count <= 2) return "#1e3a5f"
  if (count <= 5) return "#1d4ed8"
  if (count <= 10) return "#3b82f6"
  return "#5B8CFF"
}

export default function CommitHeatmap({ data = [] }) {
  const { weeks, monthLabels } = useMemo(() => {
    const dateMap = {}
    data.forEach(d => { dateMap[d.date] = d.count })

    const today = new Date()
    const start = new Date(today)
    start.setDate(start.getDate() - 364)
    // align to Sunday
    start.setDate(start.getDate() - start.getDay())

    const weeks = []
    const monthLabels = []
    let current = new Date(start)
    let lastMonth = -1

    while (current <= today) {
      const week = []
      for (let d = 0; d < 7; d++) {
        const dateStr = current.toISOString().split("T")[0]
        const month = current.getMonth()
        if (d === 0 && month !== lastMonth) {
          monthLabels.push({ label: MONTHS[month], weekIndex: weeks.length })
          lastMonth = month
        }
        week.push({
          date: dateStr,
          count: dateMap[dateStr] || 0,
          isFuture: current > today,
        })
        current.setDate(current.getDate() + 1)
      }
      weeks.push(week)
    }

    return { weeks, monthLabels }
  }, [data])

  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        {/* Month labels */}
        <div className="flex mb-1 ml-8">
          {monthLabels.map(({ label, weekIndex }) => (
            <div
              key={`${label}-${weekIndex}`}
              className="text-[10px] text-muted absolute"
              style={{ left: `${weekIndex * 14 + 32}px`, position: "relative", minWidth: 28 }}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] mr-1">
            {DAYS.map((d, i) => (
              <div key={d} className="h-[11px] text-[9px] text-muted flex items-center">
                {i % 2 !== 0 ? d : ""}
              </div>
            ))}
          </div>

          {/* Grid */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day) => (
                <div
                  key={day.date}
                  title={day.isFuture ? "" : `${day.date}: ${day.count} commits`}
                  className="w-[11px] h-[11px] rounded-[2px] cursor-pointer transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: day.isFuture ? "transparent" : getColor(day.count),
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1 mt-3 justify-end">
          <span className="text-[10px] text-muted mr-1">Less</span>
          {[0, 2, 5, 10, 15].map(v => (
            <div
              key={v}
              className="w-[11px] h-[11px] rounded-[2px]"
              style={{ backgroundColor: getColor(v) }}
            />
          ))}
          <span className="text-[10px] text-muted ml-1">More</span>
        </div>
      </div>
    </div>
  )
}