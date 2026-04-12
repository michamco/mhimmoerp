const supabaseUrl = 'https://dofofjbjgbmpxjtlolzi.supabase.co';
const supabaseKey = 'sb_publishable_grgVSWN2j2zPAWGq_-qUug_yzc0QGV-';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

function checkLogin() {
    if(document.getElementById('user').value === 'admin' && document.getElementById('pass').value === 'admin') {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-ui').style.display = 'block';
    } else { document.getElementById('login-err').style.display = 'block'; }
}

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

// Helper: Wert aus Input holen
const getV = (id) => parseFloat(document.getElementById(id).value) || 0;

// --- FIX & FLIP ---
function renderFixFlip(container) {
    container.innerHTML = `
        <h2>Fix & Flip Analyse</h2>
        <div class="rechner-grid">
            <div class="section-box">
                <h3>1. Ankauf & NK</h3>
                <label>Kaufpreis (€)</label><input type="number" id="ff_kp" value="150000" oninput="calcFF()">
                <label>Wohnfläche (qm)</label><input type="number" id="ff_qm" value="70" oninput="calcFF()">
                <label>Grunderwerbsteuer (%)</label><input type="number" id="ff_steuer" value="5.0" oninput="calcFF()">
                <label>Makler (%)</label><input type="number" id="ff_makler" value="3.57" oninput="calcFF()">
            </div>
            <div class="section-box">
                <h3>2. Sanierung & Finanzen</h3>
                <label>Sanierungskosten (€)</label><input type="number" id="ff_reno" value="25000" oninput="calcFF()">
                <label>Finanzierungskosten (€)</label><input type="number" id="ff_fin" value="5000" oninput="calcFF()">
                <label>Haltedauer (Monate)</label><input type="number" id="ff_mon" value="6" oninput="calcFF()">
            </div>
            <div class="section-box">
                <h3>3. Verkauf</h3>
                <label>Ziel VK-Preis (€/qm)</label><input type="number" id="ff_vk_qm" value="3800" oninput="calcFF()">
            </div>
        </div>
        <div id="ff_res" class="result-panel">Berechne...</div>
    `;
    calcFF();
}

function calcFF() {
    const kp = getV('ff_kp');
    const nk = kp * (getV('ff_steuer')/100 + 0.015 + getV('ff_makler')/100);
    const invest = kp + nk + getV('ff_reno') + getV('ff_fin');
    const verkauf = getV('ff_vk_qm') * getV('ff_qm');
    const profit = verkauf - invest;
    const marge = (profit / verkauf) * 100;
    
    const res = document.getElementById('ff_res');
    res.innerHTML = `Gewinn: <b>${profit.toLocaleString()} €</b> | Marge: <b>${marge.toFixed(1)}%</b>`;
    res.style.background = marge >= 20 ? '#d4edda' : '#f8d7da';
}

// --- KREDIT ---
function renderKredit(container) {
    container.innerHTML = `
        <h2>Kreditrechner</h2>
        <div class="section-box">
            <label>Darlehensbetrag (€)</label><input type="number" id="kr_d" value="200000" oninput="calcKr()">
            <label>Sollzins (%)</label><input type="number" id="kr_z" value="3.5" step="0.1" oninput="calcKr()">
            <label>Tilgung (%)</label><input type="number" id="kr_t" value="2.0" step="0.1" oninput="calcKr()">
        </div>
        <div id="kr_res" class="result-panel"></div>
    `;
    calcKr();
}
function calcKr() {
    const rate = (getV('kr_d') * ((getV('kr_z') + getV('kr_t'))/100)) / 12;
    document.getElementById('kr_res').innerHTML = `Monatliche Annuität: <b>${rate.toFixed(2)} €</b>`;
}

// --- MIETE ---
function renderMietrechner(container) {
    container.innerHTML = `
        <h2>Cashflow Rechner</h2>
        <div class="section-box">
            <label>Miete Kalt (€)</label><input type="number" id="m_kalt" value="800" oninput="calcM()">
            <label>Hausgeld (€)</label><input type="number" id="m_hg" value="250" oninput="calcM()">
            <label>davon umlagefähig (€)</label><input type="number" id="m_um" value="180" oninput="calcM()">
            <label>Bankrate (€)</label><input type="number" id="m_br" value="400" oninput="calcM()">
        </div>
        <div id="m_res" class="result-panel"></div>
    `;
    calcM();
}
function calcM() {
    const cf = getV('m_kalt') - (getV('m_hg') - getV('m_um')) - getV('m_br');
    document.getElementById('m_res').innerHTML = `Monatlicher Cashflow: <b style="color:${cf>=0?'green':'red'}">${cf.toFixed(2)} €</b>`;
}

// --- BESTAND ---
async function renderBestand(container) {
    container.innerHTML = '<h2>Immobilienbestand</h2><p id="b_status">Lade Daten aus Supabase...</p>';
    const { data, error } = await supabase.from('immobilien').select('*');
    if(error) { document.getElementById('b_status').innerText = "Fehler: " + error.message; return; }
    
    let html = '<table style="width:100%; border-collapse:collapse; margin-top:15px;">';
    html += '<tr style="background:#eee; text-align:left;"><th style="padding:10px;">Objekt</th><th>Stadt</th><th>Fläche</th><th>Miete</th></tr>';
    data.forEach(i => {
        html += `<tr style="border-bottom:1px solid #ddd;"><td style="padding:10px;">${i.strasse}</td><td>${i.stadt}</td><td>${i.quadratmeter} m²</td><td>${i.kaltmiete} €</td></tr>`;
    });
    html += '</table>';
    container.innerHTML = '<h2>Immobilienbestand</h2>' + html;
}

// --- BRIEF ---
function renderBrief(container) {
    container.innerHTML = `
        <div class="no-print">
            <h2>Brief-Generator</h2>
            <div class="rechner-grid">
                <div class="section-box">
                    <h3>Absender (Vermieter)</h3>
                    <input type="text" id="b_v_name" placeholder="Vorname Nachname">
                    <input type="text" id="b_v_str" placeholder="Straße Nr.">
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
            <label>Brieftext</label><textarea id="b_txt" style="height:150px;"></textarea>
            <button class="btn-action" onclick="printBrief()">Brief generieren & Drucken</button>
        </div>
        <div id="brief-preview"></div>
    `;
}

function printBrief() {
    const preview = document.getElementById('brief-preview');
    preview.style.display = 'block';
    preview.innerHTML = `
        <div style="font-family:Arial; color:black;">
            <div style="text-align:right;">
                <img src="IMG_4590.png" style="width:180px;"><br>
                <b>${document.getElementById('b_v_name').value}</b><br>
                ${document.getElementById('b_v_str').value}<br>${document.getElementById('b_v_ort').value}<br>
                ${document.getElementById('b_v_tel').value} | ${document.getElementById('b_v_mail').value}
            </div>
            <div style="margin-top:50px; text-decoration:underline; font-size:0.8rem;">
                ${document.getElementById('b_v_name').value}, ${document.getElementById('b_v_str').value}, ${document.getElementById('b_v_ort').value}
            </div>
            <div style="margin-top:15px;">
                ${document.getElementById('b_m_name').value}<br>${document.getElementById('b_m_str').value}<br>${document.getElementById('b_m_ort').value}
            </div>
            <div style="margin-top:50px; text-align:right;">Datum: ${new Date().toLocaleDateString('de-DE')}</div>
            <div style="margin-top:40px; font-weight:bold; font-size:1.1rem;">${document.getElementById('b_bet').value}</div>
            <div style="margin-top:30px; white-space:pre-wrap;">${document.getElementById('b_txt').value}</div>
            <div style="margin-top:60px;">
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
        <h2>Checklisten & Vorlagen</h2>
        <div class="tile" style="width:100%;" onclick="window.print()">
            <h3>Wohnungsübergabeprotokoll</h3>
            <p>Klicke hier, um die Vorlage mit Logo zu drucken.</p>
        </div>
    `;
}
