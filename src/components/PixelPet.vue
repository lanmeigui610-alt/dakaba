<template>
  <div
    class="pet-wrap"
    :style="{ left: `${position.x}px`, top: `${position.y}px` }"
    @pointerdown="startDrag"
  >
    <div v-if="message" class="pet-bubble">{{ message }}</div>

    <section v-if="chatOpen && !isAway" class="chat-card" @pointerdown.stop>
      <div class="chat-title">和哒咔聊天</div>
      <div class="chat-line pet-line">{{ chatReply }}</div>
      <div class="quick-row">
        <button v-for="item in quickChats" :key="item" type="button" @click="talk(item)">{{ item }}</button>
      </div>
      <div class="chat-input">
        <input v-model="chatText" placeholder="跟它说句话" @keydown.enter="sendChat" />
        <button type="button" @click="sendChat">发送</button>
      </div>
    </section>

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
const chatOpen = ref(false)
const chatText = ref('')
const chatReply = ref('你好呀，我在这里陪你记录生活。')
const quickChats = ['今天鼓励我', '给玫瑰浇水']
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
  position.x = Math.min(window.innerWidth - 220, Math.max(120, window.innerWidth * 0.58))
  position.y = window.innerWidth < 760 ? 116 : 150
}

function clampPosition() {
  position.x = Math.max(32, Math.min(window.innerWidth - 190, position.x))
  position.y = Math.max(86, Math.min(window.innerHeight - 190, position.y))
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

function replyFromText(rawText = '') {
  const text = rawText.trim().toLowerCase()
  if (!text) return '你还没写内容呢，我先在这里等你。'
  if (/你好|hello|hi|嗨|在吗/.test(text)) return '我在呀。今天想记录一点开心的事，还是想把烦恼藏进秘密花园？'
  if (/难过|低落|emo|累|烦|哭|崩溃|压力|焦虑|不开心/.test(text)) return '我听见了。今天先不用表现得很厉害，写下一句真实感受就很好。'
  if (/开心|快乐|成功|完成|庆祝|棒|喜欢|幸福|顺利/.test(text)) return '太好了，这种发光的小事值得记下来。我给蓝色玫瑰多浇一点水。'
  if (/学习|考试|作业|背书|阅读|复习|课程/.test(text)) return '学习类记录我建议写清楚三件事：做了什么、用了多久、下一步是什么。'
  if (/运动|跑步|健身|走路|瑜伽|锻炼/.test(text)) return '身体也在打卡呢。记一下运动时长和感觉，之后回看会很有成就感。'
  if (/日程|计划|待办|任务|安排|todo/.test(text)) return '可以先写一个很小的日程，不要太满。今天完成一页，也算赢。'
  if (/照片|拍照|图片|相册|朋友圈|动态/.test(text)) return '如果这张照片想被看见，就发公开；如果只是给自己留念，就放进私密记录。'
  if (/玫瑰|花|蓝色|浇水/.test(text)) return '收到，我已经给蓝色玫瑰浇水啦。它现在看起来很精神。'
  if (/密码|登录|注册|邮箱|后台/.test(text)) return '账号相关的事要认真一点：用邮箱登录，密码别告诉任何人，后台也不会显示用户密码。'
  if (/谢谢|感谢|爱你/.test(text)) return '不用谢，我会一直在这里。你负责生活，我负责提醒你别忘了记录。'
  return `我读到了：“${rawText.slice(0, 18)}”。这件事可以先记下来，等以后回看，你会知道自己怎样一点点走过来的。`
}

function say(text) {
  message.value = text
  window.setTimeout(() => {
    message.value = ''
  }, 3000)
}

function talk(text) {
  chatReply.value = replyFromText(text)
  mood.value = 'happy'
  say(chatReply.value)
  window.setTimeout(() => {
    mood.value = 'idle'
  }, 1800)
}

function sendChat() {
  const text = chatText.value.trim()
  talk(text)
  chatText.value = ''
}

function poke() {
  if (drag.moved) return
  chatOpen.value = !chatOpen.value
  mood.value = 'happy'
  say(chatOpen.value ? '我在这儿，想聊什么？' : '我去给蓝色玫瑰浇水啦。')
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
    if (isAway.value || drag.active || chatOpen.value) return
    const next = Math.max(32, Math.min(window.innerWidth - 190, position.x + (Math.random() > 0.5 ? 12 : -12)))
    direction.value = next >= position.x ? 'face-right' : 'face-left'
    position.x = next
    mood.value = 'walking'
    window.setTimeout(() => {
      if (!isAway.value) mood.value = 'idle'
    }, 650)
  }, 4200)
}

function scheduleTrips() {
  awayTimer = window.setInterval(() => {
    if (drag.active || chatOpen.value) return
    isAway.value = true
    message.value = ''
    returnTimer = window.setTimeout(() => {
      isAway.value = false
      mood.value = 'happy'
      say('我回来啦，带了一点风和一朵小花。')
      window.setTimeout(() => {
        mood.value = 'idle'
      }, 1800)
    }, 6000)
  }, 110000)
}

function readPendingComment() {
  const text = localStorage.getItem('dakaba-pet-comment')
  if (!text) return
  localStorage.removeItem('dakaba-pet-comment')
  talk(text)
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

defineExpose({ poke, say, talk })
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
  height: 122px;
  width: 166px;
  border: 1px solid rgba(37, 99, 235, .16);
  border-radius: 26px;
  background: rgba(255, 255, 255, .92);
  box-shadow: 0 20px 54px rgba(37, 99, 235, .18);
  backdrop-filter: blur(12px);
}
.pet-bubble {
  position: absolute;
  left: -18px;
  bottom: 132px;
  width: 205px;
  border: 4px solid #123f2a;
  background: #f6fff9;
  color: #123f2a;
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 900;
  box-shadow: 7px 7px 0 rgba(18, 63, 42, .16);
}
.chat-card {
  position: absolute;
  left: -30px;
  bottom: 142px;
  width: 246px;
  border: 1px solid #bfdbfe;
  border-radius: 22px;
  background: rgba(255,255,255,.96);
  padding: 12px;
  box-shadow: 0 22px 55px rgba(37,99,235,.18);
}
.chat-title {
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 950;
}
.chat-line {
  margin-top: 8px;
  border-radius: 16px;
  background: #eff6ff;
  padding: 10px;
  color: #0f172a;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.55;
}
.quick-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
.quick-row button,
.chat-input button {
  border-radius: 999px;
  background: #2563eb;
  color: white;
  padding: 6px 9px;
  font-size: 11px;
  font-weight: 900;
}
.chat-input {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px;
  margin-top: 8px;
}
.chat-input input {
  min-width: 0;
  border: 1px solid #dbeafe;
  border-radius: 999px;
  padding: 7px 10px;
  font-size: 12px;
  outline: none;
}
.pet {
  position: absolute;
  right: 24px;
  bottom: 38px;
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
@media (max-width: 760px) {
  .chat-card {
    left: -22px;
    width: 226px;
  }
}
</style>
