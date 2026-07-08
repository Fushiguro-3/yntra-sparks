/* ============================================================
   YNTRA SPARKS — TEACHER MODULE (teacher.js)
   Shared logic for teacher-portal.html, teacher-kits.html,
   kit-details.html.

   NOTE: All data below is MOCK data used only so the UI can be
   demoed end-to-end without a backend. Every public method is
   written so a real fetch()/API call can be dropped in later
   without touching any calling page — see the TODO comments.
   ============================================================ */

(function (window) {
  "use strict";

  /* ------------------------------------------------------------
     MOCK DATA STORE
     (stand-in for what a /api/... backend would eventually return)
     ------------------------------------------------------------ */
  const MOCK_CATEGORIES = ["Engineering", "Electronics", "Earth Science", "Robotics", "Chemistry", "Art & Design"];

  const MOCK_KITS = [
    {
      id: "bridge-engineering",
      name: "Bridge Engineering",
      category: "Engineering",
      grade: "Grade 4",
      status: "In Progress",
      thumbColor: "#DCFCE7",
      iconColor: "#22C55E",
      shortDesc: "Design and load-test a popsicle-stick bridge to learn basic structural engineering.",
      description: "Students design, build, and load-test a popsicle-stick bridge, exploring how shape and material distribution affect strength. A hands-on introduction to structural engineering principles used in real-world construction.",
      materials: "Popsicle sticks, wood glue, string, small weights",
      objectives: [
        "Understand how load is distributed across a structure",
        "Compare triangular vs. rectangular truss strength",
        "Practice measuring and recording test results"
      ],
      videos: ["M7lc1UVf-VE", "aqz-KE-bpKQ"]
    },
    {
      id: "circuit-builders",
      name: "Circuit Builders",
      category: "Electronics",
      grade: "Grade 4",
      status: "Completed",
      thumbColor: "#DBEAFE",
      iconColor: "#2563EB",
      shortDesc: "Build simple series and parallel circuits using LEDs, batteries, and switches.",
      description: "A beginner-friendly electronics kit where students wire simple series and parallel circuits, light up LEDs, and learn how switches control current flow.",
      materials: "Coin batteries, LEDs, copper tape, switches",
      objectives: [
        "Identify the difference between series and parallel circuits",
        "Build a working circuit with a switch",
        "Explain the role of a battery, LED, and conductor"
      ],
      videos: ["M7lc1UVf-VE"]
    },
    {
      id: "volcano-lab",
      name: "Volcano Lab",
      category: "Earth Science",
      grade: "Grade 4",
      status: "Not Started",
      thumbColor: "#FEF3C7",
      iconColor: "#F59E0B",
      shortDesc: "Build a model volcano and trigger a safe chemical eruption reaction.",
      description: "Students construct a clay volcano model over a reaction chamber and trigger a baking-soda-and-vinegar eruption, connecting the activity to real plate tectonics and volcanic behavior.",
      materials: "Modeling clay, baking soda, vinegar, food coloring, tray",
      objectives: [
        "Describe how pressure builds inside a volcano",
        "Observe an acid-base chemical reaction",
        "Relate the model to real volcanic eruptions"
      ],
      videos: ["aqz-KE-bpKQ"]
    },
    {
      id: "robo-explorers",
      name: "Robo Explorers",
      category: "Robotics",
      grade: "Grade 5",
      status: "Not Started",
      thumbColor: "#EDE9FE",
      iconColor: "#7C3AED",
      shortDesc: "Assemble a simple wheeled robot and program basic forward/turn movement.",
      description: "An entry-level robotics kit where students assemble a wheeled chassis, wire a motor driver, and load a short program that moves the robot through a simple obstacle course.",
      materials: "Robot chassis kit, motors, controller board, USB cable",
      objectives: [
        "Assemble a motorized chassis correctly",
        "Upload a basic movement program",
        "Debug simple wiring issues"
      ],
      videos: ["M7lc1UVf-VE"]
    },
    {
      id: "crystal-garden",
      name: "Crystal Garden",
      category: "Chemistry",
      grade: "Grade 3",
      status: "In Progress",
      thumbColor: "#CFFAFE",
      iconColor: "#06B6D4",
      shortDesc: "Grow borax crystals overnight and observe crystallization in action.",
      description: "Students dissolve a saturated solution and watch crystals form over 24 hours, learning about solubility, saturation, and the science of crystallization.",
      materials: "Borax, warm water, pipe cleaners, glass jar",
      objectives: [
        "Explain what a saturated solution is",
        "Predict how cooling affects crystal growth",
        "Record daily observations in a science journal"
      ],
      videos: ["aqz-KE-bpKQ"]
    },
    {
      id: "paper-circuits-art",
      name: "Paper Circuit Art",
      category: "Art & Design",
      grade: "Grade 4",
      status: "Not Started",
      thumbColor: "#FCE7F3",
      iconColor: "#DB2777",
      shortDesc: "Combine copper tape circuits with drawing and collage to create light-up art.",
      description: "A STEAM crossover activity where students design an illustration or greeting card and embed a working LED circuit into the artwork using copper tape.",
      materials: "Copper tape, coin batteries, LEDs, cardstock, markers",
      objectives: [
        "Combine an electrical circuit with a creative design",
        "Trace a circuit path that doesn't cross itself",
        "Present finished artwork and explain how it lights up"
      ],
      videos: ["M7lc1UVf-VE"]
    }
  ];

  /* ------------------------------------------------------------
     INTERNAL HELPERS
     ------------------------------------------------------------ */

  // Simulates network latency so skeleton loaders have something to show.
  function mockDelay(data, ms) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), ms || 450);
    });
  }

  /* ------------------------------------------------------------
     PUBLIC API — TeacherAPI
     Every method below is a placeholder for a real backend call.
     Swap the mock resolution for a fetch() to the noted endpoint
     and the rest of the UI keeps working unchanged.
     ------------------------------------------------------------ */
  const TeacherAPI = {

    // TODO: replace with GET /api/teacher/dashboard
    // Should return { todayKits, recentActivity, upcoming, notifications, stats }
    getDashboard: function () {
      return mockDelay({
        todayKits: MOCK_KITS.slice(0, 2),
        recentActivity: [
          { text: "Marked \u201cCircuit Builders\u201d as completed", time: "2 hours ago" },
          { text: "Downloaded PDF for \u201cBridge Engineering\u201d", time: "Yesterday" },
          { text: "Watched video for \u201cVolcano Lab\u201d", time: "2 days ago" }
        ]
      });
    },

    // TODO: replace with GET /api/teacher/kits?page=&perPage=&query=&category=
    // Should return { items, total }
    getMyKits: function () {
      return mockDelay({ items: MOCK_KITS, total: MOCK_KITS.length });
    },

    // TODO: replace with GET /api/teacher/kits/:id
    getKitDetails: function (id) {
      const kit = MOCK_KITS.find((k) => k.id === id) || MOCK_KITS[0];
      const related = MOCK_KITS.filter((k) => k.id !== kit.id && k.category === kit.category).slice(0, 3);
      const fallbackRelated = related.length ? related : MOCK_KITS.filter((k) => k.id !== kit.id).slice(0, 3);
      return mockDelay({ kit: kit, related: fallbackRelated });
    },

    // TODO: replace with GET /api/teacher/kits/:id/videos
    getVideos: function (id) {
      const kit = MOCK_KITS.find((k) => k.id === id);
      return mockDelay({ videos: kit ? kit.videos : [] });
    },

    // TODO: replace with GET /api/teacher/kits?query=... (server-side search)
    searchKits: function (kits, query) {
      const q = (query || "").trim().toLowerCase();
      if (!q) return kits;
      return kits.filter(function (k) {
        return k.name.toLowerCase().indexOf(q) > -1 || k.shortDesc.toLowerCase().indexOf(q) > -1;
      });
    },

    // TODO: replace with GET /api/teacher/kits?category=... (server-side filter)
    filterByCategory: function (kits, category) {
      if (!category || category === "All") return kits;
      return kits.filter(function (k) { return k.category === category; });
    },

    // TODO: once the backend paginates results server-side, this becomes a no-op
    // and `page`/`perPage` are simply passed along as query params instead.
    paginate: function (kits, page, perPage) {
      const p = page || 1;
      const size = perPage || 6;
      const start = (p - 1) * size;
      return {
        items: kits.slice(start, start + size),
        page: p,
        perPage: size,
        totalPages: Math.max(1, Math.ceil(kits.length / size))
      };
    },

    // Convenience accessors used by the pages below (kept separate from the
    // TODO-marked network methods since these are just static reference data).
    getCategories: function () { return MOCK_CATEGORIES.slice(); },
    getAllKitsSync: function () { return MOCK_KITS.slice(); },
    getKitByIdSync: function (id) { return MOCK_KITS.find(function (k) { return k.id === id; }); }
  };

  /* ------------------------------------------------------------
     MICRO-INTERACTIONS
     ------------------------------------------------------------ */

  // Button ripple effect — attach to any element with .ripple-btn
  function attachRipple(el) {
    el.addEventListener("click", function (e) {
      const rect = el.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
      ripple.style.top = (e.clientY - rect.top - size / 2) + "px";
      el.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 600);
    });
  }

  function initRipples(root) {
    const scope = root || document;
    scope.querySelectorAll(".ripple-btn").forEach(function (el) {
      if (!el.dataset.rippleBound) {
        el.dataset.rippleBound = "true";
        attachRipple(el);
      }
    });
  }

  // Gentle page fade-in on load
  function initPageFade() {
    document.documentElement.classList.add("page-fade");
  }

  // Mobile sidebar toggle (shared across all dashboard pages)
  function initSidebarToggle() {
    const toggleBtn = document.getElementById("sidebarToggle");
    const sidebar = document.getElementById("sidebar");
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener("click", function () {
        sidebar.classList.toggle("open");
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initPageFade();
    initRipples();
    initSidebarToggle();
  });

  window.TeacherAPI = TeacherAPI;
  window.TeacherUI = { initRipples: initRipples };
})(window);
