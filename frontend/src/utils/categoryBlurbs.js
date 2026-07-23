// Short marketing captions for known STEM categories, centralized here so
// HomeView and CategoriesView both read one source instead of each keeping
// their own copy — category data itself (name/id) still comes from
// categoryService, this is presentation-only copy for names we recognize.
const BLURBS = {
  Science: 'Experiments that make abstract concepts tangible',
  Technology: 'Real tools, real interfaces, real confidence',
  Engineering: 'Design, build, test, iterate',
  Mathematics: 'Numbers made visual and physical',
  Coding: 'From block-based logic to first real code',
  Robotics: 'Assemble, wire, and program working robots',
  Electronics: 'Circuits and components brought to life',
  'Artificial Intelligence': 'A gentle, visual introduction to how machines learn'
}

const FALLBACK_BLURB = 'Hands-on kits built for real classrooms'

export function blurbForCategory(name) {
  return BLURBS[name] || FALLBACK_BLURB
}
