<script setup>
import { reactive } from 'vue'

const emit = defineEmits(['add'])

const newChar = reactive({
  name: '', player: '', initiative: 0, hp: 10, hpMax: 10, ac: 10
})

function submit() {
  if (!newChar.name) return
  emit('add', { ...newChar })
  Object.assign(newChar, { name: '', player: '', initiative: 0, hp: 10, hpMax: 10, ac: 10 })
}
</script>

<template>
  <div class="panel">
    <h2>Add Character</h2>
    <div class="grid-2">
      <div>
        <label>Name</label>
        <input v-model="newChar.name" placeholder="Character name" />
      </div>
      <div>
        <label>Player</label>
        <input v-model="newChar.player" placeholder="Player name" />
      </div>
    </div>
    <div class="grid-3">
      <div>
        <label>Initiative</label>
        <input v-model.number="newChar.initiative" type="number" />
      </div>
      <div>
        <label>HP / Max HP</label>
        <div class="hp-pair">
          <input v-model.number="newChar.hp" type="number" />
          <input v-model.number="newChar.hpMax" type="number" />
        </div>
      </div>
      <div>
        <label>AC</label>
        <input v-model.number="newChar.ac" type="number" />
      </div>
    </div>
    <button @click="submit">Add Character</button>
  </div>
</template>
