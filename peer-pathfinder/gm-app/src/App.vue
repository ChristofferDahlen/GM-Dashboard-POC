<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePeer } from './composables/usePeer.js'
import ConnectionPanel from './components/ConnectionPanel.vue'
import AddCharacterPanel from './components/AddCharacterPanel.vue'
import CharacterCard from './components/CharacterCard.vue'

const { myPeerId, connectionStatus, statusMessage, log, init, connectTo, send, disconnect } = usePeer()

const characters = ref([])

const sorted = computed(() => [...characters.value].sort((a, b) => b.initiative - a.initiative))

function handleData(data) {
  // GM doesn't expect data from player in this flow, but handle gracefully
}

onMounted(() => init(handleData))

function onConnect(peerId) {
  connectTo(peerId, handleData, () => broadcastAll())
}

function openPlayerApp() {
  // In dev: swap port 5173 -> 5174. In production: same origin, /player/ path.
  const isDev = window.location.port === '5173'
  const base = isDev
    ? `${window.location.protocol}//${window.location.hostname}:5174`
    : `${window.location.origin}/player`
  window.open(`${base}/?gmPeerId=${myPeerId.value}`, '_blank')
}

function addCharacter(char) {
  const newChar = { id: Date.now(), ...char, conditions: [] }
  characters.value.push(newChar)
  send({ type: 'update', character: { ...newChar } })
}

function updateCharacter(updated) {
  const idx = characters.value.findIndex(c => c.id === updated.id)
  if (idx !== -1) characters.value[idx] = updated
  send({ type: 'update', character: { ...updated } })
}

function removeCharacter(id) {
  characters.value = characters.value.filter(c => c.id !== id)
  send({ type: 'remove', id })
}

function broadcastAll() {
  send({ type: 'full_sync', characters: characters.value.map(c => ({ ...c })) })
}
</script>

<template>
  <h1>⚔️ GM Dashboard (This is just a POC demo, not for use)</h1>

  <ConnectionPanel
    :myPeerId="myPeerId"
    :connectionStatus="connectionStatus"
    :statusMessage="statusMessage"
    @connect="onConnect"
    @disconnect="disconnect"
    @openPlayerApp="openPlayerApp"
    @broadcastAll="broadcastAll"
  />

  <AddCharacterPanel @add="addCharacter" />

  <div class="panel">
    <h2>Characters (by initiative)</h2>
    <div class="characters">
      <CharacterCard
        v-for="char in sorted"
        :key="char.id"
        :char="char"
        @update="updateCharacter"
        @remove="removeCharacter"
      />
    </div>
  </div>

  <div class="panel">
    <h2>Log</h2>
    <div class="log">
      <p v-for="(entry, i) in log" :key="i">{{ entry }}</p>
    </div>
  </div>
</template>

<style scoped>
.characters { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.log { font-size: 0.8rem; color: #a08060; max-height: 120px; overflow-y: auto; }
.log p { padding: 2px 0; border-bottom: 1px solid #c8a84b11; }
</style>
