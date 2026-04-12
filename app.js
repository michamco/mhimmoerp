// --- Initialisierung ---
const supabaseUrl = 'https://dofofjbjgbmpxjtlolzi.supabase.co';
const supabaseKey = 'sb_publishable_grgVSWN2j2zPAWGq_-qUug_yzc0QGV-';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- Login Funktion ---
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

// --- Navigation ---
function openApp(id) {
    document.getElementById('launchpad').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    const content = document.getElementById('app-content');
    content.innerHTML = '';

    switch(id) {
        case 'kredit': renderKredit(content); break;
        case 'fixflip': renderFixFlip(content); break;
        case 'miete': renderMietrechner(content); break;
        case 'bestand': renderBestand(content); break;
        case 'brief': renderBrief(content); break;
        case 'checklisten': renderChecklisten(content); break;
        case 'admin': content.innerHTML = '<h3>Admin Bereich</h3><p>Benutzerverwaltung folgt hier.</p>'; break;
    }
}

function closeApp() {
    document.getElementById('launchpad').style.display = 'grid';
    document.getElementById('app-container').style.display = 'none';
}

// --- App: Fix & Flip Rechner ---
function renderFixFlip(container) {
    container.innerHTML = `
        <h2>Fix & Flip Rechner</h2>
        <div class="ff-section">
            <h3>1. Ankauf</h3>
            <label>Kaufpreis (€)</label><input type="number" id="ff_kp" value="150000" oninput="calcFF()">
            <label>Wohnfläche (qm)</label><input type="number" id="ff_qm" value="70" oninput="calcFF()">
            <label>Bundesland</label>
            <select id="ff_land" onchange="calcFF()">
                <option value="5.0">RLP (5,0%)</option>
                <option value="5.0">BW (5,0%)</option>
                <option value="6.0">Hessen (6,0%)</option>
            </select>
            <p style="font-size:0.8rem">Notar/Grundbuch: 1,5% (fix) | Makler: 3,57% (std)</p>
        </div>
        <div class="ff-section">
            <h3>2. Finanzierung</h3>
            <label>Dauer (Monate)</label><input type="number" id="ff_mon" value="6" oninput="calcFF()">
            <label>Beleihung (%)</label><input type="number" id="ff_bel" value="100" oninput="calcFF()">
            <label>Zins p.a. (%)</label><input type="number" id="ff_zins" value="6" oninput="calcFF()">
            <label>Gebühr (%)</label><input type="number" id="ff_geb" value="1" oninput="calcFF()">
        </div>
        <div class="ff-section">
            <h3>3. Renovierung</h3>
            <label>Entrümpelung (€)</label><input type="number" id="ff_ent" value="3000" oninput="calcFF()">
            <label>Renovierung (€)</label><input type="number" id="ff_reno" value="20000" oninput="calcFF()">
            <label>Küche / Sonstiges (€)</label><input type="number" id="ff_sonst" value="0" oninput="calcFF()">
            <p style="font-size:0.8rem">Inkl. 10% Sicherheitspuffer automatisch</p>
        </div>
        <div class="ff-section">
            <h3>4. Monatliche Kosten & Verkauf</h3>
            <label>Hausgeld (€/mtl.)</label><input type="number" id="ff_hg" value="200" oninput="calcFF()">
            <label>Strom/Heizung (€/mtl.)</label><input type="number" id="ff_sh" value="50" oninput="calcFF()">
            <hr>
            <label>Ziel-Verkaufspreis (€/qm)</label><input type="number" id="ff_vk_qm" value="3800" oninput="calcFF()">
        </div>
        <div id="ff_res" class="result-bar">Berechne...</div>
    `;
    calcFF();
}

function calcFF() {
    const getV = (id) => parseFloat(document.getElementById(id).value) || 0;
    
    // Ankauf
    const kp = getV('ff_kp');
    const nk = kp * (getV('ff_land')/100 + 0.015 + 0.0357);
    const ankaufGesamt = kp + nk;
    
    // Reno
    const renoBasis = getV('ff_ent') + getV('ff_reno') + getV('ff_sonst');
    const renoGesamt = renoBasis * 1.10;
    
    // Finanzierung
    const darlehen = (ankaufGesamt + renoGesamt) * (getV('ff_bel')/100);
    const zinskosten = (darlehen * (getV('ff_zins')/100)) * (getV('ff_mon')/12);
    const gebuehr = darlehen * (getV('ff_geb')/100);
    
    // Mtl Kosten
    const mtlGesamt = (getV('ff_hg') + getV('ff_sh')) * getV('ff_mon');
    
    const investTotal = ankaufGesamt + renoGesamt + zinskosten + gebuehr + mtlGesamt;
    const verkauf = getV('ff_vk_qm') * getV('ff_qm');
    const profit = verkauf - investTotal;
    const marge = (profit / verkauf) * 100;

    const resBox = document.getElementById('ff_res');
    resBox.innerHTML = `Profit: ${profit.toLocaleString('de-DE')} € (${marge.toFixed(1)}%)`;
    
    if(marge >= 25) { resBox.style.background = '#28a745'; resBox.style.color = 'white'; }
    else if(marge >= 20) { resBox.style.background = '#ffc107'; resBox.style.color = 'black'; }
    else { resBox.style.background = '#dc3545'; resBox.style.color = 'white'; }
}

// --- App: Bestand ---
async function renderBestand(container) {
    container.innerHTML = '<h2>Immobilienbestand</h2><p>Lade Daten aus Supabase...</p>';
    const { data, error } = await supabase.from('immobilien').select('*');
    if(error) { container.innerHTML = 'Fehler: ' + error.message; return; }
    
    let html = '<div style="overflow-x:auto"><table style="width:100%; border-collapse:collapse; font-size:0.8rem;">';
    html += '<tr style="background:#eee"><th>Straße</th><th>Stadt</th><th>qm</th><th>Miete</th><th>Hausgeld</th></tr>';
    data.forEach(i => {
        html += `<tr style="border-bottom:1px solid #ddd"><td>${i.strasse}</td><td>${i.stadt}</td><td>${i.quadratmeter}</td><td>${i.kaltmiete}€</td><td>${i.hausgeld}€</td></tr>`;
    });
    html += '</table></div>';
    container.innerHTML = html;
}

// --- App: Brief ---
function renderBrief(container) {
    container.innerHTML = `
        <h2>Vermieter-Brief</h2>
        <input type="text" id="b_v_name" placeholder="Vermieter Name">
        <input type="text" id="b_m_name" placeholder="Mieter Name">
        <input type="text" id="b_bet" placeholder="Betreff">
        <textarea id="b_text" placeholder="Inhalt..." style="height:150px"></textarea>
        <button onclick="window.print()" style="margin-top:10px; padding:10px; background:green; color:white; border:none;">Drucken / PDF</button>
        <div id="print-area" style="margin-top:50px; border:1px solid #eee; padding:50px; font-family:serif;">
            <img src="IMG_4590.png" style="height:50px; float:right;">
            <div style="margin-top:60px;">Vermieter: <span id="out_v"></span></div>
            <div style="margin-top:20px;">An: <span id="out_m"></span></div>
            <div style="margin-top:40px; font-weight:bold;"><span id="out_bet"></span></div>
            <div style="margin-top:20px; min-height:200px;"><span id="out_txt"></span></div>
            <div style="margin-top:50px;">Ort/Datum: _________________</div>
        </div>
    `;
    // Sync inputs with print preview
    container.addEventListener('input', () => {
        document.getElementById('out_v').innerText = document.getElementById('b_v_name').value;
        document.getElementById('out_m').innerText = document.getElementById('b_m_name').value;
        document.getElementById('out_bet').innerText = document.getElementById('b_bet').value;
        document.getElementById('out_txt').innerText = document.getElementById('b_text').value;
    });
}

// --- App: Kreditrechner ---
function renderKredit(container) {
    container.innerHTML = `
        <h2>Kreditrechner</h2>
        <div class="ff-section">
            <label>Darlehen (€)</label><input type="number" id="kr_d" value="200000" oninput="calcKr()">
            <label>Zins (%)</label><input type="number" id="kr_z" value="3.5" step="0.1" oninput="calcKr()">
            <label>Tilgung (%)</label><input type="number" id="kr_t" value="2.0" step="0.1" oninput="calcKr()">
            <div id="kr_res" class="result-bar" style="background:var(--sap-blue); color:white; margin-top:20px;"></div>
        </div>
    `;
    calcKr();
}
function calcKr() {
    const d = parseFloat(document.getElementById('kr_d').value);
    const r = (d * ((parseFloat(document.getElementById('kr_z').value) + parseFloat(document.getElementById('kr_t').value))/100)) / 12;
    document.getElementById('kr_res').innerText = `Monatliche Rate: ${r.toFixed(2)} €`;
}

// --- App: Mietrechner ---
function renderMietrechner(container) {
    container.innerHTML = `
        <h2>Mietrechner</h2>
        <div class="ff-section">
            <label>Miete (€/qm)</label><input type="number" id="m_qm" value="12" oninput="calcM()">
            <label>Fläche (qm)</label><input type="number" id="m_f" value="60" oninput="calcM()">
            <label>Hausgeld (€)</label><input type="number" id="m_hg" value="250" oninput="calcM()">
            <label>Umlagefähig (€)</label><input type="number" id="m_u" value="180" oninput="calcM()">
            <label>Bankrate (€)</label><input type="number" id="m_br" value="400" oninput="calcM()">
            <div id="m_res" class="result-bar" style="background:#eee; margin-top:20px;"></div>
        </div>
    `;
    calcM();
}
function calcM() {
    const miete = parseFloat(document.getElementById('m_qm').value) * parseFloat(document.getElementById('m_f').value);
    const nichtUml = parseFloat(document.getElementById('m_hg').value) - parseFloat(document.getElementById('m_u').value);
    const cf = miete - nichtUml - parseFloat(document.getElementById('m_br').value);
    document.getElementById('m_res').innerHTML = `Cashflow: <span style="color:${cf >= 0 ? 'green' : 'red'}">${cf.toFixed(2)} €</span>`;
}

// --- App: Checklisten ---
function renderChecklisten(container) {
    container.innerHTML = `
        <h2>Checklisten & Vordrucke</h2>
        <div class="tile" style="width:100%; height:auto;" onclick="window.print()">
            <img src="IMG_4590.png" style="height:30px;">
            <h3>Wohnungsübergabeprotokoll</h3>
            <p>Standardvordruck MHIMMOBILIEN</p>
        </div>
        <div class="tile" style="width:100%; height:auto; margin-top:10px;">
            <h3>Checkliste Hauskauf</h3>
            <ul style="text-align:left; font-size:0.8rem;">
                <li>Zustand Dach & Dämmung</li>
                <li>Heizung (Baujahr & Typ)</li>
                <li>Energieklasse (Bedarf/Verbrauch)</li>
                <li>Keller (Trockenheit)</li>
                <li>Fenster (Verglasung)</li>
            </ul>
        </div>
    `;
}
