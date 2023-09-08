import "./scss/main.scss";
import { compositionOne } from "./lib/compositions/compositionOne";

const button = document.getElementById('add-body')

const {
  initializeApp,
  initialized,
  addCircle,
} = compositionOne();

button?.addEventListener('click', () => {
  if (!initialized) {
    initializeApp()
  } else {
    addCircle()
  }
})