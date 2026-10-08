const http = require('http');
const mineflayer = require('mineflayer');

// 1. Web server to keep Render service alive
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Minecraft AFK Bot is running!\n');
}).listen(PORT, () => {
  console.log(Web server listening on port ${PORT});
});

// 2. Single Bot Configuration
const CONFIG = {
  host: '160.25.5.206',
  port: 4067,
  username: 'vixel14',
  pass: '123qwe123qwwe',
  version: '1.21.1',
  auth: 'offline'
};

let bot = null;
let reconnectTimeout = null;

// Check Bangladesh Time (UTC+6): 12:00 PM to 6:00 PM
function isTargetTime() {
  const now = new Date();
  const bdHour = (now.getUTCHours() + 6) % 24;
  return bdHour >= 12 && bdHour < 18;
}

function launchBot() {
  if (!isTargetTime()) {
    console.log('[SCHEDULE] Outside 12:00 PM - 6:00 PM BST. Waiting...');
    return;
  }

  if (bot) return;

  console.log([BOT] Connecting ${CONFIG.username} to server...);

  bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: CONFIG.version,
    auth: CONFIG.auth
  });

  bot.on('spawn', () => {
    console.log([BOT] ${CONFIG.username} spawned successfully.);
    setTimeout(() => {
      bot.chat(/login ${CONFIG.pass});
    }, 2000);
  });

  bot.on('end', () => {
    console.log([BOT] ${CONFIG.username} disconnected.);
    bot = null;
    if (isTargetTime()) {
      console.log('[BOT] Reconnecting in 10 seconds...');
      reconnectTimeout = setTimeout(launchBot, 10000);
    }
  });

  bot.on('error', (err) => {
    console.log([ERROR] ${err.message});
  });
}

function checkSchedule() {
  const insideSchedule = isTargetTime();

  if (insideSchedule && !bot) {
    console.log('[SCHEDULE] Time window active. Launching bot...');
    launchBot();
  } else if (!insideSchedule && bot) {
    console.log('[SCHEDULE] 6:00 PM reached. Disconnecting bot...');
