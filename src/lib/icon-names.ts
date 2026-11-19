export const ICON_NAMES = [
  "add-circle",
  "alt-arrow-down",
  "alt-arrow-left",
  "alt-arrow-right",
  "buildings",
  "calendar",
  "calendar-add",
  "chart-2",
  "chat-round-dots",
  "check-circle",
  "clock-circle",
  "close",
  "danger-triangle",
  "hamburger-menu",
  "letter",
  "magnifier",
  "menu-dots",
  "notes",
  "pen",
  "phone",
  "refresh",
  "trash-bin-trash",
  "users-group-rounded",
  "wallet-money",
  "widget-5"
] as const

export type IconName = (typeof ICON_NAMES)[number]
