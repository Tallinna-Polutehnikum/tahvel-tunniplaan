<script setup>
import { computed, onMounted, ref } from 'vue';
import DayChips from './components/DayChips.vue';
import DayWeekToggle from './components/DayWeekToggle.vue';
import Search from './components/Search.vue';
import LessonsGrid from './components/LessonsGrid.vue';
import { DateTime,Settings } from "luxon";
Settings.defaultZone = 'Europe/Tallinn';

// Constants
const DAY_LETTERS = ['E', 'T', 'K', 'N', 'R', 'L', 'P']; // Mon-Sun

const BASE_URL = 'https://tahveltp.edu.ee/hois_back';

// Proxy
const API = {
    groupSearch: (q) => `${BASE_URL}/timetables/group/14?lang=ET&name=${encodeURIComponent(q)}`,
    teacherSearch: (q) => `${BASE_URL}/timetables/teacher/14?lang=ET&name=${encodeURIComponent(q)}`,
    timetableByGroup: (from, thru, uuid) => (
      `${BASE_URL}/timetableevents/timetableSearch?`+
      `from=${encodeURIComponent(from)}&lang=ET&page=0&schoolId=14&size=200&studentGroups=${encodeURIComponent(uuid)}&thru=${encodeURIComponent(thru)}`
    ),
    timetableByTeacher: (from, thru, uuid) => (
      `${BASE_URL}/timetableevents/timetableSearch?`+
      `from=${encodeURIComponent(from)}&lang=ET&page=0&schoolId=14&size=200&teachers=${encodeURIComponent(uuid)}&thru=${encodeURIComponent(thru)}`
    ),
  };
const PROXY = 'https://tahvel-tunniplaan-proxy.azurewebsites.net/api/proxy';
const prox = (url) => PROXY ? `${PROXY}?url=${encodeURIComponent(url)}` : url;


// state

let day = ref(null);
let displayType = ref('week');
let lessons = ref([]);
let searchValue = ref('');
let options = ref([]);
let selectedSearch = ref(null);

// Computed
let from = computed(() => {
  if(displayType.value === 'week'){
    return DateTime.now().setZone('UTC').startOf('week');
  }
  if(displayType.value === 'today'){
    return DateTime.now().setZone('UTC').startOf('day')
  }
  if(displayType.value === 'day') {
    return DateTime.now().setZone('UTC').startOf('week').plus({ days: day.value }).startOf('day');
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
    return DateTime.now().setZone('UTC').startOf('week').plus({ days: day.value }).endOf('day');
  }
});
if(localStorage.getItem('tahvel.selection')){
  selectedSearch.value = JSON.parse(localStorage.getItem('tahvel.selection'));
  searchValue.value = selectedSearch.value.name;
  search(selectedSearch.value);
}
// create array and fill with day chips
let chips = Array.from({ length: 7 }, (_, i) => {
  const date = DateTime.now().startOf('week').plus({ days: i });
  return {
    day: i,
    date: date.toFormat('dd.MM'),
    letter: DAY_LETTERS[i]
  };
});


function toggle(type) {
  displayType.value = type;
  day.value = null;
  search(selectedSearch.value);
}



function setDay(d) {

  day.value = d; // 0=Mon ... 6=Sun
  displayType.value = 'day';
  search(selectedSearch.value);
}

async function request(url) {
    let response = await fetch(prox(url));
    return await response.json();
}

async function autocomplete(value) {

    let data = await request(API.teacherSearch(value));
    
   options.value =  data.content.map(c => {
        return {id: c.id, name: c.fullname, uuid: c.teacherUuid, type: 'teacher'}
   });
   data = await request(API.groupSearch(value));
   options.value.push(...data.content.map(c => {
        return {id: c.id, name: c.nameEt, uuid: c.studentGroupUuid, type: 'group'}
   }));
   
}

async function search(selected){
  console.log(selected);
  if(!selected) return;
    selectedSearch.value = selected;
    searchValue.value = selected.name; 
    localStorage.setItem('tahvel.selection', JSON.stringify(selectedSearch.value));
    options.value = [];
    let data
    if(selected.type === 'teacher') {
        data = await request(API.timetableByTeacher(from.value, thru.value, selected.uuid));
    } else if(selected.type === 'group') {
        data = await request(API.timetableByGroup(from.value, thru.value, selected.uuid));
    }
    lessons.value = data.content.map(l => {
    return { 
      day: DAY_LETTERS[DateTime.fromISO(l.date).weekday-1],
      date: DateTime.fromISO(l.date).toFormat('dd.MM'),
      time: {
          start: l.timeStart,
          end: l.timeEnd 
        },
      name: l.nameEt,
      room: l.rooms[0]?.roomCode,
      group: l.studentGroups[0]?.code,
      teacher: l.teachers[0]?.name,
      isToday: displayType.value === 'week' && DateTime.fromISO(l.date).hasSame(DateTime.now(), 'day')
    };
  });
}

function clearSearch(){
    selectedSearch.value = null;
    searchValue.value = '';
    lessons.value = [];
    options.value = [];
    localStorage.removeItem('tahvel.selection');
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
        <Search :searchValue="searchValue" @update="autocomplete" @selected="search" :options="options" @clear="clearSearch"></Search>
      </Suspense>
      <div class="week-range" id="weekRange"> </div>
      <DayWeekToggle :current="displayType" @toggle="toggle"></DayWeekToggle>
    </div>


    <DayChips :chips="chips" @choose="setDay" :day="day"></DayChips>
    <LessonsGrid :lessons="lessons"></LessonsGrid>
    <div class="empty" id="empty" :hidden="selectedSearch">Vali õpperühm või õpetaja, et näha tunniplaani.</div>
    <div class="empty" id="empty" :hidden="lessons.length || !selectedSearch">Sel päeval pole tunde.</div>

    
    <footer></footer>
  </div>
</template>