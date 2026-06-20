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

// 점성 계산 — 수동 UTC 변환 (CDN에서 tz-lookup 미작동 대응)
function calcAstro(year, month, day, hour, minute, lat, lng) {
  if (!_astroLib) return null;
  const { Origin, Horoscope } = _astroLib;
  try {
    // 1차: 라이브러리 기본 (tz-lookup이 작동하면 정상)
    const origin1 = new Origin({ year, month: month - 1, date: day, hour, minute, latitude: lat, longitude: lng });
    const h1 = new Horoscope({ origin: origin1, houseSystem: 'whole-sign', zodiac: 'tropical', aspectTypes: ['major'], language: 'en' });

    // tz-lookup 작동 여부 검증: UTC 시간이 로컬과 동일하면 타임존 미인식
    const localTotal = hour * 60 + minute;
    const utcStr = origin1.utcTime || '';
    // origin.utcTime이 없거나 로컬시간과 동일하면 수동 보정
    let needFix = false;
    if (origin1.utcTime && typeof origin1.utcTime === 'object' && origin1.utcTime.hour !== undefined) {
      const utcH = origin1.utcTime.hour || 0;
      if (utcH === hour && Math.abs(lng) > 15) needFix = true; // 경도 15° 이상인데 UTC=로컬 → 보정 필요
    } else {
      // utcTime 프로퍼티 접근 불가 → 안전하게 수동 보정
      needFix = (Math.abs(lng) > 15);
    }

    if (needFix) {
      // 수동 UTC 변환: 국가 기반 타임존 (경도 공식은 한국이 +8로 오계산됨)
      const UTC_OFFSETS = {'대한민국':9,'일본':9,'중국':8,'대만':8,'홍콩':8,'싱가포르':8,
        '태국':7,'베트남':7,'인도':5.5,'독일':1,'영국':0,'프랑스':1,
        '미국':-5,'캐나다':-5,'호주':10,'뉴질랜드':12};
      // 국가 정보가 없으면 경도 기반 추정 (한국 보정: 120~132°E는 +9)
      let utcOffset;
      try {
        const country = document.getElementById('inCountry')?.value || '';
        utcOffset = UTC_OFFSETS[country];
      } catch(e) {}
      if (utcOffset === undefined) {
        utcOffset = (lng >= 120 && lng <= 135) ? 9 : Math.round(lng / 15);
      }
      const utcDate = new Date(Date.UTC(year, month - 1, day, hour - utcOffset, minute));
      const uY = utcDate.getUTCFullYear(), uM = utcDate.getUTCMonth(), uD = utcDate.getUTCDate();
      const uH = utcDate.getUTCHours(), uMin = utcDate.getUTCMinutes();
      // UTC 시간 + 경도 0°로 전달하되, 실제 lat/lng은 유지
      // → Origin이 tz-lookup 실패해도 이미 UTC이므로 이중변환 없음
      const origin2 = new Origin({ year: uY, month: uM, date: uD, hour: uH, minute: uMin, latitude: lat, longitude: 0.0 });
      // longitude를 0으로 넣으면 하우스 계산에 영향 → 수동으로 lng 복원
      // 대안: UTC+실제좌표. tz-lookup이 실패하면 UTC=로컬 처리 → 이미 UTC이니 정확
      const origin3 = new Origin({ year: uY, month: uM, date: uD, hour: uH, minute: uMin, latitude: lat, longitude: lng });
      const h2 = new Horoscope({ origin: origin3, houseSystem: 'whole-sign', zodiac: 'tropical', aspectTypes: ['major'], language: 'en' });
      console.log(`🔧 점성 수동 UTC 보정: ${hour}:${minute} KST → ${uH}:${uMin} UTC (offset ${utcOffset}h)`);
      return h2;
    }

    return h1;
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
  html += `<div class="uf-sec"><div class="uf-label">☉ 태양 — ${SIGN_KR[sunKey]}</div><div class="uf-body"><b>메인 기질:</b> ${(typeof SUN_DESC!=='undefined'&&SUN_DESC[sunKey])||SIGN_DESC[sunKey]||''}</div></div>`;
  html += `<div class="uf-sec"><div class="uf-label">☽ 달 — ${SIGN_KR[moonKey]}</div><div class="uf-body"><b>서브 기질:</b> ${(typeof MOON_DESC!=='undefined'&&MOON_DESC[moonKey])||SIGN_DESC[moonKey]||''}</div></div>`;
  if (mcKey) html += `<div class="uf-sec"><div class="uf-label">⬆️ MC 천정 — ${SIGN_KR[mcKey]}</div><div class="uf-body"><b>사회적 페르소나:</b> ${(typeof MC_DESC!=='undefined'&&MC_DESC[mcKey])||SIGN_DESC[mcKey]||''}</div></div>`;
  html += '</div></div>';
  if(el) el.innerHTML = html;
}
