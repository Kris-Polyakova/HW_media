import { Form } from "./Form";

export class Timeline {
  constructor(container) {
    this.container = document.querySelector(container);
    this.input = this.container.querySelector(".text-input");
    this.messaggeContainer = this.container.querySelector(".messages");
    this.locationForm = new Form(".form");
  }

  init() {
    this.input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.sendMessage();
      }
    });
  }

  sendMessage() {
    const text = this.input.value.trim();
    if (!text) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `[${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}]`;
        this.createMessage(text, coords);
        this.input.value = "";
      },
      () => {
        this.locationForm.show((coords) => {
          this.createMessage(text, coords);
          this.input.value = "";
        });
      },
    );
  }

  createMessage(messageText, messageCoordinates) {
    const message = document.createElement("div");
    message.className = "message text-message";

    const date = document.createElement("span");
    date.className = "date";
    let timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
    date.textContent = timestamp;

    const text = document.createElement("p");
    text.className = "text";
    text.textContent = messageText;

    const coordinates = document.createElement("span");
    coordinates.classList = "coordinates";
    coordinates.textContent = messageCoordinates;

    message.append(date, text, coordinates);
    this.messaggeContainer.append(message);

    this.messaggeContainer.scrollTop -= this.messaggeContainer.clientHeight;
  }
}
