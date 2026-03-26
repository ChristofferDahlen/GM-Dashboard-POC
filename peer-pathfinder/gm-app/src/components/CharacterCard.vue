<script setup>
const CONDITIONS = [
  'Blinded', 'Confused', 'Dazzled', 'Deafened', 'Dying',
  'Fatigued', 'Frightened', 'Paralyzed', 'Prone', 'Sickened', 'Stunned'
]

const props = defineProps({
  char: Object,
})

const emit = defineEmits(['update', 'remove'])

function toggleCondition(cond) {
  const updated = { ...props.char, conditions: [...props.char.conditions] }
  const idx = updated.conditions.indexOf(cond)
  if (idx === -1) updated.conditions.push(cond)
  else updated.conditions.splice(idx, 1)
  emit('update', updated)
}

function onHpChange(e) {
  emit('update', { ...props.char, hp: Number(e.target.value) })
}
</script>

<template>
  <div class="card">
    <div class="card-header">
      <span class="name">{{ char.name }}</span>
      <span class="player">{{ char.player }}</span>
    </div>
    <div class="stats">
      <div class="stat">
        <span class="lbl">Initiative</span>
        <span class="val">{{ char.initiative }}</span>
      </div>
      <div class="stat">
        <span class="lbl">HP</span>
        <span class="val">
          <input type="number" :value="char.hp" @change="onHpChange" class="hp-input" />
          / {{ char.hpMax }}
        </span>
      </div>
      <div class="stat">
        <span class="lbl">AC</span>
        <span class="val">{{ char.ac }}</span>
      </div>
    </div>
    <div class="conditions">
      <span
        v-for="cond in CONDITIONS"
        :key="cond"
        :class="['badge', { active: char.conditions.includes(cond) }]"
        @click="toggleCondition(cond)"
      >{{ cond }}</span>
    </div>
    <div class="actions">
      <button @click="emit('update', { ...char })">Send Update</button>
      <button class="danger" @click="emit('remove', char.id)">Remove</button>
    </div>
  </div>
</template>

<style scoped>
.card { background: #1a0a00; border: 1px solid #c8a84b44; border-radius: 6px; padding: 12px; }
.card-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
.name { font-size: 1rem; font-weight: bold; color: #f0d9a0; }
.player { font-size: 0.75rem; color: #a08060; }
.stats { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
.stat { display: flex; justify-content: space-between; font-size: 0.9rem; padding: 2px 0; border-bottom: 1px solid #c8a84b22; }
.stat:last-child { border-bottom: none; }
.lbl { color: #a08060; }
.hp-input { width: 50px; padding: 2px 4px; margin: 0; }
.conditions { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px; }
.badge { padding: 2px 8px; border-radius: 12px; font-size: 0.72rem; cursor: pointer; background: #2a1500; border: 1px solid #c8a84b44; color: #a08060; user-select: none; }
.badge.active { background: #5a1a00; border-color: #f66; color: #f99; }
.actions { display: flex; gap: 6px; }
.actions button { padding: 4px 10px; font-size: 0.8rem; }
.danger { background: #8b0000; color: #f0d9a0; }
.danger:hover { background: #b00000; }
</style>
