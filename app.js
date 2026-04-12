// 1. Supabase Initialisierung
const supabaseUrl = 'https://dofofjbjgbmpxjtlolzi.supabase.co'; // BITTE DEINE URL EINTRAGEN
const supabaseKey = 'sb_publishable_grgVSWN2j2zPAWGq_-qUug_yzc0QGV-'; // Dein öffentlicher Key
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Routing-Logik für alle Kacheln
function openApp(appName) {
    document.getElementById('launchpad').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    const content = document.getElementById('app-content');
    content.innerHTML = ''; 

    switch(appName) {
        case 'fixflip': renderFixFlipApp(content); break;
        case 'miete': renderMietrechner(content); break;
        case 'bestand': renderBestand(content); break;
        case 'brief': renderBriefApp(content); break;
        case 'kredit': renderKreditrechner(content); break;
        case 'checklisten': renderChecklisten(content); break;
        default: content.innerHTML = "<h2>In Arbeit</h2>";
    }
}

// --- MIETRECHNER ---
function renderMietrechner(container) {
    container.innerHTML = `
        <h2>Mietrechner (Cashflow)</h2>
        <div class="ff-section">
            <label>Vergleichsmiete (€/qm):</label> <input type="number" id="v_miete" value="10" onchange="calcMiete()">
            <label>Wohnfläche (qm):</label> <input type="number" id="v_qm" value="50" onchange="calcMiete()">
            <label>Hausgeld (Gesamt):</label> <input type="number" id="v_hg" value="250" onchange="calcMiete()">
            <label>Umlagefähig:</label> <input type="number" id="v_umlage" value="200" onchange="calcMiete()">
            <label>Kreditrate (mtl.):</label> <input type="number" id="v_rate" value="300" onchange="calcMiete()">
            <hr>
            <div class="result" id="res-miete">Cashflow: 0 €</div>
        </div>
    `;
}

function calcMiete() {
    const miete = parseFloat(document.getElementById('v_miete').value) * parseFloat(document.getElementById('v_qm').value);
    const nichtUmlage = parseFloat(document.getElementById('v_hg').value) - parseFloat(document.getElementById('v_umlage').value);
    const cashflow = miete - nichtUmlage - parseFloat(document.getElementById('v_rate').value);
    document.getElementById('res-miete').innerHTML = `
        Kaltmiete: ${miete.toFixed(2)} €<br>
        Nicht umlagefähig: ${nichtUmlage.toFixed(2)} €<br>
        <strong>Cashflow mtl.: ${cashflow.toFixed(2)} €</strong>
    `;
}

// --- IMMOBILIENBESTAND (TABELLE) ---
async function renderBestand(container) {
    container.innerHTML = `<h2>Immobilienbestand</h2><div id="table-loading">Lade Daten aus Supabase...</div>`;
    
    const { data, error } = await supabase.from('immobilien').select('*');
    if (error) { container.innerHTML = "Fehler: " + error.message; return; }

    let html = `<div style="overflow-x:auto;"><table border="1" style="width:100%; border-collapse: collapse; background: white;">
        <tr style="background: #eee;">
            <th>Straße/Stadt</th><th>qm</th><th>Zimmer</th><th>Miete (Kalt)</th><th>Hausgeld (n.u.)</th><th>Rendite</th>
        </tr>`;
    
    data.forEach(immo => {
        html += `<tr>
            <td>${immo.strasse}, ${immo.stadt}</td>
            <td>${immo.quadratmeter}</td>
            <td>${immo.zimmer}</td>
            <td>${immo.kaltmiete} €</td>
            <td>${immo.hausgeld_nicht_umlagefaehig} €</td>
            <td>${((immo.kaltmiete * 12) / 150000 * 100).toFixed(2)}%</td> </tr>`;
    });
    html += `</table></div>`;
    container.innerHTML = html;
}

// --- VERMIETER BRIEF APP ---
function renderBriefApp(container) {
    container.innerHTML = `
        <h2>Brief-Generator</h2>
        <div class="ff-section">
            <h3>Absender (Vermieter)</h3>
            <input type="text" id="v_name" placeholder="Dein Name" style="width:100%"><br>
            <input type="text" id="v_anschrift" placeholder="Straße, PLZ Ort" style="width:100%"><br>
            <h3>Empfänger (Mieter)</h3>
            <input type="text" id="m_name" placeholder="Name Mieter" style="width:100%"><br>
            <input type="text" id="m_anschrift" placeholder="Straße, PLZ Ort" style="width:100%"><br>
            <h3>Inhalt</h3>
            <input type="text" id="b_betreff" placeholder="Betreffzeile" style="width:100%; font-weight:bold;"><br>
            <textarea id="b_text" style="width:100%; height:150px;" placeholder="Brieftext..."></textarea><br>
            <button onclick="printBrief()" style="background:green; color:white; padding:10px;">PDF / Drucken</button>
        </div>
        <div id="brief-preview" style="display:none; padding: 40px; background: white; color: black; font-family: Arial;">
            </div>
    `;
}

function printBrief() {
    const preview = document.getElementById('brief-preview');
    preview.style.display = 'block';
    preview.innerHTML = `
        <div style="text-align:right; font-size: 12px;">${document.getElementById('v_name').value}<br>${document.getElementById('v_anschrift').value}</div>
        <div style="margin-top: 50px;">${document.getElementById('m_name').value}<br>${document.getElementById('m_anschrift').value}</div>
        <div style="margin-top: 50px; text-align:right;">Datum: ${new Date().toLocaleDateString()}</div>
        <div style="margin-top: 30px; font-weight:bold;">${document.getElementById('b_betreff').value}</div>
        <div style="margin-top: 20px; line-height: 1.5;">${document.getElementById('b_text').value.replace(/\n/g, '<br>')}</div>
        <div style="margin-top: 80px;">Unterschrift ____________________</div>
    `;
    window.print();
}

// --- CHECKLISTEN ---
function renderChecklisten(container) {
    container.innerHTML = `
        <h2>Vordrucke & Checklisten</h2>
        <div class="tile" onclick="window.print()">
            <h3>Wohnungsübergabeprotokoll</h3>
            <p>Klicke hier um den Standard-Vordruck mit Logo zu drucken.</p>
        </div>
        <div class="tile">
            <h3>Hauskauf Checkliste</h3>
            <p>Notizen zu Substanz, Keller, Dach, Heizung...</p>
        </div>
    `;
}
function openApp(appName) {
    document.getElementById('launchpad').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    
    const content = document.getElementById('app-content');
    content.innerHTML = ''; // Clear previous

    if (appName === 'fixflip') {
        renderFixFlipApp(content);
    } else {
        content.innerHTML = `<h2>App: ${appName}</h2><p>Diese App befindet sich noch in der Entwicklung.</p>`;
    }
}

function closeApp() {
    document.getElementById('launchpad').style.display = 'grid';
    document.getElementById('app-container').style.display = 'none';
}

function renderFixFlipApp(container) {
    container.innerHTML = `
        <h2>Fix & Flip Rechner</h2>
        <style>
            .ff-section { border: 1px solid #ccc; padding: 1rem; margin-bottom: 1rem; border-radius: 4px; }
            .ff-section h3 { margin-bottom: 0.5rem; color: var(--sap-blue); }
            label { display: inline-block; width: 180px; margin-top: 0.5rem; }
            input, select { padding: 0.3rem; width: 150px; }
            .result { font-weight: bold; margin-top: 1rem; border-top: 1px solid #eee; padding-top: 0.5rem; }
            .traffic-light { padding: 1rem; color: white; font-weight: bold; text-align: center; border-radius: 4px; margin-top: 1rem;}
        </style>

        <div class="ff-section" id="ankauf">
            <h3>1. Ankauf</h3>
            <label>Kaufpreis (€):</label> <input type="number" id="kp" value="100000" onchange="calcFF()"><br>
            <label>Wohnfläche (qm):</label> <input type="number" id="qm" value="70" onchange="calcFF()"><br>
            <label>Makler (%):</label> <input type="number" id="makler" value="3.57" onchange="calcFF()"><br>
            <label>Notar & Grundbuch (%):</label> <input type="number" id="notar" value="1.5" readonly><br>
            <label>Bundesland (Grunderwerb):</label> 
            <select id="bundesland" onchange="calcFF()">
                <option value="5.0">Rheinland-Pfalz (5,0%)</option>
                <option value="5.0">Baden-Württemberg (5,0%)</option>
                <option value="6.0">Hessen (6,0%)</option>
                <option value="3.5">Bayern (3,5%)</option>
            </select>
            <div class="result" id="res-ankauf">Gesamtkosten Ankauf: 0 €</div>
        </div>

        <div class="ff-section" id="finanzierung">
            <h3>2. Finanzierung</h3>
            <label>Projektdauer (Monate):</label> <input type="number" id="dauer" value="6" onchange="calcFF()"><br>
            <label>Finanzierungshöhe (%):</label> <input type="number" id="fin_prozent" value="100" onchange="calcFF()"><br>
            <label>Zins (% p.a.):</label> <input type="number" id="zins" value="6.0" onchange="calcFF()"><br>
            <label>Bearbeitungsgebühr (%):</label> <input type="number" id="gebuehr" value="1.0" onchange="calcFF()"><br>
            <div class="result" id="res-finanzierung">Finanzierungskosten (Gesamtprojekt): 0 €</div>
        </div>

        <div class="ff-section" id="renovierung">
            <h3>3. Renovierung</h3>
            <label>Entrümpelung (€):</label> <input type="number" id="entruempelung" value="3000" onchange="calcFF()"><br>
            <label>Renovierung (€):</label> <input type="number" id="reno" value="20000" onchange="calcFF()"><br>
            <label>Sicherheitspuffer (%):</label> <input type="number" id="puffer" value="10" onchange="calcFF()"><br>
            <label>Küche (€):</label> <input type="number" id="kueche" value="0" onchange="calcFF()"><br>
            <label>Sonstiges (€):</label> <input type="number" id="sonstiges" value="0" onchange="calcFF()"><br>
            <div class="result" id="res-renovierung">Renovierungssumme: 0 €</div>
        </div>

        <div class="ff-section" id="monatlich">
            <h3>4. Laufende Kosten (pro Monat)</h3>
            <label>Hausgeld (€):</label> <input type="number" id="hausgeld" value="200" onchange="calcFF()"><br>
            <label>Strom/Heizung (€):</label> <input type="number" id="strom" value="50" onchange="calcFF()"><br>
            <div class="result" id="res-monatlich">Nebenkosten (Gesamtprojekt): 0 €</div>
        </div>

        <div class="ff-section" id="verkauf">
            <h3>5. Verkauf & Rendite</h3>
            <label>Verkaufspreis (€/qm):</label> <input type="number" id="vk_qm" value="2500" onchange="calcFF()"><br>
            <div class="result" id="res-verkauf">Erwarteter Verkaufspreis: 0 €</div>
            <div id="profit-ampel" class="traffic-light">Bitte Werte berechnen</div>
        </div>
    `;
    calcFF(); // Initial calculation
}

function calcFF() {
    // 1. Ankauf
    const kp = parseFloat(document.getElementById('kp').value);
    const makler = kp * (parseFloat(document.getElementById('makler').value) / 100);
    const notar = kp * (parseFloat(document.getElementById('notar').value) / 100);
    const grunderwerb = kp * (parseFloat(document.getElementById('bundesland').value) / 100);
    const ankaufGesamt = kp + makler + notar + grunderwerb;
    document.getElementById('res-ankauf').innerText = `Gesamtkosten Ankauf: ${ankaufGesamt.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})}`;

    // 3. Renovierung (Muss vor Finanzierung berechnet werden, falls 100% inkl. Reno finanziert wird. Hier gehen wir von 100% Kaufpreis+NK+Reno aus)
    const entruempelung = parseFloat(document.getElementById('entruempelung').value);
    const reno = parseFloat(document.getElementById('reno').value);
    const kueche = parseFloat(document.getElementById('kueche').value);
    const sonst = parseFloat(document.getElementById('sonstiges').value);
    const renoSubtotal = entruempelung + reno + kueche + sonst;
    const renoGesamt = renoSubtotal + (renoSubtotal * (parseFloat(document.getElementById('puffer').value) / 100));
    document.getElementById('res-renovierung').innerText = `Renovierungssumme: ${renoGesamt.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})}`;

    // 2. Finanzierung
    const dauerMonate = parseFloat(document.getElementById('dauer').value);
    const finProzent = parseFloat(document.getElementById('fin_prozent').value) / 100;
    const kreditsumme = (ankaufGesamt + renoGesamt) * finProzent;
    const zinsPa = parseFloat(document.getElementById('zins').value) / 100;
    const zinskostenProjekt = kreditsumme * zinsPa * (dauerMonate / 12);
    const gebuehren = kreditsumme * (parseFloat(document.getElementById('gebuehr').value) / 100);
    const finGesamt = zinskostenProjekt + gebuehren;
    document.getElementById('res-finanzierung').innerText = `Finanzierungskosten (Gesamtprojekt): ${finGesamt.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})} (Rate/Monat ca. ${(zinskostenProjekt/dauerMonate).toLocaleString('de-DE')} €)`;

    // 4. Laufende Kosten
    const nkMonat = parseFloat(document.getElementById('hausgeld').value) + parseFloat(document.getElementById('strom').value);
    const nkGesamt = nkMonat * dauerMonate;
    document.getElementById('res-monatlich').innerText = `Nebenkosten (Gesamtprojekt): ${nkGesamt.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})}`;

    // 5. Verkauf & Profit
    const qm = parseFloat(document.getElementById('qm').value);
    const vkQm = parseFloat(document.getElementById('vk_qm').value);
    const vkPreis = qm * vkQm;
    document.getElementById('res-verkauf').innerText = `Erwarteter Verkaufspreis: ${vkPreis.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})}`;

    // Profit berechnen
    const gesamtKosten = ankaufGesamt + renoGesamt + finGesamt + nkGesamt;
    const profit = vkPreis - gesamtKosten;
    const profitMarge = (profit / vkPreis) * 100; // Prozentualer Profit vom Verkaufspreis

    const ampel = document.getElementById('profit-ampel');
    ampel.innerText = `Profit: ${profit.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})} (${profitMarge.toFixed(2)}%)`;

    // Ampel-Logik
    if (profitMarge >= 25) {
        ampel.style.backgroundColor = '#28a745'; // Grün
    } else if (profitMarge >= 20 && profitMarge < 25) {
        ampel.style.backgroundColor = '#ffc107'; // Gelb
        ampel.style.color = '#333';
    } else {
        ampel.style.backgroundColor = '#dc3545'; // Rot
    }
}
