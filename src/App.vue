<script setup>
import { computed, onMounted, ref } from 'vue';
import DayChips from './components/DayChips.vue';
import DayWeekToggle from './components/DayWeekToggle.vue';
import Search from './components/Search.vue';
import LessonsGrid from './components/LessonsGrid.vue';
import { DateTime,Settings } from "luxon";
Settings.defaultZone = 'Europe/Tallinn';
function isoZ(d) { const pad = n => String(n).padStart(2, '0'); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}.${String(d.getUTCMilliseconds()).padStart(3, '0')}Z`; }

function toTallinn(date) {
  // If the date is already in Europe/Tallinn timezone (from server), just return it
  // The server sends times in Europe/Tallinn, so we don't need conversion
  return date;
}
function getWeek(date) { const t = toTallinn(date); const day = (t.getDay() + 6) % 7; const mon = new Date(t); mon.setDate(t.getDate() - day); mon.setHours(0, 0, 0, 0); const sun = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23, 59, 59, 999); return { mon, sun }; }

const week = (() => {
  // Get current time in Europe/Tallinn timezone for display calculations
  const now = new Date();
  const tallinnNow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Tallinn' }));
  const { mon, sun } = getWeek(tallinnNow);

  // For API calls, we need to convert the Tallinn dates back to UTC format
  // The API expects UTC timestamps even though the data is Europe/Tallinn
  const fromUTC = new Date(Date.UTC(mon.getFullYear(), mon.getMonth(), mon.getDate(), 0, 0, 0, 0));
  const thruUTC = new Date(Date.UTC(sun.getFullYear(), sun.getMonth(), sun.getDate(), 23, 59, 59, 999));

  return { _mon: mon, _sun: sun, from: isoZ(fromUTC), thru: isoZ(thruUTC) };
})();



let day = 0;
let from = computed(() => {
  if(displayType.value === 'week'){
    return DateTime.now().setZone('UTC').startOf('week');
  }
  if(displayType.value === 'today'){
    return DateTime.now().setZone('UTC').startOf('day')
  }
  if(displayType.value === 'day') {
    return DateTime.now().setZone('UTC').startOf('week').plus({ days: day }).startOf('day');
  }
});
let thru = computed(() => {
  if(displayType.value === 'week'){
    return DateTime.now().setZone('UTC').endOf('week');
  }
  if(displayType.value === 'today'){
    return DateTime.now().setZone('UTC').endOf('day');
  }
  if(displayType.value === 'day') {
    return DateTime.now().setZone('UTC').startOf('week').plus({ days: day }).endOf('day');
  }
});
// Chips
const DAY_LETTERS = ['E', 'T', 'K', 'N', 'R', 'L', 'P'];

let chips = computed(function () {
  let chips = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(week._mon);
    d.setDate(week._mon.getDate() + i);
    chips[i] = {
      day: i,
      date: DateTime.now().startOf('week').plus({days: i}).toFormat('dd.MM'),
      letter: DAY_LETTERS[i]
    };
  }
  return chips;
});


//   // State
//   const LS_KEY = 'tahvel.selection'; // { uuid, name, type: 'group'|'teacher' }
//   let selected = null;
//   let rawEvents = [];
//   let viewMode = ref('today');
//   let activeDayIdx = null;

//   // Dates
//   function toTallinn(date){ 
//     // If the date is already in Europe/Tallinn timezone (from server), just return it
//     // The server sends times in Europe/Tallinn, so we don't need conversion
//     return date;
//   }
//   function getWeek(date){ const t=toTallinn(date); const day=(t.getDay()+6)%7; const mon=new Date(t); mon.setDate(t.getDate()-day); mon.setHours(0,0,0,0); const sun=new Date(mon); sun.setDate(mon.getDate()+6); sun.setHours(23,59,59,999); return {mon,sun}; }
//   function fmtRange(mon, sun){ const f=d=> d.toLocaleDateString('et-EE',{day:'2-digit',month:'2-digit'}); return `${f(mon)} – ${f(sun)}`; }

//   // Chips
//   const DAY_LETTERS=['E','T','K','N','R','L','P'];
//   let chips = computed(function() {
//     let chips = [];
//     for(let i=0;i<7;i++){
//         const d=new Date(week._mon);
//         d.setDate(week._mon.getDate()+i);
//         chips[i] = {
//             day: i,
//             date: d.toLocaleDateString('et-EE',{day:'2-digit',month:'2-digit'}),
//             letter: DAY_LETTERS[i]
//         };
//     }
//   });
//   function renderChips(mon){ 
//     chipsEl.innerHTML='';
//     for(let i=0;i<7;i++){
//         const d=new Date(mon);
//         d.setDate(mon.getDate()+i);
//         const chip=document.createElement('button');
//         chip.className='chip';
//         chip.dataset.idx=String(i);
//         chip.innerHTML=`
//             <span class="letter">${DAY_LETTERS[i]}</span>
//             <span class="date">${d.toLocaleDateString('et-EE',{day:'2-digit',month:'2-digit'})}</span>
//         `;
//         chip.addEventListener('click',()=>{ viewMode='today'; activeDayIdx=i; updateView(); });
//         chipsEl.appendChild(chip);
//     } 
// }
//   function markActiveChip(){ [...chipsEl.children].forEach((el,idx)=>{ el.classList.toggle('active', viewMode==='today' && idx===activeDayIdx); }); }

//   // Events
//   function byStart(a,b){ return new Date(a.startDate||a.start||a.dateStart) - new Date(b.startDate||b.start||b.dateStart); }
//   function normalizeEvent(ev){
//     const parseDateTime=(dateISO,timeStr)=>{ 
//       if(!dateISO && !timeStr) return new Date(NaN); 
//       if(dateISO && timeStr){ 
//         const d=new Date(dateISO); 
//         const [h=0,m=0]=String(timeStr).split(':').map(n=>parseInt(n,10)||0); 
//         // Server sends times in Europe/Tallinn timezone, so create local date instead of UTC
//         return new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m, 0, 0); 
//       } 
//       return new Date(dateISO || timeStr || NaN); 
//     };
//     const start = ev.date ? parseDateTime(ev.date, ev.timeStart) : new Date(ev.startDate||ev.start||ev.dateStart||ev.begin||ev.date||NaN);
//     const end   = ev.date ? parseDateTime(ev.date, ev.timeEnd)   : new Date(ev.endDate  ||ev.end  ||ev.dateEnd  ||ev.finish||NaN);
//     const subject = ev.nameEt || ev.nameEn || ev.name || ev.subject || ev.course || ev.title || ev.subjectName || (ev.lesson && ev.lesson.name) || 'Aine';
//     const room = (ev.rooms && ev.rooms[0] && (ev.rooms[0].roomCode || ev.rooms[0].room || ev.rooms[0].roomName)) || ev.room || ev.location || ev.roomName || '';
//     const teachersArr = Array.isArray(ev.teachers)? ev.teachers.map(t=> t.name || t.fullName || t.fullname || `${t.firstname||t.firstName||''} ${t.lastname||t.lastName||''}`.trim()).filter(Boolean):[];
//     const teacher = teachersArr[0] || ev.teacher || '';
//     const group = (ev.studentGroups && ev.studentGroups[0] && (ev.studentGroups[0].code || ev.studentGroups[0].name || ev.studentGroups[0].uuid)) || '';
//     return { start,end,subject,room,teacher,group, raw:ev };
//   }
//   function sameDayTallinn(a,b){ const at=toTallinn(a), bt=toTallinn(b); return at.getFullYear()===bt.getFullYear() && at.getMonth()===bt.getMonth() && at.getDate()===bt.getDate(); }
//   function isTodayTallinn(d){ 
//     const now = new Date();
//     const tallinnNow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Tallinn' }));
//     return sameDayTallinn(d, tallinnNow); 
//   }
//   function classifyTiming(start,end){ 
//     // Get current time in Europe/Tallinn timezone
//     const now = new Date();
//     const tallinnNow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Tallinn' }));

//     if(!isTodayTallinn(start)) return ''; 

//     const s = start.getTime(); 
//     const e = end.getTime(); 
//     const n = tallinnNow.getTime(); 

//     if(!isFinite(s)||!isFinite(e)) return ''; 
//     if(n>=s && n<=e) return 'current'; 
//     if(n<s) return 'upcoming'; 
//     return ''; 
//   }

//   function renderLessons(){
//     lessonsEl.innerHTML='';
//     const list = rawEvents.map(normalizeEvent).sort(byStart);
//     let filtered=list;
//     if(viewMode==='today'){ const mon=week._mon; const d=new Date(mon); d.setDate(mon.getDate()+activeDayIdx); filtered=list.filter(ev=> sameDayTallinn(ev.start,d)); }
//     if(filtered.length===0){ const div=document.createElement('div'); div.className='empty'; div.textContent = selected? 'Sel päeval pole tunde.' : 'Vali õpperühm või õpetaja, et näha tunniplaani.'; lessonsEl.appendChild(div); return; }
//     for(const ev of filtered){
//       const card=document.createElement('div');
//       const time=`${ev.start.toLocaleTimeString('et-EE',{hour:'2-digit',minute:'2-digit'})}–${ev.end.toLocaleTimeString('et-EE',{hour:'2-digit',minute:'2-digit'})}`;
//       const date=ev.start.toLocaleDateString('et-EE',{day:'2-digit',month:'2-digit'});
//       const isToday=viewMode==='week' && isTodayTallinn(ev.start);
//       const timing=classifyTiming(ev.start,ev.end);
//       card.className='lesson'+(isToday?' today':'')+(timing==='current'?' is-current':timing==='upcoming'?' is-upcoming':'');
//       card.innerHTML=
//         '<div class="weekday">'+DAY_LETTERS[(ev.start.getDay()+6)%7]+'</div>'+
//         '<div class="time">'+
//           '<div>'+date+'</div>'+
//           '<div>'+time+'</div>'+
//         '</div>'+
//         '<div>'+
//           '<div class="subject">'+escapeHtml(ev.subject)+'</div>'+
//             '<div class="meta">'+
//             (ev.room? '<span>Ruum: '+escapeHtml(ev.room)+'</span>':'')+
//             ((selected && selected.type==='teacher' && ev.group) ? '<span>Rühm: '+escapeHtml(ev.group)+'</span>' : (ev.teacher? '<span>Õpetaja: '+escapeHtml(ev.teacher)+'</span>':''))+
//           '</div>'+
//         '</div>';
//       lessonsEl.appendChild(card);
//     }
//   }

//   // Helper for UTC ISO format (needed for API)
//   function isoZ(d){ const pad=n=>String(n).padStart(2,'0'); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}.${String(d.getUTCMilliseconds()).padStart(3,'0')}Z`; }

//   const week=(()=>{ 
//     // Get current time in Europe/Tallinn timezone for display calculations
//     const now = new Date();
//     const tallinnNow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Tallinn' }));
//     const {mon,sun}=getWeek(tallinnNow); 

//     // For API calls, we need to convert the Tallinn dates back to UTC format
//     // The API expects UTC timestamps even though the data is Europe/Tallinn
//     const fromUTC = new Date(Date.UTC(mon.getFullYear(), mon.getMonth(), mon.getDate(), 0, 0, 0, 0));
//     const thruUTC = new Date(Date.UTC(sun.getFullYear(), sun.getMonth(), sun.getDate(), 23, 59, 59, 999));

//     return {_mon:mon,_sun:sun, from: isoZ(fromUTC), thru: isoZ(thruUTC)}; 
//   })();
//   function updateWeekUI(){ weekRangeEl.textContent=fmtRange(week._mon,week._sun); renderChips(week._mon); }

//   async function loadTimetable(){
//     if(!selected) return;
//     setLoading(true);
//     try{
//       const url = selected.type==='teacher'
//         ? prox(API.timetableByTeacher({from:week.from, thru:week.thru, uuid:selected.uuid}))
//         : prox(API.timetableByGroup({from:week.from, thru:week.thru, uuid:selected.uuid}));
//       const res = await fetch(url,{headers:{'Accept':'application/json'}});
//       if(!res.ok){ const txt=await res.text(); throw new Error('Võrguviga: '+res.status+' '+txt.slice(0,200)); }
//       const data=await res.json();
//       rawEvents=(Array.isArray(data)?data:(data.content||data.events||data.results||[])).filter(Boolean);
//       renderLessons();
//     }catch(err){
//       console.error(err);
//       rawEvents=[]; lessonsEl.innerHTML=''; const d=document.createElement('div'); d.className='empty';
//       d.innerHTML='Tunniplaani laadimine ebaõnnestus.'+'<br/>'+'Kui näed CORS viga, määra <code>PROXY</code> muutuja lehe alguses või testi arenduses CORS-bypassiga.'+'<br/>'+'Prod-keskkonnas on soovitus kasutada oma serveripoolset proksit.';
//       lessonsEl.appendChild(d);
//     }finally{ setLoading(false); }
//   }

//   // Loading affordance
//   let loadingCount=0; function setLoading(on){ loadingCount+=on?1:-1; const busy=loadingCount>0; document.body.style.cursor=busy?'progress':'auto'; [btnToday,btnWeek,groupInput].forEach(el=> el.disabled=!!busy); }

//   // Autocomplete
//   let acAbort=null; let acIdx=-1; let lastResults=[];
//   function showSuggest(items){
//     lastResults=items||[]; suggest.innerHTML='';
//     if(!items || !items.length){ suggest.classList.remove('show'); groupInput.setAttribute('aria-expanded','false'); return; }
//     items.forEach((it,i)=>{
//       const li=document.createElement('li');
//       li.dataset.type=it.type; // hidden type marker
//       li.innerHTML = `<div><strong>${escapeHtml(it.name)}</strong></div><small class="type-chip" aria-hidden="true" style="display:none;">${it.type}</small>`;
//       li.addEventListener('click',()=> selectEntity(it));
//       if(i===acIdx) li.classList.add('active');
//       suggest.appendChild(li);
//     });
//     suggest.classList.add('show');
//     groupInput.setAttribute('aria-expanded','true');
//   }

//   async function searchBoth(q){
//     if(acAbort) acAbort.abort(); acAbort = new AbortController();
//     if(!q || q.trim().length<2){ showSuggest([]); return; }
//     try{
//       const [gRes,tRes] = await Promise.all([
//         fetch(prox(API.groupSearch(q.trim())), {signal:acAbort.signal, headers:{'Accept':'application/json'}}),
//         fetch(prox(API.teacherSearch(q.trim())), {signal:acAbort.signal, headers:{'Accept':'application/json'}})
//       ]);
//       if(!gRes.ok && !tRes.ok){ throw new Error('Võrguviga'); }
//       const [gData,tData] = [ gRes.ok? await gRes.json(): [], tRes.ok? await tRes.json(): [] ];
//       const groups = (Array.isArray(gData)? gData : (gData.content||gData.results||[])).map(row=>({ uuid: row.studentGroupUuid||row.uuid||row.id, name: row.nameEt||row.name||row.code||'Rühm', type:'group' })).filter(x=>x.uuid);
//       const teachers = (Array.isArray(tData)? tData : (tData.content||tData.results||[])).map(row=>({ uuid: row.teacherUuid||row.uuid||row.id, name: row.nameEt||row.name||row.fullName||row.fullname||`${row.firstName||row.firstname||''} ${row.lastName||row.lastname||''}`.trim()||'Õpetaja', type:'teacher' })).filter(x=>x.uuid);
//       // Merge: teachers first if query looks like a name, else groups first — simple heuristic
//       const qHasSpace = q.includes(' ');
//       const merged = qHasSpace ? [...teachers, ...groups] : [...groups, ...teachers];
//       acIdx=-1; showSuggest(merged);
//     }catch(err){ if(err.name!=='AbortError'){ console.warn(err); showSuggest([]); } }
//   }

//   function selectEntity(item){
//     selected = { uuid:item.uuid, name:item.name, type:item.type };
//     localStorage.setItem(LS_KEY, JSON.stringify(selected));
//     groupInput.value = item.name; groupBox.classList.add('has-value'); showSuggest([]);
//     loadTimetable();
//   }

//   groupInput.addEventListener('input', ()=>{ groupBox.classList.toggle('has-value', !!groupInput.value); searchBoth(groupInput.value); });
//   groupInput.addEventListener('keydown', (e)=>{
//     const items=[...suggest.children]; if(!items.length) return;
//     if(e.key==='ArrowDown'){ e.preventDefault(); acIdx=Math.min(items.length-1, acIdx+1); highlight(items); }
//     if(e.key==='ArrowUp'){ e.preventDefault(); acIdx=Math.max(0, acIdx-1); highlight(items); }
//     if(e.key==='Enter'){ e.preventDefault(); const li=items[acIdx]; if(li){ const it=lastResults[acIdx]; if(it) selectEntity(it); }}
//   });
//   function highlight(items){ items.forEach((li,i)=> li.classList.toggle('active', i===acIdx)); }
//   clearGroup.addEventListener('click',()=>{ groupInput.value=''; groupBox.classList.remove('has-value'); selected=null; localStorage.removeItem(LS_KEY); rawEvents=[]; renderLessons(); emptyEl.hidden=false; showSuggest([]); });

//   // Toggles
//   btnToday.addEventListener('click',()=>{ 
//     viewMode='today'; 
//     const now = new Date();
//     const tallinnNow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Tallinn' }));
//     activeDayIdx = ( (tallinnNow.getDay()+6)%7 ); 
//     updateView(); 
//   });
//   btnWeek.addEventListener('click',()=>{ viewMode='week'; updateView(); });
//   function updateView(){ btnWeek.classList.toggle('primary', viewMode==='week'); btnToday.classList.toggle('primary', viewMode==='today'); markActiveChip(); renderLessons(); }

//   // Helpers
//   function escapeHtml(str){ return String(str||'').replace(/[&<>"']/g, s=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[s])); }

//   // Init
//   (function init(){
//     updateWeekUI();
//     const now = new Date();
//     const tallinnNow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Tallinn' }));
//     activeDayIdx = ( (tallinnNow.getDay()+6)%7 );
//     updateView();
//     try{
//       // backwards compat with old key
//       const legacy = JSON.parse(localStorage.getItem('tahvel.group')||'null');
//       const saved = JSON.parse(localStorage.getItem(LS_KEY)||'null') || (legacy? {uuid:legacy.uuid, name:legacy.name, type:'group'} : null);
//       if(saved && saved.uuid){ selected=saved; groupInput.value=saved.name||''; groupBox.classList.add('has-value'); loadTimetable(); }
//       else { emptyEl.hidden=false; }
//     }catch{ emptyEl.hidden=false; }
//   })();

// Self-tests (console)
//   ;(function tests(){
//     const urlG = API.timetableByGroup({from:'2025-10-27T00:00:00.000Z', thru:'2025-11-02T23:59:59.999Z', uuid:'group-uuid'});
//     const urlT = API.timetableByTeacher({from:'2025-10-27T00:00:00.000Z', thru:'2025-11-02T23:59:59.999Z', uuid:'teacher-uuid'});
//     console.assert(urlG.includes('studentGroups=group-uuid'), 'Group URL should contain studentGroups param');
//     console.assert(urlT.includes('teachers=teacher-uuid'), 'Teacher URL should contain teachers param');
//   })();
let displayType = ref('week');
function toggle(type) {
  displayType.value = type;
}
let lessons = ref([]);
function result(data) {
 
  lessons.value = data.content.map(l => {
    let date = new Date(l.date);
    return { 
      day: DAY_LETTERS[(date.getDay() + 6) % 7],
      date: date.getDate() + '.' + (parseInt(date.getMonth())+1),
      time: {
          start: l.timeStart,
          end: l.timeEnd 
        },
      name: l.nameEt,
      room: l.rooms[0]?.roomCode,
      group: l.studentGroups[0]?.code,
      teacher: l.teachers[0]?.name
    };
  });
  console.log(lessons.value);
}
</script>
<template>
  <div class="wrap">
    <header>
      <div class="brand">
        <div class="logo" aria-hidden="true"></div>
        <h1>Tunniplaan</h1>
      </div>
    </header>

    <div class="controls">
      <Suspense>
        <Search :from="from" :thru="thru" @result="result"></Search>
      </Suspense>
      <div class="week-range" id="weekRange"> </div>
      <DayWeekToggle :current="displayType" @toggle="toggle"></DayWeekToggle>
    </div>


    <DayChips :chips="chips"></DayChips>
    <LessonsGrid :lessons="lessons"></LessonsGrid>

    <footer></footer>
  </div>
</template>