import fs from 'fs'

const NAMES = [
  'add-circle',
  'alt-arrow-down',
  'alt-arrow-left',
  'alt-arrow-right',
  'buildings',
  'calendar',
  'calendar-add',
  'chart-2',
  'check-circle',
  'clock-circle',
  'close',
  'danger-triangle',
  'hamburger-menu',
  'letter',
  'magnifier',
  'menu-dots',
  'notes',
  'pen',
  'phone',
  'refresh',
  'trash-bin-trash',
  'users-group-rounded',
  'wallet-money',
]

const src = JSON.parse(
  fs.readFileSync('node_modules/@iconify-json/solar/icons.json', 'utf8'),
)
const icons = {}
for (const name of NAMES) {
  for (const style of ['bold', 'outline']) {
    const key = `${name}-${style}`
    if (!src.icons[key]) throw new Error(`Missing Solar icon: ${key}`)
    icons[key] = src.icons[key]
  }
}

const out = {
  prefix: 'solar',
  width: src.width,
  height: src.height,
  icons,
}
fs.writeFileSync('src/lib/solar-icons.json', JSON.stringify(out) + '\n')
fs.writeFileSync(
  'src/lib/icon-names.ts',
  `export const ICON_NAMES = ${JSON.stringify(NAMES, null, 2)} as const\n\nexport type IconName = (typeof ICON_NAMES)[number]\n`,
)
console.log(`Wrote ${Object.keys(icons).length} Solar icons`)
