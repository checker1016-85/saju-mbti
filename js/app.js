// STATE
const S={saju:null,tg:null,stats:null,job:null,jobCat:null,jobName:null,radar:null};let tempJob=null,tempJobCat=null,timeMode='ganji';

// INIT
document.addEventListener('DOMContentLoaded',()=>{
  for(let i=1;i<=12;i++){const o=document.createElement('option');o.value=i;o.text=i+'월';document.getElementById('inMonth').add(o);}
  buildDayOpts();buildGanjiOpts();buildHourOpts();buildMinOpts();updateAge();
  document.getElementById('inMonth').onchange=()=>{buildDayOpts();updateAge();};
  document.getElementById('inYear').onchange=()=>{buildDayOpts();updateAge();};
  document.getElementById('inDay').onchange=updateAge;
  document.querySelectorAll('input[name="agetype"]').forEach(r=>r.onchange=updateAge);
  document.getElementById('chkNoTime').onchange=function(){document.getElementById('inGanji').disabled=this.checked;document.getElementById('inHour').disabled=this.checked;};
});
function buildDayOpts(){const m=+document.getElementById('inMonth').value||1,s=document.getElementById('inDay'),p=s.value;const d=[31,29,31,30,31,30,31,31,30,31,30,31][m-1];s.innerHTML='';for(let i=1;i<=d;i++){const o=document.createElement('option');o.value=i;o.text=i+'일';s.add(o);}if(p&&p<=d)s.value=p;}
function buildGanjiOpts(){const s=document.getElementById('inGanji');GANJI_HOURS.forEach(g=>{const o=document.createElement('option');o.value=g.h;o.text=g.label;s.add(o);});}
function buildHourOpts(){const s=document.getElementById('inHour');for(let i=0;i<24;i++){const o=document.createElement('option');o.value=i;o.text=String(i).padStart(2,'0')+'시';s.add(o);}}
function buildMinOpts(){const s=document.getElementById('inMin');for(let i=0;i<60;i+=10){const o=document.createElement('option');o.value=i;o.text=String(i).padStart(2,'0')+'분';s.add(o);}}
function updateAge(){const y=+document.getElementById('inYear').value;const isKr=document.querySelector('input[name="agetype"]:checked')?.value==='kr';const age=isKr?(2026-y+1):(2026-y);document.getElementById('ageDisplay').textContent=age+'세 ('+(isKr?'한국':'만')+')';}
window.setTimeMode=function(mode,el){timeMode=mode;document.querySelectorAll('.time-tab').forEach(t=>t.classList.remove('active'));el.classList.add('active');document.getElementById('timeGanji').style.display=mode==='ganji'?'':'none';document.getElementById('timeDirect').style.display=mode==='direct'?'':'none';};

// CALC
window.doCalc=function(){
  if(!window._ssaju){toast('⏳ 라이브러리 로딩 중...');return;}
  const noTime=document.getElementById('chkNoTime').checked;
  let hour=12;
  if(!noTime){hour=timeMode==='ganji'?+document.getElementById('inGanji').value:+document.getElementById('inHour').value;}
  const minute=(!noTime&&timeMode==='direct')?+document.getElementById('inMin').value:0;
  const cal=document.querySelector('input[name="cal"]:checked').value;
  const r=window._ssaju({year:+document.getElementById('inYear').value,month:+document.getElementById('inMonth').value,day:+document.getElementById('inDay').value,hour,minute,gender:document.getElementById('inGender').value,calendar:cal==='lunar'||cal==='leap'?'lunar':'solar'});
  S.saju=r; S.tg=countTG(r); S.stats=calcStats(r,S.tg); S.radar=calcRadar(S.tg,r);
  renderSajuCard();renderInterp();renderCenter();renderRight();updateJobRec();toast('✅ 분석 완료');
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

// RADAR DATA (4 categories × 5 axes each)
function calcRadar(tg,r){
  const str=r.advanced?.dayStrength?.score||50;
  const clamp=(v)=>Math.max(5,Math.min(100,v));
  return {
    '체력·멘탈':{color:'#ff6090',axes:[
      {label:'체력',value:clamp(tgVal(tg,['비견','겁재'])*16+str*.3)},
      {label:'멘탈력',value:clamp(tgVal(tg,['편인','정인'])*16+str*.2)},
      {label:'회복력',value:clamp(tgVal(tg,['식신','상관'])*14+tgVal(tg,['정인'])*8)},
      {label:'인내력',value:clamp(tgVal(tg,['편관','정관'])*12+tgVal(tg,['정재'])*10)},
      {label:'스트레스\n내성',value:clamp(str*.5+tgVal(tg,['비견'])*12)}
    ]},
    '사회성':{color:'#8070ff',axes:[
      {label:'리더십',value:clamp(tgVal(tg,['편관','정관'])*16)},
      {label:'소통력',value:clamp(tgVal(tg,['식신','상관'])*16)},
      {label:'협업력',value:clamp(tgVal(tg,['비견'])*18+tgVal(tg,['정관'])*8)},
      {label:'매력',value:clamp(tgVal(tg,['편재','정재'])*12+tgVal(tg,['상관'])*8)},
      {label:'공감력',value:clamp(tgVal(tg,['정인'])*14+tgVal(tg,['식신'])*10)}
    ]},
    '재능·두뇌':{color:'#40d8c0',axes:[
      {label:'창의력',value:clamp(tgVal(tg,['상관'])*18+tgVal(tg,['식신'])*10)},
      {label:'분석력',value:clamp(tgVal(tg,['정인'])*16+tgVal(tg,['편인'])*10)},
      {label:'실행력',value:clamp(tgVal(tg,['비견','겁재'])*12+tgVal(tg,['편관'])*10)},
      {label:'전략력',value:clamp(tgVal(tg,['정관'])*12+tgVal(tg,['정인'])*12)},
      {label:'직관력',value:clamp(tgVal(tg,['편인'])*16+tgVal(tg,['상관'])*10)}
    ]},
    '재물·야망':{color:'#ffd740',axes:[
      {label:'수익감각',value:clamp(tgVal(tg,['정재'])*18+tgVal(tg,['편재'])*8)},
      {label:'투자감각',value:clamp(tgVal(tg,['편재'])*18+tgVal(tg,['정재'])*6)},
      {label:'야망',value:clamp(tgVal(tg,['편관'])*16+tgVal(tg,['겁재'])*8)},
      {label:'안정추구',value:clamp(tgVal(tg,['정관'])*14+tgVal(tg,['정재'])*12)},
      {label:'모험도',value:clamp(tgVal(tg,['겁재'])*14+tgVal(tg,['편재'])*12)}
    ]}
  };
}

// MBTI
function calcMBTI(tg){
  const ext=tgVal(tg,['식신','상관','편재','정재']),intr=tgVal(tg,['편인','정인','비견','겁재']);
  const sns=tgVal(tg,['편재','정재','편관','정관']),ntu=tgVal(tg,['식신','상관','편인','정인']);
  const thk=tgVal(tg,['편관','정관','비견','겁재']),fee=tgVal(tg,['식신','상관','편재','정재']);
  const jdg=tgVal(tg,['정관','정재','정인']),prc=tgVal(tg,['편관','편재','편인','상관']);
  return (ext>intr?'E':'I')+(sns>ntu?'S':'N')+(thk>fee?'T':'F')+(jdg>=prc?'J':'P');
}

// SVG RADAR
function radarSVG(axes,color,size=130){
  const cx=size/2,cy=size/2,r=size/2-22,n=axes.length;
  const ang=(i)=>-Math.PI/2+2*Math.PI*i/n;
  const pt=(i,v)=>[(cx+r*(v/100)*Math.cos(ang(i))).toFixed(1),(cy+r*(v/100)*Math.sin(ang(i))).toFixed(1)];
  let svg=`<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
  // grid
  [25,50,75,100].forEach(lv=>{let pts='';for(let i=0;i<n;i++){const[x,y]=pt(i,lv);pts+=`${x},${y} `;}svg+=`<polygon points="${pts}" fill="none" stroke="#2a2f42" stroke-width=".5"/>`;});
  for(let i=0;i<n;i++){const[x,y]=pt(i,100);svg+=`<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#2a2f42" stroke-width=".5"/>`;}
  // data
  let dpts='';axes.forEach((a,i)=>{const[x,y]=pt(i,a.value);dpts+=`${x},${y} `;});
  svg+=`<polygon points="${dpts}" fill="${color}30" stroke="${color}" stroke-width="2"/>`;
  axes.forEach((a,i)=>{const[x,y]=pt(i,a.value);svg+=`<circle cx="${x}" cy="${y}" r="3" fill="${color}"/>`;});
  // labels
  axes.forEach((a,i)=>{const[x,y]=pt(i,120);const lines=a.label.split('\n');lines.forEach((l,li)=>{svg+=`<text x="${x}" y="${(+y)+li*11}" text-anchor="middle" fill="#8a8fa6" font-size="9" font-family="Noto Sans KR">${l}</text>`;});});
  svg+='</svg>';return svg;
}

// LEFT RENDER
function renderSajuCard(){
  const r=S.saju,pd=r.pillarDetails;const keys=['hour','day','month','year'],labels=['시주','일주','월주','년주'];
  let h='<div class="saju-card"><div class="pillar-row">';
  keys.forEach((k,i)=>{const p=pd?.[k];const gc=p?OC[ELEM_MAP[p.stem]]||'':'',jc=p?OC[ELEM_MAP[p.branch]]||'':'';h+=`<div class="pillar"><div class="lbl">${labels[i]}</div><div class="gan ${gc}">${p?.stem||'·'}</div><div class="ji ${jc}">${p?.branch||'·'}</div><div class="info">${r.tenGods?.[k]?.stem||''}</div></div>`;});
  h+='</div>';const oh=getOh(r),ohT=Object.values(oh).reduce((a,b)=>a+b,1);
  h+='<div class="oh-bar">';for(const[e,c]of Object.entries(oh))h+=`<span style="width:${(c/ohT*100).toFixed(1)}%;background:${ELEM_COLOR[e]}"></span>`;
  h+='</div><div style="display:flex;justify-content:center;gap:8px;margin-top:4px">';for(const[e,c]of Object.entries(oh))h+=`<span style="font-size:10px;color:${ELEM_COLOR[e]}">${e}${c}</span>`;h+='</div></div>';
  document.getElementById('sajuCardArea').innerHTML=h;
}
function renderInterp(){
  const pd=S.saju.pillarDetails,ds=pd?.day?.stem||'甲',db=pd?.day?.branch||'子',mb=pd?.month?.branch||'子';
  let h=`<div class="analysis-block"><div class="a-title">🔥 ${ds+db}일주 — ${ds}일간</div><div class="a-body">${STEM_TEXT[ds]||''}</div></div>`;
  h+=`<div class="analysis-block"><div class="a-title">🌙 내면 — ${db}지</div><div class="a-body">${BRANCH_TEXT[db]||''}</div></div>`;
  h+=`<div class="analysis-block"><div class="a-title">🎭 페르소나 — ${mb}월</div><div class="a-body">${MONTH_TEXT[mb]||''}</div></div>`;
  document.getElementById('interpArea').innerHTML=h;
}
function getOh(r){if(r.fiveElements)return r.fiveElements;const oh={목:0,화:0,토:0,금:0,수:0};['year','month','day','hour'].forEach(k=>{const p=r.pillarDetails?.[k];if(!p)return;const se=ELEM_MAP[p.stem];if(se)oh[se]++;const be=ELEM_MAP[p.branch];if(be)oh[be]++;});return oh;}

// CENTER RENDER
function renderCenter(){
  const st=S.stats,r=S.saju;if(!st)return;
  const pd=r.pillarDetails,ds=pd?.day?.stem||'甲',db=pd?.day?.branch||'子',ilju=ds+db;
  const sorted=STAT_KEYS.map(k=>({k,v:st[k]})).sort((a,b)=>b.v-a.v);
  const typeName=TYPE_NAMES[sorted[0].k+'_'+sorted[1].k]||'균형형 ⚖️';
  const mbti=calcMBTI(S.tg);

  let h=`<div class="type-card"><div class="type-name">${STEM_ADJ[ds]||''} ${typeName}</div><div class="type-sub">${ilju} · ${r.advanced?.geukguk||'—'}</div></div>`;
  h+=`<div class="mbti-card"><div class="mbti-code">${mbti}</div><div class="mbti-desc">${MBTI_DESC[mbti]||''}</div></div>`;
  h+=`<div style="text-align:center;margin-bottom:var(--gap)"><span class="strength-tag" style="background:#ffd74030;color:#ffd740">강점: ${sorted[0].k}</span><span class="strength-tag" style="background:var(--surface3);color:var(--text3)">약점: ${sorted[4].k}</span></div>`;
  // stat bars
  const SM=[{key:'재물력',icon:'💰',color:'var(--stat-money)'},{key:'놀기력',icon:'🎉',color:'var(--stat-play)'},{key:'리더력',icon:'👑',color:'var(--stat-lead)'},{key:'학습력',icon:'🧠',color:'var(--stat-study)'},{key:'독립력',icon:'⚔️',color:'var(--stat-solo)'}];
  SM.forEach(s=>{const v=st[s.key];h+=`<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px"><span style="font-size:14px;width:20px;text-align:center">${s.icon}</span><span style="width:42px;font-size:10px;color:var(--text2);font-weight:700">${s.key}</span><div style="flex:1;height:20px;background:var(--surface3);border-radius:10px;overflow:hidden"><div style="height:100%;width:${v}%;background:${s.color};border-radius:10px;position:relative"><span style="position:absolute;right:6px;top:2px;font-size:10px;font-weight:800;color:#111">${v}</span></div></div></div>`;});
  h+=`<div style="text-align:center;padding:8px;background:var(--surface3);border-radius:var(--radius);border:1px solid var(--border);margin-top:4px"><span style="font-size:10px;color:var(--text2)">종합 전투력</span><br><span style="font-family:'Space Grotesk';font-size:30px;font-weight:700;color:var(--gold)">${st.종합}</span></div>`;
  document.getElementById('centerResult').innerHTML=h;
}

function updateJobRec(){
  if(!S.stats){document.getElementById('jobRecArea').innerHTML='';return;}
  const st=S.stats;
  // 추천 카테고리 상위 3개
  const ranked=JOB_CATS.map(c=>({...c,score:Math.round(st[c.primary]*.7+st[c.secondary]*.3)})).sort((a,b)=>b.score-a.score);
  const top3=ranked.slice(0,3);
  const totalJobs=JOB_CATS.reduce((s,c)=>s+c.jobs.length,0);
  const matchJobs=top3.reduce((s,c)=>s+c.jobs.length,0);
  let h=`<div class="job-rec"><strong>📌 사주 기반 추천 직군</strong><br>`;
  top3.forEach((c,i)=>h+=`${i+1}. ${c.cat} (${c.score}%) — ${c.jobs.length}개 직업<br>`);
  h+=`<br>전체 ${totalJobs}개 직업 중 <strong>${matchJobs}개</strong>가 높은 적성 (상위 3개 카테고리)</div>`;
  document.getElementById('jobRecArea').innerHTML=h;
}

// RIGHT: RADAR + PROFILE
function renderRight(){
  if(!S.radar)return;
  let h='';
  h+='<div class="radar-grid">';
  for(const[title,data]of Object.entries(S.radar)){
    h+=`<div class="radar-box"><div class="r-title" style="color:${data.color}">${title}</div>${radarSVG(data.axes,data.color)}</div>`;
  }
  h+='</div>';
  // 종합 프로필 카드
  const pd=S.saju.pillarDetails,ds=pd?.day?.stem||'甲',db=pd?.day?.branch||'子',mb=pd?.month?.branch||'子';
  const mbti=calcMBTI(S.tg);
  const sorted=STAT_KEYS.map(k=>({k,v:S.stats[k]})).sort((a,b)=>b.v-a.v);
  const typeName=TYPE_NAMES[sorted[0].k+'_'+sorted[1].k]||'균형형';
  h+=`<div class="right-card"><div style="font-size:11px;font-weight:800;color:var(--gold);margin-bottom:6px">📋 종합 프로필</div>
    <div style="font-size:12px;line-height:1.7;color:var(--text)">
    <b>${ds+db}일주</b>의 당신은 <b>${STEM_ADJ[ds]}</b> 기질의 <b>${typeName.replace(/[^\w가-힣]/g,'')}</b>.<br>
    MBTI 추정: <b style="color:var(--stat-lead)">${mbti}</b><br>
    강점 영역: <b>${sorted[0].k}</b> · <b>${sorted[1].k}</b><br>
    보완 영역: <b>${sorted[4].k}</b> · <b>${sorted[3].k}</b><br>
    격국: ${S.saju.advanced?.geukguk||'—'} · 강약: ${S.saju.advanced?.dayStrength?.strength==='strong'?'신강':'신약'}
    </div></div>`;
  document.getElementById('rightResult').innerHTML=h;
}

// JOB MODAL
window.openJobModal=function(){
  const st=S.stats;
  let banner='';
  if(st){
    const ranked=JOB_CATS.map(c=>({...c,score:Math.round(st[c.primary]*.7+st[c.secondary]*.3)})).sort((a,b)=>b.score-a.score);
    const top=ranked.slice(0,3).map(c=>c.cat);
    banner=`<div class="modal-rec-banner"><strong>📌 추천 직군:</strong> ${top.join(', ')}<br><span style="font-size:11px;color:var(--text2)">★ 표시 = 사주 적성 높은 카테고리</span></div>`;
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
