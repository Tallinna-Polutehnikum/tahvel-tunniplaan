<script setup>
defineProps(['current']);
</script>
<template>
    <div class="toggle">
        <button class="btn" :class="{primary: current==='today'}" id="btnToday" @click="$emit('toggle', 'today')">Täna</button>
        <button class="btn" :class="{primary: current==='week'}" id="btnWeek" @click="$emit('toggle', 'week')">Nädal</button>
    </div>
</template>