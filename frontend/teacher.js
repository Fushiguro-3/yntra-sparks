/* ============================================================
   YNTRA SPARKS — teacher.js
   Page logic for teacher-kits.html and kit-details.html.
   Teacher role: view-only. No create/edit/delete calls here.
   ============================================================ */
(function () {
  'use strict';

  var state = { search: '', category: 'all', page: 1, perPage: 6, all: [] };

  function kitCardHtml(kit) {
    return (
      '<div class="ys-kit-card">' +
        '<div class="ys-kit-thumb-wrap"><img src="' + kit.thumbnail + '" alt="' + YSUtils.escapeHtml(kit.title) + '" loading="lazy"></div>' +
        '<div class="body">' +
          '<span class="badge blue" style="align-self:flex-start;">' + kit.category + '</span>' +
          '<h4>' + YSUtils.escapeHtml(kit.title) + '</h4>' +
          '<p>' + YSUtils.escapeHtml(kit.description) + '</p>' +
          '<a href="kit-details.html?id=' + kit.id + '" class="btn btn-secondary btn-sm btn-block">View Kit</a>' +
        '</div>' +
      '</div>'
    );
  }

  function renderKits() {
    var grid = document.getElementById('kits-grid');
    var filtered = state.all.filter(function (k) {
      var matchesSearch = !state.search || k.title.toLowerCase().indexOf(state.search.toLowerCase()) > -1;
      var matchesCat = state.category === 'all' || k.category === state.category;
      return matchesSearch && matchesCat;
    });

    var pageInfo = YSUtils.paginate(filtered, state.page, state.perPage);
    if (!pageInfo.pageItems.length) {
      YSComponents.emptyState(grid, 'No kits found', 'Try a different search term or category.');
    } else {
      grid.innerHTML = pageInfo.pageItems.map(kitCardHtml).join('');
    }

    var paginationEl = document.getElementById('kits-pagination');
    YSComponents.pagination(paginationEl, pageInfo.page, pageInfo.totalPages, function (p) {
      state.page = p;
      renderKits();
      window.scrollTo({ top: grid.offsetTop - 100, behavior: 'smooth' });
    });

    var countEl = document.getElementById('kits-count');
    if (countEl) countEl.textContent = 'Showing ' + pageInfo.pageItems.length + ' of ' + pageInfo.total + ' kits';
  }

  function initKitsPage() {
    var grid = document.getElementById('kits-grid');
    grid.innerHTML = YSComponents.skeletonCards(6);

    YSApi.Kits.list().then(function (res) {
      state.all = res.data || [];
      renderKits();
    });

    var searchInput = document.getElementById('kit-search');
    if (searchInput) {
      searchInput.addEventListener('input', YSUtils.debounce(function (e) {
        state.search = e.target.value;
        state.page = 1;
        renderKits();
      }, 250));
    }

    var catSelect = document.getElementById('category-filter');
    if (catSelect) {
      YSApi.Categories.list().then(function (res) {
        (res.data || []).forEach(function (c) {
          var opt = document.createElement('option');
          opt.value = c.name; opt.textContent = c.name;
          catSelect.appendChild(opt);
        });
      });
      catSelect.addEventListener('change', function (e) {
        state.category = e.target.value;
        state.page = 1;
        renderKits();
      });
    }
  }

  function initKitDetailsPage() {
    var id = YSUtils.qsParam('id');
    var root = document.getElementById('kit-details-root');
    root.innerHTML = '<div class="skeleton-card"><div class="skeleton skeleton-thumb" style="height:280px"></div><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-line short"></div></div>';

    YSApi.Kits.get(id).then(function (res) {
      var kit = res.data;
      if (!kit) {
        YSComponents.emptyState(root, 'Kit not found', 'It may have been removed or the link is incorrect.');
        return;
      }
      renderKitDetails(kit);
      renderRelatedKits(kit);
    });
  }

  function renderKitDetails(kit) {
    var root = document.getElementById('kit-details-root');
    YSComponents.breadcrumb(document.getElementById('kit-breadcrumb'), [
      { label: 'Dashboard', href: 'teacher-portal.html' },
      { label: 'My Kits', href: 'teacher-kits.html' },
      { label: kit.title }
    ]);

    var videosHtml = kit.videos.slice().sort(function (a, b) { return a.order - b.order; })
      .map(function (v, i) {
        return '<div class="list-row">' +
          '<div class="list-thumb" style="background:var(--orange-light)"><svg width="18" height="18" fill="none"><path d="M6 4l8 5-8 5V4z" fill="#F59E0B"/></svg></div>' +
          '<div><div class="title">' + (i + 1) + '. ' + YSUtils.escapeHtml(v.title) + '</div><div class="meta">YouTube · ' + v.youtubeId + '</div></div>' +
          '<a class="right btn btn-secondary btn-sm" href="https://www.youtube.com/watch?v=' + v.youtubeId + '" target="_blank" rel="noopener">▶ Watch</a>' +
        '</div>';
      }).join('');

    var objectivesHtml = kit.objectives.map(function (o) { return '<li>' + YSUtils.escapeHtml(o) + '</li>'; }).join('');

    root.innerHTML =
      '<div class="panel" style="padding:0; overflow:hidden;">' +
        '<img src="' + kit.thumbnail + '" alt="' + YSUtils.escapeHtml(kit.title) + '" style="width:100%; height:260px; object-fit:cover;">' +
      '</div>' +
      '<div class="panel">' +
        '<span class="badge blue">' + kit.category + '</span> <span class="badge gray">' + kit.grade + '</span>' +
        '<h2 style="margin:12px 0 8px; font-size:24px;">' + YSUtils.escapeHtml(kit.title) + '</h2>' +
        '<p style="color:var(--ink-500); font-size:14.5px;">' + YSUtils.escapeHtml(kit.description) + '</p>' +
      '</div>' +
      '<div class="panel">' +
        '<div class="panel-head"><h3>Learning Objectives</h3></div>' +
        '<ul style="padding-left:18px; color:var(--ink-700); font-size:14px; line-height:1.9;">' + objectivesHtml + '</ul>' +
      '</div>' +
      '<div class="panel">' +
        '<div class="panel-head"><h3>Videos</h3></div>' +
        videosHtml +
      '</div>' +
      '<a href="teacher-kits.html" class="btn btn-secondary">← Back to My Kits</a>';
  }

  function renderRelatedKits(kit) {
    var container = document.getElementById('related-kits');
    if (!container) return;
    YSApi.Kits.list().then(function (res) {
      var related = (res.data || []).filter(function (k) { return k.category === kit.category && k.id !== kit.id; }).slice(0, 3);
      if (!related.length) { container.closest('.panel').style.display = 'none'; return; }
      container.innerHTML = related.map(function (k) {
        return '<div class="list-row" style="cursor:pointer" onclick="window.location.href=\'kit-details.html?id=' + k.id + '\'">' +
          '<div class="list-thumb" style="background-image:url(' + k.thumbnail + ');background-size:cover;"></div>' +
          '<div><div class="title">' + YSUtils.escapeHtml(k.title) + '</div><div class="meta">' + k.grade + '</div></div>' +
        '</div>';
      }).join('');
    });
  }

  window.YSTeacher = { initKitsPage: initKitsPage, initKitDetailsPage: initKitDetailsPage };
})();
