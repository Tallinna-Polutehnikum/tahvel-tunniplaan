<script setup>
defineProps(['lessons']);
</script>
<template>
    <div class="grid" id="lessons">
        <div class="lesson" :class="{'today': lesson.isToday}" v-for="lesson in lessons">
            <!-- <div class="weekday">{{ DAY_LETTERS[(ev.start.getDay() + 6) % 7] }}</div> -->
            <div class="weekday">{{ lesson.day }}</div>
            <div class="time">
                <div>{{ lesson.date }}</div>
                <div>{{ lesson.time.start }} - {{ lesson.time.end }}</div>
            </div>
            <div>
                <div class="subject">{{ lesson.name }}</div>
                <div class="meta">
                    <span v-if="lesson.rooms">Ruum: {{ lesson.room }}</span>
                    <span>Rühm: {{ lesson.group }}</span>
                    <span>Õpetaja: {{ lesson.teacher }}</span>
                </div>
            </div>
        </div>
    </div>
    <div class="empty" id="empty" hidden>Vali õpperühm või õpetaja, et näha tunniplaani.</div>
</template>