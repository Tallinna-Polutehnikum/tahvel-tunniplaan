<script setup>
import { ref, watch } from 'vue';
let {searchValue, options} = defineProps(['searchValue', 'options']);
let value = ref(searchValue);

// vue listen for searchValue changes
watch(() => searchValue, (newValue) => {
    value.value = newValue;
});
</script>
<template>
    <div class="group" id="groupBox" :class="{ 'has-value': value }">
        <input v-model="value" @input="$emit('update', value)" id="groupInput" type="text" placeholder="Otsi õpperühma või õpetajat…" autocomplete="off"
            aria-autocomplete="list" aria-expanded="false" />
        <button class="clear-btn" id="clearGroup" title="Puhasta" @click="$emit('clear')">×</button>
        <ul class="suggest" id="suggest" :class="{show: options.length}">
            <li v-for="option in options" @click="$emit('selected', option)">
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