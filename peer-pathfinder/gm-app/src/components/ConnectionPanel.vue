<script setup>
import { ref } from 'vue'

const props = defineProps({
  myPeerId: String,
  connectionStatus: String,
  statusMessage: String,
})

const emit = defineEmits(['connect', 'disconnect', 'openPlayerApp', 'broadcastAll'])

const targetPeerId = ref('')
</script>

<template>
  <div class="panel">
    <h2>Connection</h2>
    <p v-if="myPeerId">Your Peer ID: <span class="peer-id">{{ myPeerId }}</span></p>
    <button @click="emit('openPlayerApp')" style="margin: 10px 0 12px">Open Player App</button>

    <div :class="['status', connectionStatus]">{{ statusMessage }}</div>

    <template v-if="connectionStatus !== 'connected'">
      <label>Connect to Player Peer ID</label>
      <input v-model="targetPeerId" placeholder="Enter player peer ID..." />
      <button @click="emit('connect', targetPeerId)" :disabled="!targetPeerId">Connect</button>
    </template>
    <template v-else>
      <button @click="emit('disconnect')">Disconnect</button>
      <button @click="emit('broadcastAll')">Broadcast All</button>
    </template>
  </div>
</template>

<style scoped>
.status { font-size: 0.85rem; padding: 6px 10px; border-radius: 4px; margin-bottom: 12px; }
.status.connected { background: #1a3a1a; color: #6f6; border: 1px solid #6f6; }
.status.disconnected { background: #3a1a1a; color: #f66; border: 1px solid #f66; }
.status.waiting { background: #3a3a1a; color: #ff6; border: 1px solid #ff6; }
</style>
