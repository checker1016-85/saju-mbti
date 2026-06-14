// ═══ 공용: 4종 시각화 200px 통일 ═══
const VIZ_SIZE=200;

// 방사형 (성향 프로필용) — 반시계 방향, 라벨에 퍼센트 포함
function radarSVG(axes, color, size = 200) {
  const cx=size/2,cy=size/2,r=size/2-36,n=axes.length;
  const ang=(i)=>-Math.PI/2-2*Math.PI*i/n; // 반시계
  const pt=(i,v)=>[(cx+r*(v/100)*Math.cos(ang(i))).toFixed(1),(cy+r*(v/100)*Math.sin(ang(i))).toFixed(1)];
  let svg=`<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
  [25,50,75,100].forEach(lv=>{let pts='';for(let i=0;i<n;i++){const[x,y]=pt(i,lv);pts+=`${x},${y} `;}svg+=`<polygon points="${pts}" fill="none" stroke="#d4cfc4" stroke-width=".5"/>`;});
  for(let i=0;i<n;i++){const[x,y]=pt(i,100);svg+=`<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#d4cfc4" stroke-width=".5"/>`;}
  let dpts='';axes.forEach((a,i)=>{const[x,y]=pt(i,a.value);dpts+=`${x},${y} `;});
  svg+=`<polygon points="${dpts}" fill="${color}25" stroke="${color}" stroke-width="2"/>`;
  axes.forEach((a,i)=>{const[x,y]=pt(i,a.value);svg+=`<circle cx="${x}" cy="${y}" r="3" fill="${color}"/>`;});
  // 라벨: 텍스트(퍼센트) — 잘림 방지 여백 확보
  axes.forEach((a,i)=>{
    const[lx,ly]=pt(i,128);
    const labelText=a.label.replace('\n',' ')+'('+a.value+'%)';
    svg+=`<text x="${lx}" y="${(+ly)+3}" text-anchor="middle" fill="#5a5348" font-size="9" font-weight="700" font-family="Noto Sans KR">${labelText}</text>`;
  });
  svg+='</svg>';return svg;
}

// ═══ ① 사주: 오행 도넛 + 중앙 "오행 십성 / 격국" + 범례 ═══
function sajuVizSVG(oh, centerTop, centerBot, size=VIZ_SIZE){
  const ELEM_C={목:'#2e8b40',화:'#c83030',토:'#d4a82a',금:'#707088',수:'#3060a0'};
  const total=Object.values(oh).reduce((a,b)=>a+b,0)||1;
  const cx=size/2,cy=size/2,rOut=size/2-10,rIn=size/2-38;
  let ang=-Math.PI/2,svg=`<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
  for(const[e,c]of Object.entries(oh)){
    if(c<=0)continue;
    const a2=ang+2*Math.PI*c/total;
    const x1=cx+rOut*Math.cos(ang),y1=cy+rOut*Math.sin(ang);
    const x2=cx+rOut*Math.cos(a2),y2=cy+rOut*Math.sin(a2);
    const xi2=cx+rIn*Math.cos(a2),yi2=cy+rIn*Math.sin(a2);
    const xi1=cx+rIn*Math.cos(ang),yi1=cy+rIn*Math.sin(ang);
    const large=(a2-ang)>Math.PI?1:0;
    svg+=`<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${rOut} ${rOut} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L${xi2.toFixed(1)} ${yi2.toFixed(1)} A${rIn} ${rIn} 0 ${large} 0 ${xi1.toFixed(1)} ${yi1.toFixed(1)} Z" fill="${ELEM_C[e]}" opacity="0.88"/>`;
    const mid=(ang+a2)/2,lr=(rOut+rIn)/2;
    svg+=`<text x="${(cx+lr*Math.cos(mid)).toFixed(1)}" y="${(cy+lr*Math.sin(mid)+4).toFixed(1)}" text-anchor="middle" fill="#fff" font-size="13" font-weight="800" font-family="Noto Sans KR">${e}${c}</text>`;
    ang=a2;
  }
  // 중앙: 예) "수 비겁" / "건록격"
  svg+=`<text x="${cx}" y="${cy-6}" text-anchor="middle" fill="#2a2520" font-size="16" font-weight="900" font-family="Noto Sans KR">${centerTop||''}</text>`;
  svg+=`<text x="${cx}" y="${cy+14}" text-anchor="middle" fill="#8a6508" font-size="13" font-weight="800" font-family="Noto Sans KR">${centerBot||''}</text>`;
  svg+='</svg>';
  // 범례
  let legend='<div class="viz-legend">';
  for(const[e,c]of Object.entries(oh)){legend+=`<span><i style="background:${ELEM_C[e]}"></i>${e}(${c})</span>`;}
  legend+='</div>';
  return svg+legend;
}

// ═══ ② 점성: 차트형 휠 (12하우스 + ASC/MC 축 + ☉☽ 마커) + 중앙 상승궁 ═══
function astroChartSVG(h, size=VIZ_SIZE){
  const cx=size/2,cy=size/2,rZod=size/2-6,rZodIn=size/2-26,rHouse=size/2-26,rHouseIn=size/2-58;
  const signs=['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
  const ELEM_SC={aries:'#c83030',leo:'#c83030',sagittarius:'#c83030',taurus:'#d4a82a',virgo:'#d4a82a',capricorn:'#d4a82a',gemini:'#40c0a0',libra:'#40c0a0',aquarius:'#40c0a0',cancer:'#3060a0',scorpio:'#3060a0',pisces:'#3060a0'};
  // ASC 도수 기준 회전: ASC가 9시 방향(왼쪽)에 오도록
  const ascDeg=h.Ascendant.ChartPosition.Ecliptic.DecimalDegrees;
  const toAngle=(eclDeg)=>Math.PI-((eclDeg-ascDeg)*Math.PI/180); // ASC=좌측, 반시계
  let svg=`<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
  // 조디악 링
  signs.forEach((s,i)=>{
    const d1=i*30,d2=(i+1)*30;
    const a1=toAngle(d1),a2=toAngle(d2);
    const x1=cx+rZod*Math.cos(a1),y1=cy-rZod*Math.sin(a1);
    const x2=cx+rZod*Math.cos(a2),y2=cy-rZod*Math.sin(a2);
    const xi2=cx+rZodIn*Math.cos(a2),yi2=cy-rZodIn*Math.sin(a2);
    const xi1=cx+rZodIn*Math.cos(a1),yi1=cy-rZodIn*Math.sin(a1);
    svg+=`<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${rZod} ${rZod} 0 0 0 ${x2.toFixed(1)} ${y2.toFixed(1)} L${xi2.toFixed(1)} ${yi2.toFixed(1)} A${rZodIn} ${rZodIn} 0 0 1 ${xi1.toFixed(1)} ${yi1.toFixed(1)} Z" fill="${ELEM_SC[s]}" opacity="0.3" stroke="#d4cfc4" stroke-width=".5"/>`;
    const mid=toAngle((d1+d2)/2),lr=(rZod+rZodIn)/2;
    svg+=`<text x="${(cx+lr*Math.cos(mid)).toFixed(1)}" y="${(cy-lr*Math.sin(mid)+4).toFixed(1)}" text-anchor="middle" font-size="11">${SIGN_EMOJI[s]}</text>`;
  });
  // 하우스 칸 (whole-sign: 30도씩)
  for(let i=0;i<12;i++){
    const a=toAngle(ascDeg- (ascDeg%30) + i*30 - ascDeg + ascDeg); // 단순 30도 분할
    const aa=toAngle(i*30+(ascDeg-(ascDeg%30)));
    svg+=`<line x1="${(cx+rHouseIn*Math.cos(aa)).toFixed(1)}" y1="${(cy-rHouseIn*Math.sin(aa)).toFixed(1)}" x2="${(cx+rHouse*Math.cos(aa)).toFixed(1)}" y2="${(cy-rHouse*Math.sin(aa)).toFixed(1)}" stroke="#d4cfc4" stroke-width=".6"/>`;
  }
  svg+=`<circle cx="${cx}" cy="${cy}" r="${rHouseIn}" fill="#fff" stroke="#d4cfc4" stroke-width=".6"/>`;
  // ASC-DC 축 (수평)
  svg+=`<line x1="${cx-rZod}" y1="${cy}" x2="${cx+rZod}" y2="${cy}" stroke="#8a6508" stroke-width="1.4"/>`;
  svg+=`<text x="6" y="${cy-4}" font-size="10" font-weight="800" fill="#8a6508" font-family="Space Grotesk">ASC</text>`;
  // MC 축
  const mcDeg=h.Midheaven.ChartPosition.Ecliptic.DecimalDegrees;
  const mcA=toAngle(mcDeg);
  svg+=`<line x1="${cx}" y1="${cy}" x2="${(cx+rZod*Math.cos(mcA)).toFixed(1)}" y2="${(cy-rZod*Math.sin(mcA)).toFixed(1)}" stroke="#5040a0" stroke-width="1.2" stroke-dasharray="3,2"/>`;
  svg+=`<text x="${(cx+(rZod-14)*Math.cos(mcA)).toFixed(1)}" y="${(cy-(rZod-14)*Math.sin(mcA)).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="800" fill="#5040a0" font-family="Space Grotesk">MC</text>`;
  // 애스펙트 선 (행성 간 연결)
  if(h.Aspects&&h.Aspects.all){
    const ASPECT_C={conjunction:'#999',opposition:'#c83030',trine:'#2e8b40',square:'#d06020',sextile:'#3060a0'};
    const arP=rHouseIn-3;
    const pdeg=(k)=>h.CelestialBodies[k]?h.CelestialBodies[k].ChartPosition.Ecliptic.DecimalDegrees:null;
    h.Aspects.all.slice(0,28).forEach(asp=>{
      const d1=pdeg(asp.point1Key),d2=pdeg(asp.point2Key);
      if(d1==null||d2==null)return;
      const a1=toAngle(d1),a2=toAngle(d2);
      const c=ASPECT_C[asp.aspectKey]||'#ccc';
      svg+=`<line x1="${(cx+arP*Math.cos(a1)).toFixed(1)}" y1="${(cy-arP*Math.sin(a1)).toFixed(1)}" x2="${(cx+arP*Math.cos(a2)).toFixed(1)}" y2="${(cy-arP*Math.sin(a2)).toFixed(1)}" stroke="${c}" stroke-width="0.7" opacity="0.45"/>`;
    });
  }
  // ☉ ☽ 마커
  [['sun','☉','#d4a017'],['moon','☽','#3050a0']].forEach(([b,sym,col])=>{
    const deg=h.CelestialBodies[b].ChartPosition.Ecliptic.DecimalDegrees;
    const a=toAngle(deg),mr=(rHouse+rHouseIn)/2;
    svg+=`<circle cx="${(cx+mr*Math.cos(a)).toFixed(1)}" cy="${(cy-mr*Math.sin(a)).toFixed(1)}" r="9" fill="${col}"/>`;
    svg+=`<text x="${(cx+mr*Math.cos(a)).toFixed(1)}" y="${(cy-mr*Math.sin(a)+4).toFixed(1)}" text-anchor="middle" font-size="11" fill="#fff" font-weight="800">${sym}</text>`;
  });
  // 중앙 상승궁 아이콘만
  const ascKey=h.Ascendant.Sign.key;
  svg+=`<text x="${cx}" y="${cy+5}" text-anchor="middle" font-size="22">${SIGN_EMOJI[ascKey]}</text>`;
  svg+='</svg>';
  let legend='<div class="viz-legend"><span><i style="background:#8a6508"></i>ASC</span><span><i style="background:#5040a0"></i>MC</span><span><i style="background:#d4a017"></i>☉</span><span><i style="background:#3050a0"></i>☽</span></div>';
  return svg+legend;
}

// ═══ ③ 에니어그램: 9각 + 센터호 + 삼각형 라벨(본능/사고/가슴) + 중앙 "N번 센터형" ═══
function enneaStarSVG(main, w1, w2, size=VIZ_SIZE){
  const cx=size/2,cy=size/2,r=size/2-40;
  const CENTER_C={본능:'#c04010',가슴:'#10806a',사고:'#4838a0'};
  const CENTER={8:'본능',9:'본능',1:'본능',2:'가슴',3:'가슴',4:'가슴',5:'사고',6:'사고',7:'사고'};
  const pos={};
  // 9번이 맨 위 (12시 방향), 시계 방향 1→2→…→8
  for(let i=1;i<=9;i++){const a=-Math.PI/2+2*Math.PI*((i%9)/9);pos[i]=[cx+r*Math.cos(a),cy+r*Math.sin(a)];}
  let svg=`<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
  // 센터 호 (외곽 3등분)
  const arcR=size/2-16;
  const arcs=[
    {from:8,to:1,c:'#c04010'},  // 본능 (8,9,1) — 위쪽
    {from:2,to:4,c:'#10806a'},  // 가슴 (2,3,4) — 우하
    {from:5,to:7,c:'#4838a0'}   // 사고 (5,6,7) — 좌하
  ];
  arcs.forEach(arc=>{
    const a1=-Math.PI/2+2*Math.PI*((arc.from-0.5)%9/9);
    const a2=-Math.PI/2+2*Math.PI*((arc.to+0.5)%9/9);
    const x1=cx+arcR*Math.cos(a1),y1=cy+arcR*Math.sin(a1);
    const x2=cx+arcR*Math.cos(a2),y2=cy+arcR*Math.sin(a2);
    const large=(a2-a1+2*Math.PI)%(2*Math.PI)>Math.PI?1:0;
    svg+=`<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${arcR} ${arcR} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="${arc.c}" stroke-width="4" opacity="0.55"/>`;
  });
  // 센터 라벨 — 바깥 테두리(호) 위에 배치
  const lblR=size/2-8;
  const lbls=[
    {label:'본능',angle:-Math.PI/2,c:'#c04010'},                    // 위
    {label:'가슴',angle:-Math.PI/2+2*Math.PI*(3/9),c:'#10806a'},     // 우하
    {label:'사고',angle:-Math.PI/2+2*Math.PI*(6/9),c:'#4838a0'}      // 좌하
  ];
  lbls.forEach(lb=>{
    const lx=cx+lblR*Math.cos(lb.angle),ly=cy+lblR*Math.sin(lb.angle);
    // 텍스트 앵커를 위치에 맞춰 (위=중앙, 우하=중앙, 좌하=중앙) — SVG 경계 안에 들어오게 y 보정
    let yAdj=ly+3;
    if(lb.angle===-Math.PI/2)yAdj=ly+9; // 맨 위는 아래로
    svg+=`<rect x="${(lx-15).toFixed(1)}" y="${(yAdj-10).toFixed(1)}" width="30" height="13" rx="6.5" fill="${lb.c}" opacity="0.9"/>`;
    svg+=`<text x="${lx.toFixed(1)}" y="${(yAdj-0.5).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="900" fill="#fff" font-family="Noto Sans KR">${lb.label}</text>`;
  });
  svg+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#d4cfc4" stroke-width="1"/>`;
  // 날개 방향선
  [[main,w1],[main,w2]].forEach(([a,b])=>{
    svg+=`<line x1="${pos[a][0].toFixed(1)}" y1="${pos[a][1].toFixed(1)}" x2="${pos[b][0].toFixed(1)}" y2="${pos[b][1].toFixed(1)}" stroke="${CENTER_C[CENTER[main]]}" stroke-width="3" opacity="0.75"/>`;
  });
  // 노드
  for(let i=1;i<=9;i++){
    const[x,y]=pos[i];const c=CENTER_C[CENTER[i]];
    let rad=11,sw=1,fill='#fff',tc=c;
    if(i===main){rad=16;fill=c;tc='#fff';sw=2;}
    else if(i===w1||i===w2){rad=13;fill=c+'40';sw=2;}
    svg+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad}" fill="${fill}" stroke="${c}" stroke-width="${sw}"/>`;
    svg+=`<text x="${x.toFixed(1)}" y="${(y+4.5).toFixed(1)}" text-anchor="middle" fill="${tc}" font-size="${i===main?13:11}" font-weight="800" font-family="Space Grotesk">${i}</text>`;
  }
  // 중앙: "N번 센터형"
  const centerName=CENTER[main]||'';
  svg+=`<text x="${cx}" y="${cy-4}" text-anchor="middle" font-size="14" font-weight="900" fill="${CENTER_C[centerName]}" font-family="Space Grotesk">${main}번</text>`;
  svg+=`<text x="${cx}" y="${cy+12}" text-anchor="middle" font-size="11" font-weight="900" fill="#2a2520" font-family="Noto Sans KR">${centerName}형</text>`;
  svg+='</svg>';
  let legend='<div class="viz-legend"><span><i style="background:#c04010"></i>본능(장)</span><span><i style="background:#10806a"></i>가슴(감정)</span><span><i style="background:#4838a0"></i>사고(머리)</span></div>';
  return svg+legend;
}

// ═══ ④ MBTI: 4축 + 양쪽 게이지 동시 표시 ═══
function mbtiBigSVG(axes, selected, size=VIZ_SIZE){
  const pairs=[['E','I','외향','내향'],['S','N','감각','직관'],['T','F','사고','감정'],['J','P','판단','인식']];
  const PC={E:'#d44060',S:'#d4a82a',T:'#18a088',J:'#6050c0'};
  const rowH=46,topPad=12;
  const barH=8;
  let svg=`<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
  pairs.forEach(([a,b,aKr,bKr],i)=>{
    const y=topPad+i*rowH+18;
    const aOn=selected.includes(a);
    const bOn=!aOn;
    const c=PC[a];
    const aPct=axes[a],bPct=axes[b];
    // 영문 라벨 + 한글 서브
    svg+=`<text x="4" y="${y+2}" font-size="16" font-weight="900" fill="${aOn?c:'#b0a898'}" font-family="Space Grotesk">${a}</text>`;
    svg+=`<text x="4" y="${y+13}" font-size="8" fill="${aOn?c:'#b0a898'}" font-family="Noto Sans KR">${aKr}</text>`;
    svg+=`<text x="${size-4}" y="${y+2}" text-anchor="end" font-size="16" font-weight="900" fill="${bOn?c:'#b0a898'}" font-family="Space Grotesk">${b}</text>`;
    svg+=`<text x="${size-4}" y="${y+13}" text-anchor="end" font-size="8" fill="${bOn?c:'#b0a898'}" font-family="Noto Sans KR">${bKr}</text>`;
    const bx=28,bw=size-56,half=bw/2,midX=bx+half;
    // ① 빈 트랙: 짙은 회색 (항상 풀 폭)
    svg+=`<rect x="${bx}" y="${y-barH/2}" width="${bw}" height="${barH}" rx="${barH/2}" fill="#c8c2b4"/>`;
    // ② A쪽 게이지 (중앙→왼쪽), 길이 = aPct%
    const aW=half*aPct/100;
    svg+=`<rect x="${(midX-aW).toFixed(1)}" y="${y-barH/2}" width="${aW.toFixed(1)}" height="${barH}" rx="${barH/2}" fill="${c}" opacity="${aOn?'1':'0.45'}"/>`;
    // ③ B쪽 게이지 (중앙→오른쪽), 길이 = bPct%
    const bW=half*bPct/100;
    svg+=`<rect x="${midX}" y="${y-barH/2}" width="${bW.toFixed(1)}" height="${barH}" rx="${barH/2}" fill="${c}" opacity="${bOn?'1':'0.45'}"/>`;
    // ④ 중앙 기준선
    svg+=`<line x1="${midX}" y1="${y-barH/2-2}" x2="${midX}" y2="${y+barH/2+2}" stroke="#6a6358" stroke-width="1.5"/>`;
    // ⑤ 퍼센트 (양쪽, 우세쪽 강조)
    svg+=`<text x="${midX-4}" y="${y-9}" text-anchor="end" font-size="9" fill="${aOn?c:'#9a9488'}" font-weight="${aOn?'800':'600'}" font-family="Space Grotesk">${aPct}%</text>`;
    svg+=`<text x="${midX+4}" y="${y-9}" text-anchor="start" font-size="9" fill="${bOn?c:'#9a9488'}" font-weight="${bOn?'800':'600'}" font-family="Space Grotesk">${bPct}%</text>`;
  });
  svg+='</svg>';
  let legend='<div class="viz-legend"><span><i style="background:#d44060"></i>E/I</span><span><i style="background:#d4a82a"></i>S/N</span><span><i style="background:#18a088"></i>T/F</span><span><i style="background:#6050c0"></i>J/P</span></div>';
  return svg+legend;
}

// ═══ ⑤ 십성 분포: 5그룹 가로 바 ═══
function tenGodBarSVG(tg, size=VIZ_SIZE){
  const groups=[
    {label:'비겁',keys:['비견','겁재'],color:'#d06020'},
    {label:'식상',keys:['식신','상관'],color:'#d44060'},
    {label:'재성',keys:['편재','정재'],color:'#d4a017'},
    {label:'관성',keys:['편관','정관'],color:'#6050c0'},
    {label:'인성',keys:['편인','정인'],color:'#18a088'}
  ];
  const vals=groups.map(g=>{let s=0;g.keys.forEach(k=>s+=(tg[k]||0));return s;});
  const max=Math.max(...vals,1);
  const rowH=32,topPad=16,barX=48,barW=size-barX-16;
  let svg=`<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
  svg+=`<text x="${size/2}" y="12" text-anchor="middle" font-size="10" font-weight="700" fill="#6a6358" font-family="Noto Sans KR">십성 분포</text>`;
  groups.forEach((g,i)=>{
    const y=topPad+i*rowH+16;
    const w=barW*vals[i]/max;
    svg+=`<text x="${barX-6}" y="${y+5}" text-anchor="end" font-size="11" font-weight="800" fill="${g.color}" font-family="Noto Sans KR">${g.label}</text>`;
    svg+=`<rect x="${barX}" y="${y-7}" width="${barW}" height="16" rx="8" fill="#e6e2d8"/>`;
    if(vals[i]>0)svg+=`<rect x="${barX}" y="${y-7}" width="${w.toFixed(1)}" height="16" rx="8" fill="${g.color}" opacity="0.85"/>`;
    svg+=`<text x="${barX+w+6}" y="${y+4}" font-size="12" font-weight="900" fill="${g.color}" font-family="Space Grotesk">${vals[i]}</text>`;
    // 세부 (비견1 겁재0)
    const detail=g.keys.map(k=>`${k}${tg[k]||0}`).join(' ');
    svg+=`<text x="${barX}" y="${y+14}" font-size="8" fill="#9a9488" font-family="Noto Sans KR">${detail}</text>`;
  });
  svg+='</svg>';
  let legend='<div class="viz-legend"><span><i style="background:#d06020"></i>비겁</span><span><i style="background:#d44060"></i>식상</span><span><i style="background:#d4a017"></i>재성</span><span><i style="background:#6050c0"></i>관성</span><span><i style="background:#18a088"></i>인성</span></div>';
  return svg+legend;
}
function defaultTenGodViz(){
  return tenGodBarSVG({비견:1,겁재:1,식신:1,상관:1,편재:1,정재:1,편관:1,정관:1,편인:1,정인:0});
}

// ═══ 빈 시각화 (조회 전) ═══
function emptyViz(label){
  return `<div class="empty-viz"><span style="font-size:24px">◌</span><span>${label}</span><span style="font-size:10px">조회를 입력하세요</span></div>`;
}

// ═══ 기본형(중립) 시각화 — 조회 전 표시 ═══
function defaultSajuViz(){
  // 오행 골고루 (각 2~3)
  return sajuVizSVG({목:2,화:2,토:2,금:2,수:2},'오행','균형');
}
function defaultAstroViz(){
  // 12별자리 휠 골격만 (마커 없이) — 간이 차트
  const size=VIZ_SIZE,cx=size/2,cy=size/2,rZod=size/2-6,rZodIn=size/2-26;
  const signs=['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
  const ELEM_SC={aries:'#c83030',leo:'#c83030',sagittarius:'#c83030',taurus:'#d4a82a',virgo:'#d4a82a',capricorn:'#d4a82a',gemini:'#40c0a0',libra:'#40c0a0',aquarius:'#40c0a0',cancer:'#3060a0',scorpio:'#3060a0',pisces:'#3060a0'};
  let svg=`<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
  signs.forEach((s,i)=>{
    const a1=Math.PI-(i*30*Math.PI/180),a2=Math.PI-((i+1)*30*Math.PI/180);
    const x1=cx+rZod*Math.cos(a1),y1=cy-rZod*Math.sin(a1);
    const x2=cx+rZod*Math.cos(a2),y2=cy-rZod*Math.sin(a2);
    const xi2=cx+rZodIn*Math.cos(a2),yi2=cy-rZodIn*Math.sin(a2);
    const xi1=cx+rZodIn*Math.cos(a1),yi1=cy-rZodIn*Math.sin(a1);
    svg+=`<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${rZod} ${rZod} 0 0 0 ${x2.toFixed(1)} ${y2.toFixed(1)} L${xi2.toFixed(1)} ${yi2.toFixed(1)} A${rZodIn} ${rZodIn} 0 0 1 ${xi1.toFixed(1)} ${yi1.toFixed(1)} Z" fill="${ELEM_SC[s]}" opacity="0.25" stroke="#d4cfc4" stroke-width=".5"/>`;
    const mid=Math.PI-((i+0.5)*30*Math.PI/180),lr=(rZod+rZodIn)/2;
    svg+=`<text x="${(cx+lr*Math.cos(mid)).toFixed(1)}" y="${(cy-lr*Math.sin(mid)+4).toFixed(1)}" text-anchor="middle" font-size="11" opacity="0.6">${SIGN_EMOJI[s]}</text>`;
  });
  svg+=`<circle cx="${cx}" cy="${cy}" r="${rZodIn}" fill="#fff" stroke="#d4cfc4" stroke-width=".6"/>`;
  svg+=`<line x1="${cx-rZod}" y1="${cy}" x2="${cx+rZod}" y2="${cy}" stroke="#d4cfc4" stroke-width="1"/>`;
  svg+=`<text x="${cx}" y="${cy+4}" text-anchor="middle" font-size="11" fill="#9a9488" font-family="Noto Sans KR">조회 대기</text>`;
  svg+='</svg>';
  let legend='<div class="viz-legend"><span><i style="background:#8a6508"></i>ASC</span><span><i style="background:#5040a0"></i>MC</span><span><i style="background:#d4a017"></i>☉</span><span><i style="background:#3050a0"></i>☽</span></div>';
  return svg+legend;
}
function defaultEnneaViz(){
  // 9번이 맨 위, 바깥 테두리 라벨
  const size=VIZ_SIZE,cx=size/2,cy=size/2,r=size/2-40;
  const CENTER_C={'본능':'#c04010','가슴':'#10806a','사고':'#4838a0'};
  const CENTER={8:'본능',9:'본능',1:'본능',2:'가슴',3:'가슴',4:'가슴',5:'사고',6:'사고',7:'사고'};
  const pos={};for(let i=1;i<=9;i++){const a=-Math.PI/2+2*Math.PI*((i%9)/9);pos[i]=[cx+r*Math.cos(a),cy+r*Math.sin(a)];}
  let svg=`<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
  const arcR=size/2-16;
  [{from:8,to:1,c:'#c04010'},{from:2,to:4,c:'#10806a'},{from:5,to:7,c:'#4838a0'}].forEach(arc=>{
    const a1=-Math.PI/2+2*Math.PI*((arc.from-0.5)%9/9),a2=-Math.PI/2+2*Math.PI*((arc.to+0.5)%9/9);
    const large=(a2-a1+2*Math.PI)%(2*Math.PI)>Math.PI?1:0;
    svg+=`<path d="M${(cx+arcR*Math.cos(a1)).toFixed(1)} ${(cy+arcR*Math.sin(a1)).toFixed(1)} A${arcR} ${arcR} 0 ${large} 1 ${(cx+arcR*Math.cos(a2)).toFixed(1)} ${(cy+arcR*Math.sin(a2)).toFixed(1)}" fill="none" stroke="${arc.c}" stroke-width="4" opacity="0.4"/>`;
  });
  // 바깥 테두리 라벨
  const lblR=size/2-8;
  [{label:'본능',angle:-Math.PI/2,c:'#c04010'},{label:'가슴',angle:-Math.PI/2+2*Math.PI*(3/9),c:'#10806a'},{label:'사고',angle:-Math.PI/2+2*Math.PI*(6/9),c:'#4838a0'}].forEach(lb=>{
    const lx=cx+lblR*Math.cos(lb.angle),ly=cy+lblR*Math.sin(lb.angle);
    let yAdj=ly+3;if(lb.angle===-Math.PI/2)yAdj=ly+9;
    svg+=`<rect x="${(lx-15).toFixed(1)}" y="${(yAdj-10).toFixed(1)}" width="30" height="13" rx="6.5" fill="${lb.c}" opacity="0.85"/>`;
    svg+=`<text x="${lx.toFixed(1)}" y="${(yAdj-0.5).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="900" fill="#fff" font-family="Noto Sans KR">${lb.label}</text>`;
  });
  svg+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#d4cfc4" stroke-width="1"/>`;
  for(let i=1;i<=9;i++){const[x,y]=pos[i];const c=CENTER_C[CENTER[i]];svg+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11" fill="#fff" stroke="${c}" stroke-width="1" opacity="0.6"/><text x="${x.toFixed(1)}" y="${(y+4.5).toFixed(1)}" text-anchor="middle" fill="${c}" font-size="11" font-weight="800" font-family="Space Grotesk" opacity="0.7">${i}</text>`;}
  svg+=`<text x="${cx}" y="${cy+4}" text-anchor="middle" font-size="11" fill="#9a9488" font-family="Noto Sans KR">조회 대기</text>`;
  svg+='</svg>';
  let legend='<div class="viz-legend"><span><i style="background:#c04010"></i>본능(장)</span><span><i style="background:#10806a"></i>가슴(감정)</span><span><i style="background:#4838a0"></i>사고(머리)</span></div>';
  return svg+legend;
}
function defaultMbtiViz(){
  // 4축 50:50
  return mbtiBigSVG({E:50,I:50,S:50,N:50,T:50,F:50,J:50,P:50},'____');
}
