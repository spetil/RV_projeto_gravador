<template>
  <div class="container">

    <div
      v-if="isRecording"
      class="timer"
    >
      00:{{ remainingTime.toString().padStart(2, '0') }}
    </div>
    <input
    v-model="audioName"
    class="name-input"
    maxlength="30"
    placeholder="Digite seu nome"/>
    <button
      v-if="!isRecording"
      class="record-btn"
      @click="startRecording"
    >
      <Mic :size="80" />
    </button>

    <button
      v-else
      class="stop-btn"
      @click="stopRecording"
    >
      <Square :size="60" />
    </button>

    <audio
      v-if="audioUrl"
      :src="audioUrl"
      controls
      class="audio-player"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Mic, Square } from 'lucide-vue-next'
const audioName = ref('')
const isRecording = ref(false)
const audioUrl = ref(null)

const maxDuration = 15
const remainingTime = ref(maxDuration)

let mediaRecorder
let chunks = []
let countdownInterval
let currentStream

function startCountdown() {
  remainingTime.value = maxDuration

  countdownInterval = setInterval(() => {
    remainingTime.value--

    if (remainingTime.value <= 0) {
      stopRecording()
    }
  }, 1000)
}

const startRecording = async () => {
    if (!audioName.value.trim()) {
    alert('Digite um nome')
    return
  }
  currentStream = await navigator.mediaDevices.getUserMedia({
    audio: true
  })

  mediaRecorder = new MediaRecorder(currentStream)

  chunks = []

  mediaRecorder.ondataavailable = (event) => {
    chunks.push(event.data)
  }

  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, {
      type: 'audio/webm'
    })

    audioUrl.value = URL.createObjectURL(blob)

    currentStream
      ?.getTracks()
      .forEach(track => track.stop())
  }

  mediaRecorder.start()

  isRecording.value = true

  startCountdown()
}

const stopRecording = () => {
  if (!mediaRecorder || mediaRecorder.state === 'inactive') {
    return
  }

  clearInterval(countdownInterval)

  mediaRecorder.stop()

  isRecording.value = false
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #000;
  overflow: hidden;
}

#app {
  width: 100%;
  height: 100vh;
}

.container {
  width: 100%;
  height: 100vh;
  background: #000;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 40px;
}

.timer {
  color: white;
  font-size: 3rem;
  font-weight: bold;
  font-family: monospace;
}

.record-btn,
.stop-btn {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: none;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  transition: 0.3s;
}

.record-btn {
  background: #ff2d55;
  color: white;

  box-shadow:
    0 0 30px rgba(255, 45, 85, 0.5),
    0 0 60px rgba(255, 45, 85, 0.3);

  animation: pulse 1.5s infinite;
}

.stop-btn {
  background: #1f1f1f;
  color: #ff2d55;
  border: 2px solid #ff2d55;
}

.record-btn:hover,
.stop-btn:hover {
  transform: scale(1.05);
}

.audio-player {
  width: 90%;
  max-width: 400px;
}

@keyframes pulse {
  0% {
    box-shadow:
      0 0 20px rgba(255, 45, 85, 0.4),
      0 0 40px rgba(255, 45, 85, 0.2);
  }

  50% {
    box-shadow:
      0 0 40px rgba(255, 45, 85, 0.8),
      0 0 80px rgba(255, 45, 85, 0.4);
  }

  100% {
    box-shadow:
      0 0 20px rgba(255, 45, 85, 0.4),
      0 0 40px rgba(255, 45, 85, 0.2);
  }
}
.name-input {
  width: 300px;
  max-width: 90%;

  padding: 14px;

  border-radius: 12px;
  border: 1px solid #333;

  background: #111;
  color: white;

  font-size: 16px;
}
</style>