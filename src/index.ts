import "./scss/main.scss";
import { roomOne } from "./lib/rooms/roomOne";


const initButton = document.getElementById('initialize-button')
const addBodyButton = document.getElementById('add-body')

const {
  initializeApp,
  initialized,
  addCircle,
} = roomOne();

addBodyButton?.addEventListener('click', () => {
  addCircle()
})

initButton?.addEventListener('click', () => {
  if (!initialized) {
    initializeApp()
    addBodyButton?.classList.add('active')
    initButton?.remove()
  } else {
    console.log('already initialized')
  }
})

