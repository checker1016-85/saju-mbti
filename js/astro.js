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
  if (!h) { el.innerHTML = '<div class="placeholder">출생지를 선택하고 만세력을 조회하세요</div>'; return; }

  const ascKey = h.Ascendant.Sign.key;
  const ascDeg = h.Ascendant.ChartPosition.Ecliptic.ArcDegreesFormatted30;
  const sunKey = h.CelestialBodies.sun.Sign.key;
  const moonKey = h.CelestialBodies.moon.Sign.key;

  let html = '<div class="unified-frame" style="border-color:#7060c0">';

  // 헤더: 좌 메인3 / 우 12별자리 휠 시각화
  html += `<div class="uf-head-split"><div class="uf-head-left">`;
  html += `<div class="uf-title" style="color:#7060c0">${SIGN_EMOJI[ascKey]} ${SIGN_KR[ascKey]} 상승</div>`;
  html += `<div class="uf-sub">☉ 태양 ${SIGN_KR[sunKey]} · ☽ 달 ${SIGN_KR[moonKey]}</div>`;
  html += `</div><div class="uf-head-viz">${astroWheelSVG(h)}</div></div>`;

  // 메인 3 (상승궁/태양/달) 좌측정렬 상세
  html += `<div class="uf-sec"><div class="uf-label">${SIGN_EMOJI[ascKey]} 상승궁 (ASC) — ${SIGN_KR[ascKey]} ${ascDeg}</div><div class="uf-body">${ASC_DESC[ascKey] || ''}</div></div>`;
  html += `<div class="uf-sec"><div class="uf-label">☉ 태양 — ${SIGN_KR[sunKey]}</div><div class="uf-body"><b>본질·자아:</b> ${SIGN_DESC[sunKey] || ''}</div></div>`;
  html += `<div class="uf-sec"><div class="uf-label">☽ 달 — ${SIGN_KR[moonKey]}</div><div class="uf-body"><b>감정·내면:</b> ${SIGN_DESC[moonKey] || ''}</div></div>`;

  // 상세: 10행성 전체
  html += `<div class="uf-sec"><div class="uf-label">🪐 행성 배치 (전체)</div>`;
  const bodies = ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'];
  bodies.forEach(b => {
    const cb = h.CelestialBodies[b];
    if (!cb) return;
    const sk = cb.Sign.key;
    const deg = cb.ChartPosition.Ecliptic.ArcDegreesFormatted30;
    const houseId = cb.House ? cb.House.id : '';
    const retro = cb.isRetrograde ? ' ℞' : '';
    html += `<div class="astro-row"><span class="astro-body">${BODY_KR[b]}${retro}</span><span class="astro-pos">${SIGN_EMOJI[sk]} ${SIGN_KR[sk]} ${deg}${houseId ? ' · '+houseId+'H' : ''}</span></div>`;
  });
  html += `</div>`;

  // 상세: 12하우스
  html += `<div class="uf-sec"><div class="uf-label">🏠 12하우스 (전체)</div>`;
  if (h.Houses) {
    h.Houses.forEach((house, i) => {
      const sk = house.Sign.key;
      html += `<div class="astro-row"><span class="astro-body">${HOUSE_KR[i+1] || (i+1)+'하우스'}</span><span class="astro-pos">${SIGN_EMOJI[sk]} ${SIGN_KR[sk]}</span></div>`;
    });
  }
  html += `</div>`;

  // MC (천정)
  if (h.Midheaven) {
    const mk = h.Midheaven.Sign.key;
    html += `<div class="uf-sec"><div class="uf-label">⬆️ MC 천정 (사회적 정점) — ${SIGN_KR[mk]}</div><div class="uf-body">직업·사회적 목표의 방향: ${SIGN_DESC[mk] || ''}</div></div>`;
  }

  html += '</div>';
  el.innerHTML = html;
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
