// ═══════════════════════════════════════
//  saju-lunar.js — lunar-javascript → ssaju 호환 래퍼
//  CDN: lunar-javascript 1.7.7
// ═══════════════════════════════════════

// 중국어→한국어 십성 매핑
const TG_CN2KR = {
  '比肩':'비견','劫财':'겁재','食神':'식신','伤官':'상관',
  '偏财':'편재','正财':'정재','偏官':'편관','七杀':'편관',
  '正官':'정관','偏印':'편인','枭神':'편인','正印':'정인','日主':'(일간)'
};

// 12운성 중국어→한국어
const DS_CN2KR = {
  '长生':'장생','沐浴':'목욕','冠带':'관대','临官':'건록','帝旺':'제왕',
  '衰':'쇠','病':'병','死':'사','墓':'묘','绝':'절','胎':'태','养':'양'
};

// 천간 한자→한글
const STEM_KR = {'甲':'갑','乙':'을','丙':'병','丁':'정','戊':'무','己':'기','庚':'경','辛':'신','壬':'임','癸':'계'};
// 지지 한자→한글
const BR_KR = {'子':'자','丑':'축','寅':'인','卯':'묘','辰':'진','巳':'사','午':'오','未':'미','申':'신','酉':'유','戌':'술','亥':'해'};

// 오행 매핑
const STEM_ELEM = {'甲':'목','乙':'목','丙':'화','丁':'화','戊':'토','己':'토','庚':'금','辛':'금','壬':'수','癸':'수'};
const BR_ELEM = {'子':'수','丑':'토','寅':'목','卯':'목','辰':'토','巳':'화','午':'화','未':'토','申':'금','酉':'금','戌':'토','亥':'수'};

// 천간 음양
const STEM_YY = {'甲':'양','乙':'음','丙':'양','丁':'음','戊':'양','己':'음','庚':'양','辛':'음','壬':'양','癸':'음'};

// 지지 인덱스
const BR_LIST = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const STEM_LIST = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];

// ═══ 합충형파해 관계 계산 ═══
function calcBranchRelations(branches) {
  // branches = [년지, 월지, 일지, 시지] as 한자
  const labels = ['년','월','일','시'];
  const idx = branches.map(b => BR_LIST.indexOf(b));
  const result = {};

  // 육합 (6 combinations)
  const yukHap = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]]; // 子丑, 寅亥, 卯戌, 辰酉, 巳申, 午未
  const yukHapPairs = [['子','丑'],['寅','亥'],['卯','戌'],['辰','酉'],['巳','申'],['午','未']];
  const yukHapRes = {};
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const [a, b] of yukHapPairs) {
        if ((branches[i] === a && branches[j] === b) || (branches[i] === b && branches[j] === a)) {
          yukHapRes[`${labels[i]}${labels[j]}`] = `${branches[i]}${branches[j]} 육합`;
        }
      }
    }
  }
  if (Object.keys(yukHapRes).length) result['육합'] = yukHapRes;

  // 삼합
  const samHapSets = [['申','子','辰','수'],['亥','卯','未','목'],['寅','午','戌','화'],['巳','酉','丑','금']];
  const samHapRes = {};
  for (const [a, b, c, elem] of samHapSets) {
    const found = [a, b, c].filter(x => branches.includes(x));
    if (found.length >= 3) {
      samHapRes[`${found.join('')}`] = `삼합 ${elem}국`;
    } else if (found.length === 2) {
      // 반합 체크: 가운데(왕지) 포함 시 반합
      if (found.includes(b)) {
        if (!result['반합']) result['반합'] = {};
        result['반합'][`${found.join('')}`] = `반합 ${elem}국`;
      }
    }
  }
  if (Object.keys(samHapRes).length) result['삼합'] = samHapRes;

  // 방합
  const bangHapSets = [['寅','卯','辰','목'],['巳','午','未','화'],['申','酉','戌','금'],['亥','子','丑','수']];
  for (const [a, b, c, elem] of bangHapSets) {
    const found = [a, b, c].filter(x => branches.includes(x));
    if (found.length >= 3) {
      if (!result['방합']) result['방합'] = {};
      result['방합'][`${found.join('')}`] = `방합 ${elem}국`;
    }
  }

  // 충 (대충: 6쌍, 차이 6)
  const chungRes = {};
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      if (Math.abs(idx[i] - idx[j]) === 6 || Math.abs(idx[i] - idx[j]) === 6) {
        const diff = (idx[i] - idx[j] + 12) % 12;
        if (diff === 6) {
          chungRes[`${labels[i]}${labels[j]}`] = `${branches[i]}${branches[j]} 충`;
        }
      }
    }
  }
  if (Object.keys(chungRes).length) result['충'] = chungRes;

  // 형 (삼형: 寅巳申, 丑戌未, 자형: 辰辰/午午/酉酉/亥亥)
  const hyungSets = [['寅','巳','申'],['丑','戌','未'],['子','卯']]; // 무례지형, 지세지형, 무은지형
  const hyungRes = {};
  for (const set of hyungSets) {
    const found = set.filter(x => branches.includes(x));
    if (found.length >= 2) {
      for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 4; j++) {
          if (set.includes(branches[i]) && set.includes(branches[j])) {
            hyungRes[`${labels[i]}${labels[j]}`] = `${branches[i]}${branches[j]} 형`;
          }
        }
      }
    }
  }
  // 자형
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      if (branches[i] === branches[j] && ['辰','午','酉','亥'].includes(branches[i])) {
        hyungRes[`${labels[i]}${labels[j]}`] = `${branches[i]}${branches[j]} 자형`;
      }
    }
  }
  if (Object.keys(hyungRes).length) result['형'] = hyungRes;

  // 파 (6쌍)
  const paPairs = [['子','酉'],['卯','午'],['寅','亥'],['巳','申'],['辰','丑'],['戌','未']];
  const paRes = {};
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const [a, b] of paPairs) {
        if ((branches[i] === a && branches[j] === b) || (branches[i] === b && branches[j] === a)) {
          paRes[`${labels[i]}${labels[j]}`] = `${branches[i]}${branches[j]} 파`;
        }
      }
    }
  }
  if (Object.keys(paRes).length) result['파'] = paRes;

  // 해 (6쌍)
  const haePairs = [['子','未'],['丑','午'],['寅','巳'],['卯','辰'],['申','亥'],['酉','戌']];
  const haeRes = {};
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const [a, b] of haePairs) {
        if ((branches[i] === a && branches[j] === b) || (branches[i] === b && branches[j] === a)) {
          haeRes[`${labels[i]}${labels[j]}`] = `${branches[i]}${branches[j]} 해`;
        }
      }
    }
  }
  if (Object.keys(haeRes).length) result['해'] = haeRes;

  return result;
}

// ═══ 천간 관계 (합/충) ═══
function calcStemRelations(stems) {
  const labels = ['년','월','일','시'];
  const result = [];
  // 천간합 (5쌍): 甲己, 乙庚, 丙辛, 丁壬, 戊癸 → 토,금,수,목,화
  const hapPairs = [['甲','己','토'],['乙','庚','금'],['丙','辛','수'],['丁','壬','목'],['戊','癸','화']];
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const [a, b, elem] of hapPairs) {
        if ((stems[i] === a && stems[j] === b) || (stems[i] === b && stems[j] === a)) {
          result.push({ type: '합', desc: `${stems[i]}${stems[j]} 합 → ${elem}`, stems: [stems[i], stems[j]] });
        }
      }
    }
  }
  // 천간충 (인접 기둥만): 같은 오행 다른 음양은 충이 아니라 극
  // 전통적 천간충: 甲庚, 乙辛, 丙壬, 丁癸 (4쌍, 차이 6)
  const chungPairs = [['甲','庚'],['乙','辛'],['丙','壬'],['丁','癸']];
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const [a, b] of chungPairs) {
        if ((stems[i] === a && stems[j] === b) || (stems[i] === b && stems[j] === a)) {
          result.push({ type: '충', desc: `${stems[i]}${stems[j]} 충`, stems: [stems[i], stems[j]] });
        }
      }
    }
  }
  return result;
}

// ═══ 개별 십성 판정 (일간 vs 대상 천간) ═══
function calcTenGod(dayStem, targetStem) {
  if (dayStem === targetStem) return '비견';
  const dE = STEM_ELEM[dayStem], tE = STEM_ELEM[targetStem];
  const dY = STEM_YY[dayStem], tY = STEM_YY[targetStem];
  const same = (dY === tY);
  const CY = {'목':'화','화':'토','토':'금','금':'수','수':'목'};
  const CT = {'목':'토','화':'금','토':'수','금':'목','수':'화'};
  if (dE === tE) return same ? '비견' : '겁재';
  if (CY[dE] === tE) return same ? '식신' : '상관';
  if (CT[dE] === tE) return same ? '편재' : '정재';
  if (CT[tE] === dE) return same ? '편관' : '정관';
  if (CY[tE] === dE) return same ? '편인' : '정인';
  return '';
}

// ═══ 신살 계산 (확장) ═══
function calcTwelveSal(dayStem, dayBranch, branches) {
  const labels = ['year','month','day','hour'];
  const result = {};

  // 도화살
  const doHwaMap = {'寅':'卯','午':'卯','戌':'卯','巳':'午','酉':'午','丑':'午','申':'酉','子':'酉','辰':'酉','亥':'子','卯':'子','未':'子'};
  // 역마살
  const yeokMaMap = {'寅':'申','午':'申','戌':'申','巳':'亥','酉':'亥','丑':'亥','申':'寅','子':'寅','辰':'寅','亥':'巳','卯':'巳','未':'巳'};
  // 화개살
  const hwaGaeMap = {'寅':'戌','午':'戌','戌':'戌','巳':'丑','酉':'丑','丑':'丑','申':'辰','子':'辰','辰':'辰','亥':'未','卯':'未','未':'未'};
  // 장성살
  const jangSungMap = {'寅':'巳','午':'巳','戌':'巳','巳':'申','酉':'申','丑':'申','申':'亥','子':'亥','辰':'亥','亥':'寅','卯':'寅','未':'寅'};
  // 겁살
  const geobSalMap = {'寅':'亥','午':'亥','戌':'亥','巳':'寅','酉':'寅','丑':'寅','申':'巳','子':'巳','辰':'巳','亥':'申','卯':'申','未':'申'};
  // 반안살
  const banAnMap = {'寅':'辰','午':'辰','戌':'辰','巳':'未','酉':'未','丑':'未','申':'戌','子':'戌','辰':'戌','亥':'丑','卯':'丑','未':'丑'};
  // 천을귀인 (일간 기준)
  const chunEulMap = {'甲':['丑','未'],'乙':['子','申'],'丙':['亥','酉'],'丁':['亥','酉'],'戊':['丑','未'],'己':['子','申'],'庚':['丑','未'],'辛':['寅','午'],'壬':['卯','巳'],'癸':['卯','巳']};
  // 문창귀인 (일간 기준)
  const munChangMap = {'甲':'巳','乙':'午','丙':'申','丁':'酉','戊':'申','己':'酉','庚':'亥','辛':'子','壬':'寅','癸':'卯'};
  // 원진살 (일지 기준)
  const wonJinMap = {'子':'未','丑':'午','寅':'巳','卯':'辰','辰':'卯','巳':'寅','午':'丑','未':'子','申':'亥','酉':'戌','戌':'酉','亥':'申'};
  // 귀문관살 (일지 기준)
  const gwiMunMap = {'子':'卯','丑':'寅','寅':'丑','卯':'子','辰':'亥','巳':'戌','午':'酉','未':'申','申':'未','酉':'午','戌':'巳','亥':'辰'};

  const ceTargets = chunEulMap[dayStem] || [];
  const mcTarget = munChangMap[dayStem] || '';
  const wjTarget = wonJinMap[dayBranch] || '';
  const gmTarget = gwiMunMap[dayBranch] || '';

  labels.forEach((l, i) => {
    const sals = [];
    const b = branches[i];
    if (b === doHwaMap[dayBranch]) sals.push('도화살');
    if (b === yeokMaMap[dayBranch]) sals.push('역마살');
    if (b === hwaGaeMap[dayBranch]) sals.push('화개살');
    if (b === jangSungMap[dayBranch]) sals.push('장성살');
    if (b === geobSalMap[dayBranch]) sals.push('겁살');
    if (b === banAnMap[dayBranch]) sals.push('반안살');
    if (ceTargets.includes(b)) sals.push('천을귀인');
    if (b === mcTarget) sals.push('문창귀인');
    if (b === wjTarget) sals.push('원진살');
    if (b === gmTarget) sals.push('귀문관살');
    // 월살 (월지 기준, 일지와 충)
    const chungIdx = (BR_LIST.indexOf(b) + 6) % 12;
    if (i !== 2 && BR_LIST[chungIdx] === dayBranch) sals.push('육충');
    result[l] = { twelveSal: '', specialSals: sals };
  });

  return result;
}

// ═══ 격국 판정 (자평진전 기반 + 전체 세력 고려) ═══
function calcGeukguk(dayStem, monthBranch, tenGods, stemArr, branchArr, dayStrength) {
  const dayElem = STEM_ELEM[dayStem];
  const monthTG = tenGods['month']?.branch || '';
  const CY = {'목':'화','화':'토','토':'금','금':'수','수':'목'};

  // 전체 십성 그룹별 카운트
  const allTG = [];
  ['year','month','day','hour'].forEach(k => {
    if (tenGods[k]?.stem && tenGods[k].stem !== '(일간)') allTG.push(tenGods[k].stem);
    if (tenGods[k]?.branch) allTG.push(tenGods[k].branch);
  });
  const grpCount = {비겁:0,식상:0,재성:0,관성:0,인성:0};
  const grpMap = {'비견':'비겁','겁재':'비겁','식신':'식상','상관':'식상','편재':'재성','정재':'재성','편관':'관성','정관':'관성','편인':'인성','정인':'인성'};
  allTG.forEach(t => { if(grpMap[t]) grpCount[grpMap[t]]++; });

  // 1. 건록격/양인격 체크 (우선)
  const rokMap = {'甲':'寅','乙':'卯','丙':'巳','丁':'午','戊':'巳','己':'午','庚':'申','辛':'酉','壬':'亥','癸':'子'};
  if (monthBranch === rokMap[dayStem]) return '건록격';
  const yangInMap = {'甲':'卯','丙':'午','戊':'午','庚':'酉','壬':'子'};
  if (yangInMap[dayStem] && monthBranch === yangInMap[dayStem]) return '양인격';

  // 2. 종격 판정
  if (dayStrength.score < 25 && grpCount.비겁 === 0 && grpCount.인성 === 0) {
    if (grpCount.재성 > grpCount.관성 && grpCount.재성 > grpCount.식상) return '종재격';
    if (grpCount.관성 > grpCount.재성) return '종관격';
    if (grpCount.식상 > grpCount.재성) return '종아격';
    return '종격';
  }
  if (dayStrength.score > 85 && grpCount.재성 === 0 && grpCount.관성 === 0 && grpCount.식상 === 0) {
    return (grpCount.인성 > 0) ? '종강격' : '종왕격';
  }

  // 3. 정격: 전체에서 비겁 제외한 최다 그룹 기준
  const candidates = [
    {name:'식상',cnt:grpCount.식상},{name:'재성',cnt:grpCount.재성},
    {name:'관성',cnt:grpCount.관성},{name:'인성',cnt:grpCount.인성}
  ].sort((a,b) => b.cnt - a.cnt);

  const dominant = candidates[0];
  const monthGrp = grpMap[monthTG] || '';

  // 월지 그룹과 전체 최다 그룹이 같으면 → 월지 기반 격
  // 다르면 → 전체 최다가 월지보다 2개 이상 많으면 최다 기준, 아니면 월지 유지
  let gkGroup = monthGrp;
  if (dominant.cnt > 0 && dominant.name !== monthGrp) {
    const monthGrpCnt = grpCount[monthGrp] || 0;
    if (dominant.cnt >= monthGrpCnt + 2) gkGroup = dominant.name;
  }
  // 월지 기반도 전체 최다도 없으면 월지 정기 사용
  if (!gkGroup && monthTG) gkGroup = grpMap[monthTG];

  // 그룹 → 구체적 격명 (편/정 구분: 그룹 내 더 많은 것)
  const gkDetail = {
    식상: (allTG.filter(t=>t==='식신').length >= allTG.filter(t=>t==='상관').length) ? '식신격' : '상관격',
    재성: (allTG.filter(t=>t==='편재').length >= allTG.filter(t=>t==='정재').length) ? '편재격' : '정재격',
    관성: (allTG.filter(t=>t==='편관').length >= allTG.filter(t=>t==='정관').length) ? '편관격' : '정관격',
    인성: (allTG.filter(t=>t==='편인').length >= allTG.filter(t=>t==='정인').length) ? '편인격' : '정인격',
  };

  return gkDetail[gkGroup] || (monthTG + '격') || '미정';
}

// ═══ 용신 판정 (억부용신 기본) ═══
function calcYongsin(dayStem, dayStrength, tenGods) {
  const dayElem = STEM_ELEM[dayStem];
  const CY = {'목':'화','화':'토','토':'금','금':'수','수':'목'};
  const CT = {'목':'토','화':'금','토':'수','금':'목','수':'화'};
  const revCY = {}; Object.keys(CY).forEach(k => revCY[CY[k]] = k);
  const revCT = {}; Object.keys(CT).forEach(k => revCT[CT[k]] = k);

  if (dayStrength.strength === 'strong') {
    // 신강: 설기(식상) > 극(재성) > 억(관성) 순
    return CY[dayElem] + '(식상 설기)';
  } else {
    // 신약: 생(인성) > 부(비겁) 순
    return revCY[dayElem] + '(인성 생부)';
  }
}

// ═══ 신강/신약 간이 판정 ═══
function calcDayStrength(dayStem, stems, branches, bazi) {
  const dayElem = STEM_ELEM[dayStem];
  const CYCLE = { '목': '화', '화': '토', '토': '금', '금': '수', '수': '목' };
  const CTRL = { '목': '토', '화': '금', '토': '수', '금': '목', '수': '화' };

  let support = 0, oppose = 0;
  // 모든 천간/지지/지장간의 오행을 카운트
  stems.forEach((s, i) => {
    if (i === 2) return; // 일간 제외
    const e = STEM_ELEM[s];
    if (e === dayElem) support += 1.5; // 비겁
    else if (CYCLE[e] === dayElem) support += 1.2; // 인성 (나를 생하는)
    else if (CYCLE[dayElem] === e) oppose += 0.8; // 식상
    else if (CTRL[dayElem] === e) oppose += 1.0; // 재성
    else if (CTRL[e] === dayElem) oppose += 1.2; // 관성
  });
  branches.forEach(b => {
    const e = BR_ELEM[b];
    if (e === dayElem) support += 1.0;
    else if (CYCLE[e] === dayElem) support += 0.8;
    else if (CYCLE[dayElem] === e) oppose += 0.5;
    else if (CTRL[dayElem] === e) oppose += 0.7;
    else if (CTRL[e] === dayElem) oppose += 0.8;
  });

  // 지장간 추가 가중 (메인 정기만)
  ['Year','Month','Day','Time'].forEach(k => {
    try {
      const hg = bazi[`get${k}HideGan`]();
      if (hg && hg[0]) {
        const e = STEM_ELEM[hg[0]];
        if (e === dayElem) support += 0.5;
        else if (CYCLE[e] === dayElem) support += 0.4;
        else oppose += 0.3;
      }
    } catch (ex) {}
  });

  // 월령(월지) 가중: 일간이 월령에서 왕상이면 +3
  const monthBranch = branches[1];
  const monthElem = BR_ELEM[monthBranch];
  if (monthElem === dayElem) support += 2.5;
  else if (CYCLE[monthElem] === dayElem) support += 2.0;

  const total = support + oppose;
  const score = total > 0 ? Math.round(support / total * 100) : 50;
  return { strength: score >= 50 ? 'strong' : 'weak', score };
}

// ═══ 메인 래퍼 함수 ═══
function calculateSajuLunar(params) {
  const { year, month, day, hour, minute, gender, calendar } = params;

  let solar;
  if (calendar === 'lunar') {
    const { Lunar } = window._lunarLib;
    const lunarDate = Lunar.fromYmdHms(year, month, day, hour || 12, minute || 0, 0);
    solar = lunarDate.getSolar();
  } else {
    const { Solar } = window._lunarLib;
    solar = Solar.fromYmdHms(year, month, day, hour || 12, minute || 0, 0);
  }

  const lunar = solar.getLunar();
  const bazi = lunar.getEightChar();

  // 성별: 남=0, 여=1 (lunar-javascript 규칙)
  const genderCode = (gender === '남') ? 1 : 0;

  // 4주 추출
  const pillars = {
    year: bazi.getYear(), month: bazi.getMonth(),
    day: bazi.getDay(), hour: bazi.getTime()
  };

  // 상세
  const keys = ['year', 'month', 'day', 'hour'];
  const capKeys = ['Year', 'Month', 'Day', 'Time'];
  const pillarDetails = {};
  const tenGods = {};
  const stages12 = { bong: {} };
  const sals = {};
  const stemArr = [], branchArr = [];

  keys.forEach((k, i) => {
    const ck = capKeys[i];
    const stem = bazi[`get${ck}Gan`]();
    const branch = bazi[`get${ck}Zhi`]();
    stemArr.push(stem);
    branchArr.push(branch);

    pillarDetails[k] = { stem, branch };

    // 십성
    const stemTG = TG_CN2KR[bazi[`get${ck}ShiShenGan`]()] || bazi[`get${ck}ShiShenGan`]();
    const branchTGs = (bazi[`get${ck}ShiShenZhi`]() || []).map(t => TG_CN2KR[t] || t);
    tenGods[k] = {
      stem: stemTG,
      branch: branchTGs.length > 0 ? branchTGs[0] : '' // 정기(본기)
    };

    // 12운성
    const diShi = bazi[`get${ck}DiShi`]();
    stages12.bong[k] = DS_CN2KR[diShi] || diShi;
  });

  // 공망
  const dayKong = bazi.getDayXunKong(); // e.g. "午未"
  const yearKong = bazi.getYearXunKong();
  const gongmang = {
    branches: dayKong ? [dayKong[0], dayKong[1]] : [],
    branchesKo: dayKong ? [BR_KR[dayKong[0]] || '', BR_KR[dayKong[1]] || ''] : []
  };
  // 년주 공망도 추가
  const gongmangYear = {
    branches: yearKong ? [yearKong[0], yearKong[1]] : [],
    branchesKo: yearKong ? [BR_KR[yearKong[0]] || '', BR_KR[yearKong[1]] || ''] : []
  };

  // 천간 관계
  const stemRelations = calcStemRelations(stemArr);

  // 지지 관계
  const branchRelations = calcBranchRelations(branchArr);

  // 대운
  const dayStem = stemArr[2];
  const yun = bazi.getYun(genderCode);
  const daYunList = yun.getDaYun();
  const yunStartAge = yun.getStartYear ? yun.getStartYear() : 1;
  // daYunList[0]은 未交运(교운 전), [1]~가 실제 대운
  const actualDaYun = daYunList.filter(d => d.getGanZhi && d.getGanZhi());
  const daeun = {
    startAge: yunStartAge,
    list: actualDaYun.map((d, i) => {
      const gz = d.getGanZhi();
      if (!gz) return null;
      const dStem = gz[0];
      const tg = calcTenGod(dayStem, dStem);
      const start = yunStartAge + i * 10;
      return {
        startAge: start,
        endAge: start + 9,
        ganzhi: gz,
        stemTenGod: tg
      };
    }).filter(d => d)
  };

  // 신살
  const salResult = calcTwelveSal(stemArr[2], branchArr[2], branchArr);

  // 강약
  const dayStrength = calcDayStrength(stemArr[2], stemArr, branchArr, bazi);

  // 격국 (자평진전 기반)
  const geukguk = calcGeukguk(stemArr[2], branchArr[1], tenGods, stemArr, branchArr, dayStrength);

  // 용신 (억부용신)
  const yongsin = calcYongsin(stemArr[2], dayStrength, tenGods);

  // 현재 나이
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - year + 1;

  // 납음
  const nayin = {
    year: bazi.getYearNaYin(), month: bazi.getMonthNaYin(),
    day: bazi.getDayNaYin(), hour: bazi.getTimeNaYin()
  };

  // 지장간
  const hideGan = {};
  keys.forEach((k, i) => {
    const ck = capKeys[i];
    const kk = k === 'year' ? '년' : k === 'month' ? '월' : k === 'day' ? '일' : '시';
    try {
      const hg = bazi[`get${ck}HideGan`]();
      hideGan[kk] = (hg || []).map(h => ({ stem: h, kr: STEM_KR[h] || h, elem: STEM_ELEM[h] || '' }));
    } catch (e) { hideGan[kk] = []; }
  });

  // 명궁/신궁
  let mingGong = '', shenGong = '';
  try { mingGong = bazi.getMingGong(); } catch (e) {}
  try { shenGong = bazi.getShenGong(); } catch (e) {}

  return {
    pillars,
    pillarDetails,
    tenGods,
    stemRelations,
    branchRelations,
    gongmang,
    gongmangYear,
    daeun,
    stages12,
    sals: salResult,
    advanced: {
      geukguk,
      yongsin,
      dayStrength
    },
    currentAge,
    // lunar-javascript 추가 데이터
    nayin,
    hideGan,
    mingGong,
    shenGong,
    _bazi: bazi, // 원본 객체 (디버깅용)
    _lunar: lunar
  };
}

// 전역 등록
window.calculateSajuLunar = calculateSajuLunar;
window.TG_CN2KR = TG_CN2KR;
window.DS_CN2KR = DS_CN2KR;
