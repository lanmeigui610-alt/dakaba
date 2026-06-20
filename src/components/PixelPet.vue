<template>
  <button class="fixed bottom-24 right-4 z-40 tap" @click="poke" aria-label="像素宠物">
    <div class="relative">
      <div v-if="message" class="absolute bottom-16 right-1 w-28 rounded-lg bg-zinc-950 px-3 py-2 text-xs text-white shadow-soft dark:bg-white dark:text-zinc-950">{{ message }}</div>
      <div :class="['pet pixelated', mood]">
        <span class="eye left"></span>
        <span class="eye right"></span>
        <span class="mouth"></span>
      </div>
    </div>
  </button>
</template>

<script setup>
import { ref } from 'vue'

const mood = ref('idle')
const message = ref('')

function poke() {
  mood.value = 'happy'
  message.value = ['今天也很棒', '哒咔一下', '我在陪你'][Math.floor(Math.random() * 3)]
  setTimeout(() => {
    mood.value = 'idle'
    message.value = ''
  }, 1600)
}

defineExpose({ poke })
</script>

<style scoped>
.pet {
  width: 56px;
  height: 48px;
  position: relative;
  border: 4px solid #121212;
  background: #52d273;
  box-shadow: inset -8px -8px 0 #2da85d, 0 10px 24px rgba(0,0,0,.25);
  border-radius: 6px;
}
.pet::before,
.pet::after {
  content: "";
  position: absolute;
  top: -12px;
  width: 10px;
  height: 12px;
  background: #52d273;
  border: 4px solid #121212;
  border-bottom: 0;
}
.pet::before { left: 8px; }
.pet::after { right: 8px; }
.eye {
  position: absolute;
  top: 17px;
  width: 7px;
  height: 7px;
  background: #121212;
}
.left { left: 13px; }
.right { right: 13px; }
.mouth {
  position: absolute;
  left: 22px;
  bottom: 10px;
  width: 12px;
  height: 4px;
  background: #121212;
}
.happy {
  animation: bounce .45s ease-in-out 2;
}
.happy .mouth {
  height: 8px;
  border-radius: 0 0 8px 8px;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
</style>
