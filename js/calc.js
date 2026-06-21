// ═══ calc.js — 십성 계산, 스탯, 8종 게이지, 레이더, MBTI, 에니어그램 ═══
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

// ═══ 8종 개인화 스탯 (사주+점성+에니어+MBTI 종합) ═══
function calc8Stats(tg,mbti,ennea,r){
  const cl=v=>Math.max(55,Math.min(99,Math.round(v)));
  const tv=(names)=>{let s=0;names.forEach(n=>s+=(tg[n]||0));return s;};
  const ax=mbti?.axes||{E:50,I:50,S:50,N:50,T:50,F:50,J:50,P:50};
  const en=ennea?.scores||{};
  const str=r?.advanced?.dayStrength?.score||50;
  const pool=[
    {key:'독립심',score:tv(['비견','겁재'])*13+ax.I*.25+(en[8]||0)*2.5+(en[5]||0)*1.5+str*.15},
    {key:'리더십',score:tv(['편관','정관'])*13+ax.E*.2+ax.J*.15+(en[8]||0)*2.5+(en[3]||0)*2},
    {key:'창의력',score:tv(['식신','상관'])*13+ax.N*.25+(en[4]||0)*2.5+(en[7]||0)*2},
    {key:'분석력',score:tv(['편인','정인'])*13+ax.T*.2+ax.N*.1+(en[5]||0)*3+(en[1]||0)*1.5},
    {key:'책임감',score:tv(['정관','정인'])*13+ax.J*.25+(en[1]||0)*3+(en[6]||0)*2},
    {key:'표현력',score:tv(['식신','상관'])*12+ax.E*.25+(en[7]||0)*2.5+(en[4]||0)*2},
    {key:'관계운',score:tv(['정재','식신'])*12+ax.F*.25+(en[2]||0)*3+(en[9]||0)*1.5},
    {key:'인내심',score:tv(['비견','정재'])*11+ax.S*.15+ax.J*.15+(en[9]||0)*3+(en[6]||0)*2+str*.1},
    {key:'직관력',score:tv(['편인','상관'])*13+ax.N*.25+(en[4]||0)*2+(en[5]||0)*2},
    {key:'결단력',score:tv(['편관','겁재'])*13+ax.T*.15+ax.J*.15+(en[8]||0)*3},
    {key:'멘탈',score:tv(['비견','편인'])*11+tv(['정인'])*8+(en[5]||0)*2+(en[1]||0)*2+str*.2},
    {key:'승부욕',score:tv(['겁재','편관'])*13+ax.T*.15+(en[3]||0)*3+(en[8]||0)*2},
    {key:'투자감각',score:tv(['편재'])*16+tv(['정재'])*7+ax.S*.15+ax.T*.1+(en[3]||0)*2},
    {key:'기회포착',score:tv(['편재','식신'])*12+ax.N*.15+ax.P*.15+(en[7]||0)*3},
    {key:'사업감각',score:tv(['편재','편관'])*12+ax.E*.15+ax.T*.15+(en[3]||0)*2.5+(en[8]||0)*2},
    {key:'사교력',score:tv(['식신','정재'])*12+ax.E*.25+ax.F*.15+(en[2]||0)*3+(en[7]||0)*2},
  ];
  const mx=Math.max(...pool.map(p=>p.score)),mn=Math.min(...pool.map(p=>p.score));
  const range=mx-mn+0.01;
  pool.forEach(p=>{p.score=cl(55+(p.score-mn)/range*44);});
  pool.sort((a,b)=>b.score-a.score);
  return pool.slice(0,8);
}

function calcRadar(tg,r){
  const str=r.advanced?.dayStrength?.score||50;const clamp=(v)=>Math.round(Math.max(5,Math.min(100,v))*10)/10;
  return {
    '체력·멘탈':{color:'#529E89',axes:[{label:'체력',value:clamp(tgVal(tg,['비견','겁재'])*16+str*.3)},{label:'멘탈력',value:clamp(tgVal(tg,['편인','정인'])*16+str*.2)},{label:'회복력',value:clamp(tgVal(tg,['식신','상관'])*14+tgVal(tg,['정인'])*8)},{label:'인내력',value:clamp(tgVal(tg,['편관','정관'])*12+tgVal(tg,['정재'])*10)},{label:'스트레스\n내성',value:clamp(str*.5+tgVal(tg,['비견'])*12)}]},
    '사회성':{color:'#529E89',axes:[{label:'리더십',value:clamp(tgVal(tg,['편관','정관'])*16)},{label:'소통력',value:clamp(tgVal(tg,['식신','상관'])*16)},{label:'협업력',value:clamp(tgVal(tg,['비견'])*18+tgVal(tg,['정관'])*8)},{label:'매력',value:clamp(tgVal(tg,['편재','정재'])*12+tgVal(tg,['상관'])*8)},{label:'공감력',value:clamp(tgVal(tg,['정인'])*14+tgVal(tg,['식신'])*10)}]},
    '재능·두뇌':{color:'#529E89',axes:[{label:'창의력',value:clamp(tgVal(tg,['상관'])*18+tgVal(tg,['식신'])*10)},{label:'분석력',value:clamp(tgVal(tg,['정인'])*16+tgVal(tg,['편인'])*10)},{label:'실행력',value:clamp(tgVal(tg,['비견','겁재'])*12+tgVal(tg,['편관'])*10)},{label:'전략력',value:clamp(tgVal(tg,['정관'])*12+tgVal(tg,['정인'])*12)},{label:'직관력',value:clamp(tgVal(tg,['편인'])*16+tgVal(tg,['상관'])*10)}]},
    '재물·야망':{color:'#529E89',axes:[{label:'수익감각',value:clamp(tgVal(tg,['정재'])*18+tgVal(tg,['편재'])*8)},{label:'투자감각',value:clamp(tgVal(tg,['편재'])*18+tgVal(tg,['정재'])*6)},{label:'야망',value:clamp(tgVal(tg,['편관'])*16+tgVal(tg,['겁재'])*8)},{label:'안정추구',value:clamp(tgVal(tg,['정관'])*14+tgVal(tg,['정재'])*12)},{label:'모험도',value:clamp(tgVal(tg,['겁재'])*14+tgVal(tg,['편재'])*12)}]},
    '관계·연애':{color:'#529E89',axes:[{label:'애정표현',value:clamp(tgVal(tg,['정재','편재'])*14+tgVal(tg,['상관'])*8)},{label:'헌신도',value:clamp(tgVal(tg,['정재'])*16+tgVal(tg,['정인'])*8)},{label:'매력',value:clamp(tgVal(tg,['상관'])*14+tgVal(tg,['편재'])*10)},{label:'안정성',value:clamp(tgVal(tg,['정관','정재'])*12)},{label:'자유추구',value:clamp(tgVal(tg,['겁재','상관'])*12)}]},
    '직업·사회':{color:'#529E89',axes:[{label:'조직력',value:clamp(tgVal(tg,['정관'])*16+tgVal(tg,['정재'])*8)},{label:'전문성',value:clamp(tgVal(tg,['정인','편인'])*14)},{label:'추진력',value:clamp(tgVal(tg,['편관','겁재'])*14)},{label:'창업기질',value:clamp(tgVal(tg,['편재','상관'])*14)},{label:'협상력',value:clamp(tgVal(tg,['정재','식신'])*13)}]}
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
