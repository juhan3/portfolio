// chrome.js — 헤더 / 오버레이 네비 / 푸터를 런타임에 주입합니다.
//
// 각 페이지는 아래 한 줄만 두면 됩니다.
//   <header data-title="Blog" data-sub="블로그" data-back></header>
//   <footer></footer>
// data-back 이 있으면 뒤로가기 버튼이 함께 렌더링됩니다.
// data-title 을 생략하면 기존 내용(예: 스크립트가 채우는 제목)을 건드리지 않습니다.
//
// 경로 깊이(root / 하위 디렉터리)는 스타일시트 링크를 보고 스스로 판단하므로
// 페이지마다 ../ 를 손으로 맞출 필요가 없습니다.

(function () {
  'use strict';

  // asset/style.css 가 ../ 로 걸려 있으면 한 단계 아래 디렉터리입니다.
  function detectPrefix() {
    const link = document.querySelector('link[href*="asset/style.css"]');
    const href = link ? link.getAttribute('href') : '';
    return href.indexOf('../') === 0 ? '../' : '';
  }

  const PREFIX = detectPrefix();

  const NAV_LINKS = [
    { href: 'index.html', label: 'Intro' },
    { href: 'list-about.html', label: 'About' },
    { href: 'mailto:sixths_misuse8p@icloud.com', label: 'Contact', external: true },
    { href: 'list.html', label: 'Project' },
    { href: 'list-blog.html', label: 'Blog' }
  ];

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderHeader(host) {
    const title = host.dataset.title;
    // 제목을 넘기지 않은 페이지는 스스로 채우므로 그대로 둡니다.
    if (title === undefined) return;

    const sub = host.dataset.sub || '';
    const back = host.hasAttribute('data-back');

    const backBtn = back
      ? '<button class="back-icon-btn" onclick="history.back()">' +
        '<i class="fa-solid fa-chevron-left"></i></button>'
      : '';

    // Order matters: back button, then the title (which grows to fill), then
    // the menu button — so the title's flex-grow pushes the menu to the far
    // right edge. Emitting the menu before the title would strand it on the left.
    host.innerHTML =
      backBtn +
      '<ul>' + escapeHtml(title) +
      (sub ? '<li>' + escapeHtml(sub) + '</li>' : '') +
      '</ul>' +
      '<button class="menu-icon-btn" onclick="openNav()">' +
      '<i class="fa-solid fa-bars"></i></button>';

    if (!host.hasAttribute('data-aos')) host.setAttribute('data-aos', 'fade-down');
  }

  function renderNav() {
    // 이미 마크업에 네비가 있으면 중복 생성하지 않습니다.
    if (document.getElementById('myNav')) return;

    const links = NAV_LINKS.map(function (item) {
      const href = item.external ? item.href : PREFIX + item.href;
      return '<a href="' + href + '">' + item.label + '</a>';
    }).join('');

    const nav = document.createElement('div');
    nav.id = 'myNav';
    nav.className = 'overlay';
    nav.innerHTML =
      '<a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>' +
      '<div class="overlay-content">' + links + '</div>';

    const header = document.querySelector('header');
    if (header && header.parentNode) {
      header.parentNode.insertBefore(nav, header.nextSibling);
    } else {
      document.body.appendChild(nav);
    }
  }

  function renderFooter(host) {
    if (host.textContent.trim() !== '') return; // 내용이 있으면 존중합니다.
    host.innerHTML = '<p>&copy; 2025 Juhankim. All rights reserved.</p>';
  }

  function init() {
    const header = document.querySelector('header');
    if (header) renderHeader(header);
    renderNav();
    const footer = document.querySelector('footer');
    if (footer) renderFooter(footer);
  }

  // chrome.js 는 <head> 에서 defer 없이 불릴 수도 있으므로 두 경우를 모두 처리합니다.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
