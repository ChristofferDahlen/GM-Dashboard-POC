<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePeer } from './composables/usePeer.js'
import CharacterRow from './components/CharacterRow.vue'

const { myPeerId, connectionStatus, statusMessage, log, init, connectTo, disconnect } = usePeer()

const characters = ref([])
const gmPeerId = ref('')

const sorted = computed(() => [...characters.value].sort((a, b) => b.initiative - a.initiative))

function handleData(data) {
  if (data.type === 'full_sync') {
    characters.value = data.characters
  } else if (data.type === 'update') {
    const idx = characters.value.findIndex(c => c.id === data.character.id)
    if (idx !== -1) characters.value[idx] = data.character
    else characters.value.push(data.character)
  } else if (data.type === 'remove') {
    characters.value = characters.value.filter(c => c.id !== data.id)
  }
}

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const paramId = params.get('gmPeerId')
  if (paramId) gmPeerId.value = paramId

  init(handleData, () => {
    // Prefer URL param, fall back to localStorage
    if (!gmPeerId.value) {
      const stored = localStorage.getItem('gm-peer-id')
      if (stored) gmPeerId.value = stored
    }
    if (gmPeerId.value) connectTo(gmPeerId.value, handleData)
  })
})

function onConnect() {
  connectTo(gmPeerId.value, handleData)
}
</script>

<template>
  <h1>🛡️ Player View (This is just a POC demo, not for use)</h1>

  <div class="panel">
    <h2>Connection</h2>
    <p v-if="myPeerId">Your Peer ID: <span class="peer-id">{{ myPeerId }}</span></p>
    <div :class="['status', connectionStatus]">{{ statusMessage }}</div>
    <template v-if="connectionStatus !== 'connected'">
      <label>GM Peer ID</label>
      <input v-model="gmPeerId" placeholder="Enter GM peer ID..." />
      <button @click="onConnect" :disabled="!gmPeerId">Connect to GM</button>
    </template>
    <button v-else @click="disconnect">Disconnect</button>
  </div>

  <div class="panel">
    <h2>Initiative Order</h2>
    <p v-if="sorted.length === 0" class="empty">Waiting for GM to send character data...</p>
    <div class="initiative-list" v-else>
      <CharacterRow v-for="char in sorted" :key="char.id" :char="char" />
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
.status { font-size: 0.85rem; padding: 6px 10px; border-radius: 4px; margin-bottom: 12px; }
.status.connected { background: #1a3a1a; color: #6f6; border: 1px solid #6f6; }
.status.disconnected { background: #3a1a1a; color: #f66; border: 1px solid #f66; }
.status.waiting { background: #1a1a3a; color: #66f; border: 1px solid #66f; }
.initiative-list { display: flex; flex-direction: column; gap: 8px; }
.empty { color: #506080; font-style: italic; text-align: center; padding: 20px; }
.log { font-size: 0.8rem; color: #6080a0; max-height: 120px; overflow-y: auto; }
.log p { padding: 2px 0; border-bottom: 1px solid #7ab0e011; }
</style>
