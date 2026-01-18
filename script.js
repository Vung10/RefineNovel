const input = document.getElementById("channelInput");
const addBtn = document.getElementById("addBtn");
const grid = document.getElementById("streamGrid");

addBtn.addEventListener("click", addStream);

function addStream() {
  const channel = input.value.trim().toLowerCase();
  if (!channel) return;

  const stream = document.createElement("div");
  stream.className = "stream";

  stream.innerHTML = `
    <iframe
      src="https://player.twitch.tv/?channel=${channel}&parent=localhost"
      height="100%"
      width="100%"
      allowfullscreen>
    </iframe>
  `;

  grid.appendChild(stream);
  input.value = "";
}
