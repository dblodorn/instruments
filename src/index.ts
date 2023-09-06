import "./scss/main.scss";
import { roomOne } from "./lib/rooms/roomOne";

const button = document.getElementById('add-body')

const {
  initializeApp,
  initialized,
  addCircle,
} = roomOne();

button?.addEventListener('click', () => {
  if (!initialized) {
    initializeApp()
  } else {
    addCircle()
  }
})