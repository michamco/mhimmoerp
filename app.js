// Initialisierung
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
        case 'checklisten': content.innerHTML = '<h2>Checklisten</h2><p>Vordrucke werden generiert...</p>'; break;
        case 'admin': content.innerHTML = '<h2>Benutzerverwaltung</h2><p>Hier können Sie User anlegen/löschen.</p>'; break;
    }
}

function closeApp() {
    document.getElementById('launchpad').style.display = 'grid';
    document.getElementById('app-container').style.display = 'none';
}

// --- APP: BRIEF GENERATOR ---
function renderBrief(container) {
    container.innerHTML = `
        <h2 class="no-print">Professioneller Brief-Generator</h2>
        <div class="rechner-grid no-print">
            <div class="ff-section">
                <h3>Absender-Daten (Vermieter)</h3>
                <input type="text" id="b_v_name" placeholder="Vorname Nachname">
                <input type="text" id="b_v_str" placeholder="Straße / Hausnr.">
                <input type="text" id="b_v_ort" placeholder="PLZ / Stadt">
                <input type="text" id="b_v_tel" placeholder="Telefon">
                <input type="text" id="b_v_mail" placeholder="E-Mail">
            </div>
            <div class="ff-section">
                <h3>Empfänger-Daten (Mieter)</h3>
                <input type="text" id="b_m_name" placeholder="Name des Mieters">
                <input type="text" id="b_m_str" placeholder="Straße / Hausnr.">
                <input type="text" id="b_m_ort" placeholder="PLZ / Stadt">
            </div>
        </div>
        <div class="form-group no-print" style="margin-top:20px;">
            <label>Ort & Datum (für oben rechts)</label>
            <input type="text" id="b_datum" value="Ludwigshafen, den ${new Date().toLocaleDateString('de-DE')}">
            <label>Betreff (Fettgedruckt)</label>
            <input type="text" id="b_betreff" placeholder="z.B. Mieterhöhung / Nebenkostenabrechnung">
            <label>Brief-Inhalt</label>
            <textarea id="b_text" style="height:200px;" placeholder="Sehr geehrte Damen und Herren..."></textarea>
            <button class="btn-main" style="margin-top:20px; width:100%;" onclick="generateBriefPrint()">Brief Vorschau & Drucken</button>
        </div>
        <div id="brief-preview"></div>
    `;
}

function generateBriefPrint() {
    const val = (id) => document.getElementById(id).value;
    const preview = document.getElementById('brief-preview');
    preview.style.display = 'block';
    
    preview.innerHTML = `
        <div style="font-family: 'Times New Roman', serif; color: black; line-height: 1.4;">
            <div style="float: right; text-align: right;">
                <img src="IMG_4590.png" style="width: 200px; margin-bottom: 20px;"><br>
                <strong>${val('b_v_name')}</strong><br>
                ${val('b_v_str')}<br>${val('b_v_ort')}<br>
                Tel: ${val('b_v_tel')}<br>Mail: ${val('b_v_mail')}
            </div>
            <div style="margin-top: 100px; font-size: 0.8rem; text-decoration: underline;">
                ${val('b_v_name')} - ${val('b_v_str')} - ${val('b_v_ort')}
            </div>
            <div style="margin-top: 20px; font-size: 1.1rem;">
                ${val('b_m_name')}<br>${val('b_m_str')}<br>${val('b_m_ort')}
            </div>
            <div style="margin-top: 60px; text-align: right;">
                ${val('b_datum')}
            </div>
            <div style="margin-top: 40px; font-size: 1.2rem; font-weight: bold;">
                ${val('b_betreff')}
            </div>
            <div style="margin-top: 30px; white-space: pre-wrap; min-height: 300px;">
                ${val('b_text')}
            </div>
            <div style="margin-top: 40px;">
                Mit freundlichen Grüßen<br><br><br>
                ___________________________<br>
                ${val('b_v_name')}
            </div>
        </div>
    `;
    window.print();
}

// --- APP: BESTAND ---
async function renderBestand(container) {
    container.innerHTML = '<h2>Immobilienbestand</h2><div id="loading-spinner">Lade Daten aus Supabase...</div>';
    
    const { data, error } = await supabase.from('immobilien').select('*');
    
    if(error) {
        container.innerHTML = `<div style="color:red; padding:20px;">Fehler beim Laden: ${error.message}</div>`;
        return;
    }

    let html = `
        <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse: collapse; margin-top:10px; font-size: 0.9rem;">
                <thead>
                    <tr style="background:#f2f2f2; text-align:left; border-bottom: 2px solid var(--sap-blue);">
                        <th style="padding:12px;">Objekt / Stadt</th>
                        <th>Fläche</th>
                        <th>Zimmer</th>
                        <th>Kaltmiete</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if(data.length === 0) {
        html += '<tr><td colspan="5" style="padding:20px; text-align:center;">Keine Immobilien im Bestand gefunden.</td></tr>';
    } else {
        data.forEach(immo => {
            html += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding:12px;"><strong>${immo.strasse}</strong><br>${immo.stadt}</td>
                    <td>${immo.quadratmeter} m²</td>
                    <td>${immo.zimmer}</td>
                    <td>${immo.kaltmiete} €</td>
                    <td><span style="background:#e1f5fe; color:#01579b; padding:4px 8px; border-radius:12px;">Vermietet</span></td>
                </tr>
            `;
        });
    }

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// Restliche Rechner (Fix&Flip / Kredit) hier einfügen (wie im vorherigen Code-Turn, nur mit CSS-Klassen .rechner-grid und .form-group)...
