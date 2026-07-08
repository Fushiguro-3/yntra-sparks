/* ============================================================
   YNTRA SPARKS — mock-data.js
   Placeholder data so every new page has something real to render
   before the backend exists. Delete this file (and set
   YSApi.config.mock = false) once real endpoints are live.
   ============================================================ */
(function (global) {
  'use strict';

  var CATEGORIES_KEY = 'ys_mock_categories';
  var defaultCategories = [
    { id: 'cat_physics', name: 'Physics' },
    { id: 'cat_chemistry', name: 'Chemistry' },
    { id: 'cat_biology', name: 'Biology' },
    { id: 'cat_engineering', name: 'Engineering' },
    { id: 'cat_robotics', name: 'Robotics' }
  ];

  /**
   * Categories are the one piece of mock data that pages create/edit/delete
   * through the UI (see categories.html + api.js CategoryAPI). Every other
   * mock-data array is read-only reference data. Because this is a
   * multi-page app (each page is a full navigation, not an SPA route), any
   * edits made in memory would be lost the instant the user navigated to
   * another page — e.g. adding a category then opening Add Kit would show
   * the old list again. To make "Categories update everywhere" actually
   * true, the current category list is persisted to sessionStorage and
   * reloaded here on every page load. This is still just the mock layer:
   * a real backend integration would simply replace CategoryAPI's calls
   * with real HTTP requests and this persistence helper would no longer
   * be needed.
   */
  function loadCategories() {
    try {
      var raw = sessionStorage.getItem(CATEGORIES_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* fall through to defaults */ }
    return defaultCategories.slice();
  }

  function saveCategories(list) {
    try { sessionStorage.setItem(CATEGORIES_KEY, JSON.stringify(list)); }
    catch (e) { /* sessionStorage unavailable — mock stays in-memory only */ }
  }

  var categories = loadCategories();

  var kits = [
    { id: 'k1', title: 'Volcano Lab', category: 'Chemistry', grade: 'Grade 3', thumbnail: 'https://images.unsplash.com/photo-1603356033288-acfcb54801e6?auto=format&fit=crop&w=400&q=80',
      description: 'Build an erupting model volcano and learn reaction chemistry.',
      objectives: ['Understand acid-base reactions', 'Observe an exothermic reaction', 'Practice measuring and mixing safely'],
      videos: [{ title: 'Kit Overview', youtubeId: 'dQw4w9WgXcQ', order: 1 }, { title: 'Step-by-step Build', youtubeId: 'dQw4w9WgXcQ', order: 2 }] },
    { id: 'k2', title: 'Circuit Builders', category: 'Physics', grade: 'Grade 4', thumbnail: 'https://images.unsplash.com/photo-1603356033288-acfcb54801e6?auto=format&fit=crop&w=400&q=80',
      description: 'Wire simple circuits to light bulbs and spin motors.',
      objectives: ['Understand open vs. closed circuits', 'Identify conductors and insulators', 'Build a working series circuit'],
      videos: [{ title: 'Kit Overview', youtubeId: 'dQw4w9WgXcQ', order: 1 }] },
    { id: 'k3', title: 'Water Cycle Dome', category: 'Biology', grade: 'Grade 3', thumbnail: 'https://images.unsplash.com/photo-1603354351226-d82bd4a635a3?auto=format&fit=crop&w=400&q=80',
      description: 'A tabletop terrarium that shows evaporation in real time.',
      objectives: ['Explain evaporation and condensation', 'Track daily changes in a closed system'],
      videos: [{ title: 'Kit Overview', youtubeId: 'dQw4w9WgXcQ', order: 1 }] },
    { id: 'k4', title: 'Bridge Engineering', category: 'Engineering', grade: 'Grade 4', thumbnail: 'https://images.unsplash.com/photo-1603354350266-a8de3496163b?auto=format&fit=crop&w=400&q=80',
      description: 'Design and load-test a popsicle-stick bridge.',
      objectives: ['Understand load distribution', 'Compare truss designs', 'Test structural failure points'],
      videos: [{ title: 'Kit Overview', youtubeId: 'dQw4w9WgXcQ', order: 1 }, { title: 'Load Testing Demo', youtubeId: 'dQw4w9WgXcQ', order: 2 }] },
    { id: 'k5', title: 'Magnet Explorers', category: 'Physics', grade: 'Grade 2', thumbnail: 'https://images.unsplash.com/photo-1603354351149-e97b9124020d?auto=format&fit=crop&w=400&q=80',
      description: 'Investigate poles, fields, and magnetic materials.',
      objectives: ['Identify magnetic vs. non-magnetic materials', 'Map a magnetic field with iron filings'],
      videos: [{ title: 'Kit Overview', youtubeId: 'dQw4w9WgXcQ', order: 1 }] },
    { id: 'k6', title: 'Microscope Basics', category: 'Biology', grade: 'Grade 4', thumbnail: 'https://images.unsplash.com/photo-1604320233280-75d54bc1c22e?auto=format&fit=crop&w=400&q=80',
      description: 'First look at cells, fibers, and everyday materials.',
      objectives: ['Operate a light microscope safely', 'Prepare a basic wet-mount slide'],
      videos: [{ title: 'Kit Overview', youtubeId: 'dQw4w9WgXcQ', order: 1 }] },
    { id: 'k7', title: 'Robotics Starter Kit', category: 'Robotics', grade: 'Grade 5', thumbnail: 'https://images.unsplash.com/photo-1603356033288-acfcb54801e6?auto=format&fit=crop&w=400&q=80',
      description: 'Assemble and program a simple wheeled robot.',
      objectives: ['Understand basic robotics assembly', 'Write a simple movement sequence'],
      videos: [{ title: 'Kit Overview', youtubeId: 'dQw4w9WgXcQ', order: 1 }] }
  ];

  var teachers = [
    { id: 't1', name: 'Sarita Rao', grade: 'Grade 4', activities: 24, status: 'active', joined: '2024-01-14', email: 'sarita.rao@school.edu' },
    { id: 't2', name: 'Vikram Shah', grade: 'Grade 2', activities: 18, status: 'active', joined: '2023-08-02', email: 'vikram.shah@school.edu' },
    { id: 't3', name: 'Meera Iyer', grade: 'Grade 6', activities: 31, status: 'active', joined: '2022-03-21', email: 'meera.iyer@school.edu' },
    { id: 't4', name: 'Rohan Das', grade: 'Grade 1', activities: 9, status: 'inactive', joined: '2024-06-11', email: 'rohan.das@school.edu' },
    { id: 't5', name: 'Priya Nair', grade: 'Grade 7', activities: 27, status: 'active', joined: '2023-02-09', email: 'priya.nair@school.edu' },
    { id: 't6', name: 'Arjun Mehta', grade: 'Grade 3', activities: 15, status: 'active', joined: '2024-10-04', email: 'arjun.mehta@school.edu' }
  ];

  var schools = [
    { id: 's1', name: 'Greenfield Public School', address: 'Chennai, TN', principal: 'Anil Kumar', status: 'active', teachers: 32 },
    { id: 's2', name: 'Riverside Elementary', address: 'Bengaluru, KA', principal: 'Deepa Menon', status: 'active', teachers: 21 },
    { id: 's3', name: 'Sunrise Academy', address: 'Pune, MH', principal: 'Suresh Pillai', status: 'inactive', teachers: 12 },
    { id: 's4', name: 'Lakeview Primary', address: 'Hyderabad, TS', principal: 'Kavita Rao', status: 'active', teachers: 27 }
  ];

  var principals = [
    { id: 'p1', name: 'Anil Kumar', school: 'Greenfield Public School', status: 'active', email: 'anil.kumar@school.edu' },
    { id: 'p2', name: 'Deepa Menon', school: 'Riverside Elementary', status: 'active', email: 'deepa.menon@school.edu' },
    { id: 'p3', name: 'Suresh Pillai', school: 'Sunrise Academy', status: 'inactive', email: 'suresh.pillai@school.edu' }
  ];

  global.YSMockData = {
    categories: categories,
    kits: kits,
    teachers: teachers,
    schools: schools,
    principals: principals,
    /** Persist the current in-memory categories array (called by CategoryAPI after create/update/remove). */
    persistCategories: function () { saveCategories(categories); }
  };
})(window);
