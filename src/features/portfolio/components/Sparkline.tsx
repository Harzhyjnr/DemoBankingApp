import { useId } from 'react'
import { cn } from '@/lib/utils'

interface SparklineProps {
  data: number[]
  trend?: 'up' | 'down'
  className?: string
  label?: string
}

export function Sparkline({ data, trend = 'up', className, label }: SparklineProps) {
  const gradientId = useId()
  const isUp = trend === 'up'
  const color = isUp ? '#34d399' : '#fb7185'

  const w = 120
  const h = 36
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = Math.max(max - min, 1)
  const step = w / (Math.max(data.length, 2) - 1)
  const y = (value: number) => h - ((value - min) / range) * (h - 4) - 2

  const points = data.map((value, i) => `${(i * step).toFixed(2)},${y(value).toFixed(2)}`)
  const line = points.join(' ')
  const area = `0,${h} ${line} ${w},${h}`

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn('h-9 w-24 overflow-visible', className)}
      role="img"
      aria-label={label ?? `Sparkline showing a 24h ${trend === 'up' ? 'increase' : 'decrease'}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M ${area}`} fill={`url(#${gradientId})`} stroke="none" />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={w} cy={y(data[data.length - 1] ?? min)} r="2" fill={color} />
    </svg>
  )
}
