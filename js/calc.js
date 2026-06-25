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
  const wolju=saju.pillars?.month||'';
  const dayEl=ELEM_MAP[dp.stem]||'';
  const dayBrEl=ELEM_MAP[dp.branch]||'';
  const monBrEl=ELEM_MAP[mp.branch]||'';
  // 십성 그룹
  const bg=tgVal(tg,['비견','겁재']),ss=tgVal(tg,['식신','상관']),
        js=tgVal(tg,['정재','편재']),gs=tgVal(tg,['정관','편관']),
        ins=tgVal(tg,['정인','편인']);
  // 신강/신약
  const strength=saju.advanced?.dayStrength||'';
  const isStrong=strength.includes('강')||bg>=3;

  // ① 일간 핵심 기질
  const STEM_TRAIT={
    '갑':'큰 나무(甲木)의 기운을 타고나 곧고 진취적인 기상이 있다. 성장과 확장에 대한 욕구가 강하며, 리더로서의 면모가 자연스럽다.',
    '을':'풀과 꽃(乙木)의 유연함을 지녀 적응력이 뛰어나고 섬세하다. 겉으로는 부드럽지만 내면에 질긴 생명력이 있어 위기에서 오히려 강해진다.',
    '병':'태양(丙火)의 에너지를 품어 밝고 화려하며 열정적이다. 주변을 환하게 비추는 존재감이 있으나, 에너지를 과하게 쏟아 스스로 지치기도 한다.',
    '정':'촛불(丁火)처럼 은은하고 따뜻하며, 어둠 속에서 빛을 밝히는 사람이다. 섬세한 감성과 배려심이 깊고, 한 사람에게 깊이 집중하는 성향이 있다.',
    '무':'큰 산(戊土)의 기운으로 묵직하고 포용력이 넓다. 넉넉한 마음으로 사람을 품으며, 흔들림 없는 안정감을 주는 존재이다.',
    '기':'비옥한 논밭(己土)처럼 풍요롭고 세심하다. 실용적이고 현실 감각이 뛰어나며, 작은 것도 허투루 하지 않는 알뜰함이 있다.',
    '경':'바위와 강철(庚金)의 단단함으로 결단력이 있고 의리를 중시한다. 불의를 참지 못하며, 한번 정한 원칙은 끝까지 지키려 한다.',
    '신':'보석(辛金)처럼 정교하고 예리하며, 미적 감각이 탁월하다. 겉은 차갑게 보이나 내면은 여리고 감성적이며, 완벽을 추구한다.',
    '임':'큰 강과 바다(壬水)의 기운으로 넓고 자유롭다. 지혜와 포용력으로 사람을 끌어당기며, 어디에든 흘러가 적응하는 유연함이 있다.',
    '계':'맑은 이슬과 빗물(癸水)처럼 깨끗하고 섬세하다. 직관과 영감이 풍부하여 보이지 않는 것을 느끼며, 조용히 스며드는 힘이 있다.'
  };

  // ② 월지 계절 영향
  const SEASON={'인':'봄의 생기를 받아 성장 에너지가 넘치고 새로운 시작에 강하다','묘':'한창 피어나는 봄기운으로 예술적 감각과 부드러운 매력이 있다','진':'봄과 여름 사이 환절기의 기운으로 변화에 적응하는 유연함이 있다',
    '사':'초여름의 뜨거운 열기로 정열적이고 행동력이 빠르다','오':'한여름 태양처럼 가장 왕성한 에너지를 지녀 카리스마가 강하다','미':'여름 끝자락의 기운으로 풍성한 결실을 향한 노력가이다',
    '신':'가을의 서늘한 금기운으로 판단력이 날카롭고 결단력이 있다','유':'가을 한가운데의 기운으로 정교한 미적 감각과 날카로운 통찰이 있다','술':'가을과 겨울 사이 기운으로 깊은 사색과 정리 능력이 뛰어나다',
    '해':'초겨울의 수기운으로 지혜롭고 내면이 깊으며 사색적이다','자':'한겨울 깊은 밤의 기운으로 직관이 강하고 잠재력이 큰 사람이다','축':'겨울 끝자락의 기운으로 인내심이 강하고 묵묵히 준비하는 힘이 있다'};

  // ③ 일간-일지 관계 (생극)
  const REL_MAP={'목':{'목':'비화','화':'설기','토':'극','금':'극받음','수':'생받음'},'화':{'화':'비화','토':'설기','금':'극','수':'극받음','목':'생받음'},'토':{'토':'비화','금':'설기','수':'극','목':'극받음','화':'생받음'},'금':{'금':'비화','수':'설기','목':'극','화':'극받음','토':'생받음'},'수':{'수':'비화','목':'설기','토':'극','금':'극받음','화':'생받음'}};  // 일간el→일지el→관계
  const REL_DESC={'생받음':'일지가 일간을 생해주어 내면에 든든한 뿌리가 있다. 자기 확신이 강하고 심리적으로 안정된 편이다.',
    '설기':'일간의 에너지가 일지로 빠져나가 표현력과 활동성이 강하지만, 체력 소모가 클 수 있다.',
    '극':'일간이 일지를 제어하려 하여 내면의 욕구를 억누르거나 자기 통제가 강한 편이다.',
    '극받음':'일지가 일간을 극하여 내면에 긴장감이 있고, 스스로를 채찍질하는 성향이 있다. 역경에서 더 강해지는 타입이다.',
    '비화':'일간과 일지가 같은 기운이라 자기 색깔이 확실하고 일관성이 있으나, 한쪽으로 치우칠 수 있다.'};

  // ═══ 합충 우선순위 엔진 ═══
  // 규칙: ①인접(월일·일시) > 원격(년일·년시)  ②삼합/방합 > 육합  ③합해충(合解沖): 같은 글자에 합+충 동시 → 인접합이면 충 약화  ④형은 독립 작용
  function parseRelations(br){
    const descs=[];
    if(!br)return descs;
    // 인접 여부 판별: 년0 월1 일2 시3
    const posMap={'년':0,'월':1,'일':2,'시':3};
    function isAdjacent(k){const ps=k.split('').filter(c=>posMap[c]!==undefined).map(c=>posMap[c]);return ps.length===2&&Math.abs(ps[0]-ps[1])===1;}
    // 합에 참여하는 위치 글자 수집
    const hapPositions=new Set();
    ['육합','삼합','방합','반합'].forEach(type=>{
      if(br[type]) Object.keys(br[type]).forEach(k=>k.split('').forEach(c=>{if(posMap[c]!==undefined)hapPositions.add(c);}));
    });

    // ── 삼합/방합 (최우선) ──
    if(br['삼합']){
      Object.values(br['삼합']).forEach(v=>{
        descs.push(`원국에 ${v}이 성립하여 해당 오행의 에너지가 압도적으로 강하다. 삼합은 사주에서 가장 강력한 합으로, 인생의 방향성을 크게 좌우한다.`);
      });
    }
    if(br['방합']){
      Object.values(br['방합']).forEach(v=>{
        descs.push(`원국에 ${v}이 형성되어 계절의 기운이 한 방향으로 집중된다. 해당 오행의 성향이 성격 전반에 깊이 배어있다.`);
      });
    }

    // ── 육합 (인접 우선) ──
    if(br['육합']){
      const keys=Object.keys(br['육합']);
      // 인접합 먼저
      const adjacent=keys.filter(isAdjacent).sort();
      const remote=keys.filter(k=>!isAdjacent(k));
      adjacent.forEach(k=>{
        const v=br['육합'][k];
        if(k==='월일'||k==='일월') descs.push(`월지와 일지가 ${v}으로 나의 내면과 사회적 환경이 자연스럽게 조화된다. 직장·사회에서 본래 모습대로 살기 수월하며, 대인관계가 원만하다.`);
        else if(k==='일시'||k==='시일') descs.push(`일지와 시지가 ${v}으로 말년이 안정적이며, 나의 행동과 결과가 잘 맞물린다. 자녀와의 유대가 깊고 노후가 편안한 구조이다.`);
        else if(k==='년월'||k==='월년') descs.push(`년지와 월지가 ${v}으로 가문의 기운과 사회 환경이 조화롭다. 부모·조상의 덕이 있는 편이다.`);
      });
      remote.forEach(k=>{
        descs.push(`${k.split('').join('지와 ')}지가 합이나 떨어져 있어 직접적 체감은 약하지만, 은근한 조화의 힘이 작용한다.`);
      });
    }

    // ── 충 (합해충 체크 후 처리) ──
    if(br['충']){
      const keys=Object.keys(br['충']);
      keys.forEach(k=>{
        const v=br['충'][k];
        // 합해충 체크: 충에 관련된 위치가 이미 인접합에 참여하면 → 충이 약화
        const positions=k.split('').filter(c=>posMap[c]!==undefined);
        const resolvedByHap=positions.some(p=>hapPositions.has(p))&&br['육합'];
        const adj=isAdjacent(k);

        if(resolvedByHap&&adj){
          // 합과 충이 동시 → 합이 충을 약화시킴
          descs.push(`${k.split('').join('지와 ')}지에 ${v}이 있으나, 합(合)의 힘이 충돌을 완화시킨다. 갈등은 있지만 극단으로 치닫지 않고 조율이 가능한 구조이다.`);
        } else if(adj){
          // 인접충 (강한 체감)
          if(k.includes('일')&&k.includes('월')) descs.push(`일지와 월지가 ${v}으로 내면의 자아와 사회적 역할 사이에 강한 긴장이 있다. 겉과 속이 다르다는 평을 듣기 쉽지만, 이 에너지를 잘 활용하면 두 가지 얼굴을 가진 다재다능한 사람이 된다.`);
          else if(k.includes('일')&&k.includes('시')) descs.push(`일지와 시지가 ${v}으로 행동과 결과 사이에 변동이 크다. 말년에 큰 전환점이 올 수 있으며, 변화 속에서 새로운 길을 찾는 힘이 있다.`);
          else if(k.includes('년')&&k.includes('월')) descs.push(`년지와 월지가 ${v}으로 성장 환경에서의 변화·갈등이 초년 성격 형성에 영향을 미쳤다.`);
        } else {
          // 원격충 (약한 체감)
          if(k.includes('일')&&k.includes('년')) descs.push(`일지와 년지가 원거리 ${v}으로 직접적 체감은 크지 않으나, 뿌리(가문)와 다른 길을 걷는 독립적 성향이 있다.`);
          else if(k.includes('년')&&k.includes('시')) descs.push(`년지와 시지가 ${v}으로 시작과 끝이 크게 달라지는 인생 구조이다.`);
          else descs.push(`${k.split('').join('지와 ')}지가 ${v}이나 떨어져 있어 은근한 긴장으로 작용한다.`);
        }
      });
    }

    // ── 형 (합/충과 독립 작용) ──
    if(br['형']){
      Object.entries(br['형']).forEach(([k,v])=>{
        if(v.includes('寅')&&v.includes('巳')||v.includes('巳')&&v.includes('申')||v.includes('寅')&&v.includes('申'))
          descs.push(`${v}: 무례지형(無禮之刑)으로 내면에 강한 추진력과 충돌이 공존한다. 행동이 앞서는 편이며, 이 에너지를 법률·수사·의료·군사 분야에서 발휘하면 탁월하다.`);
        else if(v.includes('丑')&&v.includes('戌')||v.includes('戌')&&v.includes('未')||v.includes('丑')&&v.includes('未'))
          descs.push(`${v}: 지세지형(恃勢之刑)으로 권력이나 세력에 대한 집착과 갈등이 있다. 자기 영역을 지키려는 힘이 강하며, 조직 내 정치에 능할 수 있다.`);
        else if(v.includes('子')&&v.includes('卯'))
          descs.push(`${v}: 무은지형(無恩之刑)으로 은혜를 베풀어도 되돌아오지 않는 경험이 있다. 그러나 이 시련이 독립심과 자기 신뢰를 키우는 계기가 된다.`);
        else if(v.includes('자형'))
          descs.push(`${v}: 같은 기운끼리 부딪히는 자형(自刑)으로 스스로를 괴롭히는 성향이 있다. 자기 성찰이 깊은 만큼 내면의 평화를 찾는 수양이 필요하다.`);
      });
    }

    // 반합
    if(br['반합']){
      Object.values(br['반합']).forEach(v=>{
        descs.push(`${v}의 기운이 부분적으로 형성되어, 완전하지는 않지만 해당 오행의 영향이 은근히 작용한다.`);
      });
    }
    return descs;
  }

  // ⑤ 오행 외형
  const OH_BODY={
    '목':{high:'키가 큰 편이며 날씬하고 수려한 인상이다. 이마가 넓고 손가락이 긴 편이며, 자세가 곧다.',low:'근육이 뻣뻣하고 간·담 계통의 관리가 필요하다.'},
    '화':{high:'눈이 밝고 반짝이며 인상이 화사하다. 혈색이 좋고 이목구비가 뚜렷하며, 웃을 때 매력이 돋보인다.',low:'심장·혈압 관리가 필요하고 열이 많아 피부 트러블에 주의해야 한다.'},
    '토':{high:'체형이 넉넉하고 풍만한 편이며 안정감 있는 인상을 준다. 특히 배 주위로 살이 붙기 쉬운 체질이다. 단것을 좋아하면 체중 관리에 신경 써야 한다.',low:'소화기가 예민하고 위장 건강에 신경 써야 한다.'},
    '금':{high:'피부가 맑고 하얀 편이며 단정하고 예리한 인상이다. 광대뼈가 있고 턱선이 뚜렷하며, 차가운 도시적 매력이 있다.',low:'호흡기·피부 건조에 주의하고, 금속 알레르기가 있을 수 있다.'},
    '수':{high:'부드럽고 지적인 인상이며 둥글고 친근한 얼굴형이 많다. 눈에 수기(水氣)가 있어 촉촉한 눈매가 특징이다.',low:'신장·방광 계통이 약할 수 있고 하체가 차가운 냉한 체질이다.'}
  };

  // ⑥ 십성 패턴 (더 다양한 문장)
  const patterns=[];
  if(bg>=3) patterns.push('비겁(比劫)이 왕성하여 자기 주관이 뚜렷하고 독립심이 매우 강하다. 남에게 의지하지 않으려 하며, 체력이 좋고 활동적이지만 고집이 세다는 평을 듣기도 한다. 형제·동료와의 경쟁 의식이 있을 수 있다.');
  else if(bg>=2) patterns.push('비겁이 적당하여 자기만의 색깔이 분명하고 주체적인 삶을 산다.');
  if(ss>=3) patterns.push('식상(食傷)이 풍부하여 표현력과 감각이 뛰어나다. 맛있는 것과 아름다운 것에 대한 욕구가 강하며, 예술·창작·요리 등에서 재능을 보인다. 입이 즐거워야 마음이 편한 사람이지만, 말이 많아 구설에 주의가 필요하다.');
  else if(ss>=2) patterns.push('식상이 적당하여 감각이 발달하고 자기표현에 능하며 사교적이다.');
  if(js>=3) patterns.push('재성(財星)이 강하여 재물에 대한 감각이 예리하고 돈을 잘 모은다. 티끌 모아 태산처럼 알뜰하게 재산을 불리지만, 한번씩 팔랑귀가 되어 큰돈을 잃을 위험이 있으므로 자기 가치에 투자하거나 묶어두는 것이 현명하다.');
  else if(js>=2) patterns.push('재성이 적당하여 현실 감각이 좋고 재물 관리 능력이 있다.');
  if(gs>=3) patterns.push('관성(官星)이 강하여 책임감과 자기 규율이 높다. 사회적 체면과 질서를 중시하며 조직에서 인정받지만, 스트레스를 내면에 쌓아두는 성향이 있어 적절한 해소가 필요하다.');
  else if(gs>=2) patterns.push('관성이 적당하여 원칙적이고 성실하며 맡은 역할에 충실하다.');
  if(ins>=3) patterns.push('인성(印星)이 풍부하여 사색과 학습을 즐기고 지적 호기심이 깊다. 혼자만의 시간이 반드시 필요하며, 생각이 많아 결정이 느려지는 면이 있다. 다만 이 깊은 내면이 지혜와 통찰로 이어진다.');
  else if(ins>=2) patterns.push('인성이 적당하여 배움에 열정이 있고 깊이 있는 사고를 한다.');

  // 신강/신약
  if(isStrong) patterns.push('신강(身強) 사주로 자기 에너지가 충분하여 주도적으로 인생을 이끌어간다. 재성·관성·식상을 활용하여 에너지를 밖으로 쏟을 때 빛난다.');
  else if(strength.includes('약')) patterns.push('신약(身弱) 사주로 인성·비겁의 도움이 필요하다. 혼자 무리하기보다 좋은 환경과 지원 속에서 능력을 극대화하는 전략이 효과적이다.');

  // ── 문장 조합 ──
  let text='';
  text+=`${ilju}일주는 ${STEM_TRAIT[dp.stem]||''} `;
  // 월지 계절
  if(mp.branch&&SEASON[mp.branch]) text+=`${wolju}월에 태어나 ${SEASON[mp.branch]}. `;
  // 오행 외형
  const ohArr=Object.entries(oh).sort((a,b)=>b[1]-a[1]);
  const topOh=ohArr[0];
  if(topOh&&topOh[1]>=2&&OH_BODY[topOh[0]]) text+=`외형적으로 ${topOh[0]}(${({목:'木',화:'火',토:'土',금:'金',수:'水'})[topOh[0]]||''})기운이 강하여 ${OH_BODY[topOh[0]].high} `;
  // 일간-일지 관계
  if(dayEl&&dayBrEl&&REL_MAP[dayEl]){
    const rel=REL_MAP[dayEl][dayBrEl];
    if(rel&&REL_DESC[rel]) text+=REL_DESC[rel]+' ';
  }
  // 십성 패턴
  if(patterns.length) text+=patterns.join(' ');
  // 합충
  const relDescs=parseRelations(saju.branchRelations);
  if(relDescs.length) text+=' '+relDescs.join(' ');
  // 오행 부족 건강
  const lowOh=ohArr.filter(e=>e[1]===0);
  if(lowOh.length){
    const ws=lowOh.map(e=>OH_BODY[e[0]]?.low).filter(Boolean);
    if(ws.length) text+=` 건강면에서 ${lowOh.map(e=>e[0]).join('·')}이(가) 부족하여 ${ws[0]}`;
  }

  // ── 태그 수집 ──
  const tags=[];
  if(oh['목']>=2) tags.push('수려한 인상','바른 자세','날씬한 체형');
  if(oh['화']>=2) tags.push('밝은 눈매','화사한 혈색','뚜렷한 이목구비');
  if(oh['토']>=2) tags.push('풍만한 체형','넉넉한 인상','안정감');
  if(oh['금']>=2) tags.push('단정한 외모','맑은 피부','예리한 인상');
  if(oh['수']>=2) tags.push('부드러운 인상','촉촉한 눈매','둥근 얼굴');
  if(bg>=2) tags.push('탄탄한 체격','활동적');
  if(ss>=2) tags.push('감각적 스타일','세련된 패션감각');
  if(js>=2) tags.push('깔끔한 차림','실용적 매력');
  if(gs>=2) tags.push('단정한 분위기','위엄있는 눈매');
  if(ins>=2) tags.push('지적인 분위기','차분한 인상');
  if(isStrong) tags.push('강한 존재감');
  return {text:text.trim(),tags};
}
