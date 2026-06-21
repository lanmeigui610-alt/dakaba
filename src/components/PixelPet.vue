<template>
  <div
    class="pet-wrap"
    :style="{ left: `${position.x}px`, top: `${position.y}px` }"
    @pointerdown="startDrag"
  >
    <div v-if="message" class="pet-bubble">{{ message }}</div>

    <button v-if="isAway" class="sign tap" type="button" @click.stop="showTravelMessage" aria-label="宠物留言牌">
      <span class="sign-board">!</span>
      <span class="sign-stick"></span>
    </button>

    <button v-else class="pet-button tap" type="button" @click.stop="poke" aria-label="绿色像素宠物">
      <div class="pet-stage" :class="{ watering: mood === 'happy' }">
        <div :class="['pet pixelated', mood, direction]">
          <span class="ear ear-l"></span>
          <span class="ear ear-r"></span>
          <span class="eye left"></span>
          <span class="eye right"></span>
          <span class="cheek cheek-l"></span>
          <span class="cheek cheek-r"></span>
          <span class="mouth"></span>
          <span class="foot foot-l"></span>
          <span class="foot foot-r"></span>
        </div>
        <div class="rose-pot">
          <span class="stem"></span>
          <span class="leaf leaf-a"></span>
          <span class="leaf leaf-b"></span>
          <span class="rose"></span>
          <span class="pot"></span>
          <span v-for="drop in 4" :key="drop" class="water" :style="{ '--i': drop }"></span>
        </div>
        <div class="pet-shadow"></div>
      </div>
    </button>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'

const mood = ref('idle')
const message = ref('')
const isAway = ref(false)
const direction = ref('face-right')
const position = reactive({ x: 720, y: 138 })
const drag = reactive({ active: false, moved: false, offsetX: 0, offsetY: 0 })
let walkTimer
let awayTimer
let returnTimer

function setInitialPosition() {
  const saved = localStorage.getItem('dakaba-pet-position')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      position.x = parsed.x
      position.y = parsed.y
      return
    } catch {}
  }
  position.x = Math.min(window.innerWidth - 210, Math.max(220, window.innerWidth * 0.66))
  position.y = window.innerWidth < 760 ? 112 : 138
}

function clampPosition() {
  position.x = Math.max(24, Math.min(window.innerWidth - 190, position.x))
  position.y = Math.max(80, Math.min(window.innerHeight - 170, position.y))
}

function startDrag(event) {
  drag.active = true
  drag.moved = false
  drag.offsetX = event.clientX - position.x
  drag.offsetY = event.clientY - position.y
  window.addEventListener('pointermove', onDrag)
  window.addEventListener('pointerup', stopDrag)
}

function onDrag(event) {
  if (!drag.active) return
  drag.moved = true
  position.x = event.clientX - drag.offsetX
  position.y = event.clientY - drag.offsetY
  clampPosition()
}

function stopDrag() {
  drag.active = false
  localStorage.setItem('dakaba-pet-position', JSON.stringify(position))
  window.removeEventListener('pointermove', onDrag)
  window.removeEventListener('pointerup', stopDrag)
}

function replyFromText(text = '') {
  if (/累|难|烦|低落|哭|emo/i.test(text)) return '我看到了，今天先慢一点也可以。'
  if (/开心|快乐|成功|完成|庆祝|棒/i.test(text)) return '这条很闪亮，我要给你鼓掌。'
  if (/学习|考试|作业|背|读/i.test(text)) return '学习痕迹已收下，继续稳稳前进。'
  if (/运动|跑步|健身|走路/i.test(text)) return '身体也在认真哒咔，真不错。'
  if (/玫瑰|花/i.test(text)) return '我给蓝色玫瑰也浇了一点水。'
  return '我读完啦，这条朋友圈很有生活感。'
}

function say(text) {
  message.value = text
  window.setTimeout(() => {
    message.value = ''
  }, 2600)
}

function poke() {
  if (drag.moved) return
  mood.value = 'happy'
  say(['你好呀，今天也要哒咔。', '我在看你的记录呢。', '我给蓝色玫瑰浇水啦。'][Math.floor(Math.random() * 3)])
  window.setTimeout(() => {
    mood.value = 'idle'
  }, 1800)
}

function showTravelMessage() {
  if (drag.moved) return
  say('我去环游世界喽，别想我哦')
}

function startWalking() {
  walkTimer = window.setInterval(() => {
    if (isAway.value || drag.active) return
    const next = Math.max(24, Math.min(window.innerWidth - 190, position.x + (Math.random() > 0.5 ? 10 : -10)))
    direction.value = next >= position.x ? 'face-right' : 'face-left'
    position.x = next
    mood.value = 'walking'
    window.setTimeout(() => {
      if (!isAway.value) mood.value = 'idle'
    }, 650)
  }, 3800)
}

function scheduleTrips() {
  awayTimer = window.setInterval(() => {
    if (drag.active) return
    isAway.value = true
    message.value = ''
    returnTimer = window.setTimeout(() => {
      isAway.value = false
      mood.value = 'happy'
      say('我回来啦，带了一点风。')
      window.setTimeout(() => {
        mood.value = 'idle'
      }, 1800)
    }, 7000)
  }, 60000)
}

function readPendingComment() {
  const text = localStorage.getItem('dakaba-pet-comment')
  if (!text) return
  localStorage.removeItem('dakaba-pet-comment')
  mood.value = 'happy'
  say(replyFromText(text))
  window.setTimeout(() => {
    mood.value = 'idle'
  }, 2200)
}

onMounted(() => {
  setInitialPosition()
  clampPosition()
  startWalking()
  scheduleTrips()
  readPendingComment()
  window.addEventListener('focus', readPendingComment)
  window.addEventListener('resize', clampPosition)
})

onBeforeUnmount(() => {
  window.clearInterval(walkTimer)
  window.clearInterval(awayTimer)
  window.clearTimeout(returnTimer)
  window.removeEventListener('focus', readPendingComment)
  window.removeEventListener('resize', clampPosition)
  window.removeEventListener('pointermove', onDrag)
  window.removeEventListener('pointerup', stopDrag)
})

defineExpose({ poke, say })
</script>

<style scoped>
.pet-wrap {
  position: fixed;
  z-index: 45;
  cursor: grab;
  touch-action: none;
}
.pet-wrap:active { cursor: grabbing; }
.pet-button,
.sign {
  border: 0;
  background: transparent;
}
.pet-stage {
  position: relative;
  height: 118px;
  width: 162px;
  border-radius: 24px;
  background: rgba(255, 255, 255, .9);
  box-shadow: 0 18px 44px rgba(31, 142, 82, .20);
}
.pet-bubble {
  position: absolute;
  left: -14px;
  bottom: 128px;
  width: 190px;
  border: 4px solid #123f2a;
  background: #f5fff9;
  color: #123f2a;
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 900;
  box-shadow: 6px 6px 0 rgba(18, 63, 42, .16);
}
.pet {
  position: absolute;
  right: 24px;
  bottom: 36px;
  width: 58px;
  height: 50px;
  border: 4px solid #123f2a;
  border-radius: 8px;
  background: #5ee48b;
  box-shadow: inset -9px -8px 0 #25a957;
  animation: idle 2.2s ease-in-out infinite;
}
.ear {
  position: absolute;
  top: -15px;
  width: 14px;
  height: 16px;
  border: 4px solid #123f2a;
  border-bottom: 0;
  background: #5ee48b;
}
.ear-l { left: 7px; }
.ear-r { right: 7px; }
.eye {
  position: absolute;
  top: 18px;
  width: 7px;
  height: 9px;
  background: #123f2a;
}
.left { left: 14px; }
.right { right: 14px; }
.cheek {
  position: absolute;
  top: 29px;
  width: 8px;
  height: 5px;
  background: #ff91b3;
}
.cheek-l { left: 6px; }
.cheek-r { right: 6px; }
.mouth {
  position: absolute;
  left: 25px;
  bottom: 9px;
  width: 10px;
  height: 4px;
  background: #123f2a;
}
.foot {
  position: absolute;
  bottom: -11px;
  width: 14px;
  height: 9px;
  border: 4px solid #123f2a;
  background: #25a957;
}
.foot-l { left: 8px; }
.foot-r { right: 8px; }
.rose-pot {
  position: absolute;
  left: 22px;
  bottom: 20px;
  width: 48px;
  height: 72px;
}
.stem {
  position: absolute;
  left: 22px;
  bottom: 22px;
  width: 5px;
  height: 36px;
  background: #17945c;
}
.leaf {
  position: absolute;
  width: 16px;
  height: 10px;
  border-radius: 100% 0 100% 0;
  background: #31c978;
}
.leaf-a { left: 7px; bottom: 38px; transform: rotate(-28deg); }
.leaf-b { right: 3px; bottom: 31px; transform: rotate(30deg); }
.rose {
  position: absolute;
  left: 14px;
  top: 7px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #4aa3ff;
  box-shadow: -5px 0 0 #1d7dff, 5px 0 0 #7cc7ff, 0 -5px 0 #9bd7ff, 0 5px 0 #0d68dd;
}
.pot {
  position: absolute;
  left: 8px;
  bottom: 0;
  width: 34px;
  height: 22px;
  border-radius: 4px 4px 10px 10px;
  background: linear-gradient(#a7734b, #70452d);
}
.water {
  position: absolute;
  left: calc(62px + var(--i) * 5px);
  top: 24px;
  width: 4px;
  height: 8px;
  border-radius: 999px;
  background: #45b7ff;
  opacity: 0;
}
.watering .water {
  animation: water-drop .75s ease-in-out calc(var(--i) * .08s) 2;
}
.pet-shadow {
  position: absolute;
  right: 28px;
  bottom: 24px;
  height: 8px;
  width: 48px;
  border-radius: 999px;
  background: rgba(31, 142, 82, .24);
  filter: blur(2px);
}
.walking { animation: walk .52s steps(2) infinite; }
.happy { animation: bounce .42s ease-in-out 2; }
.happy .mouth {
  height: 8px;
  border-radius: 0 0 8px 8px;
}
.face-left { transform: scaleX(-1); }
.sign {
  position: relative;
  width: 72px;
  height: 94px;
}
.sign-board {
  position: absolute;
  left: 6px;
  top: 0;
  display: grid;
  width: 58px;
  height: 44px;
  place-items: center;
  border: 4px solid #5a3a22;
  background: #f6d28d;
  color: #5a3a22;
  font-size: 24px;
  font-weight: 900;
  box-shadow: inset -6px -6px 0 #d69b55;
}
.sign-stick {
  position: absolute;
  left: 32px;
  top: 42px;
  width: 10px;
  height: 48px;
  background: #8b5a32;
  box-shadow: inset -3px 0 0 #5a3a22;
}
@keyframes idle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
@keyframes walk {
  0% { translate: 0 0; }
  50% { translate: 0 -4px; }
  100% { translate: 0 0; }
}
@keyframes bounce {
  0%, 100% { transform: translateY(0) rotate(0); }
  40% { transform: translateY(-14px) rotate(-4deg); }
  70% { transform: translateY(-6px) rotate(4deg); }
}
@keyframes water-drop {
  0% { opacity: 0; transform: translate(0, 0) rotate(20deg); }
  30% { opacity: 1; }
  100% { opacity: 0; transform: translate(-38px, 28px) rotate(20deg); }
}
</style>
