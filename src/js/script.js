const GITHUB_RAW = 'https://raw.githubusercontent.com/NuwareTech-ops/super-calendar.io/master/history/summary.json';

function fmtUrl(url) {
  try {
    const u = new URL(url);
    return u.hostname + u.pathname;
  } catch { return url; }
}

function fmtTime(ms) {
  if (!ms) return '—';
  if (ms >= 1000) return (ms / 1000).toFixed(1) + ' s';
  return ms + ' ms';
}

function fmtUptime(pct) {
  const n = parseFloat(pct);
  return isNaN(n) ? pct : n.toFixed(2) + '%';
}

function buildRows(services) {
  const list = document.getElementById('service-list');
  list.innerHTML = '';

  services.forEach(svc => {
    const isUp = svc.status === 'up';
    const row = document.createElement('div');
    row.className = 'service-row';
    row.innerHTML = `
      <div>
        <div class="service-name">${svc.name}</div>
        <div class="service-url">${fmtUrl(svc.url)}</div>
      </div>
      <span class="response-time">${fmtTime(svc.time)}</span>
      <span class="uptime-pill ${isUp ? 'up' : 'down'}">${fmtUptime(svc.uptime)}</span>
      <span class="status-dot ${isUp ? 'up' : 'down'}" title="${isUp ? 'Operational' : 'Fora do ar'}"></span>
    `;
    list.appendChild(row);
  });
}

function buildBanner(services) {
  const total = services.length;
  const downCount = services.filter(s => s.status !== 'up').length;
  const banner = document.getElementById('banner');
  const text = document.getElementById('banner-text');

  banner.style.display = 'flex';

  if (downCount === 0) {
    banner.className = 'banner all-up';
    text.textContent = 'All systems operational';
  } else {
    banner.className = 'banner some-down';
    text.textContent = `${downCount} of ${total} service${downCount > 1 ? 's' : ''} experiencing issues`;
  }
}

async function load() {
  const el = document.getElementById('last-updated');
  try {
    const res = await fetch(GITHUB_RAW + '?t=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();

    buildRows(data);
    buildBanner(data);

    const now = new Date();
    el.textContent = 'Last checked: ' + now.toLocaleString('en-US', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch (err) {
    document.getElementById('service-list').innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠</div>
        <p>Unable to load data.</p>
        <p style="margin-top:6px; font-size:12px; color:var(--text-muted)">${err.message}</p>
      </div>`;
    el.textContent = 'Update failed';
  }
}

load();
