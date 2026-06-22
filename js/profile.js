// ═══ profile.js — 프로필 저장/불러오기 (localStorage, 최대 20개) ═══
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2000);}
function profileToast(m){const el=document.getElementById('profileToast');if(!el)return;el.textContent=m;el.style.display='';el.style.opacity='1';setTimeout(()=>{el.style.opacity='0';setTimeout(()=>{el.style.display='none';el.style.opacity='1';},300);},2500);}

const PROFILE_KEY='saju_profiles';
// state: 'default' | 'loaded' | 'editing'
let _state='default', _editIdx=-1;
function getProfiles(){try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'[]');}catch(e){return [];}}
function setProfiles(arr){localStorage.setItem(PROFILE_KEY,JSON.stringify(arr));}

function setState(s,idx){
  _state=s;_editIdx=(s==='default')?-1:idx;
  const bl=document.getElementById('btnLoad');
  const bs=document.getElementById('btnSave');
  const n=document.getElementById('inName');
  if(s==='loaded'){
    if(bl)bl.innerHTML='📂 불러오기';
    if(bs){bs.innerHTML='🔄 새로 입력하기';bs.disabled=false;bs.style.opacity='';}
    if(n){n.readOnly=true;n.style.background='var(--surface2)';n.style.color='var(--gold-dim)';}
  }else if(s==='editing'){
    if(bl)bl.innerHTML='❌ 취소하기';
    if(bs){bs.innerHTML='✏️ 수정저장하기';bs.disabled=false;bs.style.opacity='';}
    if(n){n.readOnly=false;n.style.background='';n.style.color='';}
  }else{
    if(bl)bl.innerHTML='📂 불러오기';
    if(bs){bs.innerHTML='💾 저장하기';bs.disabled=false;bs.style.opacity='';}
    if(n){n.readOnly=false;n.style.background='';n.style.color='';}
  }
}

function collectProfile(){
  return {
    name:(document.getElementById('inName')?.value||'').trim(),
    year:document.getElementById('inYear').value,
    month:document.getElementById('inMonth').value,
    day:document.getElementById('inDay').value,
    cal:document.querySelector('input[name="cal"]:checked').value,
    timeMode,
    ganji:document.getElementById('inGanji').value,
    hour:document.getElementById('inHour').value,
    min:document.getElementById('inMin').value,
    noTime:document.getElementById('chkNoTime').checked,
    yaja:document.getElementById('chkYaja').checked,
    gender:document.getElementById('inGender').value,
    ageType:document.getElementById('inAgeType').value,
    geoMode:document.getElementById('geoCoord').style.display!=='none'?'coord':'city',
    country:document.getElementById('inCountry').value,
    region:document.getElementById('inRegion').value,
    city:document.getElementById('inCity').value,
    lat:document.getElementById('inLat').value,
    lng:document.getElementById('inLng').value,
    ts:Date.now()
  };
}

window.onLoadBtn=function(){
  if(_state==='editing'){
    setState('default',-1);
    document.getElementById('inName').value='';
    profileToast('취소되었습니다');
  }else{
    openLoadModal();
  }
};

function resetFields(){
  document.getElementById('inName').value='';
  document.getElementById('inYear').value='2000';
  document.getElementById('inMonth').value='1';
  buildDayOpts();
  document.getElementById('inDay').value='1';
  document.querySelector('input[name="cal"][value="solar"]').checked=true;
  setTimeMode('ganji',document.querySelectorAll('.time-tab')[0]);
  document.getElementById('inGanji').value='0';
  document.getElementById('inHour').value='12';
  document.getElementById('inMin').value='0';
  document.getElementById('chkNoTime').checked=false;
  document.getElementById('chkYaja').checked=false;
  document.getElementById('inGender').value='여';
  document.getElementById('inAgeType').value='kr';
  updateAge();
  setGeoMode('city',document.querySelectorAll('.time-tab')[2]||document.querySelectorAll('.time-tab')[0]);
  const cs=document.getElementById('inCountry');
  cs.value='대한민국';cs.dispatchEvent(new Event('change'));
  setTimeout(()=>{
    const rs=document.getElementById('inRegion');
    rs.value='서울특별시';rs.dispatchEvent(new Event('change'));
    setTimeout(()=>{document.getElementById('inCity').value='종로구';},100);
  },100);
}

window.saveProfile=function(){
  // 불러오기 상태 → 새로 입력하기
  if(_state==='loaded'){
    resetFields();
    setState('default',-1);
    profileToast('새로 입력해 주세요');
    return;
  }

  const nameEl=document.getElementById('inName');
  const name=(nameEl?.value||'').trim();
  if(!name){toast('⚠️ 이름을 입력해주세요.');nameEl?.focus();return;}
  const profiles=getProfiles();

  if(_state==='editing'&&_editIdx>=0&&_editIdx<profiles.length){
    profiles[_editIdx]=collectProfile();
    setProfiles(profiles);
    setState('default',-1);
    profileToast('✅ 수정 저장되었습니다');
  }else if(_state==='default'){
    if(profiles.length>=20){toast('⚠️ 최대 20개까지 저장 가능합니다.');return;}
    profiles.unshift(collectProfile());
    setProfiles(profiles);
    profileToast('✅ 저장되었습니다');
  }
};

window.openLoadModal=function(){
  const profiles=getProfiles();
  const el=document.getElementById('profileList');
  if(profiles.length===0){el.innerHTML='<div style="text-align:center;color:var(--text2);padding:30px">저장된 프로필이 없습니다.<br><br>이름을 입력하고 💾 저장하기를 눌러주세요.</div>';
  }else{
    el.innerHTML=profiles.map((p,i)=>{
      const d=`${p.year}.${String(p.month).padStart(2,'0')}.${String(p.day).padStart(2,'0')}`;
      const g=p.gender==='남'?'♂':'♀';
      return `<div style="display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid var(--border);border-radius:6px;margin-bottom:6px;background:var(--surface)">
        <div style="flex:1;min-width:0">
          <span style="font-weight:800;font-size:14px;color:var(--gold-dim)">${p.name}</span>
          <span style="font-size:11px;color:var(--text2);margin-left:6px">${g} ${d}</span>
        </div>
        <button title="선택" style="background:none;border:none;cursor:pointer;font-size:16px;padding:4px" onclick="loadProfile(${i})">✅</button>
        <button title="수정" style="background:none;border:none;cursor:pointer;font-size:16px;padding:4px" onclick="editProfile(${i})">✏️</button>
        <button title="삭제" style="background:none;border:none;cursor:pointer;font-size:16px;padding:4px" onclick="deleteProfile(${i})">🗑️</button>
      </div>`;
    }).join('');
  }
  document.getElementById('profileModal').classList.add('show');
};
window.closeLoadModal=function(){document.getElementById('profileModal').classList.remove('show');};

function applyProfileFields(p){
  document.getElementById('inYear').value=p.year;
  document.getElementById('inMonth').value=p.month;
  buildDayOpts();
  document.getElementById('inDay').value=p.day;
  document.querySelector(`input[name="cal"][value="${p.cal}"]`).checked=true;
  if(p.timeMode==='direct'){setTimeMode('direct',document.querySelectorAll('.time-tab')[1]);}
  else{setTimeMode('ganji',document.querySelectorAll('.time-tab')[0]);}
  document.getElementById('inGanji').value=p.ganji||'0';
  document.getElementById('inHour').value=p.hour||'12';
  document.getElementById('inMin').value=p.min||'0';
  document.getElementById('chkNoTime').checked=!!p.noTime;
  document.getElementById('chkYaja').checked=!!p.yaja;
  document.getElementById('inGender').value=p.gender||'여';
  document.getElementById('inAgeType').value=p.ageType||'kr';
  updateAge();
  if(p.geoMode==='coord'){
    setGeoMode('coord',document.querySelectorAll('.time-tab')[3]||document.querySelectorAll('.time-tab')[1]);
    document.getElementById('inLat').value=p.lat;
    document.getElementById('inLng').value=p.lng;
  }else{
    setGeoMode('city',document.querySelectorAll('.time-tab')[2]||document.querySelectorAll('.time-tab')[0]);
    const cs=document.getElementById('inCountry');
    cs.value=p.country||'대한민국';cs.dispatchEvent(new Event('change'));
    setTimeout(()=>{
      const rs=document.getElementById('inRegion');
      rs.value=p.region||'';rs.dispatchEvent(new Event('change'));
      setTimeout(()=>{document.getElementById('inCity').value=p.city||'';},100);
    },100);
  }
}

// ✅ 불러오기 — 조회 전용, 저장 비활성
window.loadProfile=function(idx){
  const profiles=getProfiles();
  const p=profiles[idx];if(!p)return;
  applyProfileFields(p);
  closeLoadModal();
  document.getElementById('inName').value=p.name;
  setState('loaded',idx);
  profileToast('✅ 불러왔습니다. 만세력을 조회하세요');
};

// ✏️ 수정하기 — 이름 포함 전체 편집 가능
window.editProfile=function(idx){
  const profiles=getProfiles();
  const p=profiles[idx];if(!p)return;
  applyProfileFields(p);
  closeLoadModal();
  document.getElementById('inName').value=p.name;
  setState('editing',idx);
  profileToast('✏️ 수정 후 수정저장하기를 눌러주세요');
};

window.deleteProfile=function(idx){
  const profiles=getProfiles();
  const name=profiles[idx]?.name||'';
  if(!confirm(`"${name}" 프로필을 삭제하시겠습니까?`))return;
  profiles.splice(idx,1);
  setProfiles(profiles);
  openLoadModal();
  toast(`🗑️ "${name}" 삭제됨`);
};
