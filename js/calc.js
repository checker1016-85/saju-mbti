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
  const str=r.advanced?.dayStrength?.score||50;
  const B=15; // base value
  const clamp=(v)=>Math.round(Math.max(5,Math.min(100,v))*10)/10;
  const sc=(names,mult,bonus)=>clamp(B+tgVal(tg,names)*mult+(bonus||0));
  const C1='#2E8B57', C2='#3D6BA3', C3='#7B4EA3';
  return {
    '체력·멘탈':{color:C1,group:'내면·기질',axes:[{label:'체력',value:sc(['비견','겁재'],18,str*.3)},{label:'멘탈력',value:sc(['편인','정인'],18,str*.2)},{label:'회복력',value:sc(['식신','상관'],16,tgVal(tg,['정인'])*8)},{label:'인내력',value:sc(['편관','정관'],14,tgVal(tg,['정재'])*10)},{label:'스트레스\n내성',value:clamp(B+str*.5+tgVal(tg,['비견'])*14)}]},
    '의지·결단':{color:C1,group:'내면·기질',axes:[{label:'결단력',value:sc(['편관'],20,tgVal(tg,['겁재'])*12)},{label:'독립심',value:sc(['비견'],18,tgVal(tg,['겁재'])*12+tgVal(tg,['편인'])*6)},{label:'인내심',value:sc(['정관'],16,tgVal(tg,['정재'])*14)},{label:'책임감',value:sc(['정관'],18,tgVal(tg,['정인'])*10)},{label:'의지력',value:sc(['비견'],16,tgVal(tg,['편관'])*12+str*.3)}]},
    '통찰·집중':{color:C1,group:'내면·기질',axes:[{label:'직관력',value:sc(['편인'],20,tgVal(tg,['상관'])*12)},{label:'통찰력',value:sc(['편인'],16,tgVal(tg,['정인'])*12+tgVal(tg,['편관'])*6)},{label:'집중력',value:sc(['정인'],18,tgVal(tg,['정관'])*12)},{label:'판단력',value:sc(['정관'],16,tgVal(tg,['편인'])*12)},{label:'관찰력',value:sc(['편인'],14,tgVal(tg,['식신'])*12+tgVal(tg,['정재'])*6)}]},
    '사회성':{color:C2,group:'능력·사회',axes:[{label:'리더십',value:sc(['편관','정관'],18)},{label:'소통력',value:sc(['식신','상관'],18)},{label:'협업력',value:sc(['비견'],20,tgVal(tg,['정관'])*10)},{label:'매력',value:sc(['편재','정재'],14,tgVal(tg,['상관'])*10)},{label:'공감력',value:sc(['정인'],16,tgVal(tg,['식신'])*12)}]},
    '재능·두뇌':{color:C2,group:'능력·사회',axes:[{label:'창의력',value:sc(['상관'],22,tgVal(tg,['식신'])*12)},{label:'분석력',value:sc(['정인'],18,tgVal(tg,['편인'])*12)},{label:'실행력',value:sc(['비견','겁재'],14,tgVal(tg,['편관'])*12)},{label:'전략력',value:sc(['정관'],14,tgVal(tg,['정인'])*14)},{label:'직관력',value:sc(['편인'],20,tgVal(tg,['상관'])*12)}]},
    '직업·사회':{color:C2,group:'능력·사회',axes:[{label:'조직력',value:sc(['정관'],18,tgVal(tg,['정재'])*10)},{label:'전문성',value:sc(['정인','편인'],16)},{label:'추진력',value:sc(['편관','겁재'],16)},{label:'창업기질',value:sc(['편재','상관'],16)},{label:'협상력',value:sc(['정재','식신'],15)}]},
    '감성·관계':{color:C3,group:'감성·재물',axes:[{label:'관계운',value:sc(['정재'],16,tgVal(tg,['식신'])*12+tgVal(tg,['정관'])*6)},{label:'배려심',value:sc(['정인'],16,tgVal(tg,['식신'])*12)},{label:'감수성',value:sc(['상관'],20,tgVal(tg,['정인'])*10)},{label:'표현력',value:sc(['상관'],16,tgVal(tg,['식신'])*14)},{label:'포용력',value:sc(['비견'],12,tgVal(tg,['정인'])*14+tgVal(tg,['식신'])*6)}]},
    '관계·연애':{color:C3,group:'감성·재물',axes:[{label:'애정표현',value:sc(['정재','편재'],16,tgVal(tg,['상관'])*10)},{label:'헌신도',value:sc(['정재'],20,tgVal(tg,['정인'])*10)},{label:'매력',value:sc(['상관'],16,tgVal(tg,['편재'])*12)},{label:'안정성',value:sc(['정관','정재'],14)},{label:'자유추구',value:sc(['겁재','상관'],14)}]},
    '재물·야망':{color:C3,group:'감성·재물',axes:[{label:'수익감각',value:sc(['정재'],22,tgVal(tg,['편재'])*10)},{label:'투자감각',value:sc(['편재'],22,tgVal(tg,['정재'])*8)},{label:'야망',value:sc(['편관'],18,tgVal(tg,['겁재'])*10)},{label:'안정추구',value:sc(['정관'],16,tgVal(tg,['정재'])*14)},{label:'모험도',value:sc(['겁재'],16,tgVal(tg,['편재'])*14)}]}
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

// ═══ 페르소나 템플릿 조합 엔진 ═══
function buildPersona(saju,tg){
  if(!saju||!tg)return{text:'',tags:[]};
  const oh=getOh(saju);
  const dp=saju.pillarDetails?.day||{};
  const mp=saju.pillarDetails?.month||{};
  const ilju=saju.pillars?.day||'';
  const dayEl=ELEM_MAP[dp.stem]||'';
  // 십성 그룹 합산
  const bg=tgVal(tg,['비견','겁재']),ss=tgVal(tg,['식신','상관']),
        js=tgVal(tg,['정재','편재']),gs=tgVal(tg,['정관','편관']),
        ins=tgVal(tg,['정인','편인']);
  const total=bg+ss+js+gs+ins||1;
  // 일간별 핵심 기질
  const STEM_TRAIT={
    '갑':'큰 나무처럼 곧고 진취적인 기상이 있으며, 리더십과 성장에 대한 의지가 강하다.',
    '을':'유연한 풀과 꽃처럼 적응력이 뛰어나고, 섬세하면서도 질긴 생명력이 있다.',
    '병':'태양처럼 밝고 화려하며, 열정과 에너지로 주변을 환하게 비춘다.',
    '정':'촛불처럼 은은하고 따뜻하며, 섬세한 감성과 배려심이 깊다.',
    '무':'큰 산처럼 묵직하고 포용력이 넓으며, 안정감 있는 존재감을 지닌다.',
    '기':'비옥한 땅처럼 풍요롭고 세심하며, 실용적이고 현실 감각이 뛰어나다.',
    '경':'바위와 쇠처럼 단단하고 결단력이 있으며, 의리와 원칙을 중시한다.',
    '신':'보석처럼 정교하고 예리하며, 미적 감각과 분석력이 탁월하다.',
    '임':'큰 강물처럼 넓고 자유로우며, 지혜와 포용력으로 흐름을 만든다.',
    '계':'맑은 이슬처럼 깨끗하고 섬세하며, 직관과 영감이 풍부하다.'
  };
  // 오행별 외형·체질
  const OH_BODY={
    '목':{high:'키가 큰 편이며 날씬하고 수려한 인상이다. 손발이 길고 자세가 바르다.',low:'유연성이 부족하고 근육이 뻣뻣해질 수 있다.'},
    '화':{high:'눈이 밝고 인상이 화사하며 활기찬 에너지가 느껴진다. 혈색이 좋고 이목구비가 뚜렷하다.',low:'안색이 칙칙해지기 쉽고 심장·혈압 관리가 필요하다.'},
    '토':{high:'체형이 넉넉하고 풍만한 편이며, 안정감 있는 인상을 준다. 배 주위에 살이 붙기 쉬운 체질이다.',low:'소화기가 약하고 피부 트러블이 생기기 쉽다.'},
    '금':{high:'피부가 맑고 단정한 인상이며, 예리하고 선이 뚜렷한 이목구비를 가졌다.',low:'호흡기가 약해질 수 있고 피부가 건조해지기 쉽다.'},
    '수':{high:'부드럽고 지적인 인상이며, 둥글고 친근한 얼굴형이 많다. 통통한 체형이 되기 쉽다.',low:'신장·방광 계통이 약할 수 있고 냉한 체질이다.'}
  };
  // 십성 패턴별 성격·재물·관계
  const patterns=[];
  if(bg>=3) patterns.push('자기 주관이 뚜렷하고 독립심이 강해 남에게 의지하지 않으려 한다. 체력이 좋고 활동적이지만, 고집이 세다는 평을 듣기도 한다.');
  else if(bg>=2) patterns.push('자기만의 색깔이 분명하고 주체적인 삶을 추구한다.');
  if(ss>=3) patterns.push('표현력과 감각이 뛰어나 예술·창작·요리 등에 재능을 보인다. 맛있는 것과 아름다운 것에 대한 욕구가 강하며, 입이 즐거워야 마음이 편한 사람이다.');
  else if(ss>=2) patterns.push('감각이 발달하여 미적 분야에 관심이 많고, 자기표현에 능하다.');
  if(js>=3) patterns.push('재물에 대한 감각이 예리하여 돈을 잘 모으지만, 때로 과한 소비 충동에 흔들릴 수 있다. 현실적이고 알뜰하나 한번씩 큰 지출로 후회하는 패턴을 조심해야 한다.');
  else if(js>=2) patterns.push('현실 감각이 좋고 재물을 관리하는 능력이 있다.');
  if(gs>=3) patterns.push('책임감과 자기 규율이 강하며, 사회적 체면과 질서를 중시한다. 다만 스트레스를 내면에 쌓아두는 경향이 있어 적절한 해소가 필요하다.');
  else if(gs>=2) patterns.push('원칙적이고 성실하며, 맡은 역할에 충실한 사람이다.');
  if(ins>=3) patterns.push('사색과 학습을 즐기며 지적 호기심이 깊다. 혼자만의 시간이 반드시 필요하고, 생각이 많아 행동이 느려질 수 있다.');
  else if(ins>=2) patterns.push('배움에 대한 열정이 있고 깊이 있는 사고를 한다.');
  // 오행 과다/부족 분석
  const ohArr=Object.entries(oh).sort((a,b)=>b[1]-a[1]);
  const topOh=ohArr[0], lowOh=ohArr.filter(e=>e[1]===0);
  let bodyDesc='';
  if(topOh&&topOh[1]>=3&&OH_BODY[topOh[0]]) bodyDesc=OH_BODY[topOh[0]].high;
  else if(topOh&&topOh[1]>=2&&OH_BODY[topOh[0]]) bodyDesc=OH_BODY[topOh[0]].high;
  let weakDesc='';
  if(lowOh.length>0){
    const ws=lowOh.map(e=>OH_BODY[e[0]]?.low).filter(Boolean);
    if(ws.length) weakDesc=ws[0];
  }
  // 문장 조합
  let text='';
  const stemTrait=STEM_TRAIT[dp.stem]||'';
  text+=`${ilju}일주는 ${stemTrait} `;
  if(bodyDesc) text+=bodyDesc+' ';
  if(patterns.length) text+=patterns.join(' ');
  if(weakDesc) text+=` 다만 건강 측면에서 ${weakDesc}`;
  // 외형 태그 수집
  const tags=[];
  // 오행 기반 태그
  if(oh['목']>=2) tags.push('수려한 인상','바른 자세');
  if(oh['화']>=2) tags.push('밝은 눈매','화사한 혈색');
  if(oh['토']>=2) tags.push('풍만한 체형','넉넉한 인상');
  if(oh['금']>=2) tags.push('단정한 외모','맑은 피부');
  if(oh['수']>=2) tags.push('부드러운 인상','둥근 얼굴형');
  // 십성 기반 태그
  if(bg>=2) tags.push('탄탄한 체격','활동적');
  if(ss>=2) tags.push('감각적 스타일','표현력 풍부');
  if(js>=2) tags.push('깔끔한 차림','실용적 패션');
  if(gs>=2) tags.push('단정한 분위기','위엄있는 인상');
  if(ins>=2) tags.push('지적인 분위기','차분한 눈매');
  return {text:text.trim(),tags};
}
