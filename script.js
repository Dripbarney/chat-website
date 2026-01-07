// Replace these with your real Supabase values
const SUPABASE_URL = https://vhvhggdkrbdcdwgcrhyr.supabase.co;
const SUPABASE_ANON_KEY = sb_publishable_prJgFIlGM3PRIxclNslwdA_80Af1NE6;

// Create Supabase client
const { createClient } = supabase;
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const usernameBox = document.getElementById("username-box");
const usernameInput = document.getElementById("username-input");
const saveUsernameBtn = document.getElementById("save-username");

const app = document.getElementById("app");
const chatBox = document.getElementById("chat-box");
const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");

let username = null;

// Show username screen, hide chat at start
app.style.display = "none";

// Save username and show chat
saveUsernameBtn.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  if (!name) return;

  username = name;
  usernameBox.style.display = "none";
  app.style.display = "block";

  loadExistingMessages();
  subscribeToNewMessages();
});

// Load existing messages from database
async function loadExistingMessages() {
  const { data, error } = await client
    .from("messages")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error loading messages:", error);
    return;
  }

  chatBox.innerHTML = "";
  data.forEach(addMessageToChat);
}

// Listen for new messages in realtime
function subscribeToNewMessages() {
  client
    .channel("public:messages")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      (payload) => {
        const msg = payload.new;
        addMessageToChat(msg);
      }
    )
    .subscribe();
}

// Add a message element to the chat box
function addMessageToChat(msg) {
  const div = document.createElement("div");
  div.className = "message";
  div.innerHTML = `<strong>${msg.username}:</strong> ${msg.text}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Send message to Supabase
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text || !username) return;

  const { error } = await client.from("messages").insert({
    username: username,
    text: text
  });

  if (error) {
    console.error("Error sending message:", error);
  }

  input.value = "";
});
