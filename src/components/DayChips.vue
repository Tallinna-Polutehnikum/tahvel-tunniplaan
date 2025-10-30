<script setup>
import { computed } from '@vue/reactivity';
defineProps(['chips', 'day']);
</script>

<template>
     <div class="days" id="dayChips" aria-label="Nädalapäevad">
            <button class="chip" :class="{ active: day === chip.day }" v-for="chip in chips" @click="$emit('choose', chip.day)">
                <span class="letter">{{ chip.letter }}</span>
                <span class="date">{{ chip.date }}</span>
            </button>
        </div>
</template>