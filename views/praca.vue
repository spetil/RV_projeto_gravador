<template>
  <div class="praca-container">
    
    <div v-if="!isPlaying" class="start-screen">
      <h2>Bem-vindo à Praça do Leão 🦁</h2>
      <p>Prepare-se para ouvir as mensagens da cidade.</p>
      <button @click="iniciarExperiencia" class="btn-play">Iniciar Experiência Sonora</button>
    </div>

    <div v-else class="playing-screen">
      <h2>Tocando os sons da praça... 🔊</h2>
      <p>Quantidade de mensagens enviadas: {{ playlist.length }}</p>

      <audio
        ref="meuAudio"
        :src="audioAtualUrl"
        @ended="tocarProximo"
        controls
        class="audio-player"
      ></audio>
    </div>
    
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { createClient } from '@supabase/supabase-js'
//n coloquei essa bomba em variavel de ambiente pq é só leitura mesmo, n tem segredo nenhum
const supabaseUrl = 'https://ppsdcoifaifrfgzovwwu.supabase.co'
const supabaseKey = 'sb_publishable_I1kgINGoMJ6h5UYt-q2Kyw_j7-ZP-Wv'
const supabase = createClient(supabaseUrl, supabaseKey)

const playlist = ref([])
const audioAtualUrl = ref('')
const isPlaying = ref(false)

const meuAudio = ref(null) 

onMounted(async () => {
  const { data, error } = await supabase
    .from('mensagens')
    .select('audio_url')
  
  if (data && data.length > 0) {
    playlist.value = data.map(item => item.audio_url).sort(() => Math.random() - 0.5)
  }
})

const iniciarExperiencia = () => {
  if (playlist.value.length === 0) {
    alert('A praça está silenciosa... Volte ao museu e grave a primeira mensagem!')
    return
  }
  
  isPlaying.value = true
  audioAtualUrl.value = playlist.value[0]
  
  setTimeout(() => {
    if (meuAudio.value) meuAudio.value.play()
  }, 100)
}

const tocarProximo = () => {
  if (playlist.value.length <= 1) {
    meuAudio.value.currentTime = 0
    meuAudio.value.play()
    return
  }

  const tocado = playlist.value.shift()
  playlist.value.push(tocado)
  
  audioAtualUrl.value = playlist.value[0]

  setTimeout(() => {
    if (meuAudio.value) {
      meuAudio.value.play()
    }
  }, 150)
}
</script>

<style scoped>
.praca-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #050505; 
  color: white;
  text-align: center;
}

.start-screen, .playing-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.start-screen h2, .playing-screen h2 {
  font-family: sans-serif;
  font-size: 2rem;
  margin-bottom: 10px;
}

.start-screen p, .playing-screen p {
  color: #aaa;
  font-size: 1.1rem;
}

.btn-play {
  background: #ff2d55;
  color: white;
  border: none;
  padding: 16px 32px;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.btn-play:hover {
  background: #ff0033;
  transform: scale(1.05);
}

.audio-player {
  margin-top: 20px;
  width: 300px;
}
</style>
