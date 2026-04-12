// Konfiguration
const supabaseUrl = 'https://dofofjbjgbmpxjtlolzi.supabase.co';
const supabaseKey = 'sb_publishable_grgVSWN2j2zPAWGq_-qUug_yzc0QGV-';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Login Funktion mit Feedback
function checkLogin() {
    const u = document.getElementById('user').value;
    const p = document.getElementById('pass').value;
    const box = document.getElementById('loginBox');
    const err = document.getElementById('login-err');

    if (u === 'admin' && p === 'admin') {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-ui').style.display = 'block';
    } else {
        // Fehler-Animation (Schütteln)
        box.classList.remove('shake');
        void box.offsetWidth; // Trigger reflow
        box.classList.add('shake');
        err.style.display = 'block';
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
    }
}

function closeApp() {
    document.getElementById('launchpad').style.display = 'grid';
    document.getElementById('app-container').style.display = 'none';
}

const getVal = (id) => parseFloat(document.getElementById(id).value) || 0;

// --- FIX & FLIP RECHNER ---
function renderFixFlip(container) {
    container.innerHTML = `
        <h2>Fix & Flip Analyse</h2>
        <div class="rechner-grid">
            <div class="section-box">
                <h3>Ankauf</h3>
                <label>Kaufpreis (€)</label><input type="number" id="ff_kp" value="150000" oninput="calcFF()">
                <label>Sanierung (€)</label><input type="number" id="ff_s" value="25000" oninput="calcFF()">
                <label>NK (Steuer, Notar, Makler %)</label><input type="number" id="ff_nk" value="10" oninput="calcFF()">
            </div>
            <div class="section-box">
                <h3>Verkauf</h3>
                <label>Wohnfläche (qm)</label><input type="number" id="ff_qm" value="70" oninput="calcFF()">
                <label>Verkaufspreis (€/qm)</label><input type="number" id="ff_vqm" value="3500" oninput="calcFF()">
            </div>
        </div>
        <div id="ff_res" class="result-panel"></div>
    `;
    calcFF();
}
function calcFF() {
    const gesamtKosten = getVal('ff_kp') * (1 + getVal('ff_nk')/100) + getVal('ff_s');
    const erloes = getVal('ff_qm') * getVal('ff_vqm');
    const gewinn = erloes - gesamtKosten;
    const marge = (gewinn / erloes) * 100;
    document.getElementById('ff_res').innerHTML = `Gewinn: <b>${gewinn.toLocaleString()} €</b> (Marge: ${marge.toFixed(1)}%)`;
    document.getElementById('ff_res').style.color = marge > 15 ? 'green' : 'red';
}

// --- KREDITRECHNER ---
function renderKredit(container) {
    container.innerHTML = `
        <h2>Kreditrechner</h2>
        <div class="section-box">
            <label>Darlehensbetrag (€)</label><input type="number" id="kr_d" value="200000" oninput="calcKr()">
            <label>Zins + Tilgung p.a. (%)</label><input type="number" id="kr_z" value="5.5" step="0.1" oninput="calcKr()">
        </div>
        <div id="kr_res" class="result-panel"></div>
    `;
    calcKr();
}
function calcKr() {
    const mtl = (getVal('kr_d') * (getVal('kr_z')/100)) / 12;
    document.getElementById('kr_res').innerHTML = `Monatliche Rate: <b>${mtl.toFixed(2)} €</b>`;
}

// --- MIETRECHNER ---
function renderMietrechner(container) {
    container.innerHTML = `
        <h2>Cashflow Mietrechner</h2>
        <div class="section-box">
            <label>Kaltmiete (€)</label><input type="number" id="m_k" value="850" oninput="calcM()">
            <label>Bankrate (€)</label><input type="number" id="m_b" value="500" oninput="calcM()">
            <label>Nicht umlagf. Hausgeld (€)</label><input type="number" id="m_h" value="70" oninput="calcM()">
        </div>
        <div id="m_res" class="result-panel"></div>
    `;
    calcM();
}
function calcM() {
    const cf = getVal('m_k') - getVal('m_b') - getVal('m_h');
    document.getElementById('m_res').innerHTML = `Cashflow: <b style="color:${cf>=0?'green':'red'}">${cf.toFixed(2)} €</b>`;
}

// --- BESTAND ---
async function renderBestand(container) {
    container.innerHTML = '<h2>Bestand</h2><p>Lade Daten aus Supabase...</p>';
    const { data, error } = await supabase.from('immobilien').select('*');
    if(error) { container.innerHTML = 'Fehler beim Laden der Datenbank.'; return; }
    
    let table = '<table style="width:100%; border-collapse:collapse; margin-top:20px;">';
    table += '<tr style="background:#eee; text-align:left;"><th style="padding:10px;">Objekt</th><th>Stadt</th><th>Miete</th></tr>';
    data.forEach(i => {
        table += `<tr style="border-bottom:1px solid #ddd;"><td style="padding:10px;">${i.strasse}</td><td>${i.stadt}</td><td>${i.kaltmiete} €</td></tr>`;
    });
    container.innerHTML = '<h2>Immobilienbestand</h2>' + table + '</table>';
}

// --- BRIEF GENERATOR ---
function renderBrief(container) {
    container.innerHTML = `
        <div class="no-print">
            <h2>Brief-Generator</h2>
            <div class="rechner-grid">
                <div class="section-box">
                    <h3>Absender (Vermieter)</h3>
                    <input type="text" id="b_v_name" placeholder="Name">
                    <input type="text" id="b_v_str" placeholder="Straße">
                    <input type="text" id="b_v_ort" placeholder="PLZ Stadt">
                    <input type="text" id="b_v_tel" placeholder="Telefon">
                    <input type="text" id="b_v_mail" placeholder="E-Mail">
                </div>
                <div class="section-box">
                    <h3>Empfänger (Mieter)</h3>
                    <input type="text" id="b_m_name" placeholder="Name">
                    <input type="text" id="b_m_str" placeholder="Straße">
                    <input type="text" id="b_m_ort" placeholder="PLZ Stadt">
                </div>
            </div>
            <label>Betreff</label><input type="text" id="b_bet" style="font-weight:bold;">
            <label>Inhalt</label><textarea id="b_txt" style="height:150px;"></textarea>
            <button class="btn-action" onclick="printBrief()">Brief Vorschau & Drucken</button>
        </div>
        <div id="brief-preview"></div>
    `;
}

function printBrief() {
    const preview = document.getElementById('brief-preview');
    preview.style.display = 'block';
    preview.innerHTML = `
        <div style="font-family: Arial; color: black; line-height: 1.5;">
            <div style="text-align: right;">
                <img src="IMG_4590.png" style="width: 220px; margin-bottom: 10px;"><br>
                <b>${document.getElementById('b_v_name').value}</b><br>
                ${document.getElementById('b_v_str').value}<br>
                ${document.getElementById('b_v_ort').value}<br>
                ${document.getElementById('b_v_tel').value} | ${document.getElementById('b_v_mail').value}
            </div>
            <div style="margin-top: 50px; text-decoration: underline; font-size: 0.85rem;">
                ${document.getElementById('b_v_name').value}, ${document.getElementById('b_v_str').value}, ${document.getElementById('b_v_ort').value}
            </div>
            <div style="margin-top: 15px; font-size: 1.1rem;">
                ${document.getElementById('b_m_name').value}<br>
                ${document.getElementById('b_m_str').value}<br>
                ${document.getElementById('b_m_ort').value}
            </div>
            <div style="margin-top: 40px; text-align: right;">Datum: ${new Date().toLocaleDateString('de-DE')}</div>
            <div style="margin-top: 30px; font-weight: bold; font-size: 1.2rem;">${document.getElementById('b_bet').value}</div>
            <div style="margin-top: 30px; white-space: pre-wrap;">${document.getElementById('b_txt').value}</div>
            <div style="margin-top: 50px;">
                Mit freundlichen Grüßen<br><br><br>
                ___________________________<br>
                ${document.getElementById('b_v_name').value}
            </div>
        </div>
    `;
    window.print();
}

// --- CHECKLISTEN ---
function renderChecklisten(container) {
    container.innerHTML = `
        <h2>Checklisten</h2>
        <div class="section-box" onclick="window.print()" style="cursor:pointer;">
            <h3>Wohnungsübergabeprotokoll</h3>
            <p>Klicken zum Ausdrucken der offiziellen MHIMMOBILIEN Vorlage.</p>
        </div>
    `;
}
