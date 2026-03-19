import type { IconType } from 'react-icons'
import {
  LuBookOpen,
  LuBriefcaseBusiness,
  LuBus,
  LuCircleEllipsis,
  LuGamepad2,
  LuHeartPulse,
  LuHouse,
  LuLaptop,
  LuPlus,
  LuReceiptText,
  LuTag,
  LuTrendingUp,
  LuUtensilsCrossed,
  LuWallet,
} from 'react-icons/lu'

export const categoryIconMap: Record<string, IconType> = {
  LuTag,
  LuWallet,
  LuBriefcaseBusiness,
  LuLaptop,
  LuTrendingUp,
  LuPlus,
  LuHouse,
  LuUtensilsCrossed,
  LuBus,
  LuHeartPulse,
  LuBookOpen,
  LuGamepad2,
  LuReceiptText,
  LuCircleEllipsis,
}

export const categoryIconOptions = Object.keys(categoryIconMap)

export const getCategoryIcon = (iconName?: string): IconType => {
  if (!iconName) return LuTag
  return categoryIconMap[iconName] ?? LuTag
}
