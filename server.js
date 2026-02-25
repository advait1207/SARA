const card = document.querySelector('.interface-card');
const statusText = document.getElementById('status');
const btn = document.getElementById('action-btn');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
const synth = window.speechSynthesis;

let isListening = false;

function nexaSpeak(text) {
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 0.95;
    utterance.rate = 1;
    
    // Toggle GIF while speaking
    utterance.onstart = () => card.classList.add('active');
    utterance.onend = () => card.classList.remove('active');
    
    synth.speak(utterance);
    statusText.innerText = text;
}

function startNexa() {
    if (isListening) return;
    try {
        recognition.start();
    } catch (e) { console.error("Mic error:", e); }
}

recognition.onstart = () => {
    isListening = true;
    btn.disabled = true;
    card.classList.add('active');
    statusText.innerText = "Listening...";
};

recognition.onend = () => {
    isListening = false;
    btn.disabled = false;
    card.classList.remove('active');
};

recognition.onresult = (event) => {
    const cmd = event.results[0][0].transcript.toLowerCase();
    statusText.innerText = `Command: ${cmd}`;
    handleLogic(cmd);
};

async function handleLogic(cmd) {
    // 1. SMART OPEN/SEARCH LOGIC
    if (cmd.includes('open') || cmd.includes('search for')) {
        const query = cmd.replace('open', '').replace('search for', '').trim();
        nexaSpeak(`Processing request for ${query}...`);
        
        // If it looks like a simple site, try opening directly
        if (!cmd.includes('search for') && query.split(' ').length === 1) {
            const win = window.open(`https://www.${query}.com`, '_blank');
            if (!win) nexaSpeak("Pop-up blocked. Please allow permission.");
        } else {
            // Otherwise, search Google
            window.open(`https://www.google.com/search?q=${query}`, '_blank');
        }
    } 

    // 2. WEATHER
    else if (cmd.includes('weather in')) {
        const city = cmd.split('in')[1]?.trim();
        nexaSpeak(`Fetching weather for ${city}...`);
        try {
            const res = await fetch(`/weather?city=${city}`);
            const data = await res.json();
            nexaSpeak(`In ${data.city}, it's ${data.temp} degrees with ${data.desc}.`);
        } catch (e) { nexaSpeak("Weather service is currently offline."); }
    }

    // 3. TIME
    else if (cmd.includes('time')) {
        nexaSpeak(`The time is ${new Date().toLocaleTimeString()}`);
    }

    // 4. IDENTITY
    else if (cmd.includes('who are you')) {
        nexaSpeak("I am Nexa. Your personal AI command system.");
    }

    // 5. FALLBACK
    else {
        nexaSpeak(`I don't have a protocol for that. Searching Google.`);
        window.open(`https://www.google.com/search?q=${cmd}`, '_blank');
    }
}
