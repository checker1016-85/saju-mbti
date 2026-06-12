function radarSVG(axes, color, size = 130) {
  const cx=size/2,cy=size/2,r=size/2-22,n=axes.length;
  const ang=(i)=>-Math.PI/2+2*Math.PI*i/n;
  const pt=(i,v)=>[(cx+r*(v/100)*Math.cos(ang(i))).toFixed(1),(cy+r*(v/100)*Math.sin(ang(i))).toFixed(1)];
  let svg=`<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
  [25,50,75,100].forEach(lv=>{let pts='';for(let i=0;i<n;i++){const[x,y]=pt(i,lv);pts+=`${x},${y} `;}svg+=`<polygon points="${pts}" fill="none" stroke="#d4cfc4" stroke-width=".5"/>`;});
  for(let i=0;i<n;i++){const[x,y]=pt(i,100);svg+=`<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#d4cfc4" stroke-width=".5"/>`;}
  let dpts='';axes.forEach((a,i)=>{const[x,y]=pt(i,a.value);dpts+=`${x},${y} `;});
  svg+=`<polygon points="${dpts}" fill="${color}25" stroke="${color}" stroke-width="2"/>`;
  axes.forEach((a,i)=>{const[x,y]=pt(i,a.value);svg+=`<circle cx="${x}" cy="${y}" r="3" fill="${color}"/>`;});
  axes.forEach((a,i)=>{const[x,y]=pt(i,120);const lines=a.label.split('\n');lines.forEach((l,li)=>{svg+=`<text x="${x}" y="${(+y)+li*11}" text-anchor="middle" fill="#6a6358" font-size="9" font-family="Noto Sans KR">${l}</text>`;});});
  svg+='</svg>';return svg;
}

// ═══ 사주 오행 분포 (도넛 + 십성 요약) ═══
function sajuVizSVG(oh, tenGodCount, size=150){
  const ELEM_C={목:'#2e8b40',화:'#c83030',토:'#d4a82a',금:'#707088',수:'#3060a0'};
  const total=Object.values(oh).reduce((a,b)=>a+b,0)||1;
  const cx=size/2,cy=size/2,rOut=size/2-8,rIn=size/2-26;
  let ang=-Math.PI/2,svg=`<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
  for(const[e,c]of Object.entries(oh)){
    if(c<=0)continue;
    const a2=ang+2*Math.PI*c/total;
    const x1=cx+rOut*Math.cos(ang),y1=cy+rOut*Math.sin(ang);
    const x2=cx+rOut*Math.cos(a2),y2=cy+rOut*Math.sin(a2);
    const xi2=cx+rIn*Math.cos(a2),yi2=cy+rIn*Math.sin(a2);
    const xi1=cx+rIn*Math.cos(ang),yi1=cy+rIn*Math.sin(ang);
    const large=(a2-ang)>Math.PI?1:0;
    svg+=`<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${rOut} ${rOut} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L${xi2.toFixed(1)} ${yi2.toFixed(1)} A${rIn} ${rIn} 0 ${large} 0 ${xi1.toFixed(1)} ${yi1.toFixed(1)} Z" fill="${ELEM_C[e]}" opacity="0.85"/>`;
    // 라벨
    const mid=(ang+a2)/2,lr=(rOut+rIn)/2;
    svg+=`<text x="${(cx+lr*Math.cos(mid)).toFixed(1)}" y="${(cy+lr*Math.sin(mid)+3).toFixed(1)}" text-anchor="middle" fill="#fff" font-size="11" font-weight="700" font-family="Noto Sans KR">${e}${c}</text>`;
    ang=a2;
  }
  svg+=`<text x="${cx}" y="${cy-2}" text-anchor="middle" fill="#6a6358" font-size="9" font-family="Noto Sans KR">오행</text>`;
  svg+=`<text x="${cx}" y="${cy+10}" text-anchor="middle" fill="#2a2520" font-size="11" font-weight="700" font-family="Noto Sans KR">분포</text>`;
  svg+='</svg>';
  return svg;
}

// ═══ 에니어그램 9각 별 (메인+날개 강조) ═══
function enneaStarSVG(main, w1, w2, size=170){
  const cx=size/2,cy=size/2,r=size/2-24;
  const CENTER_C={본능:'#d06020',가슴:'#18a088',사고:'#6050c0'};
  const CENTER={8:'본능',9:'본능',1:'본능',2:'가슴',3:'가슴',4:'가슴',5:'사고',6:'사고',7:'사고'};
  // 9 포지션 (1이 12시, 시계방향)
  const pos={};
  for(let i=1;i<=9;i++){const a=-Math.PI/2+2*Math.PI*((i-1)/9);pos[i]=[cx+r*Math.cos(a),cy+r*Math.sin(a)];}
  let svg=`<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
  svg+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#d4cfc4" stroke-width="1"/>`;
  // 연결선 (에니어그램 내부 도형 단순화)
  const lines=[[1,4],[4,2],[2,8],[8,5],[5,7],[7,1],[3,6],[6,9],[9,3]];
  lines.forEach(([a,b])=>{svg+=`<line x1="${pos[a][0].toFixed(1)}" y1="${pos[a][1].toFixed(1)}" x2="${pos[b][0].toFixed(1)}" y2="${pos[b][1].toFixed(1)}" stroke="#e6e2d8" stroke-width="1"/>`;});
  // 노드
  for(let i=1;i<=9;i++){
    const[x,y]=pos[i];const c=CENTER_C[CENTER[i]];
    let rad=11,sw=1,fill='#fff',tc=c;
    if(i===main){rad=16;fill=c;tc='#fff';sw=2;}
    else if(i===w1||i===w2){rad=13;fill=c+'40';sw=2;}
    svg+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad}" fill="${fill}" stroke="${c}" stroke-width="${sw}"/>`;
    svg+=`<text x="${x.toFixed(1)}" y="${(y+4).toFixed(1)}" text-anchor="middle" fill="${tc}" font-size="${i===main?13:11}" font-weight="800" font-family="Space Grotesk">${i}</text>`;
  }
  svg+='</svg>';
  return svg;
}

// ═══ MBTI 4축 큰 막대 (퍼센트 위치) ═══
function mbtiBigSVG(axes, selected, width=230){
  const pairs=[['E','I','에너지'],['S','N','인식'],['T','F','판단'],['J','P','생활']];
  const PC={E:'#d44060',I:'#d44060',S:'#d4a82a',N:'#d4a82a',T:'#18a088',F:'#18a088',J:'#6050c0',P:'#6050c0'};
  const rowH=46,h=pairs.length*rowH+8;
  let svg=`<svg width="${width}" height="${h}" viewBox="0 0 ${width} ${h}" xmlns="http://www.w3.org/2000/svg">`;
  pairs.forEach(([a,b,mid],i)=>{
    const y=i*rowH+24;
    const aOn=selected.includes(a),pa=axes[a];
    const c=PC[a];
    // 좌우 큰 글자
    svg+=`<text x="6" y="${y+6}" font-size="22" font-weight="900" fill="${aOn?c:'#c0baa8'}" font-family="Space Grotesk">${a}</text>`;
    svg+=`<text x="${width-6}" y="${y+6}" text-anchor="end" font-size="22" font-weight="900" fill="${!aOn?c:'#c0baa8'}" font-family="Space Grotesk">${b}</text>`;
    // 막대
    const bx=34,bw=width-68;
    svg+=`<rect x="${bx}" y="${y-6}" width="${bw}" height="10" rx="5" fill="#e6e2d8"/>`;
    // 채움: 우세한 쪽에서 채움
    const fillW=bw*(aOn?pa:axes[b])/100;
    if(aOn){svg+=`<rect x="${bx}" y="${y-6}" width="${fillW.toFixed(1)}" height="10" rx="5" fill="${c}"/>`;}
    else{svg+=`<rect x="${(bx+bw-fillW).toFixed(1)}" y="${y-6}" width="${fillW.toFixed(1)}" height="10" rx="5" fill="${c}"/>`;}
    // 퍼센트
    svg+=`<text x="${width/2}" y="${y-9}" text-anchor="middle" font-size="9" fill="#6a6358" font-family="Noto Sans KR">${mid} ${aOn?pa:axes[b]}%</text>`;
  });
  svg+='</svg>';
  return svg;
}
