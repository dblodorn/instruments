import "./scss/main.scss";
import { compositionOne } from "./lib/compositions/compositionOne";

const button = document.getElementById('add-body')

const {
  initializeApp,
  isInitialized,
  addCircle,
} = compositionOne();

const clickHandler = () => {
  if (!isInitialized()) {
    initializeApp()
  } else {
    addCircle()
  }
}

button?.addEventListener('click', () => {
  clickHandler()
})

document.body.onkeyup = function(e) {
  if (e.key == " " ||
      e.code == "Space"  
  ) {
    clickHandler()
  }
}
