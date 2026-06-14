// ═══════════════════════════════════════
//  astro.js — 점성술 계산 + 렌더
//  CircularNatalHoroscopeJS (CDN, 클라이언트 계산)
// ═══════════════════════════════════════

let _astroLib = null;

// CDN 로드 (ssaju와 동일 패턴)
async function loadAstroLib() {
  if (_astroLib) return _astroLib;
  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/circular-natal-horoscope-js@1.1.0/+esm');
    _astroLib = mod.default || mod;
    console.log('✅ 점성 라이브러리 로드');
  } catch (e) {
    console.warn('점성 라이브러리 로드 실패:', e);
  }
  return _astroLib;
}

// 점성 계산
function calcAstro(year, month, day, hour, minute, lat, lng) {
  if (!_astroLib) return null;
  const { Origin, Horoscope } = _astroLib;
  try {
    const origin = new Origin({ year, month: month - 1, date: day, hour, minute, latitude: lat, longitude: lng });
    const h = new Horoscope({ origin, houseSystem: 'whole-sign', zodiac: 'tropical', aspectTypes: ['major'], language: 'en' });
    return h;
  } catch (e) {
    console.warn('점성 계산 오류:', e);
    return null;
  }
}

// 렌더
function renderAstro(h) {
  const el = document.getElementById('astroArea');
  const natalEl = document.getElementById('astroNatalArea');
  if (!h) { if(el) el.innerHTML = ''; if(natalEl) natalEl.innerHTML='<div class="placeholder">12하우스·행성배치 — 조회를 입력하세요</div>'; return; }

  const ascKey = h.Ascendant.Sign.key;
  const ascDeg = h.Ascendant.ChartPosition.Ecliptic.ArcDegreesFormatted30;
  const sunKey = h.CelestialBodies.sun.Sign.key;
  const moonKey = h.CelestialBodies.moon.Sign.key;
  const mcKey = h.Midheaven ? h.Midheaven.Sign.key : '';

  // ── 단락2: 고정프레임 (차트 + 메인3 + 설명 스크롤) ──
  let html = '<div class="unified-frame uf-fixed" style="border-color:#5040a0">';
  html += `<div class="uf-head-split"><div class="uf-head-left">`;
  html += `<div class="kw-main" style="color:#5040a0">${SIGN_EMOJI[ascKey]} ${SIGN_KEYWORD[ascKey]||SIGN_KR[ascKey]}</div>`;
  html += `<div class="kw-sub">${SIGN_KR[ascKey].replace('자리','')} 상승 · ${ascDeg}</div>`;
  html += `<div class="kw-points">
    <span class="kw-point"><b>상승(ASC):</b> ${SIGN_KR[ascKey]}</span>
    <span class="kw-point"><b>태양 ☉:</b> ${SIGN_KR[sunKey]}</span>
    <span class="kw-point"><b>달 ☽:</b> ${SIGN_KR[moonKey]}</span>
    <span class="kw-point"><b>MC 천정:</b> ${mcKey?SIGN_KR[mcKey]:'—'}</span>
  </div>`;
  // 좌측 하단 스크롤: 행성배치 + 12하우스 칩
  html += '<div class="kw-extra"><div class="chip-wrap">';
  const bodies = ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'];
  bodies.forEach(b => {
    const cb = h.CelestialBodies[b]; if (!cb) return;
    const sk = cb.Sign.key, houseId = cb.House ? cb.House.id : '', retro = cb.isRetrograde ? '℞' : '';
    const hl=(b==='sun'||b==='moon');
    html += `<span class="chip${hl?' hl':''}">${BODY_KR[b].split(' ')[1]||''} ${SIGN_EMOJI[sk]}${houseId?' '+houseId+'H':''}${retro}</span>`;
  });
  if (h.Houses) h.Houses.forEach((house, i) => { html += `<span class="chip">${i+1}H ${SIGN_EMOJI[house.Sign.key]}</span>`; });
  html += '</div></div>';
  html += `</div><div class="uf-head-viz">${astroChartSVG(h)}</div></div>`;
  html += '<div class="uf-body-scroll">';
  html += `<div class="uf-sec"><div class="uf-label">${SIGN_EMOJI[ascKey]} 상승궁 (ASC) — ${SIGN_KR[ascKey]} ${ascDeg}</div><div class="uf-body">${ASC_DESC[ascKey] || ''}</div></div>`;
  html += `<div class="uf-sec"><div class="uf-label">☉ 태양 — ${SIGN_KR[sunKey]}</div><div class="uf-body"><b>본질·자아:</b> ${SIGN_DESC[sunKey] || ''}</div></div>`;
  html += `<div class="uf-sec"><div class="uf-label">☽ 달 — ${SIGN_KR[moonKey]}</div><div class="uf-body"><b>감정·내면:</b> ${SIGN_DESC[moonKey] || ''}</div></div>`;
  if (mcKey) html += `<div class="uf-sec"><div class="uf-label">⬆️ MC 천정 — ${SIGN_KR[mcKey]}</div><div class="uf-body"><b>직업·사회적 정점:</b> ${SIGN_DESC[mcKey] || ''}</div></div>`;
  html += '</div></div>';
  if(el) el.innerHTML = html;
}

// 12별자리 휠 SVG
function astroWheelSVG(h, size = 150) {
  const cx = size/2, cy = size/2, rOut = size/2 - 4, rIn = size/2 - 22;
  const signs = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
  const colors = ['#e05050','#d4a82a','#40c0a0','#5080d0','#e05050','#d4a82a','#40c0a0','#5080d0','#e05050','#d4a82a','#40c0a0','#5080d0'];
  const ascKey = h.Ascendant.Sign.key;
  const sunKey = h.CelestialBodies.sun.Sign.key;
  const moonKey = h.CelestialBodies.moon.Sign.key;
  let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
  signs.forEach((s, i) => {
    const a1 = -Math.PI/2 + 2*Math.PI*i/12, a2 = -Math.PI/2 + 2*Math.PI*(i+1)/12;
    const x1 = cx+rOut*Math.cos(a1), y1 = cy+rOut*Math.sin(a1);
    const x2 = cx+rOut*Math.cos(a2), y2 = cy+rOut*Math.sin(a2);
    const xi2 = cx+rIn*Math.cos(a2), yi2 = cy+rIn*Math.sin(a2);
    const xi1 = cx+rIn*Math.cos(a1), yi1 = cy+rIn*Math.sin(a1);
    const hl = (s===ascKey||s===sunKey||s===moonKey);
    svg += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${rOut} ${rOut} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L${xi2.toFixed(1)} ${yi2.toFixed(1)} A${rIn} ${rIn} 0 0 0 ${xi1.toFixed(1)} ${yi1.toFixed(1)} Z" fill="${colors[i]}" opacity="${hl?0.9:0.25}"/>`;
    const mid = (a1+a2)/2, lr = (rOut+rIn)/2;
    svg += `<text x="${(cx+lr*Math.cos(mid)).toFixed(1)}" y="${(cy+lr*Math.sin(mid)+4).toFixed(1)}" text-anchor="middle" fill="${hl?'#fff':'#9a9488'}" font-size="11">${SIGN_EMOJI[s]}</text>`;
  });
  svg += `<text x="${cx}" y="${cy-2}" text-anchor="middle" fill="#6a6358" font-size="8" font-family="Noto Sans KR">상승</text>`;
  svg += `<text x="${cx}" y="${cy+10}" text-anchor="middle" fill="#7060c0" font-size="11" font-weight="700" font-family="Noto Sans KR">${SIGN_EMOJI[ascKey]}</text>`;
  svg += '</svg>';
  return svg;
}
