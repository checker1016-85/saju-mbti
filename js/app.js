// ═══ STATE ═══
const S={saju:null,tg:null,stats:null,job:null,jobCat:null,jobName:null,radar:null,db:null,mbti:null,ennea:null,selectedMBTI:null,selectedEnnea:null};
let tempJob=null,tempJobCat=null,tempMBTI=null,tempEnnea=null,timeMode='ganji';

// ═══ INIT ═══
document.addEventListener('DOMContentLoaded',()=>{
  for(let i=1;i<=12;i++){const o=document.createElement('option');o.value=i;o.text=i+'월';document.getElementById('inMonth').add(o);}
  buildDayOpts();buildGanjiOpts();buildHourOpts();buildMinOpts();buildCityOpts();updateAge();
  document.getElementById('inMonth').onchange=()=>{buildDayOpts();updateAge();};
  document.getElementById('inYear').onchange=()=>{buildDayOpts();updateAge();};
  document.getElementById('inDay').onchange=updateAge;
  document.getElementById('inAgeType').onchange=updateAge;
  document.getElementById('chkNoTime').onchange=function(){
    document.getElementById('inGanji').disabled=this.checked;
    document.getElementById('inHour').disabled=this.checked;
  };
  loadDB();
  if(typeof loadAstroLib==='function')loadAstroLib();
  renderEmptyFrames();
});
function renderEmptyFrames(){
  // 4종 빈 프레임 (조회 전에도 영역 표시)
  document.getElementById('myungriArea').innerHTML=emptyFrame('명리',emptyViz('☯️'),[['📌 본능 일주','조회를 입력하세요'],['🎭 사회적 월주','조회를 입력하세요']]);
  document.getElementById('astroArea').innerHTML=emptyFrame('점성',emptyViz('🌌'),[['상승궁(ASC)','조회를 입력하세요'],['태양·달·MC','조회를 입력하세요']],'#7060c0');
  document.getElementById('enneaArea').innerHTML=emptyFrame('에니어그램',emptyViz('🔷'),[['메인 유형','조회를 입력하세요'],['날개','조회를 입력하세요']],'var(--stat-solo)');
  document.getElementById('mbtiArea').innerHTML=emptyFrame('MBTI',emptyViz('🧠'),[['유형','조회를 입력하세요'],['세부 A/T','조회를 입력하세요']],'var(--stat-lead)');
}
function emptyFrame(title,viz,rows,color){
  color=color||'var(--gold)';
  let body=rows.map(([l,v])=>`<div class="uf-sec"><div class="uf-label">${l}</div><div class="uf-body" style="color:var(--text3)">${v}</div></div>`).join('');
  return `<div class="unified-frame uf-fixed" style="border-color:${color}">
    <div class="uf-head-split"><div class="uf-head-left"><div class="kw-main" style="color:${color}">${title}</div><div class="kw-sub">조회 대기 중</div></div><div class="uf-head-viz">${viz}</div></div>
    <div class="uf-body-scroll">${body}</div></div>`;
}
function buildCityOpts(){
  if(typeof COUNTRIES==='undefined')return;
  const cs=document.getElementById('inCountry');if(!cs)return;
  Object.keys(COUNTRIES).forEach(c=>{const o=document.createElement('option');o.value=c;o.text=c;cs.add(o);});
  cs.onchange=fillCities;
  fillCities();
}
function fillCities(){
  const country=document.getElementById('inCountry').value;
  const cs=document.getElementById('inCity');cs.innerHTML='';
  (COUNTRIES[country]||[]).forEach(c=>{const o=document.createElement('option');o.value=c.name;o.text=c.name;cs.add(o);});
  cs.onchange=showCityCoord;
  showCityCoord();
}
function showCityCoord(){
  const country=document.getElementById('inCountry').value;
  const cityName=document.getElementById('inCity').value;
  const city=(COUNTRIES[country]||[]).find(c=>c.name===cityName);
  if(city)document.getElementById('cityCoord').textContent=`위도 ${city.lat}, 경도 ${city.lng}`;
}
window.setGeoMode=function(mode,el){
  document.querySelectorAll('.time-tabs')[1]?.querySelectorAll('.time-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('geoCity').style.display=mode==='city'?'':'none';
  document.getElementById('geoCoord').style.display=mode==='coord'?'':'none';
};
function getGeo(){
  const coordMode=document.getElementById('geoCoord').style.display!=='none';
  if(coordMode){return {lat:+document.getElementById('inLat').value,lng:+document.getElementById('inLng').value};}
  const country=document.getElementById('inCountry').value;
  const cityName=document.getElementById('inCity').value;
  const city=(COUNTRIES[country]||[]).find(c=>c.name===cityName)||{lat:37.5665,lng:126.978};
  return {lat:city.lat,lng:city.lng};
}

function buildDayOpts(){const m=+document.getElementById('inMonth').value||1,s=document.getElementById('inDay'),p=s.value;const d=[31,29,31,30,31,30,31,31,30,31,30,31][m-1];s.innerHTML='';for(let i=1;i<=d;i++){const o=document.createElement('option');o.value=i;o.text=i+'일';s.add(o);}if(p&&p<=d)s.value=p;}
function buildGanjiOpts(){const s=document.getElementById('inGanji');GANJI_HOURS.forEach(g=>{const o=document.createElement('option');o.value=g.h;o.text=g.label;s.add(o);});}
function buildHourOpts(){const s=document.getElementById('inHour');for(let i=0;i<24;i++){const o=document.createElement('option');o.value=i;o.text=String(i).padStart(2,'0')+'시';s.add(o);}}
function buildMinOpts(){const s=document.getElementById('inMin');for(let i=0;i<60;i++){const o=document.createElement('option');o.value=i;o.text=String(i).padStart(2,'0')+'분';s.add(o);}}
function updateAge(){const y=+document.getElementById('inYear').value;const isKr=document.getElementById('inAgeType').value==='kr';const age=isKr?(2026-y+1):(2026-y);document.getElementById('ageDisplay').textContent=age+'세';}
window.setTimeMode=function(mode,el){timeMode=mode;document.querySelectorAll('.time-tab').forEach(t=>t.classList.remove('active'));el.classList.add('active');document.getElementById('timeGanji').style.display=mode==='ganji'?'':'none';document.getElementById('timeDirect').style.display=mode==='direct'?'':'none';};

// ═══ DB LOAD ═══
function loadDB(){fetch(GAS_URL+'?action=getDB').then(r=>r.json()).then(j=>{if(j.ok){S.db=j.data;console.log('✅ DB 로드',Object.keys(S.db));}}).catch(e=>console.warn('DB 로드 실패:',e));}

// ═══ CALC ═══
window.doCalc=function(){
  if(!window._ssaju){toast('⏳ 라이브러리 로딩 중...');return;}
  const noTime=document.getElementById('chkNoTime').checked;
  let hour=12;
  if(!noTime){hour=timeMode==='ganji'?+document.getElementById('inGanji').value:+document.getElementById('inHour').value;}
  const minute=(!noTime&&timeMode==='direct')?+document.getElementById('inMin').value:0;
  const cal=document.querySelector('input[name="cal"]:checked').value;
  const r=window._ssaju({year:+document.getElementById('inYear').value,month:+document.getElementById('inMonth').value,day:+document.getElementById('inDay').value,hour,minute,gender:document.getElementById('inGender').value,calendar:cal==='lunar'||cal==='leap'?'lunar':'solar'});
  S.saju=r;S.tg=countTG(r);S.stats=calcStats(r,S.tg);S.radar=calcRadar(S.tg,r);
  S.mbti=calcMBTIFull(S.tg);S.selectedMBTI=S.mbti.primary;
  S.ennea=calcEnneagram(S.tg);S.selectedEnnea=S.ennea.primary;
  renderSajuCard();renderSajuMeta();renderMyungri();renderEnnea();renderMBTI();renderSummary();renderRight();updateJobRec();
  document.getElementById('enneaSelBtn').style.display='';
  document.getElementById('mbtiSelBtn').style.display='';
  // 점성 계산 (출생지 좌표 필요, 시간모름이면 정오 기준)
  if(typeof calcAstro==='function'&&typeof COUNTRIES!=='undefined'){
    const geo=getGeo();
    const aHour=noTime?12:hour, aMin=noTime?0:minute;
    const ah=calcAstro(+document.getElementById('inYear').value,+document.getElementById('inMonth').value,+document.getElementById('inDay').value,aHour,aMin,geo.lat,geo.lng);
    renderAstro(ah);
  }
  toast('✅ 분석 완료');
};

function countTG(r){const c={};['year','month','day','hour'].forEach(p=>{if(!r.tenGods?.[p])return;[r.tenGods[p].stem,r.tenGods[p].branch].forEach(t=>{if(t&&t!=='(일간)'&&t!=='일간')c[t]=(c[t]||0)+1;});});return c;}
function tgVal(tg,names){let s=0;names.forEach(n=>s+=(tg[n]||0));return s;}

const STAT_KEYS=['재물력','놀기력','리더력','학습력','독립력'];
function calcStats(r,tg){
  const st={재물력:tgVal(tg,['편재','정재'])*14,놀기력:tgVal(tg,['식신','상관'])*14,리더력:tgVal(tg,['편관','정관'])*14,학습력:tgVal(tg,['편인','정인'])*14,독립력:tgVal(tg,['비견','겁재'])*14};
  const gk=r.advanced?.geukguk||'';
  if(gk.includes('재'))st.재물력+=15;else if(gk.includes('식상'))st.놀기력+=15;else if(gk.includes('관'))st.리더력+=15;else if(gk.includes('인수')||gk.includes('인성'))st.학습력+=15;else if(gk.includes('비겁'))st.독립력+=15;
  if(r.advanced?.dayStrength?.strength==='strong')st.독립력+=10;else st.학습력+=10;
  for(const k of STAT_KEYS)st[k]=Math.max(5,Math.min(100,st[k]));
  st['종합']=Math.round(st.재물력*.2+st.놀기력*.2+st.리더력*.25+st.학습력*.15+st.독립력*.2);
  return st;
}

function calcRadar(tg,r){
  const str=r.advanced?.dayStrength?.score||50;const clamp=(v)=>Math.max(5,Math.min(100,v));
  return {
    '체력·멘탈':{color:'#d44060',axes:[{label:'체력',value:clamp(tgVal(tg,['비견','겁재'])*16+str*.3)},{label:'멘탈력',value:clamp(tgVal(tg,['편인','정인'])*16+str*.2)},{label:'회복력',value:clamp(tgVal(tg,['식신','상관'])*14+tgVal(tg,['정인'])*8)},{label:'인내력',value:clamp(tgVal(tg,['편관','정관'])*12+tgVal(tg,['정재'])*10)},{label:'스트레스\n내성',value:clamp(str*.5+tgVal(tg,['비견'])*12)}]},
    '사회성':{color:'#6050c0',axes:[{label:'리더십',value:clamp(tgVal(tg,['편관','정관'])*16)},{label:'소통력',value:clamp(tgVal(tg,['식신','상관'])*16)},{label:'협업력',value:clamp(tgVal(tg,['비견'])*18+tgVal(tg,['정관'])*8)},{label:'매력',value:clamp(tgVal(tg,['편재','정재'])*12+tgVal(tg,['상관'])*8)},{label:'공감력',value:clamp(tgVal(tg,['정인'])*14+tgVal(tg,['식신'])*10)}]},
    '재능·두뇌':{color:'#18a088',axes:[{label:'창의력',value:clamp(tgVal(tg,['상관'])*18+tgVal(tg,['식신'])*10)},{label:'분석력',value:clamp(tgVal(tg,['정인'])*16+tgVal(tg,['편인'])*10)},{label:'실행력',value:clamp(tgVal(tg,['비견','겁재'])*12+tgVal(tg,['편관'])*10)},{label:'전략력',value:clamp(tgVal(tg,['정관'])*12+tgVal(tg,['정인'])*12)},{label:'직관력',value:clamp(tgVal(tg,['편인'])*16+tgVal(tg,['상관'])*10)}]},
    '재물·야망':{color:'#d4a017',axes:[{label:'수익감각',value:clamp(tgVal(tg,['정재'])*18+tgVal(tg,['편재'])*8)},{label:'투자감각',value:clamp(tgVal(tg,['편재'])*18+tgVal(tg,['정재'])*6)},{label:'야망',value:clamp(tgVal(tg,['편관'])*16+tgVal(tg,['겁재'])*8)},{label:'안정추구',value:clamp(tgVal(tg,['정관'])*14+tgVal(tg,['정재'])*12)},{label:'모험도',value:clamp(tgVal(tg,['겁재'])*14+tgVal(tg,['편재'])*12)}]},
    '관계·연애':{color:'#d44060',axes:[{label:'애정표현',value:clamp(tgVal(tg,['정재','편재'])*14+tgVal(tg,['상관'])*8)},{label:'헌신도',value:clamp(tgVal(tg,['정재'])*16+tgVal(tg,['정인'])*8)},{label:'매력',value:clamp(tgVal(tg,['상관'])*14+tgVal(tg,['편재'])*10)},{label:'안정성',value:clamp(tgVal(tg,['정관','정재'])*12)},{label:'자유추구',value:clamp(tgVal(tg,['겁재','상관'])*12)}]},
    '직업·사회':{color:'#18a088',axes:[{label:'조직력',value:clamp(tgVal(tg,['정관'])*16+tgVal(tg,['정재'])*8)},{label:'전문성',value:clamp(tgVal(tg,['정인','편인'])*14)},{label:'추진력',value:clamp(tgVal(tg,['편관','겁재'])*14)},{label:'창업기질',value:clamp(tgVal(tg,['편재','상관'])*14)},{label:'협상력',value:clamp(tgVal(tg,['정재','식신'])*13)}]}
  };
}

// ═══ MBTI ═══
function calcMBTIFull(tg){
  const ext=tgVal(tg,['식신','상관','편재','정재']),intr=tgVal(tg,['편인','정인','비견','겁재']);
  const sns=tgVal(tg,['편재','정재','편관','정관']),ntu=tgVal(tg,['식신','상관','편인','정인']);
  const thk=tgVal(tg,['편관','정관','비견','겁재']),fee=tgVal(tg,['식신','상관','편재','정재']);
  const jdg=tgVal(tg,['정관','정재','정인']),prc=tgVal(tg,['편관','편재','편인','상관']);
  const pct=(a,b)=>Math.round(a/(a+b+0.01)*100);
  const axes={E:pct(ext,intr),I:pct(intr,ext),S:pct(sns,ntu),N:pct(ntu,sns),T:pct(thk,fee),F:pct(fee,thk),J:pct(jdg,prc),P:pct(prc,jdg)};
  const primary=(axes.E>=axes.I?'E':'I')+(axes.S>=axes.N?'S':'N')+(axes.T>=axes.F?'T':'F')+(axes.J>=axes.P?'J':'P');
  const th=15;
  const ei=Math.abs(axes.E-axes.I)<th?['E','I']:[axes.E>axes.I?'E':'I'];
  const sn=Math.abs(axes.S-axes.N)<th?['S','N']:[axes.S>axes.N?'S':'N'];
  const tf=Math.abs(axes.T-axes.F)<th?['T','F']:[axes.T>axes.F?'T':'F'];
  const jp=Math.abs(axes.J-axes.P)<th?['J','P']:[axes.J>axes.P?'J':'P'];
  const recommended=[];ei.forEach(e=>sn.forEach(s=>tf.forEach(t=>jp.forEach(p=>recommended.push(e+s+t+p)))));
  return {axes,primary,recommended};
}
function calcMBTI(tg){return calcMBTIFull(tg).primary;}

// ═══ 에니어그램 ═══
function calcEnneagram(tg){
  const tgArr=[tg['편재']||0,tg['정재']||0,tg['식신']||0,tg['상관']||0,tg['편관']||0,tg['정관']||0,tg['편인']||0,tg['정인']||0,tg['비견']||0,tg['겁재']||0];
  const scores={};
  for(let i=1;i<=9;i++){let s=0;ENNEA_WEIGHTS[i].forEach((w,j)=>s+=w*tgArr[j]);scores[i]=s;}
  const sorted=Object.entries(scores).sort((a,b)=>b[1]-a[1]);
  const primary=+sorted[0][0];
  const recommended=sorted.filter(([k,v])=>v>=sorted[0][1]*0.5&&v>0).map(([k])=>+k).slice(0,3);
  if(recommended.length===0)recommended.push(primary);
  return {scores,primary,recommended};
}

function getOh(r){if(r.fiveElements)return r.fiveElements;const oh={목:0,화:0,토:0,금:0,수:0};['year','month','day','hour'].forEach(k=>{const p=r.pillarDetails?.[k];if(!p)return;const se=ELEM_MAP[p.stem];if(se)oh[se]++;const be=ELEM_MAP[p.branch];if(be)oh[be]++;});return oh;}

// ═══ LEFT: 사주카드 + 해석 ═══
function renderSajuCard(){
  const r=S.saju,pd=r.pillarDetails;const keys=['hour','day','month','year'],labels=['시주','일주','월주','년주'];
  let h='<div class="saju-card"><div class="pillar-row">';
  keys.forEach((k,i)=>{const p=pd?.[k];const gc=p?OC[ELEM_MAP[p.stem]]||'':'',jc=p?OC[ELEM_MAP[p.branch]]||'':'';const gKr=p?HANJA_KR[p.stem]||'':'',jKr=p?HANJA_KR[p.branch]||'':'';
    const ganTg=r.tenGods?.[k]?.stem||'';
    const jiTg=r.tenGods?.[k]?.branch||'';
    h+=`<div class="pillar"><div class="lbl">${labels[i]}</div><div class="tg-top">${ganTg}</div><div class="gan ${gc}">${p?.stem||'·'}</div><div class="gan-kr">${gKr}</div><div class="ji ${jc}">${p?.branch||'·'}</div><div class="ji-kr">${jKr}</div><div class="tg-bot">${jiTg}</div></div>`;});
  h+='</div></div>';
  document.getElementById('sajuCardArea').innerHTML=h;
}
function renderSajuMeta(){
  const r=S.saju;
  const keys=['hour','day','month','year'],klabel={hour:'시',day:'일',month:'월',year:'년'};
  let h='<div class="meta-box">';
  // 12운성 (bong)
  if(r.stages12?.bong){const s=keys.map(k=>r.stages12.bong[k]?`${klabel[k]} ${r.stages12.bong[k]}`:'').filter(Boolean).join(' · ');if(s)h+=metaRow('12운성',s);}
  // 천간 관계
  if(r.stemRelations&&r.stemRelations.length){const s=r.stemRelations.map(x=>x.desc||x.type).join(', ');h+=metaRow('천간 관계',s);}
  // 지지 관계 (육합/충/형/파/해/원진/귀문/삼합/방합/반합) — 각 타입은 {key:desc} 객체
  if(r.branchRelations){
    const parts=[];
    const order=['육합','삼합','반합','방합','충','형','파','해','원진','귀문'];
    order.forEach(type=>{
      const val=r.branchRelations[type];
      if(val&&typeof val==='object'){
        const descs=[...new Set(Object.values(val).filter(Boolean))];
        if(descs.length)parts.push(descs.join(', '));
      }
    });
    if(parts.length)h+=metaRow('지지 관계',parts.join(' · '));
  }
  // 신살 (각 기둥 twelveSal + specialSals)
  if(r.sals){
    const all=[];
    keys.forEach(k=>{const s=r.sals[k];if(!s)return;if(s.twelveSal)all.push(s.twelveSal);if(s.specialSals&&s.specialSals.length)all.push(...s.specialSals);});
    const uniq=[...new Set(all)];
    if(uniq.length)h+=metaRow('신살',uniq.join(' · '));
  }
  // 격국
  if(r.advanced?.geukguk)h+=metaRow('격국',r.advanced.geukguk);
  // 용신
  const ys=Array.isArray(r.advanced?.yongsin)?r.advanced.yongsin.join(', '):(r.advanced?.yongsin||'');
  if(ys)h+=metaRow('용신',ys);
  // 강약
  if(r.advanced?.dayStrength)h+=metaRow('신강/신약',(r.advanced.dayStrength.strength==='strong'?'신강':'신약')+' ('+r.advanced.dayStrength.score+')');
  // 공망 (branchesKo 배열)
  if(r.gongmang){
    const g=r.gongmang.branchesKo?r.gongmang.branchesKo.join(', '):(r.gongmang.branches?r.gongmang.branches.join(', '):'');
    if(g)h+=metaRow('공망',g);
  }
  // 대운 (현재 대운 + 시작나이)
  if(r.daeun?.list&&r.daeun.list.length){
    const age=r.currentAge||0;
    const cur=r.daeun.list.find(d=>age>=d.startAge&&age<=d.endAge)||r.daeun.list[0];
    const val=`${r.daeun.startAge}세 시작 · 현재 ${cur.ganzhi}(${cur.stemTenGod||''}) ${cur.startAge}~${cur.endAge}세`;
    h+=metaRow('대운',val);
  }
  h+='</div>';
  document.getElementById('sajuMetaArea').innerHTML=h;
}
function metaRow(label,val){return `<div class="meta-row"><div class="meta-label">${label}</div><div class="meta-val">${val}</div></div>`;}
function getDBPersonality(stem,gender){
  if(!S.db)return null;
  try{const file=S.db['30_성별나이'];if(!file)return null;
    const stemKr={'甲':'갑','乙':'을','丙':'병','丁':'정','戊':'무','己':'기','庚':'경','辛':'신','壬':'임','癸':'계'};
    const genderStr=gender==='남'?'남':'녀';
    for(const tabName in file){const rows=file[tabName];if(!Array.isArray(rows))continue;
      const match=rows.find(r=>(r['천간']||'').includes(stemKr[stem]||stem)&&(r['성별']||'')==genderStr&&r['성격 분기']);
      if(match)return match['성격 분기'];
    }
  }catch(e){}
  return null;
}

// ═══ CENTER ① 명리 ═══
function renderMyungri(){
  const r=S.saju,st=S.stats;const pd=r.pillarDetails,ds=pd?.day?.stem||'甲',db=pd?.day?.branch||'子',mb=pd?.month?.branch||'子';
  const ilju=ds+db;
  const sorted=STAT_KEYS.map(k=>({k,v:st[k]})).sort((a,b)=>b.v-a.v);
  const typeName=TYPE_NAMES[sorted[0].k+'_'+sorted[1].k]||'균형형 ⚖️';
  const gender=document.getElementById('inGender').value;const dbText=getDBPersonality(ds,gender);
  const seasonMap={'寅':'초봄','卯':'봄','辰':'늦봄','巳':'초여름','午':'여름','未':'늦여름','申':'초가을','酉':'가을','戌':'늦가을','亥':'초겨울','子':'겨울','丑':'늦겨울'};
  const season=seasonMap[mb]||'';
  const oh=getOh(r);
  // 일간 오행 + 십성 대표 (예: "수 비겁")
  const dayElem=ELEM_MAP[ds]||'';
  const tg=S.tg||{};
  const tgTop=Object.entries(tg).sort((a,b)=>b[1]-a[1])[0];
  const tgGroup={'비견':'비겁','겁재':'비겁','식신':'식상','상관':'식상','편재':'재성','정재':'재성','편관':'관성','정관':'관성','편인':'인성','정인':'인성'};
  const centerTop=dayElem+' '+(tgTop?(tgGroup[tgTop[0]]||tgTop[0]):'');
  const centerBot=r.advanced?.geukguk||'';
  let h='<div class="unified-frame uf-fixed">';
  h+=`<div class="uf-head-split"><div class="uf-head-left">
    <div class="kw-main">${STEM_ADJ[ds]||''} ${typeName}</div>
    <div class="kw-sub">${ilju}일주 · ${r.advanced?.geukguk||'—'} · ${r.advanced?.dayStrength?.strength==='strong'?'신강':'신약'}</div>
    <div class="kw-points">
      <span class="kw-point"><b>본능 일주:</b> ${ilju} (${HANJA_KR[ds]} ${HANJA_KR[db]})</span>
      <span class="kw-point"><b>사회 월주:</b> ${HANJA_KR[mb]} (${season})</span>
      <span class="kw-point"><b>일간 오행:</b> ${dayElem} · ${centerBot}</span>
    </div></div><div class="uf-head-viz">${sajuVizSVG(oh,centerTop,centerBot)}</div></div>`;
  h+='<div class="uf-body-scroll">';
  h+=`<div class="uf-sec"><div class="uf-label">📌 본능 일주 ${ilju} (${HANJA_KR[ds]} ${HANJA_KR[db]})</div>
    <div class="uf-body">${dbText||STEM_TEXT[ds]||''}</div>
    <div class="uf-body"><b>일간 ${HANJA_KR[ds]}:</b> ${STEM_TEXT[ds]||''}</div>
    <div class="uf-body"><b>일지 ${HANJA_KR[db]}:</b> ${BRANCH_TEXT[db]||''}</div></div>`;
  h+=`<div class="uf-sec"><div class="uf-label">🎭 사회적 월주 ${HANJA_KR[mb]} (${season})</div>
    <div class="uf-body"><b>계절적:</b> ${season} 기운을 타고나, 이 시기의 에너지가 삶의 리듬을 형성한다.</div>
    <div class="uf-body"><b>사회적 페르소나:</b> ${MONTH_TEXT[mb]||''}</div></div>`;
  h+='</div></div>';
  document.getElementById('myungriArea').innerHTML=h;
}

// ═══ DB 우선 설명 헬퍼 ═══
function dbTab(fileKey,tabName){
  if(!S.db||!S.db[fileKey])return null;
  const f=S.db[fileKey];
  if(tabName&&Array.isArray(f[tabName]))return f[tabName];
  // 탭명 미지정: 첫 배열
  for(const t in f){if(Array.isArray(f[t]))return f[t];}
  return null;
}
function getDBMbti(code){
  const rows=dbTab('MBTI');if(!rows)return null;
  let m=rows.find(r=>(r['유형']||'')===code);
  if(!m){const base=code.split('-')[0];m=rows.find(r=>(''+(r['유형']||'')).indexOf(base)===0);}
  if(!m)return null;
  return {별칭:m['별칭']||'',성향:m['핵심 성향']||'',강점:m['강점']||'',약점:m['약점']||'',연애:m['관계/연애']||'',직업:m['직업 적성']||'',사주:m['사주 연계']||''};
}
function getDBEnnea(num){
  const rows=dbTab('에니어그램','에니어그램');if(!rows)return null;
  const m=rows.find(r=>(''+r['번호'])===(''+num));if(!m)return null;
  return {유형:m['유형']||'',욕구:m['핵심 욕구']||'',두려움:m['핵심 두려움']||'',성향:m['성향 설명']||'',건강:m['건강할 때']||'',보통:m['보통일 때']||'',불건강:m['불건강할 때']||'',스트레스:m['스트레스(분열)']||'',안정:m['안정(통합)']||'',사주:m['사주 연계']||''};
}
function getDBWing(code){
  const rows=dbTab('에니어그램','날개');if(!rows)return null;
  const m=rows.find(r=>(r['날개']||'')===code);if(!m)return null;
  return {명칭:m['명칭']||'',설명:m['설명']||'',키워드:m['특징 키워드']||''};
}

// ═══ CENTER ② 에니어그램 ═══
function renderEnnea(){
  if(!S.ennea)return;
  const main=S.selectedEnnea,en=S.ennea;
  const w1=main===1?9:main-1,w2=main===9?1:main+1;
  const dbE=getDBEnnea(main),dbW1=getDBWing(w1+'w'+main),dbW2=getDBWing(main+'w'+w2);
  const center=ENNEA_CENTER[main]||'';
  const centerC={본능:'#d06020',가슴:'#18a088',사고:'#6050c0'}[center]||'#888';
  let h='<div class="unified-frame uf-fixed" style="border-color:var(--stat-solo)">';
  h+=`<div class="uf-head-split"><div class="uf-head-left">
    <div class="kw-main" style="color:var(--stat-solo)">${center} ${ENNEA_NAMES[main]}</div>
    <div class="kw-sub">${main}번 · 추천 ${en.recommended.map(n=>n+'번').join(', ')}</div>
    <div class="kw-points">
      <span class="kw-point"><b>센터:</b> ${ENNEA_CENTER_DESC[center]||center}</span>
      <span class="kw-point"><b>메인:</b> ${main}번 ${ENNEA_NAMES[main]}</span>
      <span class="kw-point"><b>날개:</b> ${w1}w${main} / ${main}w${w2}</span>
    </div></div><div class="uf-head-viz">${enneaStarSVG(main,w1,w2)}</div></div>`;
  h+='<div class="uf-body-scroll">';
  h+=`<div class="uf-sec"><div class="uf-body">${dbE?.성향||ENNEA_DESC[main]||''}</div></div>`;
  if(dbE?.두려움)h+=`<div class="uf-sec"><div class="uf-label">😨 핵심 두려움</div><div class="uf-body">${dbE.두려움}</div></div>`;
  if(dbE?.건강)h+=`<div class="uf-sec"><div class="uf-label">✅ 건강할 때</div><div class="uf-body">${dbE.건강}</div></div>`;
  if(dbE?.불건강)h+=`<div class="uf-sec"><div class="uf-label">⚠️ 불건강할 때</div><div class="uf-body">${dbE.불건강}</div></div>`;
  if(dbE?.스트레스)h+=`<div class="uf-sec"><div class="uf-label">📉 스트레스 (분열)</div><div class="uf-body">${dbE.스트레스}</div></div>`;
  if(dbE?.안정)h+=`<div class="uf-sec"><div class="uf-label">📈 안정 (통합)</div><div class="uf-body">${dbE.안정}</div></div>`;
  if(dbE?.사주)h+=`<div class="uf-sec"><div class="uf-label">☯️ 사주 연계</div><div class="uf-body">${dbE.사주}</div></div>`;
  h+=`<div class="uf-sec"><div class="uf-label">🪽 날개</div><div class="uf-body"><b>${w1}w${main}</b> ${dbW1?'('+dbW1.명칭+') '+dbW1.설명:'('+ENNEA_NAMES[w1]+')'}</div><div class="uf-body"><b>${main}w${w2}</b> ${dbW2?'('+dbW2.명칭+') '+dbW2.설명:'('+ENNEA_NAMES[w2]+')'}</div></div>`;
  h+='</div></div>';
  document.getElementById('enneaArea').innerHTML=h;
}

// ═══ CENTER ③ MBTI ═══
function renderMBTI(){
  if(!S.mbti)return;
  const m=S.mbti,sel=S.selectedMBTI,ax=m.axes;
  const dbM=getDBMbti(sel);
  // 세부 A/T + 최고 축 포인트
  const variant=ax.E>=50&&ax.S>=50&&ax.T>=50&&ax.J>=50?'A':'T'; // 단순: 우세 많으면 확신형
  const axList=[['E',ax.E,'I',ax.I],['S',ax.S,'N',ax.N],['T',ax.T,'F',ax.F],['J',ax.J,'P',ax.P]];
  let topAxis='',topVal=0,topLabel='';
  axList.forEach(([a,av,b,bv])=>{const on=sel.includes(a)?a:b,v=sel.includes(a)?av:bv;if(v>topVal){topVal=v;topAxis=on;topLabel=on;}});
  let h='<div class="unified-frame uf-fixed" style="border-color:var(--stat-lead)">';
  h+=`<div class="uf-head-split"><div class="uf-head-left">
    <div class="kw-main" style="color:var(--stat-lead)">${sel}-${variant}</div>
    <div class="kw-sub">${dbM?.별칭||MBTI_DESC[sel]?.split('—')[0]||''} · 추천 ${m.recommended.slice(0,4).join(', ')}</div>
    <div class="kw-points">
      <span class="kw-point"><b>유형:</b> ${sel}</span>
      <span class="kw-point"><b>세부:</b> ${variant==='A'?'A (확신형)':'T (격동형)'}</span>
      <span class="kw-point"><b>최고 지표:</b> ${topLabel} ${topVal}%</span>
    </div></div><div class="uf-head-viz">${mbtiBigSVG(ax,sel)}</div></div>`;
  h+='<div class="uf-body-scroll">';
  h+=`<div class="uf-sec"><div class="uf-body">${dbM?.성향||MBTI_DESC[sel]||''}</div></div>`;
  if(dbM?.강점)h+=`<div class="uf-sec"><div class="uf-label">💪 강점</div><div class="uf-body">${dbM.강점}</div></div>`;
  if(dbM?.약점)h+=`<div class="uf-sec"><div class="uf-label">⚠️ 약점</div><div class="uf-body">${dbM.약점}</div></div>`;
  if(dbM?.연애)h+=`<div class="uf-sec"><div class="uf-label">💕 관계/연애</div><div class="uf-body">${dbM.연애}</div></div>`;
  if(dbM?.사주)h+=`<div class="uf-sec"><div class="uf-label">☯️ 사주 연계</div><div class="uf-body">${dbM.사주}</div></div>`;
  if(dbM?.직업)h+=`<div class="uf-sec"><div class="uf-label">💼 직업 적성</div><div class="uf-body">${dbM.직업}</div></div>`;
  h+='</div></div>';
  document.getElementById('mbtiArea').innerHTML=h;
}

// ═══ CENTER 종합 프로필 ═══
function renderSummary(){
  const r=S.saju,st=S.stats;const pd=r.pillarDetails,ds=pd?.day?.stem||'甲',db=pd?.day?.branch||'子';
  const sorted=STAT_KEYS.map(k=>({k,v:st[k]})).sort((a,b)=>b.v-a.v);
  const typeName=(TYPE_NAMES[sorted[0].k+'_'+sorted[1].k]||'균형형').replace(/[^\w가-힣]/g,'');
  const main=S.selectedEnnea,w1=main===1?9:main-1,w2=main===9?1:main+1;
  let h=`<div class="summary-card">
    <div class="summary-row"><span class="s-icon">☯️</span><span class="s-label">명리</span><span class="s-val">${STEM_ADJ[ds]} ${typeName} <small>(${ds+db})</small></span></div>
    <div class="summary-row"><span class="s-icon">🔷</span><span class="s-label">에니어</span><span class="s-val" style="color:var(--stat-solo)">${main}번 ${ENNEA_NAMES[main]} <small>(${w1}w${main}/${main}w${w2})</small></span></div>
    <div class="summary-row"><span class="s-icon">🧠</span><span class="s-label">MBTI</span><span class="s-val" style="color:var(--stat-lead)">${S.selectedMBTI} <small>${MBTI_DESC[S.selectedMBTI]?.split('—')[0]||''}</small></span></div>
    ${S.jobName?`<div class="summary-row"><span class="s-icon">💼</span><span class="s-label">직업</span><span class="s-val">${S.jobName} <small>(${S.jobCat})</small></span></div>`:''}
  </div>`;
  document.getElementById('summaryArea').innerHTML=h;
}

// ═══ RIGHT: 스탯 + 레이더 ═══
function renderRight(){
  const st=S.stats;if(!st)return;
  let h='';
  // 스탯 5개
  const SM=[{key:'재물력',icon:'💰',color:'var(--stat-money)'},{key:'놀기력',icon:'🎉',color:'var(--stat-play)'},{key:'리더력',icon:'👑',color:'var(--stat-lead)'},{key:'학습력',icon:'🧠',color:'var(--stat-study)'},{key:'독립력',icon:'⚔️',color:'var(--stat-solo)'}];
  h+='<div class="right-card">';
  SM.forEach(s=>{const v=st[s.key];h+=`<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px"><span style="font-size:14px;width:20px;text-align:center">${s.icon}</span><span style="width:42px;font-size:10px;color:var(--text2);font-weight:700">${s.key}</span><div style="flex:1;height:20px;background:var(--surface3);border-radius:10px;overflow:hidden"><div style="height:100%;width:${v}%;background:${s.color};border-radius:10px;position:relative"><span style="position:absolute;right:6px;top:2px;font-size:10px;font-weight:800;color:#fff">${v}</span></div></div></div>`;});
  h+=`<div style="text-align:center;padding:8px;background:var(--surface);border-radius:var(--radius);border:1px solid var(--border);margin-top:4px"><span style="font-size:10px;color:var(--text2)">종합 전투력</span><br><span style="font-family:'Space Grotesk';font-size:28px;font-weight:700;color:var(--gold-dim)">${st.종합}</span></div>`;
  h+='</div>';
  // 레이더 6종 (3×2, 크게, 퍼센트 포함)
  h+='<div class="radar-grid6">';
  for(const[title,data]of Object.entries(S.radar)){
    const avg=Math.round(data.axes.reduce((s,a)=>s+a.value,0)/data.axes.length);
    h+=`<div class="radar-box"><div class="r-title" style="color:${data.color}">${title} <b>${avg}%</b></div>${radarSVG(data.axes,data.color,200)}</div>`;
  }
  h+='</div>';
  document.getElementById('rightResult').innerHTML=h;
}

function updateJobRec(){
  if(!S.stats){document.getElementById('jobRecArea').innerHTML='';return;}
  const st=S.stats;const ranked=JOB_CATS.map(c=>({...c,score:Math.round(st[c.primary]*.7+st[c.secondary]*.3)})).sort((a,b)=>b.score-a.score);
  const top3=ranked.slice(0,3);const totalJobs=JOB_CATS.reduce((s,c)=>s+c.jobs.length,0);const matchJobs=top3.reduce((s,c)=>s+c.jobs.length,0);
  let h=`<div class="job-rec"><strong>📌 사주 추천 직군</strong><br>`;
  top3.forEach((c,i)=>h+=`${i+1}. ${c.cat} (${c.score}%) — ${c.jobs.length}개<br>`);
  h+=`<br>전체 ${totalJobs}개 중 <strong>${matchJobs}개</strong> 높은 적성</div>`;
  document.getElementById('jobRecArea').innerHTML=h;
}

// ═══ JOB MODAL ═══
window.openJobModal=function(){
  const st=S.stats;let banner='';
  if(st){const ranked=JOB_CATS.map(c=>({...c,score:Math.round(st[c.primary]*.7+st[c.secondary]*.3)})).sort((a,b)=>b.score-a.score);const top=ranked.slice(0,3).map(c=>c.cat);banner=`<div class="modal-rec-banner"><strong>📌 추천 직군:</strong> ${top.join(', ')}<br><span style="font-size:11px;color:var(--text2)">★ = 사주 적성 높은 카테고리</span></div>`;}
  document.getElementById('jobModalBody').innerHTML=banner+JOB_CATS.map(c=>{const isRec=st&&(Math.round(st[c.primary]*.7+st[c.secondary]*.3)>=60);return `<div class="jcat-title">${c.cat}${isRec?'<span class="rec-badge">★ 추천</span>':''}</div><div class="jcat-grid">${c.jobs.map(j=>`<button class="jcat-btn${S.jobName===j?' active':''}" data-job="${j}" data-cat="${c.cat}" onclick="pickJob(this)">${j}</button>`).join('')}</div>`;}).join('');
  document.getElementById('jobModal').classList.add('show');tempJob=S.jobName;tempJobCat=S.jobCat;
};
window.closeJobModal=function(){document.getElementById('jobModal').classList.remove('show');};
window.pickJob=function(el){document.querySelectorAll('#jobModalBody .jcat-btn').forEach(b=>b.classList.remove('active'));el.classList.add('active');tempJob=el.dataset.job;tempJobCat=el.dataset.cat;};
window.confirmJob=function(){if(!tempJob){toast('직업을 선택하세요');return;}S.jobName=tempJob;S.jobCat=tempJobCat;S.job=JOB_CATS.find(c=>c.cat===tempJobCat);document.getElementById('jobSelectBtn').textContent='🏷️ '+tempJob+' ('+tempJobCat+')';document.getElementById('jobSelectBtn').classList.add('selected');closeJobModal();renderSummary();};

// ═══ ENNEAGRAM MODAL ═══
window.openEnneaModal=function(){
  const en=S.ennea;
  let banner=`<div class="modal-rec-banner"><strong>📌 사주 추천:</strong> ${en.recommended.map(n=>n+'번 '+ENNEA_NAMES[n]).join(', ')}<br><span style="font-size:11px;color:var(--text2)">★ = 사주에서 가장 많이 나오는 유형</span></div>`;
  let grid='<div class="ennea-modal-grid">';
  for(let i=1;i<=9;i++){const isRec=en.recommended.includes(i);grid+=`<button class="ennea-modal-btn${S.selectedEnnea===i?' active':''}${isRec?' recommended':''}" data-n="${i}" onclick="pickEnnea(${i})"><span class="en-num">${i}</span><span class="en-name">${ENNEA_NAMES[i]}</span>${isRec?'<span class="en-badge">★</span>':''}</button>`;}
  grid+='</div>';
  document.getElementById('enneaModalBody').innerHTML=banner+grid+'<div id="enneaModalDesc"></div>';
  tempEnnea=S.selectedEnnea;updateEnneaModalDesc(tempEnnea);
  document.getElementById('enneaModal').classList.add('show');
};
window.pickEnnea=function(n){document.querySelectorAll('.ennea-modal-btn').forEach(b=>b.classList.remove('active'));document.querySelector(`.ennea-modal-btn[data-n="${n}"]`).classList.add('active');tempEnnea=n;updateEnneaModalDesc(n);};
function updateEnneaModalDesc(n){const w1=n===1?9:n-1,w2=n===9?1:n+1;document.getElementById('enneaModalDesc').innerHTML=`<div class="ennea-result"><strong>${n}번 ${ENNEA_NAMES[n]}</strong><br>${ENNEA_DESC[n]}<br><br>🪽 날개: <strong>${w1}w${n}</strong>(${ENNEA_NAMES[w1]}) ↔ <strong>${n}w${w2}</strong>(${ENNEA_NAMES[w2]})</div>`;}
window.closeEnneaModal=function(){document.getElementById('enneaModal').classList.remove('show');};
window.confirmEnnea=function(){S.selectedEnnea=tempEnnea;closeEnneaModal();renderEnnea();renderSummary();};

// ═══ MBTI MODAL ═══
window.openMBTIModal=function(){
  const m=S.mbti;
  let banner=`<div class="modal-rec-banner"><strong>📌 사주 추천:</strong> ${m.recommended.join(', ')}<br><span style="font-size:11px;color:var(--text2)">★ = 사주 기반 가능 범위 / 16개 전체 선택 가능</span></div>`;
  let grid='<div class="mbti-modal-grid">';
  MBTI_ALL.forEach(t=>{const isRec=m.recommended.includes(t);grid+=`<button class="mbti-modal-btn${S.selectedMBTI===t?' active':''}${isRec?' recommended':''}" data-t="${t}" onclick="pickMBTI('${t}')"><span class="mb-code">${t}</span><span class="mb-name">${(MBTI_DESC[t]||'').split('—')[0]}</span>${isRec?'<span class="en-badge">★</span>':''}</button>`;});
  grid+='</div>';
  document.getElementById('mbtiModalBody').innerHTML=banner+grid;
  tempMBTI=S.selectedMBTI;
  document.getElementById('mbtiModal').classList.add('show');
};
window.pickMBTI=function(t){document.querySelectorAll('.mbti-modal-btn').forEach(b=>b.classList.remove('active'));document.querySelector(`.mbti-modal-btn[data-t="${t}"]`).classList.add('active');tempMBTI=t;};
window.closeMBTIModal=function(){document.getElementById('mbtiModal').classList.remove('show');};
window.confirmMBTI=function(){S.selectedMBTI=tempMBTI;closeMBTIModal();renderMBTI();renderSummary();};

function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2000);}
