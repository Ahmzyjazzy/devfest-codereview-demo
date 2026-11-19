import { addCollection, Icon as Iconify } from '@iconify/react'
import type { IconName } from '@/lib/icon-names'
import solarIcons from '@/lib/solar-icons.json'

addCollection(solarIcons)

export type { IconName }

export interface IconProps {
  name: IconName
  active?: boolean
  size?: number
  className?: string
}

export function Icon({ name, active = false, size = 20, className }: IconProps) {
  return (
    <Iconify
      icon={`solar:${name}-${active ? 'bold' : 'outline'}`}
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    />
  )
}
