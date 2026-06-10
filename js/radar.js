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
