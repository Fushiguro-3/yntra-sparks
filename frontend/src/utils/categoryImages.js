import threeDPrinting from '@/assets/images/categories/3d-printing.svg'
import artificialIntelligence from '@/assets/images/categories/artificial-intelligence.svg'
import astronomy from '@/assets/images/categories/astronomy.svg'
import coding from '@/assets/images/categories/coding.svg'
import electronics from '@/assets/images/categories/electronics.svg'
import engineering from '@/assets/images/categories/engineering.svg'
import mathematics from '@/assets/images/categories/mathematics.svg'
import robotics from '@/assets/images/categories/robotics.svg'
import science from '@/assets/images/categories/science.svg'
import technology from '@/assets/images/categories/technology.svg'

// Real categories are freeform text created by Super Admin (see
// src/views/superadmin/CategoriesView.vue) — there's no image field on the
// Category entity, so illustrations are matched by keyword with a generic
// science fallback for anything unrecognized (e.g. a brand-new subject
// area an admin adds later).
const KEYWORD_IMAGES = [
  [['3d print', '3d-print', 'print'], threeDPrinting],
  [['artificial intelligence', ' ai', 'machine learning', 'ai '], artificialIntelligence],
  [['astro', 'space'], astronomy],
  [['cod', 'program', 'software'], coding],
  [['electron'], electronics],
  [['engineer'], engineering],
  [['math'], mathematics],
  [['robot'], robotics],
  [['tech'], technology]
]

export function imageForCategory(name = '') {
  const normalized = ` ${name.toLowerCase()} `
  for (const [keywords, image] of KEYWORD_IMAGES) {
    if (keywords.some((k) => normalized.includes(k))) return image
  }
  return science
}
