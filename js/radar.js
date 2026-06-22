// ═══ 공용: 4종 시각화 200px 통일 ═══
const VIZ_SIZE=200;

// 방사형 (성향 프로필용) — 반시계 방향, 라벨에 퍼센트 포함
function radarSVG(axes, color, size = 200) {
  const pad=30;
  const cx=size/2,cy=size/2,r=size/2-pad,n=axes.length;
  const ang=(i)=>-Math.PI/2-2*Math.PI*i/n;
  const pt=(i,v)=>[(cx+r*(v/100)*Math.cos(ang(i))).toFixed(1),(cy+r*(v/100)*Math.sin(ang(i))).toFixed(1)];
  let svg=`<svg width="${size}" height="${size}" viewBox="-55 -50 ${size+110} ${size+100}" xmlns="http://www.w3.org/2000/svg">`;
  [25,50,75,100].forEach(lv=>{let pts='';for(let i=0;i<n;i++){const[x,y]=pt(i,lv);pts+=`${x},${y} `;}svg+=`<polygon points="${pts}" fill="none" stroke="#d4cfc4" stroke-width=".5"/>`;});
  for(let i=0;i<n;i++){const[x,y]=pt(i,100);svg+=`<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#d4cfc4" stroke-width=".5"/>`;}
  let dpts='';axes.forEach((a,i)=>{const[x,y]=pt(i,a.value);dpts+=`${x},${y} `;});
  svg+=`<polygon points="${dpts}" fill="${color}50" stroke="${color}" stroke-width="2.5"/>`;
  axes.forEach((a,i)=>{const[x,y]=pt(i,a.value);svg+=`<circle cx="${x}" cy="${y}" r="3" fill="${color}"/>`;});
  axes.forEach((a,i)=>{
    const aa=ang(i);
    const cos=Math.cos(aa), sin=Math.sin(aa);
    // 좌우 라벨은 안쪽+위로 당김 (잘림 방지)
    const absCos=Math.abs(cos);
    const lblR=absCos>0.7?r+10:absCos>0.4?r+14:r+20;
    const yOff=absCos>0.7?-12:absCos>0.4?-6:0;
    const lx=cx+lblR*cos, ly=cy+lblR*sin+yOff;
    let anchor='middle';
    if(cos>0.25)anchor='start';else if(cos<-0.25)anchor='end';
    const name=a.label.replace('\n',' ');
    const pct=typeof a.value==='number'?a.value.toFixed(1):a.value;
    svg+=`<text x="${lx.toFixed(1)}" y="${(ly-2).toFixed(1)}" text-anchor="${anchor}" fill="#5a5348" font-size="20" font-weight="700" font-family="Noto Sans KR">${name}</text>`;
    svg+=`<text x="${lx.toFixed(1)}" y="${(ly+16).toFixed(1)}" text-anchor="${anchor}" fill="${color}" font-size="19" font-weight="800" font-family="Space Grotesk">(${pct}%)</text>`;
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

// ═══ ② 점성: 사주 오행 도넛과 동일 구조의 12칸 도넛 ═══
function astroChartSVG(h, size=VIZ_SIZE){
  const signs=['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
  const ELEM_SC={aries:'#c83030',leo:'#c83030',sagittarius:'#c83030',taurus:'#d4a82a',virgo:'#d4a82a',capricorn:'#d4a82a',gemini:'#40c0a0',libra:'#40c0a0',aquarius:'#40c0a0',cancer:'#3060a0',scorpio:'#3060a0',pisces:'#3060a0'};
  const cx=size/2,cy=size/2,rOut=size/2-18,rIn=size/2-42;
  let ang=-Math.PI/2;
  let svg=`<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
  // 별자리 → 슬라이스 인덱스 매핑 (그리는 순서대로)
  const signIdx={};signs.forEach((s,i)=>signIdx[s]=i);
  signs.forEach((s)=>{
    const a2=ang+2*Math.PI/12;
    const x1=cx+rOut*Math.cos(ang),y1=cy+rOut*Math.sin(ang);
    const x2=cx+rOut*Math.cos(a2),y2=cy+rOut*Math.sin(a2);
    const xi2=cx+rIn*Math.cos(a2),yi2=cy+rIn*Math.sin(a2);
    const xi1=cx+rIn*Math.cos(ang),yi1=cy+rIn*Math.sin(ang);
    svg+=`<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${rOut} ${rOut} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L${xi2.toFixed(1)} ${yi2.toFixed(1)} A${rIn} ${rIn} 0 0 0 ${xi1.toFixed(1)} ${yi1.toFixed(1)} Z" fill="${ELEM_SC[s]}" opacity="0.88"/>`;
    const mid=(ang+a2)/2,lr=(rOut+rIn)/2;
    svg+=`<text x="${(cx+lr*Math.cos(mid)).toFixed(1)}" y="${(cy+lr*Math.sin(mid)+5).toFixed(1)}" text-anchor="middle" fill="#fff" font-size="14" font-weight="800" font-family="serif">${SIGN_EMOJI[s]}\uFE0E</text>`;
    ang=a2;
  });
  // ── 마커: 도넛 안쪽 빈 공간에 배치 ──
  const angFor=(signKey)=>{const i=signIdx[signKey];if(i==null)return null;return -Math.PI/2+2*Math.PI*(i+0.5)/12;};
  const markers=[];
  const ascKey=h.Ascendant?.Sign?.key;
  if(ascKey)markers.push({sign:ascKey,sym:'ASC',color:'#8a6508',bg:'#fff7e0',stroke:'#8a6508'});
  const sunKey=h.CelestialBodies?.sun?.Sign?.key;
  if(sunKey)markers.push({sign:sunKey,sym:'☉',color:'#fff',bg:'#d4a017',stroke:'#d4a017'});
  const moonKey=h.CelestialBodies?.moon?.Sign?.key;
  if(moonKey)markers.push({sign:moonKey,sym:'☽',color:'#fff',bg:'#3050a0',stroke:'#3050a0'});
  const mcKey=h.Midheaven?.Sign?.key;
  if(mcKey)markers.push({sign:mcKey,sym:'MC',color:'#fff',bg:'#5040a0',stroke:'#5040a0'});
  const markerR=rIn-16;
  const seenSign={};
  const positions=markers.map(m=>{
    const a=angFor(m.sign);if(a==null)return null;
    const off=(seenSign[m.sign]||0);seenSign[m.sign]=off+1;
    // 같은 별자리 마커는 반지름 방향으로 안쪽으로 더 들여 배치 (선 따라 위아래)
    const rr=markerR-off*16;
    return {x:cx+rr*Math.cos(a), y:cy+rr*Math.sin(a), m};
  }).filter(Boolean);
  // 마커끼리 옅은 점선 연결
  for(let i=0;i<positions.length;i++)for(let j=i+1;j<positions.length;j++){
    const p=positions[i],q=positions[j];
    svg+=`<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}" stroke="#888" stroke-width="0.7" opacity="0.35" stroke-dasharray="2,2"/>`;
  }
  // 마커 배지
  positions.forEach(({x,y,m})=>{
    const w=m.sym.length>1?22:16,hh=14;
    svg+=`<rect x="${(x-w/2).toFixed(1)}" y="${(y-hh/2).toFixed(1)}" width="${w}" height="${hh}" rx="${hh/2}" fill="${m.bg}" stroke="${m.stroke}" stroke-width="1"/>`;
    svg+=`<text x="${x.toFixed(1)}" y="${(y+4).toFixed(1)}" text-anchor="middle" font-size="${m.sym.length>1?9:11}" font-weight="800" fill="${m.color}" font-family="Space Grotesk">${m.sym}</text>`;
  });
  // 중앙 상승궁 텍스트 (마커와 안 겹치게 위로)
  const ascName=ascKey&&typeof SIGN_KR!=='undefined'?(SIGN_KR[ascKey]||'').replace('자리',''):'';
  svg+=`<text x="${cx}" y="${cy-2}" text-anchor="middle" fill="#2a2520" font-size="13" font-weight="900" font-family="Noto Sans KR">${ascName}</text>`;
  svg+=`<text x="${cx}" y="${cy+12}" text-anchor="middle" fill="#8a6508" font-size="9" font-weight="800" font-family="Noto Sans KR">상승궁</text>`;
  svg+='</svg>';
  let legend='<div class="viz-legend"><span><i style="background:#8a6508"></i>ASC</span><span><i style="background:#d4a017"></i>☉</span><span><i style="background:#3050a0"></i>☽</span><span><i style="background:#5040a0"></i>MC</span></div>';
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

// ═══ ④ MBTI: 4축(둥근 박스 안) + A/T형 게이지(박스 밖) ═══
function mbtiBigSVG(axes, selected, at, size=VIZ_SIZE){
  const pairs=[['E','I','외향','내향'],['S','N','감각','직관'],['T','F','사고','감정'],['J','P','판단','인식']];
  const PC={E:'#d44060',S:'#d4a82a',T:'#18a088',J:'#6050c0'};
  const barH=8;
  // 박스 영역: 위 4축, 아래 A/T 분리
  const boxX=2,boxW=size-4,boxY=4,boxH=152;       // 4축 박스
  const rowH=(boxH-16)/4, topPad=boxY+8;
  let svg=`<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
  // ── 둥근 사각형 박스 (옅은 선) ──
  svg+=`<rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" rx="12" fill="#fff" fill-opacity="0.2" stroke="#d4cfc4" stroke-width="1"/>`;
  pairs.forEach(([a,b,aKr,bKr],i)=>{
    const y=topPad+i*rowH+rowH/2;
    const aOn=selected.includes(a),bOn=!aOn,c=PC[a];
    const aPct=axes[a],bPct=axes[b];
    svg+=`<text x="${boxX+8}" y="${y+1}" font-size="15" font-weight="900" fill="${aOn?c:'#b0a898'}" font-family="Space Grotesk">${a}</text>`;
    svg+=`<text x="${boxX+8}" y="${y+11}" font-size="7" fill="${aOn?c:'#b0a898'}" font-family="Noto Sans KR">${aKr}</text>`;
    svg+=`<text x="${boxX+boxW-8}" y="${y+1}" text-anchor="end" font-size="15" font-weight="900" fill="${bOn?c:'#b0a898'}" font-family="Space Grotesk">${b}</text>`;
    svg+=`<text x="${boxX+boxW-8}" y="${y+11}" text-anchor="end" font-size="7" fill="${bOn?c:'#b0a898'}" font-family="Noto Sans KR">${bKr}</text>`;
    const bx=boxX+30,bw=boxW-60,half=bw/2,midX=bx+half;
    svg+=`<rect x="${bx}" y="${y-barH/2}" width="${bw}" height="${barH}" rx="${barH/2}" fill="#c8c2b4"/>`;
    const aW=half*aPct/100;
    svg+=`<rect x="${(midX-aW).toFixed(1)}" y="${y-barH/2}" width="${aW.toFixed(1)}" height="${barH}" rx="${barH/2}" fill="${c}" opacity="${aOn?'1':'0.45'}"/>`;
    const bW=half*bPct/100;
    svg+=`<rect x="${midX}" y="${y-barH/2}" width="${bW.toFixed(1)}" height="${barH}" rx="${barH/2}" fill="${c}" opacity="${bOn?'1':'0.45'}"/>`;
    svg+=`<line x1="${midX}" y1="${y-barH/2-2}" x2="${midX}" y2="${y+barH/2+2}" stroke="#6a6358" stroke-width="1.5"/>`;
    svg+=`<text x="${midX-3}" y="${y-7}" text-anchor="end" font-size="8" fill="${aOn?c:'#9a9488'}" font-weight="${aOn?'800':'600'}" font-family="Space Grotesk">${aPct}</text>`;
    svg+=`<text x="${midX+3}" y="${y-7}" text-anchor="start" font-size="8" fill="${bOn?c:'#9a9488'}" font-weight="${bOn?'800':'600'}" font-family="Space Grotesk">${bPct}</text>`;
  });
  // ── A/T 게이지 (박스 밖, 아래) ──
  if(at){
    const aClr='#2a8a5a',tClr='#d4762a'; // A=확신(초록), T=격동(주황)
    const aOn=at.variant==='A';
    const gy=boxY+boxH+20;
    const gx=boxX+34,gw=boxW-68,half=gw/2,midX=gx+half;
    svg+=`<text x="${boxX+6}" y="${gy+2}" font-size="14" font-weight="900" fill="${aOn?aClr:'#b0a898'}" font-family="Space Grotesk">A</text>`;
    svg+=`<text x="${boxX+6}" y="${gy+11}" font-size="7" fill="${aOn?aClr:'#b0a898'}" font-family="Noto Sans KR">확신</text>`;
    svg+=`<text x="${boxX+boxW-6}" y="${gy+2}" text-anchor="end" font-size="14" font-weight="900" fill="${!aOn?tClr:'#b0a898'}" font-family="Space Grotesk">T</text>`;
    svg+=`<text x="${boxX+boxW-6}" y="${gy+11}" text-anchor="end" font-size="7" fill="${!aOn?tClr:'#b0a898'}" font-family="Noto Sans KR">격동</text>`;
    svg+=`<rect x="${gx}" y="${gy-5}" width="${gw}" height="9" rx="4.5" fill="#c8c2b4"/>`;
    const aW=half*at.a/100,tW=half*at.t/100;
    svg+=`<rect x="${(midX-aW).toFixed(1)}" y="${gy-5}" width="${aW.toFixed(1)}" height="9" rx="4.5" fill="${aClr}" opacity="${aOn?'1':'0.45'}"/>`;
    svg+=`<rect x="${midX}" y="${gy-5}" width="${tW.toFixed(1)}" height="9" rx="4.5" fill="${tClr}" opacity="${!aOn?'1':'0.45'}"/>`;
    svg+=`<line x1="${midX}" y1="${gy-8}" x2="${midX}" y2="${gy+5}" stroke="#6a6358" stroke-width="1.5"/>`;
    svg+=`<text x="${midX-3}" y="${gy-8}" text-anchor="end" font-size="8" fill="${aOn?aClr:'#9a9488'}" font-weight="800" font-family="Space Grotesk">${at.a}</text>`;
    svg+=`<text x="${midX+3}" y="${gy-8}" text-anchor="start" font-size="8" fill="${!aOn?tClr:'#9a9488'}" font-weight="800" font-family="Space Grotesk">${at.t}</text>`;
  }
  svg+='</svg>';
  let legend='<div class="viz-legend"><span><i style="background:#d44060"></i>E/I</span><span><i style="background:#d4a82a"></i>S/N</span><span><i style="background:#18a088"></i>T/F</span><span><i style="background:#6050c0"></i>J/P</span><span><i style="background:#2a8a5a"></i>A/T</span></div>';
  return svg+legend;
}

// ═══ 기본형(중립) 시각화 — 조회 전 표시 ═══
function defaultSajuViz(){
  // 오행 골고루 (각 2~3)
  return sajuVizSVG({목:2,화:2,토:2,금:2,수:2},'오행','균형');
}
function defaultAstroViz(){
  const signs=['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
  const ELEM_SC={aries:'#c83030',leo:'#c83030',sagittarius:'#c83030',taurus:'#d4a82a',virgo:'#d4a82a',capricorn:'#d4a82a',gemini:'#40c0a0',libra:'#40c0a0',aquarius:'#40c0a0',cancer:'#3060a0',scorpio:'#3060a0',pisces:'#3060a0'};
  const size=VIZ_SIZE,cx=size/2,cy=size/2,rOut=size/2-10,rIn=size/2-38;
  let ang=-Math.PI/2;
  let svg=`<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
  signs.forEach((s)=>{
    const a2=ang+2*Math.PI/12;
    const x1=cx+rOut*Math.cos(ang),y1=cy+rOut*Math.sin(ang);
    const x2=cx+rOut*Math.cos(a2),y2=cy+rOut*Math.sin(a2);
    const xi2=cx+rIn*Math.cos(a2),yi2=cy+rIn*Math.sin(a2);
    const xi1=cx+rIn*Math.cos(ang),yi1=cy+rIn*Math.sin(ang);
    svg+=`<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${rOut} ${rOut} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L${xi2.toFixed(1)} ${yi2.toFixed(1)} A${rIn} ${rIn} 0 0 0 ${xi1.toFixed(1)} ${yi1.toFixed(1)} Z" fill="${ELEM_SC[s]}" opacity="0.78"/>`;
    const mid=(ang+a2)/2,lr=(rOut+rIn)/2;
    svg+=`<text x="${(cx+lr*Math.cos(mid)).toFixed(1)}" y="${(cy+lr*Math.sin(mid)+5).toFixed(1)}" text-anchor="middle" fill="#fff" font-size="14" font-weight="800" font-family="serif">${SIGN_EMOJI[s]}\uFE0E</text>`;
    ang=a2;
  });
  svg+=`<text x="${cx}" y="${cy-2}" text-anchor="middle" fill="#9a9488" font-size="13" font-weight="800" font-family="Noto Sans KR">점성</text>`;
  svg+=`<text x="${cx}" y="${cy+14}" text-anchor="middle" fill="#9a9488" font-size="11" font-family="Noto Sans KR">조회 대기</text>`;
  svg+='</svg>';
  let legend='<div class="viz-legend"><span><i style="background:#c83030"></i>불(화)</span><span><i style="background:#d4a82a"></i>흙(지)</span><span><i style="background:#40c0a0"></i>바람(풍)</span><span><i style="background:#3060a0"></i>물(수)</span></div>';
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
  // 4축 50:50 + A/T 50:50
  return mbtiBigSVG({E:50,I:50,S:50,N:50,T:50,F:50,J:50,P:50},'____',{a:50,t:50,variant:'A'});
}
