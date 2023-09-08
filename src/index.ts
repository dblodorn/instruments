import "./scss/main.scss";
import { compositionOne } from "./lib/compositions/compositionOne";

const button = document.getElementById('add-body')

const {
  initializeApp,
  initialized,
  addCircle,
} = compositionOne();

const clickHandler = () => {
  if (!initialized) {
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
