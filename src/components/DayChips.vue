<script setup>
import { computed } from '@vue/reactivity';
defineProps(['chips']);
</script>

<template>
     <div class="days" id="dayChips" aria-label="Nädalapäevad">
            <button class="chip" v-for="chip in chips">
                <span class="letter">{{ chip.letter }}</span>
                <span class="date">{{ chip.date }}</span>
            </button>
        </div>
</template>