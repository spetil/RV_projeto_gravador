<template>
  <div v-if="passoAtual === 'resumo'" class="container resumo-wrapper" @click="avancarParaGravacao">
    <div class="resumo-card" @click.stop>
      <div class="lion-badge">🦁</div>
      <h2>Leão de Hermes</h2>
      <p class="projeto-tagline">Uma ponte virtual entre o passado e o presente</p>
      
      <div class="resumo-texto">
        <p>
          Este projeto revive a magia do <strong>Serviço de Alto-Falantes Solon Magalhães</strong>, 
          criado pelo genial <strong>Mestre Adolfo</strong> em Quixadá. 
        </p>
        <p>
          Antigamente, as pessoas iam até os alto-falantes da praça para deixar recados e declarações de amor. 
          Hoje, você pode usar este microfone digital para gravar a sua mensagem!
        </p>
        <p class="destaque-alerta">
          🎵 Seu áudio ficará guardado e só poderá ser ouvido através de Realidade Aumentada por quem estiver fisicamente na <strong>Praça do Leão</strong>.
        </p>
      </div>

      <button class="btn-vamos-la" @click="avancarParaGravacao">Começar Experiência</button>
    </div>
  </div>

  <div v-else-if="passoAtual === 'gravacao'" class="container">
    
    <div v-if="isRecording" class="timer">
      00:{{ remainingTime.toString().padStart(2, '0') }}
    </div>

    <input
      v-model="audioName"
      class="name-input"
      maxlength="30"
      placeholder="Digite seu nome"
      :disabled="isUploading"
    />

    <div v-if="isUploading" style="color: white; font-family: monospace; text-align: center; padding: 0 20px;">
      Enviando para seu amor... ou qualquer aleatório na praça ouvir.
    </div>

    <button
      v-if="!isRecording && !isUploading"
      class="heart-btn record-btn"
      @click="startRecording"
    >
      <div class="heart-wrapper">
        <svg class="heart-svg" viewBox="0 0 200 185" xmlns="http://www.w3.org/2000/svg">
          <path
            class="heart-glow"
            d="M100 170 C100 170 10 110 10 55 C10 25 35 5 65 5 C80 5 92 12 100 22 C108 12 120 5 135 5 C165 5 190 25 190 55 C190 110 100 170 100 170 Z"
            transform="scale(1.18) translate(-16, -12)"
          />
          <path
            class="heart-path"
            d="M100 170 C100 170 10 110 10 55 C10 25 35 5 65 5 C80 5 92 12 100 22 C108 12 120 5 135 5 C165 5 190 25 190 55 C190 110 100 170 100 170 Z"
          />
        </svg>
        <Mic class="heart-icon" :size="52" />
      </div>
    </button>

    <button
      v-else-if="isRecording"
      class="heart-btn stop-btn"
      @click="stopRecording"
    >
      <svg class="heart-svg" viewBox="0 0 200 185" xmlns="http://www.w3.org/2000/svg">
        <path
          class="heart-path-stop"
          d="M100 170 C100 170 10 110 10 55 C10 25 35 5 65 5 C80 5 92 12 100 22 C108 12 120 5 135 5 C165 5 190 25 190 55 C190 110 100 170 100 170 Z"
        />
      </svg>
      <Square class="heart-icon heart-icon-stop" :size="40" />
    </button>

    <audio
      v-if="audioUrl && !isUploading"
      :src="audioUrl"
      controls
      class="audio-player"
    />
  </div>

  <div v-else-if="passoAtual === 'jornada'" class="container praca-direcionamento">
    <div class="jornada-card">
      <div class="pulse-radar">
        <div class="pin"></div>
        <div class="pulse"></div>
      </div>
      
      <h2>Sua voz foi eternizada! Transmissão agendada.</h2>
      <h1>Vá para a Praça do Leão 🦁</h1>
      
      <p>
        O rádio vintage virtual do Mestre Adolfo já está esperando por você. 
        Ao chegar lá com o GPS ligado, clique no botão abaixo para abrir a Realidade Aumentada!
      </p>

      <button @click="goToPraca" class="btn-abrir-ar">
        Cheguei / Abrir Mapa AR 📷
      </button>
    </div>
  </div>

  <PracaComponente v-else-if="passoAtual === 'ar'" />
</template>

<script setup>
import { ref } from 'vue'
import { Mic, Square } from 'lucide-vue-next'
import { createClient } from '@supabase/supabase-js'
import PracaComponente from './praca.vue' // <--- IMPORTANDO SEU COMPONENTE DA PRAÇA AQUI!

const supabaseUrl = 'https://ppsdcoifaifrfgzovwwu.supabase.co'
const supabaseKey = 'sb_publishable_I1kgINGoMJ6h5UYt-q2Kyw_j7-ZP-Wv'
const supabase = createClient(supabaseUrl, supabaseKey)

// Controle de fluxo: 'resumo' -> 'gravacao' -> 'jornada' -> 'ar'
const passoAtual = ref('resumo')

const audioName = ref('')
const isRecording = ref(false)
const isUploading = ref(false)
const audioUrl = ref(null)
const maxDuration = 15
const remainingTime = ref(maxDuration)

let mediaRecorder
let chunks = []
let countdownInterval
let currentStream

const avancarParaGravacao = () => {
  passoAtual.value = 'gravacao'
}

const goToPraca = () => {
  // Muda o estado para 'ar', renderizando diretamente o componente praca.vue na tela
  passoAtual.value = 'ar'
}

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
    alert('Por favor, digite seu nome antes de gravar.')
    return
  }
  
  audioUrl.value = null 
  
  try {
    currentStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(currentStream)
    chunks = []

    mediaRecorder.ondataavailable = (event) => {
      chunks.push(event.data)
    }

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'audio/webm' })
      audioUrl.value = URL.createObjectURL(blob) 
      currentStream?.getTracks().forEach(track => track.stop())
      
      await uploadAudio(blob)
    }

    mediaRecorder.start()
    isRecording.value = true
    startCountdown()
  } catch (err) {
    alert('Erro ao acessar o microfone. Permita o acesso para continuar.')
  }
}

const stopRecording = () => {
  if (!mediaRecorder || mediaRecorder.state === 'inactive') return
  clearInterval(countdownInterval)
  mediaRecorder.stop()
  isRecording.value = false
}

const uploadAudio = async (audioBlob) => {
  isUploading.value = true
  
  try {
    const fileName = `audio_${Date.now()}.webm`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio')
      .upload(fileName, audioBlob, { contentType: 'audio/webm' })

    if (uploadError) throw uploadError
    const { data: publicUrlData } = supabase.storage
      .from('audio')
      .getPublicUrl(fileName)

    const finalAudioUrl = publicUrlData.publicUrl

    const { error: dbError } = await supabase
      .from('mensagens')
      .insert([
        { nome: audioName.value, audio_url: finalAudioUrl }
      ])

    if (dbError) throw dbError

    // Avança para a tela da jornada na praça
    passoAtual.value = 'jornada'

  } catch (error) {
    console.error('Erro no processo de upload:', error)
    alert('Erro ao enviar o áudio. Verifique sua conexão ou configurações.')
  } finally {
    isUploading.value = false
  }
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
  overflow-x: hidden;
  font-family: sans-serif;
}

#app {
  width: 100%;
  min-height: 100vh;
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
  padding: 20px;
}

/* --- ESTILOS DA TELA 1: RESUMO DO PROJETO --- */
.resumo-wrapper {
  cursor: pointer;
}

.resumo-card {
  background: #111;
  border: 1px solid #222;
  border-radius: 20px;
  padding: 30px 24px;
  max-width: 450px;
  width: 100%;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
}

.lion-badge {
  font-size: 3rem;
  margin-bottom: 10px;
}

.resumo-card h2 {
  color: white;
  font-size: 1.8rem;
  margin-bottom: 4px;
}

.projeto-tagline {
  color: #ff2d55;
  font-size: 0.95rem;
  font-weight: bold;
  margin-bottom: 24px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.resumo-texto {
  color: #ccc;
  text-align: left;
  line-height: 1.6;
  font-size: 1rem;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 30px;
}

.destaque-alerta {
  border-left: 3px solid #ff2d55;
  padding-left: 12px;
  color: #eee;
  font-style: italic;
  font-size: 0.95rem;
  background: rgba(255, 45, 85, 0.05);
  padding-top: 6px;
  padding-bottom: 6px;
}


/* --- ESTILOS DA TELA 3: DIRECIONAMENTO PARA A PRAÇA --- */
.jornada-card {
  background: #0a0a0a;
  border: 1px solid #ff2d5533;
  padding: 40px 24px;
  border-radius: 24px;
  text-align: center;
  max-width: 460px;
  width: 100%;
  box-shadow: 0 0 30px rgba(255, 45, 85, 0.15);
}

.jornada-card h2 {
  color: #aaa;
  font-size: 1.1rem;
  font-weight: normal;
  margin-bottom: 10px;
}

.jornada-card h1 {
  color: white;
  font-size: 2rem;
  margin-bottom: 24px;
}

.jornada-card p {
  color: #888;
  line-height: 1.6;
  font-size: 1rem;
  margin-bottom: 35px;
}

/* Animação do radar pulsante */
.pulse-radar {
  position: relative;
  width: 60px;
  height: 60px;
  margin: 0 auto 25px auto;
}
.pin {
  width: 14px;
  height: 14px;
  background: #ff2d55;
  border-radius: 50%;
  position: absolute;
  top: 23px;
  left: 23px;
  z-index: 5;
}
.pulse {
  width: 60px;
  height: 60px;
  border: 2px solid #ff2d55;
  border-radius: 50%;
  position: absolute;
  top: 0;
  left: 0;
  animation: radarBounce 2s ease-out infinite;
  opacity: 0;
}
@keyframes radarBounce {
  0% { transform: scale(0.2); opacity: 0; }
  50% { opacity: 0.5; }
  100% { transform: scale(1.2); opacity: 0; }
}

.btn-abrir-ar {
  background: #ff2d55;
  color: white;
  border: none;
  padding: 16px 30px;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 12px;
  cursor: pointer;
  width: 100%;
  transition: background 0.2s, transform 0.2s;
}
.btn-abrir-ar:hover {
  background: #ff0033;
  transform: scale(1.02);
}


/* --- COMPONENTES REAPROVEITADOS --- */
.timer {
  color: white;
  font-size: 3rem;
  font-weight: bold;
  font-family: monospace;
}

.heart-btn {
  position: relative;
  width: 280px;
  height: 260px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s;
  padding: 0;
}
.heart-wrapper {
  position: relative;
  width: 160px;
  height: 148px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.heart-btn:hover {
  transform: scale(1.05);
}

.heart-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.heart-icon {
  position: relative;
  z-index: 1;
  color: white;
  margin-top: 8px; 
}

.heart-path {
  fill: #ff2d55;
}
.heart-path-stop {
  fill: #1f1f1f;
  stroke: #ff2d55;
  stroke-width: 6;
}

.heart-icon-stop {
  color: #ff2d55;
}

.audio-player {
  width: 90%;
  max-width: 400px;
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
  text-align: center;
}
.heart-glow {
  fill: #ff2d55;
  opacity: 0.3;
  animation: heartPulse 1.5s ease-in-out infinite;
}
@keyframes heartPulse {
  0% { opacity: 0.2; transform: scale(1.10) translate(-9px, -8px); }
  50% { opacity: 0.55; transform: scale(1.22) translate(-18px, -14px); }
  100% { opacity: 0.2; transform: scale(1.10) translate(-9px, -8px); }
}

.btn-vamos-la {
  background: #ff2d55; 
  color: white;
  border: none;
  padding: 14px 30px;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
  width: 100%;
}

.btn-vamos-la:hover {
  background: #ff0033;
  transform: scale(1.02);
}
</style>
