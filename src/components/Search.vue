<script setup>
import { ref } from 'vue';
let {from, thru} = defineProps(['from', 'thru']);
let emit = defineEmits(['result']);
let searchValue = ref('');
//   // Proxy
const API = {
    groupSearch: (q) => `https://tahveltp.edu.ee/hois_back/timetables/group/14?lang=ET&name=${encodeURIComponent(q)}`,
    teacherSearch: (q) => `https://tahveltp.edu.ee/hois_back/timetables/teacher/14?lang=ET&name=${encodeURIComponent(q)}`,
    timetableByGroup: (from, thru, uuid) => (
      `https://tahveltp.edu.ee/hois_back/timetableevents/timetableSearch?`+
      `from=${encodeURIComponent(from)}&lang=ET&page=0&schoolId=14&size=200&studentGroups=${encodeURIComponent(uuid)}&thru=${encodeURIComponent(thru)}`
    ),
    timetableByTeacher: (from, thru, uuid) => (
      `https://tahveltp.edu.ee/hois_back/timetableevents/timetableSearch?`+
      `from=${encodeURIComponent(from)}&lang=ET&page=0&schoolId=14&size=200&teachers=${encodeURIComponent(uuid)}&thru=${encodeURIComponent(thru)}`
    ),
  };
  const PROXY = 'https://tahvel-tunniplaan-proxy.azurewebsites.net/api/proxy';
  const prox = (url) => PROXY ? `${PROXY}?url=${encodeURIComponent(url)}` : url;

async function request(url) {
    let response = await fetch(prox(url));
    return await response.json();
}

async function autocomplete() {
    
    let data = await request(API.teacherSearch(searchValue.value));
    
   options.value =  data.content.map(c => {
        return {id: c.id, name: c.fullname, uuid: c.teacherUuid, type: 'teacher'}
   });
   data = await request(API.groupSearch(searchValue.value));
   options.value.push(...data.content.map(c => {
        return {id: c.id, name: c.nameEt, uuid: c.studentGroupUuid, type: 'group'}
   }));
   
}

let options = ref([]);
let selected = ref({});
async function search(selected){
   
    searchValue.value = selected.name; 
    options.value = [];
    let data
    if(selected.type === 'teacher') {
        data = await request(API.timetableByTeacher(from, thru, selected.uuid));
    } else if(selected.type === 'group') {
        data = await request(API.timetableByGroup(from, thru, selected.uuid));
    }
    emit('result', data);
}
</script>
<template>
    <div class="group" id="groupBox">
        <input v-model="searchValue" @input="autocomplete" id="groupInput" type="text" placeholder="Otsi õpperühma või õpetajat…" autocomplete="off"
            aria-autocomplete="list" aria-expanded="false" />
        <button class="clear-btn" id="clearGroup" title="Puhasta">×</button>
        <ul class="suggest" id="suggest" :class="{show: options.length}">
            <li v-for="option in options" @click="search(option)">
                <div>
                    <strong>{{ option.name }}</strong>
                </div>
                <small class="type-chip" aria-hidden="true" style="display:none;">
                    {{ option.type }}
                </small>
            </li>
        </ul>
    </div>
</template>