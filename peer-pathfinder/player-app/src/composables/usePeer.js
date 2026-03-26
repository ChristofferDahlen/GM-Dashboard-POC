import { ref } from 'vue'
import { Peer } from 'peerjs'

export function usePeer() {
  const myPeerId = ref('')
  const connectionStatus = ref('disconnected')
  const statusMessage = ref('Not connected')
  const conn = ref(null)
  const log = ref([])
  let peer = null

  function addLog(msg) {
    const time = new Date().toLocaleTimeString()
    log.value.unshift(`[${time}] ${msg}`)
    if (log.value.length > 50) log.value.pop()
  }

  function init(onData, onReady) {
    peer = new Peer()
    peer.on('open', id => {
      myPeerId.value = id
      addLog(`Your Peer ID: ${id}`)
      onReady?.(id)
    })
    peer.on('error', err => addLog(`Peer error: ${err.message}`))
  }

  function connectTo(peerId, onData) {
    if (!peer || !peerId) return
    connectionStatus.value = 'waiting'
    statusMessage.value = 'Connecting to GM...'

    const c = peer.connect(peerId)
    conn.value = c

    c.on('open', () => {
      connectionStatus.value = 'connected'
      statusMessage.value = `Connected to GM (${c.peer})`
      addLog(`Connected to GM: ${c.peer}`)
    })
    c.on('data', data => {
      addLog(`Received: ${data.type}`)
      onData?.(data)
    })
    c.on('close', () => {
      connectionStatus.value = 'disconnected'
      statusMessage.value = 'Disconnected from GM'
      conn.value = null
      addLog('Disconnected from GM')
    })
    c.on('error', err => {
      connectionStatus.value = 'disconnected'
      statusMessage.value = 'Connection failed'
      addLog(`Error: ${err.message}`)
    })
  }

  function disconnect() {
    conn.value?.close()
  }

  return { myPeerId, connectionStatus, statusMessage, log, init, connectTo, disconnect }
}
