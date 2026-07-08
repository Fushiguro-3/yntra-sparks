/* ============================================================
   YNTRA SPARKS — api.js
   Central place for every backend call. Nothing in this file is
   UI logic — pages call these methods and render the result.

   INTEGRATION NOTE FOR BACKEND ENGINEERS:
   - Set API_CONFIG.baseUrl to your real API origin.
   - Set API_CONFIG.mock = false once the endpoints below exist.
   - Every method's JSDoc comment lists the real REST endpoint
     it is written against, so switching off mock mode requires
     no changes to calling pages — only to this file.
   ============================================================ */
(function (global) {
  'use strict';

  var API_CONFIG = {
    baseUrl: 'https://api.yntrasparks.com/v1', // TODO: point at real backend
    mock: true // TODO: set false when the backend above is live
  };

  /**
   * Generic authenticated request wrapper.
   * Adds the bearer token from AuthStore (if present) and
   * normalizes errors into { ok, status, data } shape.
   */
  function request(path, options) {
    options = options || {};
    var token = (global.YSAuth && global.YSAuth.getToken) ? global.YSAuth.getToken() : null;
    var headers = Object.assign(
      { 'Content-Type': 'application/json' },
      token ? { 'Authorization': 'Bearer ' + token } : {},
      options.headers || {}
    );

    return fetch(API_CONFIG.baseUrl + path, {
      method: options.method || 'GET',
      headers: headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    }).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (data) {
        return { ok: res.ok, status: res.status, data: data };
      });
    }).catch(function (err) {
      return { ok: false, status: 0, data: null, error: err };
    });
  }

  /**
   * Returns a resolved mock payload asynchronously (dev-only).
   * NOTE: previously simulated network latency with a 300-900ms setTimeout on
   * every call, which made the whole app feel slow (every list/save/login
   * waited on an artificial delay). That delay has been removed — this now
   * resolves on the next microtask so calling code that relies on the
   * Promise-based/async shape (loading states, .then() ordering) keeps working
   * exactly the same, it's just no longer artificially slow.
   */
  function mockResponse(data) {
    return Promise.resolve({ ok: true, status: 200, data: data });
  }

  // ============================================================
  // AUTH — POST /auth/login, POST /auth/logout, POST /auth/reset-password
  // ============================================================
  var AuthAPI = {
    /** POST /auth/login  body: { email, password, role } */
    login: function (email, password, role) {
      if (API_CONFIG.mock) {
        if (!email || !password) {
          return mockResponse(null, 300).then(function () {
            return { ok: false, status: 400, data: { message: 'Email and password are required.' } };
          });
        }
        return mockResponse({
          token: 'mock-token-' + role,
          user: { name: role === 'teacher' ? 'Sarita Rao' : role === 'admin' ? 'Anil Kumar' : 'Founder', email: email, role: role }
        }, 900);
      }
      return request('/auth/login', { method: 'POST', body: { email: email, password: password, role: role } });
    },
    /** POST /auth/logout */
    logout: function () {
      if (API_CONFIG.mock) return mockResponse({ success: true }, 200);
      return request('/auth/logout', { method: 'POST' });
    },
    /** POST /auth/reset-password  body: { userId, newPassword } */
    resetPassword: function (userId, newPassword) {
      if (API_CONFIG.mock) return mockResponse({ success: true }, 600);
      return request('/auth/reset-password', { method: 'POST', body: { userId: userId, newPassword: newPassword } });
    }
  };

  // ============================================================
  // TEACHERS — GET/POST/PATCH /schools/:schoolId/teachers
  // ============================================================
  var TeacherAPI = {
    /** GET /schools/:schoolId/teachers?search=&page=&perPage= */
    list: function (schoolId, params) {
      if (API_CONFIG.mock) return mockResponse(global.YSMockData.teachers, 400);
      var q = new URLSearchParams(params || {}).toString();
      return request('/schools/' + schoolId + '/teachers?' + q);
    },
    /** POST /schools/:schoolId/teachers  body: { name, email, tempPassword } */
    create: function (schoolId, payload) {
      if (API_CONFIG.mock) return mockResponse({ id: YSUtils.uid('t'), ...payload }, 600);
      return request('/schools/' + schoolId + '/teachers', { method: 'POST', body: payload });
    },
    /** PATCH /teachers/:id  body: { status: 'active' | 'inactive' } */
    setStatus: function (teacherId, status) {
      if (API_CONFIG.mock) return mockResponse({ id: teacherId, status: status }, 400);
      return request('/teachers/' + teacherId, { method: 'PATCH', body: { status: status } });
    },
    /** POST /teachers/:id/reset-password  body: { newPassword } */
    resetPassword: function (teacherId, newPassword) {
      if (API_CONFIG.mock) return mockResponse({ success: true }, 500);
      return request('/teachers/' + teacherId + '/reset-password', { method: 'POST', body: { newPassword: newPassword } });
    }
  };

  // ============================================================
  // KITS — GET/POST/PUT/DELETE /kits
  // ============================================================
  var KitAPI = {
    /** GET /kits?category=&search=&page=&perPage= — kits purchased/visible to caller's school */
    list: function (params) {
      if (API_CONFIG.mock) return mockResponse(global.YSMockData.kits, 400);
      var q = new URLSearchParams(params || {}).toString();
      return request('/kits?' + q);
    },
    /** GET /kits/:id */
    get: function (id) {
      if (API_CONFIG.mock) {
        var kit = global.YSMockData.kits.find(function (k) { return String(k.id) === String(id); });
        return mockResponse(kit || null, 300);
      }
      return request('/kits/' + id);
    },
    /** POST /kits  body: { title, description, category, thumbnailUrl, videos: [{title, youtubeId, order}] } */
    create: function (payload) {
      if (API_CONFIG.mock) return mockResponse({ id: YSUtils.uid('k'), ...payload }, 700);
      return request('/kits', { method: 'POST', body: payload });
    },
    /** PUT /kits/:id */
    update: function (id, payload) {
      if (API_CONFIG.mock) return mockResponse({ id: id, ...payload }, 700);
      return request('/kits/' + id, { method: 'PUT', body: payload });
    },
    /** DELETE /kits/:id */
    remove: function (id) {
      if (API_CONFIG.mock) return mockResponse({ success: true }, 400);
      return request('/kits/' + id, { method: 'DELETE' });
    }
  };

  // ============================================================
  // CATEGORIES — GET/POST/PUT/DELETE /categories
  // ============================================================
  /** Case/whitespace-insensitive name match, used to block duplicate categories. */
  function isDuplicateCategoryName(name, excludeId) {
    var normalized = String(name || '').trim().toLowerCase();
    return global.YSMockData.categories.some(function (c) {
      return c.id !== excludeId && c.name.trim().toLowerCase() === normalized;
    });
  }

  var CategoryAPI = {
    list: function () {
      if (API_CONFIG.mock) return mockResponse(global.YSMockData.categories);
      return request('/categories');
    },
    /** POST /categories  body: { name } — rejected if a category with the same name (case-insensitive) already exists. */
    create: function (payload) {
      if (API_CONFIG.mock) {
        var name = payload && payload.name ? payload.name.trim() : '';
        if (!name) {
          return Promise.resolve({ ok: false, status: 400, data: { message: 'Category name is required.' } });
        }
        if (isDuplicateCategoryName(name)) {
          return Promise.resolve({ ok: false, status: 409, data: { message: 'A category with this name already exists.' } });
        }
        var created = { id: YSUtils.uid('c'), name: name };
        global.YSMockData.categories.push(created);
        global.YSMockData.persistCategories();
        return mockResponse(created);
      }
      return request('/categories', { method: 'POST', body: payload });
    },
    /** PUT /categories/:id  body: { name } — rejected if another category already has that name. */
    update: function (id, payload) {
      if (API_CONFIG.mock) {
        var name = payload && payload.name ? payload.name.trim() : '';
        if (!name) {
          return Promise.resolve({ ok: false, status: 400, data: { message: 'Category name is required.' } });
        }
        if (isDuplicateCategoryName(name, id)) {
          return Promise.resolve({ ok: false, status: 409, data: { message: 'A category with this name already exists.' } });
        }
        var existing = global.YSMockData.categories.find(function (c) { return c.id === id; });
        if (existing) existing.name = name;
        global.YSMockData.persistCategories();
        return mockResponse({ id: id, name: name });
      }
      return request('/categories/' + id, { method: 'PUT', body: payload });
    },
    remove: function (id) {
      if (API_CONFIG.mock) {
        global.YSMockData.categories = global.YSMockData.categories.filter(function (c) { return c.id !== id; });
        global.YSMockData.persistCategories();
        return mockResponse({ success: true });
      }
      return request('/categories/' + id, { method: 'DELETE' });
    }
  };

  // ============================================================
  // SCHOOLS — GET/POST/PUT /schools, PATCH /schools/:id/status
  // ============================================================
  var SchoolAPI = {
    list: function (params) {
      if (API_CONFIG.mock) return mockResponse(global.YSMockData.schools, 400);
      var q = new URLSearchParams(params || {}).toString();
      return request('/schools?' + q);
    },
    create: function (payload) {
      if (API_CONFIG.mock) return mockResponse({ id: YSUtils.uid('s'), ...payload }, 600);
      return request('/schools', { method: 'POST', body: payload });
    },
    update: function (id, payload) {
      if (API_CONFIG.mock) return mockResponse({ id: id, ...payload }, 600);
      return request('/schools/' + id, { method: 'PUT', body: payload });
    },
    setStatus: function (id, status) {
      if (API_CONFIG.mock) return mockResponse({ id: id, status: status }, 400);
      return request('/schools/' + id + '/status', { method: 'PATCH', body: { status: status } });
    }
  };

  // ============================================================
  // SCHOOL ADMINS (Principals) — GET/POST /school-admins, PATCH status
  // ============================================================
  var SchoolAdminAPI = {
    list: function (params) {
      if (API_CONFIG.mock) return mockResponse(global.YSMockData.principals, 400);
      var q = new URLSearchParams(params || {}).toString();
      return request('/school-admins?' + q);
    },
    create: function (payload) {
      if (API_CONFIG.mock) return mockResponse({ id: YSUtils.uid('p'), ...payload }, 600);
      return request('/school-admins', { method: 'POST', body: payload });
    },
    setStatus: function (id, status) {
      if (API_CONFIG.mock) return mockResponse({ id: id, status: status }, 400);
      return request('/school-admins/' + id + '/status', { method: 'PATCH', body: { status: status } });
    }
  };

  // ============================================================
  // USERS / PROFILE — GET/PATCH /users/me
  // ============================================================
  var UserAPI = {
    me: function () {
      if (API_CONFIG.mock) return mockResponse(global.YSAuth ? global.YSAuth.getUser() : null, 200);
      return request('/users/me');
    },
    updateProfile: function (payload) {
      if (API_CONFIG.mock) return mockResponse(payload, 400);
      return request('/users/me', { method: 'PATCH', body: payload });
    }
  };

  global.YSApi = {
    config: API_CONFIG,
    request: request,
    Auth: AuthAPI,
    Teachers: TeacherAPI,
    Kits: KitAPI,
    Categories: CategoryAPI,
    Schools: SchoolAPI,
    SchoolAdmins: SchoolAdminAPI,
    Users: UserAPI
  };
})(window);
