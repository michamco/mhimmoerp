// Supabase Verbindung
const supabaseUrl = 'https://dofofjbjgbmpxjtlolzi.supabase.co';
const supabaseKey = 'sb_publishable_grgVSWN2j2zPAWGq_-qUug_yzc0QGV-';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Login Logik
function checkLogin() {
    const u = document.getElementById('user').value;
    const p = document.getElementById('pass').value;
    if(u === 'admin' && p === 'admin') {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-ui').style.display = 'block';
    } else {
        document.getElementById('login-err').style.display = 'block';
    }
}

// Navigation
function openApp(id) {
    document.getElementById('launchpad').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    const content = document.getElementById('app-content');
    content.innerHTML = '';

    switch(id) {
        case 'fixflip': renderFixFlip(content); break;
        case 'kredit': renderKredit(content); break;
        case 'miete': renderMietrechner(content); break;
        case 'bestand': renderBestand(content); break;
        case 'brief': renderBrief(content); break;
        case 'checklisten': renderChecklisten(content); break;
        default: content.innerHTML = '<h2>In Arbeit</h2>';
    }
}

function closeApp() {
    document.getElementById('launchpad').style.display = 'grid';
    document.getElementById('app-container').style.display = 'none';
}

// Hilfsfunktion für Rechner
const getNum = (id) => parseFloat(document.getElementById(id).value) || 0;

// --- APPS ---

function renderFixFlip(container) {
    container.innerHTML = `
        <h2>Fix & Flip Analyse</h2>
        <div class="rechner-grid">
            <div class="section-box">
                <h3>Kosten</h3>
                <label>Kaufpreis (€)</label><input type="number" id="f_kp" value="150000" oninput="calcFF()">
                <label>Sanierung (€)</label><input type="number" id="f_s" value="25000" oninput="calcFF()">
            </div>
            <div class="section-box">
                <h3>Verkauf</h3>
                <label>Fläche (qm)</label><input type="number" id="f_q" value="70" oninput="calcFF()">
                <label>Preis/qm (€)</label><input type="number" id="f_pq" value="3500" oninput="calcFF()">
            </div>
        </div>
        <div id="ff_res" class="result-panel"></div>
    `;
    calcFF();
}
function calcFF() {
    const invest = getNum('f_kp') + getNum('f_s');
    const erloes = getNum('f_q') * getNum('f_pq');
    const gewinn = erloes - invest;
    document.getElementById('ff_res').innerHTML = `Gewinn: <b>${gewinn.toLocaleString()} €</b>`;
}

function renderKredit(container) {
    container.innerHTML = `
        <h2>Kreditrechner</h2>
        <div class="section-box">
            <label>Darlehen (€)</label><input type="number" id="k_d" value="200000" oninput="calcK()">
            <label>Zins + Tilgung (%)</label><input type="number" id="k_z" value="5.5" oninput="calcK()">
        </div>
        <div id="k_res" class="result-panel"></div>
    `;
    calcK();
}
function calcK() {
    const rate = (getNum('k_d') * (getNum('k_z') / 100)) / 12;
    document.getElementById('k_res').innerHTML = `Rate mtl.: <b>${rate.toFixed(2)} €</b>`;
}

function renderMietrechner(container) {
    container.innerHTML = `
        <h2>Mietrechner</h2>
        <div class="section-box">
            <label>Kaltmiete (€)</label><input type="number" id="m_k" value="800" oninput="calcM()">
            <label>Bankrate (€)</label><input type="number" id="m_b" value="450" oninput="calcM()">
        </div>
        <div id="m_res" class="result-panel"></div>
    `;
    calcM();
}
function calcM() {
    const cash = getNum('m_k') - getNum('m_b');
    document.getElementById('m_res').innerHTML = `Cashflow: <b>${cash.toFixed(2)} €</b>`;
}

async function renderBestand(container) {
    container.innerHTML = '<h2>Bestand</h2><p>Lade aus Supabase...</p>';
    const { data, error } = await supabase.from('immobilien').select('*');
    if(error) { container.innerHTML = 'Fehler beim Laden'; return; }
    
    let t = '<table style="width:100%; border-collapse:collapse; margin-top:20px;">';
    t += '<tr style="background:#eee; text-align:left;"><th style="padding:8px;">Straße</th><th>Stadt</th><th>Miete</th></tr>';
    data.forEach(i => {
        t += `<tr style="border-bottom:1px solid #ddd;"><td style="padding:8px;">${i.strasse}</td><td>${i.stadt}</td><td>${i.kaltmiete} €</td></tr>`;
    });
    container.innerHTML = '<h2>Immobilienbestand</h2>' + t + '</table>';
}

function renderBrief(container) {
    container.innerHTML = `
        <div class="no-print">
            <h2>Brief-Generator</h2>
            <input type="text" id="b_n" placeholder="Empfänger Name">
            <textarea id="b_t" style="height:100px;" placeholder="Text..."></textarea>
            <button class="btn-action" onclick="doPrint()">Drucken</button>
        </div>
        <div id="b_p" style="display:none; padding:40px;"></div>
    `;
}
function doPrint() {
    const p = document.getElementById('b_p');
    p.style.display = 'block';
    p.innerHTML = `<img src="IMG_4590.png" style="width:150px; float:right;"><h3>Brief an ${document.getElementById('b_n').value}</h3><p>${document.getElementById('b_t').value}</p>`;
    window.print();
}

function renderChecklisten(container) {
    container.innerHTML = '<h2>Checklisten</h2><div class="section-box"><h3>Übergabeprotokoll</h3><button class="btn-action" onclick="window.print()">Vordruck drucken</button></div>';
}
