// ═══ STATE ═══
const S={saju:null,tg:null,stats:null,job:null,jobCat:null,jobName:null,radar:null,db:null,mbti:null,ennea:null,selectedMBTI:null,selectedEnnea:null};
let tempJob=null,tempJobCat=null,timeMode='ganji';

// ═══ INIT ═══
document.addEventListener('DOMContentLoaded',()=>{
  for(let i=1;i<=12;i++){const o=document.createElement('option');o.value=i;o.text=i+'월';document.getElementById('inMonth').add(o);}
  buildDayOpts();buildGanjiOpts();buildHourOpts();buildMinOpts();updateAge();
  document.getElementById('inMonth').onchange=()=>{buildDayOpts();updateAge();};
  document.getElementById('inYear').onchange=()=>{buildDayOpts();updateAge();};
  document.getElementById('inDay').onchange=updateAge;
  document.getElementById('inAgeType').onchange=updateAge;
  document.getElementById('chkNoTime').onchange=function(){
    document.getElementById('inGanji').disabled=this.checked;
    document.getElementById('inHour').disabled=this.checked;
  };
  loadDB();
});

function buildDayOpts(){const m=+document.getElementById('inMonth').value||1,s=document.getElementById('inDay'),p=s.value;const d=[31,29,31,30,31,30,31,31,30,31,30,31][m-1];s.innerHTML='';for(let i=1;i<=d;i++){const o=document.createElement('option');o.value=i;o.text=i+'일';s.add(o);}if(p&&p<=d)s.value=p;}
function buildGanjiOpts(){const s=document.getElementById('inGanji');GANJI_HOURS.forEach(g=>{const o=document.createElement('option');o.value=g.h;o.text=g.label;s.add(o);});}
function buildHourOpts(){const s=document.getElementById('inHour');for(let i=0;i<24;i++){const o=document.createElement('option');o.value=i;o.text=String(i).padStart(2,'0')+'시';s.add(o);}}
function buildMinOpts(){const s=document.getElementById('inMin');for(let i=0;i<60;i+=10){const o=document.createElement('option');o.value=i;o.text=String(i).padStart(2,'0')+'분';s.add(o);}}
function updateAge(){
  const y=+document.getElementById('inYear').value;
  const isKr=document.getElementById('inAgeType').value==='kr';
  const age=isKr?(2026-y+1):(2026-y);
  document.getElementById('ageDisplay').textContent=age+'세';
}
window.setTimeMode=function(mode,el){
  timeMode=mode;
  document.querySelectorAll('.time-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('timeGanji').style.display=mode==='ganji'?'':'none';
  document.getElementById('timeDirect').style.display=mode==='direct'?'':'none';
};

// ═══ DB LOAD (GAS) ═══
function loadDB(){
  fetch(GAS_URL+'?action=getDB')
    .then(r=>r.json())
    .then(j=>{if(j.ok){S.db=j.data;console.log('✅ DB 로드 완료',Object.keys(S.db));}})
    .catch(e=>console.warn('DB 로드 실패 (오프라인 모드):',e));
}

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
  renderSajuCard();renderInterp();renderMBTI();renderEnnea();renderCenter();renderRight();updateJobRec();toast('✅ 분석 완료');
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
  const str=r.advanced?.dayStrength?.score||50;
  const clamp=(v)=>Math.max(5,Math.min(100,v));
  return {
    '체력·멘탈':{color:'#d44060',axes:[
      {label:'체력',value:clamp(tgVal(tg,['비견','겁재'])*16+str*.3)},
      {label:'멘탈력',value:clamp(tgVal(tg,['편인','정인'])*16+str*.2)},
      {label:'회복력',value:clamp(tgVal(tg,['식신','상관'])*14+tgVal(tg,['정인'])*8)},
      {label:'인내력',value:clamp(tgVal(tg,['편관','정관'])*12+tgVal(tg,['정재'])*10)},
      {label:'스트레스\n내성',value:clamp(str*.5+tgVal(tg,['비견'])*12)}
    ]},
    '사회성':{color:'#6050c0',axes:[
      {label:'리더십',value:clamp(tgVal(tg,['편관','정관'])*16)},
      {label:'소통력',value:clamp(tgVal(tg,['식신','상관'])*16)},
      {label:'협업력',value:clamp(tgVal(tg,['비견'])*18+tgVal(tg,['정관'])*8)},
      {label:'매력',value:clamp(tgVal(tg,['편재','정재'])*12+tgVal(tg,['상관'])*8)},
      {label:'공감력',value:clamp(tgVal(tg,['정인'])*14+tgVal(tg,['식신'])*10)}
    ]},
    '재능·두뇌':{color:'#18a088',axes:[
      {label:'창의력',value:clamp(tgVal(tg,['상관'])*18+tgVal(tg,['식신'])*10)},
      {label:'분석력',value:clamp(tgVal(tg,['정인'])*16+tgVal(tg,['편인'])*10)},
      {label:'실행력',value:clamp(tgVal(tg,['비견','겁재'])*12+tgVal(tg,['편관'])*10)},
      {label:'전략력',value:clamp(tgVal(tg,['정관'])*12+tgVal(tg,['정인'])*12)},
      {label:'직관력',value:clamp(tgVal(tg,['편인'])*16+tgVal(tg,['상관'])*10)}
    ]},
    '재물·야망':{color:'#d4a017',axes:[
      {label:'수익감각',value:clamp(tgVal(tg,['정재'])*18+tgVal(tg,['편재'])*8)},
      {label:'투자감각',value:clamp(tgVal(tg,['편재'])*18+tgVal(tg,['정재'])*6)},
      {label:'야망',value:clamp(tgVal(tg,['편관'])*16+tgVal(tg,['겁재'])*8)},
      {label:'안정추구',value:clamp(tgVal(tg,['정관'])*14+tgVal(tg,['정재'])*12)},
      {label:'모험도',value:clamp(tgVal(tg,['겁재'])*14+tgVal(tg,['편재'])*12)}
    ]}
  };
}

// ═══ MBTI (축별 점수 + 추천 범위) ═══
function calcMBTIFull(tg){
  const ext=tgVal(tg,['식신','상관','편재','정재']),intr=tgVal(tg,['편인','정인','비견','겁재']);
  const sns=tgVal(tg,['편재','정재','편관','정관']),ntu=tgVal(tg,['식신','상관','편인','정인']);
  const thk=tgVal(tg,['편관','정관','비견','겁재']),fee=tgVal(tg,['식신','상관','편재','정재']);
  const jdg=tgVal(tg,['정관','정재','정인']),prc=tgVal(tg,['편관','편재','편인','상관']);
  const pct=(a,b)=>Math.round(a/(a+b+0.01)*100);
  const axes={E:pct(ext,intr),I:pct(intr,ext),S:pct(sns,ntu),N:pct(ntu,sns),T:pct(thk,fee),F:pct(fee,thk),J:pct(jdg,prc),P:pct(prc,jdg)};
  const primary=(axes.E>=axes.I?'E':'I')+(axes.S>=axes.N?'S':'N')+(axes.T>=axes.F?'T':'F')+(axes.J>=axes.P?'J':'P');
  // 추천 범위: 차이 15% 이내면 양쪽 가능
  const threshold=15;
  const ei=Math.abs(axes.E-axes.I)<threshold?['E','I']:[axes.E>axes.I?'E':'I'];
  const sn=Math.abs(axes.S-axes.N)<threshold?['S','N']:[axes.S>axes.N?'S':'N'];
  const tf=Math.abs(axes.T-axes.F)<threshold?['T','F']:[axes.T>axes.F?'T':'F'];
  const jp=Math.abs(axes.J-axes.P)<threshold?['J','P']:[axes.J>axes.P?'J':'P'];
  const recommended=[];
  ei.forEach(e=>sn.forEach(s=>tf.forEach(t=>jp.forEach(p=>recommended.push(e+s+t+p)))));
  return {axes,primary,recommended};
}
function calcMBTI(tg){return calcMBTIFull(tg).primary;}

// ═══ 에니어그램 (9유형 점수) ═══
function calcEnneagram(tg){
  const tgArr=[tg['편재']||0,tg['정재']||0,tg['식신']||0,tg['상관']||0,tg['편관']||0,tg['정관']||0,tg['편인']||0,tg['정인']||0,tg['비견']||0,tg['겁재']||0];
  const scores={};
  for(let i=1;i<=9;i++){
    let s=0;ENNEA_WEIGHTS[i].forEach((w,j)=>s+=w*tgArr[j]);
    scores[i]=s;
  }
  const sorted=Object.entries(scores).sort((a,b)=>b[1]-a[1]);
  const primary=+sorted[0][0];
  const recommended=sorted.filter(([k,v])=>v>=sorted[0][1]*0.5).map(([k])=>+k).slice(0,3);
  return {scores,primary,recommended};
}

// ═══ LEFT RENDER ═══
function renderSajuCard(){
  const r=S.saju,pd=r.pillarDetails;
  const keys=['hour','day','month','year'],labels=['시주','일주','월주','년주'];
  let h='<div class="saju-card"><div class="pillar-row">';
  keys.forEach((k,i)=>{
    const p=pd?.[k];
    const gc=p?OC[ELEM_MAP[p.stem]]||'':'',jc=p?OC[ELEM_MAP[p.branch]]||'':'';
    const ganKr=p?HANJA_KR[p.stem]||'':'';
    const jiKr=p?HANJA_KR[p.branch]||'':'';
    h+=`<div class="pillar"><div class="lbl">${labels[i]}</div>
      <div class="gan ${gc}">${p?.stem||'·'}</div><div class="gan-kr">${ganKr}</div>
      <div class="ji ${jc}">${p?.branch||'·'}</div><div class="ji-kr">${jiKr}</div>
      <div class="info">${r.tenGods?.[k]?.stem||''}</div></div>`;
  });
  h+='</div>';
  const oh=getOh(r),ohT=Object.values(oh).reduce((a,b)=>a+b,1);
  h+='<div class="oh-bar">';for(const[e,c]of Object.entries(oh))h+=`<span style="width:${(c/ohT*100).toFixed(1)}%;background:${ELEM_COLOR[e]}"></span>`;
  h+='</div><div style="display:flex;justify-content:center;gap:8px;margin-top:4px">';
  for(const[e,c]of Object.entries(oh))h+=`<span style="font-size:10px;color:${ELEM_COLOR[e]}">${e}${c}</span>`;h+='</div></div>';
  document.getElementById('sajuCardArea').innerHTML=h;
}

function renderInterp(){
  const pd=S.saju.pillarDetails,ds=pd?.day?.stem||'甲',db=pd?.day?.branch||'子',mb=pd?.month?.branch||'子';
  // DB에서 성별×천간 데이터 가져오기 시도
  const gender=document.getElementById('inGender').value;
  let dbText=getDBPersonality(ds,gender);

  let h=`<div class="analysis-block"><div class="a-title">🔥 ${ds+db}일주 — ${HANJA_KR[ds]||ds}</div><div class="a-body">${dbText||STEM_TEXT[ds]||''}</div></div>`;
  h+=`<div class="analysis-block"><div class="a-title">🌙 내면 — ${HANJA_KR[db]||db}</div><div class="a-body">${BRANCH_TEXT[db]||''}</div></div>`;
  h+=`<div class="analysis-block"><div class="a-title">🎭 페르소나 — ${HANJA_KR[mb]||mb}월</div><div class="a-body">${MONTH_TEXT[mb]||''}</div></div>`;
  document.getElementById('interpArea').innerHTML=h;
}

// DB에서 천간×성별 성격 텍스트 가져오기
function getDBPersonality(stem,gender){
  if(!S.db) return null;
  try{
    // 30_성별나이 파일의 탭 중 B00 테이블 찾기
    const file=S.db['30_성별나이'];
    if(!file) return null;
    // 탭 이름들을 순회하며 B00 데이터 찾기
    for(const tabName in file){
      const rows=file[tabName];
      if(!Array.isArray(rows)) continue;
      const stemKr={'甲':'갑','乙':'을','丙':'병','丁':'정','戊':'무','己':'기','庚':'경','辛':'신','壬':'임','癸':'계'};
      const genderStr=gender==='남'?'남':'녀';
      const match=rows.find(r=>{
        const cond1=(r['천간']||'').includes(stemKr[stem]||stem);
        const cond2=(r['성별']||'')==genderStr;
        return cond1&&cond2&&r['성격 분기'];
      });
      if(match) return match['성격 분기'];
    }
  }catch(e){console.warn('DB 조회 오류:',e);}
  return null;
}

function getOh(r){if(r.fiveElements)return r.fiveElements;const oh={목:0,화:0,토:0,금:0,수:0};['year','month','day','hour'].forEach(k=>{const p=r.pillarDetails?.[k];if(!p)return;const se=ELEM_MAP[p.stem];if(se)oh[se]++;const be=ELEM_MAP[p.branch];if(be)oh[be]++;});return oh;}

// ═══ MBTI 선택 UI ═══
function renderMBTI(){
  if(!S.mbti)return;
  const m=S.mbti,ax=m.axes;
  const pairs=[['E','I'],['S','N'],['T','F'],['J','P']];
  let h='<div class="mbti-axes">';
  pairs.forEach(([a,b])=>{
    const aRec=m.recommended.some(r=>r.includes(a)),bRec=m.recommended.some(r=>r.includes(b));
    const aActive=S.selectedMBTI.includes(a),bActive=S.selectedMBTI.includes(b);
    h+=`<div class="mbti-axis"><span class="axis-label">${a}</span><div class="axis-bar">
      <button class="axis-btn${aActive?' active':''}${aRec?' rec':''}" onclick="toggleMBTIAxis('${a}','${b}')">${a} ${ax[a]}%</button>
      <button class="axis-btn${bActive?' active':''}${bRec?' rec':''}" onclick="toggleMBTIAxis('${b}','${a}')">${b} ${ax[b]}%</button>
    </div><span class="axis-label">${b}</span></div>`;
  });
  h+='</div>';
  // 추천 + 전체 16개
  h+='<div style="font-size:10px;color:var(--text3);margin-bottom:4px">추천 범위 (금색 밑줄) / 전체 16개 선택 가능</div><div class="mbti-rec-list">';
  MBTI_ALL.forEach(t=>{
    const isRec=m.recommended.includes(t);
    const isActive=S.selectedMBTI===t;
    h+=`<button class="mbti-rec-tag${isActive?' active':''}${isRec?' recommended':''}" onclick="selectMBTI('${t}')">${t}</button>`;
  });
  h+='</div>';
  // 선택된 MBTI 설명
  h+=`<div class="ennea-result"><strong>${S.selectedMBTI}</strong> — ${MBTI_DESC[S.selectedMBTI]||''}</div>`;
  document.getElementById('mbtiArea').innerHTML=h;
}
window.toggleMBTIAxis=function(pick,other){
  let code=S.selectedMBTI.split('');
  const idx=code.indexOf(other);if(idx>=0)code[idx]=pick;
  S.selectedMBTI=code.join('');renderMBTI();renderCenter();renderRight();
};
window.selectMBTI=function(type){S.selectedMBTI=type;renderMBTI();renderCenter();renderRight();};

// ═══ 에니어그램 선택 UI ═══
function renderEnnea(){
  if(!S.ennea)return;
  const en=S.ennea,main=S.selectedEnnea;
  const w1=main===1?9:main-1, w2=main===9?1:main+1;
  let h='<div class="ennea-grid">';
  for(let i=1;i<=9;i++){
    const isRec=en.recommended.includes(i);
    const isMain=i===main;
    const isWing=i===w1||i===w2;
    h+=`<button class="ennea-btn${isMain?' active':''}${isRec&&!isMain?' recommended':''}${isWing&&!isMain?' wing':''}" onclick="selectEnnea(${i})">${i}</button>`;
  }
  h+='</div>';
  h+=`<div style="font-size:10px;color:var(--text3);margin-bottom:6px">추천: ${en.recommended.map(n=>n+'번').join(', ')} / 날개: ${w1}w${main} 또는 ${main}w${w2}</div>`;
  h+=`<div class="ennea-result"><strong>${main}번 ${ENNEA_NAMES[main]}</strong><br>${ENNEA_DESC[main]||''}<br><br>날개 <strong>${w1}번 ${ENNEA_NAMES[w1]}</strong> ↔ <strong>${w2}번 ${ENNEA_NAMES[w2]}</strong></div>`;
  document.getElementById('enneaArea').innerHTML=h;
}
window.selectEnnea=function(n){S.selectedEnnea=n;renderEnnea();renderRight();};

// ═══ CENTER ═══
function renderCenter(){
  const st=S.stats,r=S.saju;if(!st)return;
  const pd=r.pillarDetails,ds=pd?.day?.stem||'甲',ilju=ds+(pd?.day?.branch||'?');
  const sorted=STAT_KEYS.map(k=>({k,v:st[k]})).sort((a,b)=>b.v-a.v);
  const typeName=TYPE_NAMES[sorted[0].k+'_'+sorted[1].k]||'균형형 ⚖️';
  const mbti=S.selectedMBTI||calcMBTI(S.tg);
  let h=`<div class="type-card"><div class="type-name">${STEM_ADJ[ds]||''} ${typeName}</div><div class="type-sub">${ilju} · ${r.advanced?.geukguk||'—'}</div></div>`;
  h+=`<div class="mbti-card"><div class="mbti-code">${mbti}</div><div class="mbti-desc">${MBTI_DESC[mbti]||''}</div></div>`;
  h+=`<div style="text-align:center;margin-bottom:var(--gap)"><span class="strength-tag" style="background:rgba(184,134,11,.15);color:var(--gold-dim)">강점: ${sorted[0].k}</span><span class="strength-tag" style="background:var(--surface3);color:var(--text3)">약점: ${sorted[4].k}</span></div>`;
  const SM=[{key:'재물력',icon:'💰',color:'var(--stat-money)'},{key:'놀기력',icon:'🎉',color:'var(--stat-play)'},{key:'리더력',icon:'👑',color:'var(--stat-lead)'},{key:'학습력',icon:'🧠',color:'var(--stat-study)'},{key:'독립력',icon:'⚔️',color:'var(--stat-solo)'}];
  SM.forEach(s=>{const v=st[s.key];h+=`<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px"><span style="font-size:14px;width:20px;text-align:center">${s.icon}</span><span style="width:42px;font-size:10px;color:var(--text2);font-weight:700">${s.key}</span><div style="flex:1;height:20px;background:var(--surface3);border-radius:10px;overflow:hidden"><div style="height:100%;width:${v}%;background:${s.color};border-radius:10px;position:relative"><span style="position:absolute;right:6px;top:2px;font-size:10px;font-weight:800;color:#fff">${v}</span></div></div></div>`;});
  h+=`<div style="text-align:center;padding:8px;background:var(--surface2);border-radius:var(--radius);border:1px solid var(--border);margin-top:4px"><span style="font-size:10px;color:var(--text2)">종합 전투력</span><br><span style="font-family:'Space Grotesk';font-size:30px;font-weight:700;color:var(--gold-dim)">${st.종합}</span></div>`;
  document.getElementById('centerResult').innerHTML=h;
}

function updateJobRec(){
  if(!S.stats){document.getElementById('jobRecArea').innerHTML='';return;}
  const st=S.stats;
  const ranked=JOB_CATS.map(c=>({...c,score:Math.round(st[c.primary]*.7+st[c.secondary]*.3)})).sort((a,b)=>b.score-a.score);
  const top3=ranked.slice(0,3);
  const totalJobs=JOB_CATS.reduce((s,c)=>s+c.jobs.length,0);
  const matchJobs=top3.reduce((s,c)=>s+c.jobs.length,0);
  let h=`<div class="job-rec"><strong>📌 사주 기반 추천 직군</strong><br>`;
  top3.forEach((c,i)=>h+=`${i+1}. ${c.cat} (${c.score}%) — ${c.jobs.length}개 직업<br>`);
  h+=`<br>전체 ${totalJobs}개 직업 중 <strong>${matchJobs}개</strong>가 높은 적성</div>`;
  document.getElementById('jobRecArea').innerHTML=h;
}

// ═══ RIGHT: RADAR ═══
function renderRight(){
  if(!S.radar)return;
  let h='<div class="radar-grid">';
  for(const[title,data]of Object.entries(S.radar)){
    h+=`<div class="radar-box"><div class="r-title" style="color:${data.color}">${title}</div>${radarSVG(data.axes,data.color)}</div>`;
  }
  h+='</div>';
  const pd=S.saju.pillarDetails,ds=pd?.day?.stem||'甲',db=pd?.day?.branch||'子';
  const mbti=S.selectedMBTI||calcMBTI(S.tg);
  const sorted=STAT_KEYS.map(k=>({k,v:S.stats[k]})).sort((a,b)=>b.v-a.v);
  const typeName=TYPE_NAMES[sorted[0].k+'_'+sorted[1].k]||'균형형';
  const enMain=S.selectedEnnea||S.ennea?.primary||1;
  const enW1=enMain===1?9:enMain-1, enW2=enMain===9?1:enMain+1;
  h+=`<div class="right-card"><div style="font-size:11px;font-weight:800;color:var(--gold-dim);margin-bottom:6px">📋 종합 프로필</div>
    <div style="font-size:12px;line-height:1.7;color:var(--text)">
    <b>${ds+db}일주</b> — <b>${STEM_ADJ[ds]}</b> ${typeName.replace(/[^\w가-힣]/g,'')}<br>
    MBTI: <b style="color:var(--stat-lead)">${mbti}</b> · ${MBTI_DESC[mbti]?.split('—')[0]||''}<br>
    에니어그램: <b style="color:var(--stat-solo)">${enMain}번 ${ENNEA_NAMES[enMain]||''}</b> (${enW1}w${enMain}/${enMain}w${enW2})<br>
    강점: <b>${sorted[0].k}</b> · <b>${sorted[1].k}</b><br>
    보완: <b>${sorted[4].k}</b> · <b>${sorted[3].k}</b><br>
    격국: ${S.saju.advanced?.geukguk||'—'} · ${S.saju.advanced?.dayStrength?.strength==='strong'?'신강':'신약'}
    </div></div>`;
  document.getElementById('rightResult').innerHTML=h;
}

// ═══ JOB MODAL ═══
window.openJobModal=function(){
  const st=S.stats;let banner='';
  if(st){
    const ranked=JOB_CATS.map(c=>({...c,score:Math.round(st[c.primary]*.7+st[c.secondary]*.3)})).sort((a,b)=>b.score-a.score);
    const top=ranked.slice(0,3).map(c=>c.cat);
    banner=`<div class="modal-rec-banner"><strong>📌 추천 직군:</strong> ${top.join(', ')}<br><span style="font-size:11px;color:var(--text2)">★ = 사주 적성 높은 카테고리</span></div>`;
  }
  const body=document.getElementById('jobModalBody');
  body.innerHTML=banner+JOB_CATS.map(c=>{
    const isRec=st&&(Math.round(st[c.primary]*.7+st[c.secondary]*.3)>=60);
    return `<div class="jcat-title">${c.cat}${isRec?'<span class="rec-badge">★ 추천</span>':''}</div><div class="jcat-grid">${c.jobs.map(j=>`<button class="jcat-btn${S.jobName===j?' active':''}" data-job="${j}" data-cat="${c.cat}" onclick="pickJob(this)">${j}</button>`).join('')}</div>`;
  }).join('');
  document.getElementById('jobModal').classList.add('show');tempJob=S.jobName;tempJobCat=S.jobCat;
};
window.closeJobModal=function(){document.getElementById('jobModal').classList.remove('show');};
window.pickJob=function(el){document.querySelectorAll('.jcat-btn').forEach(b=>b.classList.remove('active'));el.classList.add('active');tempJob=el.dataset.job;tempJobCat=el.dataset.cat;};
window.confirmJob=function(){if(!tempJob){toast('직업을 선택하세요');return;}S.jobName=tempJob;S.jobCat=tempJobCat;S.job=JOB_CATS.find(c=>c.cat===tempJobCat);document.getElementById('jobSelectBtn').textContent='🏷️ '+tempJob+' ('+tempJobCat+')';document.getElementById('jobSelectBtn').classList.add('selected');closeJobModal();if(S.stats)renderCenter();};
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2000);}
