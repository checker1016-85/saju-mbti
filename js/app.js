// ═══ STATE ═══
const S={saju:null,tg:null,stats:null,job:null,jobCat:null,jobName:null,radar:null,db:null,mbti:null,ennea:null,selectedMBTI:null,selectedEnnea:null};
let tempJob=null,tempJobCat=null,tempMBTI=null,tempEnnea=null,timeMode='ganji';

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
  renderSajuCard();renderInterp();renderMyungri();renderEnnea();renderMBTI();renderSummary();renderRight();updateJobRec();toast('✅ 분석 완료');
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
    '재물·야망':{color:'#d4a017',axes:[{label:'수익감각',value:clamp(tgVal(tg,['정재'])*18+tgVal(tg,['편재'])*8)},{label:'투자감각',value:clamp(tgVal(tg,['편재'])*18+tgVal(tg,['정재'])*6)},{label:'야망',value:clamp(tgVal(tg,['편관'])*16+tgVal(tg,['겁재'])*8)},{label:'안정추구',value:clamp(tgVal(tg,['정관'])*14+tgVal(tg,['정재'])*12)},{label:'모험도',value:clamp(tgVal(tg,['겁재'])*14+tgVal(tg,['편재'])*12)}]}
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
  h+='</div>';
  const oh=getOh(r),ohT=Object.values(oh).reduce((a,b)=>a+b,1);
  h+='<div class="oh-bar">';for(const[e,c]of Object.entries(oh))h+=`<span style="width:${(c/ohT*100).toFixed(1)}%;background:${ELEM_COLOR[e]}"></span>`;
  h+='</div><div style="display:flex;justify-content:center;gap:8px;margin-top:4px">';for(const[e,c]of Object.entries(oh))h+=`<span style="font-size:10px;color:${ELEM_COLOR[e]}">${e}${c}</span>`;h+='</div></div>';
  document.getElementById('sajuCardArea').innerHTML=h;
}
function renderInterp(){
  const pd=S.saju.pillarDetails,ds=pd?.day?.stem||'甲',db=pd?.day?.branch||'子',mb=pd?.month?.branch||'子';
  const gender=document.getElementById('inGender').value;const dbText=getDBPersonality(ds,gender);
  let h=`<div class="analysis-block"><div class="a-title">🔥 ${ds+db}일주 — ${HANJA_KR[ds]||ds}</div><div class="a-body">${dbText||STEM_TEXT[ds]||''}</div></div>`;
  h+=`<div class="analysis-block"><div class="a-title">🌙 내면 — ${HANJA_KR[db]||db}</div><div class="a-body">${BRANCH_TEXT[db]||''}</div></div>`;
  h+=`<div class="analysis-block"><div class="a-title">🎭 페르소나 — ${HANJA_KR[mb]||mb}월</div><div class="a-body">${MONTH_TEXT[mb]||''}</div></div>`;
  document.getElementById('interpArea').innerHTML=h;
}
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
  let h=`<div class="frame-card"><div class="frame-main">${STEM_ADJ[ds]||''} ${typeName}</div><div class="frame-sub">${ilju}일주 · ${r.advanced?.geukguk||'—'} · ${r.advanced?.dayStrength?.strength==='strong'?'신강':'신약'}</div></div>`;
  h+=`<div class="frame-detail"><b>일주(${HANJA_KR[ds]} ${HANJA_KR[db]}):</b> ${STEM_TEXT[ds]||''}</div>`;
  h+=`<div class="frame-detail"><b>월주(${HANJA_KR[mb]}):</b> ${MONTH_TEXT[mb]||''}</div>`;
  const oh=getOh(r);const ohStr=Object.entries(oh).map(([e,c])=>`${e}${c}`).join(' · ');
  h+=`<div class="frame-detail"><b>원국 오행:</b> ${ohStr}</div>`;
  document.getElementById('myungriArea').innerHTML=h;
}

// ═══ CENTER ② 에니어그램 ═══
function renderEnnea(){
  if(!S.ennea)return;
  const main=S.selectedEnnea,en=S.ennea;
  const w1=main===1?9:main-1,w2=main===9?1:main+1;
  let h=`<div class="frame-card" style="border-color:var(--stat-solo)"><div class="frame-main" style="color:var(--stat-solo)">${main}번 ${ENNEA_NAMES[main]}</div><div class="frame-sub">추천: ${en.recommended.map(n=>n+'번').join(', ')}</div></div>`;
  h+=`<div class="frame-detail">${ENNEA_DESC[main]||''}</div>`;
  h+=`<div class="frame-wing"><span>🪽 날개</span> <b>${w1}w${main}</b> (${ENNEA_NAMES[w1]}) ↔ <b>${main}w${w2}</b> (${ENNEA_NAMES[w2]})</div>`;
  h+=`<button class="frame-select-btn" onclick="openEnneaModal()">👆 유저가 직접 선택하기</button>`;
  document.getElementById('enneaArea').innerHTML=h;
}

// ═══ CENTER ③ MBTI ═══
function renderMBTI(){
  if(!S.mbti)return;
  const m=S.mbti,sel=S.selectedMBTI,ax=m.axes;
  let h=`<div class="frame-card" style="border-color:var(--stat-lead)"><div class="frame-main" style="color:var(--stat-lead)">${sel}</div><div class="frame-sub">추천: ${m.recommended.join(', ')}</div></div>`;
  h+=`<div class="frame-detail">${MBTI_DESC[sel]||''}</div>`;
  // 축 막대
  const pairs=[['E','I'],['S','N'],['T','F'],['J','P']];
  h+='<div class="mbti-mini-axes">';
  pairs.forEach(([a,b])=>{
    const aOn=sel.includes(a);
    h+=`<div class="mbti-mini-axis"><span class="${aOn?'on':''}">${a} ${ax[a]}%</span><div class="mini-bar"><div class="mini-fill" style="width:${aOn?ax[a]:ax[b]}%;background:var(--stat-lead)"></div></div><span class="${!aOn?'on':''}">${ax[b]}% ${b}</span></div>`;
  });
  h+='</div>';
  h+=`<button class="frame-select-btn" onclick="openMBTIModal()">👆 유저가 직접 선택하기</button>`;
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
  // 레이더 4종
  h+='<div class="radar-grid">';
  for(const[title,data]of Object.entries(S.radar)){h+=`<div class="radar-box"><div class="r-title" style="color:${data.color}">${title}</div>${radarSVG(data.axes,data.color)}</div>`;}
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
