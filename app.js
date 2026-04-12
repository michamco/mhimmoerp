// --- CONFIGURATION ---
const supabaseUrl = 'https://DEINE_SUPABASE_URL.supabase.co'; // HIER DEINE URL EINTRAGEN
const supabaseKey = 'sb_publishable_grgVSWN2j2zPAWGq_-qUug_yzc0QGV-';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- NAVIGATION ---
function openApp(appName) {
    document.getElementById('launchpad').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    const content = document.getElementById('app-content');
    content.innerHTML = ''; 

    switch(appName) {
        case 'kredit': renderKreditrechner(content); break;
        case 'fixflip': renderFixFlipApp(content); break;
        case 'miete': renderMietrechner(content); break;
        case 'bestand': renderBestand(content); break;
        case 'brief': renderBriefApp(content); break;
        case 'checklisten': renderChecklisten(content); break;
        default: content.innerHTML = "<h2>App nicht gefunden</h2>";
    }
}

function closeApp() {
    document.getElementById('launchpad').style.display = 'grid';
    document.getElementById('app-container').style.display = 'none';
}

// --- 1. KREDITRECHNER (Annuität) ---
function renderKreditrechner(container) {
    container.innerHTML = `
        <h2>Kreditrechner</h2>
        <div class="ff-section">
            <label>Darlehensbetrag (€):</label> <input type="number" id="kr_betrag" value="200000" oninput="calcKredit()">
            <label>Sollzins (%):</label> <input type="number" id="kr_zins" value="3.5" step="0.1" oninput="calcKredit()">
            <label>Tilgung (%):</label> <input type="number" id="kr_tilgung" value="2" step="0.1" oninput="calcKredit()">
            <hr>
            <div class="result" id="kr_res">Monatliche Rate: 0 €</div>
        </div>
    `;
    calcKredit();
}

function calcKredit() {
    const b = parseFloat(document.getElementById('kr_betrag').value);
    const z = parseFloat(document.getElementById('kr_zins').value) / 100;
    const t = parseFloat(document.getElementById('kr_tilgung').value) / 100;
    const rate = (b * (z + t)) / 12;
    document.getElementById('kr_res').innerHTML = `<strong>Monatliche Rate: ${rate.toFixed(2)} €</strong>`;
}

// --- 2. FIX & FLIP RECHNER (Die 4 Teile) ---
function renderFixFlipApp(container) {
    container.innerHTML = `
        <h2>Fix & Flip Rechner</h2>
        <div class="ff-section">
            <h3>1. Ankauf</h3>
            <label>Kaufpreis (€):</label> <input type="number" id="ff_kp" value="150000" oninput="calcFF()">
            <label>Wohnfläche (qm):</label> <input type="number" id="ff_qm" value="80" oninput="calcFF()">
            <label>Bundesland:</label>
            <select id="ff_land" onchange="calcFF()">
                <option value="5">RLP (5%)</option>
                <option value="5">BW (5%)</option>
                <option value="6">Hessen (6%)</option>
                <option value="3.5">Bayern (3,5%)</option>
            </select>
            <p>Notar & Grundbuch: 1,5% (fest)</p>
            <label>Makler (%):</label> <input type="number" id="ff_makler" value="3.57" oninput="calcFF()">
        </div>
        <div class="ff-section">
            <h3>2. Finanzierung</h3>
            <label>Dauer (Monate):</label> <input type="number" id="ff_dauer" value="6" oninput="calcFF()">
            <label>Zins (% p.a.):</label> <input type="number" id="ff_zins" value="6" oninput="calcFF()">
            <label>Gebühr (%):</label> <input type="number" id="ff_geb" value="1" oninput="calcFF()">
        </div>
        <div class="ff-section">
            <h3>3. Renovierung</h3>
            <label>Entrümpelung (€):</label> <input type="number" id="ff_ent" value="3000" oninput="calcFF()">
            <label>Renovierung (€):</label> <input type="number" id="ff_reno" value="20000" oninput="calcFF()">
            <label>Küche (€):</label> <input type="number" id="ff_kue" value="0" oninput="calcFF()">
            <p>Sicherheitspuffer: 10% (inkludiert)</p>
        </div>
        <div class="ff-section">
            <h3>4. Monatliche Kosten & Verkauf</h3>
            <label>Hausgeld (€):</label> <input type="number" id="ff_hg" value="200" oninput="calcFF()">
            <label>Strom/Heizung (€):</label> <input type="number" id="ff_sh" value="50" oninput="calcFF()">
            <hr>
            <label>Verkaufspreis (€/qm):</label> <input type="number" id="ff_vk_qm" value="3500" oninput="calcFF()">
            <div id="ff_ampel" style="padding:15px; margin-top:10px; border-radius:5px; font-weight:bold; text-align:center;">-</div>
        </div>
    `;
    calcFF();
}

function calcFF() {
    const kp = parseFloat(document.getElementById('ff_kp').value);
    const qm = parseFloat(document.getElementById('ff_qm').value);
    const land = parseFloat(document.getElementById('ff_land').value) / 100;
    const makler = parseFloat(document.getElementById('ff_makler').value) / 100;
    
    // 1. Ankauf Kosten
    const ankaufNK = kp * (land + 0.015 + makler);
    const ankaufGesamt = kp + ankaufNK;
    
    // 3. Reno
    const renoBasis = parseFloat(document.getElementById('ff_ent').value) + parseFloat(document.getElementById('ff_reno').value) + parseFloat(document.getElementById('ff_kue').value);
    const renoGesamt = renoBasis * 1.10; // 10% Puffer
    
    // 2. Finanzierung
    const dauer = parseFloat(document.getElementById('ff_dauer').value);
    const darlehen = ankaufGesamt + renoGesamt;
    const finKosten = (darlehen * (parseFloat(document.getElementById('ff_zins').value)/100) * (get_val('ff_dauer')/12)) + (darlehen * (parseFloat(document.getElementById('ff_geb').value)/100));
    
    // 4. NK
    const nkGesamt = (parseFloat(document.getElementById('ff_hg').value) + parseFloat(document.getElementById('ff_sh').value)) * dauer;
    
    // Total & Profit
    const gesamtInvest = ankaufGesamt + renoGesamt + finKosten + nkGesamt;
    const verkaufspreis = qm * parseFloat(document.getElementById('ff_vk_qm').value);
    const profit = verkaufspreis - gesamtInvest;
    const marge = (profit / verkaufspreis) * 100;

    const ampel = document.getElementById('ff_ampel');
    ampel.innerHTML = `Profit: ${profit.toFixed(2)} € (${marge.toFixed(1)}%)`;
    
    if (marge >= 25) { ampel.style.background = "#28a745"; ampel.style.color = "white"; }
    else if (marge >= 20) { ampel.style.background = "#ffc107"; ampel.style.color = "black"; }
    else { ampel.style.background = "#dc3545"; ampel.style.color = "white"; }
}

function get_val(id) { return parseFloat(document.getElementById(id).value) || 0; }

// --- 3. MIETRECHNER ---
function renderMietrechner(container) {
    container.innerHTML = `
        <h2>Mietrechner</h2>
        <div class="ff-section">
            <label>Miete (€/qm):</label> <input type="number" id="m_qm_p" value="12" oninput="calcM()">
            <label>Fläche (qm):</label> <input type="number" id="m_fl" value="60" oninput="calcM()">
            <label>Hausgeld (€):</label> <input type="number" id="m_hg" value="250" oninput="calcM()">
            <label>Umlagefähig (€):</label> <input type="number" id="m_um" value="180" oninput="calcM()">
            <label>Kreditrate (€):</label> <input type="number" id="m_rate" value="400" oninput="calcM()">
            <div class="result" id="m_res">Cashflow: 0 €</div>
        </div>
    `;
    calcM();
}

function calcM() {
    const miete = get_val('m_qm_p') * get_val('m_fl');
    const nichtUmlage = get_val('m_hg') - get_val('m_um');
    const cf = miete - nichtUmlage - get_val('m_rate');
    document.getElementById('m_res').innerHTML = `Cashflow: <strong>${cf.toFixed(2)} €</strong>`;
}

// --- 4. BESTAND (Tabelle) ---
async function renderBestand(container) {
    container.innerHTML = `<h2>Immobilienbestand</h2><p>Lade aus Supabase...</p>`;
    const { data, error } = await supabase.from('immobilien').select('*');
    if (error) { container.innerHTML = "Fehler: " + error.message; return; }
    
    let table = `<table style="width:100%; border-collapse: collapse; margin-top:10px;">
        <tr style="background:#0070f2; color:white;">
            <th style="padding:10px;">Strasse</th><th>Stadt</th><th>qm</th><th>Miete</th>
        </tr>`;
    data.forEach(i => {
        table += `<tr style="border-bottom:1px solid #ddd;">
            <td style="padding:10px;">${i.strasse}</td><td>${i.stadt}</td><td>${i.quadratmeter}</td><td>${i.kaltmiete} €</td>
        </tr>`;
    });
    table += `</table>`;
    container.innerHTML = table;
}

// --- 5. BRIEF APP ---
function renderBriefApp(container) {
    container.innerHTML = `
        <h2>Brief-Generator</h2>
        <div class="ff-section" id="brief-form">
            <input type="text" id="b_abs" placeholder="Absender Name/Anschrift" style="width:100%; margin-bottom:5px;">
            <input type="text" id="b_mie" placeholder="Mieter Name/Anschrift" style="width:100%; margin-bottom:5px;">
            <input type="text" id="b_bet" placeholder="Betreff" style="width:100%; margin-bottom:5px;">
            <textarea id="b_txt" placeholder="Inhalt..." style="width:100%; height:150px;"></textarea>
            <button onclick="druckeBrief()" style="width:100%; padding:10px; background:#0070f2; color:white; border:none; cursor:pointer;">Brief generieren & Drucken</button>
        </div>
    `;
}

function druckeBrief() {
    const content = `
        <div style="padding:50px; font-family:Arial;">
            <img src="IMG_4590.png" style="height:50px; float:right;">
            <div style="margin-top:80px;">${document.getElementById('b_abs').value}</div>
            <div style="margin-top:40px;">${document.getElementById('b_mie').value}</div>
            <div style="margin-top:40px; font-weight:bold;">${document.getElementById('b_bet').value}</div>
            <div style="margin-top:20px;">${document.getElementById('b_txt').value.replace(/\n/g, '<br>')}</div>
            <div style="margin-top:60px;">Ort, Datum: _________________</div>
            <div style="margin-top:40px;">Unterschrift: _________________</div>
        </div>
    `;
    const win = window.open('', '_blank');
    win.document.write(content);
    win.print();
}

// --- 6. CHECKLISTEN ---
function renderChecklisten(container) {
    container.innerHTML = `
        <h2>Checklisten</h2>
        <div class="ff-section" onclick="window.print()" style="cursor:pointer; background:#f9f9f9;">
            <h3>📋 Wohnungsübergabeprotokoll</h3>
            <p>Klicken zum Drucken (Vordruck mit MHIMMOBILIEN Logo)</p>
        </div>
        <div class="ff-section">
            <h3>🏠 Hauskauf Checkliste</h3>
            <ul>
                <li>Dachzustand & Dämmung</li>
                <li>Heizungsart & Baujahr</li>
                <li>Feuchtigkeit im Keller?</li>
                <li>Energieausweis vorhanden?</li>
            </ul>
        </div>
    `;
}
