        var APP_VERSION = 'V1.36.7';

        /* Production - console loglari kapat */
        console.log=function(){}; console.warn=function(){}; // console.error acik tutuluyor (debug)

function htAttrEsc(s) { return (s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function trToLower(s) { return (s||'').replace(/İ/g,'i').replace(/ı/g,'i').replace(/Ğ/g,'g').replace(/ğ/g,'g').replace(/Ş/g,'s').replace(/ş/g,'s').replace(/Ç/g,'c').replace(/ç/g,'c').replace(/Ö/g,'o').replace(/ö/g,'o').replace(/Ü/g,'u').replace(/ü/g,'u').toLowerCase(); }

function trPdfText(s) { return (s||'').replace(/İ/g,'I').replace(/ı/g,'i').replace(/Ğ/g,'G').replace(/ğ/g,'g').replace(/Ş/g,'S').replace(/ş/g,'s'); }

        /* --- Ses Bildirim Sistemi --- */
function tmSesCal(tur) {
    try {
        var ctx = new (window.AudioContext || window.webkitAudioContext)();
        var t = ctx.currentTime;
        var v = 0.6;
        function pad(freq, start, dur, vol, detune) {
            var o = ctx.createOscillator();
            var g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination);
            o.type = 'sine';
            o.frequency.value = freq;
            if (detune) o.detune.value = detune;
            g.gain.setValueAtTime(0, start);
            g.gain.linearRampToValueAtTime(vol || v * 0.6, start + 0.08);
            g.gain.exponentialRampToValueAtTime(0.001, start + dur);
            o.start(start); o.stop(start + dur);
            var o2 = ctx.createOscillator();
            var g2 = ctx.createGain();
            o2.connect(g2); g2.connect(ctx.destination);
            o2.type = 'sine';
            o2.frequency.value = freq * 2;
            g2.gain.setValueAtTime(0, start);
            g2.gain.linearRampToValueAtTime((vol || v * 0.6) * 0.15, start + 0.06);
            g2.gain.exponentialRampToValueAtTime(0.001, start + dur * 0.7);
            o2.start(start); o2.stop(start + dur * 0.7);
        }
        if (tur === 'giris') {
            pad(261.63, t, 0.9, v * 0.8);
            pad(329.63, t + 0.15, 0.75, v * 0.6);
            pad(392, t + 0.3, 0.6, v * 0.5);
            pad(523.25, t + 0.42, 0.5, v * 0.35);
        } else if (tur === 'cikis') {
            pad(523.25, t, 0.9, v * 0.8);
            pad(392, t + 0.18, 0.75, v * 0.6);
            pad(329.63, t + 0.35, 0.6, v * 0.5);
            pad(261.63, t + 0.5, 0.5, v * 0.35);
        } else if (tur === 'basarili') {
            pad(392, t, 0.08, v * 0.8);
            pad(523.25, t + 0.06, 0.08, v * 0.7);
            pad(659.25, t + 0.12, 0.08, v * 0.6);
            pad(783.99, t + 0.18, 0.35, v * 0.5);
        } else if (tur === 'silme') {
            pad(369.99, t, 0.1, v * 0.7);
            pad(329.63, t + 0.08, 0.1, v * 0.6);
            pad(293.66, t + 0.16, 0.1, v * 0.5);
            pad(261.63, t + 0.24, 0.4, v * 0.4);
        } else if (tur === 'para') {
            for(var ci=0; ci<3; ci++) {
                var cf = 300 + Math.random()*800;
                var co = ctx.createOscillator();
                var cg = ctx.createGain();
                co.connect(cg); cg.connect(ctx.destination);
                co.type = 'triangle';
                co.frequency.value = cf;
                cg.gain.setValueAtTime(0, t + ci*0.08);
                cg.gain.linearRampToValueAtTime(v*0.3, t + ci*0.08 + 0.02);
                cg.gain.exponentialRampToValueAtTime(0.001, t + ci*0.08 + 0.15);
                co.start(t + ci*0.08); co.stop(t + ci*0.08 + 0.15);
            }
            var bn = ctx.createBufferSource();
            var noiseLen = 0.07;
            var buf = ctx.createBuffer(1, ctx.sampleRate * noiseLen, ctx.sampleRate);
            var data = buf.getChannelData(0);
            for(var ni=0; ni<data.length; ni++) data[ni] = (Math.random()*2-1) * Math.exp(-ni/(ctx.sampleRate*0.02));
            bn.buffer = buf;
            var bng = ctx.createGain();
            bn.connect(bng); bng.connect(ctx.destination);
            bng.gain.setValueAtTime(v*0.15, t);
            bng.gain.exponentialRampToValueAtTime(0.001, t + noiseLen);
            bn.start(t); bn.stop(t + noiseLen);
        } else {
            pad(800, t, 0.12, v * 0.6);
        }
    } catch(e) {}
}

/* --- EmailJS - Gorev Bildirim Maili --- */
var EMAILJS_CONFIG = {
    publicKey: "yCeI9aqnQrtmGtq7D",
    serviceId: "service_77j0plq",
    templateId: "template_920ilvh"
};

function gorevMailGonder(gorev) {
    if (EMAILJS_CONFIG.publicKey.indexOf("YOUR_") === 0) return;
    var kullanicilar;
    try { kullanicilar = JSON.parse(localStorage.getItem("tm_users_final_v8")) || []; } catch(e) { kullanicilar = []; }
    var master;
    try { master = JSON.parse(localStorage.getItem("tm_admin_creds_final")) || {}; } catch(e) { master = {}; }
    var atanan = gorev.atanan;
    var atananArr = Array.isArray(atanan) ? atanan : [atanan];
    atananArr.forEach(function(usr){
        var u = kullanicilar.find(function(x){ return x.usr === usr; });
        var email = u ? u.email : null;
        if (!email && master && master.usr === usr) { email = master.email; }
        if (!email || email === "-" || !email.includes("@")) return;
        var templateParams = {
            to_name: usr,
            to_email: email,
            from_name: gorev.veren || "Sistem",
            task_title: gorev.baslik || "",
            task_msg: gorev.mesaj || "",
            task_date: gorev.tarih || ""
        };
        fetch("https://api.emailjs.com/api/v1.0/email/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                service_id: EMAILJS_CONFIG.serviceId,
                template_id: EMAILJS_CONFIG.templateId,
                user_id: EMAILJS_CONFIG.publicKey,
                template_params: templateParams
            })
        });
    });
}

/* --- Firebase Sync Katmani (verileri buluta yedekler) --- */
        const firebaseConfig = {
            apiKey: "AIzaSyAgKERI5UOh5urGPTS2ODRoI-Qb8H7Ro1k",
            authDomain: "tm-portal-d672a.firebaseapp.com",
            projectId: "tm-portal-d672a",
            storageBucket: "tm-portal-d672a.firebasestorage.app",
            messagingSenderId: "336034204213",
            appId: "1:336034204213:web:76d63b921e545f5fb9ff7c"
        };
        var fdb = null;
        try { firebase.initializeApp(firebaseConfig); fdb = firebase.firestore(); } catch(e) { console.error("Firebase init error:", e); }
        const FS_COLLECTION = "tm_sync";
        let fsTimer = null;
        let fsUnsubscribe = null;
        const fsSayfaAnahtarlari = {
            'anasayfa-page': null,
            'yonetim-page': null,
            'teklif-liste-page': ['tm_teklifler_db_final'],
            'piyasa-fiyatlari-page': ['tm_piyasa_db_v2'],
            'is-muhasebe-page': ['tm_is_muhasebe_db'],
            'tamamlanan-is-muhasebeleri-page': ['tm_is_muhasebe_tamamlanan_db'],
            'nakit-dekont-page': ['tm_nakit_dekont_db'],
            'musteriler-page': ['tm_musteriler_db'],
            'isortaklari-page': ['tm_isortaklari_db'],
            'hesap-takip-page': ['tm_hesap_takip_db'],
            'fatura-takip-page': ['tm_fatura_takip_db'],
            'yillik-butce-page': ['tm_yillik_butce_db'],
            'dilekce-page': ['tm_dilekceler_db'],
            'istakibi-page': ['tm_is_takibi_v2'],
            'tm-fiyatlar-page': ['tm_kategorili_fiyatlar'],
        };
        function fsSyncDenetle(k) {
            if (k.startsWith("tm_") && k !== "tm_active_user" && k !== "tm_theme" && k !== "tm_active_page" && k !== "tm_ht_clean" && k !== "tm_ft_clean" && k !== "tm_yillik_butce_clean" && k !== "tm_sidebar_collapsed" && k !== "tm_submenu_open" && k.indexOf("tm_multi_logo_") !== 0) return true;
            return false;
        }
        function fsDosyaIslem(k, raw) {
            var strVal = (typeof raw === 'string') ? raw : JSON.stringify(raw);
            var curVal = localStorage.getItem(k);
            if (curVal !== strVal && !fsDirtyKeys[k]) {
                try { origSetItem(k, strVal); } catch(e) { console.error("Firebase sync local set hatasi:", e); }
                if (k === "tm_sirket_logo" || k === "tm_multi_logo_3") return "logo";
                return "data";
            }
            return null;
        }
        function fsLoad() {
            if (!fdb) return;
            // Eski all_data'dan bireysel dokümanlara geçiş (bir kere)
            fdb.collection(FS_COLLECTION).doc('all_data').get().then(function(snap) {
                if (snap && snap.exists) {
                    var data = snap.data();
                    var batch = fdb.batch();
                    var count = 0;
                    Object.keys(data).forEach(function(k) {
                        if (fsSyncDenetle(k)) {
                            batch.set(fdb.collection(FS_COLLECTION).doc(k), { data: data[k] }, { merge: true });
                            count++;
                        }
                    });
                    if (count > 0) {
                        batch.commit().then(function() {
                            fdb.collection(FS_COLLECTION).doc('all_data').delete().catch(function(e){ console.warn('all_data silme hatasi:', e.message); });
                        }).catch(function(e){ console.warn('Migration yazma hatasi:', e.message); });
                    }
                }
            }).catch(function(e) { console.warn('Migration okuma hatasi:', e.message); });
            // Bireysel dokümanlardan yükle
            fdb.collection(FS_COLLECTION).get().then(function(snap) {
                var logoChanged = false;
                var anyChanged = false;
                snap.forEach(function(doc) {
                    var docId = doc.id;
                    if (docId === 'all_data' || docId.indexOf('multi_logo_') === 0) return;
                    var data = doc.data();
                    if (!data || data.data === undefined || !fsSyncDenetle(docId)) return;
                    var sonuc = fsDosyaIslem(docId, data.data);
                    if (sonuc === "logo") logoChanged = true;
                    else if (sonuc === "data") anyChanged = true;
                });
                if (logoChanged) { sidebardaLogoyuGoster(); }
                if (anyChanged) { yenileAktifSayfa(); }
                fsReady = true;
            }).catch(function(e) { console.warn('fsLoad', e.message); });
            // Periyodik kontrol
            setInterval(function() { fsPollSdk(); }, 30000);
            document.addEventListener('visibilitychange', function() {
                if (!document.hidden) fsPollSdk();
            });
            window.addEventListener('focus', function() {
                setTimeout(fsPollSdk, 100);
            });
            setTimeout(fsPollSdk, 1000);
        }
        function fsPollSdk() {
            fdb.collection(FS_COLLECTION).get({ source: 'server' }).then(function(snap) {
                var logoChanged = false;
                var anyChanged = false;
                snap.forEach(function(doc) {
                    var docId = doc.id;
                    if (docId === 'all_data' || docId.indexOf('multi_logo_') === 0) return;
                    var data = doc.data();
                    if (!data || data.data === undefined || !fsSyncDenetle(docId)) return;
                    var sonuc = fsDosyaIslem(docId, data.data);
                    if (sonuc === "logo") logoChanged = true;
                    else if (sonuc === "data") anyChanged = true;
                });
                if (logoChanged) { sidebardaLogoyuGoster(); }
                if (anyChanged) { yenileAktifSayfa(); }
            }).catch(function(e) { console.warn('fsPollSdk', e.message); });
        }
        var fsDirtyKeys = {};
        var fsReady = false;
        var fsSentKeys = {};
        function fsSync() {
            if (!fsReady || !fdb) return;
            var dirtyList = Object.keys(fsDirtyKeys);
            if (dirtyList.length === 0) return;
            var batch = fdb.batch();
            dirtyList.forEach(function(k) {
                var val;
                try { val = JSON.parse(localStorage.getItem(k)); } catch(e) { val = localStorage.getItem(k); }
                batch.set(fdb.collection(FS_COLLECTION).doc(k), { data: val }, { merge: true });
            });
            batch.commit().then(function() {
                dirtyList.forEach(function(k) { delete fsDirtyKeys[k]; });
            }).catch(function(e){ console.error('fsSync write error', e); if (typeof tmNotify === 'function') tmNotify("Firestore sync hatası: " + e.message, "error"); });
        }
        var origSetItem = localStorage.setItem.bind(localStorage);
        localStorage.setItem = function(key, value) {
            origSetItem(key, value);
            if (fsSyncDenetle(key)) {
                fsDirtyKeys[key] = true;
                if (fsReady) { fsSync(); }
            }
        };
        fsLoad();
        setTimeout(function() { fsReady = true; fsSync(); }, 1000);

        let SABIT_DALLAR = [
            "MİMARİ UYGULAMA PROJE",
            "MİMARİ KAT İRTİFAK PROJE",
            "MİMARİ TASLAK PROJE",
            "3B MODELLEME VE TASARIM",
            "ŞANTİYE ŞEFİ",
            "STATİK PROJE",
            "MEKANİK PROJE",
            "ELEKTRİK PROJE",
            "ZEMİN ETÜDÜ RAPORU",
            "MİMARİ AKUSTİK RAPOR",
            "ENERJİ KİMLİK BELGESİ ( EKB )",
            "HARİTA APLİKASYON PROJESİ",
            "PAKET PROJE ( ZEMİN ETÜDÜ VE HARİTA APLİKASYON HARİÇ TÜMÜ )"
        ];

        const TURKIYE_BANKALARI = [
            "Ziraat Bankası", "İş Bankası", "Garanti BBVA", "Yapı Kredi", "Akbank",
            "Vakıfbank", "Halkbank", "QNB Finansbank", "DenizBank", "TEB",
            "HSBC", "ING Bank", "Burgan Bank", "Fibabanka", "Alternatif Bank",
            "Odeabank", "Turkish Bank", "Anadolubank", "Aktif Bank", "Kuveyt Türk",
            "Albaraka Türk", "Türkiye Finans", "Ziraat Katılım", "Vakıf Katılım",
            "Emlak Katılım", "İCBC Turkey", "Mitsubishi UFJ Turkey", "SocGen Turkey",
            "Citibank", "Bank Mellat", "Habib Bank", "Intesa Sanpaolo", "JPMorgan Chase"
        ];

        let SABIT_ETIKETLER = [
            "Müteahhit",
            "Vatandaş",
            "Kurum"
        ];
        
        let SABIT_BIRIM_TIPLERI = [
            "?/m²"
        ];
        let SABIT_BIRIM_LISTESI = ["M²","ADET","KM","AY","GÜN"];
        let SABIT_KDV_LISTESI = ["0","10","20"];

        let SABIT_VERGI_TURLERI = [
            "KDV",
            "Gelir Vergisi",
            "Kurumlar Vergisi",
            "Stopaj",
            "Damga Vergisi",
            "Diğer"
        ];

        function ftTurAdi(val) {
            var map = { kdv:"KDV", gelirVergisi:"Gelir Vergisi", kurumlarVergisi:"Kurumlar Vergisi", stopaj:"Stopaj", damgaVergisi:"Damga Vergisi", diger:"Diğer" };
            return map[val] || val || "Diğer";
        }

        document.addEventListener("DOMContentLoaded", function() {
            try { document.querySelector('.version-tag').textContent = APP_VERSION; } catch(e){}
            if ('serviceWorker' in navigator) { navigator.serviceWorker.register('sw.js').catch(function(){}); }

            if(!localStorage.getItem("tm_yillik_butce_clean")) { localStorage.removeItem("tm_yillik_butce_db"); origSetItem("tm_yillik_butce_clean","1"); }

            var oncekiKullanici = localStorage.getItem("tm_active_user");
            var sessionVar = sessionStorage.getItem("tm_session_active");
            if (oncekiKullanici && !sessionVar) {
                var isReload = false;
                try {
                    if (performance.navigation) {
                        isReload = performance.navigation.type === 1;
                    } else {
                        var nav = performance.getEntriesByType('navigation')[0];
                        isReload = nav && nav.type === 'reload';
                    }
                } catch(e) { console.error("Performans kontrol hatasi:", e); }
                if (!isReload) {
                    oncekiKullanici = null;
                }
            }
            function overlayGizle() { var lo = document.getElementById('tmLoadingOverlay'); if(lo) lo.style.display = 'none'; }
            function oturumuRestoreEt(u) {
                document.getElementById("loginSection").style.display = "none";
                document.getElementById("portalSection").style.display = "block";
                sidebardaLogoyuGoster();
                var yetkiler;
                if (u === "TUGAYTURAK") {
                    yetkiler = (function(){
                        var all = [];
                        TM_YETKI_TANIMLARI.forEach(function(g){
                            all.push(g.key);
                            if(g.subs) g.subs.forEach(function(s){ all.push(s.key); });
                        });
                        return all;
                    })();
                } else {
                    var altKullanicilar = JSON.parse(localStorage.getItem("tm_users_final_v8")) || [];
                    var bulunan = altKullanicilar.find(function(x){ return x.usr === u; });
                    yetkiler = bulunan ? bulunan.yetkiler : [];
                }
                if (yetkiler.length > 0) {
                    AKTIF_KULLANICI_YETKILERI = yetkiler;
                    var savedPage = localStorage.getItem('tm_active_page');
                    menuyuInsaEt(yetkiler);
                    tmOnlineHeartbeatBaslat(u);
                    if (savedPage && savedPage !== 'anasayfa-page' && document.getElementById(savedPage)) {
                        sayfaDegistir(savedPage, null);
                        history.replaceState({ pageId: savedPage, yetkiKodu: savedPage.replace("-page","") }, "", "#" + savedPage);
                    }
                    var subMap={"teklif-submenu":"arrow-icon","portfoy-submenu":"arrow-portfoy-icon","muhasebe-submenu":"arrow-muhasebe-icon"};var openSub=localStorage.getItem("tm_submenu_open");if(openSub&&subMap[openSub]){var sm=document.getElementById(openSub);if(sm){sm.classList.add("open");var ar=document.getElementById(subMap[openSub]);if(ar)ar.innerText="^";}}if(savedPage&&savedPage!=='anasayfa-page'){var si=document.getElementById('sub-'+savedPage.replace('-page',''));if(si)si.classList.add('active');}
                } else {
                    localStorage.removeItem("tm_active_user");
                    sessionStorage.removeItem("tm_session_active");
                }
                overlayGizle();
            }
            if (oncekiKullanici) {
                if (fdb) {
                    fdb.collection("tm_online").get().then(function(snap) {
                        var baskaAktif = null;
                        snap.forEach(function(doc) {
                            var d = doc.data();
                            if (d && d.onlineAt && d.onlineAt > Date.now() - 6000 && doc.id !== oncekiKullanici) {
                                baskaAktif = doc.id;
                            }
                        });
                        if (baskaAktif) {
                            localStorage.removeItem("tm_active_user");
                            sessionStorage.removeItem("tm_session_active");
                            document.getElementById("loginSection").style.display = "flex";
                            var errorDiv = document.getElementById("loginError");
                            if (errorDiv) {
                                errorDiv.innerText = "? " + baskaAktif + " kullanıcısı aktif olduğu için oturumunuz sonlandırıldı.";
                                errorDiv.style.display = "block";
                            }
                            overlayGizle();
                        } else {
                            oturumuRestoreEt(oncekiKullanici);
                        }
                    }).catch(function() {
                        oturumuRestoreEt(oncekiKullanici);
                    });
                } else {
                    oturumuRestoreEt(oncekiKullanici);
                }
            } else {
                document.getElementById("loginSection").style.display = "flex";
                overlayGizle();
            }
            function csInit(){document.querySelectorAll('select:not(.cs-done)').forEach(function(s){if(s.options.length>0){s.classList.add('cs-done');s.style.display='none';var w=document.createElement('div');w.className='cs-wrapper';var t=document.createElement('div');t.className='cs-trigger';var d=document.createElement('div');d.className='cs-dropdown';var inp=document.createElement('input');inp.className='cs-search';inp.type='text';inp.placeholder='Ara...';inp.autocomplete='off';function csBuild(f){var opts=d.querySelectorAll('.cs-option');for(var j=opts.length-1;j>=0;j--){opts[j].remove();}var fv=f?f.toLowerCase():'';var found=false;for(var i=0;i<s.options.length;i++){var txt=s.options[i].text;if(fv&&txt.toLowerCase().indexOf(fv)===-1)continue;var o=document.createElement('div');o.className='cs-option'+(s.selectedIndex===i?' sel':'');o.textContent=txt;o.dataset.index=i;(function(idx){o.onclick=function(e){e.stopPropagation();s.selectedIndex=idx;t.textContent=s.options[idx].text;d.classList.remove('open');t.classList.remove('open');inp.value='';d.querySelectorAll('.cs-option').forEach(function(x){x.classList.remove('sel');});this.classList.add('sel');s.dispatchEvent(new Event('change',{bubbles:true}));};})(i);d.appendChild(o);found=true;}if(!found&&fv){var no=document.createElement('div');no.className='cs-option';no.textContent='(eşleşme bulunamadı)';no.style.cursor='default';no.style.color='var(--text-light)';d.appendChild(no);}t.textContent=s.options[s.selectedIndex]?s.options[s.selectedIndex].text:'';}d.appendChild(inp);inp.oninput=function(){csBuild(this.value);};inp.onclick=function(e){e.stopPropagation();};inp.onkeydown=function(e){if(e.key==='Escape'){d.classList.remove('open');t.classList.remove('open');inp.value='';}};csBuild('');t.onclick=function(e){e.stopPropagation();if(d.classList.contains('open')){d.classList.remove('open');d.classList.remove('cs-fixed');t.classList.remove('open');inp.value='';return;}document.querySelectorAll('.cs-dropdown.open').forEach(function(x){x.classList.remove('open');x.previousElementSibling.classList.remove('open');});csBuild('');var wr=w.getBoundingClientRect();var cl=false,cp=w.parentElement;while(cp){if(cp.classList&&(cp.classList.contains('it-tablo-wrapper')||cp.classList.contains('it-tablo'))){cl=true;break}cp=cp.parentElement}if(cl){d.style.position='fixed';d.style.top=wr.bottom+'px';d.style.left=wr.left+'px';d.style.width=wr.width+'px';d.style.bottom='auto';d.style.marginTop='0';d.style.marginBottom='0';d.style.zIndex=999999;d.classList.add('cs-fixed');}else{d.style.position='absolute';d.style.left='0';d.style.width='100%';d.style.top='100%';d.style.bottom='auto';d.style.marginTop='-1px';d.style.marginBottom='0';d.classList.remove('cs-fixed')}d.classList.add('open');t.classList.add('open');inp.focus();d.scrollTop=0;var cf=d.querySelector('.cs-birim-footer');if(cf)cf.remove();if(s.classList.contains('row-birim')){var cft=document.createElement('div');cft.className='cs-birim-footer';cft.style.cssText='border-top:1px solid var(--border-color);padding:6px;display:flex;gap:6px;';cft.innerHTML='<button onclick="event.stopPropagation();birimEklePrompt();birimDropdownKapat(this);" style="flex:1;padding:3px 6px;font-size:10px;cursor:pointer;background:var(--accent-red);color:#fff;border:none;border-radius:3px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;line-height:1;">+ YENİ</button><button onclick="event.stopPropagation();birimSilPrompt();birimDropdownKapat(this);" style="flex:1;padding:3px 6px;font-size:10px;cursor:pointer;background:#555;color:#fff;border:none;border-radius:3px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;line-height:1;">- SİL</button>';d.appendChild(cft);}var kf=d.querySelector('.cs-kdv-footer');if(kf)kf.remove();if(s.classList.contains('row-kdv')){var kft=document.createElement('div');kft.className='cs-kdv-footer';kft.style.cssText='border-top:1px solid var(--border-color);padding:6px;display:flex;gap:6px;';kft.innerHTML='<button onclick="event.stopPropagation();kdvEklePrompt();kdvDropdownKapat(this);" style="flex:1;padding:3px 6px;font-size:10px;cursor:pointer;background:var(--accent-red);color:#fff;border:none;border-radius:3px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;line-height:1;">+ EKLE</button><button onclick="event.stopPropagation();kdvSilPrompt();kdvDropdownKapat(this);" style="flex:1;padding:3px 6px;font-size:10px;cursor:pointer;background:#555;color:#fff;border:none;border-radius:3px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;line-height:1;">- SİL</button>';d.appendChild(kft);}};w.appendChild(t);w.appendChild(d);s.parentNode.insertBefore(w,s);if(s.style.flex){w.style.flex=s.style.flex;w.style.width='';}else if(s.style.width)w.style.width=s.style.width;}});}document.addEventListener('click',function(){document.querySelectorAll('.cs-dropdown.open').forEach(function(x){x.classList.remove('open');x.classList.remove('cs-fixed');var ps=x.previousElementSibling;if(ps)ps.classList.remove('open');var si=x.querySelector('.cs-search');if(si)si.value='';});});var csfn=function(e){var t=e&&e.target;if(t){var ins=false,cp=t;while(cp){if(cp.classList&&cp.classList.contains('cs-dropdown')){ins=true;break}cp=cp.parentElement}if(ins)return}document.querySelectorAll('.cs-dropdown.cs-fixed.open').forEach(function(x){x.classList.remove('open');x.classList.remove('cs-fixed');var ps=x.previousElementSibling;if(ps)ps.classList.remove('open');var si=x.querySelector('.cs-search');if(si)si.value='';});};document.addEventListener('scroll',csfn,true);window.addEventListener('scroll',csfn);

            const loginSection = document.getElementById("loginSection");
            if (loginSection) {
                loginSection.addEventListener("keydown", function(event) {
                    if (event.key === "Enter") { sistemeGirisYap(); }
                });
            }
            
            if (localStorage.getItem("tm_piyasa_dallari_v2")) {
                SABIT_DALLAR = JSON.parse(localStorage.getItem("tm_piyasa_dallari_v2"));
                var YENI_DALLAR = ["MİMARİ TASLAK PROJE","3B MODELLEME VE TASARIM","ŞANTİYE ŞEFİ"];
                YENI_DALLAR.forEach(function(d){ if (SABIT_DALLAR.indexOf(d) === -1) SABIT_DALLAR.push(d); });
                localStorage.setItem("tm_piyasa_dallari_v2", JSON.stringify(SABIT_DALLAR));
            } else {
                origSetItem("tm_piyasa_dallari_v2", JSON.stringify(SABIT_DALLAR));
            }

            if (localStorage.getItem("tm_musteri_etiketleri_v1")) {
                SABIT_ETIKETLER = JSON.parse(localStorage.getItem("tm_musteri_etiketleri_v1"));
            } else {
                origSetItem("tm_musteri_etiketleri_v1", JSON.stringify(SABIT_ETIKETLER));
            }
            
            if (localStorage.getItem("tm_piyasa_birimleri_v1")) {
                SABIT_BIRIM_TIPLERI = JSON.parse(localStorage.getItem("tm_piyasa_birimleri_v1"));
            } else {
                origSetItem("tm_piyasa_birimleri_v1", JSON.stringify(SABIT_BIRIM_TIPLERI));
            }

            if (localStorage.getItem("tm_vergi_turleri_v1")) {
                SABIT_VERGI_TURLERI = JSON.parse(localStorage.getItem("tm_vergi_turleri_v1"));
            } else {
                origSetItem("tm_vergi_turleri_v1", JSON.stringify(SABIT_VERGI_TURLERI));
            }

            if (localStorage.getItem("tm_birim_listesi_v1")) {
                SABIT_BIRIM_LISTESI = JSON.parse(localStorage.getItem("tm_birim_listesi_v1"));
            } else {
                origSetItem("tm_birim_listesi_v1", JSON.stringify(SABIT_BIRIM_LISTESI));
            }

            if (localStorage.getItem("tm_kdv_listesi_v1")) {
                SABIT_KDV_LISTESI = JSON.parse(localStorage.getItem("tm_kdv_listesi_v1"));
            } else {
                origSetItem("tm_kdv_listesi_v1", JSON.stringify(SABIT_KDV_LISTESI));
            }

            document.addEventListener("click", function(e) {
                if (!e.target.classList.contains("tm-autocomplete-item") && e.target.tagName !== "INPUT") {
                    document.querySelectorAll(".tm-autocomplete-box").forEach(box => box.style.display = "none");
                }
            });

            piyasaDallariSecenekleriniDoldur();
            piyasaBirimTipiSecenekleriniDoldur();
            musteriEtiketleriniDoldur();
            ioStatusSecenekleriniDoldur();
            csInit();var cso=new MutationObserver(function(m){for(var i=0;i<m.length;i++){if(m[i].addedNodes.length){csInit();break;}}});cso.observe(document.body,{childList:true,subtree:true});
            document.addEventListener('dragstart', dashDragBasla);
            document.addEventListener('dragover', dashDragOver);
            document.addEventListener('dragleave', dashDragLeave);
            document.addEventListener('drop', dashDrop);
            document.addEventListener('dragend', dashDragEnd);
            birimListesiniYenile();
            dashOfficeNotesYukle();
            dashboardVerileriniGuncelle();
            musteriKartlariniYenile();
            isOrtaklariKartlariniYenile();
            piyasaListesiniYenile();
            isMuhasebeListesiniYenile();
            tamamlananIsMuhasebeListesiniYenile();
            nakitDekontListesiniYenile();

            window.addEventListener('resize', tmScrollHintKontrol);
        });

        let AKTIF_KULLANICI_ADI = "";
        let AKTIF_KULLANICI_YETKILERI = [];
        let TEKLIF_SIRALAMA_YONU = "AZALAN";
        let P_GRUP_SIRALAMA = {};

        const TM_YETKI_TANIMLARI = [
            { key:"anasayfa", label:'<i class="fa-solid fa-house"></i> Ana Sayfa (Dashboard)' },
            { key:"teklif-olustur", label:'<i class="fa-regular fa-file-lines"></i> Fiyatlandırma: Teklif Oluştur' },
            { key:"teklif-liste", label:'<i class="fa-solid fa-list"></i> Fiyatlandırma: Geçmiş Teklifler' },
            { key:"piyasa-fiyatlari", label:'<i class="fa-solid fa-chart-simple"></i> Fiyatlandırma: Piyasa Fiyatları' },
            { key:"tm-fiyatlar", label:'<i class="fa-solid fa-chart-line"></i> Fiyatlandırma: TM Fiyatlar' },
            { key:"musteriler", label:'<i class="fa-regular fa-folder-open"></i> Portföy: Müşteriler' },
            { key:"isortaklari", label:'<i class="fa-solid fa-handshake"></i> Portföy: İş Ortakları' },
            { key:"dilekce", label:'<i class="fa-regular fa-note-sticky"></i> Dilekçe Oluştur' },
            { key:"istakibi", label:'<i class="fa-regular fa-calendar"></i> İş Takibi' },
            { key:"nakit-dekont", label:'<i class="fa-regular fa-credit-card"></i> Muhasebe: Nakit Ödeme Dekontu' },
            { key:"is-muhasebe-olustur", label:'<i class="fa-solid fa-thumbtack"></i> Muhasebe: İş Muhasebesi Oluştur' },
            { key:"is-muhasebe", label:'<i class="fa-solid fa-coins"></i> Muhasebe: İş Muhasebesi Takibi' },
            { key:"tamamlanan-is-muhasebe", label:'<i class="fa-solid fa-check"></i> Muhasebe: Tamamlanan İş Muhasebeleri' },
            { key:"hesap-takip", label:'<i class="fa-solid fa-building-columns"></i> Muhasebe: Hesap Takip Sistemi' },
            { key:"fatura-takip", label:'<i class="fa-solid fa-receipt"></i> Muhasebe: Fatura Takip Sistemi' },
            { key:"yillik-butce", label:'<i class="fa-solid fa-chart-simple"></i> Muhasebe: Yıllık Bütçeler' },
            { key:"yonetim", label:'<i class="fa-solid fa-gear"></i> Portal Yönetimi' },
            { key:"notlar", label:'<i class="fa-regular fa-note-sticky"></i> Notlar' },
            { key:"gorevler-takvim", label:'<i class="fa-regular fa-calendar"></i> Görevler ve Takvim' }
        ];

        function yetkiCheckboxlariniRenderEt() {
            const container = document.getElementById("yetkiCheckboxContainer");
            if (!container) return;
            let isKurucu = false;
            try { var master = JSON.parse(localStorage.getItem("tm_admin_creds_final")); if (master && master.usr && AKTIF_KULLANICI_ADI === master.usr) isKurucu = true; } catch(e) {}
            let html = '<div class="checkbox-group" style="display:grid; grid-template-columns:repeat(2,1fr); gap:10px; background:none; border:none; padding:0;">';
            TM_YETKI_TANIMLARI.forEach(function(item) {
                html += '<div class="checkbox-item" style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--panel-bg);border:1px solid var(--border-color);border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.02);">';
                html += '<input type="checkbox" id="auth_' + item.key.replace(/[.-]/g,"_") + '" style="width:16px;height:16px;cursor:pointer;"' + (isKurucu ? '' : ' disabled') + '>';
                html += '<label for="auth_' + item.key.replace(/[.-]/g,"_") + '" style="margin:0;text-transform:none;font-weight:600;font-size:13px;cursor:pointer;flex:1;">' + item.label + '</label>';
                html += '</div>';
            });
            html += '</div>';
            container.innerHTML = html;
        }


        function yetkiSecilenleriTopla() {
            const secilen = [];
            TM_YETKI_TANIMLARI.forEach(function(item) {
                const el = document.getElementById("auth_" + item.key.replace(/[.-]/g,"_"));
                if (el && el.checked) secilen.push(item.key);
            });
            return secilen;
        }

        function yetkiSecilenleriAyarla(yetkiListesi) {
            TM_YETKI_TANIMLARI.forEach(function(item) {
                const el = document.getElementById("auth_" + item.key.replace(/[.-]/g,"_"));
                if (el) el.checked = yetkiListesi.includes(item.key);
            });
        }

        function yetkiSayfaAc(key) {
            if (!AKTIF_KULLANICI_YETKILERI || AKTIF_KULLANICI_YETKILERI.length === 0) return false;
            if (AKTIF_KULLANICI_YETKILERI.includes(key)) return true;
            var dotIdx = key.indexOf(".");
            if (dotIdx > 0) {
                var parent = key.substring(0, dotIdx);
                if (AKTIF_KULLANICI_YETKILERI.includes(parent)) return true;
            }
            return AKTIF_KULLANICI_YETKILERI.some(function(k){ return k.startsWith(key + "."); });
        }

        function trToUpper(text) {
            if(!text) return "";
            return text.toString().replace(/i/g, "İ").replace(/ı/g, "I").toUpperCase();
        }
        function trToLower(text) {
            if(!text) return "";
            return text.toString().replace(/İ/g, "i").replace(/I/g, "ı").replace(/Ü/g, "ü").replace(/Ö/g, "ö").replace(/Ç/g, "ç").replace(/Ş/g, "ş").replace(/Ğ/g, "ğ").toLowerCase();
        }
        function trToTitleCase(text) {
            if(!text) return "";
            return text.toString().replace(/\S+/g, function(word) {
                if(word.length === 0) return word;
                return trToUpper(word.charAt(0)) + trToLower(word.substring(1));
            });
        }
        function titleCaseInput(el) {
            var start = el.selectionStart;
            var before = el.value;
            el.value = trToTitleCase(before);
            var after = el.value;
            var diff = after.length - before.length;
            var newPos = Math.min(start + diff, after.length);
            if (newPos >= 0 && newPos <= after.length) {
                el.setSelectionRange(newPos, newPos);
            }
        }

        function anlikTarihGetir() {
            var d = new Date();
            return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
        }

        function tmNotify(msg, tip, ses) {
            const el = document.getElementById("tmNotif");
            const text = document.getElementById("tmNotifText");
            if(!el || !text) return;
            el.className = "tm-notif show tm-notif-" + (tip || "info");
            text.innerText = msg;
            el.style.display = "flex";
            clearTimeout(el._timer);
            el._timer = setTimeout(tmNotifKapat, 3500);
            if (ses) { tmSesCal(ses); return; }
            if (tip === "success") {
                if (msg.indexOf("silindi") > -1 || msg.indexOf("Silindi") > -1) { tmSesCal("silme"); }
                else { tmSesCal("basarili"); }
            }
        }

        function tmNotifGoster(msg, tur) {
            var el = document.getElementById("tmNotif");
            var txt = document.getElementById("tmNotifText");
            if (!el || !txt) return;
            txt.innerText = msg;
            el.className = "tm-notif show tm-notif-" + (tur||"info");
            clearTimeout(el._timer);
            el._timer = setTimeout(tmNotifKapat, 3000);
        }
        function tmNotifKapat() {
            const el = document.getElementById("tmNotif");
            if(!el) return;
            el.style.display = "none";
            el.classList.remove("show");
        }

        function tmLoadingGoster(msg) {
            var lo = document.getElementById('tmLoadingIndicator');
            if (!lo) {
                lo = document.createElement('div');
                lo.id = 'tmLoadingIndicator';
                lo.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);z-index:10003;justify-content:center;align-items:center;backdrop-filter:blur(2px);';
                lo.innerHTML = '<div style="background:var(--panel-bg);padding:30px 40px;border-radius:14px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3);border:1px solid var(--border-color);min-width:200px;"><div style="border:3px solid var(--border-color);border-top:3px solid var(--accent-red);border-radius:50%;width:30px;height:30px;animation:tmLoadingSpin 0.8s linear infinite;margin:0 auto 14px;"></div><div style="font-size:13px;font-weight:700;color:var(--text-dark);letter-spacing:0.3px;" id="tmLoadingMsg">İşlem yapılıyor...</div></div>';
                document.body.appendChild(lo);
                var styleEl = document.createElement('style');
                styleEl.id = 'tmLoadingStyle';
                styleEl.textContent = '@keyframes tmLoadingSpin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }';
                document.head.appendChild(styleEl);
            }
            document.getElementById('tmLoadingMsg').textContent = msg || 'İşlem yapılıyor...';
            lo.style.display = 'flex';
        }
        function tmLoadingGizle() {
            var lo = document.getElementById('tmLoadingIndicator');
            if (lo) lo.style.display = 'none';
        }

        function tmEmptyStateHTML(icon, title, desc, btn) {
            return '<div class="tm-empty-state"><div class="tm-empty-icon">' + (icon||'<i class="fa-regular fa-inbox"></i>') + '</div><div class="tm-empty-title">' + (title||'Kayıt bulunamadı') + '</div><div class="tm-empty-desc">' + (desc||'Henüz kayıt eklenmemiş.') + '</div>' + (btn ? btn : '') + '</div>';
        }

        function tmScrollHintKontrol() {
            document.querySelectorAll('.app-table, .it-tablo-wrapper, .ft-tbl-wrap, .tmf-excel-scroll').forEach(function(el){
                if (el.scrollWidth > el.clientWidth || el.scrollWidth > el.parentElement.clientWidth) {
                    el.classList.add('tm-scroll-hint-active');
                } else {
                    el.classList.remove('tm-scroll-hint-active');
                }
            });
        }

        function tmIkonButtonTooltipEkle() {
            document.querySelectorAll('button, .btn, .it-btn-sil, .it-btn-tamamla, .it-btn-tahsilat, .it-btn-ruhsat, .btn-pdf-red, .btn-danger, .btn-warning').forEach(function(b){
                var txt = b.textContent.trim();
                var label = '';
                if (txt.indexOf('Sil') !== -1 || txt.indexOf('SİL') !== -1) label = 'Sil';
                else if (txt.indexOf('Onayla') !== -1) label = 'Onayla';
                else if (txt.indexOf('PDF') !== -1) label = 'PDF';
                else if (txt.indexOf('Kaydet') !== -1 || txt.indexOf('KAYDET') !== -1) label = 'Kaydet';
                else if (txt.indexOf('Ekle') !== -1 || txt.indexOf('EKLE') !== -1) label = 'Ekle';
                else if (txt.indexOf('Başlat') !== -1 || txt.indexOf('BAŞLAT') !== -1) label = 'Başlat';
                else if (txt.indexOf('Giden') !== -1) label = 'Giden';
                else if (txt.indexOf('Gelen') !== -1) label = 'Gelen';
                else if (txt.indexOf('Ara') !== -1) label = 'Ara';
                else if (txt.indexOf('Liste') !== -1) label = 'Liste';
                else if (txt.indexOf('Gantt') !== -1) label = 'Gantt';
                else if (txt.indexOf('Takvim') !== -1) label = 'Takvim';
                    if (label) {
                        b.classList.add('tm-tooltip-wrap');
                        b.innerHTML = b.innerHTML + '<span class="tm-tooltip-text">' + label + '</span>';
                    }
            });
        }

        function tmTutarFormatla(el) {
            if(!el) return;
            let val = el.value.replace(/[^\d,]/g, '');
            const commas = (val.match(/,/g) || []).length;
            if(commas > 1) val = val.replace(/,([^,]*),/g, ',$1');
            if(val.startsWith(',')) val = '0' + val;
            const parts = val.split(',');
            let intPart = parts[0];
            if(!intPart) intPart = '';
            let decPart = parts.length > 1 ? parts[1].slice(0, 2) : '';
            let formattedInt = '';
            if(intPart.length > 0) {
                const num = parseInt(intPart, 10);
                if(!isNaN(num)) formattedInt = num.toLocaleString('tr-TR');
            }
            const newVal = (decPart !== '') ? formattedInt + ',' + decPart : (parts.length > 1 ? formattedInt + ',' : formattedInt);
            el.value = newVal;
        }

        function tmTutarBlur(el) {
            if(!el || !el.value) return;
            let val = el.value.replace(/[^\d,]/g, '');
            if(!val) return;
            const parts = val.split(',');
            let intPart = parts[0];
            let decPart = parts.length > 1 ? parts[1].slice(0, 2) : '';
            if(intPart.length > 0) {
                intPart = parseInt(intPart, 10).toLocaleString('tr-TR');
            }
            if(decPart.length === 1) decPart += '0';
            el.value = decPart ? intPart + ',' + decPart : intPart + ',00';
        }

        function tmAutoResizeTextarea(el) {
            el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
        }

        function tmTutarFocus(el) {
            if(!el) return;
            if(el.value === "0,00" || el.value === "") el.value = "";
        }

        function tmTutarCoz(str) {
            if(!str) return 0;
            return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
        }
        document.getElementById('tTarih').value = anlikTarihGetir();
        document.getElementById('pYonetimTarih').value = anlikTarihGetir();
        document.getElementById('ndTarih').value = anlikTarihGetir();
        document.getElementById('isMuhAnlasmaTarihi').value = anlikTarihGetir();

        if (!localStorage.getItem("tm_admin_creds_final")) {}
        
    if (!localStorage.getItem("tm_users_final_v8")) {
        try { origSetItem("tm_users_final_v8", JSON.stringify([])); } catch(e) { localStorage.setItem("tm_users_final_v8", JSON.stringify([])); }
    }

        function piyasaDallariSecenekleriniDoldur() {
            const selectPiyasa = document.getElementById("pYonetimDal");
            const selectIsOrtaki = document.getElementById("ioBrans");
            
            if(selectPiyasa) {
                selectPiyasa.innerHTML = "";
                SABIT_DALLAR.forEach(dal => { selectPiyasa.innerHTML += `<option value="${dal}">${dal}</option>`; });
            }
            if(selectIsOrtaki) {
                selectIsOrtaki.innerHTML = "";
                SABIT_DALLAR.forEach(dal => { selectIsOrtaki.innerHTML += `<option value="${dal}">${dal}</option>`; });
            }
        }
        
        function piyasaBirimTipiSecenekleriniDoldur() {
            const selectBirim = document.getElementById("pYonetimBirimTipi");
            if(selectBirim) {
                selectBirim.innerHTML = "";
                SABIT_BIRIM_TIPLERI.forEach(birim => { selectBirim.innerHTML += `<option value="${birim}">${birim}</option>`; });
            }
        }

        function musteriEtiketleriniDoldur() {
            const selectTipi = document.getElementById("mTipi");
            if(selectTipi) {
                selectTipi.innerHTML = "";
                SABIT_ETIKETLER.forEach(etiket => { selectTipi.innerHTML += `<option value="${etiket}">${etiket}</option>`; });
            }
        }

        function yeniMusteriEtiketiEklePrompt() {
            tmPrompt("Lütfen eklemek istediğiniz yeni Müşteri Tipi / Etiket adını giriniz:", function(yeniEtiket) {
                if(yeniEtiket) {
                    yeniEtiket = yeniEtiket.trim();
                    if(SABIT_ETIKETLER.some(e => e.toLowerCase() === yeniEtiket.toLowerCase())) { tmNotify("Bu etiket zaten sistemde mevcut!", "error"); return; }
                    SABIT_ETIKETLER.push(yeniEtiket);
                    localStorage.setItem("tm_musteri_etiketleri_v1", JSON.stringify(SABIT_ETIKETLER));
                    musteriEtiketleriniDoldur();
                    document.getElementById("mTipi").value = yeniEtiket;
                }
            });
        }

        function musteriEtiketiSilPrompt() {
            const val = document.getElementById("mTipi").value;
            if(!val) return;
            tmConfirm(`"${val}" etiketini silmek istediğinize emin misiniz?`, function() {
                SABIT_ETIKETLER = SABIT_ETIKETLER.filter(e => e !== val);
                localStorage.setItem("tm_musteri_etiketleri_v1", JSON.stringify(SABIT_ETIKETLER));
                musteriEtiketleriniDoldur();
                musteriKartlariniYenile();
            });
        }

        function getBankaRenkKodu(bankaAdi) {
            const name = trToUpper(bankaAdi);
            if(name.includes("AKBANK")) return "#E53935";
            if(name.includes("VAKIF")) return "#FDD835";
            if(name.includes("QNB") || name.includes("FİNANS") || name.includes("FINANS")) return "#7B1FA2";
            if(name.includes("DENİZ") || name.includes("DENIZ")) return "#0D47A1";
            if(name.includes("ING")) return "#FF6F00";
            if(name.includes("ZİRAAT") || name.includes("ZIRAAT")) return "#9E2A2B"; 
            if(name.includes("GARANTİ") || name.includes("GARANTI")) return "#2E7D32";
            if(name.includes("İŞ") || name.includes("IS ") || name.includes("YAPI")) return "#0D47A1";
            if(name.includes("HALK") || name.includes("TEB")) return "#00838F";
            if(name.includes("KUVEYT") || name.includes("ALBARAKA")) return "#1B5E20";
            return "inherit";
        }

        function tmAkilliTahminMotoru(inputElement, dbTipi) {
            const text = trToUpper(inputElement.value.trim());
            const tahminKutusu = document.getElementById(inputElement.id + "-tahmin");
            if(!tahminKutusu) return;

            if(text.length < 3) {
                tahminKutusu.innerHTML = "";
                tahminKutusu.style.display = "none";
                return;
            }

            let havuz = [];
            if(dbTipi === "MUSTERI") {
                havuz = JSON.parse(localStorage.getItem("tm_musteriler_db")) || [];
            } else if(dbTipi === "PARTNER") {
                havuz = JSON.parse(localStorage.getItem("tm_isortaklari_db")) || [];
            }

            const filtreli = havuz.filter(item => trToUpper(item.ad).includes(text) || trToUpper(item.sirket).includes(text));

            if(filtreli.length === 0) {
                tahminKutusu.innerHTML = "";
                tahminKutusu.style.display = "none";
                return;
            }

            tahminKutusu.innerHTML = "";
            tahminKutusu.style.display = "block";

            filtreli.forEach(kart => {
                const div = document.createElement("div");
                div.className = "tm-autocomplete-item";
                div.innerText = kart.ad + (kart.sirket ? " (" + kart.sirket + ")" : "");
                div.onclick = function() {
                    inputElement.value = kart.ad;
                    tahminKutusu.innerHTML = "";
                    tahminKutusu.style.display = "none";
                    
                    if(inputElement.id === "tMusteriAd") {
                        document.getElementById("tFirma").value = kart.sirket || "";
                        document.getElementById("tTelefon").value = kart.tel || "";
                    } else if(inputElement.id === "pYonetimKisi") {
                        document.getElementById("pYonetimKisi").value = kart.ad;
                        document.getElementById("pYonetimFirma").value = kart.sirket || "";
                    } else if(inputElement.id === "mAdi") {
                        document.getElementById("mSirket").value = kart.sirket || "";
                        document.getElementById("mUnvan").value = kart.unvan || "";
                        document.getElementById("mTel").value = kart.tel || "";
                        document.getElementById("mEposta").value = kart.eposta || "";
                        document.getElementById("mTipi").value = kart.tipi || "Vatandaş";
                        document.getElementById("mKimlikNo").value = kart.kimlik || "";
                        document.getElementById("mVergiDairesi").value = kart.vergiDairesi || "";
                        document.getElementById("mVergiNo").value = kart.vergiNo || "";
                        document.getElementById("mAdres").value = kart.adres || "";
                        const kont = document.getElementById("musteriBankaKonteyner");
                        kont.innerHTML = "";
                        if(kart.bankalar && kart.bankalar.length > 0) {
                            kart.bankalar.forEach(b => bankaSatiriEkle("musteriBankaKonteyner", b.banka, b.iban));
                        } else { bankaSatiriEkle("musteriBankaKonteyner"); }
                    } else if(inputElement.id === "ndMusteriAd") {
                        document.getElementById("ndMusteriAd").value = kart.ad;
                        document.getElementById("ndFirma").value = kart.sirket || "";
                        document.getElementById("ndTel").value = kart.tel || "";
                    } else if(inputElement.id === "ndFirma") {
                        const secilenFirma = kart.sirket && kart.sirket !== "-" && kart.sirket !== "BİREYSEL" ? kart.sirket : kart.ad;
                        document.getElementById("ndFirma").value = secilenFirma;
                        document.getElementById("ndMusteriAd").value = kart.ad;
                        document.getElementById("ndTel").value = kart.tel || "";
                    } else if(inputElement.id === "isMuhFirma") {
                        document.getElementById("isMuhFirma").value = kart.sirket && kart.sirket !== "BİREYSEL" ? kart.sirket : kart.ad;
                    } else if(inputElement.id === "ioAdi") {
                        document.getElementById("ioSirket").value = kart.sirket || "";
                        document.getElementById("ioUnvan").value = kart.unvan || "";
                        document.getElementById("ioBrans").value = kart.brans || SABIT_DALLAR[0];
                        document.getElementById("ioTel").value = kart.tel || "";
                        document.getElementById("ioEposta").value = kart.eposta || "";
                        document.getElementById("ioKimlikNo").value = kart.kimlik || "";
                        document.getElementById("ioVergiDairesi").value = kart.vergiDairesi || "";
                        document.getElementById("ioVergiNo").value = kart.vergiNo || "";
                        ioStatusSecenekleriniDoldur();
                        document.getElementById("ioStatus").value = kart.status || "Sürekli Partner";
                        document.getElementById("ioAdres").value = kart.adres || "";
                        const kont = document.getElementById("partnerBankaKonteyner");
                        kont.innerHTML = "";
                        if(kart.bankalar && kart.bankalar.length > 0) {
                            kart.bankalar.forEach(b => bankaSatiriEkle("partnerBankaKonteyner", b.banka, b.iban));
                        } else { bankaSatiriEkle("partnerBankaKonteyner"); }
                    }
                };
                tahminKutusu.appendChild(div);
            });
        }

        function yeniPiyasaDaliEklePrompt() {
            tmPrompt("Lütfen eklemek istediğiniz yeni Proje / Hizmet Dalı adını giriniz:", function(yeniDal) {
                if(yeniDal) {
                    yeniDal = trToUpper(yeniDal.trim());
                    if(SABIT_DALLAR.includes(yeniDal)) { tmNotify("Bu hizmet dalı zaten sistemde mevcut!", "error"); return; }
                    SABIT_DALLAR.push(yeniDal);
                    localStorage.setItem("tm_piyasa_dallari_v2", JSON.stringify(SABIT_DALLAR));
                    piyasaDallariSecenekleriniDoldur();
                    if(document.getElementById("pYonetimDal")) document.getElementById("pYonetimDal").value = yeniDal;
                    if(document.getElementById("ioBrans")) document.getElementById("ioBrans").value = yeniDal;
                }
            });
        }

        function piyasaDaliSilPrompt() {
            let val = "";
            if (document.getElementById("piyasa-fiyatlari-page").classList.contains("active")) {
                val = document.getElementById("pYonetimDal").value;
            } else if (document.getElementById("isortaklari-page").classList.contains("active")) {
                val = document.getElementById("ioBrans").value;
            }
            if(!val) return;
            tmConfirm(`"${val}" dalını ve tüm sistem eşleşmelerini silmek istediğinize emin misiniz?`, function() {
                SABIT_DALLAR = SABIT_DALLAR.filter(d => d !== val);
                localStorage.setItem("tm_piyasa_dallari_v2", JSON.stringify(SABIT_DALLAR));
                piyasaDallariSecenekleriniDoldur();
                piyasaListesiniYenile();
                isOrtaklariKartlariniYenile();
            });
        }
        
        function yeniPiyasaBirimEklePrompt() {
            tmPrompt("Lütfen eklemek istediğiniz yeni Hesap Yöntemi / Birim Tipini giriniz:", function(yeniBirim) {
                if(yeniBirim) {
                    yeniBirim = yeniBirim.trim();
                    if(SABIT_BIRIM_TIPLERI.includes(yeniBirim)) { tmNotify("Bu birim tipi zaten sistemde mevcut!", "error"); return; }
                    SABIT_BIRIM_TIPLERI.push(yeniBirim);
                    localStorage.setItem("tm_piyasa_birimleri_v1", JSON.stringify(SABIT_BIRIM_TIPLERI));
                    piyasaBirimTipiSecenekleriniDoldur();
                    document.getElementById("pYonetimBirimTipi").value = yeniBirim;
                }
            });
        }
        
        function piyasaBirimSilPrompt() {
            let val = document.getElementById("pYonetimBirimTipi").value;
            if(!val) return;
            tmConfirm(`"${val}" birim tipini silmek istediğinize emin misiniz?`, function() {
                SABIT_BIRIM_TIPLERI = SABIT_BIRIM_TIPLERI.filter(b => b !== val);
                localStorage.setItem("tm_piyasa_birimleri_v1", JSON.stringify(SABIT_BIRIM_TIPLERI));
                piyasaBirimTipiSecenekleriniDoldur();
            });
        }

        function ibanFormatla(el) {
            let val = el.value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
            if(val.length === 0) val = 'TR';
            if(!val.startsWith('TR')) val = 'TR' + val;
            val = val.slice(0, 26);
            let formatted = '';
            for(let i = 0; i < val.length; i += 4) {
                formatted += val.substring(i, i + 4) + ' ';
            }
            el.value = formatted.trim();
        }

        function bankaSatiriEkle(konteynerId, bankaAdi = "", iban = "") {
            const kont = document.getElementById(konteynerId);
            const div = document.createElement("div");
            div.className = "bank-input-row";
            const bankaOptions = TURKIYE_BANKALARI.map(b =>
                '<option value="' + b + '"' + (trToUpper(b) === trToUpper(bankaAdi) ? ' selected' : '') + '>' + b + '</option>'
            ).join('');
            const ibanVal = iban ? iban.replace(/(.{4})/g, '$1 ').trim() : 'TR';
            div.innerHTML = `
                <select class="bank-adi" style="flex:1; min-width:140px; padding:6px;"><option value="">BANKA SEÇİNİZ</option>${bankaOptions}</select>
                <input type="text" class="bank-iban" placeholder="IBAN" maxlength="32" value="${ibanVal}" oninput="ibanFormatla(this)">
                <button class="btn-danger" onclick="this.parentElement.remove()" style="padding: 8px 12px;">X</button>
            `;
            kont.appendChild(div);
        }

        function bankaVerileriniTopla(konteynerId) {
            const rows = document.querySelectorAll(`#${konteynerId} .bank-input-row`);
            const arr = [];
            rows.forEach(r => {
                const bName = r.querySelector(".bank-adi").value.trim();
                const ibanNo = r.querySelector(".bank-iban").value.trim().toUpperCase().replace(/\s/g, '');
                if(bName || ibanNo) {
                    arr.push({ banka: bName, iban: ibanNo });
                }
            });
            return arr;
        }

        function piyasaFormunuTemizle() {
            document.getElementById("pYonetimKisi").value = "";
            document.getElementById("pYonetimFirma").value = "";
            document.getElementById("pYonetimBirimFiyat").value = "0,00";
            document.getElementById("pYonetimTarih").value = anlikTarihGetir();
        }

        function girisBasarili(kullanici, yetkiler) {
            document.getElementById("loginSection").style.display = "none";
            document.getElementById("portalSection").style.display = "block";
            sidebardaLogoyuGoster();
            AKTIF_KULLANICI_ADI = kullanici;
            AKTIF_KULLANICI_YETKILERI = yetkiler;
            try { localStorage.setItem("tm_active_user", kullanici); } catch(e) { console.error("Oturum kaydetme hatasi:", e); }
            try { sessionStorage.setItem("tm_session_active", "1"); } catch(e) { console.error("Session kaydetme hatasi:", e); }
            girisCikisLogla(kullanici, "GİRİŞ");
            aktiviteEkle("Giriş yaptı", "Sistem");
            try { localStorage.removeItem('tm_active_page'); } catch(e) { console.error("Sayfa temizleme hatasi:", e); }
            menuyuInsaEt(yetkiler);
            sidebarKullanicilariYenile();
            tmOnlineHeartbeatBaslat(kullanici);
            tmSesCal('giris');
        }
        function tmOnlineKullaniciKontrol(kullanici, callback) {
            if (!fdb) { callback(true); return; }
            var esik = Date.now() - 6000;
            fdb.collection("tm_online").get().then(function(snap) {
                var aktif = null;
                snap.forEach(function(doc) {
                    var data = doc.data();
                    if (data && data.onlineAt && data.onlineAt > esik) {
                        aktif = doc.id;
                    }
                });
                if (aktif && aktif !== kullanici) {
                    var errorDiv = document.getElementById("loginError");
                    if (errorDiv) {
                        errorDiv.innerText = "? " + aktif + " kullanıcısı halen aktif. Çıkış yapmasını bekleyin.";
                        errorDiv.style.display = "block";
                    }
                    callback(false);
                } else {
                    callback(true);
                }
            }).catch(function() {
                callback(true);
            });
        }
        function kurulumuTamamla() {
            const usr = document.getElementById("setupUser").value.trim().toUpperCase();
            const pas = document.getElementById("setupPass").value.trim();
            const ttl = document.getElementById("setupTitle").value.trim() || "KURUCU";
            const err = document.getElementById("setupError");
            if (!usr || !pas) { if (err) { err.textContent = "Kullanıcı adı ve şifre boş bırakılamaz!"; err.style.display = "block"; } return; }
            try { localStorage.setItem("tm_admin_creds_final", JSON.stringify({ usr: usr, pass: pas, title: ttl })); } catch(e) { console.error("Kurulum kaydetme hatasi:", e); }
            document.getElementById("loginCardKurulum").style.display = "none";
            document.getElementById("loginCardGiris").style.display = "block";
            document.getElementById("loginUser").value = usr;
            document.getElementById("loginPass").value = pas;
            sistemeGirisYap();
        }
        function sistemeGirisYap() {
            const inputUser = document.getElementById("loginUser").value.trim().toUpperCase();
            const inputPass = document.getElementById("loginPass").value.trim();
            const errorDiv = document.getElementById("loginError");
            if (errorDiv) errorDiv.style.display = "none";
            var master;
            try { master = JSON.parse(localStorage.getItem("tm_admin_creds_final")); } catch(e) { master = null; console.error("Admin creds parse hatasi:", e); }
            if (!master) {
                if (fdb) {
                    fdb.collection(FS_COLLECTION).doc('tm_admin_creds_final').get({ source: 'server' }).then(function(snap) {
                        if (snap && snap.exists) {
                            var data = snap.data();
                            if (data && data.data) {
                                try { origSetItem("tm_admin_creds_final", JSON.stringify(data.data)); } catch(e) {}
                                sistemeGirisYap();
                                return;
                            }
                        }
                        document.getElementById("loginCardGiris").style.display = "none";
                        document.getElementById("loginCardKurulum").style.display = "block";
                    }).catch(function() {
                        document.getElementById("loginCardGiris").style.display = "none";
                        document.getElementById("loginCardKurulum").style.display = "block";
                    });
                } else {
                    document.getElementById("loginCardGiris").style.display = "none";
                    document.getElementById("loginCardKurulum").style.display = "block";
                }
                return;
            }

            var hedefKullanici = null;
            var hedefYetkiler = null;

            if (inputUser === (master.usr || "TUGAYTURAK") && inputPass === master.pass) {
                hedefKullanici = master.usr || "TUGAYTURAK";
                hedefYetkiler = (function(){
                    var all = [];
                    TM_YETKI_TANIMLARI.forEach(function(g){
                        all.push(g.key);
                        if(g.subs) g.subs.forEach(function(s){ all.push(s.key); });
                    });
                    return all;
                })();
            } else {
                var altKullanicilar;
                try { altKullanicilar = JSON.parse(localStorage.getItem("tm_users_final_v8")) || []; } catch(e) { altKullanicilar = []; console.error("Kullanicilar parse hatasi:", e); }
                var bulunan = altKullanicilar.find(function(u){ return u.usr.toUpperCase() === inputUser && u.pas === inputPass; });
                if (bulunan) {
                    hedefKullanici = bulunan.usr;
                    hedefYetkiler = bulunan.yetkiler;
                }
            }

            if (hedefKullanici) {
                tmOnlineKullaniciKontrol(hedefKullanici, function(izin) {
                    if (izin) girisBasarili(hedefKullanici, hedefYetkiler);
                });
            } else if (fdb) {
                if (errorDiv) { errorDiv.innerText = "Kullanıcı bulunamadı. Firebase'den senkronize ediliyor..."; errorDiv.style.display = "block"; }
                fdb.collection(FS_COLLECTION).doc('tm_users_final_v8').get({ source: 'server' }).then(function(snap) {
                    if (snap && snap.exists) {
                        var data = snap.data();
                        if (data && data.data) {
                            try { origSetItem("tm_users_final_v8", JSON.stringify(data.data)); } catch(e2) { console.error("Firebase kullanici sync hatasi:", e2); }
                        }
                    }
                    var bulunan = (JSON.parse(localStorage.getItem("tm_users_final_v8")) || []).find(function(u){ return u.usr.toUpperCase() === inputUser && u.pas === inputPass; });
                    if (bulunan) {
                        if (errorDiv) errorDiv.style.display = "none";
                        tmOnlineKullaniciKontrol(bulunan.usr, function(izin) {
                            if (izin) girisBasarili(bulunan.usr, bulunan.yetkiler);
                        });
                    } else {
                        if (errorDiv) { errorDiv.innerText = "Kullanıcı adı veya şifre hatalı!"; errorDiv.style.display = "block"; }
                    }
                }).catch(function() {
                    if (errorDiv) { errorDiv.innerText = "Kullanıcı adı veya şifre hatalı!"; errorDiv.style.display = "block"; }
                });
            } else {
                if (errorDiv) { errorDiv.innerText = "Kullanıcı adı veya şifre hatalı!"; errorDiv.style.display = "block"; }
            }
        }

        function sistemdenCikisYap() {
            tmConfirm("Sistemden çıkış yapmak istediğinize emin misiniz?", function() {
                document.getElementById("loginUser").value = "";
                document.getElementById("loginPass").value = "";
                document.getElementById("portalSection").style.display = "none";
                document.getElementById("loginSection").style.display = "flex";
                var cikan;
                try { cikan = localStorage.getItem("tm_active_user") || "BİLİNMEYEN"; } catch(e) { cikan = "BİLİNMEYEN"; console.error("Aktif kullanici okuma hatasi:", e); }
                AKTIF_KULLANICI_YETKILERI = [];
                tmOnlineCikisYap(cikan);
                try { localStorage.removeItem("tm_active_user"); } catch(e) { console.error("Cikis temizlik hatasi:", e); }
                try { sessionStorage.removeItem("tm_session_active"); } catch(e) { console.error("Session temizlik hatasi:", e); }
                try { localStorage.removeItem("tm_active_page"); } catch(e) { console.error("Sayfa temizlik hatasi:", e); }
                girisCikisLogla(cikan, "ÇIKIŞ");
                aktiviteEkle("Çıkış yaptı", "Sistem");
                sidebarKullanicilariYenile();
                tmSesCal('cikis');
            });
        }

        function sidebarToggle() {
            const sidebar = document.querySelector('.sidebar');
            const btn = document.getElementById('sidebarToggle');
            sidebar.classList.toggle('collapsed');
            const collapsed = sidebar.classList.contains('collapsed');
            btn.innerHTML = collapsed ? '<i class="fa-solid fa-chevron-right"></i>' : '<i class="fa-solid fa-chevron-left"></i>';
            localStorage.setItem('tm_sidebar_collapsed', collapsed ? '1' : '0');
        }
        function sidebarMobileAc() {
            document.querySelector('.sidebar').classList.add('mobile-open');
            document.getElementById('sidebarOverlay').classList.add('active');
            document.body.classList.add('sidebar-open-mobile');
            document.getElementById('hamburgerBtn').classList.add('hidden');
        }
        function sidebarMobileKapat() {
            document.querySelector('.sidebar').classList.remove('mobile-open');
            document.getElementById('sidebarOverlay').classList.remove('active');
            document.body.classList.remove('sidebar-open-mobile');
            document.getElementById('hamburgerBtn').classList.remove('hidden');
        }
        function sidebarAc() {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar.classList.contains('collapsed')) {
                sidebar.classList.remove('collapsed');
                document.getElementById('sidebarToggle').innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
                localStorage.setItem('tm_sidebar_collapsed', '0');
            }
        }
        function menuyuInsaEt(yetkiler) {
            if (localStorage.getItem('tm_sidebar_collapsed') === '1') {
                document.querySelector('.sidebar').classList.add('collapsed');
                document.getElementById('sidebarToggle').innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
            }
            sayfaDegistir('anasayfa-page', document.getElementById('menu-anasayfa'));
            kullaniciListesiniYenile();
            sidebarKullanicilariYenile();
            teklifListesiniYenile();
            piyasaListesiniYenile();
            isMuhasebeListesiniYenile();
            tamamlananIsMuhasebeListesiniYenile();
            nakitDekontListesiniYenile();
        }

        function toggleSubmenu(id, arrowId) {
            sidebarAc();
            const sub = document.getElementById(id);
            const arrow = document.getElementById(arrowId);
            if(!sub) return;
            const opening = !sub.classList.contains("open");
            document.querySelectorAll(".submenu").forEach(s => { if (s.id !== id) s.classList.remove("open"); });
            document.querySelectorAll("#arrow-icon i, #arrow-portfoy-icon i, #arrow-muhasebe-icon i").forEach(a => { if (a.closest('span').id !== arrowId) a.className = "fa-solid fa-chevron-down"; });
            if (opening) {
                sub.classList.add("open");
                if (arrow) { const icn = arrow.querySelector('i'); if (icn) icn.className = "fa-solid fa-chevron-up"; }
                try { origSetItem("tm_submenu_open", id); } catch(e) { console.error("Submenu acma hatasi:", e); }
            } else {
                sub.classList.remove("open");
                if (arrow) { const icn = arrow.querySelector('i'); if (icn) icn.className = "fa-solid fa-chevron-down"; }
                try { origSetItem("tm_submenu_open", ""); } catch(e) { console.error("Submenu kapama hatasi:", e); }
            }
        }

        var tmFormDirty = false;
        var tmPendingNav = null;
        function tmFormTemizle() { tmFormDirty = false; }
        function sayfaInputlariTemizle() {
            var aktif = document.querySelector('.page.active');
            if (!aktif) return;
            aktif.querySelectorAll('input[type="text"], input[type="email"], input[type="search"], input[type="tel"], input[type="url"], input[type="number"], textarea').forEach(function(el){
                if (el.closest('.dash-modern-card') || el.closest('.as-form') || el.closest('.cs-wrapper') || el.closest('.it-form-card') || el.closest('.modal') || el.closest('.lock-popup') || el.closest('.page-lock-overlay')) return;
                el.value = "";
            });
        }
        document.addEventListener('input', function(e) {
            if (!tmFormDirty && e.target && e.target.closest && e.target.closest('.page.active')) tmFormDirty = true;
        });
        document.addEventListener('keydown', function(e) {
            function gorunurModal() {
                var list = document.querySelectorAll('.modal-overlay, .as-modal-overlay, .lock-popup-overlay');
                for (var i = 0; i < list.length; i++) {
                    var s = list[i].style.display;
                    if (s === 'flex' || s === 'block' || s === '') return list[i];
                }
                return null;
            }
            var modal = gorunurModal();
            if (!modal) return;
            if (e.key === 'Escape') {
                e.preventDefault();
                var btns = modal.querySelectorAll('button');
                var btn = Array.from(btns).find(function(b) { var t = b.textContent.trim(); return t === '?' || t.startsWith('?') || t === 'İptal' || t === 'Kapat' || t === 'Vazgeç' || t === 'Hayır' || b.classList.contains('as-modal-close') || b.classList.contains('modal-close'); });
                if (!btn) btn = btns[btns.length - 1];
                if (btn) btn.click();
            } else if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('[contenteditable="true"]') && !e.target.closest('textarea') && !e.target.closest('input')) {
                e.preventDefault();
                var btns = modal.querySelectorAll('button');
                var btn = Array.from(btns).find(function(b) { var t = b.textContent.trim(); return t === 'Evet' || t === 'Tamam' || t === 'Kaydet' || t === 'Onayla' || t === 'PDF Oluştur' || t === 'KAYDET'; });
                if (btn) btn.click();
            }
        });
        function tmConfirm(msg, onEvet) {
            document.getElementById("tmConfirmMsg").textContent = msg;
            document.getElementById("tmConfirmOverlay").style.display = "flex";
            document.getElementById("tmConfirmOk").onclick = function() { document.getElementById("tmConfirmOverlay").style.display = "none"; if (onEvet) onEvet(); };
            document.getElementById("tmConfirmCancel").onclick = function() { document.getElementById("tmConfirmOverlay").style.display = "none"; };
        }
        function tmPrompt(msg, onTamam, defaultVal, title) {
            document.getElementById("tmPromptTitle").textContent = title || "GİRİŞ";
            document.getElementById("tmPromptMsg").textContent = msg;
            document.getElementById("tmPromptInput").value = defaultVal || "";
            document.getElementById("tmPromptOverlay").style.display = "flex";
            setTimeout(function() { document.getElementById("tmPromptInput").focus(); }, 100);
            document.getElementById("tmPromptOk").onclick = function() {
                var val = document.getElementById("tmPromptInput").value;
                document.getElementById("tmPromptOverlay").style.display = "none";
                if (onTamam) onTamam(val || "");
            };
            document.getElementById("tmPromptCancel").onclick = function() {
                document.getElementById("tmPromptOverlay").style.display = "none";
                if (onTamam) onTamam(null);
            };
            document.getElementById("tmPromptInput").onkeydown = function(e) {
                if (e.key === "Enter") { document.getElementById("tmPromptOk").click(); }
                if (e.key === "Escape") { document.getElementById("tmPromptCancel").click(); }
            };
        }
        function tmAlert(msg) {
            document.getElementById("tmAlertMsg").textContent = msg;
            document.getElementById("tmAlertOverlay").style.display = "flex";
            document.getElementById("tmAlertOk").onclick = function() { document.getElementById("tmAlertOverlay").style.display = "none"; };
        }
        function bildirimSesi() {
            tmSesCal('basarili');
        }
        function aktiviteEkle(islem, sayfa) {
            try {
                var k = localStorage.getItem("tm_active_user") || "SISTEM";
                var log = JSON.parse(localStorage.getItem("tm_aktivite_log") || "[]");
                log.unshift({ kullanici: k, islem: islem, sayfa: sayfa, zaman: new Date().toLocaleString("tr-TR") });
                if (log.length > 500) log.length = 500;
                localStorage.setItem("tm_aktivite_log", JSON.stringify(log));
            } catch(e) { try { console.error("Aktivite log hatasi:", e); } catch(_) {} }
        }
        function aktiviteListele() {
            var el = document.getElementById("tmAktiviteLogBody");
            if (!el) return;
            var log = JSON.parse(localStorage.getItem("tm_aktivite_log") || "[]");
            if (log.length === 0) { el.innerHTML = "<tr><td colspan='4' style='padding:20px;text-align:center;color:var(--text-light);'>Henüz aktivite kaydı yok.</td></tr>"; return; }
            var h = "";
            log.slice(0, 10).forEach(function(k) {
                h += "<tr><td style='padding:8px 12px;font-size:12px;'>" + k.zaman + "</td><td style='padding:8px 12px;font-size:12px;font-weight:600;'>" + k.kullanici + "</td><td style='padding:8px 12px;font-size:12px;'>" + k.islem + "</td><td style='padding:8px 12px;font-size:12px;color:var(--text-light);'>" + k.sayfa + "</td></tr>";
            });
            el.innerHTML = h;
        }
        function menudenSayfaAc(yetkiKodu, pageId, element) {
            tmFormDirty = false;
            sayfaInputlariTemizle();
            sidebarAc();
            document.querySelectorAll(".page-lock-overlay").forEach(lock => lock.classList.remove("active"));
            document.getElementById("lockPopupOverlay").classList.remove("active");
            if (!yetkiSayfaAc(yetkiKodu)) {
                const targetLock = document.getElementById(`lock-${yetkiKodu}`);
                if (targetLock) targetLock.classList.add("active");
                document.getElementById("lockPopupOverlay").classList.add("active");
                return;
            }
            var subPageMap={"teklif-olustur-page":"teklif-submenu","teklif-liste-page":"teklif-submenu","piyasa-fiyatlari-page":"teklif-submenu","tm-fiyatlar-page":"teklif-submenu","musteriler-page":"portfoy-submenu","isortaklari-page":"portfoy-submenu","nakit-dekont-page":"muhasebe-submenu","is-muhasebe-olustur-page":"muhasebe-submenu","is-muhasebe-page":"muhasebe-submenu","tamamlanan-is-muhasebeleri-page":"muhasebe-submenu","hesap-takip-page":"muhasebe-submenu","fatura-takip-page":"muhasebe-submenu","yillik-butce-page":"muhasebe-submenu"};
            if (subPageMap[pageId]) { try { origSetItem("tm_submenu_open", subPageMap[pageId]); } catch(e) { console.error("Submenu kaydetme hatasi:", e); } }
            sidebarMobileKapat();
            sayfaDegistir(pageId, element);
            history.pushState({ pageId: pageId, yetkiKodu: yetkiKodu }, "", "#" + pageId);
        }
        function kapatLockPopup() { document.getElementById("lockPopupOverlay").classList.remove("active"); }

        function sayfaLoadingGoster() {
            var bar = document.getElementById('pageLoadingBar');
            if (!bar) return;
            bar.classList.remove('done');
            bar.classList.add('active');
            bar.style.width = '';
        }
        function sayfaLoadingBitir() {
            var bar = document.getElementById('pageLoadingBar');
            if (!bar) return;
            bar.classList.remove('active');
            bar.classList.add('done');
            setTimeout(function(){ bar.classList.remove('done'); bar.style.width = '0'; }, 600);
        }
        function sayfaDegistir(pageId, element) {
            window.scrollTo(0, 0);
            sayfaLoadingGoster();
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
            document.querySelectorAll('.submenu-item').forEach(s => s.classList.remove('active'));
            
            const targetPage = document.getElementById(pageId);
            if(targetPage) targetPage.classList.add('active');
            if(element) element.classList.add('active');

            try {
                var el;
                if (['teklif-olustur-page', 'teklif-liste-page', 'tm-fiyatlar-page', 'piyasa-fiyatlari-page'].includes(pageId)) {
                    el = document.getElementById("menu-teklif-root"); if(el) el.classList.add("active");
                }
                if (['musteriler-page', 'isortaklari-page'].includes(pageId)) {
                    el = document.getElementById("menu-portfoy-root"); if(el) el.classList.add("active");
                }
                if (['nakit-dekont-page', 'is-muhasebe-olustur-page', 'is-muhasebe-page', 'tamamlanan-is-muhasebeleri-page', 'hesap-takip-page', 'fatura-takip-page', 'yillik-butce-page'].includes(pageId)) {
                    el = document.getElementById("menu-muhasebe-root"); if(el) el.classList.add("active");
                }
                if (pageId === 'anasayfa-page') { asOzetTakvimRender(); asOzetGorevListele(); dashboardVerileriniGuncelle(); }
                else if (pageId === 'teklif-olustur-page') { teklifFormuTemizle(); }
                else if (pageId === 'teklif-liste-page') { teklifListesiniYenile(); }
                else if (pageId === 'piyasa-fiyatlari-page') { piyasaListesiniYenile(); }
                else if (pageId === 'is-muhasebe-page') { isMuhasebeListesiniYenile(); }
                else if (pageId === 'tamamlanan-is-muhasebeleri-page') { tamamlananIsMuhasebeListesiniYenile(); }
                else if (pageId === 'nakit-dekont-page') { nakitDekontListesiniYenile(); var nd=document.getElementById("ndIslemTuru"); if(nd)nakitDekontIslemTuruRenk(nd); }
                else if (pageId === 'musteriler-page') { musteriKartlariniYenile(); }
                else if (pageId === 'isortaklari-page') { isOrtaklariKartlariniYenile(); }
                else if (pageId === 'hesap-takip-page') { htSayfayiYukle(); }
                else if (pageId === 'fatura-takip-page') { faturaSayfayiYukle(); }
                else if (pageId === 'yillik-butce-page') { ybSayfayiYukle(); }
                else if (pageId === 'dilekce-page') { dlkListele(); dlkIdGuncelle(); }
                else if (pageId === 'tm-fiyatlar-page') { tmfSayfayiYukle(); }
                else if (pageId === 'istakibi-page') { itGoster(); }
                else if (pageId === 'yonetim-page') { sirketBilgileriYukle(); girisCikisLogListele(); aktiviteListele(); gorevYetkiSelectleriDoldur(); gorevYetkiListele(); formSifirla(); kullaniciListesiniYenile(); multiLogoGridRender(); sonYedekTarihiGoster(); }
                else if (pageId === 'is-muhasebe-olustur-page') { isMuhFormIdGuncelle(); }
                else if (pageId === 'notlar-page') { noteListele(); }
                else if (pageId === 'gorevler-takvim-page') { asTakvimRender(); asGorevListele(); }
            } catch(e) { console.warn('sayfa yenileme hatasi', e); }
            localStorage.setItem('tm_active_page', pageId);
            tmFormDirty = false;
            sayfaLoadingBitir();
            setTimeout(function(){ tmIkonButtonTooltipEkle(); tmScrollHintKontrol(); }, 100);
        }
        function yenileAktifSayfa() {
            try {
                if (document.querySelector('.cs-dropdown.open')) return;
                var _f = document.querySelectorAll('.inline-form'); for(var _i=0;_i<_f.length;_i++){if(_f[_i].style.display!=='none'&&_f[_i].style.display!=='')return;}
                if (document.activeElement && ['INPUT','TEXTAREA'].indexOf(document.activeElement.tagName) !== -1) return;
                var csValues = {};
                document.querySelectorAll('select.cs-done').forEach(function(s){
                    csValues[s.id] = s.selectedIndex;
                });
                var activePage = document.querySelector('.page.active');
                if (!activePage) return;
                var id = activePage.id;
                if (id === 'anasayfa-page') { asOzetTakvimRender(); asOzetGorevListele(); dashboardVerileriniGuncelle(); }
                else if (id === 'gorevler-takvim-page') { asTakvimRender(); asGorevListele(); }
                else if (id === 'teklif-liste-page') { teklifListesiniYenile(); }
                else if (id === 'piyasa-fiyatlari-page') { piyasaListesiniYenile(); }
                else if (id === 'is-muhasebe-page') { isMuhasebeListesiniYenile(); }
                else if (id === 'tamamlanan-is-muhasebeleri-page') { tamamlananIsMuhasebeListesiniYenile(); }
                else if (id === 'nakit-dekont-page') { nakitDekontListesiniYenile(); var nd=document.getElementById("ndIslemTuru"); if(nd)nakitDekontIslemTuruRenk(nd); }
                else if (id === 'musteriler-page') { musteriKartlariniYenile(); }
                else if (id === 'isortaklari-page') { isOrtaklariKartlariniYenile(); }
                else if (id === 'hesap-takip-page') { if(HT_AKTIF_DETAY_HESAP!==null&&HT_AKTIF_DETAY_HESAP!==undefined){htHesapKartlariGoster();htNakitKartGoster();htDurumGuncelle();}else{htSayfayiYukle();} }
                else if (id === 'fatura-takip-page') { faturaSayfayiYukle(); }
                else if (id === 'yillik-butce-page') { ybVeriYukle(); ybMonthGridRender(); ybTamamlananlariGoster(); if(ybGosterilenYil===null) { var sakli=ybAccStateKaydet(); ybSekmeGoster(ybAktifSekme); ybAccStateGeriYukle(sakli); } }
                else if (id === 'dilekce-page') { dlkListele(); dlkIdGuncelle(); }
                else if (id === 'tm-fiyatlar-page') { tmfSayfayiYukle(); }
                else if (id === 'istakibi-page') { itGoster(); }
                else if (id === 'yonetim-page') { sirketBilgileriYukle(); girisCikisLogListele(); gorevYetkiSelectleriDoldur(); gorevYetkiListele(); kullaniciListesiniYenile(); multiLogoGridRender(); }
                else if (id === 'is-muhasebe-olustur-page') { isMuhFormIdGuncelle(); }
                Object.keys(csValues).forEach(function(sid){
                    var s = document.getElementById(sid);
                    if (s && s.selectedIndex !== csValues[sid]) {
                        s.selectedIndex = csValues[sid];
                        var w = s.previousElementSibling;
                        if (w && w.classList.contains('cs-wrapper')) {
                            var t = w.querySelector('.cs-trigger');
                            if (t) t.textContent = s.options[s.selectedIndex] ? s.options[s.selectedIndex].text : '';
                        }
                    }
                });
            } catch(e) { console.warn('yenileAktifSayfa hatasi', e); }
        }

        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem("tm_theme", "dark");

        function loginLogoyuGoster() {
            var logoData = localStorage.getItem("tm_multi_logo_3");
            var el = document.getElementById("loginLogo");
            if (!el) return;
            if (logoData && logoData !== "null" && logoData.length > 100) {
                el.innerHTML = '<img src="' + logoData + '" alt="Logo">';
            } else {
                el.innerHTML = '';
            }
        }
        multiLogolariFirebaseCek();
        loginLogoyuGoster();
        tmOnlinePullBaslat();
        window.addEventListener("beforeunload", function() {
            var u = localStorage.getItem("tm_active_user");
            if (u) tmOnlineCikisYap(u);
        });
        window.addEventListener("popstate", function(e) {
            if (e.state && e.state.htDetay) {
                if(document.getElementById("htHesapDetayAlan").style.display==="block"){htHesapDetayKapat(true);return;}
                htHesapDetayGoster(e.state.htDetay);
                return;
            }
            if (HT_AKTIF_DETAY_HESAP !== null && document.getElementById("htHesapDetayAlan") && document.getElementById("htHesapDetayAlan").style.display === "block") {
                htHesapDetayKapat(true);
                if (e.state && e.state.pageId === 'hesap-takip-page') return;
            }
            if (e.state && e.state.pageId) {
                tmFormDirty = false;
                sayfaDegistir(e.state.pageId, null);
            }
        });

        try { if(typeof Chart !== 'undefined' && typeof ChartDataLabels !== 'undefined') Chart.register(ChartDataLabels); } catch(e) { console.warn("Chart.js yüklenemedi:", e); }

        /* ================= ANA SAYFA DURUM MOTORU ================= */
        function dashboardVerileriniGuncelle() {
            document.querySelectorAll("#anasayfa-page [data-perm]").forEach(function(el){
                var val = el.getAttribute("data-perm");
                var goster = true;
                if (val && val.startsWith("[")) {
                    try { var permList = JSON.parse(val); goster = permList.some(function(p){ return yetkiSayfaAc(p); }); } catch(e) { goster = true; }
                } else if (val && val !== "anasayfa") {
                    goster = yetkiSayfaAc(val);
                }
                if (goster) {
                    var wid = el.getAttribute("data-widget");
                    if (wid) { goster = dashWidgetGorunuyorMu(wid); }
                }
                el.style.display = goster ? "" : "none";
            });
            dashShortcutsOlustur();
            dashWidgetSiralamayiUygula();
            var dateEl = document.getElementById("dashHeaderDate");
            if (dateEl) dateEl.textContent = new Date().toLocaleDateString("tr-TR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase();

            const teklifDb = JSON.parse(localStorage.getItem("tm_teklifler_db_final")) || [];
            const piyasaDb = JSON.parse(localStorage.getItem("tm_piyasa_db_v2")) || [];
            const musteriDb = JSON.parse(localStorage.getItem("tm_musteriler_db")) || [];
            const partnerDb = JSON.parse(localStorage.getItem("tm_isortaklari_db")) || [];
            const isMuhDb = JSON.parse(localStorage.getItem("tm_is_muhasebe_db")) || [];
            const tamIsMuhDb = JSON.parse(localStorage.getItem("tm_is_muhasebe_tamamlanan_db")) || [];
            const dekontDb = JSON.parse(localStorage.getItem("tm_nakit_dekont_db")) || [];

            // ÜST İSTATİSTİKLER
            setText("dashStatTeklif", teklifDb.length);
            setText("dashStatMusteri", musteriDb.length);
            setText("dashStatPartner", partnerDb.length);
            setText("dashStatAktifIs", isMuhDb.length);
            setText("dashStatTamamlanan", tamIsMuhDb.length);
            setText("dashStatDekont", dekontDb.length);

            // FİNANSAL ÖZET
            try {
                const htDb = JSON.parse(localStorage.getItem("tm_hesap_takip_db"));
                let sirketBakiye = 0;
                if(htDb && htDb.hesaplar) {
                    htDb.hesaplar.forEach(function(h){ sirketBakiye += h.bakiye || 0; });
                    sirketBakiye += htDb.nakit || 0;
                }
                setText("dashFinBakiye", tmTl(sirketBakiye));
            } catch(e) { setText("dashFinBakiye", "0,00 ₺"); }

            // YILLIK BÜTÇE VERİSİ (gelir/gider)
            try {
                const budgetDb = ybVeriYukle();
                const yil = budgetDb.aktifYil;
                const kayit = budgetDb.yillar[yil];
                if(kayit) {
                    const yilGelir = ybYilToplam(kayit, "gelir");
                    const yilGider = ybYilToplam(kayit, "gider");
                    setText("dashFinGelir", tmTl(yilGelir));
                    setText("dashFinGider", tmTl(yilGider));
                }
            } catch(e) { /* budget function not available */ }

            // İŞ MUHASEBESİ KALAN TAHSİLAT / KALAN ÖDEME
            try {
                const imDb = JSON.parse(localStorage.getItem("tm_is_muhasebe_db")) || [];
                let imHacim = 0, imTahsilat = 0, imVerecek = 0, imOdenen = 0;
                imDb.forEach(function(kayit) {
                    imHacim += kayit.anlasmaUcreti || 0;
                    (kayit.kalemler || []).forEach(function(k) {
                        if(k.tip === "alacak") imTahsilat += k.tutar || 0;
                        else { imVerecek += k.tutar || 0; imOdenen += (k.odenenTutar || 0); }
                    });
                });
                setText("dashFinKalanTahsilat", tmTl(imHacim - imTahsilat));
                setText("dashFinKalanOdeme", tmTl(imVerecek - imOdenen));
            } catch(e) { setText("dashFinKalanTahsilat", "0,00 ₺"); setText("dashFinKalanOdeme", "0,00 ₺"); }

            // SON TEKLİFLER TABLOSU
            const offerBody = document.getElementById("dashRecentOfferBody");
            if(offerBody) {
                if(teklifDb.length === 0) {
                    offerBody.innerHTML = '<tr><td colspan="4">'+tmEmptyStateHTML('<i class="fa-regular fa-file-lines"></i>','Kayıtlı teklif bulunmamaktadır.','Yeni bir teklif oluşturmak için "Yeni Teklif" butonunu kullanın.')+'</td></tr>';
                } else {
                    const son = [...teklifDb].sort(function(a,b){return b.id-a.id;}).slice(0,5);
                    offerBody.innerHTML = "";
                    son.forEach(function(t){
                        offerBody.innerHTML += '<tr>' +
                            '<td style="font-weight:700;color:var(--accent-red);font-size:12px;">#' + String(t.id).padStart(4,'0') + '</td>' +
                            '<td style="font-weight:600;">' + esc(t.musteriAd) + '</td>' +
                            '<td style="color:var(--text-light);font-size:12px;">' + (t.isAdi ? esc(t.isAdi).substring(0,30) + (t.isAdi.length>30?'...':'') : '-') + '</td>' +
                            '<td style="text-align:right;font-weight:700;color:var(--accent-red);font-size:13px;white-space:nowrap;">' + (t.genelTutar || '0,00 \u20BA') + '</td>' +
                            '</tr>';
                    });
                }
            }

            // AKTİF İŞLER
            const jobsBody = document.getElementById("dashActiveJobsBody");
            if(jobsBody) {
                if(isMuhDb.length === 0) {
                    jobsBody.innerHTML = tmEmptyStateHTML('<i class="fa-regular fa-calendar"></i>','Aktif iş bulunmamaktadır.','Dashboard\'da görüntülenecek aktif bir iş kaydı bulunmuyor.');
                } else {
                    const sonIsler = [...isMuhDb].sort(function(a,b){return b.id-a.id;}).slice(0,4);
                    jobsBody.innerHTML = "";
                    sonIsler.forEach(function(j){
                        let toplamVerecek = 0, toplamOdenen = 0;
                        if(j.kalemler) {
                            j.kalemler.forEach(function(k){
                                if(k.tip !== "alacak") {
                                    toplamVerecek += k.tutar || 0;
                                    toplamOdenen += (k.odenenTutar || 0);
                                }
            });
            if (typeof loginLogoyuGoster === 'function') loginLogoyuGoster();
        }
                        const kalan = toplamVerecek - toplamOdenen;
                        jobsBody.innerHTML += '<div class="dash-mini-job">' +
                            '<div class="job-info"><div class="name">' + esc(j.isAdi || 'İSİMSİZ') + '</div>' +
                            '<div class="meta">' + (j.firma && j.firma !== '-' ? esc(j.firma) + ' • ' : '') + '#' + String(j.id).padStart(4,'0') + '</div></div>' +
                            '<div class="job-amount"><span class="val" style="color:' + (kalan>0?'var(--accent-red)':'var(--btn-green)') + ';">' + (kalan || 0).toLocaleString('tr-TR',{minFractionDigits:2}) + ' ?</span>' +
                            '<span class="label">Kalan Ödeme</span></div></div>';
                    });
                }
            }

            // FATURA ÖZETİ
            const invBody = document.getElementById("dashInvoiceBody");
            if(invBody) {
                try {
                    const fv = ftYilVerisi();
                    const gelen = fv.data.gelenFaturalar || [];
                    const giden = fv.data.gidenFaturalar || [];
                    let gelenT = 0, gelenK = 0, gidenT = 0, gidenK = 0;
                    gelen.forEach(function(f){ gelenT += f.toplamTutar||0; gelenK += f.kdvTutari||0; });
                    giden.forEach(function(f){ gidenT += f.toplamTutar||0; gidenK += f.kdvTutari||0; });
                    invBody.innerHTML =
                        '<tr><td style="font-weight:600;"><i class="fa-solid fa-inbox"></i> Gelen</td><td style="text-align:center;">' + gelen.length + '</td><td style="text-align:right;font-weight:600;">' + tmTl(gelenT) + '</td><td style="text-align:right;font-size:12px;color:var(--accent-red);">' + tmTl(gelenK) + '</td></tr>' +
                        '<tr><td style="font-weight:600;"><i class="fa-solid fa-paper-plane"></i> Giden</td><td style="text-align:center;">' + giden.length + '</td><td style="text-align:right;font-weight:600;">' + tmTl(gidenT) + '</td><td style="text-align:right;font-size:12px;color:var(--btn-green);">' + tmTl(gidenK) + '</td></tr>';
                } catch(e) {
                    invBody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:15px;color:var(--text-light);font-size:13px;">Fatura verisi bulunamadı.</td></tr>';
                }
            }

            // PİYASA ENDEKSİ
            const piyasaContainer = document.getElementById("dashPiyasaIndexList");
            if(piyasaContainer) {
                if(piyasaDb.length === 0) {
                    piyasaContainer.innerHTML = '<div style="text-align:center;padding:15px;color:var(--text-light);font-size:13px;">Kayıtlı piyasa verisi bulunmuyor.</div>';
                } else {
                    const sirali = [...piyasaDb].sort(function(a,b){return new Date(b.tarih)-new Date(a.tarih);}).slice(0,5);
                    piyasaContainer.innerHTML = "";
                    sirali.forEach(function(p){
                        const sTarih = p.tarih ? new Date(p.tarih).toLocaleDateString("tr-TR") : "-";
                        piyasaContainer.innerHTML += '<div class="mini-list-item">' +
                            '<div><span style="font-weight:700;color:var(--text-dark);font-size:12px;">' + esc(p.dal) + '</span><br>' +
                            '<small style="color:var(--text-light)">' + esc(p.kisi||p.firma||'-') + ' • ' + sTarih + '</small></div>' +
                            '<span class="mini-badge">' + (p.fiyat||0).toLocaleString('tr-TR') + ' ' + esc(p.birim||'') + '</span></div>';
                    });
                }
            }

            // VERGİ TAKVİMİ
            const vTkv = document.getElementById("dashVergiTakvimi");
            if(vTkv) {
                try {
                    const fv = ftYilVerisi();
                    var etk = fv.data.vergiEtkinlikleri || [];
                    var simdi = new Date();
                    simdi.setHours(0,0,0,0);
                    var gelecek = etk.filter(function(e){ return !e.tamamlandi; }).sort(function(a,b){ return new Date(a.tarih) - new Date(b.tarih); });
                    if(gelecek.length === 0) {
                        vTkv.innerHTML = '<div style="text-align:center;padding:15px;color:var(--text-light);font-size:13px;"><i class="fa-regular fa-calendar"></i> Yaklaşan vergi günü bulunmuyor.</div>';
                    } else {
                        vTkv.innerHTML = "";
                        var goster = gelecek.slice(0,5);
                        goster.forEach(function(e){
                            var turAd = ftTurAdi(e.tur);
                            var kalanGun = "", renk = "";
                            try {
                                var et = new Date(e.tarih);
                                et.setHours(0,0,0,0);
                                var fark = Math.round((et - simdi) / 86400000);
                                if(fark > 0) { kalanGun = fark + " gün"; renk = fark <= 7 ? "color:var(--accent-red);font-weight:700;" : fark <= 30 ? "color:orange;" : "color:var(--text-light);"; }
                                else if(fark === 0) { kalanGun = "BUGÜN!"; renk = "color:red;font-weight:700;"; }
                                else { kalanGun = Math.abs(fark) + " gün geçti"; renk = "color:var(--text-light);"; }
                            } catch(ex) { console.error("Vergi tarih hesaplama hatasi:", ex); }
                            vTkv.innerHTML += '<div class="mini-list-item" style="cursor:pointer;" onclick="menudenSayfaAc(\'fatura-takip\',\'fatura-takip-page\',document.getElementById(\'sub-fatura-takip\'))">' +
                                '<div><span style="font-weight:600;color:var(--text-dark);font-size:12px;">' + esc(e.baslik) + '</span><br>' +
                                '<small style="color:var(--text-light)">' + turAd + ' • ' + tarihStr(e.tarih) + '</small></div>' +
                                '<span style="' + renk + 'font-size:12px;">' + kalanGun + '</span></div>';
                        });
                    }
                } catch(ex) {
                    vTkv.innerHTML = '<div style="text-align:center;padding:15px;color:var(--text-light);font-size:13px;">Vergi verisi yüklenemedi.</div>';
                }
            }

            // GRAFİK
            try {
                if (typeof Chart !== 'undefined') {
                    var ctx = document.getElementById('dashAylikChart');
                    if (ctx) {
                        if (window._dashChart) { window._dashChart.destroy(); }
                        var bd = ybVeriYukle();
                        var yil = bd.aktifYil;
                        var kayit = bd.yillar[yil];
                        var aylar = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
                        var gelirAylik=[], giderAylik=[];
                        for (var i=0;i<12;i++) {
                            var ay = kayit && kayit.aylar && kayit.aylar[i];
                            var g=0, gd=0;
                            if (ay) {
                                if (ay.gelir) Object.values(ay.gelir).forEach(function(k){ g+=k.tutar||0; });
                                if (ay.gider) Object.values(ay.gider).forEach(function(k){ gd+=k.tutar||0; });
                            }
                            gelirAylik.push(g); giderAylik.push(gd);
                        }
                        window._dashChart = new Chart(ctx, {
                            type: 'bar',
                            data: {
                                labels: aylar,
                                datasets: [
                                    { label: 'Gelir', data: gelirAylik, backgroundColor: '#2E7D32', borderRadius: 4 },
                                    { label: 'Gider', data: giderAylik, backgroundColor: '#C62828', borderRadius: 4 }
                                ]
                            },
                            options: {
                                responsive: true, maintainAspectRatio: true,
                                plugins: { legend: { labels: { font: {size:11} } }, datalabels: { display: false } },
                                scales: { y: { beginAtZero: true, ticks: { callback: function(v){ return v.toLocaleString('tr-TR') + ' ₺'; } } } }
                            }
                        });
                    }
                }
            } catch(e) { console.warn('Dashboard grafik hatasi:', e); }

            function setText(id, val) {
                const el = document.getElementById(id);
                if(el) el.innerText = val;
            }
        }

        var _dashNotTimer = null;
        function dashOfficeNotesYukle() {
            const kaydedilenNot = localStorage.getItem("tm_dashboard_notes") || "";
            const textarea = document.getElementById("dashOfficeNotes");
            if (textarea) textarea.value = kaydedilenNot;
        }

        function dashNotlariKaydet(deger) {
            if(_dashNotTimer) clearTimeout(_dashNotTimer);
            _dashNotTimer = setTimeout(function(){
                localStorage.setItem("tm_dashboard_notes", deger);
            }, 300);
        }

        /* ================= YENİ DASHBOARD FONKSİYONLARI ================= */
        var DASH_WIDGET_KEY = "tm_dashboard_widget_order";
        var DASH_WIDGET_HIDDEN_KEY = "tm_dashboard_widget_hidden";

        function dashWidgetSiralamasiGetir() {
            try { return JSON.parse(localStorage.getItem(DASH_WIDGET_KEY)) || []; } catch(e) { return []; }
        }
        function dashWidgetSiralamasiKaydet(sira) {
            try { localStorage.setItem(DASH_WIDGET_KEY, JSON.stringify(sira)); } catch(e) {}
        }
        function dashWidgetGizliListesi() {
            try { return JSON.parse(localStorage.getItem(DASH_WIDGET_HIDDEN_KEY)) || []; } catch(e) { return []; }
        }
        function dashWidgetGizliKaydet(list) {
            try { localStorage.setItem(DASH_WIDGET_HIDDEN_KEY, JSON.stringify(list)); } catch(e) {}
        }
        function dashWidgetGorunuyorMu(widgetId) {
            return dashWidgetGizliListesi().indexOf(widgetId) === -1;
        }
        function dashWidgetGizle(widgetId) {
            var gizli = dashWidgetGizliListesi();
            if (gizli.indexOf(widgetId) === -1) gizli.push(widgetId);
            dashWidgetGizliKaydet(gizli);
            dashboardVerileriniGuncelle();
        }
        function dashWidgetGoster(widgetId) {
            var gizli = dashWidgetGizliListesi().filter(function(id){ return id !== widgetId; });
            dashWidgetGizliKaydet(gizli);
            dashboardVerileriniGuncelle();
        }
        function dashWidgetSiralamayiUygula() {
            var sira = dashWidgetSiralamasiGetir();
            if (!sira || sira.length === 0) return;
            var grid = document.getElementById("dashWidgetGrid");
            if (!grid) return;
            var widgets = grid.querySelectorAll(".dash-modern-card");
            var map = {};
            widgets.forEach(function(w){ var wid = w.getAttribute("data-widget"); if (wid) map[wid] = w; });
            sira.forEach(function(wid){
                if (map[wid]) { grid.appendChild(map[wid]); delete map[wid]; }
            });
            Object.keys(map).forEach(function(wid){ grid.appendChild(map[wid]); });
        }

        /* Drag & Drop */
        function dashDragBasla(e) {
            var card = e.target.closest(".dash-modern-card");
            if (!card) return;
            e.dataTransfer.setData("text/plain", card.getAttribute("data-widget") || "");
            e.dataTransfer.effectAllowed = "move";
            setTimeout(function(){ card.classList.add("dash-dragging"); }, 0);
        }
        function dashDragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            var target = e.target.closest(".dash-modern-card");
            if (target) target.classList.add("dash-drag-over");
        }
        function dashDragLeave(e) {
            var target = e.target.closest(".dash-modern-card");
            if (target) target.classList.remove("dash-drag-over");
        }
        function dashDrop(e) {
            e.preventDefault();
            document.querySelectorAll(".dash-drag-over").forEach(function(el){ el.classList.remove("dash-drag-over"); });
            document.querySelectorAll(".dash-dragging").forEach(function(el){ el.classList.remove("dash-dragging"); });
            var fromId = e.dataTransfer.getData("text/plain");
            if (!fromId) return;
            var grid = document.getElementById("dashWidgetGrid");
            var target = e.target.closest(".dash-modern-card");
            if (!target || !grid) return;
            var toId = target.getAttribute("data-widget");
            if (!toId || fromId === toId) return;
            var fromEl = grid.querySelector('[data-widget="' + fromId + '"]');
            var toEl = grid.querySelector('[data-widget="' + toId + '"]');
            if (!fromEl || !toEl) return;
            var parent = grid;
            var children = Array.from(parent.children);
            var fromIdx = children.indexOf(fromEl);
            var toIdx = children.indexOf(toEl);
            if (fromIdx < toIdx) {
                parent.insertBefore(fromEl, toEl.nextSibling);
            } else {
                parent.insertBefore(fromEl, toEl);
            }
            var yeniSira = [];
            parent.querySelectorAll(".dash-modern-card").forEach(function(c){
                var wid = c.getAttribute("data-widget");
                if (wid) yeniSira.push(wid);
            });
            dashWidgetSiralamasiKaydet(yeniSira);
        }
        function dashDragEnd(e) {
            document.querySelectorAll(".dash-dragging,.dash-drag-over").forEach(function(el){
                el.classList.remove("dash-dragging","dash-drag-over");
            });
        }

        /* Widget Ayarları */
        function dashAyarGoster() {
            var modal = document.getElementById("dashAyarModal");
            var liste = document.getElementById("dashAyarListesi");
            if (!modal || !liste) return;
            var gizli = dashWidgetGizliListesi();
            var widgetAdlari = {
                chart:"Gelir/Gider Grafiği", shortcuts:"Hızlı Kısayollar", takvim:"Takvim",
                teklifler:"Son Teklifler", isler:"Aktif İşler", gorevler:"Görevler",
                fatura:"Fatura Özeti", piyasa:"Piyasa Endeksi", vergi:"Vergi Takvimi", notlar:"Ofis Notları"
            };
            var widgetIkonlari = {
                chart:'<i class="fa-solid fa-chart-simple"></i>', shortcuts:'<i class="fa-solid fa-rocket"></i>', takvim:'<i class="fa-regular fa-calendar"></i>', teklifler:'<i class="fa-regular fa-file-lines"></i>',
                isler:'<i class="fa-solid fa-helmet-safety"></i>', gorevler:'<i class="fa-solid fa-list"></i>', fatura:'<i class="fa-solid fa-coins"></i>', piyasa:'<i class="fa-solid fa-chart-simple"></i>', vergi:'<i class="fa-regular fa-calendar"></i>', notlar:'<i class="fa-regular fa-note-sticky"></i>'
            };
            var h = "";
            Object.keys(widgetAdlari).forEach(function(wid){
                var gizliMi = gizli.indexOf(wid) !== -1;
                var kart = document.querySelector('[data-widget="'+wid+'"]');
                if (!kart || kart.closest('[data-perm]') && kart.closest('[data-perm]').style.display === "none") {
                    if (!gizliMi) return;
                }
                h += '<div class="dash-ayar-item">';
                h += '<span class="dash-ayar-icon">' + (widgetIkonlari[wid]||'<i class="fa-solid fa-box"></i>') + '</span>';
                h += '<span class="dash-ayar-label">' + (widgetAdlari[wid]||wid) + '</span>';
                if (gizliMi) {
                    h += '<button class="dash-ayar-toggle dash-ayar-hidden" onclick="dashWidgetGoster(\''+wid+'\')">+ GÖSTER</button>';
                } else {
                    h += '<button class="dash-ayar-toggle dash-ayar-visible" onclick="dashWidgetGizle(\''+wid+'\')">GİZLE</button>';
                }
                h += '</div>';
            });
            if (!h) h = '<div style="text-align:center;padding:20px;color:var(--text-light);font-size:13px;">Tüm widget\'lar zaten görünür durumda.</div>';
            liste.innerHTML = h;
            modal.style.display = "flex";
        }
        function dashAyarKapat() {
            document.getElementById("dashAyarModal").style.display = "none";
        }

        /* Hızlı Kısayollar */
        var DASH_KISAYOL_KEY = "tm_dashboard_shortcuts";
        function dashKisayolVarsayilan() {
            return [
                { icon:'<i class="fa-regular fa-file-lines"></i>', label:"Yeni Teklif", page:"teklif-olustur", perm:"teklif-olustur" },
                { icon:'<i class="fa-solid fa-user"></i>', label:"Müşteri Ekle", page:"musteriler", perm:"musteriler-page" },
                { icon:'<i class="fa-solid fa-handshake"></i>', label:"Partner Ekle", page:"isortaklari", perm:"isortaklari-page" },
                { icon:'<i class="fa-solid fa-money-bill-wave"></i>', label:"Nakit Dekont", page:"nakit-dekont", perm:"nakit-dekont" },
                { icon:'<i class="fa-regular fa-calendar"></i>', label:"İş Takibi", page:"istakibi", perm:"istakibi-page" },
                { icon:'<i class="fa-solid fa-coins"></i>', label:"Fatura Takip", page:"fatura-takip", perm:"fatura-takip" }
            ];
        }
        function dashShortcutsOlustur() {
            var konteyner = document.getElementById("dashShortcuts");
            if (!konteyner) return;
            var kisayollar;
            try { kisayollar = JSON.parse(localStorage.getItem(DASH_KISAYOL_KEY)); } catch(e) { kisayollar = null; }
            if (!kisayollar || !Array.isArray(kisayollar) || kisayollar.length === 0) {
                kisayollar = dashKisayolVarsayilan();
            }
            var h = "";
            kisayollar.forEach(function(s){
                if (s.perm && !yetkiSayfaAc(s.perm)) return;
                var pageId = (s.page || "").replace(/^(teklif-liste|teklif-olustur|tm-fiyatlar|piyasa-fiyatlari|musteriler|isortaklari|nakit-dekont|is-muhasebe-olustur|is-muhasebe|tamamlanan-is-muhasebeleri|hesap-takip|fatura-takip|yillik-butce|dilekce|istakibi|yonetim)$/, function(m){
                    var map = { "teklif-liste":"teklif-liste-page", "teklif-olustur":"teklif-olustur-page", "tm-fiyatlar":"tm-fiyatlar-page", "piyasa-fiyatlari":"piyasa-fiyatlari-page", "musteriler":"musteriler-page", "isortaklari":"isortaklari-page", "nakit-dekont":"nakit-dekont-page", "is-muhasebe-olustur":"is-muhasebe-olustur-page", "is-muhasebe":"is-muhasebe-page", "tamamlanan-is-muhasebeleri":"tamamlanan-is-muhasebeleri-page", "hesap-takip":"hesap-takip-page", "fatura-takip":"fatura-takip-page", "yillik-butce":"yillik-butce-page", "dilekce":"dilekce-page", "istakibi":"istakibi-page", "yonetim":"yonetim-page" };
                    return map[m] || m;
                });
                var menuItem = document.getElementById("sub-" + (s.page || ""));
                h += '<div class="dash-shortcut-item" onclick="menudenSayfaAc(\'' + (s.page||"") + '\',\'' + pageId + '\',document.getElementById(\'sub-' + (s.page||"") + '\'))">';
                h += '<span class="dash-short-icon">' + (s.icon||'<i class="fa-solid fa-thumbtack"></i>') + '</span>';
                h += '<span>' + (s.label||"Sayfa") + '</span></div>';
            });
            if (!h) {
                konteyner.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:12px;color:var(--text-light);font-size:12px;">Henüz kısayol bulunmuyor.</div>';
            } else {
            konteyner.innerHTML = h;
            htIslemFiltrele();
        }
        }

        /* ================= PORTFÖY MODÜLÜ (MÜŞTERİLER) MOTORU ================= */
        function musteriProfilKaydet() {
            const ad = trToUpper(document.getElementById("mAdi").value.trim());
            const sirket = trToUpper(document.getElementById("mSirket").value.trim()) || "BİREYSEL";
            const unvan = trToUpper(document.getElementById("mUnvan").value.trim()) || "-";
            const tel = document.getElementById("mTel").value.trim() || "-";
            const eposta = document.getElementById("mEposta").value.trim() || "-";
            const tipi = document.getElementById("mTipi").value;
            const kimlik = document.getElementById("mKimlikNo").value.trim() || "-";
            const vergiDairesi = trToUpper(document.getElementById("mVergiDairesi").value.trim()) || "-";
            const vergiNo = document.getElementById("mVergiNo").value.trim() || "-";
            const adres = trToUpper(document.getElementById("mAdres").value.trim()) || "-";
            const bankalar = bankaVerileriniTopla("musteriBankaKonteyner");

            if(!ad) { tmNotify("Müşteri adı boş bırakılamaz!", "error"); return; }

            tmLoadingGoster('Müşteri kaydediliyor...');
            var db, editId;
            try { db = JSON.parse(localStorage.getItem("tm_musteriler_db")) || []; } catch(e) { db = []; console.error("Musteri db yukleme hatasi:", e); }
            editId = document.getElementById("musteriEditId").value;

            if(editId === "-1") {
                db.push({ id: Date.now(), ad, sirket, unvan, tel, eposta, tipi, kimlik, vergiDairesi, vergiNo, adres, bankalar });
                tmNotify("Müşteri profil kartı başarıyla eklendi.", "success");
                aktiviteEkle("Müşteri eklendi: " + ad, "Portföy");
            } else {
                const targetId = parseInt(editId);
                db = db.map(item => item.id === targetId ? { ...item, ad, sirket, unvan, tel, eposta, tipi, kimlik, vergiDairesi, vergiNo, adres, bankalar } : item);
                tmNotify("Müşteri profil kartı güncellendi.", "success");
                aktiviteEkle("Müşteri güncellendi: " + ad, "Portföy");
            }
            
            try { localStorage.setItem("tm_musteriler_db", JSON.stringify(db)); } catch(e) { console.error("Musteri db kaydetme hatasi:", e); tmNotify("Müşteri kaydedilirken hata oluştu!", "error"); }
            tmLoadingGizle();
            musteriFormTemizle();
            musteriKartlariniYenile();
        }

        function musteriDuzenle(id) {
            const db = JSON.parse(localStorage.getItem("tm_musteriler_db")) || [];
            const kart = db.find(m => m.id === id);
            if(!kart) return;

            document.getElementById("musteriFormTitle").textContent = 'Müşteri Kartını Düzenle';
            document.getElementById("musteriEditId").value = kart.id;
            document.getElementById("mAdi").value = kart.ad;
            document.getElementById("mSirket").value = kart.sirket;
            document.getElementById("mUnvan").value = kart.unvan || "";
            document.getElementById("mTel").value = kart.tel;
            document.getElementById("mEposta").value = kart.eposta;
            document.getElementById("mTipi").value = kart.tipi;
            document.getElementById("mKimlikNo").value = kart.kimlik || "";
            document.getElementById("mVergiDairesi").value = kart.vergiDairesi || "";
            document.getElementById("mVergiNo").value = kart.vergiNo || "";
            document.getElementById("mAdres").value = kart.adres;

            const kont = document.getElementById("musteriBankaKonteyner");
            kont.innerHTML = "";
            if(kart.bankalar && kart.bankalar.length > 0) {
                kart.bankalar.forEach(b => bankaSatiriEkle("musteriBankaKonteyner", b.banka, b.iban));
            } else {
                bankaSatiriEkle("musteriBankaKonteyner");
            }

            document.getElementById("btnMusteriSave").innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Değişiklikleri Kaydet';
            document.getElementById("btnMusteriCancel").style.display = "inline-block";
        }

        function musteriFormTemizle() {
            document.getElementById("musteriFormTitle").textContent = 'Yeni Müşteri Kartı Tanımla';
            document.getElementById("musteriEditId").value = "-1";
            document.getElementById("mAdi").value = "";
            document.getElementById("mSirket").value = "";
            document.getElementById("mUnvan").value = "";
            document.getElementById("mTel").value = "";
            document.getElementById("mEposta").value = "";
            document.getElementById("mKimlikNo").value = "";
            document.getElementById("mVergiDairesi").value = "";
            document.getElementById("mVergiNo").value = "";
            document.getElementById("mAdres").value = "";
            document.getElementById("musteriBankaKonteyner").innerHTML = "";
            bankaSatiriEkle("musteriBankaKonteyner");
            
            document.getElementById("btnMusteriSave").innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Profil Kartını Kaydet';
            document.getElementById("btnMusteriCancel").style.display = "none";
        }

        function musteriKartlariniYenile() {
            const konteyner = document.getElementById("musteriKartlariKonteyner");
            if(!konteyner) return; konteyner.innerHTML = "";
            const db = JSON.parse(localStorage.getItem("tm_musteriler_db")) || [];
            const musteriSummary = document.getElementById("musteriSummaryStrip");
            const tamamlananDb = JSON.parse(localStorage.getItem("tm_is_muhasebe_tamamlanan_db")) || [];
            if(musteriSummary) {
                let toplamIs = 0;
                db.forEach(m => {
                    toplamIs += tamamlananDb.filter(t => trToUpper(t.musteriAd || t.firma || "") === trToUpper(m.ad) || trToUpper(t.firma || "") === trToUpper(m.sirket)).length;
                });
                musteriSummary.innerHTML = `
                    <div class="partner-stat-box">
                        <div class="partner-stat-icon" style="background:rgba(158,42,43,0.12);color:var(--accent-red);"><i class="fa-regular fa-folder-open"></i></div>
                        <div class="partner-stat-info">
                            <span class="partner-stat-value" style="color:var(--accent-red);">${db.length}</span>
                            <span class="partner-stat-label">Toplam Müşteri</span>
                        </div>
                    </div>
                    <div class="partner-stat-box">
                        <div class="partner-stat-icon" style="background:rgba(46,125,50,0.12);color:#2E7D32;"><i class="fa-solid fa-briefcase"></i></div>
                        <div class="partner-stat-info">
                            <span class="partner-stat-value" style="color:#2E7D32;">${toplamIs}</span>
                            <span class="partner-stat-label">Toplam Yapılan İş</span>
                        </div>
                    </div>
                `;
            }
            if(db.length === 0) { konteyner.innerHTML = tmEmptyStateHTML('<i class="fa-regular fa-folder-open"></i>','Kayıtlı müşteri bulunmamaktadır.','Yeni bir müşteri eklemek için "Müşteri Ekle" butonunu kullanın.'); return; }
            
            const tekliflerDb = JSON.parse(localStorage.getItem("tm_teklifler_db_final")) || [];
            db.sort(function(a, b) {
                var aIs = tamamlananDb.filter(t => trToUpper(t.musteriAd || t.firma || "") === trToUpper(a.ad) || trToUpper(t.firma || "") === trToUpper(a.sirket)).length;
                var bIs = tamamlananDb.filter(t => trToUpper(t.musteriAd || t.firma || "") === trToUpper(b.ad) || trToUpper(t.firma || "") === trToUpper(b.sirket)).length;
                return bIs - aIs;
            });
            db.forEach(m => {
                let bankaHTML = "";
                if(m.bankalar && m.bankalar.length > 0) {
                    m.bankalar.forEach(b => { 
                        const bankaRenk = getBankaRenkKodu(b.banka);
                        const ibanFormatted = (b.iban || '').replace(/(.{4})/g, '$1 ').trim();
                        bankaHTML += `<div class="partner-banka-item" style="border-left:3px solid ${bankaRenk};">
                            <div class="partner-banka-name" style="color:${bankaRenk};"><i class="fa-solid fa-university"></i> ${b.banka}</div>
                            <div class="partner-banka-iban" style="color:${bankaRenk};"><i class="fa-solid fa-arrow-right"></i> ${ibanFormatted}</div>
                        </div>`; 
                    });
                } else { bankaHTML = '<div class="partner-banka-item partner-banka-empty"><i class="fa-solid fa-circle-exclamation"></i> Banka hesabı girilmemiş</div>'; }

                const isSayisi = tamamlananDb.filter(t => trToUpper(t.musteriAd || t.firma || "") === trToUpper(m.ad) || trToUpper(t.firma || "") === trToUpper(m.sirket)).length;

                konteyner.innerHTML += `
                    <div class="portfolio-card m-card-item">
                        <div class="partner-card-top">
                            <div class="partner-card-avatar">
                                <i class="fa-regular fa-user"></i>
                            </div>
                            <div class="partner-card-header">
                                <h4 class="m-search-ad">${m.ad}</h4>
                                <div class="partner-card-brans m-search-tipi"><i class="fa-solid fa-tag"></i> ${m.tipi}</div>
                            </div>
                            <div class="partner-card-jobcount">
                                <span class="partner-jobcount-num">${isSayisi}</span>
                                <span class="partner-jobcount-label">İŞ</span>
                            </div>
                        </div>
                        <div class="partner-card-divider"></div>
                        <div class="partner-card-body">
                            <div class="partner-card-info">
                                <span class="partner-info-icon"><i class="fa-solid fa-building"></i></span>
                                <div><span class="partner-info-label">Firma</span><span class="partner-info-val m-search-sirket">${m.sirket}</span></div>
                            </div>
                            <div class="partner-card-info">
                                <span class="partner-info-icon"><i class="fa-solid fa-briefcase"></i></span>
                                <div><span class="partner-info-label">Ünvan</span><span class="partner-info-val m-search-unvan">${m.unvan || '-'}</span></div>
                            </div>
                            <div class="partner-card-info">
                                <span class="partner-info-icon"><i class="fa-solid fa-phone"></i></span>
                                <div><span class="partner-info-label">Telefon</span><span class="partner-info-val">${m.tel}</span></div>
                            </div>
                            <div class="partner-card-info">
                                <span class="partner-info-icon"><i class="fa-solid fa-envelope"></i></span>
                                <div><span class="partner-info-label">E-Posta</span><span class="partner-info-val">${m.eposta}</span></div>
                            </div>
                            <div class="partner-card-info">
                                <span class="partner-info-icon"><i class="fa-solid fa-id-card"></i></span>
                                <div><span class="partner-info-label">T.C. Kimlik</span><span class="partner-info-val m-search-kimlik">${m.kimlik || '-'}</span></div>
                            </div>
                            <div class="partner-card-info">
                                <span class="partner-info-icon"><i class="fa-solid fa-file-invoice"></i></span>
                                <div><span class="partner-info-label">Vergi Dairesi</span><span class="partner-info-val">${m.vergiDairesi || '-'}</span></div>
                            </div>
                            <div class="partner-card-info">
                                <span class="partner-info-icon"><i class="fa-solid fa-file-invoice"></i></span>
                                <div><span class="partner-info-label">Vergi No</span><span class="partner-info-val">${m.vergiNo || '-'}</span></div>
                            </div>
                            <div class="partner-card-info">
                                <span class="partner-info-icon"><i class="fa-solid fa-location-dot"></i></span>
                                <div><span class="partner-info-label">Adres</span><span class="partner-info-val m-search-adres">${m.adres}</span></div>
                            </div>
                            <div class="partner-card-info" style="align-items:flex-start;">
                                <span class="partner-info-icon" style="margin-top:3px;"><i class="fa-solid fa-building-columns"></i></span>
                                <div style="flex:1;">
                                    <span class="partner-info-label">Banka Hesapları</span>
                                    <div class="partner-banka-list">${bankaHTML}</div>
                                </div>
                            </div>
                        </div>
                        <div class="partner-card-actions">
                            <button class="partner-btn partner-btn-files" onclick="pbPopupAc(${m.id}, 'musteri')"><i class="fa-regular fa-folder"></i> Dosyalar</button>
                            <div class="partner-card-actions-right">
                                <button class="partner-btn partner-btn-edit" onclick="musteriDuzenle(${m.id})"><i class="fa-solid fa-pen"></i> Düzenle</button>
                                <button class="partner-btn partner-btn-delete" onclick="portfolioKartSil('tm_musteriler_db', ${m.id}, 'musteri')"><i class="fa-solid fa-trash-can"></i> Sil</button>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        function musterileriFiltrele() {
            const kelime = trToUpper(document.getElementById("musteriAramaInput").value.trim());
            document.querySelectorAll("#musteriKartlariKonteyner .m-card-item").forEach((kart) => {
                const ad = trToUpper(kart.querySelector(".m-search-ad").innerText);
                const tipi = trToUpper(kart.querySelector(".m-search-tipi").innerText);
                const sirket = trToUpper(kart.querySelector(".m-search-sirket").innerText);
                const unvan = trToUpper(kart.querySelector(".m-search-unvan").innerText);
                const kimlik = trToUpper(kart.querySelector(".m-search-kimlik").innerText);
                const adres = trToUpper(kart.querySelector(".m-search-adres").innerText);
                
                if (ad.includes(kelime) || tipi.includes(kelime) || sirket.includes(kelime) || unvan.includes(kelime) || kimlik.includes(kelime) || adres.includes(kelime)) {
                    kart.style.display = "flex";
                } else {
                    kart.style.display = "none";
                }
            });
        }

        /* ================= PORTFÖY MODÜLÜ (İŞ ORTAKLARI) MOTORU ================= */
        function ioStatusSecenekleriniDoldur() {
            var sec = document.getElementById("ioStatus");
            if(!sec) return;
            var varsayilan = [
                { value:"Sürekli Partner", text:"Sürekli Çözüm Ortağı" },
                { value:"Proje Bazlı", text:"Proje Bazlı Partner" }
            ];
            var custom = [];
            try { custom = JSON.parse(localStorage.getItem("tm_io_status_list")) || []; } catch(e) {}
            var secili = sec.value;
            sec.innerHTML = "";
            varsayilan.forEach(function(s) {
                var o = document.createElement("option");
                o.value = s.value; o.textContent = s.text;
                if(s.value === secili) o.selected = true;
                sec.appendChild(o);
            });
            custom.forEach(function(s) {
                var o = document.createElement("option");
                o.value = s; o.textContent = s;
                if(s === secili) o.selected = true;
                sec.appendChild(o);
            });
        }
        function ioStatusEkle() {
            tmPrompt("Lütfen eklemek istediğiniz yeni Ortaklık Statüsü adını giriniz:", function(yeni) {
                if(yeni) {
                    yeni = yeni.trim();
                    if(!yeni) return;
                    var custom = [];
                    try { custom = JSON.parse(localStorage.getItem("tm_io_status_list")) || []; } catch(e) {}
                    if(custom.indexOf(yeni) !== -1) { tmNotify("Bu statü zaten sistemde mevcut!", "error"); return; }
                    custom.push(yeni);
                    try { localStorage.setItem("tm_io_status_list", JSON.stringify(custom)); } catch(e) {}
                    ioStatusSecenekleriniDoldur();
                    document.getElementById("ioStatus").value = yeni;
                }
            });
        }
        function ioStatusSil() {
            var sec = document.getElementById("ioStatus");
            if(!sec) return;
            var secilen = sec.value;
            var varsayilan = ["Sürekli Partner", "Proje Bazlı"];
            if(varsayilan.indexOf(secilen) !== -1) { tmNotify("Varsayılan statüler silinemez!", "error"); return; }
            tmConfirm('"' + secilen + '" statüsünü silmek istediğinize emin misiniz?', function() {
                var custom = [];
                try { custom = JSON.parse(localStorage.getItem("tm_io_status_list")) || []; } catch(e) {}
                custom = custom.filter(function(s) { return s !== secilen; });
                try { localStorage.setItem("tm_io_status_list", JSON.stringify(custom)); } catch(e) {}
                ioStatusSecenekleriniDoldur();
            });
        }
        function isOrtagiProfilKaydet() {
            const ad = trToUpper(document.getElementById("ioAdi").value.trim());
            const sirket = trToUpper(document.getElementById("ioSirket").value.trim()) || "BİREYSEL";
            const unvan = trToUpper(document.getElementById("ioUnvan").value.trim()) || "-";
            const brans = document.getElementById("ioBrans").value;
            const tel = document.getElementById("ioTel").value.trim() || "-";
            const eposta = document.getElementById("ioEposta").value.trim() || "-";
            const kimlik = document.getElementById("ioKimlikNo").value.trim() || "-";
            const vergiDairesi = trToUpper(document.getElementById("ioVergiDairesi").value.trim()) || "-";
            const vergiNo = document.getElementById("ioVergiNo").value.trim() || "-";
            const status = document.getElementById("ioStatus").value;
            const adres = trToUpper(document.getElementById("ioAdres").value.trim()) || "-";
            const bankalar = bankaVerileriniTopla("partnerBankaKonteyner");

            if(!ad || !brans) { tmNotify("Partner adı ve Branş alanı zorunludur!", "error"); return; }

            tmLoadingGoster('İş ortağı kaydediliyor...');
            var db, editId;
            try { db = JSON.parse(localStorage.getItem("tm_isortaklari_db")) || []; } catch(e) { db = []; console.error("Isortagi db yukleme hatasi:", e); }
            editId = document.getElementById("partnerEditId").value;

            if(editId === "-1") {
                db.push({ id: Date.now(), ad, sirket, unvan, brans, tel, eposta, kimlik, vergiDairesi, vergiNo, status, adres, bankalar });
                tmNotify("İş ortağı başarıyla sisteme kaydedildi.", "success");
                aktiviteEkle("İş ortağı eklendi: " + ad, "Portföy");
            } else {
                const targetId = parseInt(editId);
                db = db.map(item => item.id === targetId ? { ...item, ad, sirket, unvan, brans, tel, eposta, kimlik, vergiDairesi, vergiNo, status, adres, bankalar } : item);
                tmNotify("Partner kartı başarıyla güncellendi.", "success");
            }

            try { localStorage.setItem("tm_isortaklari_db", JSON.stringify(db)); } catch(e) { console.error("Isortagi db kaydetme hatasi:", e); tmNotify("İş ortağı kaydedilirken hata oluştu!", "error"); }
            tmLoadingGizle();
            partnerFormTemizle();
            isOrtaklariKartlariniYenile();
        }

        function partnerDuzenle(id) {
            const db = JSON.parse(localStorage.getItem("tm_isortaklari_db")) || [];
            const kart = db.find(io => io.id === id);
            if(!kart) return;

            document.getElementById("partnerFormTitle").textContent = 'Partner Kartını Düzenle';
            document.getElementById("partnerEditId").value = kart.id;
            document.getElementById("ioAdi").value = kart.ad;
            document.getElementById("ioSirket").value = kart.sirket;
            document.getElementById("ioUnvan").value = kart.unvan || "";
            document.getElementById("ioBrans").value = kart.brans;
            document.getElementById("ioTel").value = kart.tel;
            document.getElementById("ioEposta").value = kart.eposta;
            document.getElementById("ioKimlikNo").value = kart.kimlik || "";
            document.getElementById("ioVergiDairesi").value = kart.vergiDairesi || "";
            document.getElementById("ioVergiNo").value = kart.vergiNo || "";
            ioStatusSecenekleriniDoldur();
            document.getElementById("ioStatus").value = kart.status;
            document.getElementById("ioAdres").value = kart.adres || "";

            const kont = document.getElementById("partnerBankaKonteyner");
            kont.innerHTML = "";
            if(kart.bankalar && kart.bankalar.length > 0) {
                kart.bankalar.forEach(b => bankaSatiriEkle("partnerBankaKonteyner", b.banka, b.iban));
            } else {
                bankaSatiriEkle("partnerBankaKonteyner");
            }

            document.getElementById("btnPartnerSave").innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Değişiklikleri Kaydet';
            document.getElementById("btnPartnerCancel").style.display = "inline-block";
        }

        function partnerFormTemizle() {
            document.getElementById("partnerFormTitle").textContent = 'Yeni İş Ortağı / Partner Kaydet';
            document.getElementById("partnerEditId").value = "-1";
            document.getElementById("ioAdi").value = "";
            document.getElementById("ioSirket").value = "";
            document.getElementById("ioUnvan").value = "";
            document.getElementById("ioTel").value = "";
            document.getElementById("ioEposta").value = "";
            document.getElementById("ioKimlikNo").value = "";
            document.getElementById("ioVergiDairesi").value = "";
            document.getElementById("ioVergiNo").value = "";
            document.getElementById("ioAdres").value = "";
            document.getElementById("partnerBankaKonteyner").innerHTML = "";
            bankaSatiriEkle("partnerBankaKonteyner");
            ioStatusSecenekleriniDoldur();

            document.getElementById("btnPartnerSave").innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Partner Profilini Kaydet';
            document.getElementById("btnPartnerCancel").style.display = "none";
        }

        function isOrtaklariKartlariniYenile() {
            const konteyner = document.getElementById("isOrtaklariKartlariKonteyner");
            if(!konteyner) return; konteyner.innerHTML = "";
            const db = JSON.parse(localStorage.getItem("tm_isortaklari_db")) || [];
            const partnerSummary = document.getElementById("partnerSummaryStrip");
            const tamamlananDb = JSON.parse(localStorage.getItem("tm_is_muhasebe_tamamlanan_db")) || [];
            if(partnerSummary) {
                let toplamIs = 0;
                db.forEach(io => {
                    toplamIs += tamamlananDb.filter(t => trToUpper(t.musteriAd || t.firma || "") === trToUpper(io.ad) || trToUpper(t.firma || "") === trToUpper(io.sirket) || (t.kalemler && t.kalemler.some(k => trToUpper(k.kisi || "") === trToUpper(io.ad) || trToUpper(k.kisi || "") === trToUpper(io.sirket)))).length;
                });
                partnerSummary.innerHTML = `
                    <div class="partner-stat-box">
                        <div class="partner-stat-icon" style="background:rgba(158,42,43,0.12);color:var(--accent-red);"><i class="fa-solid fa-handshake"></i></div>
                        <div class="partner-stat-info">
                            <span class="partner-stat-value" style="color:var(--accent-red);">${db.length}</span>
                            <span class="partner-stat-label">Toplam Partner</span>
                        </div>
                    </div>
                    <div class="partner-stat-box">
                        <div class="partner-stat-icon" style="background:rgba(46,125,50,0.12);color:#2E7D32;"><i class="fa-solid fa-briefcase"></i></div>
                        <div class="partner-stat-info">
                            <span class="partner-stat-value" style="color:#2E7D32;">${toplamIs}</span>
                            <span class="partner-stat-label">Toplam Yapılan İş</span>
                        </div>
                    </div>
                `;
            }
            if(db.length === 0) { konteyner.innerHTML = tmEmptyStateHTML('<i class="fa-solid fa-handshake"></i>','Kayıtlı iş ortağı bulunmamaktadır.','Yeni bir iş ortağı eklemek için "İş Ortağı Ekle" butonunu kullanın.'); return; }

            const piyasaDb = JSON.parse(localStorage.getItem("tm_piyasa_db_v2")) || [];
            db.sort(function(a, b) {
                var aIs = tamamlananDb.filter(t => trToUpper(t.musteriAd || t.firma || "") === trToUpper(a.ad) || trToUpper(t.firma || "") === trToUpper(a.sirket) || (t.kalemler && t.kalemler.some(k => trToUpper(k.kisi || "") === trToUpper(a.ad) || trToUpper(k.kisi || "") === trToUpper(a.sirket)))).length;
                var bIs = tamamlananDb.filter(t => trToUpper(t.musteriAd || t.firma || "") === trToUpper(b.ad) || trToUpper(t.firma || "") === trToUpper(b.sirket) || (t.kalemler && t.kalemler.some(k => trToUpper(k.kisi || "") === trToUpper(b.ad) || trToUpper(k.kisi || "") === trToUpper(b.sirket)))).length;
                return bIs - aIs;
            });
            db.forEach(io => {
                let bankaHTML = "";
                if(io.bankalar && io.bankalar.length > 0) {
                    io.bankalar.forEach(b => { 
                        const bankaRenk = getBankaRenkKodu(b.banka);
                        const ibanFormatted = (b.iban || '').replace(/(.{4})/g, '$1 ').trim();
                        bankaHTML += `<div class="partner-banka-item" style="border-left:3px solid ${bankaRenk};">
                            <div class="partner-banka-name" style="color:${bankaRenk};"><i class="fa-solid fa-university"></i> ${b.banka}</div>
                            <div class="partner-banka-iban" style="color:${bankaRenk};"><i class="fa-solid fa-arrow-right"></i> ${ibanFormatted}</div>
                        </div>`; 
                    });
                } else { bankaHTML = '<div class="partner-banka-item partner-banka-empty"><i class="fa-solid fa-circle-exclamation"></i> Banka hesabı girilmemiş</div>'; }

                const isSayisi = tamamlananDb.filter(t => trToUpper(t.musteriAd || t.firma || "") === trToUpper(io.ad) || trToUpper(t.firma || "") === trToUpper(io.sirket) || (t.kalemler && t.kalemler.some(k => trToUpper(k.kisi || "") === trToUpper(io.ad) || trToUpper(k.kisi || "") === trToUpper(io.sirket)))).length;

                const statusIcon = io.status === 'Sürekli Partner' ? '<span class="partner-badge partner-badge-star"><i class="fa-solid fa-crown"></i> Sürekli Çözüm Ortağı</span>' : (io.status === 'Proje Bazlı' ? '<span class="partner-badge partner-badge-proje"><i class="fa-solid fa-diagram-project"></i> Proje Bazlı Partner</span>' : `<span class="partner-badge">${io.status}</span>`);
                const surekliClass = io.status === 'Sürekli Partner' ? ' partner-card-surekli' : '';

                konteyner.innerHTML += `
                    <div class="portfolio-card partner-card-item${surekliClass}">
                        <div class="partner-card-top">
                            <div class="partner-card-avatar">
                                <i class="fa-solid fa-user-tie"></i>
                            </div>
                            <div class="partner-card-header">
                                <h4 class="p-search-ad">${io.ad}</h4>
                                <div class="partner-card-brans p-search-brans"><i class="fa-solid fa-ruler-combined"></i> ${io.brans}</div>
                            </div>
                            <div class="partner-card-jobcount">
                                <span class="partner-jobcount-num">${isSayisi}</span>
                                <span class="partner-jobcount-label">İŞ</span>
                            </div>
                        </div>
                        <div class="partner-card-divider"></div>
                        <div class="partner-card-body">
                            <div class="partner-card-info">
                                <span class="partner-info-icon"><i class="fa-solid fa-building"></i></span>
                                <div><span class="partner-info-label">Firma</span><span class="partner-info-val p-search-sirket">${io.sirket}</span></div>
                            </div>
                            <div class="partner-card-info">
                                <span class="partner-info-icon"><i class="fa-solid fa-briefcase"></i></span>
                                <div><span class="partner-info-label">Ünvan</span><span class="partner-info-val">${io.unvan || '-'}</span></div>
                            </div>
                            <div class="partner-card-info">
                                <span class="partner-info-icon"><i class="fa-solid fa-tag"></i></span>
                                <div><span class="partner-info-label">Statü</span><span class="partner-info-val">${statusIcon}</span></div>
                            </div>
                            <div class="partner-card-info">
                                <span class="partner-info-icon"><i class="fa-solid fa-phone"></i></span>
                                <div><span class="partner-info-label">Telefon</span><span class="partner-info-val">${io.tel}</span></div>
                            </div>
                            <div class="partner-card-info">
                                <span class="partner-info-icon"><i class="fa-solid fa-envelope"></i></span>
                                <div><span class="partner-info-label">E-Posta</span><span class="partner-info-val">${io.eposta}</span></div>
                            </div>
                            <div class="partner-card-info">
                                <span class="partner-info-icon"><i class="fa-solid fa-id-card"></i></span>
                                <div><span class="partner-info-label">T.C. Kimlik</span><span class="partner-info-val p-search-kimlik">${io.kimlik || '-'}</span></div>
                            </div>
                            <div class="partner-card-info">
                                <span class="partner-info-icon"><i class="fa-solid fa-file-invoice"></i></span>
                                <div><span class="partner-info-label">Vergi Dairesi</span><span class="partner-info-val">${io.vergiDairesi || '-'}</span></div>
                            </div>
                            <div class="partner-card-info">
                                <span class="partner-info-icon"><i class="fa-solid fa-file-invoice"></i></span>
                                <div><span class="partner-info-label">Vergi No</span><span class="partner-info-val">${io.vergiNo || '-'}</span></div>
                            </div>
                            <div class="partner-card-info">
                                <span class="partner-info-icon"><i class="fa-solid fa-location-dot"></i></span>
                                <div><span class="partner-info-label">Adres</span><span class="partner-info-val p-search-adres">${io.adres || '-'}</span></div>
                            </div>
                            <div class="partner-card-info" style="align-items:flex-start;">
                                <span class="partner-info-icon" style="margin-top:3px;"><i class="fa-solid fa-building-columns"></i></span>
                                <div style="flex:1;">
                                    <span class="partner-info-label">Banka Hesapları</span>
                                    <div class="partner-banka-list">${bankaHTML}</div>
                                </div>
                            </div>
                        </div>
                        <div class="partner-card-actions">
                            <button class="partner-btn partner-btn-files" onclick="pbPopupAc(${io.id}, 'partner')"><i class="fa-regular fa-folder"></i> Dosyalar</button>
                            <div class="partner-card-actions-right">
                                <button class="partner-btn partner-btn-edit" onclick="partnerDuzenle(${io.id})"><i class="fa-solid fa-pen"></i> Düzenle</button>
                                <button class="partner-btn partner-btn-delete" onclick="portfolioKartSil('tm_isortaklari_db', ${io.id}, 'partner')"><i class="fa-solid fa-trash-can"></i> Sil</button>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        function partnerleriFiltrele() {
            const kelime = trToUpper(document.getElementById("partnerAramaInput").value.trim());
            document.querySelectorAll("#isOrtaklariKartlariKonteyner .partner-card-item").forEach((kart) => {
                const ad = trToUpper(kart.querySelector(".p-search-ad").innerText);
                const brans = trToUpper(kart.querySelector(".p-search-brans").innerText);
                const sirket = trToUpper(kart.querySelector(".p-search-sirket").innerText);
                const kimlik = trToUpper(kart.querySelector(".p-search-kimlik").innerText);
                const adres = trToUpper(kart.querySelector(".p-search-adres").innerText);
                
                if (ad.includes(kelime) || brans.includes(kelime) || sirket.includes(kelime) || kimlik.includes(kelime) || adres.includes(kelime)) {
                    kart.style.display = "flex";
                } else {
                    kart.style.display = "none";
                }
            });
        }

        function portfolioKartSil(dbName, id, tip) {
            tmConfirm("Bu profil kartını sistemden kalıcı olarak silmek istediğinize emin misiniz?", function() {
                var db, silinenAd = "";
                try { db = JSON.parse(localStorage.getItem(dbName)) || []; } catch(e) { db = []; console.error("Portfolio kart yukleme hatasi:", e); }
                var silinen = db.find(function(item) { return item.id === id; });
                if (silinen) silinenAd = silinen.ad || "";
                db = db.filter(item => item.id !== id);
                try { localStorage.setItem(dbName, JSON.stringify(db)); } catch(e) { console.error("Portfolio kart silme hatasi:", e); return; }
                if(tip === 'musteri') { musteriKartlariniYenile(); aktiviteEkle("Müşteri silindi: " + silinenAd, "Portföy"); }
                if(tip === 'partner') { isOrtaklariKartlariniYenile(); aktiviteEkle("İş ortağı silindi: " + silinenAd, "Portföy"); }
            });
        }

        /* ================= PORTFOLYODOSYA YONETIMI (Cloudinary) ================= */
        const PB_CLOUD_NAME = "n5dhadej";
        const PB_UPLOAD_PRESET = "tm-portal";
        const PB_DOSYA_DB_KEY = "tm_portfolio_dosyalari";

        function pbDosyaVerileriniYukle() {
            try { return JSON.parse(localStorage.getItem(PB_DOSYA_DB_KEY)) || []; } catch(e) { return []; }
        }

        function pbDosyaVerileriniKaydet(data) {
            try { localStorage.setItem(PB_DOSYA_DB_KEY, JSON.stringify(data)); } catch(e) { console.error("Dosya veri kaydetme hatasi:", e); }
        }

        function pbDosyaYukle(kartId, tur) {
            var input = document.createElement('input');
            input.type = 'file';
            input.accept = '.pdf,.PDF';
            input.onchange = function(e) {
                var file = e.target.files[0];
                if (!file) return;
                if (file.name.toLowerCase().indexOf('.pdf') === -1) { tmNotify("Yalnızca PDF dosyaları yüklenebilir!", "error"); return; }
                if (file.size > 10 * 1024 * 1024) { tmNotify("Dosya boyutu 10MB'dan buyuk olamaz! Mevcut plan nedeniyle 10MB siniri vardir.", "error"); return; }

                tmLoadingGoster("Dosya yukleniyor...");
                var fd = new FormData();
                fd.append("file", file);
                fd.append("upload_preset", PB_UPLOAD_PRESET);
                var orjAd = file.name.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9çÇğĞıİöÖşŞüÜ\s_-]/g, '_').trim();
                var uniqueId = Date.now().toString(36).slice(-4) + Math.random().toString(36).substr(2, 4);
                fd.append("public_id", orjAd + '_' + uniqueId);
                fetch("https://api.cloudinary.com/v1_1/" + PB_CLOUD_NAME + "/auto/upload", {
                    method: "POST", body: fd
                }).then(function(r) { return r.json(); }).then(function(j) {
                    tmLoadingGizle();
                    if (j.secure_url) {
                        var fileId = Date.now() + "_" + Math.random().toString(36).substr(2, 6);
                        var db = pbDosyaVerileriniYukle();
                        db.push({ id: fileId, kartId: kartId, tur: tur, fileName: file.name, downloadURL: j.secure_url, fileSize: j.bytes, uploadDate: new Date().toISOString() });
                        pbDosyaVerileriniKaydet(db);
                        tmNotify("Dosya basariyla yuklendi: " + file.name, "success");
                        pbDosyaPopupGuncelle(kartId, tur);
                    } else {
                        tmNotify("Hata: " + ((j.error && j.error.message) || "Bilinmeyen hata"), "error");
                    }
                }).catch(function(err) {
                    tmLoadingGizle();
                    tmNotify("Baglanti hatasi: " + (err.message || err), "error");
                });
            };
            input.click();
        }

        function pbDosyaSil(kartId, fileId, tur) {
            var db = pbDosyaVerileriniYukle();
            var f = db.find(function(x) { return x.id === fileId && x.kartId === kartId && x.tur === tur; });
            if (!f) { tmNotify("Dosya bulunamadi!", "error"); return; }

            tmConfirm("Bu dosyayi silmek istediginize emin misiniz?", function() {
                db = pbDosyaVerileriniYukle().filter(function(x) { return !(x.id === fileId && x.kartId === kartId && x.tur === tur); });
                pbDosyaVerileriniKaydet(db);
                tmNotify("Dosya silindi.", "success");
                pbDosyaPopupGuncelle(kartId, tur);
            });
        }

        function pbPopupAc(kartId, tur) {
            var popup = document.getElementById("pbDosyaPopupOverlay");
            if (!popup) return;
            popup.dataset.kartId = kartId;
            popup.dataset.tur = tur;

            var dbKey = tur === "musteri" ? "tm_musteriler_db" : "tm_isortaklari_db";
            var db;
            try { db = JSON.parse(localStorage.getItem(dbKey)) || []; } catch(e) { db = []; }
            var kart = db.find(function(k) { return k.id === kartId; });
            var kartAdi = kart ? (kart.ad || "") : "";
            var turAdi = tur === "musteri" ? "MÜŞTERİ" : "İŞ ORTAĞI";
            document.getElementById("pbPopupTitle").innerHTML = '<i class="fa-regular fa-folder"></i> DOSYALAR - ' + turAdi + ': ' + kartAdi;

            pbDosyaPopupGuncelle(kartId, tur);
            popup.style.display = "flex";
        }

        function pbPopupKapat() {
            var popup = document.getElementById("pbDosyaPopupOverlay");
            if (popup) popup.style.display = "none";
        }

        function pbDosyaIndir(url, fileName) {
            if (url.indexOf('res.cloudinary.com') > -1 && 'serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(function() {
                    window.location.href = '_download?url=' + encodeURIComponent(url) + '&name=' + encodeURIComponent(fileName);
                }).catch(function() {
                    window.open(url, '_blank');
                });
            } else {
                window.open(url, '_blank');
            }
        }

        function pbDosyaPopupGuncelle(kartId, tur) {
            var listeEl = document.getElementById("pbDosyaListesi");
            if (!listeEl) return;
            var dosyaDb = pbDosyaVerileriniYukle();
            var kartDosyalari = dosyaDb.filter(function(f) { return f.kartId === kartId && f.tur === tur; });

            if (kartDosyalari.length === 0) {
                listeEl.innerHTML = '<div style="text-align:center;padding:30px 20px;color:#888;font-size:14px;">Henüz dosya yüklenmemiş.<br><small>PDF formatında belgelerinizi yüklemek için "Dosya Yükle" butonunu kullanın.</small></div>';
                return;
            }

            var html = '';
            kartDosyalari.sort(function(a, b) { return (b.uploadDate || "").localeCompare(a.uploadDate || ""); });
            kartDosyalari.forEach(function(f) {
                var tarih = f.uploadDate ? new Date(f.uploadDate).toLocaleDateString("tr-TR", {day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'}) : "-";
                var boyut = f.fileSize ? (f.fileSize / 1024).toFixed(1) + " KB" : "-";
                html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;margin-bottom:6px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-card);gap:10px;">'
                    + '<div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;">'
                    + '<span style="font-size:22px;"><i class="fa-regular fa-file-lines"></i></span>'
                    + '<div style="min-width:0;"><div style="font-size:13px;font-weight:600;color:var(--text-dark);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(f.fileName) + '</div>'
                    + '<div style="font-size:11px;color:var(--text-light);">' + boyut + ' · ' + tarih + '</div></div></div>'
                    + '<div style="display:flex;gap:6px;flex-shrink:0;">'
                    + '<button class="btn btn-primary btn-sm" onclick="pbDosyaIndir(\'' + f.downloadURL.replace(/'/g, "\\'") + '\', \'' + f.fileName.replace(/'/g, "\\'") + '\')" style="padding:5px 12px;font-size:11px;"><i class="fa-solid fa-inbox"></i> İndir</button>'
                    + '<button class="btn-danger btn-sm" onclick="pbDosyaSil(' + kartId + ', \'' + f.id + '\', \'' + tur + '\')" style="padding:5px 12px;font-size:11px;"><i class="fa-solid fa-trash-can"></i> Sil</button>'
                    + '</div></div>';
            });
            listeEl.innerHTML = html;
        }

        /* ================= ŞİRKET BİLGİLERİ & LOGO ================= */
        function sirketBilgileriYukle() {
            var aktifAlan = document.activeElement;
            var ciIds = ["ciAd","ciTelefon","ciGsm","ciVergiDaire","ciVergiNo","ciEmail","ciImzaAd","ciAdres","ciDilekceAltBilgi","newUsername","newPassword","newTitle"];
            for (var i = 0; i < ciIds.length; i++) { if (aktifAlan && aktifAlan.id === ciIds[i]) return; }
            var d = {};
            try { d = JSON.parse(localStorage.getItem("tm_sirket_bilgileri")) || {}; } catch(e) { d = {}; }
            ["ad","telefon","gsm","vergiDaire","vergiNo","email","imzaAd","adres","dilekceAltBilgi"].forEach(function(k) {
                var el = document.getElementById("ci" + k.charAt(0).toUpperCase() + k.slice(1));
                if (el && d[k]) el.value = d[k];
            });
            var logoData = localStorage.getItem("tm_sirket_logo");
            if (logoData) {
                document.getElementById("logoPreview").innerHTML = '<img src="' + logoData + '" alt="Logo">';
            }
            sidebardaLogoyuGoster();
        }
        function sirketBilgileriKaydet() {
            var d = {
                ad: document.getElementById("ciAd").value.trim(),
                telefon: document.getElementById("ciTelefon").value.trim(),
                gsm: document.getElementById("ciGsm").value.trim(),
                vergiDaire: document.getElementById("ciVergiDaire").value.trim(),
                vergiNo: document.getElementById("ciVergiNo").value.trim(),
                email: document.getElementById("ciEmail").value.trim(),
                imzaAd: document.getElementById("ciImzaAd").value.trim(),
                adres: document.getElementById("ciAdres").value.trim(),
                dilekceAltBilgi: document.getElementById("ciDilekceAltBilgi").value.trim()
            };
            localStorage.setItem("tm_sirket_bilgileri", JSON.stringify(d));
            sidebardaLogoyuGoster();
            var msg = document.getElementById("ciKayitMsg");
            msg.style.display = "inline";
            setTimeout(function(){ msg.style.display = "none"; }, 2000);
        }
        function logoDosyaSecildi(ev) {
            var file = ev.target.files[0];
            if (!file) return;
            if (file.size > 500 * 1024) { tmAlert("Dosya çok büyük! Maksimum 500KB."); return; }
            var reader = new FileReader();
            reader.onload = function(e) {
                var data = e.target.result;
                localStorage.setItem("tm_sirket_logo", data);
                document.getElementById("logoPreview").innerHTML = '<img src="' + data + '" alt="Logo">';
                sidebardaLogoyuGoster();
            };
            reader.readAsDataURL(file);
        }
        function logoyuTemizle() {
            localStorage.removeItem("tm_sirket_logo");
            document.getElementById("logoPreview").innerHTML = '<div class="logo-placeholder">Logo yüklemek için tıklayın (PNG/JPG)</div>';
            sidebardaLogoyuGoster();
        }
        function sidebardaLogoyuGoster() {
            var logoData = localStorage.getItem("tm_multi_logo_3");
            var ci = {};
            try { ci = JSON.parse(localStorage.getItem("tm_sirket_bilgileri")) || {}; } catch(e) { ci = {}; }
            var header = document.querySelector(".sidebar-header");
            if (!header) return;
            if (logoData) {
                header.innerHTML = '<div style="padding:10px 5px 5px 5px;text-align:center;"><img src="' + logoData + '" class="sidebar-logo-img" alt="Logo"></div>';
            } else {
                header.innerHTML = '<h3>TM-PORTAL</h3><p>' + (ci.ad || "TURAK MİMARLIK") + '</p>';
            }
        }
        function multiLogoGridRender() {
            var grid = document.getElementById("multiLogoGrid");
            if (!grid) return;
            var html = "";
            for (var i = 1; i <= 10; i++) {
                var saved = localStorage.getItem("tm_multi_logo_" + i);
                var preview = saved ? '<img src="' + saved + '" alt="Logo ' + i + '">' : '<div class="logo-placeholder">Logo #' + i + ' yüklemek için tıklayın</div>';
                html += '<div class="multi-logo-item">';
                html += '<div style="font-weight:700;font-size:14px;margin-bottom:8px;color:var(--accent-red);">Logo #' + i + '</div>';
                html += '<div class="logo-upload-area" style="margin:0;" onclick="document.getElementById(\'mlFileInput' + i + '\').click()">';
                html += '<input type="file" id="mlFileInput' + i + '" accept="image/*" style="display:none" onchange="multiLogoYukle(' + i + ', event)">';
                html += '<div id="mlPreview' + i + '">' + preview + '</div>';
                html += '<button type="button" class="btn btn-primary" onclick="event.stopPropagation(); multiLogoyuTemizle(' + i + ')" style="margin-top:8px; font-size:11px; padding:4px 12px;">Kaldır</button>';
                html += '</div></div>';
            }
            grid.innerHTML = html;
            multiLogolariFirebaseCek();
        }
        function multiLogoYukle(num, ev) {
            var file = ev.target.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function(e) {
                var img = new Image();
                img.onload = function() {
                    var canvas = document.createElement("canvas");
                    var MAX_W = 200, MAX_H = 80;
                    var w = img.width, h = img.height;
                    if (w > MAX_W) { h = h * MAX_W / w; w = MAX_W; }
                    if (h > MAX_H) { w = w * MAX_H / h; h = MAX_H; }
                    canvas.width = w; canvas.height = h;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, w, h);
                    var data = canvas.toDataURL("image/png");
                    localStorage.setItem("tm_multi_logo_" + num, data);
                    document.getElementById("mlPreview" + num).innerHTML = '<img src="' + data + '" alt="Logo ' + num + '">';
            if (num === 3) { sidebardaLogoyuGoster(); loginLogoyuGoster(); }
                    if (fdb) {
                        fdb.collection("tm_sync").doc("multi_logo_" + num).set({ data: data }).then(function() {
                            tmNotify("Logo #" + num + " Firestore'a yedeklendi.", "success");
                        }).catch(function(e) {
                            tmNotify("Logo #" + num + " Firestore yedekleme hatası: " + e.message, "error");
                        });
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
        function multiLogoyuTemizle(num) {
            localStorage.removeItem("tm_multi_logo_" + num);
            document.getElementById("mlPreview" + num).innerHTML = '<div class="logo-placeholder">Logo #' + num + ' yüklemek için tıklayın</div>';
            if (num === 3) sidebardaLogoyuGoster();
        }
        function multiLogolariFirebaseCek() {
            if (!fdb) return;
            for (var i = 1; i <= 10; i++) {
                (function(idx) {
                    var mevcut = localStorage.getItem("tm_multi_logo_" + idx);
                    if (mevcut) return;
                    fdb.collection("tm_sync").doc("multi_logo_" + idx).get({ source: 'server' }).then(function(snap) {
                        if (snap && snap.exists) {
                            var raw = snap.data().data;
                            if (raw && raw !== "null" && raw.length > 100) {
                                localStorage.setItem("tm_multi_logo_" + idx, raw);
                                var preview = document.getElementById("mlPreview" + idx);
                                if (preview) preview.innerHTML = '<img src="' + raw + '" alt="Logo ' + idx + '">';
                                if (idx === 3) { sidebardaLogoyuGoster(); loginLogoyuGoster(); }
                            }
                        }
                    }).catch(function(e){ console.error("multiLogolariFirebaseCek", idx, e); });
                })(i);
            }
        }

        function sonYedekTarihiGoster() {
            var span = document.getElementById("sonYedekTarihi");
            if (!span) return;
            var kayitli = localStorage.getItem("tm_son_yedek_zamani");
            span.textContent = kayitli ? new Date(kayitli).toLocaleString('tr-TR') : "-";
        }
        function tmYedekAl() {
            try {
                var data = {};
                for (var i = 0; i < localStorage.length; i++) {
                    var k = localStorage.key(i);
                    if (k && k.startsWith("tm_")) data[k] = localStorage.getItem(k);
                }
                var simdi = new Date();
                localStorage.setItem("tm_son_yedek_zamani", simdi.toISOString());
                var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                var a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'TM-Portal_Yedek_' + simdi.toISOString().slice(0,10) + '.json';
                a.click();
                URL.revokeObjectURL(a.href);
                document.getElementById("yedekMsg").innerHTML = '<i class="fa-solid fa-check"></i> Yedek başarıyla indirildi.';
                var span = document.getElementById("sonYedekTarihi");
                if (span) span.textContent = simdi.toLocaleString('tr-TR');
            } catch(e) { console.error("Yedek alma hatasi:", e); tmNotify("Yedek alınırken hata oluştu: " + e.message, "error"); }
        }
        function tmYedekYukle(event) {
            var file = event.target.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function(e) {
                try {
                    var data = JSON.parse(e.target.result);
                    var sayac = 0;
                    Object.keys(data).forEach(function(k) {
                        if (k.startsWith("tm_")) {
                            localStorage.setItem(k, data[k]);
                            sayac++;
                        }
                    });
                    document.getElementById("yedekMsg").innerHTML = '<i class="fa-solid fa-check"></i> ' + sayac + ' veri geri yüklendi. Sayfa yenileniyor...';
                    setTimeout(function() { location.reload(); }, 1500);
                } catch(err) {
                    document.getElementById("yedekMsg").innerHTML = '<i class="fa-solid fa-xmark"></i> Hata: Geçersiz dosya.';
                }
            };
            reader.readAsText(file);
        }
        /* ================= PORTAL YÖNETİMİ ================= */
        function kullaniciKaydet() {
            try {
                const usr = document.getElementById("newUsername").value.trim().toUpperCase();
                const pas = document.getElementById("newPassword").value.trim();
                const ttl = document.getElementById("newTitle").value.trim() || "-";
                const editIndex = document.getElementById("editIndex").value;

                if (!usr || !pas) { tmNotify("Kullanıcı adı ve şifre alanları boş bırakılamaz!", "error"); return; }

                tmLoadingGoster('Kullanıcı kaydediliyor...');
                const secilenYetkiler = yetkiSecilenleriTopla();

                if (editIndex === "master_tugay") {
                    const mevcut = JSON.parse(localStorage.getItem("tm_admin_creds_final")) || {};
                    var email = document.getElementById("newEmail").value.trim().toLowerCase() || "";
                    const master = { usr: mevcut.usr || "TUGAYTURAK", pass: pas, title: trToUpper(ttl), email: email };
                    localStorage.setItem("tm_admin_creds_final", JSON.stringify(master));
                    tmLoadingGizle();
                    tmNotify("KURUCU ADMİN PROFİLİ BAŞARIYLA GÜNCELLENDİ.", "success");
                    aktiviteEkle("Admin profili güncellendi", "Yönetim");
                    formSifirla(); kullaniciListesiniYenile(); sidebarKullanicilariYenile(); return;
                }

                let altKullanicilar = JSON.parse(localStorage.getItem("tm_users_final_v8")) || [];
                if (editIndex === "-1") {
                    var masterAd = (JSON.parse(localStorage.getItem("tm_admin_creds_final")) || {}).usr || "TUGAYTURAK";
                    if (usr === masterAd || altKullanicilar.some(function(u){ return u.usr === usr; })) {
                        tmNotify("Bu kullanıcı adı sistemde zaten mevcut!", "error"); return;
                    }
                    var email = document.getElementById("newEmail").value.trim().toLowerCase() || "-";
                    altKullanicilar.push({ usr: usr, pas: pas, title: trToUpper(ttl), email: email, yetkiler: secilenYetkiler });
                } else {
                    var idx = parseInt(editIndex, 10);
                    altKullanicilar[idx].pas = pas;
                    altKullanicilar[idx].title = trToUpper(ttl);
                    altKullanicilar[idx].email = document.getElementById("newEmail").value.trim().toLowerCase() || "-";
                    altKullanicilar[idx].yetkiler = secilenYetkiler;
                }

                localStorage.setItem("tm_users_final_v8", JSON.stringify(altKullanicilar));
                formSifirla();
                kullaniciListesiniYenile();
                sidebarKullanicilariYenile();
                tmLoadingGizle();
                tmNotify("Kullanıcı veri kaydı başarıyla güncellendi.", "success");
                aktiviteEkle("Kullanıcı kaydedildi/güncellendi: " + usr, "Yönetim");
            } catch(e) { tmLoadingGizle(); tmNotify("HATA: " + e.message, "error"); }
        }

        function kullaniciDuzenle(index) {
            yetkiCheckboxlariniRenderEt();
            if (index === 'master_tugay') {
                const master = JSON.parse(localStorage.getItem("tm_admin_creds_final"));
                document.getElementById("formTitle").innerText = `Kurucu Şifre Değiştir`;
                document.getElementById("newUsername").value = "TUGAYTURAK";
                document.getElementById("newUsername").disabled = true;
                document.getElementById("newPassword").value = master.pass;
                document.getElementById("newTitle").value = master.title;
                document.getElementById("newEmail").value = master.email || "";
                document.getElementById("editIndex").value = "master_tugay";
                document.querySelectorAll("#yetkiCheckboxContainer input[type=checkbox]").forEach(function(cb){ cb.checked = true; });
            } else {
                const altKullanicilar = JSON.parse(localStorage.getItem("tm_users_final_v8")) || [];
                const seculenUser = altKullanicilar[index];
                document.getElementById("formTitle").innerText = `Kullanıcı Bilgilerini Düzenle`;
                document.getElementById("newUsername").value = seculenUser.usr;
                document.getElementById("newUsername").disabled = true;
                document.getElementById("newPassword").value = seculenUser.pas;
                document.getElementById("newTitle").value = seculenUser.title;
                document.getElementById("newEmail").value = seculenUser.email || "-";
                document.getElementById("editIndex").value = index;
                yetkiSecilenleriAyarla(seculenUser.yetkiler || []);
            }
            document.getElementById("btnSave").innerText = "DEĞİŞİKLİKLERİ UYGULA";
            document.getElementById("btnCancel").style.display = "inline-block";
        }

        function formSifirla() {
            document.getElementById("formTitle").innerText = "Yeni Kullanıcı Tanımla";
            document.getElementById("newUsername").value = "";
            document.getElementById("newUsername").disabled = false;
            document.getElementById("newPassword").value = "";
            document.getElementById("newTitle").value = "";
            document.getElementById("newEmail").value = "";
            document.getElementById("editIndex").value = "-1";
            document.getElementById("btnSave").innerText = "Kullanıcıyı Kaydet";
            document.getElementById("btnCancel").style.display = "none";
            yetkiCheckboxlariniRenderEt();
        }

        function kullaniciListesiniYenile() {
            const tbody = document.getElementById("userTableBody");
            if (!tbody) return; tbody.innerHTML = "";
            var master;
            try { master = JSON.parse(localStorage.getItem("tm_admin_creds_final")); } catch(e) { master = null; console.error("Admin bilgisi parse hatasi:", e); }
            if (!master) { tbody.innerHTML = '<tr><td colspan="6">Admin bilgisi bulunamadı</td></tr>'; return; }

            tbody.innerHTML += '<tr><td><b>TUGAYTURAK</b></td><td>' + master.pass + '</td><td><span style="font-weight:700;color:var(--accent-red)">' + master.title + '</span></td><td>' + (master.email || "-") + '</td><td>TÜM SAYFALAR (TAM YETKİ)</td><td><button class="btn-warning" onclick="kullaniciDuzenle(\'master_tugay\')">Düzenle</button></td></tr>';

            var altKullanicilar;
            try { altKullanicilar = JSON.parse(localStorage.getItem("tm_users_final_v8")) || []; } catch(e) { altKullanicilar = []; console.error("Kullanicilar parse hatasi:", e); }
            altKullanicilar.forEach((user, index) => {
                var yetkiStr = (user.yetkiler && Array.isArray(user.yetkiler)) ? user.yetkiler.join(', ').toUpperCase() : "YETKİ YOK";
                tbody.innerHTML += `<tr><td><b>${user.usr}</b></td><td>${user.pas}</td><td>${user.title}</td><td>${user.email || "-"}</td><td>${yetkiStr}</td><td><button class="btn-warning" onclick="kullaniciDuzenle(${index})">Düzenle</button> <button class="btn-danger" onclick="kullaniciSil(${index})">Sil</button></td></tr>`;
            });
        }

        function kullaniciSil(index) {
            try {
                let altKullanicilar = JSON.parse(localStorage.getItem("tm_users_final_v8")) || [];
                var silinenAd = altKullanicilar[index] ? altKullanicilar[index].usr : "";
                tmConfirm("Bu kullanıcıyı listeden tamamen silmek istediğinize emin misiniz?", function() {
                    altKullanicilar.splice(index, 1);
                    localStorage.setItem("tm_users_final_v8", JSON.stringify(altKullanicilar));
                    kullaniciListesiniYenile();
                    sidebarKullanicilariYenile();
                    tmNotify("Kullanıcı silindi.", "success");
                    aktiviteEkle("Kullanıcı silindi: " + silinenAd, "Yönetim");
                });
            } catch(e) { console.error("kullaniciSil hatasi:", e); tmNotify("Silme hatası: " + e.message, "error"); }
        }

        function girisCikisLogla(kullanici, islem) {
            var log;
            try { log = JSON.parse(localStorage.getItem("tm_giris_cikis_log")) || []; } catch(e) { log = []; console.error("Log yukleme hatasi:", e); }
            const simdi = new Date();
            const tarihSaat = simdi.toLocaleDateString("tr-TR") + " " + simdi.toLocaleTimeString("tr-TR", {hour: "2-digit", minute: "2-digit", second: "2-digit"});
            log.unshift({ kullanici: kullanici.toUpperCase(), islem: islem, zaman: tarihSaat });
            if (log.length > 50) log = log.slice(0, 50);
            try { localStorage.setItem("tm_giris_cikis_log", JSON.stringify(log)); } catch(e) { console.error("Log kaydetme hatasi:", e); }
        }

        function girisCikisLogListele() {
            const tbody = document.getElementById("girisCikisLogBody");
            if (!tbody) return;
            const log = JSON.parse(localStorage.getItem("tm_giris_cikis_log") || "[]");
            tbody.innerHTML = log.map(function(k) {
                const renk = k.islem === "GİRİŞ" ? "var(--btn-green)" : "var(--accent-red)";
                return '<tr><td>' + k.kullanici + '</td><td style="color:' + renk + ';font-weight:700;">' + k.islem + '</td><td>' + k.zaman + '</td></tr>';
            }).join("");
        }

        function sidebarKullanicilariYenile() {
            const container = document.getElementById("sidebarKullanicilar");
            if (!container) return;
            var master, altKullanicilar;
            try { master = JSON.parse(localStorage.getItem("tm_admin_creds_final")) || {}; } catch(e) { master = {}; console.error("Sidebar master parse:", e); }
            try { altKullanicilar = JSON.parse(localStorage.getItem("tm_users_final_v8")) || []; } catch(e) { altKullanicilar = []; console.error("Sidebar kullanici parse:", e); }
            const simdi = Date.now();
            let html = "";
            var tugayOnline = tmOnlineCache["TUGAYTURAK"] && (simdi - tmOnlineCache["TUGAYTURAK"]) < 10000;
            html += '<div class="sidebar-user-item"><span class="user-status-dot ' + (tugayOnline ? "online" : "offline") + '"></span><span class="user-name">TUGAYTURAK</span><span class="user-title">' + (master.title || "KURUCU") + '</span></div>';
            altKullanicilar.forEach(function(u) {
                var isOnline = tmOnlineCache[u.usr] && (simdi - tmOnlineCache[u.usr]) < 10000;
                html += '<div class="sidebar-user-item"><span class="user-status-dot ' + (isOnline ? "online" : "offline") + '"></span><span class="user-name">' + u.usr + '</span><span class="user-title">' + (u.title || "") + '</span></div>';
            });
            container.innerHTML = html;
        }
        var tmOnlineCache = {};
        var tmOnlineHeartbeatTimer = null;
        var tmOnlinePullTimer = null;
        function tmOnlineHeartbeatBaslat(kullanici) {
            tmOnlineHeartbeatDurdur();
            if (!fdb) return;
            function heartbeat() {
                fdb.collection("tm_online").doc(kullanici).set({ onlineAt: Date.now() }).catch(function(e){ console.error("Online heartbeat hatasi:", e); });
            }
            heartbeat();
            tmOnlineHeartbeatTimer = setInterval(heartbeat, 3000);
        }
        function tmOnlineHeartbeatDurdur() {
            if (tmOnlineHeartbeatTimer) { clearInterval(tmOnlineHeartbeatTimer); tmOnlineHeartbeatTimer = null; }
        }
        function tmOnlinePullBaslat() {
            if (tmOnlinePullTimer) clearInterval(tmOnlinePullTimer);
            if (!fdb) return;
            function pull() {
                fdb.collection("tm_online").get().then(function(snap) {
                    var cache = {};
                    snap.forEach(function(doc) {
                        var data = doc.data();
                        if (data && data.onlineAt) cache[doc.id] = data.onlineAt;
                    });
                    tmOnlineCache = cache;
                    sidebarKullanicilariYenile();
                }).catch(function(e){ console.error("Online kullanici pull hatasi:", e); });
            }
            pull();
            tmOnlinePullTimer = setInterval(pull, 3000);
        }
        function tmOnlineCikisYap(kullanici) {
            tmOnlineHeartbeatDurdur();
            if (!fdb) return;
            fdb.collection("tm_online").doc(kullanici).delete().catch(function(e){ console.error("Online cikis hatasi:", e); });
        }

        /* ================= TÜRKİYE RESMİ TATİLLER ================= */
        function asGetTatiller(yil) {
            var t = [];
            t.push({date:yil+"-01-01",name:"Yılbaşı"});
            t.push({date:yil+"-04-23",name:"Ulusal Egemenlik ve Çocuk Bayramı"});
            t.push({date:yil+"-05-01",name:"Emek ve Dayanışma Günü"});
            t.push({date:yil+"-05-19",name:"Atatürk'ü Anma, Gençlik ve Spor Bayramı"});
            t.push({date:yil+"-07-15",name:"Demokrasi ve Milli Birlik Günü"});
            t.push({date:yil+"-08-30",name:"Zafer Bayramı"});
            t.push({date:yil+"-10-29",name:"Cumhuriyet Bayramı"});
            var dini = asGetDiniTatiller(yil);
            dini.forEach(function(h){ t.push(h); });
            return t;
        }
        function asGetDiniTatiller(yil) {
            var t = [];
            var hy = Math.floor((yil - 622) * 365.25 / 354.367) + 1;
            for (var yi = hy - 1; yi <= hy + 1; yi++) {
                var r = asIslamiToMiladi(yi, 10, 1);
                if (r && r.yil === yil) { for (var d=0;d<3;d++){ var dt=new Date(r.dt); dt.setDate(dt.getDate()+d); t.push({date:dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0'),name:d===0?'Ramazan Bayramı (1. Gün)':d===1?'Ramazan Bayramı (2. Gün)':'Ramazan Bayramı (3. Gün)'}); } }
                var k = asIslamiToMiladi(yi, 12, 10);
                if (k && k.yil === yil) { for (var d=0;d<4;d++){ var dt=new Date(k.dt); dt.setDate(dt.getDate()+d); t.push({date:dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0'),name:d===0?'Kurban Bayramı (1. Gün)':d===1?'Kurban Bayramı (2. Gün)':d===2?'Kurban Bayramı (3. Gün)':'Kurban Bayramı (4. Gün)'}); } }
            }
            return t;
        }
        function asIslamiToMiladi(hY, hM, hD) {
            var jd = Math.floor((11 * hY + 3) / 30) + 354 * hY + 30 * hM - Math.floor((hM - 1) / 2) + hD + 1948440 - 385;
            var j = jd - 1721119;
            var y = Math.floor((4 * j - 1) / 146097);
            j = 4 * j - 1 - 146097 * y;
            var d = Math.floor(j / 4);
            j = Math.floor((4 * d + 3) / 1461);
            d = 4 * d + 3 - 1461 * j;
            d = Math.floor((d + 4) / 4);
            var m = Math.floor((5 * d - 3) / 153);
            d = 5 * d - 3 - 153 * m;
            d = Math.floor((d + 5) / 5);
            var gY = 100 * y + j;
            var gM = m < 10 ? m + 3 : m - 9;
            var gD = d + 1;
            return { yil: gY, ay: gM, gun: gD, dt: new Date(gY, gM - 1, gD) };
        }

        /* ================= ANA SAYFA ÖZET TAKVİM & GÖREVLER ================= */
        function asOzetTakvimRender() {
            const container = document.getElementById("asOzetTakvim");
            if (!container) return;
            const bugun = new Date();
            const yil = bugun.getFullYear(), ay = bugun.getMonth();
            const ayAdlari = ["OCAK","ŞUBAT","MART","NİSAN","MAYIS","HAZİRAN","TEMMUZ","AĞUSTOS","EYLÜL","EKİM","KASIM","ARALIK"];
            const ayGun = new Date(yil, ay + 1, 0).getDate();
            const etkinlikler = asGetMergedEvents();
            const tatiller = asGetTatiller(yil);
            var gunler = {};
            for (var g = 1; g <= ayGun; g++) {
                var ds = yil + "-" + String(ay + 1).padStart(2, "0") + "-" + String(g).padStart(2, "0");
                var t = tatiller.find(function(x) { return x.date === ds; });
                var e = etkinlikler.filter(function(x) { return x.date === ds; });
                if (t || e.length > 0) gunler[ds] = { tatil: t, etkinlikler: e, gunNo: g };
            }
            var keys = Object.keys(gunler).sort();
            let html = '<div style="font-size:12px;font-weight:700;margin-bottom:8px;letter-spacing:0.5px;color:var(--text-dark);">' + yil + ' ' + ayAdlari[ay] + ' - AYLIK LİSTE</div>';
            if (keys.length === 0) {
                html += '<div style="text-align:center;padding:16px 0;font-size:11px;color:var(--text-light);">Bu ay etkinlik veya resmi tatil bulunmamaktadır.</div>';
            } else {
                html += '<div style="max-height:300px;overflow-y:auto;">';
                keys.forEach(function(ds) {
                    var g = gunler[ds];
                    var dt = new Date(ds + "T12:00:00");
                    var gunAdi = dt.toLocaleDateString("tr-TR", { weekday: "short", day: "numeric" }).toUpperCase();
                    var bugunMu = ds === (bugun.getFullYear() + "-" + String(bugun.getMonth() + 1).padStart(2, "0") + "-" + String(bugun.getDate()).padStart(2, "0"));
                    html += '<div style="display:flex;align-items:flex-start;gap:8px;padding:5px 0;border-bottom:1px solid var(--border-color);' + (bugunMu ? 'background:rgba(158,42,43,0.08);border-radius:4px;padding:5px 6px;' : '') + '">';
                    html += '<span style="font-size:10px;font-weight:700;color:var(--text-light);min-width:62px;flex-shrink:0;padding-top:2px;' + (g.tatil ? 'color:#E53935;' : '') + '">' + gunAdi + '</span>';
                    html += '<div style="flex:1;display:flex;flex-wrap:wrap;gap:3px;">';
                    if (g.tatil) {
                        html += '<span style="font-size:10px;background:rgba(229,57,53,0.15);color:#E53935;font-weight:600;padding:1px 5px;border-radius:3px;"><i class="fa-solid fa-flag"></i> ' + g.tatil.name + '</span>';
                    }
                    g.etkinlikler.forEach(function(e) {
                        var renk = e.type === "reminder" ? "#E67E22" : (e.type === "note" ? "#95A5A6" : (e.type === "gorev" ? asGorevRenk(e.durum, e.tarih) : "#2B6CB0"));
                        var etk = e.title;
                        if (e.time && e.type !== "note" && !e.tumGun) etk = e.time + " " + etk;
                        else if (e.tumGun) etk = '<i class="fa-regular fa-calendar"></i> ' + etk;
                        if (e.paylas) etk = '<i class="fa-solid fa-users"></i>' + (e.paylasan || "") + ' ' + etk;
                        html += '<span style="font-size:10px;color:var(--text-dark);background:rgba(255,255,255,0.06);padding:1px 6px;border-radius:3px;white-space:nowrap;max-width:140px;overflow:hidden;text-overflow:ellipsis;" title="' + e.title.replace(/'/g,"&apos;") + '"><span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:' + renk + ';margin-right:3px;vertical-align:middle;"></span>' + etk + '</span>';
                    });
                    html += '</div></div>';
                });
                html += '</div>';
            }
            container.innerHTML = html;
        }
        function asOzetGorevListele() {
            const container = document.getElementById("asOzetGorev");
            if (!container) return;
            const aktifUser = localStorage.getItem("tm_active_user") || "";
            let gorevler = JSON.parse(localStorage.getItem("tm_gorevler")) || [];
            var benimGorevlerim = gorevler.filter(function(g) {
                var arr = Array.isArray(g.atanan) ? g.atanan : [g.atanan];
                return arr.indexOf(aktifUser) >= 0 && g.durum !== "tamamlandi";
            }).slice(0, 5);
            if (benimGorevlerim.length === 0) {
                container.innerHTML = '<div style="text-align:center;padding:16px 0;font-size:12px;color:var(--text-light);"><i class="fa-solid fa-check"></i> Bekleyen göreviniz bulunmamaktadır.</div>';
                return;
            }
            let html = '';
            benimGorevlerim.forEach(function(g) {
                const renk = asGorevRenk(g.durum, g.tarih);
                const etiket = asGorevDurumEtiketi(g.durum, g.tarih);
                html += '<div class="as-gorev-item" style="border-left:4px solid ' + renk + ';">';
                html += '<div class="as-gorev-text"><b>' + etiket + ' ' + g.baslik + '</b><br><small>' + g.veren + ' › ' + g.tarih + '</small></div></div>';
            });
            container.innerHTML = html;
        }

        /* ================= ANA SAYFA TAKVİM ================= */
        let asTakvimGorunum = "monthly";
        let asTakvimTarih = new Date();

        function asTakvimGorunumDegistir() {
            asTakvimGorunum = asTakvimGorunum === "monthly" ? "weekly" : "monthly";
            document.getElementById("asTakvimToggleBtn").innerHTML = asTakvimGorunum === "monthly" ? '<i class="fa-regular fa-calendar"></i> HAFTALIK GÖRÜNÜM' : '<i class="fa-regular fa-calendar"></i> AYLIK GÖRÜNÜM';
            asTakvimRender();
        }
        function asTakvimGeri() {
            if (asTakvimGorunum === "monthly") { asTakvimTarih.setMonth(asTakvimTarih.getMonth() - 1); }
            else { asTakvimTarih.setDate(asTakvimTarih.getDate() - 7); }
            asTakvimRender();
        }
        function asTakvimIleri() {
            if (asTakvimGorunum === "monthly") { asTakvimTarih.setMonth(asTakvimTarih.getMonth() + 1); }
            else { asTakvimTarih.setDate(asTakvimTarih.getDate() + 7); }
            asTakvimRender();
        }
        function asTakvimBugun() {
            asTakvimTarih = new Date();
            asTakvimRender();
        }
        function asGorevRenk(durum, tarih) {
            if (durum === "tamamlandi") return "#2E7D32";
            const bugun = new Date(); bugun.setHours(23,59,59,0);
            const hedef = new Date(tarih + "T23:59:59");
            return hedef < bugun ? "#C0392B" : "#F9A825";
        }
        function asGorevDurumEtiketi(durum, tarih) {
            if (durum === "tamamlandi") return '<i class="fa-solid fa-check"></i>';
            const bugun = new Date(); bugun.setHours(23,59,59,0);
            const hedef = new Date(tarih + "T23:59:59");
            return hedef < bugun ? '<i class="fa-solid fa-circle" style="color:#C0392B"></i>' : '<i class="fa-solid fa-list"></i>';
        }
        function asGetMergedEvents() {
            const aktifUser = localStorage.getItem("tm_active_user") || "";
            var etkinlikler = JSON.parse(localStorage.getItem("tm_as_etkinlikler_" + aktifUser)) || [];
            var paylasilan = JSON.parse(localStorage.getItem("tm_as_etkinlikler_paylasilan")) || [];
            paylasilan.forEach(function(e) {
                if (!etkinlikler.some(function(x) { return x.id === e.id; })) { etkinlikler.push(e); }
            });
            var expanded = [];
            etkinlikler.forEach(function(e) {
                if (e.tekrar && e.tekrar.tip) {
                    var start = new Date(e.date + "T00:00:00");
                    var end = new Date(start);
                    end.setFullYear(end.getFullYear() + 100);
                    var cur = new Date(start);
                    var istisnalar = e.tekrar.istisnalar || [];
                    while (cur <= end) {
                        var ds = cur.getFullYear() + "-" + String(cur.getMonth() + 1).padStart(2,"0") + "-" + String(cur.getDate()).padStart(2,"0");
                        if (istisnalar.indexOf(ds) < 0) {
                            expanded.push({ id: e.id, date: ds, time: e.time, title: e.title, description: e.description, type: e.type, tumGun: e.tumGun, paylas: e.paylas, paylasan: e.paylasan, tekrar: e.tekrar });
                        }
                        if (e.tekrar.tip === "weekly") cur.setDate(cur.getDate() + 7);
                        else if (e.tekrar.tip === "monthly") cur.setMonth(cur.getMonth() + 1);
                        else if (e.tekrar.tip === "yearly") cur.setFullYear(cur.getFullYear() + 1);
                        else break;
                    }
                } else {
                    expanded.push(e);
                }
            });
            const gorevler = JSON.parse(localStorage.getItem("tm_gorevler")) || [];
            var gorevEvents = gorevler.filter(function(g) {
                var atananlar = Array.isArray(g.atanan) ? g.atanan : [g.atanan];
                return atananlar.indexOf(aktifUser) >= 0 || g.veren === aktifUser;
            }).map(function(g) {
                var atananlar = Array.isArray(g.atanan) ? g.atanan : [g.atanan];
                var gorevIcin = atananlar.indexOf(aktifUser) >= 0 ? "" : (" › " + atananlar.join(", "));
                return { id: "gorev_" + g.id, date: g.tarih, time: "", title: g.baslik + (g.veren ? " (" + g.veren + gorevIcin + ")" : ""), description: g.mesaj || "", type: "gorev", durum: g.durum, tarih: g.tarih };
            });
            return expanded.concat(gorevEvents);
        }
        function asTakvimRender() {
            const container = document.getElementById("asTakvimIcerik");
            if (!container) return;
            if (asTakvimGorunum === "monthly") { asTakvimAylikRender(container); }
            else { asTakvimHaftalikRender(container); }
        }
        function asTakvimAylikRender(container) {
            const yil = asTakvimTarih.getFullYear(), ay = asTakvimTarih.getMonth();
            const ayAdlari = ["OCAK","ŞUBAT","MART","NİSAN","MAYIS","HAZİRAN","TEMMUZ","AĞUSTOS","EYLÜL","EKİM","KASIM","ARALIK"];
            document.getElementById("asTakvimBaslik").textContent = yil + " " + ayAdlari[ay];
            const ilkGun = new Date(yil, ay, 1).getDay();
            const ayGun = new Date(yil, ay + 1, 0).getDate();
            const oncekiAyGun = new Date(yil, ay, 0).getDate();
            const bugun = new Date();
            const etkinlikler = asGetMergedEvents();
            const tatiller = asGetTatiller(yil);
            var gunAdlari = ["PTS","SAL","ÇAR","PER","CUM","CMT","PAZ"];
            let html = '<table class="as-tbl"><thead><tr>';
            for (var di = 0; di < 7; di++) {
                var wc = di >= 5 ? ' class="as-th-weekend"' : '';
                html += '<th' + wc + '>' + gunAdlari[di] + '</th>';
            }
            html += '</tr></thead><tbody><tr>';
            for (let i = 0; i < (ilkGun === 0 ? 6 : ilkGun - 1); i++) {
                html += '<td class="as-td-other">' + (oncekiAyGun - (ilkGun === 0 ? 7 : ilkGun - 1) + 1 + i) + '</td>';
            }
            for (let g = 1; g <= ayGun; g++) {
                const gunStr = yil + "-" + String(ay + 1).padStart(2, "0") + "-" + String(g).padStart(2, "0");
                const gunIdx = ((ilkGun === 0 ? 6 : ilkGun - 1) + g - 1) % 7;
                const bugunMu = (bugun.getFullYear() === yil && bugun.getMonth() === ay && bugun.getDate() === g);
                const gunEtk = etkinlikler.filter(function(e) { return e.date === gunStr; });
                var tatil = tatiller.find(function(t){ return t.date === gunStr; });
                var cls = '';
                if (bugunMu) cls = 'as-day-today';
                if (gunIdx >= 5) cls = (cls ? cls + ' ' : '') + 'as-td-weekend';
                if (tatil) cls = (cls ? cls + ' ' : '') + 'as-td-tatil';
                html += '<td' + (cls ? ' class="' + cls + '"' : '') + ' onclick="asEventModalAc(\'' + gunStr + '\')">';
                html += '<span class="as-day-num">' + (tatil ? '<i class="fa-solid fa-flag"></i> ' : '') + g + '</span>';
                if (tatil) { var kisaAd = tatil.name.replace(/Bayramı.*/,'Bay.').replace(/\(.*?\)/g,'').trim(); html += '<div class="as-tatil-etiketi" title="' + tatil.name + '">' + kisaAd + '</div>'; }
                if (gunEtk.length > 0) {
                    html += '<div class="as-event-dots">';
                    gunEtk.slice(0,5).forEach(function(e) {
                        const renk = e.type === "reminder" ? "#E67E22" : (e.type === "note" ? "#95A5A6" : (e.type === "gorev" ? asGorevRenk(e.durum, e.tarih) : "#2B6CB0"));
                        var etkLabel = e.title;
                        if (e.paylas) etkLabel = (e.paylasan ? '<i class="fa-solid fa-users"></i>' + e.paylasan + ' ' : '<i class="fa-solid fa-users"></i>') + etkLabel;
                        html += '<span class="as-event-dot" onclick="event.stopPropagation();asGosterGunBilgi(\'' + gunStr + '\')" title="' + e.title.replace(/'/g,"&apos;") + '"><span class="as-dot-c" style="background:' + renk + ';"></span>' + etkLabel + '</span>';
                    });
                    if (gunEtk.length > 5) html += '<span class="as-event-dot" style="color:var(--text-light);font-size:8px;" onclick="event.stopPropagation();asGosterGunBilgi(\'' + gunStr + '\')">+' + (gunEtk.length - 5) + ' daha</span>';
                    html += '</div>';
                }
                html += '</td>';
                if ((ilkGun === 0 ? 6 : ilkGun - 1) + g > 0 && ((ilkGun === 0 ? 6 : ilkGun - 1) + g) % 7 === 0) html += '</tr><tr>';
            }
            const kalan = 7 - (((ilkGun === 0 ? 6 : ilkGun - 1) + ayGun) % 7 || 7);
            for (let i = 1; i <= kalan; i++) { html += '<td class="as-td-other">' + i + '</td>'; }
            html += '</tr></tbody></table>';
            container.innerHTML = html;
            var ayBas = yil + "-" + String(ay + 1).padStart(2, "0") + "-01";
            var ayBit = yil + "-" + String(ay + 1).padStart(2, "0") + "-" + String(ayGun).padStart(2, "0");
            asOzetRender(etkinlikler, tatiller, ayBas, ayBit);
        }
        function asTakvimHaftalikRender(container) {
            const yil = asTakvimTarih.getFullYear(), ay = asTakvimTarih.getMonth();
            const bugun = asTakvimTarih.getDate();
            const haftaBas = new Date(yil, ay, bugun - ((asTakvimTarih.getDay() || 7) - 1));
            document.getElementById("asTakvimBaslik").textContent = haftaBas.toLocaleDateString("tr-TR") + " HAFTASI";
            const etkinlikler = asGetMergedEvents();
            const tatiller = asGetTatiller(haftaBas.getFullYear());
            const saatler = ["08","09","10","11","12","13","14","15","16","17","18","19","20"];
            let html = '<table class="as-tbl"><thead><tr><th style="width:30px;"></th>';
            for (let i = 0; i < 7; i++) {
                const d = new Date(haftaBas); d.setDate(haftaBas.getDate() + i);
                const gnAd = ["PTS","SAL","ÇAR","PER","CUM","CMT","PAZ"][i];
                const bugunMu = (new Date().getFullYear() === d.getFullYear() && new Date().getMonth() === d.getMonth() && new Date().getDate() === d.getDate());
                var gunStr2 = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
                var tatil = tatiller.find(function(t){ return t.date === gunStr2; });
                var haftaCls = i >= 5 ? ' style="color:var(--text-light);background:rgba(255,255,255,0.04);"' : '';
                html += '<th' + (bugunMu ? ' style="color:var(--accent-red);"' : haftaCls) + '>' + gnAd + ' ' + d.getDate() + (tatil ? ' <i class="fa-solid fa-flag"></i>' : '') + '</th>';
            }
            html += '</tr></thead><tbody>';
            /* Tüm Gün satırı */
            html += '<tr><td style="padding:2px;text-align:center;font-size:7px;color:var(--text-light);border:1px solid var(--border-color);font-weight:600;background:rgba(255,255,255,0.03);"><i class="fa-regular fa-calendar"></i> TÜM GÜN</td>';
            for (let i = 0; i < 7; i++) {
                const d = new Date(haftaBas); d.setDate(haftaBas.getDate() + i);
                const gunStr = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
                const tumGunEtk = etkinlikler.filter(function(e) { return e.date === gunStr && (!e.time || e.tumGun || e.type === "note"); });
                var tumGunCls = i >= 5 ? ' style="background:rgba(255,255,255,0.02);padding:1px;border:1px solid var(--border-color);vertical-align:top;overflow:hidden;cursor:pointer;position:relative;"' : ' style="padding:1px;border:1px solid var(--border-color);vertical-align:top;overflow:hidden;cursor:pointer;position:relative;"';
                let cell = '<td' + tumGunCls + ' onclick="asEventModalAc(\'' + gunStr + '\');event.stopPropagation();">';
                if (tumGunEtk.length > 0) {
                    cell += '<div class="as-event-dots">';
                    tumGunEtk.forEach(function(e) {
                        const renk = e.type === "reminder" ? "#E67E22" : (e.type === "note" ? "#95A5A6" : (e.type === "gorev" ? asGorevRenk(e.durum, e.tarih) : "#2B6CB0"));
                        const isGorev = e.type === "gorev";
                        const id = e.id || "";
                        var etkLabel = e.title;
                        if (e.paylas) etkLabel = (e.paylasan ? '<i class="fa-solid fa-users"></i>' + e.paylasan + ' ' : '<i class="fa-solid fa-users"></i>') + etkLabel;
                        if (e.tumGun) etkLabel = '<i class="fa-regular fa-calendar"></i> ' + etkLabel;
                        cell += '<span class="as-event-dot" onclick="event.stopPropagation();' + (isGorev ? 'asGosterGunBilgi(\'' + gunStr + '\')' : 'asEventDuzenle(\'' + id.replace(/'/g,"\\'") + '\')') + ';" title="' + e.title.replace(/'/g,"&apos;") + '"><span class="as-dot-c" style="background:' + renk + ';"></span>' + etkLabel + '</span>';
                    });
                    cell += '</div>';
                }
                cell += '</td>';
                html += cell;
            }
            html += '</tr>';
            saatler.forEach(function(s) {
                html += '<tr><td style="padding:2px;text-align:center;font-size:8px;color:var(--text-light);border:1px solid var(--border-color);font-weight:600;">' + s + ':00</td>';
                for (let i = 0; i < 7; i++) {
                    const d = new Date(haftaBas); d.setDate(haftaBas.getDate() + i);
                    const gunStr = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
                    const saatEtk = etkinlikler.filter(function(e) { return e.date === gunStr && e.time && !e.tumGun && e.type !== "note" && e.time.startsWith(s); });
                    let cell = '<td' + (i >= 5 ? ' style="background:rgba(255,255,255,0.02);padding:1px;border:1px solid var(--border-color);vertical-align:top;overflow:hidden;cursor:pointer;position:relative;"' : ' style="padding:1px;border:1px solid var(--border-color);vertical-align:top;overflow:hidden;cursor:pointer;position:relative;"') + ' onclick="asEventModalAc(\'' + gunStr + '\');event.stopPropagation();">';
                    if (saatEtk.length > 0) {
                        cell += '<div class="as-event-dots">';
                        saatEtk.forEach(function(e) {
                            const renk = e.type === "reminder" ? "#E67E22" : (e.type === "note" ? "#95A5A6" : (e.type === "gorev" ? asGorevRenk(e.durum, e.tarih) : "#2B6CB0"));
                            const isGorev = e.type === "gorev";
                            const id = e.id || "";
                            var etkLabel = e.title;
                            if (e.paylas) etkLabel = (e.paylasan ? '<i class="fa-solid fa-users"></i>' + e.paylasan + ' ' : '<i class="fa-solid fa-users"></i>') + etkLabel;
                            cell += '<span class="as-event-dot" onclick="event.stopPropagation();' + (isGorev ? 'asGosterGunBilgi(\'' + gunStr + '\')' : 'asEventDuzenle(\'' + id.replace(/'/g,"\\'") + '\')') + ';" title="' + e.title.replace(/'/g,"&apos;") + '"><span class="as-dot-c" style="background:' + renk + ';"></span>' + etkLabel + '</span>';
                        });
                        cell += '</div>';
                    }
                    cell += '</td>';
                    html += cell;
                }
                html += '</tr>';
            });
            html += '</tbody></table>';
            container.innerHTML = html;
            var hBas = new Date(haftaBas);
            var hBit = new Date(haftaBas);
            hBit.setDate(hBit.getDate() + 6);
            var hBasStr = hBas.getFullYear() + "-" + String(hBas.getMonth() + 1).padStart(2, "0") + "-" + String(hBas.getDate()).padStart(2, "0");
            var hBitStr = hBit.getFullYear() + "-" + String(hBit.getMonth() + 1).padStart(2, "0") + "-" + String(hBit.getDate()).padStart(2, "0");
            asOzetRender(etkinlikler, tatiller, hBasStr, hBitStr);
        }
        function asOzetRender(etkinlikler, tatiller, basStr, bitisStr) {
            const ozetDiv = document.getElementById("asTakvimOzet");
            if (!ozetDiv) return;
            var bas = new Date(basStr + "T00:00:00");
            var bitis = new Date(bitisStr + "T00:00:00");
            var gunler = {};
            var d = new Date(bas);
            while (d <= bitis) {
                var ds = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
                var gTatil = tatiller.find(function(t) { return t.date === ds; });
                var gEtk = etkinlikler.filter(function(e) { return e.date === ds; });
                if (gTatil || gEtk.length > 0) { gunler[ds] = { tatil: gTatil, etkinlikler: gEtk }; }
                d.setDate(d.getDate() + 1);
            }
            var anahtarlar = Object.keys(gunler).sort();
            if (anahtarlar.length === 0) { ozetDiv.innerHTML = '<div class="as-takvim-ozet-bos">Bu dönemde etkinlik veya resmi tatil bulunmamaktadır.</div>'; return; }
            var h = '<div class="as-takvim-ozet-list">';
            anahtarlar.forEach(function(ds) {
                var g = gunler[ds];
                var gunAdi = new Date(ds + "T12:00:00").toLocaleDateString("tr-TR", { weekday: "short", day: "numeric", month: "short" });
                h += '<div class="as-takvim-ozet-item">';
                h += '<div class="as-takvim-ozet-tarih' + (g.tatil ? ' as-ozet-tatil-tarih' : '') + '">' + gunAdi.toUpperCase() + '</div>';
                h += '<div class="as-takvim-ozet-events">';
                if (g.tatil) {
                    h += '<span class="as-takvim-ozet-event tatil" title="' + g.tatil.name + '"><i class="fa-solid fa-flag"></i> ' + g.tatil.name + '</span>';
                }
                g.etkinlikler.forEach(function(e) {
                    var renk = e.type === "reminder" ? "#E67E22" : (e.type === "note" ? "#95A5A6" : (e.type === "gorev" ? asGorevRenk(e.durum, e.tarih) : "#2B6CB0"));
                    var label = e.title;
                    if (e.time && e.type !== "note" && !e.tumGun) label = e.time + " " + label;
                    else if (e.tumGun) label = '<i class="fa-regular fa-calendar"></i> Tüm Gün ' + label;
                    if (e.paylas) label = (e.paylasan ? '<i class="fa-solid fa-users"></i>' + e.paylasan + ' ' : '<i class="fa-solid fa-users"></i>') + label;
                    h += '<span class="as-takvim-ozet-event" onclick="asGosterGunBilgi(\'' + ds + '\')" title="' + e.title.replace(/'/g,"&apos;") + '"><span class="as-ozet-dot" style="background:' + renk + ';"></span>' + label + '</span>';
                });
                h += '</div></div>';
            });
            h += '</div>';
            ozetDiv.innerHTML = h;
        }
        function asEtkinlikListele() {
            const container = document.getElementById("asEtkinlikListesi");
            if (!container) return;
            const etkinlikler = asGetMergedEvents();
            if (etkinlikler.length === 0) { container.innerHTML = '<div style="font-size:12px;color:var(--text-light);font-style:italic;padding:8px 0;">Henüz etkinlik eklenmemiş.</div>'; return; }
            let html = '<div style="max-height:200px;overflow-y:auto;">';
            etkinlikler.forEach(function(e) {
                const renk = e.type === "reminder" ? "#E67E22" : (e.type === "note" ? "#95A5A6" : (e.type === "gorev" ? asGorevRenk(e.durum, e.tarih) : "#2B6CB0"));
                const isGorev = e.type === "gorev";
                const durumEtiketi = isGorev ? asGorevDurumEtiketi(e.durum, e.tarih) + " " : "";
                html += '<div class="as-etkinlik-item">';
                html += '<span class="as-etkinlik-dot" style="background:' + renk + ';border-color:' + renk + ';"></span>';
                html += '<span class="as-etkinlik-text">' + durumEtiketi + e.title + ' <small>' + e.date + (e.time && e.type !== "note" && !e.tumGun ? ' ' + e.time : (e.tumGun ? ' <i class="fa-regular fa-calendar"></i> Tüm Gün' : '')) + (e.paylas && e.paylasan ? ' <i class="fa-solid fa-users"></i>' + e.paylasan : '') + '</small></span>';
                if (!isGorev) { html += '<button class="as-etkinlik-edit" onclick="asEventDuzenle(\'' + e.id + '\')"><i class="fa-regular fa-pen-to-square"></i></button>'; }
                html += '</div>';
            });
            html += '</div>';
            container.innerHTML = html;
        }
        function asEventTypeDegisti() {
            var tip = document.getElementById("asEventType").value;
            var timeRow = document.getElementById("asEventTimeRow");
            timeRow.style.display = tip === "note" ? "none" : "block";
        }
        document.addEventListener("click", function(e) {
            var cs = document.getElementById("asEventTypeCustom");
            if (cs && !cs.contains(e.target)) cs.classList.remove("as-open");
        });
        function asCustomSelectToggle() {
            document.getElementById("asEventTypeCustom").classList.toggle("as-open");
        }
        function asCustomSelectSec(val) {
            var h = document.getElementById("asEventType");
            var t = document.getElementById("asEventTypeText");
            var opts = document.querySelectorAll("#asEventTypeOptions .as-custom-select-option");
            opts.forEach(function(o) {
                if (o.getAttribute("data-value") === val) { t.textContent = o.textContent; h.value = val; }
            });
            document.getElementById("asEventTypeCustom").classList.remove("as-open");
            asEventTypeDegisti();
        }
        function asCustomSelectSync() {
            var h = document.getElementById("asEventType");
            var t = document.getElementById("asEventTypeText");
            if (!h || !t) return;
            var opts = document.querySelectorAll("#asEventTypeOptions .as-custom-select-option");
            opts.forEach(function(o) {
                if (o.getAttribute("data-value") === h.value) t.textContent = o.textContent;
            });
        }
        function asEventTumGunDegisti() {
            var cb = document.getElementById("asEventTumGun");
            var timeInput = document.getElementById("asEventTime");
            timeInput.disabled = cb.checked;
            if (cb.checked) timeInput.value = "";
        }
        function asEventModalAc(tarih) {
            document.getElementById("asEventEditId").value = "";
            document.getElementById("asEventDate").value = tarih;
            document.getElementById("asEventTitle").value = "";
            document.getElementById("asEventTime").value = "09:00";
            document.getElementById("asEventTime").disabled = false;
            document.getElementById("asEventTumGun").checked = false;
            document.getElementById("asEventDesc").value = "";
            document.getElementById("asEventType").value = "reminder";
            asCustomSelectSync();
            document.getElementById("asEventTekrar").checked = false;
            document.getElementById("asEventTekrarOptions").style.display = "none";
            document.getElementById("asEventPaylas").checked = false;
            document.getElementById("asEventModalTitle").textContent = "ETKİNLİK EKLE - " + tarih;
            document.getElementById("asEventSilBtn").style.display = "none";
            document.getElementById("asEventModal").style.display = "flex";
            asEventTypeDegisti();
        }
        function asEventDuzenle(id) {
            const aktifUser = localStorage.getItem("tm_active_user") || "";
            var etkinlikler = JSON.parse(localStorage.getItem("tm_as_etkinlikler_" + aktifUser)) || [];
            var ev = etkinlikler.find(function(e) { return e.id === id; });
            var isShared = false;
            if (!ev) {
                var paylasilan = JSON.parse(localStorage.getItem("tm_as_etkinlikler_paylasilan")) || [];
                ev = paylasilan.find(function(e) { return e.id === id; });
                isShared = true;
            }
            if (!ev) return;
            var yetkili = !isShared || (ev.paylasan === aktifUser);
            document.getElementById("asEventEditId").value = id;
            document.getElementById("asEventDate").value = ev.date;
            document.getElementById("asEventTitle").value = ev.title;
            document.getElementById("asEventTime").value = ev.time || "09:00";
            document.getElementById("asEventTumGun").checked = ev.tumGun || false;
            document.getElementById("asEventDesc").value = ev.description || "";
            document.getElementById("asEventType").value = ev.type;
            asCustomSelectSync();
            asEventTypeDegisti();
            asEventTumGunDegisti();
            if (ev.tekrar && ev.tekrar.tip) {
                document.getElementById("asEventTekrar").checked = true;
                document.getElementById("asEventTekrarOptions").style.display = "block";
                document.getElementById("asEventTekrarTip").value = ev.tekrar.tip;
            } else {
                document.getElementById("asEventTekrar").checked = false;
                document.getElementById("asEventTekrarOptions").style.display = "none";
            }
            document.getElementById("asEventPaylas").checked = ev.paylas || false;
            document.getElementById("asEventModalTitle").textContent = "ETKİNLİK DÜZENLE - " + ev.date;
            document.getElementById("asEventSilBtn").style.display = yetkili ? "inline-block" : "none";
            document.querySelector("#asEventModal .as-btn-save").style.display = yetkili ? "inline-flex" : "none";
            document.getElementById("asEventPaylas").disabled = !yetkili;
            document.getElementById("asEventTitle").disabled = !yetkili;
            document.getElementById("asEventDesc").disabled = !yetkili;
            document.getElementById("asEventType").disabled = !yetkili;
            var ct = document.querySelector(".as-custom-select-trigger");
            if (ct) ct.style.pointerEvents = yetkili ? "" : "none";
            document.getElementById("asEventTime").disabled = !yetkili || document.getElementById("asEventTumGun").checked;
            document.getElementById("asEventTumGun").disabled = !yetkili;
            document.getElementById("asEventTekrar").disabled = !yetkili;
            document.getElementById("asEventTekrarTip").disabled = !yetkili;
            if (!yetkili) {
                document.getElementById("asEventModalTitle").textContent = "ETKİNLİK (SADECE GÖRÜNTÜLEME) - " + ev.date;
            }
            document.getElementById("asEventModal").style.display = "flex";
        }
        function asEventKaydet() {
            const aktifUser = localStorage.getItem("tm_active_user") || "";
            const editId = document.getElementById("asEventEditId").value;
            const date = document.getElementById("asEventDate").value;
            const title = document.getElementById("asEventTitle").value.trim();
            const type = document.getElementById("asEventType").value;
            const tumGun = document.getElementById("asEventTumGun").checked;
            var time = document.getElementById("asEventTime").value;
            if (type === "note" || tumGun) time = "";
            const desc = document.getElementById("asEventDesc").value.trim();
            const paylas = document.getElementById("asEventPaylas").checked;
            if (!title || !date) { tmNotify("Başlık ve tarih zorunludur!", "error"); return; }
            var tekrar = null;
            if (document.getElementById("asEventTekrar").checked) {
                var tip = document.getElementById("asEventTekrarTip").value;
                if (tip) tekrar = { tip: tip, istisnalar: [] };
            }
            var existingPaylasan = null;
            if (editId) {
                var tumEtk = JSON.parse(localStorage.getItem("tm_as_etkinlikler_paylasilan")) || [];
                var mevcut = tumEtk.find(function(e) { return e.id === editId; });
                if (mevcut) existingPaylasan = mevcut.paylasan;
            }
            var eventData = { id: editId || ("as_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4)), date: date, time: time, title: title, description: desc, type: type, tumGun: tumGun, tekrar: tekrar, paylas: paylas, paylasan: paylas ? (existingPaylasan || aktifUser) : undefined };
            if (paylas) {
                var paylasilan = JSON.parse(localStorage.getItem("tm_as_etkinlikler_paylasilan")) || [];
                if (editId) { var idx = paylasilan.findIndex(function(e) { return e.id === editId; }); if (idx >= 0) paylasilan[idx] = eventData; else paylasilan.push(eventData); }
                else { paylasilan.push(eventData); }
                localStorage.setItem("tm_as_etkinlikler_paylasilan", JSON.stringify(paylasilan));
            } else {
                let etkinlikler = JSON.parse(localStorage.getItem("tm_as_etkinlikler_" + aktifUser)) || [];
                if (editId) { var idx = etkinlikler.findIndex(function(e) { return e.id === editId; }); if (idx >= 0) etkinlikler[idx] = eventData; }
                else { etkinlikler.push(eventData); }
                localStorage.setItem("tm_as_etkinlikler_" + aktifUser, JSON.stringify(etkinlikler));
                var paylasilan = JSON.parse(localStorage.getItem("tm_as_etkinlikler_paylasilan")) || [];
                var pidx = paylasilan.findIndex(function(e) { return e.id === editId; });
                if (pidx >= 0) { paylasilan.splice(pidx, 1); localStorage.setItem("tm_as_etkinlikler_paylasilan", JSON.stringify(paylasilan)); }
            }
            asEventModalKapat();
            asTakvimRender();
            tmNotify("Etkinlik kaydedildi.", "success");
        }
        function asEventSil() {
            const id = document.getElementById("asEventEditId").value;
            if (!id) return;
            const aktifUser = localStorage.getItem("tm_active_user") || "";
            var paylasilan = JSON.parse(localStorage.getItem("tm_as_etkinlikler_paylasilan")) || [];
            var ev = paylasilan.find(function(e) { return e.id === id; });
            if (!ev) {
                var etkinlikler2 = JSON.parse(localStorage.getItem("tm_as_etkinlikler_" + aktifUser)) || [];
                ev = etkinlikler2.find(function(e) { return e.id === id; });
            }
            if (!ev) return;
            if (ev.paylasan && ev.paylasan !== aktifUser) { tmNotify("Bu paylaşılan etkinliği yalnızca oluşturan kullanıcı silebilir!", "error"); return; }
            var dateStr = document.getElementById("asEventDate").value;
            if (ev.tekrar && ev.tekrar.tip && dateStr) {
                var el = document.createElement("div");
                el.innerHTML = '<div style="padding:10px 0;"><p style="margin:0 0 12px 0;font-size:13px;">Bu etkinlik tekrarlanmaktadır. Nasıl silmek istersiniz?</p><div style="display:flex;gap:10px;"><button class="tm-confirm-yes" style="flex:1;" onclick="this.closest(\'.tm-confirm-wrap\').querySelector(\'.tm-confirm-thunk\').click()">SADECE BU TEKRARI</button><button class="tm-confirm-no" style="flex:1;" onclick="var el=this.closest(\'.tm-confirm-wrap\');el.querySelector(\'.tm-confirm-thunk\').dataset.all=true;el.querySelector(\'.tm-confirm-thunk\').click()">TÜM TEKRARLARI</button></div></div>';
                var wrap = document.createElement("div");
                wrap.className = "tm-confirm-wrap";
                wrap.appendChild(el);
                document.body.appendChild(wrap);
                var thunk = document.createElement("button");
                thunk.className = "tm-confirm-thunk";
                thunk.style.display = "none";
                thunk.onclick = function() {
                    wrap.remove();
                    if (thunk.dataset.all === "true") {
                        _asSilModalDelete(id, aktifUser);
                    } else {
                        if (!ev.tekrar.istisnalar) ev.tekrar.istisnalar = [];
                        if (ev.tekrar.istisnalar.indexOf(dateStr) < 0) ev.tekrar.istisnalar.push(dateStr);
                        if (ev.paylasan) {
                            var pl = JSON.parse(localStorage.getItem("tm_as_etkinlikler_paylasilan")) || [];
                            var pi = pl.findIndex(function(e) { return e.id === id; });
                            if (pi >= 0) { pl[pi] = ev; localStorage.setItem("tm_as_etkinlikler_paylasilan", JSON.stringify(pl)); }
                        } else {
                            var kulEtk = JSON.parse(localStorage.getItem("tm_as_etkinlikler_" + aktifUser)) || [];
                            var ki = kulEtk.findIndex(function(e) { return e.id === id; });
                            if (ki >= 0) { kulEtk[ki] = ev; localStorage.setItem("tm_as_etkinlikler_" + aktifUser, JSON.stringify(kulEtk)); }
                        }
                    }
                    asEventModalKapat();
                    asTakvimRender();
                    tmNotify("Etkinlik güncellendi.", "success");
                };
                wrap.appendChild(thunk);
                return;
            }
            var msg = ev.paylasan ? "Bu paylaşılan etkinliği silmek tüm ekip üyeleri için kaldıracaktır. Emin misiniz?" : "Bu etkinliği silmek istediğinize emin misiniz?";
            tmConfirm(msg, function() { _asSilModalDelete(id, aktifUser); });
            function _asSilModalDelete(evId, user) {
                var pl = JSON.parse(localStorage.getItem("tm_as_etkinlikler_paylasilan")) || [];
                var pi = pl.findIndex(function(e) { return e.id === evId; });
                if (pi >= 0) { pl.splice(pi, 1); localStorage.setItem("tm_as_etkinlikler_paylasilan", JSON.stringify(pl)); }
                else {
                    var kulEtk = JSON.parse(localStorage.getItem("tm_as_etkinlikler_" + user)) || [];
                    var ki = kulEtk.findIndex(function(e) { return e.id === evId; });
                    if (ki >= 0) { kulEtk.splice(ki, 1); localStorage.setItem("tm_as_etkinlikler_" + user, JSON.stringify(kulEtk)); }
                }
                asEventModalKapat();
                asTakvimRender();
                tmNotify("Etkinlik silindi.", "success");
            }
        }
        function asEventModalKapat() {
            document.getElementById("asEventModal").style.display = "none";
        }
        function asEventTekrarToggle() {
            var cb = document.getElementById("asEventTekrar");
            document.getElementById("asEventTekrarOptions").style.display = cb.checked ? "block" : "none";
        }
        function asGosterGunBilgi(gunStr) {
            const etkinlikler = asGetMergedEvents().filter(function(e) { return e.date === gunStr; });
            if (etkinlikler.length === 0) return;
            document.getElementById("asGunInfoTitle").innerHTML = '<i class="fa-regular fa-calendar"></i> ' + gunStr + ' - ETKİNLİKLER';
            document.getElementById("asEventFilterBar").style.display = "none";
            var h = "";
            etkinlikler.forEach(function(e) {
                const renk = e.type === "reminder" ? "#E67E22" : (e.type === "note" ? "#95A5A6" : (e.type === "gorev" ? asGorevRenk(e.durum, e.tarih) : "#2B6CB0"));
                const turAdi = e.type === "reminder" ? '<i class="fa-solid fa-bell"></i> ANIMSATICI' : (e.type === "note" ? '<i class="fa-regular fa-note-sticky"></i> NOT' : (e.type === "gorev" ? (e.durum === "tamamlandi" ? '<i class="fa-solid fa-check"></i> GÖREV (TAMAMLANDI)' : '<i class="fa-solid fa-list"></i> GÖREV') : '<i class="fa-solid fa-circle"></i> DİĞER'));
                const isGorev = e.type === "gorev";
                const id = e.id || "";
                const aktifUser = localStorage.getItem("tm_active_user") || "";
                const canEdit = !isGorev && (!e.paylasan || e.paylasan === aktifUser);
                h += '<div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border-color);">';
                h += '<span style="width:12px;height:12px;border-radius:50%;background:' + renk + ';flex-shrink:0;margin-top:5px;"></span>';
                h += '<div style="flex:1;min-width:0;word-break:break-word;"><b style="font-size:13px;">' + e.title + '</b><br><small style="color:var(--text-light);">' + turAdi + (e.time && e.type !== "note" && !e.tumGun ? ' &middot; ' + e.time : (e.tumGun ? ' &middot; <i class="fa-regular fa-calendar"></i> Tüm Gün' : '')) + (e.paylas ? (e.paylasan ? ' &middot; <i class="fa-solid fa-users"></i> ' + e.paylasan : ' &middot; <i class="fa-solid fa-users"></i> Paylaşılan') : '') + (e.description ? '<br>' + e.description : '') + '</small></div>';
                if (canEdit) {
                    var realId = id.replace("gorev_", "");
                    h += '<button class="as-etkinlik-edit" onclick="asEventDuzenle(\'' + realId.replace(/'/g,"\\'") + '\');asGunInfoKapat();" style="background:none;border:none;cursor:pointer;font-size:14px;padding:2px;" title="Düzenle"><i class="fa-regular fa-pen-to-square"></i></button>';
                    h += '<button class="as-etkinlik-edit" onclick="asEventSilById(\'' + realId.replace(/'/g,"\\'") + '\',\'' + (e.date || gunStr) + '\');" style="background:none;border:none;cursor:pointer;font-size:14px;padding:2px;color:var(--accent-red);" title="Sil"><i class="fa-solid fa-trash-can"></i></button>';
                }
                h += '</div>';
            });
            document.getElementById("asGunInfoBody").innerHTML = h;
            document.getElementById("asGunInfoModal").style.display = "flex";
        }
        function asEventSilById(id, dateStr) {
            if (!id) return;
            const aktifUser = localStorage.getItem("tm_active_user") || "";
            var paylasilan = JSON.parse(localStorage.getItem("tm_as_etkinlikler_paylasilan")) || [];
            var ev = paylasilan.find(function(e) { return e.id === id; });
            if (!ev) {
                var etkinlikler = JSON.parse(localStorage.getItem("tm_as_etkinlikler_" + aktifUser)) || [];
                ev = etkinlikler.find(function(e) { return e.id === id; });
            }
            if (!ev) return;
            if (ev.paylasan && ev.paylasan !== aktifUser) { tmNotify("Bu paylaşılan etkinliği yalnızca oluşturan kullanıcı silebilir!", "error"); return; }
            function _deleteEventById(evId, user) {
                var paylasilan2 = JSON.parse(localStorage.getItem("tm_as_etkinlikler_paylasilan")) || [];
                var pidx = paylasilan2.findIndex(function(e) { return e.id === evId; });
                if (pidx >= 0) { paylasilan2.splice(pidx, 1); localStorage.setItem("tm_as_etkinlikler_paylasilan", JSON.stringify(paylasilan2)); }
                else {
                    var kullaniciEtk2 = JSON.parse(localStorage.getItem("tm_as_etkinlikler_" + user)) || [];
                    var kdx = kullaniciEtk2.findIndex(function(e) { return e.id === evId; });
                    if (kdx >= 0) { kullaniciEtk2.splice(kdx, 1); localStorage.setItem("tm_as_etkinlikler_" + user, JSON.stringify(kullaniciEtk2)); }
                }
            }
            if (ev.tekrar && ev.tekrar.tip && dateStr) {
                var el = document.createElement("div");
                el.innerHTML = '<div style="padding:10px 0;"><p style="margin:0 0 12px 0;font-size:13px;">Bu etkinlik tekrarlanmaktadır. Nasıl silmek istersiniz?</p><div style="display:flex;gap:10px;"><button class="tm-confirm-yes" style="flex:1;" onclick="this.closest(\'.tm-confirm-wrap\').querySelector(\'.tm-confirm-thunk\').click()">SADECE BU TEKRARI</button><button class="tm-confirm-no" style="flex:1;" onclick="var el=this.closest(\'.tm-confirm-wrap\');el.querySelector(\'.tm-confirm-thunk\').dataset.all=true;el.querySelector(\'.tm-confirm-thunk\').click()">TÜM TEKRARLARI</button></div></div>';
                var wrap = document.createElement("div");
                wrap.className = "tm-confirm-wrap";
                wrap.appendChild(el);
                document.body.appendChild(wrap);
                var thunk = document.createElement("button");
                thunk.className = "tm-confirm-thunk";
                thunk.style.display = "none";
                thunk.onclick = function() {
                    wrap.remove();
                    var silAll = thunk.dataset.all === "true";
                    if (silAll) { _deleteEventById(id, aktifUser); }
                    else {
                        var kaynak = JSON.parse(localStorage.getItem("tm_as_etkinlikler_paylasilan")) || [];
                        var src = kaynak.find(function(e) { return e.id === id; });
                        if (!src) {
                            var kullaniciEtk = JSON.parse(localStorage.getItem("tm_as_etkinlikler_" + aktifUser)) || [];
                            src = kullaniciEtk.find(function(e) { return e.id === id; });
                        }
                        if (src && src.tekrar) {
                            if (!src.tekrar.istisnalar) src.tekrar.istisnalar = [];
                            if (src.tekrar.istisnalar.indexOf(dateStr) < 0) src.tekrar.istisnalar.push(dateStr);
                            if (src.paylasan) {
                                var paylasilan2 = JSON.parse(localStorage.getItem("tm_as_etkinlikler_paylasilan")) || [];
                                var pidx = paylasilan2.findIndex(function(e) { return e.id === id; });
                                if (pidx >= 0) { paylasilan2[pidx] = src; localStorage.setItem("tm_as_etkinlikler_paylasilan", JSON.stringify(paylasilan2)); }
                            } else {
                                var kullaniciEtk2 = JSON.parse(localStorage.getItem("tm_as_etkinlikler_" + aktifUser)) || [];
                                var kdx = kullaniciEtk2.findIndex(function(e) { return e.id === id; });
                                if (kdx >= 0) { kullaniciEtk2[kdx] = src; localStorage.setItem("tm_as_etkinlikler_" + aktifUser, JSON.stringify(kullaniciEtk2)); }
                            }
                        }
                    }
                    asGunInfoKapat();
                    asTakvimRender();
                    tmNotify("Etkinlik güncellendi.", "success");
                };
                wrap.appendChild(thunk);
                return;
            }
            var msg = ev.paylasan ? "Bu paylaşılan etkinliği silmek tüm ekip üyeleri için kaldıracaktır. Emin misiniz?" : "Bu etkinliği silmek istediğinize emin misiniz?";
            tmConfirm(msg, function() { _deleteEventById(id, aktifUser); asGunInfoKapat(); asTakvimRender(); tmNotify("Etkinlik silindi.", "success"); });
        }
        let asEventFilter = "all";
        function asEventFilterSet(filter) {
            asEventFilter = filter;
            document.querySelectorAll("#asEventFilterBar .as-filter-btn").forEach(function(b) { b.classList.toggle("as-filter-active", b.getAttribute("data-filter") === filter); });
            asTumEtkinlikleriGoster();
        }
        function asTumEtkinlikleriGoster() {
            const etkinlikler = asGetMergedEvents();
            document.getElementById("asGunInfoTitle").innerHTML = '<i class="fa-solid fa-list"></i> TÜM ETKİNLİKLER';
            document.getElementById("asEventFilterBar").style.display = "flex";
            var filtered = asEventFilter === "all" ? etkinlikler : etkinlikler.filter(function(e) { return e.type === asEventFilter; });
            var h = "";
            filtered.forEach(function(e) {
                const renk = e.type === "reminder" ? "#E67E22" : (e.type === "note" ? "#95A5A6" : (e.type === "gorev" ? asGorevRenk(e.durum, e.tarih) : "#2B6CB0"));
                const turAdi = e.type === "reminder" ? '<i class="fa-solid fa-bell"></i> ANIMSATICI' : (e.type === "note" ? '<i class="fa-regular fa-note-sticky"></i> NOT' : (e.type === "gorev" ? (e.durum === "tamamlandi" ? '<i class="fa-solid fa-check"></i> GÖREV (TAMAMLANDI)' : '<i class="fa-solid fa-list"></i> GÖREV') : '<i class="fa-solid fa-circle"></i> DİĞER'));
                const isGorev = e.type === "gorev";
                const id = e.id || "";
                const aktifUser = localStorage.getItem("tm_active_user") || "";
                const canEdit = !isGorev && (!e.paylasan || e.paylasan === aktifUser);
                h += '<div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border-color);">';
                h += '<span style="width:12px;height:12px;border-radius:50%;background:' + renk + ';flex-shrink:0;margin-top:5px;"></span>';
                h += '<div style="flex:1;min-width:0;word-break:break-word;"><b style="font-size:13px;">' + e.title + '</b><br><small style="color:var(--text-light);"><span style="color:' + renk + ';">?</span> ' + turAdi + ' &middot; ' + e.date + (e.time && e.type !== "note" && !e.tumGun ? ' ' + e.time : (e.tumGun ? ' <i class="fa-regular fa-calendar"></i> Tüm Gün' : '')) + (e.paylas ? (e.paylasan ? ' &middot; <i class="fa-solid fa-users"></i> ' + e.paylasan : ' &middot; <i class="fa-solid fa-users"></i> Paylaşılan') : '') + (e.description ? '<br>' + e.description : '') + '</small></div>';
                if (canEdit) {
                    var realId = id.replace("gorev_", "");
                    h += '<button class="as-etkinlik-edit" onclick="asEventDuzenle(\'' + realId.replace(/'/g,"\\'") + '\');asGunInfoKapat();" style="background:none;border:none;cursor:pointer;font-size:14px;padding:2px;" title="Düzenle"><i class="fa-regular fa-pen-to-square"></i></button>';
                    h += '<button class="as-etkinlik-edit" onclick="asEventSilById(\'' + realId.replace(/'/g,"\\'") + '\',\'' + e.date + '\');" style="background:none;border:none;cursor:pointer;font-size:14px;padding:2px;color:var(--accent-red);" title="Sil"><i class="fa-solid fa-trash-can"></i></button>';
                }
                h += '</div>';
            });
            if (etkinlikler.length === 0) { h = tmEmptyStateHTML('<i class="fa-regular fa-calendar"></i>','Hiç etkinlik bulunmamaktadır.','Takvimden yeni bir etkinlik ekleyebilirsiniz.'); }
            document.getElementById("asGunInfoBody").innerHTML = h;
            document.getElementById("asGunInfoModal").style.display = "flex";
        }
        function asGunInfoKapat() {
            document.getElementById("asGunInfoModal").style.display = "none";
        }

        /* ================= ANA SAYFA GÖREVLER ================= */
        function asGorevFormGoster() {
            const form = document.getElementById("asGorevAtamaFormu");
            const btn = document.getElementById("asGorevAtaBtn");
            if (form.style.display === "block") { form.style.display = "none"; btn.innerHTML = '<i class="fa-solid fa-plus"></i> GÖREV ATA'; return; }
            const aktifUser = localStorage.getItem("tm_active_user") || "";
            const yetkiler = JSON.parse(localStorage.getItem("tm_gorev_yetkileri")) || [];
            const yetkiliAlanlar = yetkiler.filter(function(y) { return y.veren === aktifUser; }).map(function(y) { return y.alan; });
            if (yetkiliAlanlar.length === 0) { tmNotify("Görev atama yetkiniz bulunmamaktadır!", "error"); return; }
            const master = JSON.parse(localStorage.getItem("tm_admin_creds_final")) || {};
            const altKullanicilar = JSON.parse(localStorage.getItem("tm_users_final_v8")) || [];
            let ops = "";
            yetkiliAlanlar.forEach(function(alan) {
                const u = altKullanicilar.find(function(a) { return a.usr === alan; });
                ops += '<option value="' + alan + '">' + alan + ' (' + (u && u.title ? u.title : "") + ')</option>';
            });
            if (yetkiliAlanlar.indexOf("TUGAYTURAK") >= 0) {
                ops = '<option value="TUGAYTURAK">TUGAYTURAK (' + (master.title || "KURUCU") + ')</option>' + ops.replace(/<option value="TUGAYTURAK">.*?<\/option>/, "");
            }
            document.getElementById("asGorevAtanan").innerHTML = ops;
            document.getElementById("asGorevTarih").value = anlikTarihGetir();
            form.style.display = "block";
            btn.innerHTML = '<i class="fa-solid fa-xmark"></i> İPTAL';
        }
        function asGorevAta() {
            const atanan = document.getElementById("asGorevAtanan").value;
            const baslik = document.getElementById("asGorevBaslik").value.trim();
            const mesaj = document.getElementById("asGorevMesaj").value.trim();
            const tarih = document.getElementById("asGorevTarih").value;
            if (!atanan || !baslik) { tmNotify("Kullanıcı ve başlık zorunludur!", "error"); return; }
            const veren = localStorage.getItem("tm_active_user") || "";
            let gorevler = JSON.parse(localStorage.getItem("tm_gorevler")) || [];
            gorevler.push({ id: "gr_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4), veren: veren, atanan: atanan, baslik: baslik, mesaj: mesaj, tarih: tarih, durum: "bekliyor" });
            localStorage.setItem("tm_gorevler", JSON.stringify(gorevler));
            document.getElementById("asGorevBaslik").value = "";
            document.getElementById("asGorevMesaj").value = "";
            document.getElementById("asGorevAtanan").selectedIndex = 0;
            asGorevListele();
            document.getElementById("asGorevAtamaFormu").style.display = "none";
            document.getElementById("asGorevAtaBtn").innerHTML = '<i class="fa-solid fa-plus"></i> GÖREV ATA';
            tmNotify("Görev atandı.", "success");
            aktiviteEkle("Görev atandı: " + baslik + " › " + atanan, "Dashboard");
            bildirimSesi();
            gorevMailGonder({ atanan: atanan, veren: veren, baslik: baslik, mesaj: mesaj, tarih: tarih });
        }
        function asGorevListele() {
            const container = document.getElementById("asGorevListesi");
            if (!container) return;
            const aktifUser = localStorage.getItem("tm_active_user") || "";
            let gorevler = JSON.parse(localStorage.getItem("tm_gorevler")) || [];
            const simdi = Date.now();
            const birGun = 24 * 60 * 60 * 1000;
            const temizlenecekler = gorevler.filter(function(g) { return g.durum === "tamamlandi" && g.tamamlanmaTarihi && (simdi - g.tamamlanmaTarihi) > birGun; });
            if (temizlenecekler.length > 0) {
                gorevler = gorevler.filter(function(g) { return !(g.durum === "tamamlandi" && g.tamamlanmaTarihi && (simdi - g.tamamlanmaTarihi) > birGun); });
                origSetItem("tm_gorevler", JSON.stringify(gorevler));
            }
            function tamamlanmaStr(ts) {
                if (!ts) return "";
                var d = new Date(ts);
                return d.toLocaleDateString("tr-TR") + " " + d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
            }
            function atananKontrol(g, kullanici) {
                var arr = Array.isArray(g.atanan) ? g.atanan : [g.atanan];
                return arr.indexOf(kullanici) >= 0;
            }
            const benimGorevlerim = gorevler.filter(function(g) { return atananKontrol(g, aktifUser); });
            const verdigimGorevler = gorevler.filter(function(g) { return g.veren === aktifUser && !atananKontrol(g, aktifUser); });
            let html = '<div class="as-section-label" style="color:#2e7d32;"><i class="fa-solid fa-inbox"></i> BANA ATANAN GÖREVLER</div>';
            if (benimGorevlerim.length === 0) { html += '<div style="padding:8px 0;">'+tmEmptyStateHTML('<i class="fa-solid fa-check"></i>','Size atanmış görev bulunmamaktadır.','','')+'</div>'; }
            else {
                benimGorevlerim.forEach(function(g) {
                    const renk = asGorevRenk(g.durum, g.tarih);
                    const etiket = asGorevDurumEtiketi(g.durum, g.tarih);
                    var atananAd = Array.isArray(g.atanan) ? g.atanan.join(", ") : g.atanan;
                    html += '<div class="as-gorev-item" style="border-left:4px solid ' + renk + ';">';
                    html += '<div class="as-gorev-text"><b>' + etiket + ' ' + g.baslik + '</b>' + (g.mesaj ? ' — ' + g.mesaj : '') + '<br><small>' + g.veren + ' › ' + atananAd + ' | ' + g.tarih + '</small></div>';
                    if (g.durum !== "tamamlandi") { html += '<button class="as-gorev-complete" onclick="asGorevTamamla(\'' + g.id + '\')">TAMAMLA</button>'; }
                    else { html += '<span class="as-gorev-tamamlandi">' + tamamlanmaStr(g.tamamlanmaTarihi) + '</span>'; }
                    html += '</div>';
                });
            }
            html += '<div class="as-section-label" style="color:var(--accent-red);margin-top:14px;"><i class="fa-solid fa-paper-plane"></i> VERDİĞİM GÖREVLER</div>';
            if (verdigimGorevler.length === 0) { html += '<div style="padding:8px 0;">'+tmEmptyStateHTML('<i class="fa-solid fa-list"></i>','Verdiğiniz görev bulunmamaktadır.','','')+'</div>'; }
            else {
                verdigimGorevler.forEach(function(g) {
                    const renk = asGorevRenk(g.durum, g.tarih);
                    const etiket = asGorevDurumEtiketi(g.durum, g.tarih);
                    var atananAd = Array.isArray(g.atanan) ? g.atanan.join(", ") : g.atanan;
                    html += '<div class="as-gorev-item" style="border-left:4px solid ' + renk + ';">';
                    html += '<div class="as-gorev-text"><b>' + etiket + ' ' + g.baslik + '</b>' + (g.mesaj ? ' — ' + g.mesaj : '') + '<br><small>› ' + atananAd + ' | ' + g.tarih + ' | <span style="color:' + renk + ';font-weight:700;">' + (g.durum === "tamamlandi" ? "TAMAMLANDI " + tamamlanmaStr(g.tamamlanmaTarihi) : (asGorevRenk(g.durum, g.tarih) === "#C0392B" ? "GECİKMİŞ" : "BEKLİYOR")) + '</span></small></div>';
                    html += '<button class="as-gorev-delete" onclick="asGorevSil(\'' + g.id + '\')"><i class="fa-solid fa-trash-can"></i></button>';
                    html += '</div>';
                });
            }
            container.innerHTML = html;
        }
        function asGorevTamamla(id) {
            let gorevler = JSON.parse(localStorage.getItem("tm_gorevler")) || [];
            const idx = gorevler.findIndex(function(g) { return g.id === id; });
            if (idx >= 0) { gorevler[idx].durum = "tamamlandi"; gorevler[idx].tamamlanmaTarihi = Date.now(); }
            localStorage.setItem("tm_gorevler", JSON.stringify(gorevler));
            asGorevListele();
            asTakvimRender();
            tmNotify("Görev tamamlandı olarak işaretlendi.", "success");
        }
        function asGorevSil(id) {
            tmConfirm("Bu görevi silmek istediğinize emin misiniz?", function() {
                let gorevler = JSON.parse(localStorage.getItem("tm_gorevler")) || [];
                gorevler = gorevler.filter(function(g) { return g.id !== id; });
                localStorage.setItem("tm_gorevler", JSON.stringify(gorevler));
                asGorevListele();
            });
        }

        function gorevYetkiSelectleriDoldur() {
            const veren = document.getElementById("gorevYetkiVeren");
            const alan = document.getElementById("gorevYetkiAlan");
            if (!veren || !alan) return;
            const master = JSON.parse(localStorage.getItem("tm_admin_creds_final")) || {};
            const altKullanicilar = JSON.parse(localStorage.getItem("tm_users_final_v8")) || [];
            let ops = '<option value="TUGAYTURAK">TUGAYTURAK (' + (master.title || "KURUCU") + ')</option>';
            altKullanicilar.forEach(function(u) { ops += '<option value="' + u.usr + '">' + u.usr + ' (' + (u.title || "") + ')</option>'; });
            veren.innerHTML = ops;
            alan.innerHTML = ops;
        }

        function gorevYetkiEkle() {
            const veren = document.getElementById("gorevYetkiVeren").value;
            const alan = document.getElementById("gorevYetkiAlan").value;
            if (!veren || !alan) { tmNotify("Lütfen kullanıcı seçiniz!", "error"); return; }
            if (veren === alan) { tmNotify("Aynı kullanıcı seçilemez!", "error"); return; }
            let yetkiler = JSON.parse(localStorage.getItem("tm_gorev_yetkileri")) || [];
            if (yetkiler.some(function(y) { return y.veren === veren && y.alan === alan; })) { tmNotify("Bu yetki zaten tanımlı!", "error"); return; }
            yetkiler.push({ veren: veren, alan: alan });
            localStorage.setItem("tm_gorev_yetkileri", JSON.stringify(yetkiler));
            gorevYetkiListele();
            tmNotify("Yetki eklendi.", "success");
        }

        function gorevYetkiSil(veren, alan) {
            let yetkiler = JSON.parse(localStorage.getItem("tm_gorev_yetkileri")) || [];
            yetkiler = yetkiler.filter(function(y) { return !(y.veren === veren && y.alan === alan); });
            localStorage.setItem("tm_gorev_yetkileri", JSON.stringify(yetkiler));
            gorevYetkiListele();
        }

        function gorevYetkiListele() {
            const tbody = document.getElementById("gorevYetkiBody");
            if (!tbody) return;
            const yetkiler = JSON.parse(localStorage.getItem("tm_gorev_yetkileri")) || [];
            tbody.innerHTML = yetkiler.map(function(y) {
                return '<tr><td>' + y.veren + '</td><td>' + y.alan + '</td><td><button class="btn-danger" onclick="gorevYetkiSil(\'' + y.veren + '\',\'' + y.alan + '\')" style="padding:4px 8px;font-size:11px;">SİL</button></td></tr>';
            }).join("");
        }

        /* ================= BİRİM LİSTESİ MOTORLARI ================= */
        function birimListesiGetir() { try { return JSON.parse(localStorage.getItem("tm_birim_listesi_v1")) || SABIT_BIRIM_LISTESI; } catch(e) { return SABIT_BIRIM_LISTESI; } }
        function birimListesiniYenile() {
            var list = birimListesiGetir();
            document.querySelectorAll(".row-birim").forEach(function(s) {
                var val = s.value;
                s.innerHTML = '<option value="">--</option>';
                list.forEach(function(b) {
                    var o = document.createElement("option");
                    o.value = b; o.textContent = b; if (b === val) o.selected = true;
                    s.appendChild(o);
                });
            });
        }
        function birimSilPrompt() {
            var list = birimListesiGetir();
            if (list.length === 0) { tmNotify("Silinecek birim kalmadı.", "error"); return; }
            tmPrompt("Silmek istedi\u011finiz birim ad\u0131n\u0131 yaz\u0131n:\n\n" + list.map(function(b,i){ return (i+1)+". "+b; }).join("\n"), function(sec) {
                if (!sec || sec.trim() === "") return;
                sec = sec.trim().toUpperCase();
                var idx = list.indexOf(sec);
                if (idx === -1) { tmNotify("Bu birim listede bulunamadı.", "error"); return; }
                list.splice(idx, 1);
                localStorage.setItem("tm_birim_listesi_v1", JSON.stringify(list));
                birimListesiniYenile();
                tmNotify("Birim silindi: " + sec, "success");
            }, "", "B\u0130R\u0130M S\u0130L");
        }
        function birimEklePrompt() {
            tmPrompt("Yeni birim t\u00fcr\u00fc giriniz (\u00f6rn: M\u00b2, ADET, KG):", function(yeni) {
                if (!yeni || yeni.trim() === "") return;
                yeni = yeni.trim().toUpperCase();
                var list = birimListesiGetir();
                if (list.indexOf(yeni) !== -1) { tmNotify("Bu birim zaten mevcut!", "error"); return; }
                list.push(yeni);
                localStorage.setItem("tm_birim_listesi_v1", JSON.stringify(list));
                birimListesiniYenile();
                tmNotify("Birim eklendi: " + yeni, "success");
            }, "", "B\u0130R\u0130M EKLE");
        }
        function birimDropdownKapat(el){var dd=el.closest('.cs-dropdown');if(dd){dd.classList.remove('open');dd.previousElementSibling.classList.remove('open');}}
        function kdvDropdownKapat(el){var dd=el.closest('.cs-dropdown');if(dd){dd.classList.remove('open');dd.previousElementSibling.classList.remove('open');}}
        function kdvListesiGetir(){try{return JSON.parse(localStorage.getItem("tm_kdv_listesi_v1"))||SABIT_KDV_LISTESI;}catch(e){return SABIT_KDV_LISTESI;}}
        function kdvListesiniYenile(){
            var list=kdvListesiGetir();
            document.querySelectorAll(".row-kdv").forEach(function(s){
                var val=s.value;
                var txt=s.options[s.selectedIndex]?s.options[s.selectedIndex].text:'';
                s.innerHTML='';
                list.forEach(function(k){
                    var o=document.createElement("option");
                    o.value=k;o.textContent='%'+k;if(k===val)o.selected=true;
                    s.appendChild(o);
                });
                if(s.options.length>0&&s.selectedIndex===-1){s.selectedIndex=0;}
                var w=s.parentNode.querySelector('.cs-wrapper');
                if(w&&!s.value){var t=w.querySelector('.cs-trigger');if(t)t.textContent=s.options[0]?s.options[0].text:'';}
            });
        }
        function kdvEklePrompt(){
            tmPrompt("Yeni KDV oran\u0131 giriniz (sadece say\u0131, \u00f6rn: 15):",function(yeni){
                if(!yeni||yeni.trim()==="")return;
                yeni=yeni.trim();
                if(isNaN(parseFloat(yeni))){tmNotify("Geçerli bir sayı giriniz!","error");return;}
                yeni=String(Math.round(parseFloat(yeni)));
                var list=kdvListesiGetir();
                if(list.indexOf(yeni)!==-1){tmNotify("Bu KDV oranı zaten mevcut!","error");return;}
                list.push(yeni);
                list.sort(function(a,b){return parseInt(b)-parseInt(a);});
                localStorage.setItem("tm_kdv_listesi_v1",JSON.stringify(list));
                kdvListesiniYenile();
                tmNotify("KDV oranı eklendi: %"+yeni,"success");
            },"","KDV ORANI EKLE");
        }
        function kdvSilPrompt(){
            var list=kdvListesiGetir();
            if(list.length<=1){tmNotify("En az bir KDV oranı kalmalıdır.","error");return;}
            tmPrompt("Silmek istedi\u011finiz KDV oran\u0131n\u0131 yaz\u0131n:\n\n"+list.map(function(k,i){return (i+1)+". %"+k;}).join("\n"),function(sec){
                if(!sec||sec.trim()==="")return;
                sec=sec.trim();
                var idx=list.indexOf(sec);
                if(idx===-1){tmNotify("Bu KDV oranı listede bulunamadı.","error");return;}
                list.splice(idx,1);
                localStorage.setItem("tm_kdv_listesi_v1",JSON.stringify(list));
                kdvListesiniYenile();
                tmNotify("KDV oranı silindi: %"+sec,"success");
            },"","KDV ORANI SIL");
        }
        /* ================= TEKLİF FORMU MOTORLARI ================= */
        function teklifFormSatirEkle() {
            const tbody = document.getElementById("teklifFormRows");
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><textarea class="row-servis" rows="1" style="width:100%; resize:none; overflow:hidden; font-family:inherit; font-size:inherit; box-sizing:border-box;" oninput="tmAutoResizeTextarea(this)"></textarea></td>
                <td style="text-align:center;"><input type="text" class="row-miktar" value="0,00" onfocus="tmTutarFocus(this)" oninput="tmTutarFormatla(this); canliTeklifHesapla()" onblur="tmTutarBlur(this); canliTeklifHesapla()" style="width:92%; text-align:center;"></td>
                <td style="text-align:center;"><select class="row-birim" style="width:90%;"><option value="">--</option></select></td>
                <td style="text-align:center;"><input type="text" class="row-fiyat" value="0,00" onfocus="tmTutarFocus(this)" oninput="tmTutarFormatla(this); canliTeklifHesapla()" onblur="tmTutarBlur(this); canliTeklifHesapla()" style="width:92%; text-align:center; box-sizing:border-box;"></td>
                <td style="text-align:center;">
                    <select class="row-kdv" onchange="canliTeklifHesapla()" style="width:70px">
                        <option value="20">%20</option>
                        <option value="10">%10</option>
                        <option value="0" selected>%0</option>
                    </select>
                </td>
                <td style="text-align:center;"><button class="btn-danger" onclick="teklifFormSatirSil(this)" style="font-size:10px;padding:4px 6px;">Sil</button></td>
            `;
            tbody.appendChild(tr);
            birimListesiniYenile();
            kdvListesiniYenile();
            canliTeklifHesapla();
        }
        function teklifFormSatirSil(btn) { btn.closest("tr").remove(); canliTeklifHesapla(); }

        function canliTeklifHesapla() {
            const rows = document.querySelectorAll("#teklifFormRows tr");
            let araToplam = 0, kdvToplam = 0;
            rows.forEach(row => {
                const m = tmTutarCoz(row.querySelector(".row-miktar").value);
                const f = tmTutarCoz(row.querySelector(".row-fiyat").value);
                const k = parseFloat(row.querySelector(".row-kdv").value) || 0;
                const t = m * f;
                araToplam += t; kdvToplam += (t * (k / 100));
            });
            document.getElementById("liveAra").innerText = araToplam.toLocaleString('tr-TR', {minimumFractionDigits: 2}) + " ₺";
            document.getElementById("liveKdv").innerText = kdvToplam.toLocaleString('tr-TR', {minimumFractionDigits: 2}) + " ₺";
            document.getElementById("liveGenel").innerText = (araToplam + kdvToplam).toLocaleString('tr-TR', {minimumFractionDigits: 2}) + " ₺";
        }

        function teklifFormuTemizle() {
            document.getElementById("tMusteriAd").value = "";
            document.getElementById("tFirma").value = "";
            document.getElementById("tIsAdi").value = "";
            document.getElementById("tHazirlayan").value = "";
            document.getElementById("tTelefon").value = "";
            document.getElementById("tTarih").value = anlikTarihGetir();
            document.getElementById("teklifFormRows").innerHTML = `
                <tr>
                    <td><textarea class="row-servis" rows="1" style="width:100%; resize:none; overflow:hidden; font-family:inherit; font-size:inherit; box-sizing:border-box;" oninput="tmAutoResizeTextarea(this)">UYGULAMA PROJELER (MİMARİ/STATİK/ELEKTRİK/MEKANIK/EKB/MAR/ASS. AVAN.)</textarea></td>
                    <td style="text-align:center;"><input type="text" class="row-miktar" value="0,00" onfocus="tmTutarFocus(this)" oninput="tmTutarFormatla(this); canliTeklifHesapla()" onblur="tmTutarBlur(this); canliTeklifHesapla()" style="width:92%; text-align:center;"></td>
                    <td style="text-align:center;"><select class="row-birim" style="width:90%;"><option value="">--</option></select></td>
                    <td style="text-align:center;"><input type="text" class="row-fiyat" value="0,00" onfocus="tmTutarFocus(this)" oninput="tmTutarFormatla(this); canliTeklifHesapla()" onblur="tmTutarBlur(this); canliTeklifHesapla()" style="width:92%; text-align:center; box-sizing:border-box;"></td>
                    <td style="text-align:center;"><select class="row-kdv" onchange="canliTeklifHesapla()" style="width:70px"><option value="20">%20</option><option value="10">%10</option><option value="0" selected>%0</option></select></td>
                    <td style="text-align:center;"><button class="btn-danger" onclick="teklifFormSatirSil(this)" style="font-size:10px;padding:4px 6px;">Sil</button></td>
                </tr>
            `;
            birimListesiniYenile();
            kdvListesiniYenile();
            canliTeklifHesapla();
        }
        /* ================= GEÇMİŞ TABLO & SIRALAMA MOTORU ================= */
        function formVerileriniTopla() {
            const musteriAd = trToUpper(document.getElementById("tMusteriAd").value);
            const firma = trToUpper(document.getElementById("tFirma").value);
            const isAdi = trToUpper(document.getElementById("tIsAdi").value);
            const hazirlayan = trToUpper(document.getElementById("tHazirlayan").value);
            const telefon = document.getElementById("tTelefon").value.trim() || "-";
            const tarih = document.getElementById("tTarih").value;
            const sTarih = tarih ? new Date(tarih).toLocaleDateString("tr-TR") : "-";

            const rows = document.querySelectorAll("#teklifFormRows tr");
            const kalemler = []; let araToplam = 0, kdvToplam = 0;
            rows.forEach(row => {
                const servis = trToUpper(row.querySelector(".row-servis").value);
                const miktar = tmTutarCoz(row.querySelector(".row-miktar").value);
                var birimEl = row.querySelector(".row-birim");
                var birim = birimEl ? trToUpper(birimEl.value) : "";
                const f = tmTutarCoz(row.querySelector(".row-fiyat").value);
                const kdv = parseFloat(row.querySelector(".row-kdv").value) || 0;
                const t = miktar * f;
                araToplam += t; kdvToplam += (t * (kdv / 100));
                kalemler.push({ servis, miktar, birim, fiyat: f, kdv });
            });
            
            const db = JSON.parse(localStorage.getItem("tm_teklifler_db_final")) || [];
            const maxId = db.reduce((max, item) => item.id > max ? item.id : max, 0);
            const yeniId = maxId + 1;

            return { 
                id: yeniId, musteriAd, firma, isAdi, hazirlayan, telefon, sTarih, kalemler,
                araTutar: araToplam, kdvTutar: kdvToplam,
                genelTutar: (araToplam + kdvToplam).toLocaleString('tr-TR', {minimumFractionDigits: 2}) + " ₺" 
            };
        }

        function teklifFormuKaydet() {
            const veri = formVerileriniTopla();
            if(veri.musteriAd === "-" && veri.firma === "-") { tmNotify("Müşteri adı veya firma ünvanı alanını doldurunuz.", "error"); return; }
            tmLoadingGoster('Teklif kaydediliyor...');
            const db = JSON.parse(localStorage.getItem("tm_teklifler_db_final")) || [];
            db.push(veri);
            localStorage.setItem("tm_teklifler_db_final", JSON.stringify(db));
            tmLoadingGizle();
            teklifFormuTemizle();
            dashboardVerileriniGuncelle();
            teklifListesiniYenile();
            musteriKartlariniYenile();
            
            tmNotify("TEKLİF HAFIZAYA BÜYÜK HARFLERLE KAYDEDİLDİ.", "success");
            aktiviteEkle("Teklif oluşturuldu: #" + veri.id + " - " + (veri.musteriAd || ""), "Teklif");
            menudenSayfaAc('teklif-liste', 'teklif-liste-page', document.getElementById('sub-teklif-liste'));
        }

        function teklifFormuPdfUret() {
            const veri = formVerileriniTopla();
            if(veri.musteriAd === "-" && veri.firma === "-") { tmNotify("Müşteri adı veya firma ünvanı alanını doldurunuz.", "error"); return; }
            pdfSablonunuDoldurVeIndir(veri);
        }

        function pdfSablonunuDoldurVeIndir(veri) {
            document.getElementById("pOutClientName").innerText = veri.musteriAd;
            document.getElementById("pOutFirma").innerText = veri.firma;
            document.getElementById("pOutJob").innerText = veri.isAdi;
            document.getElementById("pOutPhone").innerText = veri.telefon;
            document.getElementById("pOutDate").innerText = veri.sTarih;
            document.getElementById("pOutTeklifNo").innerText = '#' + String(veri.id).padStart(4,'0');
            document.getElementById("pOutHazirlayan").innerText = veri.hazirlayan;

            var sirket = {};
            try { sirket = JSON.parse(localStorage.getItem("tm_sirket_bilgileri")) || {}; } catch(e) { sirket = {}; }
            var gsm = (sirket.gsm || "0544 235 98 32").toUpperCase();
            var email = (sirket.email || "turakmimarlik@gmail.com").toLowerCase();
            document.getElementById("pOutIletisim").innerHTML = 'GSM: ' + gsm + ' &nbsp;|&nbsp; E-MAİL: <span style="text-transform:lowercase">' + email + '</span>';

            var logoData = localStorage.getItem("tm_sirket_logo");
            var logoArea = document.getElementById("pOutLogoArea");
            if (logoData && logoData !== "null" && logoData.length > 100) {
                logoArea.innerHTML = '<img src="' + logoData + '" style="max-height:90px;max-width:250px;height:auto;display:block;">';
            } else {
                logoArea.innerText = "TURAK MİMARLIK";
            }

            const pBody = document.getElementById("pOutTableBody"); pBody.innerHTML = "";
            veri.kalemler.forEach(k => {
                const t = k.miktar * k.fiyat;
                pBody.innerHTML += `<tr><td class="pdf-cell-hizmet">${k.servis}</td><td style="text-align:center;">${k.miktar}</td><td style="text-align:center;">${k.birim||''}</td><td style="text-align:right;">${k.fiyat.toLocaleString('tr-TR')} ₺</td><td style="text-align:center;">%${k.kdv}</td><td style="text-align:right;">${t.toLocaleString('tr-TR')} ₺</td></tr>`;
            });

            document.getElementById("pOutAra").innerText = (veri.araTutar || 0).toLocaleString('tr-TR', {minimumFractionDigits: 2}) + " ₺";
            document.getElementById("pOutKdv").innerText = (veri.kdvTutar || 0).toLocaleString('tr-TR', {minimumFractionDigits: 2}) + " ₺";
            document.getElementById("pOutGenel").innerText = veri.genelTutar;

            const template = document.getElementById("pdf-export-template");
            const clone = template.cloneNode(true);
            clone.id = 'pdf-clone-' + Date.now();
            clone.style.cssText = 'display:flex;flex-direction:column;position:fixed;left:-9999px;top:0;width:210mm;height:297mm;overflow:hidden;padding:15mm 16mm;box-sizing:border-box;background:white;font-family:Montserrat,sans-serif;text-transform:uppercase;line-height:1.5;color:#1a1a1a;';
            document.body.appendChild(clone);
            var fname = (veri.isAdi || 'TEKLIF').replace(/[\\/:*?"<>|]/g,'_') + '_#' + String(veri.id).padStart(4,'0') + '.pdf';
            setTimeout(function(){
                html2canvas(clone,{scale:6,useCORS:true}).then(function(c){
                    var u=c.toDataURL('image/jpeg',1);
                    var p=new jspdf.jsPDF('portrait','mm','a4');
                    p.addImage(u,'JPEG',1,1,208,295);
                    p.save(fname);
                    document.body.removeChild(clone);
                }).catch(function(e){ tmAlert('PDF HATA: '+(e.message||e)); try{document.body.removeChild(clone)}catch(e){console.error("PDF clone DOM temizlik hatasi:", e);} });
            },100);
        }

        function teklifListesiTarihSirala() {
            const icon = document.getElementById("sort-direction-icon");
            if (TEKLIF_SIRALAMA_YONU === "AZALAN") {
                TEKLIF_SIRALAMA_YONU = "ARTAN";
                icon.innerText = "^";
            } else {
                TEKLIF_SIRALAMA_YONU = "AZALAN";
                icon.innerText = "v";
            }
            teklifListesiniYenile();
        }

        function teklifListesiniYenile() {
            var db;
            try { db = JSON.parse(localStorage.getItem("tm_teklifler_db_final")) || []; } catch(e) { db = []; console.error("Teklif listesi yukleme hatasi:", e); }
            const tbody = document.getElementById("teklifListTableBody");
            if(!tbody) return;
            const acikRows = new Set();
            tbody.querySelectorAll(".detail-expanded-row").forEach(function(r) {
                if (r.style.display === "table-row") acikRows.add(r.id);
            });
            tbody.innerHTML = "";
            var metaEl = document.getElementById("tlHeaderMeta");
            if(metaEl) metaEl.innerHTML = db.length > 0 ? 'Toplam <strong>' + db.length + '</strong> teklif' : '';
            if(db.length === 0) { tbody.innerHTML = '<tr><td colspan="7">'+tmEmptyStateHTML('<i class="fa-regular fa-file-lines"></i>','Henüz kayıtlı teklif bulunmuyor.','Yeni bir teklif oluşturmak için yukarıdaki butonu kullanın.')+'</td></tr>'; return; }

            db.sort((a, b) => {
                const parseDate = (dateStr) => {
                    if(!dateStr || dateStr === "-") return new Date(0);
                    const parts = dateStr.split(".");
                    return new Date(parts[2], parts[1] - 1, parts[0]);
                };
                const dateA = parseDate(a.sTarih);
                const dateB = parseDate(b.sTarih);
                
                if (dateA.getTime() === dateB.getTime()) {
                    return TEKLIF_SIRALAMA_YONU === "AZALAN" ? b.id - a.id : a.id - b.id;
                }
                return TEKLIF_SIRALAMA_YONU === "AZALAN" ? dateB - dateA : dateA - dateB;
            });

            db.forEach((t, index) => {
                const formatliId = "#" + String(t.id).padStart(4, '0');
                let kalemHTML = "";
                t.kalemler.forEach(k => {
                    const toplamKalem = k.miktar * k.fiyat;
                    kalemHTML += `<tr><td style="padding:6px 8px;">${k.servis}</td><td style="text-align:center;padding:6px 8px;white-space:nowrap;">${k.miktar}</td><td style="text-align:center;padding:6px 8px;white-space:nowrap;">${k.birim||''}</td><td style="text-align:right;padding:6px 8px;white-space:nowrap;">${k.fiyat.toLocaleString('tr-TR')} \u20BA</td><td style="text-align:center;padding:6px 8px;white-space:nowrap;">%${k.kdv}</td><td style="text-align:right;padding:6px 8px;white-space:nowrap;">${toplamKalem.toLocaleString('tr-TR')} \u20BA</td></tr>`;
                });

                tbody.innerHTML += `
                    <tr class="teklif-row-item teklif-row-header" onclick="teklifDetayiniAcKapat(${t.id})">
                        <td class="search-target-id" style="font-weight:700; color:var(--accent-red);">${formatliId}</td>
                        <td class="search-target-date">${t.sTarih}</td>
                        <td class="search-target-m"><b>${t.musteriAd}</b><br><small class="search-target-f">${t.firma}</small></td>
                        <td class="search-target-j">${t.isAdi}</td>
                        <td class="search-target-h">${t.hazirlayan}</td>
                        <td style="color:var(--accent-red); font-weight:700;white-space:nowrap;">${t.genelTutar}</td>
                        <td>
                            <button class="btn btn-pdf-red btn-sm" onclick="event.stopPropagation(); eskiTeklifPdfUretDbId(${t.id})"><i class="fa-regular fa-file-lines"></i> PDF</button> 
                            <button class="btn-danger" onclick="event.stopPropagation(); teklifSilDbId(${t.id})">Sil</button>
                        </td>
                    </tr>
                    <tr id="detail-row-${t.id}" class="detail-expanded-row">
                        <td colspan="7">
                            <div class="detail-panel-inner">
                                <div class="detail-grid-box">
                                    <div style="font-weight:700; border-bottom:1px solid var(--border-color); padding-bottom:8px; margin-bottom:12px; color:var(--accent-red); font-size:13px;"><i class="fa-solid fa-magnifying-glass-plus"></i> TEKLİF İÇERİK DETAYI</div>
                                    <p style="margin:5px 0; font-size:13px;"><b>Müşteri Telefon:</b> ${t.telefon}</p>
                                    <table style="width:100%; border-collapse:collapse; font-size:13px; margin-top:10px; table-layout:auto;">
                                        <thead>
                                            <tr style="background:var(--bg-main); font-weight:700;">
                                                <th style="padding:6px 8px; text-align:left;width:auto;">Hizmet Kalemi</th>
                                                <th style="padding:6px 8px; text-align:center;white-space:nowrap;width:60px;">Miktar</th>
                                                <th style="padding:6px 8px; text-align:center;white-space:nowrap;width:50px;">Birim</th>
                                                <th style="padding:6px 8px; text-align:right;white-space:nowrap;width:100px;">Br. Fiyat</th>
                                                <th style="padding:6px 8px; text-align:center;white-space:nowrap;width:50px;">KDV</th>
                                                <th style="padding:6px 8px; text-align:right;white-space:nowrap;width:120px;">Toplam</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${kalemHTML}
                                            <tr style="border-top:2px solid var(--border-color); font-weight:600;"><td colspan="5" style="text-align:right;padding:6px 8px;white-space:nowrap;">ARA TOPLAM:</td><td style="text-align:right;padding:6px 8px;white-space:nowrap;">${(t.araTutar || 0).toLocaleString('tr-TR', {minimumFractionDigits:2})} \u20BA</td></tr>
                                            <tr style="font-weight:600;"><td colspan="5" style="text-align:right;padding:6px 8px;white-space:nowrap;">TOPLAM K.D.V:</td><td style="text-align:right;padding:6px 8px;white-space:nowrap;">${(t.kdvTutar || 0).toLocaleString('tr-TR', {minimumFractionDigits:2})} \u20BA</td></tr>
                                            <tr style="font-weight:700; color:var(--accent-red); background:var(--bg-main);"><td colspan="5" style="text-align:right;padding:6px 8px;white-space:nowrap;">GENEL TOPLAM:</td><td style="text-align:right;padding:6px 8px;white-space:nowrap;">${t.genelTutar}</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </td>
                    </tr>
                `;
            });
            acikRows.forEach(function(id) {
                var r = document.getElementById(id);
                if (r) r.style.display = "table-row";
            });
            teklifleriFiltrele();
        }

        function teklifDetayiniAcKapat(dbId) {
            const row = document.getElementById(`detail-row-${dbId}`);
            if(row) row.style.display = (row.style.display === "table-row") ? "none" : "table-row";
        }

        function eskiTeklifPdfUretDbId(dbId) { 
            const db = JSON.parse(localStorage.getItem("tm_teklifler_db_final")) || [];
            const kayit = db.find(item => item.id === dbId);
            if(kayit) pdfSablonunuDoldurVeIndir(kayit); 
        }
        
        function teklifSilDbId(dbId) { 
            tmConfirm("Bu teklifi listeden tamamen silmek istediğinize emin misiniz?", function() { 
                let db = JSON.parse(localStorage.getItem("tm_teklifler_db_final")) || [];
                db = db.filter(item => item.id != dbId);
                localStorage.setItem("tm_teklifler_db_final", JSON.stringify(db)); 
                teklifListesiniYenile(); 
                dashboardVerileriniGuncelle();
                musteriKartlariniYenile();
                aktiviteEkle("Teklif silindi: #" + dbId, "Teklif");
            });
        }
        
        function teklifleriFiltrele() {
            const kelime = document.getElementById("teklifAramaInput").value.toLowerCase().trim();
            document.querySelectorAll("#teklifListTableBody .teklif-row-item").forEach((satir) => {
                const fid = satir.querySelector(".search-target-id").innerText.toLowerCase(); 
                const dt = satir.querySelector(".search-target-date").innerText.toLowerCase(); 
                const m = satir.querySelector(".search-target-m").innerText.toLowerCase();
                const f = satir.querySelector(".search-target-f").innerText.toLowerCase();
                const j = satir.querySelector(".search-target-j").innerText.toLowerCase();
                const h = satir.querySelector(".search-target-h").innerText.toLowerCase();
                
                const match = satir.nextElementSibling;
                const hamSayiId = fid.replace("#", "").replace(/^0+/, ""); 

                if (m.includes(kelime) || f.includes(kelime) || j.includes(kelime) || h.includes(kelime) || dt.includes(kelime) || fid.includes(kelime) || hamSayiId.includes(kelime)) {
                    satir.style.display = "";
                } else {
                    satir.style.display = "none";
                    if(match && match.classList.contains("detail-expanded-row")) match.style.display = "none";
                }
            });
        }

        function piyasaVerisiKaydet() {
            const dal = document.getElementById("pYonetimDal").value;
            const kisi = trToUpper(document.getElementById("pYonetimKisi").value.trim());
            const firma = trToUpper(document.getElementById("pYonetimFirma").value.trim());
            const tarihInput = document.getElementById("pYonetimTarih").value;
            const birim = document.getElementById("pYonetimBirimTipi").value;
            const fiyat = tmTutarCoz(document.getElementById("pYonetimBirimFiyat").value);

            if(!kisi && !firma) { tmNotify("Lütfen Kişi veya Firma adı alanlarından en az birini doldurunuz.", "error"); return; }
            if(!dal) { tmNotify("Lütfen önce bir Proje/Hizmet Dalı seçin.", "error"); return; }
            if(!tarihInput || fiyat <= 0) {
                tmNotify("Lütfen geçerli bir tarih ve sıfırdan büyük bir fiyat giriniz.", "error"); return;
            }

            const db = JSON.parse(localStorage.getItem("tm_piyasa_db_v2")) || [];
            const app = { dal, kisi, firma, tarih: tarihInput, fiyat, birim };
            db.push(app);
            localStorage.setItem("tm_piyasa_db_v2", JSON.stringify(db));

            piyasaFormunuTemizle();
            piyasaListesiniYenile();
            dashboardVerileriniGuncelle();
            isOrtaklariKartlariniYenile();
            tmNotify("Piyasa fiyat kaydı başarıyla eklendi.", "success");
        }

        function piyasaGrupSirala(grupAdi, sutun) {
            const anahtar = `${grupAdi}_${sutun}`;
            if (!P_GRUP_SIRALAMA[anahtar] || P_GRUP_SIRALAMA[anahtar] === "AZALAN") {
                P_GRUP_SIRALAMA[anahtar] = "ARTAN";
            } else {
                P_GRUP_SIRALAMA[anahtar] = "AZALAN";
            }
            piyasaListesiniYenile();
        }

        function piyasaListesiniYenile() {
            const konteyner = document.getElementById("piyasaGruplanmisTablolarKonteyner");
            if(!konteyner) return; konteyner.innerHTML = "";

            var db;
            try { db = JSON.parse(localStorage.getItem("tm_piyasa_db_v2")) || []; } catch(e) { db = []; console.error("Piyasa listesi yukleme hatasi:", e); }
            db = db.filter(item => SABIT_DALLAR.includes(item.dal));

            if(db.length === 0) {
                konteyner.innerHTML = `<div style="text-align:center; padding: 20px; background: var(--bg-main); border-radius: 6px; border:1px solid var(--border-color);">Kayıtlı piyasa fiyat verisi bulunmuyor.</div>`;
                return;
            }

            const gruplar = {};
            db.forEach((item, orijinalIndis) => {
                if(!gruplar[item.dal]) { gruplar[item.dal] = []; }
                gruplar[item.dal].push({ veri: item, globalIndex: orijinalIndis });
            });

            Object.keys(gruplar).forEach(grupAdi => {
                const tarihYon = P_GRUP_SIRALAMA[`${grupAdi}_tarih`] || "AZALAN";
                const fiyatYon = P_GRUP_SIRALAMA[`${grupAdi}_fiyat`] || "YOK";

                gruplar[grupAdi].sort((a, b) => {
                    if(fiyatYon !== "YOK") {
                        return fiyatYon === "ARTAN" ? a.veri.fiyat - b.veri.fiyat : b.veri.fiyat - a.veri.fiyat;
                    }
                    const dateA = new Date(a.veri.tarih);
                    const dateB = new Date(b.veri.tarih);
                    return tarihYon === "ARTAN" ? dateA - dateB : dateB - dateA;
                });

                const tOk = tarihYon === "ARTAN" ? "^" : "v";
                const fOk = fiyatYon === "ARTAN" ? "^" : (fiyatYon === "AZALAN" ? "v" : "|");

                let tabloHTML = `
                    <h3 style="margin-top: 25px; border-left: 5px solid var(--accent-red); padding-left: 10px; display:flex; justify-content:space-between; align-items:center;">
                        <span>${grupAdi}</span>
                    </h3>
                    <table class="app-table">
                        <thead>
                            <tr>
                                <th style="width: 35%;">Kişi / Firma Adı</th>
                                <th style="width: 20%;" class="th-sortable" onclick="P_GRUP_SIRALAMA['${grupAdi}_fiyat']='YOK'; piyasaGrupSirala('${grupAdi}', 'tarih')">Fiyat Alınan Tarih ${tOk}</th>
                                <th style="width: 25%;" class="th-sortable" onclick="piyasaGrupSirala('${grupAdi}', 'fiyat')">Hesaplanan Tutar / Hesap Tipi ${fOk}</th>
                                <th style="width: 20%;">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                gruplar[grupAdi].forEach(eleman => {
                    const item = eleman.veri;
                    const globalIdx = eleman.globalIndex;
                    const formatliTarih = item.tarih ? new Date(item.tarih).toLocaleDateString("tr-TR") : "-";
                    const formatliFiyat = item.fiyat.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + " ₺";

                    tabloHTML += `
                        <tr>
                            <td><b>${item.kisi}</b><br><small style="color:var(--text-light)">${item.firma}</small></td>
                            <td>${formatliTarih}</td>
                            <td><span style="font-weight:700; color:var(--btn-green); font-size:14px;">${formatliFiyat}</span> <small style="color:var(--text-light); font-weight:600;">(${item.birim})</small></td>
                            <td><button class="btn-danger" onclick="piyasaVerisiSilDirekt(${globalIdx})">Sil</button></td>
                        </tr>
                    `;
                });

                tabloHTML += `</tbody></table>`;
                konteyner.innerHTML += tabloHTML;
            });
        }

        function piyasaVerisiSilDirekt(globalIndex) {
            tmConfirm("Bu piyasa fiyat kaydını tamamen silmek istediğinize emin misiniz?", function() {
                let db = JSON.parse(localStorage.getItem("tm_piyasa_db_v2")) || [];
                db.splice(globalIndex, 1);
                localStorage.setItem("tm_piyasa_db_v2", JSON.stringify(db));
                piyasaListesiniYenile();
                dashboardVerileriniGuncelle();
                isOrtaklariKartlariniYenile();
            });
        }

        /* ================= İŞ MUHASEBESİ MOTORU ================= */
        function isMuhasebeVerileriniYukle() {
            try { return JSON.parse(localStorage.getItem("tm_is_muhasebe_db")) || []; } catch(e) { console.error("isMuhasebe veri yukleme hatasi:", e); return []; }
        }

        function isMuhSonrakiId() {
            let db = isMuhasebeVerileriniYukle();
            let tamamlananDb = tamamlananIsMuhasebeVerileriniYukle();
            let usedIds = new Set([...db.map(r => r.id), ...tamamlananDb.map(r => r.id)]);
            let id = 1;
            while(usedIds.has(id)) id++;
            return id;
        }

        function isMuhasebeIdUret() {
            return isMuhSonrakiId();
        }

        function isMuhFormIdGuncelle() {
            const el = document.getElementById("isMuhId");
            if(!el) return;
            const editId = document.getElementById("isMuhEditId").value;
            if(editId === "-1") {
                el.value = "#" + String(isMuhSonrakiId()).padStart(4, '0');
            } else {
                el.value = "#" + String(parseInt(editId)).padStart(4, '0');
            }
        }

        function isMuhasebeKaydet() {
            const isAdi = trToUpper(document.getElementById("isMuhIsAdi").value.trim());
            const firma = trToUpper(document.getElementById("isMuhFirma").value.trim());
            const pafta = trToUpper(document.getElementById("isMuhPafta").value.trim());
            const ada = trToUpper(document.getElementById("isMuhAda").value.trim());
            const parsel = trToUpper(document.getElementById("isMuhParsel").value.trim());
            const anlasmaUcreti = tmTutarCoz(document.getElementById("isMuhAnlasmaUcreti").value);
            const anlasmaTarihi = document.getElementById("isMuhAnlasmaTarihi").value;
            const editId = document.getElementById("isMuhEditId").value;

            if(!isAdi) { tmNotify("İş adı zorunludur!", "error"); return; }
            if(anlasmaUcreti <= 0) { tmNotify("Geçerli bir anlaşma ücreti giriniz!", "error"); return; }

            let db = isMuhasebeVerileriniYukle();

            if(editId === "-1") {
                db.push({
                    id: isMuhasebeIdUret(),
                    isAdi: isAdi,
                    firma: firma || "-",
                    pafta: pafta || "-",
                    ada: ada || "-",
                    parsel: parsel || "-",
                    anlasmaUcreti: anlasmaUcreti,
                    anlasmaTarihi: anlasmaTarihi || anlikTarihGetir(),
                    kalemler: []
                });
                tmNotify("İş muhasebesi kaydı başarıyla oluşturuldu.", "success");
                aktiviteEkle("İş muhasebesi oluşturuldu: " + (isAdi || ""), "Muhasebe");
            } else {
                const targetId = parseInt(editId);
                db = db.map(item => item.id === targetId ? { ...item, isAdi, firma, pafta, ada, parsel, anlasmaUcreti, anlasmaTarihi: anlasmaTarihi || anlikTarihGetir() } : item);
                tmNotify("İş muhasebesi kaydı güncellendi.", "success");
                aktiviteEkle("İş muhasebesi güncellendi: " + (isAdi || ""), "Muhasebe");
                document.getElementById("isMuhEditId").value = "-1";
                document.getElementById("isMuhFormTitle").innerText = "Yeni İş Muhasebesi Kaydı Oluştur";
            }

            localStorage.setItem("tm_is_muhasebe_db", JSON.stringify(db));
            isMuhasebeFormuTemizle();
            isMuhasebeListesiniYenile();
            menudenSayfaAc('is-muhasebe', 'is-muhasebe-page', document.getElementById('sub-is-muhasebe'));
        }

        function isMuhasebeFormuTemizle() {
            document.getElementById("isMuhIsAdi").value = "";
            document.getElementById("isMuhFirma").value = "";
            document.getElementById("isMuhPafta").value = "";
            document.getElementById("isMuhAda").value = "";
            document.getElementById("isMuhParsel").value = "";
            document.getElementById("isMuhAnlasmaUcreti").value = "";
            document.getElementById("isMuhAnlasmaTarihi").value = anlikTarihGetir();
            document.getElementById("isMuhEditId").value = "-1";
            document.getElementById("isMuhFormTitle").innerText = "Yeni İş Muhasebesi Kaydı Oluştur";
            isMuhFormIdGuncelle();
        }

        function isMuhasebeDuzenle(id) {
            const db = isMuhasebeVerileriniYukle();
            const kayit = db.find(k => k.id === id);
            if(!kayit) return;

            document.getElementById("isMuhFormTitle").innerHTML = '<i class="fa-solid fa-gear"></i> İş Muhasebesi Kaydını Düzenle';
            document.getElementById("isMuhEditId").value = kayit.id;
            document.getElementById("isMuhIsAdi").value = kayit.isAdi;
            document.getElementById("isMuhFirma").value = kayit.firma || "";
            document.getElementById("isMuhPafta").value = kayit.pafta || "";
            document.getElementById("isMuhAda").value = kayit.ada || "";
            document.getElementById("isMuhParsel").value = kayit.parsel || "";
            document.getElementById("isMuhAnlasmaUcreti").value = (kayit.anlasmaUcreti || 0).toLocaleString('tr-TR', {minimumFractionDigits:2});
            document.getElementById("isMuhAnlasmaTarihi").value = kayit.anlasmaTarihi || anlikTarihGetir();
            isMuhFormIdGuncelle();

            menudenSayfaAc('is-muhasebe-olustur', 'is-muhasebe-olustur-page', document.getElementById('sub-is-muhasebe-olustur'));
        }

        function isMuhasebeSil(id) {
            tmConfirm("Bu iş muhasebesi kaydını tamamen silmek istediğinize emin misiniz?", function() {
                let db = isMuhasebeVerileriniYukle();
                db = db.filter(k => k.id !== id);
                localStorage.setItem("tm_is_muhasebe_db", JSON.stringify(db));
                isMuhasebeListesiniYenile();
                tmNotify("İş muhasebesi kaydı silindi.", "success");
            });
        }

        function isMuhKartToggle(id, event) {
            if(event && event.target.closest('button, input, select, a, label, .card-actions')) return;
            const content = document.getElementById("isMuhKartContent_" + id);
            if(content) {
                content.classList.toggle("open");
                content.closest('.is-muh-card')?.classList.toggle("open");
            }
        }

        function isMuhasebeListesiniYenile() {
            const konteyner = document.getElementById("isMuhasebeKartKonteyner");
            if(!konteyner) return;

            const onceExpanded = new Set();
            document.querySelectorAll('.is-muh-card').forEach(card => {
                const content = card.querySelector('[id^="isMuhKartContent_"]');
                if(content && content.classList.contains('open')) {
                    const id = content.id.replace('isMuhKartContent_', '');
                    onceExpanded.add(parseInt(id));
                }
            });

            konteyner.innerHTML = "";

            const db = isMuhasebeVerileriniYukle();
            const partnerDb = JSON.parse(localStorage.getItem("tm_isortaklari_db")) || [];

            const serit = document.getElementById("isMuhGenelDurumSeridi");
            if(serit) {
                let genelHacim = 0, genelTahsilat = 0, genelVerecek = 0, genelOdenen = 0;
                db.forEach(kayit => {
                    genelHacim += kayit.anlasmaUcreti || 0;
                    kayit.kalemler.forEach(k => {
                        if(k.tip === "alacak") genelTahsilat += k.tutar;
                        else {
                            genelVerecek += k.tutar;
                            genelOdenen += (k.odenenTutar || 0);
                        }
                    });
                });
                const genelKar = genelHacim - genelVerecek;
                const genelKalan = genelVerecek - genelOdenen;
                const genelKalanTahsilat = genelHacim - genelTahsilat;
                const genelNet = genelTahsilat - genelVerecek;
                const genelKarYuzde = genelHacim > 0 ? ((genelKar / genelHacim) * 100).toFixed(1) : "0.0";
                const karRenk = genelKar >= 0 ? "var(--btn-green)" : "var(--accent-red)";
                const netRenk = genelNet >= 0 ? "var(--btn-green)" : "var(--accent-red)";
                const karYuzdeRenk = parseFloat(genelKarYuzde) >= 0 ? "var(--btn-green)" : "var(--accent-red)";
                serit.innerHTML = `
                    <div style="display:flex; flex-direction:column; gap:10px; width:100%; padding:18px 10px; box-sizing:border-box;">
                        <div style="display:flex; justify-content:center; text-align:center; gap:8px; padding-bottom:8px; border-bottom:1px solid var(--border-color);">
                            <div style="padding:0 20px;"><small style="font-size:11px; color:var(--text-light); font-weight:600; display:block; letter-spacing:0.5px;">AKTİF İŞLER</small><span style="font-weight:900; color:var(--accent-red); font-size:28px;">${db.length}</span></div>
                        </div>
                        <div style="display:flex; justify-content:space-around; text-align:center; gap:8px;">
                            <div style="flex:1; border-right:1px solid var(--border-color); padding:0 10px;"><small style="font-size:12px; color:var(--text-light); font-weight:600; display:block; letter-spacing:0.5px;">GENEL İŞ HACMİ</small><span style="font-weight:900; color:var(--accent-red); font-size:22px;">${genelHacim.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                            <div style="flex:1; border-right:1px solid var(--border-color); padding:0 10px;"><small style="font-size:12px; color:var(--text-light); font-weight:600; display:block; letter-spacing:0.5px;">GENEL KAR</small><span style="font-weight:900; color:${karRenk}; font-size:22px;">${genelKar.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                            <div style="flex:1; border-right:1px solid var(--border-color); padding:0 10px;"><small style="font-size:12px; color:var(--text-light); font-weight:600; display:block; letter-spacing:0.5px;">GENEL KAR %</small><span style="font-weight:900; color:${karYuzdeRenk}; font-size:22px;">%${genelKarYuzde}</span></div>
                            <div style="flex:1; border-right:1px solid var(--border-color); padding:0 10px;"><small style="font-size:12px; color:var(--text-light); font-weight:600; display:block; letter-spacing:0.5px;">GENEL TAHSİLAT</small><span style="font-weight:900; color:var(--btn-green); font-size:22px;">${genelTahsilat.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                            <div style="flex:1; padding:0 10px;"><small style="font-size:12px; color:var(--text-light); font-weight:600; display:block; letter-spacing:0.5px;">GENEL ÖDENEN</small><span style="font-weight:900; color:var(--accent-red); font-size:22px;">${genelOdenen.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                        </div>
                        <div style="display:flex; justify-content:space-around; text-align:center; gap:8px; padding-top:10px; border-top:1px solid var(--border-color);">
                            <div style="flex:1; border-right:1px solid var(--border-color); padding:0 10px;"><small style="font-size:12px; color:var(--text-light); font-weight:600; display:block; letter-spacing:0.5px;">GENEL KALAN ÖDEME</small><span style="font-weight:900; color:var(--accent-red); font-size:22px;">${genelKalan.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                            <div style="flex:1; border-right:1px solid var(--border-color); padding:0 10px;"><small style="font-size:12px; color:var(--text-light); font-weight:600; display:block; letter-spacing:0.5px;">KALAN TAHSİLAT</small><span style="font-weight:900; color:var(--btn-green); font-size:22px;">${genelKalanTahsilat.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                            <div style="flex:1; padding:0 10px;"><small style="font-size:12px; color:var(--text-light); font-weight:600; display:block; letter-spacing:0.5px;">NET</small><span style="font-weight:900; color:${netRenk}; font-size:22px;">${genelNet.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                        </div>
                    </div>
                `;
            }

            if(db.length === 0) {
                konteyner.innerHTML = tmEmptyStateHTML('<i class="fa-solid fa-chart-simple"></i>','Henüz iş muhasebesi kaydı bulunmamaktadır.','Önce "İş Muhasebesi Oluştur" sayfasından bir kayıt oluşturun.');
                return;
            }

            db.sort((a, b) => b.id - a.id);

            db.forEach(kayit => {
                let toplamAlacak = 0, toplamVerecek = 0, toplamOdenen = 0;
                kayit.kalemler.forEach(k => {
                    if(k.tip === "alacak") toplamAlacak += k.tutar;
                    else {
                        toplamVerecek += k.tutar;
                        toplamOdenen += (k.odenenTutar || 0);
                    }
                });
                const kalanToplam = toplamVerecek - toplamOdenen;
                const toplamKar = (kayit.anlasmaUcreti || 0) - toplamVerecek;
                const netDurum = toplamAlacak - toplamVerecek;
                const karRenk = toplamKar >= 0 ? "var(--btn-green)" : "var(--accent-red)";
                const netRenkKart = netDurum >= 0 ? "var(--btn-green)" : "var(--accent-red)";
                const karYuzde = kayit.anlasmaUcreti > 0 ? ((toplamKar / kayit.anlasmaUcreti) * 100).toFixed(1) : "0.0";
                const karYuzdeRenkKart = parseFloat(karYuzde) >= 0 ? "var(--btn-green)" : "var(--accent-red)";
                const paftaAdi = kayit.pafta && kayit.pafta !== "-" ? kayit.pafta : "";
                const adaAdi = kayit.ada && kayit.ada !== "-" ? kayit.ada : "";
                const parselAdi = kayit.parsel && kayit.parsel !== "-" ? kayit.parsel : "";
                const paftaAdaParsel = (paftaAdi ? "Pafta: " + paftaAdi + ", " : "") + (adaAdi ? "Ada: " + adaAdi + ", " : "") + (parselAdi ? "Parsel: " + parselAdi : "") || kayit.parsel || "-";

                const alacakKalemler = kayit.kalemler.filter(k => k.tip === "alacak");
                const verecekKalemler = kayit.kalemler.filter(k => k.tip !== "alacak");

                let alacakHTML = "";
                alacakKalemler.forEach(k => {
                    alacakHTML += `<tr>
                        <td style="padding:8px 6px; font-size:13px;">${k.aciklama || "-"}</td>
                        <td style="padding:8px 6px; font-size:13px; text-align:right; font-weight:700; color:var(--btn-green);">${(k.tutar || 0).toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</td>
                        <td style="padding:8px 6px; font-size:12px;">${k.tarih ? new Date(k.tarih).toLocaleDateString("tr-TR") : "-"}</td>
                        <td style="padding:8px 6px; text-align:center;"><button class="btn-danger" onclick="isMuhasebeKalemSil(${kayit.id}, ${k.kalemId})" style="padding:4px 10px; font-size:11px;">X</button></td>
                    </tr>`;
                });

                const partnerOptions = partnerDb.map(p => '<option value="' + p.ad + '">' + p.ad + (p.sirket && p.sirket !== "BİREYSEL" ? " (" + p.sirket + ")" : "") + '</option>').join('');

                let verecekHTML = "";
                verecekKalemler.forEach(k => {
                    const odenen = k.odenenTutar || 0;
                    const kalan = k.tutar - odenen;
                    let durumRenk, durumText;
                    if(odenen <= 0) { durumRenk = "var(--accent-red)"; durumText = "ÖDENMEDİ"; }
                    else if(odenen < k.tutar) { durumRenk = "#e67e22"; durumText = "KISMİ ÖDENDİ"; }
                    else { durumRenk = "var(--btn-green)"; durumText = "ÖDENDİ"; }

                    const seciliKisi = k.kisi || "";

                    verecekHTML += `<tr>
                        <td style="padding:8px 6px; font-size:13px;">${k.dal || k.aciklama || "-"}</td>
                        <td style="padding:8px 6px; font-size:11px; color:var(--text-light);">${k.kisi || "-"}</td>
                        <td style="padding:8px 6px; font-size:13px; text-align:right; font-weight:700;">${(k.tutar || 0).toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</td>
                        <td style="padding:8px 6px; font-size:13px; text-align:right; font-weight:600; color:var(--btn-green);">${odenen.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</td>
                        <td style="padding:8px 6px; font-size:13px; text-align:right; font-weight:600; color:var(--accent-red);">${kalan.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</td>
                        <td style="padding:8px 6px; font-size:12px;">${k.odemeTarihi ? new Date(k.odemeTarihi).toLocaleDateString("tr-TR") : "-"}</td>
                        <td style="padding:8px 6px; text-align:center;"><span style="font-size:11px; font-weight:700; padding:3px 8px; border-radius:4px; color:white; background:${durumRenk};">${durumText}</span></td>
                        <td style="padding:8px 6px; text-align:center; white-space:nowrap;">
                            <button class="btn-warning" onclick="isMuhasebeFormGoster('odemeYapForm_${kayit.id}_${k.kalemId}', '${kayit.id}_${k.kalemId}')" style="padding:4px 10px; font-size:11px;">Ödeme Yap</button>
                            <button class="btn-danger" onclick="isMuhasebeKalemSil(${kayit.id}, ${k.kalemId})" style="padding:4px 10px; font-size:11px;">X</button>
                        </td>
                    </tr>
                    <tr id="odemeYapFormRow_${kayit.id}_${k.kalemId}" style="display:none;">
                        <td colspan="8" style="padding:0;">
                            <div id="odemeYapForm_${kayit.id}_${k.kalemId}" class="inline-form" style="display:none; margin:4px 8px;">
                                <label>ÖDEME TUTARI (₺)<br><input type="text" id="odemeYapTutar_${kayit.id}_${k.kalemId}" placeholder="0.000,00" style="text-transform:none; text-align:right; flex:1; min-width:80px;" oninput="tmTutarFormatla(this)" onblur="tmTutarBlur(this)"></label>
                                <label>TARİH<br><input type="date" id="odemeYapTarih_${kayit.id}_${k.kalemId}" value="${anlikTarihGetir()}" style="flex:1; min-width:120px;"></label>
                                <div style="display:flex; gap:4px; align-self:flex-end;">
                                    <button class="btn-form btn-form-save" onclick="isMuhasebeOdemeYapKaydet(${kayit.id}, ${k.kalemId})">KAYDET</button>
                                    <button class="btn-form btn-form-cancel" onclick="isMuhasebeFormKapat('odemeYapForm_${kayit.id}_${k.kalemId}', '${kayit.id}_${k.kalemId}')">İPTAL</button>
                                </div>
                            </div>
                        </td>
                    </tr>
                    ${(() => {
                        const kayitlar = k.odemeKayitlari || [];
                        if(kayitlar.length === 0 && k.odenenTutar > 0) {
                            kayitlar.push({ tutar: k.odenenTutar, tarih: k.odemeTarihi || k.tarih || "" });
                        }
                        if(kayitlar.length === 0) return '';
                        let gecmisHTML = '<tr><td colspan="8" style="padding:4px 8px 8px 8px;"><div style="font-size:11px; background:var(--bg-main); border-radius:4px; padding:6px 10px; border:1px solid var(--border-color);">';
                        gecmisHTML += '<span style="font-weight:700; font-size:10px; color:var(--text-light); display:block; margin-bottom:4px;">ÖDEME GEÇMİŞİ</span>';
                        kayitlar.forEach((od, odIdx) => {
                            const odemeTarih = od.tarih ? new Date(od.tarih).toLocaleDateString("tr-TR") : "-";
                            gecmisHTML += '<div style="display:flex; align-items:center; gap:8px; margin:3px 0; flex-wrap:wrap;">';
                            gecmisHTML += '<span style="font-size:12px;">• ' + od.tutar.toLocaleString('tr-TR', {minimumFractionDigits:2}) + ' ₺ <span style="color:var(--text-light);">(' + odemeTarih + ')</span></span>';
                            gecmisHTML += '<button class="btn-warning" onclick="isMuhasebeOdemeGecmisiGosterEdit(' + kayit.id + ',' + k.kalemId + ',' + odIdx + ')" style="padding:2px 8px; font-size:10px;">Düzenle</button>';
                            gecmisHTML += '<button class="btn-danger" onclick="isMuhasebeOdemeGecmisiSil(' + kayit.id + ',' + k.kalemId + ',' + odIdx + ')" style="padding:2px 8px; font-size:10px;">Sil</button>';
                            gecmisHTML += '</div>';
                            gecmisHTML += '<div id="odemeGecmisiEdit_' + kayit.id + '_' + k.kalemId + '_' + odIdx + '" class="inline-form" style="display:none; margin:2px 0 6px 0; padding:6px 8px;">';
                            gecmisHTML += '<label>TUTAR (₺)<br><input type="text" id="odemeGecEditTutar_' + kayit.id + '_' + k.kalemId + '_' + odIdx + '" value="' + od.tutar.toFixed(2) + '" style="text-transform:none; text-align:right; flex:1; min-width:80px;" oninput="tmTutarFormatla(this)" onblur="tmTutarBlur(this)"></label>';
                            gecmisHTML += '<label>TARİH<br><input type="date" id="odemeGecEditTarih_' + kayit.id + '_' + k.kalemId + '_' + odIdx + '" value="' + (od.tarih || '') + '" style="flex:1; min-width:120px;"></label>';
                            gecmisHTML += '<div style="display:flex; gap:4px; align-self:flex-end;">';
                            gecmisHTML += '<button class="btn-form btn-form-save" onclick="isMuhasebeOdemeGecmisiKaydet(' + kayit.id + ',' + k.kalemId + ',' + odIdx + ')" style="padding:4px 10px; font-size:10px;">KAYDET</button>';
                            gecmisHTML += '<button class="btn-form btn-form-cancel" onclick="isMuhasebeOdemeGecmisiKapatEdit(' + kayit.id + ',' + k.kalemId + ',' + odIdx + ')" style="padding:4px 10px; font-size:10px;">İPTAL</button>';
                            gecmisHTML += '</div></div>';
                        });
                        gecmisHTML += '</div></td></tr>';
                        return gecmisHTML;
                    })()}`;
                });

                const formatliId = "#" + String(kayit.id).padStart(4, '0');

                const kalanTahsilat = (kayit.anlasmaUcreti || 0) - toplamAlacak;
                const kalanTahsilatRenk = kalanTahsilat >= 0 ? "var(--accent-red)" : "var(--btn-green)";
                const tahsilatYuzde = (kayit.anlasmaUcreti || 0) > 0 ? Math.min(100, Math.round((toplamAlacak / (kayit.anlasmaUcreti || 0)) * 100)) : 0;
                const odemeYuzde = toplamVerecek > 0 ? Math.min(100, Math.round((toplamOdenen / toplamVerecek) * 100)) : 0;

                konteyner.innerHTML += `
                    <div class="portfolio-card is-muh-card" data-search="${kayit.isAdi} ${kayit.firma} ${paftaAdaParsel} ${formatliId}" style="width:100%; cursor:pointer;" onclick="isMuhKartToggle(${kayit.id}, event)">
                        <div class="card-main-header" style="display:flex; justify-content:space-between; align-items:center;">
                            <div style="flex:1; display:flex; flex-direction:column; gap:4px;">
                                <div style="display:flex; align-items:center; gap:10px;">

                                    <h4 style="margin:0;">${kayit.isAdi}</h4>
                                </div>
                                <div style="display:flex; gap:15px; font-size:13px;">
                                    ${kayit.firma && kayit.firma !== "-" ? '<span style="color:var(--text-light);"><b>Firma:</b> ' + kayit.firma + '</span>' : ''}
                                    ${paftaAdaParsel && paftaAdaParsel !== "-" ? '<span style="color:var(--text-light);">' + paftaAdaParsel + '</span>' : ''}
                                </div>
                            </div>
                            <div style="display:flex; align-items:center; gap:30px;">
                                <div style="display:flex; flex-direction:column; gap:5px; min-width:440px;">
                                    <div style="display:flex; align-items:center; gap:8px;"><span style="font-size:13px; color:var(--btn-green); font-weight:700; min-width:54px;">Tahsilat</span><div style="flex:1; height:15px; background:var(--bg-main); border-radius:6px; overflow:hidden; box-shadow:inset 0 1px 3px rgba(0,0,0,0.15);"><div style="height:100%; width:${tahsilatYuzde}%; background:linear-gradient(90deg, var(--btn-green), #4caf50); border-radius:6px; transition:width 0.4s;"></div></div><span style="font-size:13px; color:var(--text-light); font-weight:700; min-width:40px; text-align:right;">%${tahsilatYuzde}</span></div>
                                    <div style="display:flex; align-items:center; gap:8px;"><span style="font-size:13px; color:var(--accent-red); font-weight:700; min-width:54px;">Ödeme</span><div style="flex:1; height:15px; background:var(--bg-main); border-radius:6px; overflow:hidden; box-shadow:inset 0 1px 3px rgba(0,0,0,0.15);"><div style="height:100%; width:${odemeYuzde}%; background:linear-gradient(90deg, var(--accent-red), #ff5722); border-radius:6px; transition:width 0.4s;"></div></div><span style="font-size:13px; color:var(--text-light); font-weight:700; min-width:40px; text-align:right;">%${odemeYuzde}</span></div>
                                </div>
                                <span style="font-weight:700; color:var(--accent-red); font-size:18px;">${formatliId}</span>
                            </div>
                        </div>
                        <div id="isMuhKartContent_${kayit.id}">

                        <div style="display:flex; flex-direction:column; gap:3px; background:var(--bg-main); padding:8px 20px; border-radius:8px; margin:5px 0 10px 0; border:1px solid var(--border-color);">
                            <div style="display:flex; justify-content:space-between; text-align:center; gap:2px;">
                                <div style="flex:1; border-right:1px solid var(--border-color); padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">ANLAŞMA ÜCRETİ</small><span style="font-weight:800; color:var(--accent-red); font-size:15px; line-height:1.3;">${(kayit.anlasmaUcreti || 0).toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                                <div style="flex:1; border-right:1px solid var(--border-color); padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">TOPLAM KAR</small><span style="font-weight:800; color:${karRenk}; font-size:15px; line-height:1.3;">${toplamKar.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                                <div style="flex:1; border-right:1px solid var(--border-color); padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">KAR %</small><span style="font-weight:800; color:${karYuzdeRenkKart}; font-size:15px; line-height:1.3;">%${karYuzde}</span></div>
                                <div style="flex:1; border-right:1px solid var(--border-color); padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">TOPLAM GİDER</small><span style="font-weight:800; color:var(--accent-red); font-size:15px; line-height:1.3;">${toplamVerecek.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                                <div style="flex:1; padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">ANLAŞMA TARİHİ</small><span style="font-weight:700; color:var(--text-dark); font-size:15px; line-height:1.3;">${kayit.anlasmaTarihi ? new Date(kayit.anlasmaTarihi).toLocaleDateString("tr-TR") : "-"}</span></div>
                            </div>
                            <div style="display:flex; justify-content:space-between; text-align:center; gap:2px; padding-top:4px; border-top:1px solid var(--border-color);">
                                <div style="flex:1; border-right:1px solid var(--border-color); padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">TAHSİLAT</small><span style="font-weight:800; color:var(--btn-green); font-size:15px; line-height:1.3;">${toplamAlacak.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                                <div style="flex:1; border-right:1px solid var(--border-color); padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">KALAN TAHSİLAT</small><span style="font-weight:800; color:${kalanTahsilatRenk}; font-size:15px; line-height:1.3;">${kalanTahsilat.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                                <div style="flex:1; border-right:1px solid var(--border-color); padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">ÖDENEN</small><span style="font-weight:800; color:var(--btn-green); font-size:15px; line-height:1.3;">${toplamOdenen.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                                <div style="flex:1; border-right:1px solid var(--border-color); padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">KALAN ÖDEME</small><span style="font-weight:800; color:var(--accent-red); font-size:15px; line-height:1.3;">${kalanToplam.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                                <div style="flex:1; padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">NET</small><span style="font-weight:800; color:${netRenkKart}; font-size:15px; line-height:1.3;">${netDurum.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                            </div>
                        </div>

                        <div style="margin-top:6px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                <span style="font-weight:700; font-size:13px; color:var(--btn-green);"><i class="fa-solid fa-list"></i> Tahsilatlar</span>
                                <button class="btn btn-primary" onclick="event.stopPropagation(); isMuhasebeFormGoster('tahsilatForm_${kayit.id}')" style="padding:4px 10px; font-size:11px;">+ Tahsilat Ekle</button>
                            </div>
                            <div id="tahsilatForm_${kayit.id}" class="inline-form" style="display:none;">
                                <label>AÇIKLAMA<input type="text" id="tahsilatAciklama_${kayit.id}" placeholder="AÇIKLAMA" value="TAHSİLAT ${alacakKalemler.length + 1}"></label>
                                <label>TUTAR (₺)<input type="text" id="tahsilatTutar_${kayit.id}" placeholder="0.000,00" style="text-transform:none; text-align:right;" oninput="tmTutarFormatla(this)" onblur="tmTutarBlur(this)"></label>
                                <label>TARİH<input type="date" id="tahsilatTarih_${kayit.id}" value="${anlikTarihGetir()}"></label>
                                <div style="display:flex; gap:4px; align-self:flex-end;">
                                    <button class="btn-form btn-form-save" onclick="isMuhasebeTahsilatKaydet(${kayit.id})">KAYDET</button>
                                    <button class="btn-form btn-form-cancel" onclick="isMuhasebeFormGoster('tahsilatForm_${kayit.id}')">İPTAL</button>
                                </div>
                            </div>
                            ${alacakKalemler.length > 0 ? `
                            <table style="width:100%; border-collapse:collapse; font-size:12px;">
                                <thead>
                                    <tr style="background:var(--bg-main);">
                                        <th style="padding:8px 6px; text-align:left; font-size:11px;">Açıklama</th>
                                        <th style="padding:8px 6px; text-align:right; font-size:11px;">Tutar</th>
                                        <th style="padding:8px 6px; text-align:left; font-size:11px;">Tarih</th>
                                        <th style="padding:8px 6px; text-align:center; font-size:11px;">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody>${alacakHTML}</tbody>
                            </table>
                            ` : `<p style="font-size:12px; color:var(--text-light); font-style:italic; padding:8px;">Henüz tahsilat kalemi eklenmemiş.</p>`}
                        </div>

                        <div style="margin-top:12px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                <span style="font-weight:700; font-size:13px; color:var(--accent-red);"><i class="fa-solid fa-list"></i> Ödemeler</span>
                                <button class="btn btn-primary" onclick="event.stopPropagation(); isMuhasebeFormGoster('odemeForm_${kayit.id}')" style="padding:4px 10px; font-size:11px;">+ Ödeme Ekle</button>
                            </div>
                            <div id="odemeForm_${kayit.id}" class="inline-form" style="display:none;">
                                <label>PROJE / HİZMET DALI<select id="odemeDal_${kayit.id}" style="flex:1; min-width:120px;"><option value="">SEÇİNİZ</option>${SABIT_DALLAR.map(d => '<option value="' + d + '">' + d + '</option>').join('')}</select></label>
                                <label>KİŞİ / FİRMA<select id="odemeKisi_${kayit.id}" style="flex:1; min-width:120px;"><option value="">SEÇİNİZ</option>${partnerOptions}</select></label>
                                <label>TOPLAM TUTAR (₺)<input type="text" id="odemeTutar_${kayit.id}" placeholder="0.000,00" style="text-transform:none; text-align:right;" oninput="tmTutarFormatla(this)" onblur="tmTutarBlur(this)"></label>
                                <label>ÖDENEN (₺)<input type="text" id="odemeOdenen_${kayit.id}" placeholder="0.000,00" style="text-transform:none; text-align:right;" oninput="tmTutarFormatla(this)" onblur="tmTutarBlur(this)" value="0"></label>
                                <label>TARİH<input type="date" id="odemeTarih_${kayit.id}" value="${anlikTarihGetir()}"></label>
                                <div style="display:flex; gap:4px; align-self:flex-end;">
                                    <button class="btn-form btn-form-save" onclick="isMuhasebeOdemeKaydet(${kayit.id})">KAYDET</button>
                                    <button class="btn-form btn-form-cancel" onclick="isMuhasebeFormGoster('odemeForm_${kayit.id}')">İPTAL</button>
                                </div>
                            </div>
                            ${verecekKalemler.length > 0 ? `
                            <table style="width:100%; border-collapse:collapse; font-size:12px;">
                                <thead>
                                    <tr style="background:var(--bg-main);">
                                        <th style="padding:8px 6px; text-align:left; font-size:11px;">Proje / Hizmet Dalı</th>
                                        <th style="padding:8px 6px; text-align:left; font-size:11px;">Kişi / Firma</th>
                                        <th style="padding:8px 6px; text-align:right; font-size:11px;">Toplam Tutar</th>
                                        <th style="padding:8px 6px; text-align:right; font-size:11px;">Ödenen</th>
                                        <th style="padding:8px 6px; text-align:right; font-size:11px;">Kalan</th>
                                        <th style="padding:8px 6px; text-align:left; font-size:11px;">Tarih</th>
                                        <th style="padding:8px 6px; text-align:center; font-size:11px;">Durum</th>
                                        <th style="padding:8px 6px; text-align:center; font-size:11px;">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody>${verecekHTML}</tbody>
                            </table>
                            ` : `<p style="font-size:12px; color:var(--text-light); font-style:italic; padding:8px;">Henüz ödeme kalemi eklenmemiş.</p>`}
                        </div>

                        <div class="card-actions">
                            <button class="btn-warning" onclick="event.stopPropagation(); isMuhasebeDuzenle(${kayit.id})">Düzenle</button>
                            <button class="btn btn-pdf-red" onclick="event.stopPropagation(); isMuhasebePdfUret(${kayit.id})"><i class="fa-regular fa-file-lines"></i> PDF</button>
                            <button class="btn-save-green" onclick="event.stopPropagation(); isMuhasebeBitirVeTasi(${kayit.id})" style="cursor:${(kalanTahsilat !== 0 || kalanToplam !== 0) ? 'not-allowed' : 'pointer'};${(kalanTahsilat !== 0 || kalanToplam !== 0) ? 'opacity:0.5;' : ''}" ${(kalanTahsilat !== 0 || kalanToplam !== 0) ? 'disabled' : ''}><i class="fa-solid fa-check"></i> İŞ BİTİRME ONAYI</button>
                            <button class="btn-danger" onclick="event.stopPropagation(); isMuhasebeSil(${kayit.id})">Sil</button>
                        </div>
                        </div>
                    </div>
                `;
            });

            onceExpanded.forEach(id => {
                const content = document.getElementById("isMuhKartContent_" + id);
                if(content) {
                    content.classList.add("open");
                    content.closest('.is-muh-card')?.classList.add("open");
                }
            });
        }

        function isMuhasebeFormGoster(formId, rowSuffix) {
            const el = document.getElementById(formId);
            if(el) {
                const yenidurum = el.style.display === "none" ? "flex" : "none";
                el.style.display = yenidurum;
                if(rowSuffix && yenidurum === "flex") {
                    const row = document.getElementById("odemeYapFormRow_" + rowSuffix);
                    if(row) row.style.display = "table-row";
                }
            }
        }

        function isMuhasebeFormKapat(formId, rowSuffix) {
            const el = document.getElementById(formId);
            if(el) el.style.display = "none";
            if(rowSuffix) {
                const row = document.getElementById("odemeYapFormRow_" + rowSuffix);
                if(row) row.style.display = "none";
            }
        }

        function isMuhasebeTahsilatKaydet(dbId) {
            const aciklama = trToUpper(document.getElementById("tahsilatAciklama_" + dbId).value.trim());
            const tutar = tmTutarCoz(document.getElementById("tahsilatTutar_" + dbId).value);
            const tarih = document.getElementById("tahsilatTarih_" + dbId).value;

            if(!aciklama) { tmNotify("Açıklama zorunludur!", "error"); return; }
            if(isNaN(tutar) || tutar <= 0) { tmNotify("Geçerli bir tutar giriniz!", "error"); return; }
            if(!tarih) { tmNotify("Tarih seçiniz!", "error"); return; }

            let db = isMuhasebeVerileriniYukle();
            const kayit = db.find(k => k.id === dbId);
            if(!kayit) return;

            const toplamAlacak = kayit.kalemler.filter(k => k.tip === "alacak").reduce((s, k) => s + k.tutar, 0);
            const kalanTahsilat = (kayit.anlasmaUcreti || 0) - toplamAlacak;
            if(tutar > kalanTahsilat) { tmAlert("Tahsilat tutarı, kalan tahsilat limitinden (" + tmTl(kalanTahsilat) + ") büyük olamaz!"); return; }

            kayit.kalemler.push({
                kalemId: Date.now() + Math.floor(Math.random() * 1000),
                aciklama: aciklama,
                tip: "alacak",
                tutar: tutar,
                tarih: tarih
            });

            localStorage.setItem("tm_is_muhasebe_db", JSON.stringify(db));
            isMuhasebeFormKapat("tahsilatForm_" + dbId);
            isMuhasebeListesiniYenile();
            tmNotify("Tahsilat eklendi: " + tmTl(tutar), "success");
        }

        function isMuhasebeOdemeKaydet(dbId) {
            const dal = document.getElementById("odemeDal_" + dbId).value;
            const kisi = document.getElementById("odemeKisi_" + dbId).value;
            const tutar = tmTutarCoz(document.getElementById("odemeTutar_" + dbId).value);
            const odenen = tmTutarCoz(document.getElementById("odemeOdenen_" + dbId).value);
            const tarih = document.getElementById("odemeTarih_" + dbId).value;

            if(!dal) { tmNotify("Lütfen bir Proje / Hizmet Dalı seçiniz!", "error"); return; }
            if(isNaN(tutar) || tutar <= 0) { tmNotify("Geçerli bir toplam tutar giriniz!", "error"); return; }
            if(odenen < 0) { tmNotify("Ödenen tutar negatif olamaz!", "error"); return; }
            if(odenen > tutar) { tmAlert("Ödenen tutar, toplam tutardan (" + tmTl(tutar) + ") büyük olamaz!"); return; }
            if(!tarih) { tmNotify("Tarih seçiniz!", "error"); return; }

            let db = isMuhasebeVerileriniYukle();
            const kayit = db.find(k => k.id === dbId);
            if(!kayit) return;

            const odemeKayitlari = odenen > 0 ? [{ tutar: odenen, tarih: tarih }] : [];

            kayit.kalemler.push({
                kalemId: Date.now() + Math.floor(Math.random() * 1000),
                dal: dal,
                kisi: kisi || "",
                tip: "verecek",
                tutar: tutar,
                tarih: tarih,
                odenenTutar: odenen,
                odemeTarihi: odenen > 0 ? tarih : "",
                odemeKayitlari: odemeKayitlari
            });

            localStorage.setItem("tm_is_muhasebe_db", JSON.stringify(db));
            isMuhasebeFormKapat("odemeForm_" + dbId);
            isMuhasebeListesiniYenile();
            tmNotify("Ödeme kalemi eklendi: " + tmTl(tutar), "success");
        }

        function isMuhasebeOdemeYapKaydet(dbId, kalemId) {
            const yeniOdeme = tmTutarCoz(document.getElementById("odemeYapTutar_" + dbId + "_" + kalemId).value);
            const tarih = document.getElementById("odemeYapTarih_" + dbId + "_" + kalemId).value;

            if(isNaN(yeniOdeme) || yeniOdeme <= 0) { tmNotify("Geçerli bir ödeme tutarı giriniz!", "error"); return; }
            if(!tarih) { tmNotify("Tarih seçiniz!", "error"); return; }

            let db = isMuhasebeVerileriniYukle();
            const kayit = db.find(k => k.id === dbId);
            if(!kayit) return;

            const kalem = kayit.kalemler.find(k => k.kalemId === kalemId);
            if(!kalem || kalem.tip !== "verecek") return;

            const kalan = kalem.tutar - (kalem.odenenTutar || 0);
            if(kalan <= 0) { tmNotify("Bu ödeme kaleminin kalan tutarı bulunmamaktadır.", "error"); return; }
            if(yeniOdeme > kalan) { tmAlert("Ödenen tutar, kalan tutardan (" + tmTl(kalan) + ") büyük olamaz!"); return; }

            kalem.odenenTutar = (kalem.odenenTutar || 0) + yeniOdeme;
            kalem.odemeTarihi = tarih;
            if(!kalem.odemeKayitlari) kalem.odemeKayitlari = [];
            kalem.odemeKayitlari.push({ tutar: yeniOdeme, tarih: tarih });

            localStorage.setItem("tm_is_muhasebe_db", JSON.stringify(db));
            isMuhasebeFormKapat("odemeYapForm_" + dbId + "_" + kalemId, dbId + "_" + kalemId);
            isMuhasebeListesiniYenile();
            tmNotify("Ödeme yapıldı: " + tmTl(yeniOdeme), "success");
        }

        function isMuhasebeOdemeGecmisiGosterEdit(dbId, kalemId, idx) {
            const el = document.getElementById("odemeGecmisiEdit_" + dbId + "_" + kalemId + "_" + idx);
            if(el) el.style.display = el.style.display === "none" ? "flex" : "none";
        }

        function isMuhasebeOdemeGecmisiKapatEdit(dbId, kalemId, idx) {
            const el = document.getElementById("odemeGecmisiEdit_" + dbId + "_" + kalemId + "_" + idx);
            if(el) el.style.display = "none";
        }

        function isMuhasebeOdemeGecmisiKaydet(dbId, kalemId, idx) {
            const yeniTutar = tmTutarCoz(document.getElementById("odemeGecEditTutar_" + dbId + "_" + kalemId + "_" + idx).value);
            const yeniTarih = document.getElementById("odemeGecEditTarih_" + dbId + "_" + kalemId + "_" + idx).value;

            if(isNaN(yeniTutar) || yeniTutar <= 0) { tmNotify("Geçerli bir tutar giriniz!", "error"); return; }
            if(!yeniTarih) { tmNotify("Tarih seçiniz!", "error"); return; }

            let db = isMuhasebeVerileriniYukle();
            const kayit = db.find(k => k.id === dbId);
            if(!kayit) return;

            const kalem = kayit.kalemler.find(k => k.kalemId === kalemId);
            if(!kalem || kalem.tip !== "verecek" || !kalem.odemeKayitlari) return;
            if(idx < 0 || idx >= kalem.odemeKayitlari.length) return;

            const fark = yeniTutar - kalem.odemeKayitlari[idx].tutar;
            if(kalem.odenenTutar + fark > kalem.tutar) { tmNotify("Toplam ödenen tutar, kalem tutarını aşamaz!", "error"); return; }

            kalem.odemeKayitlari[idx].tutar = yeniTutar;
            kalem.odemeKayitlari[idx].tarih = yeniTarih;
            kalem.odenenTutar = kalem.odemeKayitlari.reduce((sum, o) => sum + o.tutar, 0);
            kalem.odemeTarihi = kalem.odemeKayitlari.reduce((latest, o) => (!latest || o.tarih > latest) ? o.tarih : latest, "");

            localStorage.setItem("tm_is_muhasebe_db", JSON.stringify(db));
            isMuhasebeOdemeGecmisiKapatEdit(dbId, kalemId, idx);
            isMuhasebeListesiniYenile();
        }

        function isMuhasebeOdemeGecmisiSil(dbId, kalemId, idx) {
            tmConfirm("Bu ödeme kaydını silmek istediğinize emin misiniz?", function() {
                let db = isMuhasebeVerileriniYukle();
                const kayit = db.find(k => k.id === dbId);
                if(!kayit) return;

                const kalem = kayit.kalemler.find(k => k.kalemId === kalemId);
                if(!kalem || kalem.tip !== "verecek" || !kalem.odemeKayitlari) return;
                if(idx < 0 || idx >= kalem.odemeKayitlari.length) return;

                kalem.odemeKayitlari.splice(idx, 1);
                kalem.odenenTutar = kalem.odemeKayitlari.reduce((sum, o) => sum + o.tutar, 0);
                kalem.odemeTarihi = kalem.odemeKayitlari.reduce((latest, o) => (!latest || o.tarih > latest) ? o.tarih : latest, "");

                localStorage.setItem("tm_is_muhasebe_db", JSON.stringify(db));
                isMuhasebeListesiniYenile();
                tmNotify("Ödeme geçmişi silindi.", "success");
            });
        }

        function isMuhasebeKalemSil(dbId, kalemId) {
            tmConfirm("Bu kalemi silmek istediğinize emin misiniz?", function() {
                let db = isMuhasebeVerileriniYukle();
                const kayit = db.find(k => k.id === dbId);
                if(!kayit) return;
                kayit.kalemler = kayit.kalemler.filter(k => k.kalemId !== kalemId);
                localStorage.setItem("tm_is_muhasebe_db", JSON.stringify(db));
                isMuhasebeListesiniYenile();
                tmNotify("Kalem silindi.", "success");
            });
        }

        function isMuhasebeBitirVeTasi(id) {
            let db = isMuhasebeVerileriniYukle();
            const kayit = db.find(k => k.id === id);
            if(!kayit) return;

            let toplamAlacak = 0, toplamVerecek = 0, toplamOdenen = 0;
            kayit.kalemler.forEach(k => {
                if(k.tip === "alacak") toplamAlacak += k.tutar;
                else { toplamVerecek += k.tutar; toplamOdenen += (k.odenenTutar || 0); }
            });
            const kalanTahsilat = (kayit.anlasmaUcreti || 0) - toplamAlacak;
            const kalanOdeme = toplamVerecek - toplamOdenen;
            if(kalanTahsilat !== 0 || kalanOdeme !== 0) {
                tmNotify("İş bitirme için tüm tahsilat ve ödemelerin tamamlanmış olması gerekir! Kalan tahsilat: " + tmTl(kalanTahsilat) + ", Kalan ödeme: " + tmTl(kalanOdeme), "error");
                return;
            }

            tmConfirm("Bu iş muhasebesini 'Tamamlanan İşler' kategorisine taşımak istediğinize emin misiniz?", function() {
                let db2 = isMuhasebeVerileriniYukle();
                const kayit2 = db2.find(k => k.id === id);
                if(!kayit2) return;

                kayit2.bitisTarihi = anlikTarihGetir();

                let tamamlananDb = JSON.parse(localStorage.getItem("tm_is_muhasebe_tamamlanan_db")) || [];
                tamamlananDb.push(kayit2);

                db2 = db2.filter(k => k.id !== id);

                const fsWasReady = fsReady;
                fsReady = false;
                localStorage.setItem("tm_is_muhasebe_tamamlanan_db", JSON.stringify(tamamlananDb));
                localStorage.setItem("tm_is_muhasebe_db", JSON.stringify(db2));
                fsReady = fsWasReady;
                if(fsReady) fsSync();

                isMuhasebeListesiniYenile();
                tamamlananIsMuhasebeListesiniYenile();
                musteriKartlariniYenile();
                isOrtaklariKartlariniYenile();
                tmNotify("İş başarıyla tamamlandı ve 'Tamamlanan İş Muhasebeleri' sayfasına taşındı.", "success");
            });
        }

        function tamamlananIsMuhasebeVerileriniYukle() {
            try { return JSON.parse(localStorage.getItem("tm_is_muhasebe_tamamlanan_db")) || []; } catch(e) { console.error("Tamamlanan is muhasebe yukleme hatasi:", e); return []; }
        }

        function tamamlananIsMuhasebeGeriAl(id) {
            tmConfirm("Bu işi 'Tamamlanan İş Muhasebeleri'nden çıkarıp tekrar 'İş Muhasebesi Takibi' sayfasına taşımak istediğinize emin misiniz?", function() {
                let tamamlananDb = tamamlananIsMuhasebeVerileriniYukle();
                const kayit = tamamlananDb.find(k => k.id === id);
                if(!kayit) return;

                delete kayit.bitisTarihi;
                let db = isMuhasebeVerileriniYukle();
                db.push(kayit);
                localStorage.setItem("tm_is_muhasebe_db", JSON.stringify(db));

                tamamlananDb = tamamlananDb.filter(k => k.id !== id);
                localStorage.setItem("tm_is_muhasebe_tamamlanan_db", JSON.stringify(tamamlananDb));

                isMuhasebeListesiniYenile();
                tamamlananIsMuhasebeListesiniYenile();
                musteriKartlariniYenile();
                isOrtaklariKartlariniYenile();
                tmNotify("İş geri alındı ve tekrar 'İş Muhasebesi Takibi' sayfasına taşındı.", "success");
            });
        }

        function tamamlananIsMuhasebeSil(id) {
            tmConfirm("Bu tamamlanan iş kaydını kalıcı olarak silmek istediğinize emin misiniz?", function() {
                let db = tamamlananIsMuhasebeVerileriniYukle();
                db = db.filter(k => k.id !== id);
                localStorage.setItem("tm_is_muhasebe_tamamlanan_db", JSON.stringify(db));
                tamamlananIsMuhasebeListesiniYenile();
                musteriKartlariniYenile();
                isOrtaklariKartlariniYenile();
                tmNotify("Tamamlanan iş muhasebesi kaydı silindi.", "success");
            });
        }

        function tamamlananIsMuhasebeListesiniYenile() {
            const konteyner = document.getElementById("tamamlananIsMuhasebeKonteyner");
            if(!konteyner) return;

            var acikKartlar = {};
            konteyner.querySelectorAll('.is-muh-card').forEach(function(kart) {
                var content = kart.querySelector('[id^="tamIsMuhKartContent_"]');
                if(content && content.classList.contains("open")) {
                    var id = content.id.replace("tamIsMuhKartContent_", "");
                    acikKartlar[id] = true;
                }
            });

            konteyner.innerHTML = "";

            const db = tamamlananIsMuhasebeVerileriniYukle();
            if(db.length === 0) {
                konteyner.innerHTML = tmEmptyStateHTML('<i class="fa-solid fa-check"></i>','Henüz tamamlanan iş muhasebesi bulunmamaktadır.','Tamamlanan iş muhasebesi kayıtları burada görüntülenecek.');
                return;
            }

            db.sort((a, b) => new Date(b.bitisTarihi || b.anlasmaTarihi || b.tarih) - new Date(a.bitisTarihi || a.anlasmaTarihi || a.tarih));

            let genelHacim = 0, genelTahsilat = 0, genelKar = 0, genelOdeme = 0;
            db.forEach(kayit => {
                let toplamAlacak = 0, toplamVerecek = 0, toplamOdenen = 0;
                kayit.kalemler.forEach(k => {
                    if(k.tip === "alacak") toplamAlacak += k.tutar;
                    else { toplamVerecek += k.tutar; toplamOdenen += (k.odenenTutar || 0); }
                });
                genelHacim += kayit.anlasmaUcreti || 0;
                genelTahsilat += toplamAlacak;
                genelKar += (kayit.anlasmaUcreti || 0) - toplamVerecek;
                genelOdeme += toplamOdenen;
            });
            const genelNet = genelTahsilat - (genelHacim - genelKar);
            const genelKarYuzde = genelHacim > 0 ? ((genelKar / genelHacim) * 100).toFixed(1) : "0.0";
            const gKarRenk = genelKar >= 0 ? "var(--btn-green)" : "var(--accent-red)";
            const gKarYuzdeRenk = parseFloat(genelKarYuzde) >= 0 ? "var(--btn-green)" : "var(--accent-red)";
            const gNetRenk = genelNet >= 0 ? "var(--btn-green)" : "var(--accent-red)";

            let toplamHTML = `
                <div style="display:flex; flex-direction:column; gap:10px; width:100%; padding:18px 10px; box-sizing:border-box; background:#0b1928; border-radius:12px; border:1px solid var(--ht-border); margin-bottom:18px;">
                    <div style="display:flex; justify-content:center; text-align:center; gap:8px; padding-bottom:8px; border-bottom:1px solid var(--ht-border);">
                        <div style="padding:0 20px;"><small style="font-size:11px; color:var(--ht-text-light); font-weight:600; display:block; letter-spacing:0.5px;">TAMAMLANAN İŞ SAYISI</small><span style="font-weight:900; color:var(--accent-red); font-size:28px;">${db.length}</span></div>
                    </div>
                    <div style="display:flex; justify-content:space-around; text-align:center; gap:8px;">
                        <div style="flex:1; border-right:1px solid var(--ht-border); padding:0 10px;"><small style="font-size:12px; color:var(--ht-text-light); font-weight:600; display:block; letter-spacing:0.5px;">TAMAMLANAN İŞ HACMİ</small><span style="font-weight:900; color:var(--accent-red); font-size:22px;">${genelHacim.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                        <div style="flex:1; border-right:1px solid var(--ht-border); padding:0 10px;"><small style="font-size:12px; color:var(--ht-text-light); font-weight:600; display:block; letter-spacing:0.5px;">GENEL TAHSİLAT</small><span style="font-weight:900; color:var(--btn-green); font-size:22px;">${genelTahsilat.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                        <div style="flex:1; border-right:1px solid var(--ht-border); padding:0 10px;"><small style="font-size:12px; color:var(--ht-text-light); font-weight:600; display:block; letter-spacing:0.5px;">GENEL KAR</small><span style="font-weight:900; color:${gKarRenk}; font-size:22px;">${genelKar.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                        <div style="flex:1; border-right:1px solid var(--ht-border); padding:0 10px;"><small style="font-size:12px; color:var(--ht-text-light); font-weight:600; display:block; letter-spacing:0.5px;">GENEL KAR %</small><span style="font-weight:900; color:${gKarYuzdeRenk}; font-size:22px;">%${genelKarYuzde}</span></div>
                        <div style="flex:1; padding:0 10px;"><small style="font-size:12px; color:var(--ht-text-light); font-weight:600; display:block; letter-spacing:0.5px;">GENEL ÖDEME</small><span style="font-weight:900; color:var(--accent-red); font-size:22px;">${genelOdeme.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                    </div>
                    <div style="display:flex; justify-content:space-around; text-align:center; gap:8px; padding-top:8px; border-top:1px solid var(--ht-border);">
                        <div style="flex:1; padding:0 10px;"><small style="font-size:12px; color:var(--ht-text-light); font-weight:600; display:block; letter-spacing:0.5px;">NET</small><span style="font-weight:900; color:${gNetRenk}; font-size:22px;">${genelNet.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                    </div>
                </div>
            `;

            db.forEach(kayit => {
                let toplamAlacak = 0, toplamVerecek = 0, toplamOdenen = 0;
                kayit.kalemler.forEach(k => {
                    if(k.tip === "alacak") toplamAlacak += k.tutar;
                    else {
                        toplamVerecek += k.tutar;
                        toplamOdenen += (k.odenenTutar || 0);
                    }
                });
                const kalanToplam = toplamVerecek - toplamOdenen;
                const netDurum = toplamAlacak - toplamVerecek;
                const toplamKar = (kayit.anlasmaUcreti || 0) - toplamVerecek;
                const netRenk = netDurum >= 0 ? "var(--btn-green)" : "var(--accent-red)";
                const karRenk = toplamKar >= 0 ? "var(--btn-green)" : "var(--accent-red)";
                const karYuzde = kayit.anlasmaUcreti > 0 ? ((toplamKar / kayit.anlasmaUcreti) * 100).toFixed(1) : "0.0";
                const karYuzdeRenkKart = parseFloat(karYuzde) >= 0 ? "var(--btn-green)" : "var(--accent-red)";
                const isAdi = kayit.isAdi || kayit.projeAd || "-";
                const firma = kayit.firma || kayit.musteriAd || "-";
                const paftaAdi = kayit.pafta && kayit.pafta !== "-" ? kayit.pafta : "";
                const adaAdi = kayit.ada && kayit.ada !== "-" ? kayit.ada : "";
                const parselAdi = kayit.parsel && kayit.parsel !== "-" ? kayit.parsel : "";
                const paftaAdaParsel = (paftaAdi ? "Pafta: " + paftaAdi + ", " : "") + (adaAdi ? "Ada: " + adaAdi + ", " : "") + (parselAdi ? "Parsel: " + parselAdi : "") || kayit.parsel || kayit.refNo || "-";
                const basTarih = kayit.anlasmaTarihi || kayit.tarih || "";
                const formatliId = "#" + String(kayit.id).padStart(4, '0');

                toplamHTML += `
                    <div class="portfolio-card is-muh-card" data-search="${isAdi} ${firma} ${paftaAdaParsel} ${formatliId}" style="width:100%; margin-bottom:15px;">
                        <div class="card-main-header" onclick="tamIsMuhKartToggle(${kayit.id})" style="cursor:pointer;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <div style="flex:1; display:flex; flex-direction:column; gap:4px;">
                                    <div style="display:flex; align-items:center; gap:10px;">
                                        <h4 style="margin:0;">${isAdi}</h4>
                                    </div>
                                    <div style="display:flex; gap:15px; font-size:13px;">
                                        ${firma && firma !== "-" ? '<span style="color:var(--ht-text-light);"><b>Firma:</b> ' + firma + '</span>' : ''}
                                        ${paftaAdaParsel && paftaAdaParsel !== "-" ? '<span style="color:var(--ht-text-light);">' + paftaAdaParsel + '</span>' : ''}
                                    </div>
                                </div>
                                <div style="display:flex; align-items:center; gap:30px;">
                                    <div style="display:flex; align-items:center; gap:10px;">
                                        <span style="background:rgba(76,175,80,0.2); color:#66bb6a; padding:3px 10px; border-radius:12px; font-size:11px; font-weight:700; border:1px solid rgba(76,175,80,0.3);"><i class="fa-solid fa-check-circle" style="font-size:10px;"></i> TAMAMLANDI</span>
                                        <span style="font-weight:700; color:var(--accent-red); font-size:18px;">${formatliId}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="tamIsMuhKartContent_${kayit.id}">

                        <div style="display:flex; flex-direction:column; gap:3px; background:#0d1b2a; padding:8px 20px; border-radius:8px; margin:5px 0 10px 0; border:1px solid var(--ht-border);">
                            <div style="display:flex; justify-content:space-between; text-align:center; gap:2px;">
                                <div style="flex:1; border-right:1px solid var(--ht-border); padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--ht-text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">ANLAŞMA ÜCRETİ</small><span style="font-weight:800; color:var(--accent-red); font-size:15px; line-height:1.3;">${(kayit.anlasmaUcreti || 0).toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                                <div style="flex:1; border-right:1px solid var(--ht-border); padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--ht-text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">TOPLAM KAR</small><span style="font-weight:800; color:${karRenk}; font-size:15px; line-height:1.3;">${toplamKar.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                                <div style="flex:1; border-right:1px solid var(--ht-border); padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--ht-text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">KAR %</small><span style="font-weight:800; color:${karYuzdeRenkKart}; font-size:15px; line-height:1.3;">%${karYuzde}</span></div>
                                <div style="flex:1; border-right:1px solid var(--ht-border); padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--ht-text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">TOPLAM GİDER</small><span style="font-weight:800; color:var(--accent-red); font-size:15px; line-height:1.3;">${toplamVerecek.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                                <div style="flex:1; padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--ht-text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">ANLAŞMA TARİHİ</small><span style="font-weight:700; color:var(--ht-text); font-size:15px; line-height:1.3;">${basTarih ? new Date(basTarih).toLocaleDateString("tr-TR") : "-"}</span></div>
                            </div>
                            <div style="display:flex; justify-content:space-between; text-align:center; gap:2px; padding-top:4px; border-top:1px solid var(--ht-border);">
                                <div style="flex:1; border-right:1px solid var(--ht-border); padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--ht-text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">TAHSİLAT</small><span style="font-weight:800; color:var(--btn-green); font-size:15px; line-height:1.3;">${toplamAlacak.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                                <div style="flex:1; border-right:1px solid var(--ht-border); padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--ht-text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">ÖDENEN</small><span style="font-weight:800; color:var(--btn-green); font-size:15px; line-height:1.3;">${toplamOdenen.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                                <div style="flex:1; border-right:1px solid var(--ht-border); padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--ht-text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">KALAN ÖDEME</small><span style="font-weight:800; color:var(--accent-red); font-size:15px; line-height:1.3;">${kalanToplam.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                                <div style="flex:1; border-right:1px solid var(--ht-border); padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--ht-text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">NET</small><span style="font-weight:800; color:${netRenk}; font-size:15px; line-height:1.3;">${netDurum.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                                <div style="flex:1; padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--ht-text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">BİTİŞ ONAY</small><span style="font-weight:700; color:var(--btn-green); font-size:15px; line-height:1.3;">${kayit.bitisTarihi ? new Date(kayit.bitisTarihi).toLocaleDateString("tr-TR") : "-"}</span></div>
                            </div>
                        </div>

                        <div style="margin-top:6px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                <span style="font-weight:700; font-size:13px; color:var(--btn-green);"><i class="fa-solid fa-arrow-down"></i> Tahsilatlar</span>
                            </div>
                            ${(() => {
                                const alacakKalemler = kayit.kalemler.filter(k => k.tip === "alacak");
                                if(alacakKalemler.length === 0) return '<p style="font-size:12px; color:var(--ht-text-light); font-style:italic; padding:4px 20px;">Henüz tahsilat kalemi bulunmuyor.</p>';
                                let tbl = '<table style="width:100%; border-collapse:collapse; font-size:12px;"><thead><tr style="background:#0d1b2a;"><th style="padding:7px 10px; text-align:left; font-size:9px; font-weight:700; color:var(--ht-text-light); text-transform:uppercase; letter-spacing:0.5px;">Açıklama</th><th style="padding:7px 10px; text-align:right; font-size:9px; font-weight:700; color:var(--ht-text-light); text-transform:uppercase; letter-spacing:0.5px;">Tutar</th><th style="padding:7px 10px; text-align:left; font-size:9px; font-weight:700; color:var(--ht-text-light); text-transform:uppercase; letter-spacing:0.5px;">Tarih</th></tr></thead><tbody>';
                                alacakKalemler.forEach(k => {
                                    tbl += '<tr><td style="padding:7px 10px; border-bottom:1px solid var(--ht-border); font-size:11px; color:var(--ht-text);">' + (k.aciklama || "-") + '</td><td style="padding:7px 10px; border-bottom:1px solid var(--ht-border); font-size:11px; color:var(--ht-text); text-align:right; font-weight:700; color:var(--btn-green);">' + (k.tutar || 0).toLocaleString('tr-TR', {minimumFractionDigits:2}) + ' ₺</td><td style="padding:7px 10px; border-bottom:1px solid var(--ht-border); font-size:11px; color:var(--ht-text);">' + (k.tarih ? new Date(k.tarih).toLocaleDateString("tr-TR") : "-") + '</td></tr>';
                                });
                                tbl += '</tbody></table>';
                                return tbl;
                            })()}
                        </div>

                        <div style="margin-top:12px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                <span style="font-weight:700; font-size:13px; color:var(--accent-red);"><i class="fa-solid fa-arrow-up"></i> Ödemeler</span>
                            </div>
                            ${(() => {
                                const verecekKalemler = kayit.kalemler.filter(k => k.tip !== "alacak");
                                if(verecekKalemler.length === 0) return '<p style="font-size:12px; color:var(--ht-text-light); font-style:italic; padding:4px 20px;">Henüz ödeme kalemi bulunmuyor.</p>';
                                let tbl = '<table style="width:100%; border-collapse:collapse; font-size:12px;"><thead><tr style="background:#0d1b2a;"><th style="padding:7px 10px; text-align:left; font-size:9px; font-weight:700; color:var(--ht-text-light); text-transform:uppercase; letter-spacing:0.5px;">Proje / Hizmet Dalı</th><th style="padding:7px 10px; text-align:left; font-size:9px; font-weight:700; color:var(--ht-text-light); text-transform:uppercase; letter-spacing:0.5px;">Kişi / Firma</th><th style="padding:7px 10px; text-align:right; font-size:9px; font-weight:700; color:var(--ht-text-light); text-transform:uppercase; letter-spacing:0.5px;">Toplam</th><th style="padding:7px 10px; text-align:right; font-size:9px; font-weight:700; color:var(--ht-text-light); text-transform:uppercase; letter-spacing:0.5px;">Ödenen</th><th style="padding:7px 10px; text-align:right; font-size:9px; font-weight:700; color:var(--ht-text-light); text-transform:uppercase; letter-spacing:0.5px;">Kalan</th><th style="padding:7px 10px; text-align:left; font-size:9px; font-weight:700; color:var(--ht-text-light); text-transform:uppercase; letter-spacing:0.5px;">Giriş Tarihi</th></tr></thead><tbody>';
                                verecekKalemler.forEach(k => {
                                    const odenen = k.odenenTutar || 0;
                                    const kalan = k.tutar - odenen;
                                    const girisTarih = k.tarih ? new Date(k.tarih).toLocaleDateString("tr-TR") : "-";
                                    tbl += '<tr><td style="padding:7px 10px; border-bottom:1px solid var(--ht-border); font-size:11px; color:var(--ht-text);">' + (k.dal || k.aciklama || "-") + '</td><td style="padding:7px 10px; border-bottom:1px solid var(--ht-border); font-size:11px; color:var(--ht-text-light);">' + (k.kisi || "-") + '</td><td style="padding:7px 10px; border-bottom:1px solid var(--ht-border); font-size:11px; color:var(--ht-text); text-align:right; font-weight:700;">' + (k.tutar || 0).toLocaleString('tr-TR', {minimumFractionDigits:2}) + ' ₺</td><td style="padding:7px 10px; border-bottom:1px solid var(--ht-border); font-size:11px; color:var(--ht-text); text-align:right; font-weight:600; color:var(--btn-green);">' + odenen.toLocaleString('tr-TR', {minimumFractionDigits:2}) + ' ₺</td><td style="padding:7px 10px; border-bottom:1px solid var(--ht-border); font-size:11px; color:var(--ht-text); text-align:right; font-weight:600; color:var(--accent-red);">' + kalan.toLocaleString('tr-TR', {minimumFractionDigits:2}) + ' ₺</td><td style="padding:7px 10px; border-bottom:1px solid var(--ht-border); font-size:11px; color:var(--ht-text);">' + girisTarih + '</td></tr>';
                                    const kayitlar = k.odemeKayitlari || [];
                                    if(kayitlar.length > 0) {
                                        tbl += '<tr><td colspan="6" style="padding:2px 8px 8px 8px;"><div style="font-size:11px; background:rgba(255,255,255,0.03); border-radius:6px; padding:6px 10px; border:1px solid var(--ht-border);">';
                                        tbl += '<span style="font-weight:700; font-size:9px; color:var(--ht-text-light); display:block; margin-bottom:3px; text-transform:uppercase; letter-spacing:0.3px;">ÖDEME GEÇMİŞİ</span>';
                                        kayitlar.forEach(od => {
                                            const odemeTarih = od.tarih ? new Date(od.tarih).toLocaleDateString("tr-TR") : "-";
                                            tbl += '<div style="display:flex; align-items:center; gap:6px; margin:2px 0; flex-wrap:wrap;">';
                                            tbl += '<span style="font-size:12px;">• ' + od.tutar.toLocaleString('tr-TR', {minimumFractionDigits:2}) + ' ₺ <span style="color:var(--ht-text-light);">(' + odemeTarih + ')</span></span>';
                                            tbl += '</div>';
                                        });
                                        tbl += '</div></td></tr>';
                                    }
                                });
                                tbl += '</tbody></table>';
                                return tbl;
                            })()}
                        </div>

                        <div class="card-actions">
                            <button class="btn-warning" onclick="event.stopPropagation(); tamamlananIsMuhasebeGeriAl(${kayit.id})"><i class="fa-solid fa-rotate-left"></i> Geri Al</button>
                            <button class="btn-pdf-red" onclick="event.stopPropagation(); isMuhasebePdfUret(${kayit.id})"><i class="fa-regular fa-file-lines"></i> PDF</button>
                            <button class="btn-danger" onclick="event.stopPropagation(); tamamlananIsMuhasebeSil(${kayit.id})"><i class="fa-solid fa-trash-can"></i> Sil</button>
                        </div>
                        </div>
                    </div>
                `;
            });

            konteyner.innerHTML = toplamHTML;

            Object.keys(acikKartlar).forEach(function(id) {
                var content = document.getElementById("tamIsMuhKartContent_" + id);
                if(content) {
                    content.classList.add("open");
                    content.closest('.is-muh-card')?.classList.add("open");
                }
            });
        }

        function tamIsMuhKartToggle(id) {
            const content = document.getElementById("tamIsMuhKartContent_" + id);
            if(content) {
                content.classList.toggle("open");
                content.closest('.is-muh-card')?.classList.toggle("open");
            }
        }

        function tamamlananIsMuhasebeListesiniFiltrele() {
            const kelime = document.getElementById("tamIsMuhAramaInput").value.toLowerCase().trim();
            document.querySelectorAll("#tamamlananIsMuhasebeKonteyner .is-muh-card").forEach(kart => {
                const data = (kart.getAttribute("data-search") || "").toLowerCase();
                kart.style.display = data.includes(kelime) ? "flex" : "none";
            });
        }

        function isMuhasebeListesiniFiltrele() {
            const kelime = document.getElementById("isMuhAramaInput").value.toLowerCase().trim();
            document.querySelectorAll("#isMuhasebeKartKonteyner .is-muh-card").forEach(kart => {
                const data = (kart.getAttribute("data-search") || "").toLowerCase();
                kart.style.display = data.includes(kelime) ? "flex" : "none";
            });
        }

        function isMuhasebePdfUret(id) {
            const db = isMuhasebeVerileriniYukle();
            let kayit = db.find(k => k.id === id);
            if(!kayit) {
                const tamDb = tamamlananIsMuhasebeVerileriniYukle();
                kayit = tamDb.find(k => k.id === id);
            }
            if(!kayit) { tmNotify("Kayıt bulunamadı!", "error"); return; }

            let toplamAlacak = 0, toplamVerecek = 0, toplamOdenen = 0;
            kayit.kalemler.forEach(function(k) {
                if(k.tip === "alacak") toplamAlacak += k.tutar;
                else { toplamVerecek += k.tutar; toplamOdenen += (k.odenenTutar || 0); }
            });
            const kalanToplam = toplamVerecek - toplamOdenen;
            const netDurum = toplamAlacak - toplamVerecek;
            const kalanTahsilat = (kayit.anlasmaUcreti || 0) - toplamAlacak;

            const p = kayit.pafta && kayit.pafta !== "-" ? kayit.pafta : "";
            const a = kayit.ada && kayit.ada !== "-" ? kayit.ada : "";
            const par = kayit.parsel && kayit.parsel !== "-" ? kayit.parsel : "";
            const paftaAdaParsel = (p ? p + ", " : "") + (a ? a + ", " : "") + (par ? par : "") || "-";

            const formatliId = "#" + String(kayit.id).padStart(4, '0');
            const tarihStr = kayit.anlasmaTarihi ? new Date(kayit.anlasmaTarihi).toLocaleDateString("tr-TR", {day:'2-digit',month:'long',year:'numeric'}) : "-";

            const logoData = localStorage.getItem("tm_sirket_logo");
            let logoHtml = '';
            if (logoData && logoData !== "null" && logoData.length > 100) {
                logoHtml = '<img src="' + logoData + '" style="height:15mm;width:auto;vertical-align:middle;" alt="Logo">';
            }

            const fb = (function() {
                try { return JSON.parse(localStorage.getItem("tm_sirket_bilgileri")) || {}; } catch(e) { return {}; }
            })();
            const firmaAd = fb.ad || "TURAK MİMARLIK";
            const firmaAdres = fb.adres || "Deniz Mah. Selvi Sk. No: 14/D İĞNEADA / DEMİRKÖY / KIRKLARELİ";
            const firmaTel = fb.gsm || fb.telefon || "0543 123 45 67";
            const firmaEposta = fb.email || "info@turakmimarlik.com";

            let kalemSatirlari = "";
            kayit.kalemler.forEach(function(k) {
                const tipText = k.tip === "alacak" ? "TAHSİLAT" : "GİDER";
                const tipRenk = k.tip === "alacak" ? "#2E7D32" : "#9E2A2B";
                const aciklama = k.aciklama || (k.tip === "alacak" ? "TAHSİLAT" : "ÖDEME");
                const kisiFirma = k.kisi || "-";
                if(k.tip === "alacak") {
                    const tarih = k.tarih ? new Date(k.tarih).toLocaleDateString("tr-TR") : "-";
                    kalemSatirlari += '<tr><td style="padding:4px 6px;font-size:10px;border-bottom:1px solid #eee;color:#1a1a2e;">' + aciklama + '</td><td style="padding:4px 6px;font-size:10px;border-bottom:1px solid #eee;color:#666;">' + kisiFirma + '</td><td style="padding:4px 6px;font-size:9px;border-bottom:1px solid #eee;text-align:center;color:#444;">' + tarih + '</td><td style="padding:4px 6px;font-size:9px;border-bottom:1px solid #eee;text-align:center;color:' + tipRenk + ';font-weight:700;">' + tipText + '</td><td style="padding:4px 6px;font-size:10px;border-bottom:1px solid #eee;text-align:right;font-weight:700;color:#1a1a2e;">' + k.tutar.toLocaleString('tr-TR', {minimumFractionDigits:2}) + ' ₺</td><td style="padding:4px 6px;font-size:10px;border-bottom:1px solid #eee;text-align:right;font-weight:600;color:#2E7D32;">0 ₺</td></tr>';
                } else {
                    const kayitlar = k.odemeKayitlari || [];
                    if(kayitlar.length > 0) {
                        kayitlar.forEach(function(od) {
                            const odemeTarih = od.tarih ? new Date(od.tarih).toLocaleDateString("tr-TR") : "-";
                            kalemSatirlari += '<tr><td style="padding:4px 6px;font-size:10px;border-bottom:1px solid #eee;color:#1a1a2e;">' + aciklama + '</td><td style="padding:4px 6px;font-size:10px;border-bottom:1px solid #eee;color:#666;">' + kisiFirma + '</td><td style="padding:4px 6px;font-size:9px;border-bottom:1px solid #eee;text-align:center;color:#444;">' + odemeTarih + '</td><td style="padding:4px 6px;font-size:9px;border-bottom:1px solid #eee;text-align:center;color:' + tipRenk + ';font-weight:700;">' + tipText + '</td><td style="padding:4px 6px;font-size:10px;border-bottom:1px solid #eee;text-align:right;font-weight:700;color:#9E2A2B;">' + od.tutar.toLocaleString('tr-TR', {minimumFractionDigits:2}) + ' ₺</td><td style="padding:4px 6px;font-size:10px;border-bottom:1px solid #eee;text-align:right;font-weight:600;color:#666;">-</td></tr>';
                        });
                        const kalan = Math.max(0, k.tutar - (k.odenenTutar || 0));
                        if(kalan > 0) {
                            kalemSatirlari += '<tr style="background:#fafafa;"><td style="padding:4px 6px;font-size:10px;border-bottom:1px solid #eee;color:#1a1a2e;font-weight:700;">' + aciklama + ' (KALAN)</td><td style="padding:4px 6px;font-size:10px;border-bottom:1px solid #eee;color:#666;"></td><td style="padding:4px 6px;font-size:9px;border-bottom:1px solid #eee;text-align:center;color:#444;">-</td><td style="padding:4px 6px;font-size:9px;border-bottom:1px solid #eee;text-align:center;color:' + tipRenk + ';font-weight:700;">KALAN</td><td style="padding:4px 6px;font-size:10px;border-bottom:1px solid #eee;text-align:right;font-weight:700;color:#1a1a2e;">' + k.tutar.toLocaleString('tr-TR', {minimumFractionDigits:2}) + ' ₺</td><td style="padding:4px 6px;font-size:10px;border-bottom:1px solid #eee;text-align:right;font-weight:800;color:#9E2A2B;">' + kalan.toLocaleString('tr-TR', {minimumFractionDigits:2}) + ' ₺</td></tr>';
                        }
                    } else {
                        const odenen = k.odenenTutar || 0;
                        const kalan = Math.max(0, k.tutar - odenen);
                        const tarih = (k.odemeTarihi || k.tarih) ? new Date(k.odemeTarihi || k.tarih).toLocaleDateString("tr-TR") : "-";
                        kalemSatirlari += '<tr><td style="padding:4px 6px;font-size:10px;border-bottom:1px solid #eee;color:#1a1a2e;">' + aciklama + '</td><td style="padding:4px 6px;font-size:10px;border-bottom:1px solid #eee;color:#666;">' + kisiFirma + '</td><td style="padding:4px 6px;font-size:9px;border-bottom:1px solid #eee;text-align:center;color:#444;">' + tarih + '</td><td style="padding:4px 6px;font-size:9px;border-bottom:1px solid #eee;text-align:center;color:' + tipRenk + ';font-weight:700;">' + tipText + '</td><td style="padding:4px 6px;font-size:10px;border-bottom:1px solid #eee;text-align:right;font-weight:700;color:#1a1a2e;">' + k.tutar.toLocaleString('tr-TR', {minimumFractionDigits:2}) + ' ₺</td><td style="padding:4px 6px;font-size:10px;border-bottom:1px solid #eee;text-align:right;font-weight:800;color:' + (kalan > 0 ? '#9E2A2B' : '#2E7D32') + ';">' + kalan.toLocaleString('tr-TR', {minimumFractionDigits:2}) + ' ₺</td></tr>';
                    }
                }
            });

            const sayfaHtml = '<div style="width:297mm;min-height:210mm;padding:6mm 8mm;box-sizing:border-box;font-family:\'Segoe UI\',\'Helvetica Neue\',Arial,sans-serif;background:#fff;color:#222;text-transform:uppercase;">'
                + '<div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:2.5mm;border-bottom:2.5px solid #1a1a2e;margin-bottom:4mm;">'
                + '<div style="display:flex;align-items:center;gap:4mm;">' + (logoHtml ? '<div>' + logoHtml + '</div>' : '')
                + '<div><div style="font-size:20px;font-weight:900;color:#1a1a2e;letter-spacing:3px;">' + firmaAd + '</div><div style="font-size:9px;font-weight:700;color:#9E2A2B;letter-spacing:1.5px;margin-top:0.5mm;">İŞ MUHASEBESİ RAPORU</div></div>'
                + '</div><div style="text-align:right;"><div style="font-size:8px;font-weight:700;color:#888;letter-spacing:1px;">RAPOR NO</div><div style="font-size:16px;font-weight:900;color:#9E2A2B;letter-spacing:1px;">' + formatliId + '</div></div></div>'
                + '<div style="display:flex;gap:4mm;margin-bottom:4mm;">'
                + '<div style="flex:1.3;border:1.5px solid #e0e0e0;border-radius:3px;padding:2.5mm 3.5mm;background:#fafafa;"><div style="font-size:8px;font-weight:800;color:#1a1a2e;letter-spacing:1.5px;margin-bottom:2mm;">PROJE BİLGİLERİ</div>'
                + '<table style="width:100%;border-collapse:collapse;font-size:10px;">'
                + '<tr><td style="padding:1.5px 3px;width:32%;color:#999;white-space:nowrap;">İŞ ADI</td><td style="padding:1.5px 3px;font-weight:700;color:#1a1a2e;">' + kayit.isAdi + '</td></tr>'
                + '<tr><td style="padding:1.5px 3px;color:#999;">MÜŞTERİ / FİRMA</td><td style="padding:1.5px 3px;font-weight:700;color:#1a1a2e;">' + (kayit.firma || "-") + '</td></tr>'
                + '<tr><td style="padding:1.5px 3px;color:#999;">PAFTA / ADA / PARSEL</td><td style="padding:1.5px 3px;font-weight:700;color:#1a1a2e;">' + paftaAdaParsel + '</td></tr>'
                + '<tr><td style="padding:1.5px 3px;color:#999;">ANLAŞMA TARİHİ</td><td style="padding:1.5px 3px;font-weight:700;color:#1a1a2e;">' + tarihStr + '</td></tr>'
                + '</table></div>'
                + '<div style="flex:1;border:1.5px solid #e0e0e0;border-radius:3px;padding:2.5mm 3.5mm;background:#fafafa;"><div style="font-size:8px;font-weight:800;color:#1a1a2e;letter-spacing:1.5px;margin-bottom:2mm;">FİNANSAL ÖZET</div>'
                + '<table style="width:100%;border-collapse:collapse;font-size:10px;">'
                + '<tr><td style="padding:1.5px 3px;color:#999;">ANLAŞMA ÜCRETİ</td><td style="padding:1.5px 3px;text-align:right;font-weight:800;color:#1a1a2e;">' + (kayit.anlasmaUcreti || 0).toLocaleString('tr-TR', {minimumFractionDigits:2}) + ' ₺</td></tr>'
                + '<tr><td style="padding:1.5px 3px;color:#2E7D32;font-weight:600;">TOPLAM TAHSİLAT</td><td style="padding:1.5px 3px;text-align:right;font-weight:800;color:#2E7D32;">' + toplamAlacak.toLocaleString('tr-TR', {minimumFractionDigits:2}) + ' ₺</td></tr>'
                + '<tr><td style="padding:1.5px 3px;color:#9E2A2B;font-weight:600;">TOPLAM GİDER</td><td style="padding:1.5px 3px;text-align:right;font-weight:800;color:#9E2A2B;">' + toplamVerecek.toLocaleString('tr-TR', {minimumFractionDigits:2}) + ' ₺</td></tr>'
                + '<tr><td style="padding:1.5px 3px;color:#999;">TOP. ÖDENEN</td><td style="padding:1.5px 3px;text-align:right;font-weight:700;color:#2E7D32;">' + toplamOdenen.toLocaleString('tr-TR', {minimumFractionDigits:2}) + ' ₺</td></tr>'
                + '<tr><td style="padding:2.5px 3px;border-top:1.5px solid #ddd;"></td><td style="padding:2.5px 3px;border-top:1.5px solid #ddd;"></td></tr>'
                + '<tr><td style="padding:1.5px 3px;font-weight:800;color:#1a1a2e;font-size:11px;">KALAN ÖDEME</td><td style="padding:1.5px 3px;text-align:right;font-weight:900;color:#9E2A2B;font-size:11px;">' + kalanToplam.toLocaleString('tr-TR', {minimumFractionDigits:2}) + ' ₺</td></tr>'
                + '<tr><td style="padding:1.5px 3px;font-weight:800;color:#1a1a2e;font-size:11px;">KALAN TAHSİLAT</td><td style="padding:1.5px 3px;text-align:right;font-weight:900;color:' + (kalanTahsilat > 0 ? '#9E2A2B' : '#2E7D32') + ';font-size:11px;">' + kalanTahsilat.toLocaleString('tr-TR', {minimumFractionDigits:2}) + ' ₺</td></tr>'
                + '<tr><td style="padding:1.5px 3px;font-weight:800;color:#1a1a2e;font-size:11px;">NET DURUM</td><td style="padding:1.5px 3px;text-align:right;font-weight:900;color:' + (netDurum >= 0 ? '#2E7D32' : '#9E2A2B') + ';font-size:11px;">' + netDurum.toLocaleString('tr-TR', {minimumFractionDigits:2}) + ' ₺</td></tr>'
                + '</table></div></div>'
                + '<div style="border:1.5px solid #e0e0e0;border-radius:3px;overflow:hidden;margin-bottom:3mm;">'
                + '<table style="width:100%;border-collapse:collapse;font-size:10px;">'
                + '<thead><tr style="background:#1a1a2e;color:#fff;">'
                + '<th style="padding:2.5mm 4mm;text-align:left;font-size:8px;letter-spacing:1px;width:24%;">AÇIKLAMA</th>'
                + '<th style="padding:2.5mm 4mm;text-align:left;font-size:8px;letter-spacing:1px;width:14%;">KİŞİ / FİRMA</th>'
                + '<th style="padding:2.5mm 4mm;text-align:center;font-size:8px;letter-spacing:1px;width:14%;">TARİH</th>'
                + '<th style="padding:2.5mm 4mm;text-align:center;font-size:8px;letter-spacing:1px;width:10%;">TİP</th>'
                + '<th style="padding:2.5mm 4mm;text-align:right;font-size:8px;letter-spacing:1px;width:19%;">TUTAR</th>'
                + '<th style="padding:2.5mm 4mm;text-align:right;font-size:8px;letter-spacing:1px;width:19%;">KALAN</th>'
                + '</tr></thead><tbody>'
                + (kalemSatirlari || '<tr><td colspan="6" style="padding:3mm 4mm;text-align:center;font-size:10px;color:#999;">KALEM BULUNMAMAKTADIR</td></tr>')
                + '</tbody></table></div>'
                + '<div style="border-top:2px solid #1a1a2e;padding-top:1.5mm;display:flex;justify-content:space-between;align-items:center;">'
                + '<div style="font-size:7px;color:#888;line-height:1.5;"><b>' + firmaAd + '</b> · ' + firmaAdres + '<br>Tel: ' + firmaTel + ' · E-posta: ' + firmaEposta + '</div>'
                + '<div style="font-size:7px;color:#aaa;text-align:right;">' + new Date().toLocaleDateString("tr-TR", {day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'}) + '</div>'
                + '</div></div>';

            const sayfaEl = document.createElement("div");
            sayfaEl.style.cssText = "position:fixed;left:-9999px;top:0;width:297mm;min-height:210mm;overflow:hidden;";
            sayfaEl.innerHTML = sayfaHtml;
            document.body.appendChild(sayfaEl);

            tmLoadingGoster("PDF oluşturuluyor...");
            html2canvas(sayfaEl, {scale:5,useCORS:true,logging:false,width:1122,height:794}).then(function(cv){
                const dt = cv.toDataURL('image/jpeg',0.95);
                const doc = new jspdf.jsPDF({format:'a4',orientation:'landscape',unit:'mm'});
                doc.addImage(dt,'JPEG',0,0,297,210);
                const temizle = function(s) { return (s || "").replace(/[\/\\:*?"<>|,;\.]/g, '').trim(); };
                const dosyaAdi = temizle(kayit.isAdi) + "_" + temizle(kayit.firma) + "_" + temizle(kayit.pafta) + "_" + temizle(kayit.ada) + "_" + temizle(kayit.parsel) + "_" + formatliId.replace('#','');
                doc.save(dosyaAdi + ".pdf");
                document.body.removeChild(sayfaEl);
                tmLoadingGizle();
            }).catch(function(e){
                tmLoadingGizle();
                tmNotify("PDF oluşturulurken hata: " + (e.message||e), "error");
                try { document.body.removeChild(sayfaEl); } catch(ex) {}
            });
        }

        /* ================= NAKİT ÖDEMEK DEKONTU MOTORU ================= */
        function nakitDekontVerileriniYukle() {
            try { return JSON.parse(localStorage.getItem("tm_nakit_dekont_db")) || []; } catch(e) { console.error("Nakit dekont veri yukleme hatasi:", e); return []; }
        }

        function tutarYaziyla(tutar) {
            if (tutar === 0) return "SIFIR ₺";
            const birler = ["","BİR","İKİ","ÜÇ","DÖRT","BEŞ","ALTI","YEDİ","SEKİZ","DOKUZ"];
            const onlar = ["","ON","YİRMİ","OTUZ","KIRK","ELLİ","ALTMIŞ","YETMİŞ","SEKSEN","DOKSAN"];
            const basamaklar = ["","BİN","MİLYON","MİLYAR","TRİLYON"];
            function ucBasamakOku(n) {
                let s = Math.floor(n);
                if (s === 0) return "";
                let str = "";
                let yz = Math.floor(s / 100);
                let kl = s % 100;
                if (yz > 0) str += yz === 1 ? "YÜZ" : birler[yz] + "YÜZ";
                if (kl > 0) {
                    let on = Math.floor(kl / 10);
                    let br = kl % 10;
                    str += onlar[on] + birler[br];
                }
                return str;
            }
            let tl = Math.floor(tutar);
            let kurus = Math.round((tutar - tl) * 100);
            if (kurus >= 100) { tl += 1; kurus = 0; }
            let result = "";
            let idx = 0;
            while (tl > 0) {
                let uc = tl % 1000;
                if (uc > 0) {
                    let oku = ucBasamakOku(uc);
                    if (idx === 1 && uc === 1) result = "BİN" + result;
                    else result = oku + basamaklar[idx] + result;
                }
                tl = Math.floor(tl / 1000);
                idx++;
            }
            result += "₺";
            if (kurus > 0) {
                result += " " + ucBasamakOku(kurus) + "KURUŞ";
            }
            return result;
        }

        function nakitDekontPdfOlustur(d) {
            const formatliId = String(d.id).padStart(5, '0');
            const formatliTutar = d.tutar.toLocaleString('tr-TR', {minimumFractionDigits:2, maximumFractionDigits:2}) + " ₺";
            const yaziyla = tutarYaziyla(d.tutar);
            const tarihKisa = d.tarih ? new Date(d.tarih).toLocaleDateString("tr-TR") : "-";
            const tarihSayi = d.tarih ? new Date(d.tarih).toLocaleDateString("tr-TR", {day:'2-digit',month:'2-digit',year:'numeric'}) : "-";
            const tipRenk = d.islemTuru === "Gelen Nakit Ödeme" ? "#2E7D32" : "#9E2A2B";

            const logoData = localStorage.getItem("tm_sirket_logo");
            let logoHtml = '';
            if (logoData && logoData !== "null" && logoData.length > 100) {
                logoHtml = '<img src="' + logoData + '" style="height:14mm;width:auto;vertical-align:middle;" alt="Logo">';
            }

            const fb = (function() {
                try { return JSON.parse(localStorage.getItem("tm_sirket_bilgileri")) || {}; } catch(e) { return {}; }
            })();
            const firmaAd = fb.ad || "TURAK MİMARLIK";
            const firmaAdres = fb.adres || "Deniz Mah. Selvi Sk. No: 14/D İĞNEADA / DEMİRKÖY / KIRKLARELİ";
            const firmaTel = fb.gsm || fb.telefon || "0543 123 45 67";
            const firmaEposta = fb.email || "info@turakmimarlik.com";

            const sayfaHtml = `
                <div style="width:210mm;min-height:297mm;padding:5mm 7mm;box-sizing:border-box;font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif;background:#fff;position:relative;color:#222;">

                    <div style="position:absolute;top:2mm;left:2mm;right:2mm;top:140mm;border:none;pointer-events:none;"></div>
                    <div style="position:absolute;bottom:70mm;right:6mm;font-size:40px;font-weight:900;color:rgba(26,26,46,0.035);letter-spacing:6px;transform:rotate(-18deg);pointer-events:none;white-space:nowrap;">${d.islemTuru === "Gelen Nakit Ödeme" ? 'TAHSİLAT' : 'ÖDEME'}</div>

                    <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:2.5mm;border-bottom:2.5px solid #1a1a2e;margin-bottom:3mm;">
                        <div>${logoHtml ? '<div>' + logoHtml + '</div>' : ''}</div>
                        <div style="text-align:right;">
                            <div style="font-size:8px;font-weight:700;color:#888;letter-spacing:1px;">DEKONT NO</div>
                            <div style="font-size:18px;font-weight:900;color:#9E2A2B;letter-spacing:1px;">#${formatliId}</div>
                        </div>
                    </div>

                    <div style="text-align:center;margin-bottom:4mm;">
                        <div style="display:inline-block;">
                            <div style="font-size:26px;font-weight:900;color:#1a1a2e;letter-spacing:6px;">NAKİT</div>
                            <div style="font-size:11px;font-weight:700;color:#1a1a2e;letter-spacing:3px;padding-top:1px;">ÖDEME DEKONTU</div>
                        </div>
                        <div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-top:1.5mm;">
                            <div style="flex:1;max-width:25mm;height:1.5px;background:linear-gradient(to left,#9E2A2B,transparent);"></div>
                            <div style="padding:1.5px 10px;border-radius:2px;font-size:8px;font-weight:800;color:#fff;background:${tipRenk};">${d.islemTuru}</div>
                            <div style="flex:1;max-width:25mm;height:1.5px;background:linear-gradient(to right,#9E2A2B,transparent);"></div>
                        </div>
                    </div>

                    <div style="display:flex;gap:4mm;margin-bottom:3mm;">
                        <div style="flex:1;border:1.5px solid #e0e0e0;border-radius:3px;padding:2.5mm 3.5mm;background:#fafafa;">
                            <div style="font-size:8px;font-weight:800;color:#1a1a2e;letter-spacing:1.5px;margin-bottom:1.5mm;">MÜŞTERİ BİLGİLERİ</div>
                            <table style="width:100%;border-collapse:collapse;font-size:10px;">
                                <tr><td style="padding:1.5px 3px;width:28%;color:#999;white-space:nowrap;">ADI SOYADI</td><td style="padding:1.5px 3px;font-weight:700;">${d.musteriAd}</td></tr>
                                <tr><td style="padding:1.5px 3px;color:#999;">FİRMA</td><td style="padding:1.5px 3px;font-weight:700;">${d.firma}</td></tr>
                                <tr><td style="padding:1.5px 3px;color:#999;">TELEFON</td><td style="padding:1.5px 3px;font-weight:700;">${d.tel}</td></tr>
                            </table>
                        </div>
                        <div style="flex:1;border:1.5px solid #e0e0e0;border-radius:3px;padding:2.5mm 3.5mm;background:#fafafa;">
                            <div style="font-size:8px;font-weight:800;color:#1a1a2e;letter-spacing:1.5px;margin-bottom:1.5mm;">İŞLEM BİLGİSİ</div>
                            <table style="width:100%;border-collapse:collapse;font-size:10px;">
                                <tr><td style="padding:1.5px 3px;width:32%;color:#999;white-space:nowrap;">İŞLEM TARİHİ</td><td style="padding:1.5px 3px;font-weight:700;">${tarihKisa}</td></tr>
                                <tr><td style="padding:1.5px 3px;color:#999;">BELGE TARİHİ</td><td style="padding:1.5px 3px;font-weight:700;">${tarihSayi}</td></tr>
                            </table>
                        </div>
                    </div>

                    <div style="border:1.5px solid #e0e0e0;border-radius:3px;padding:2.5mm 3.5mm;margin-bottom:3mm;min-height:12mm;">
                        <div style="font-size:8px;font-weight:800;color:#1a1a2e;letter-spacing:1.5px;margin-bottom:1.5mm;">AÇIKLAMA</div>
                        <div style="font-size:9.5px;color:#444;line-height:1.6;">${d.aciklama || "-"}</div>
                    </div>

                    <div style="border:1.5px solid #e0e0e0;border-radius:3px;overflow:hidden;margin-bottom:3mm;">
                        <table style="width:100%;border-collapse:collapse;font-size:10px;">
                            <thead>
                                <tr style="background:#1a1a2e;color:#fff;">
                                    <th style="padding:2mm 4mm;text-align:left;font-size:8px;letter-spacing:1px;">AÇIKLAMA</th>
                                    <th style="padding:2mm 4mm;text-align:right;font-size:8px;letter-spacing:1px;width:35%;">TUTAR (₺)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="background:${d.islemTuru === "Gelen Nakit Ödeme" ? 'rgba(46,125,50,0.06)' : 'rgba(158,42,43,0.06)'};">
                                    <td style="padding:3mm 4mm;font-weight:800;font-size:12px;color:#1a1a2e;">TOPLAM TUTAR</td>
                                    <td style="padding:3mm 4mm;text-align:right;font-weight:900;font-size:17px;color:${tipRenk};">${formatliTutar}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div style="border:1.5px solid #e0e0e0;border-radius:3px;padding:2.5mm 3.5mm;margin-bottom:3mm;">
                        <div style="font-size:8px;font-weight:800;color:#1a1a2e;letter-spacing:1.5px;margin-bottom:1.5mm;">YAZIYLA TUTAR</div>
                        <div style="font-size:9.5px;font-weight:700;color:#333;letter-spacing:0.3px;">${yaziyla}</div>
                    </div>

                    <div style="display:flex;justify-content:space-between;gap:10mm;margin-bottom:2.5mm;">
                        <div style="flex:1;text-align:center;">
                            <div style="height:10mm;border-bottom:1.5px solid #1a1a2e;margin-bottom:1.5mm;"></div>
                            <div style="font-size:9px;font-weight:700;color:#1a1a2e;">ÖDEMEYİ ALAN</div>
                            <div style="font-size:7px;color:#999;">Ad Soyad / İmza / Tarih</div>
                        </div>
                        <div style="flex:1;text-align:center;">
                            <div style="height:10mm;border-bottom:1.5px solid #1a1a2e;margin-bottom:1.5mm;"></div>
                            <div style="font-size:9px;font-weight:700;color:#1a1a2e;">ÖDEMEYİ YAPAN</div>
                            <div style="font-size:7px;color:#999;">Ad Soyad / İmza / Tarih</div>
                        </div>
                    </div>

                    <div style="border-top:2px solid #1a1a2e;padding-top:1.5mm;text-align:center;">
                        <div style="font-size:7px;color:#888;line-height:1.5;">
                            <b>${firmaAd}</b> · ${firmaAdres}<br>
                            Tel: ${firmaTel} · E-posta: ${firmaEposta}
                        </div>
                    </div>
                </div>
            `;

            const sayfaEl = document.createElement("div");
            sayfaEl.style.cssText = "position:fixed;left:-9999px;top:0;width:210mm;min-height:297mm;overflow:hidden;";
            sayfaEl.innerHTML = sayfaHtml;
            document.body.appendChild(sayfaEl);

            html2canvas(sayfaEl, {scale:6,useCORS:true,logging:false,width:793,height:1122}).then(function(cv){
                var dt = cv.toDataURL('image/jpeg',0.95);
                var doc = new jspdf.jsPDF({format:'a4',orientation:'portrait',unit:'mm'});
                doc.addImage(dt,'JPEG',0,0,210,297);
                doc.save("NAKIT_DEKONT_" + formatliId + ".pdf");
                document.body.removeChild(sayfaEl);
            }).catch(function(e){
                tmNotify("PDF oluşturulurken hata: " + (e.message||e), "error");
                try { document.body.removeChild(sayfaEl); } catch(ex) { console.error("Nakit dekont PDF DOM temizlik hatasi:", ex); }
            });
        }

        function nakitDekontKaydet() {
            const musteriAd = trToUpper(document.getElementById("ndMusteriAd").value.trim());
            const firma = trToUpper(document.getElementById("ndFirma").value.trim());
            const tel = document.getElementById("ndTel").value.trim();
            const islemTuru = document.getElementById("ndIslemTuru").value;
            const tarih = document.getElementById("ndTarih").value;
            const aciklama = trToUpper(document.getElementById("ndAciklama").value.trim());
            const tutarStr = document.getElementById("ndTutar").value.trim();

            if(!musteriAd) { tmNotify("Müşteri adı zorunludur!", "error"); return; }

            const tutar = tmTutarCoz(tutarStr);
            if(isNaN(tutar) || tutar <= 0) { tmNotify("Geçerli bir tutar giriniz! (Örn: 5000,00)", "error"); return; }

            tmLoadingGoster('Dekont kaydediliyor...');
            let db = nakitDekontVerileriniYukle();
            const maxId = db.reduce((max, item) => (item.id > max ? item.id : max), 0);
            const yeniId = maxId + 1;

            db.push({
                id: yeniId,
                musteriAd: musteriAd || "-",
                firma: firma || "-",
                tel: tel || "-",
                islemTuru: islemTuru,
                tarih: tarih || anlikTarihGetir(),
                aciklama: aciklama || "-",
                tutar: tutar
            });

            localStorage.setItem("tm_nakit_dekont_db", JSON.stringify(db));
            tmLoadingGizle();
            nakitDekontFormuTemizle();
            nakitDekontListesiniYenile();
            tmNotify("Nakit ödeme dekontu başarıyla kaydedildi. Dekont #" + String(yeniId).padStart(5, '0'), "success");
            aktiviteEkle("Dekont kaydedildi: #" + String(yeniId).padStart(5, '0'), "Muhasebe");
        }

        function nakitDekontFormuTemizle() {
            document.getElementById("ndMusteriAd").value = "";
            document.getElementById("ndFirma").value = "";
            document.getElementById("ndTel").value = "";
            document.getElementById("ndIslemTuru").value = "Gelen Nakit Ödeme";
            nakitDekontIslemTuruRenk(document.getElementById("ndIslemTuru"));
            document.getElementById("ndAciklama").value = "";
            document.getElementById("ndTutar").value = "";
            document.getElementById("ndTarih").value = anlikTarihGetir();
        }

        function nakitDekontSil(id) {
            tmConfirm("Bu dekontu kalıcı olarak silmek istediğinize emin misiniz?", function() {
                let db = nakitDekontVerileriniYukle();
                db = db.filter(d => d.id !== id);
                localStorage.setItem("tm_nakit_dekont_db", JSON.stringify(db));
                nakitDekontListesiniYenile();
                isMuhFormIdGuncelle();
            });
        }

        function nakitDekontListesiniYenile() {
            const konteyner = document.getElementById("nakitDekontTablosu");
            if(!konteyner) return;
            let db = nakitDekontVerileriniYukle();

            if(db.length === 0) {
                konteyner.innerHTML = tmEmptyStateHTML('<i class="fa-solid fa-money-bill-wave"></i>','Henüz nakit ödeme dekontu bulunmamaktadır.','Yeni bir nakit ödeme dekontu oluşturmak için formu doldurun.');
                return;
            }

            if(typeof ND_SIRALA === 'undefined') window.ND_SIRALA = { kolon: 'id', yon: 'azalan' };

            db.sort((a, b) => {
                let valA, valB;
                switch(ND_SIRALA.kolon) {
                    case 'id': valA = a.id; valB = b.id; break;
                    case 'tarih':
                        valA = a.tarih ? new Date(a.tarih).getTime() : 0;
                        valB = b.tarih ? new Date(b.tarih).getTime() : 0;
                        break;
                    case 'tutar': valA = a.tutar; valB = b.tutar; break;
                    default: valA = a.id; valB = b.id;
                }
                return ND_SIRALA.yon === 'azalan' ? valB - valA : valA - valB;
            });

            const sortIcon = (kolon) => ND_SIRALA.kolon === kolon ? (ND_SIRALA.yon === 'azalan' ? 'v' : '^') : '|';

            let html = `
                <table class="app-table">
                    <thead>
                        <tr>
                            <th class="th-sortable" onclick="nakitDekontSırala('id')">Dekont ID <span>${sortIcon('id')}</span></th>
                            <th>Müşteri / Firma</th>
                            <th>İşlem Türü</th>
                            <th class="th-sortable" onclick="nakitDekontSırala('tarih')">Tarih <span>${sortIcon('tarih')}</span></th>
                            <th>Açıklama</th>
                            <th class="th-sortable" onclick="nakitDekontSırala('tutar')">Tutar <span>${sortIcon('tutar')}</span></th>
                            <th>İşlem</th>
                        </tr>
                    </thead>
                    <tbody id="ndTableBody">
            `;

            db.forEach(d => {
                const formatliId = "#" + String(d.id).padStart(5, '0');
                const tipRenk = d.islemTuru === "Gelen Nakit Ödeme" ? "var(--btn-green)" : "var(--accent-red)";
                const formatliTutar = d.tutar.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + " ₺";

                html += `
                    <tr class="nd-row" data-search="${d.musteriAd} ${d.firma} ${d.islemTuru} ${formatliId}">
                        <td style="font-weight:700; color:var(--accent-red);">${formatliId}</td>
                        <td><b>${d.musteriAd}</b><br><small style="color:var(--text-light)">${d.firma}</small></td>
                        <td style="color:${tipRenk}; font-weight:600;">${d.islemTuru}</td>
                        <td>${d.tarih ? new Date(d.tarih).toLocaleDateString("tr-TR") : "-"}</td>
                        <td><small>${d.aciklama}</small></td>
                        <td style="text-align:right; font-weight:700; color:${tipRenk};">${formatliTutar}</td>
                        <td style="white-space:nowrap;">
                            <button class="btn-warning" onclick="nakitDekontPdfUretById(${d.id})" style="font-size:11px; padding:4px 8px;"><i class="fa-regular fa-file-lines"></i> PDF</button>
                            <button class="btn-danger" onclick="nakitDekontSil(${d.id})" style="font-size:11px; padding:4px 8px;">Sil</button>
                        </td>
                    </tr>
                `;
            });

            html += `</tbody></table>`;
            konteyner.innerHTML = html;
        }

        function nakitDekontIslemTuruRenk(el) {
            const renk = el.value === "Gelen Nakit Ödeme" ? "#2E7D32" : "#9E2A2B";
            el.style.color = renk;
        }

        function nakitDekontSırala(kolon) {
            if(typeof ND_SIRALA === 'undefined') window.ND_SIRALA = { kolon: 'id', yon: 'azalan' };
            if(ND_SIRALA.kolon === kolon) {
                ND_SIRALA.yon = ND_SIRALA.yon === 'azalan' ? 'artan' : 'azalan';
            } else {
                ND_SIRALA.kolon = kolon;
                ND_SIRALA.yon = 'azalan';
            }
            nakitDekontListesiniYenile();
        }

        function nakitDekontPdfUretById(id) {
            const db = nakitDekontVerileriniYukle();
            const d = db.find(item => item.id === id);
            if(!d) { tmNotify("Dekont bulunamadı!", "error"); return; }
            nakitDekontPdfOlustur(d);
        }

        function nakitDekontListesiniFiltrele() {
            const kelime = document.getElementById("ndAramaInput").value.toLowerCase().trim();
            const tbody = document.getElementById("ndTableBody");
            if(!tbody) return;
            tbody.querySelectorAll("tr.nd-row").forEach(satir => {
                const data = (satir.getAttribute("data-search") || "").toLowerCase();
                satir.style.display = data.includes(kelime) ? "" : "none";
            });
        }

        function nakitDekontPdfUret() {
            const musteriAd = trToUpper(document.getElementById("ndMusteriAd").value.trim()) || "BELİRTİLMEMİŞ";
            const firma = trToUpper(document.getElementById("ndFirma").value.trim()) || "-";
            const tel = document.getElementById("ndTel").value.trim() || "-";
            const islemTuru = document.getElementById("ndIslemTuru").value;
            const tarih = document.getElementById("ndTarih").value;
            const aciklama = trToUpper(document.getElementById("ndAciklama").value.trim()) || "-";
            const tutarStr = document.getElementById("ndTutar").value.trim();
            const tutar = tmTutarCoz(tutarStr);

            if(!musteriAd || tutar <= 0) { tmNotify("Lütfen önce müşteri adı ve tutar bilgilerini giriniz!", "error"); return; }

            let db = nakitDekontVerileriniYukle();
            const maxId = db.reduce((max, item) => item.id > max ? item.id : max, 0);
            const geciciId = maxId + 1;

            nakitDekontPdfOlustur({
                id: geciciId,
                musteriAd: musteriAd,
                firma: firma,
                tel: tel,
                islemTuru: islemTuru,
                tarih: tarih || anlikTarihGetir(),
                aciklama: aciklama,
                tutar: tutar
            });
        }

        /* ================= YILLIK BÜTÇE MODÜLÜ ================= */
        const YB_AY_ADI = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
        const YB_AY_KISA = ["Oc","Şb","Mt","Ns","My","Hz","Tz","Ağ","Ey","Ek","Ks","Ar"];
        const YB_GELIR_VARSAYILAN = ["projeler","komisyonlar","faizler","kiralar","satışlar"];
        const YB_GIDER_VARSAYILAN = ["projeler","faturalar","vergi","komisyon","maaş","sigorta"];
        let ybChartAylik = null, ybChartGelir = null, ybChartGider = null, ybChartNet = null;
        let ybAktifSekme = "rapor";
        function ybTrUpper(s) { return (s||'').replace(/[iİ]/g,'İ').replace(/[ı]/g,'I').toLocaleUpperCase('tr-TR'); }

        function ybVeriYukle() {
            var db;
            try { db = JSON.parse(localStorage.getItem("tm_yillik_butce_db")); } catch(e) { db = null; console.error("Yillik butce yukleme hatasi:", e); }
            const simdi = new Date().getFullYear();
            if(!db || !db.aktifYil) {
                db = { aktifYil: simdi, yillar: {}, tamamlananYillar: [] };
                db.yillar[simdi] = { baslangicBakiye:0, gelirKategorileri:[...YB_GELIR_VARSAYILAN], giderKategorileri:[...YB_GIDER_VARSAYILAN], aylar:{} };
                origSetItem("tm_yillik_butce_db", JSON.stringify(db));
            } else if(db.aktifYil !== simdi) {
                const eskiYil = db.yillar[db.aktifYil];
                if(eskiYil) {
                    if(!db.tamamlananYillar) db.tamamlananYillar=[];
                    if(!db.tamamlananYillar.some(y=>y.yil===db.aktifYil)) db.tamamlananYillar.push({yil:db.aktifYil,...eskiYil});
                    delete db.yillar[db.aktifYil];
                }
                db.aktifYil = simdi;
                const kalan = eskiYil ? Math.max(0, (eskiYil.baslangicBakiye||0) + ybYilToplam(eskiYil,"gelir") - ybYilToplam(eskiYil,"gider")) : 0;
                if(!db.yillar[simdi]) db.yillar[simdi] = { baslangicBakiye:kalan, gelirKategorileri:[...YB_GELIR_VARSAYILAN], giderKategorileri:[...YB_GIDER_VARSAYILAN], aylar:{} };
                origSetItem("tm_yillik_butce_db", JSON.stringify(db));
            }
            return db;
        }
        function ybVeriKaydet(db) { try { localStorage.setItem("tm_yillik_butce_db", JSON.stringify(db)); } catch(e) { console.error("Yillik butce kaydetme hatasi:", e); } }

        function ybAktifYil() { return ybVeriYukle().aktifYil; }

        function ybYilVerisi() {
            const db = ybVeriYukle();
            const yil = db.aktifYil;
            if(!db.yillar[yil]) {
                db.yillar[yil] = { baslangicBakiye: 0, gelirKategorileri: [...YB_GELIR_VARSAYILAN], giderKategorileri: [...YB_GIDER_VARSAYILAN], aylar: {} };
                ybVeriKaydet(db);
            }
            return db.yillar[yil];
        }

        function ybAyVerisi(ayIndex, kayit) {
            if(!kayit) kayit = ybYilVerisi();
            if(!kayit.aylar[ayIndex]) kayit.aylar[ayIndex] = { gelirler: {}, giderler: {} };
            const ay = kayit.aylar[ayIndex];
            kayit.gelirKategorileri.forEach(k => { if(!ay.gelirler[k]) ay.gelirler[k] = []; });
            kayit.giderKategorileri.forEach(k => { if(!ay.giderler[k]) ay.giderler[k] = []; });
            return ay;
        }

        function ybAylikToplam(yilObj, tip, ayIndex) {
            const ay = (yilObj.aylar||{})[ayIndex];
            if(!ay) return 0;
            const dict = tip === "gelir" ? ay.gelirler : ay.giderler;
            let t = 0;
            Object.values(dict||{}).forEach(arr => arr.forEach(k => t += k.tutar||0));
            return t;
        }

        function ybYilToplam(yilObj, tip) {
            let t = 0;
            for(let i = 0; i < 12; i++) t += ybAylikToplam(yilObj, tip, i);
            return t;
        }

        function ybSayfayiYukle() {
            ybGosterilenYil = null;
            const db = ybVeriYukle();
            if(!db.tamamlananYillar || db.tamamlananYillar.length===0) {
                const ornek = {
                    yil: 2025, baslangicBakiye: 50000,
                    gelirKategorileri: [...YB_GELIR_VARSAYILAN],
                    giderKategorileri: [...YB_GIDER_VARSAYILAN], aylar: {}
                };
                [0,1,2,3,4,5,6,7,8,9,10,11].forEach(a => {
                    ornek.aylar[a] = {
                        gelirler: {
                            projeler: [{id:Date.now()+a*10+1, aciklama:"Proje "+(a+1)+" danışmanlık", tutar:85000+Math.round(Math.random()*30000)},{id:Date.now()+a*10+2, aciklama:"Proje "+(a+1)+" uygulama", tutar:40000+Math.round(Math.random()*20000)}],
                            komisyonlar: [{id:Date.now()+a*10+3, aciklama:"Referans komisyonu", tutar:Math.round(Math.random()*8000)}],
                            faizler: [{id:Date.now()+a*10+4, aciklama:"Vadeli mevduat faizi", tutar:Math.round(1500+Math.random()*2000)}],
                            kiralar: [{id:Date.now()+a*10+5, aciklama:"Ofis alt kiracı", tutar:5000}],
                            satışlar: a%3===0 ? [{id:Date.now()+a*10+6, aciklama:"Proje satışı", tutar:20000+Math.round(Math.random()*40000)}] : []
                        },
                        giderler: {
                            projeler: [{id:Date.now()+a*10+20, aciklama:"Proje maliyeti", tutar:35000+Math.round(Math.random()*15000)}],
                            faturalar: [{id:Date.now()+a*10+21, aciklama:"Elektrik+Su+İnternet", tutar:Math.round(4000+Math.random()*3000)},{id:Date.now()+a*10+22, aciklama:"Kırtasiye", tutar:Math.round(500+Math.random()*1500)}],
                            vergi: [{id:Date.now()+a*10+23, aciklama:"KDV+Stopaj", tutar:15000+Math.round(Math.random()*10000)}],
                            komisyon: [{id:Date.now()+a*10+24, aciklama:"Acenta komisyonu", tutar:Math.round(3000+Math.random()*4000)}],
                            maaş: [{id:Date.now()+a*10+25, aciklama:"Personel maaşları", tutar:42000+Math.round(Math.random()*5000)}],
                            sigorta: [{id:Date.now()+a*10+26, aciklama:"SGK+Bağkur", tutar:9500+Math.round(Math.random()*2000)}]
                        }
                    };
                });
                db.tamamlananYillar = db.tamamlananYillar || [];
                db.tamamlananYillar.push(ornek);
                ybVeriKaydet(db);
            }
            document.getElementById("ybAktifYilLabel").textContent = String(db.aktifYil);
            ybMonthGridRender();
            ybTamamlananlariGoster();
            ybSekmeGoster("rapor");
        }

        let ybGosterilenYil = null;

        function ybMonthGridRender() {
            const grid = document.getElementById("ybMonthGrid");
            if(!grid) return;
            const kayit = ybYilVerisi();
            let h = "";
            for(let i=0;i<12;i++) {
                const gelir = ybAylikToplam(kayit,"gelir",i);
                const gider = ybAylikToplam(kayit,"gider",i);
                h += '<div class="yb-month-card" data-ay="'+i+'" onclick="ybSekmeGoster(\''+i+'\')">'+
                    '<div class="mc-ay">'+YB_AY_ADI[i]+'</div>'+
                    (gelir>0 ? '<div class="mc-gelir">+'+gelir.toLocaleString('tr-TR',{minFractionDigits:0})+' ?</div>' : '')+
                    (gider>0 ? '<div class="mc-gider">-'+gider.toLocaleString('tr-TR',{minFractionDigits:0})+' ?</div>' : '')+
                    (gelir===0&&gider===0 ? '<div class="mc-bos">—</div>' : '')+
                '</div>';
            }
            grid.innerHTML = h;
        }

        function ybGecmisYilGoster(yil) {
            const db = ybVeriYukle();
            const kayit = db.tamamlananYillar.find(function(y){return y.yil===yil;});
            if(!kayit) { tmNotify("Yıl verisi bulunamadı!","error"); return; }
            ybGosterilenYil = yil;
            ybGecmisYilRaporuGoster(kayit, yil);
        }

        function ybCariYilaDon() {
            ybGosterilenYil = null;
            ybSekmeGoster("rapor");
        }

        function ybGecmisYilRaporuGoster(kayit, yil) {
            const icerik = document.getElementById("ybSekmeIcerik");
            const aylikGelir = Array.from({length:12}, (_,i) => ybAylikToplam(kayit,"gelir",i));
            const aylikGider = Array.from({length:12}, (_,i) => ybAylikToplam(kayit,"gider",i));
            const toplamGelir = aylikGelir.reduce((s,v)=>s+v,0);
            const toplamGider = aylikGider.reduce((s,v)=>s+v,0);
            const bakiye = (kayit.baslangicBakiye||0) + toplamGelir - toplamGider;

            let h = '<div class="yb-gecmis-container"><div class="gbaslik">'+
                '<h3><i class="fa-regular fa-folder-open"></i> '+yil+' Yılı Bütçe Raporu</h3>'+
                '<button class="btn btn-primary" onclick="ybCariYilaDon()" style="padding:8px 18px;font-size:12px;"><i class="fa-solid fa-arrow-left"></i> Cari Yıla Dön</button></div>';

            h += '<div class="yb-graph-grid"><div class="yb-graph-box full"><canvas id="ybChartNetDurum"></canvas></div>'+
                '<div class="yb-graph-box"><canvas id="ybChartGelirDagilim"></canvas></div>'+
                '<div class="yb-graph-box"><canvas id="ybChartGiderDagilim"></canvas></div>'+
                '<div class="yb-graph-box full"><canvas id="ybChartAylikKarsilastirma"></canvas></div></div>';

            h += '<div class="yb-ozet-row">'+
                '<div class="yb-ozet-card"><span class="oz-label">Başlangıç Bakiyesi</span><span class="oz-val" style="color:var(--yb-text);">'+(kayit.baslangicBakiye||0).toLocaleString('tr-TR',{minFractionDigits:2})+' ?</span></div>'+
                '<div class="yb-ozet-card"><span class="oz-label">Toplam Gelir</span><span class="oz-val green">'+toplamGelir.toLocaleString('tr-TR',{minFractionDigits:2})+' ?</span></div>'+
                '<div class="yb-ozet-card"><span class="oz-label">Toplam Gider</span><span class="oz-val red">'+toplamGider.toLocaleString('tr-TR',{minFractionDigits:2})+' ?</span></div>'+
                '<div class="yb-ozet-card"><span class="oz-label">Net Bakiye</span><span class="oz-val '+(bakiye>=0?'gold':'red')+'">'+bakiye.toLocaleString('tr-TR',{minFractionDigits:2})+' ?</span></div></div>';

            for(let i=0;i<12;i++) {
                const ay = kayit.aylar[i];
                if(!ay) continue;
                const aG = ybAylikToplam(kayit,"gelir",i);
                const aGi = ybAylikToplam(kayit,"gider",i);
                if(aG===0 && aGi===0) continue;
                h += '<h4 style="margin:15px 0 6px 0;font-size:13px;color:var(--yb-text);border-left:4px solid var(--yb-accent);padding-left:10px;">'+ybTrUpper(YB_AY_ADI[i])+'</h4>'+
                    '<table class="yb-dagilim-tablo"><thead><tr><th>Kategori</th><th>Tür</th><th>Açıklama</th><th style="text-align:right;">Tutar</th></tr></thead><tbody>';
                Object.entries(ay.gelirler||{}).forEach(([ktg,items]) => items.forEach(k => {
                    h += '<tr><td style="font-weight:600;">'+ybTrUpper(ktg)+'</td><td style="color:var(--yb-gelir);font-weight:600;">GELİR</td><td>'+(k.aciklama||'')+'</td><td style="text-align:right;font-weight:600;">'+(k.tutar||0).toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</td></tr>';
                }));
                if(aG>0) h += '<tr style="background:rgba(46,204,113,0.08);font-weight:700;"><td colspan="3" style="text-align:right;color:var(--yb-gelir);">Gelir Toplamı</td><td style="text-align:right;color:var(--yb-gelir);">+'+aG.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</td></tr>';
                Object.entries(ay.giderler||{}).forEach(([ktg,items]) => items.forEach(k => {
                    h += '<tr><td style="font-weight:600;">'+ybTrUpper(ktg)+'</td><td style="color:var(--yb-gider);font-weight:600;">GİDER</td><td>'+(k.aciklama||'')+'</td><td style="text-align:right;font-weight:600;">'+(k.tutar||0).toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</td></tr>';
                }));
                if(aGi>0) h += '<tr style="background:rgba(231,76,60,0.08);font-weight:700;"><td colspan="3" style="text-align:right;color:var(--yb-gider);">Gider Toplamı</td><td style="text-align:right;color:var(--yb-gider);">-'+aGi.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</td></tr>';
                h += '<tr style="background:rgba(255,255,255,0.03);font-weight:700;"><td colspan="3" style="text-align:right;color:var(--yb-text-light);">Net Toplam</td><td style="text-align:right;color:'+((aG-aGi)>=0?'var(--yb-gelir)':'var(--yb-gider)')+';">'+(aG-aGi).toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</td></tr>';
                h += '</tbody></table>';
            }
            h += '</div>';
            icerik.innerHTML = h;
            setTimeout(() => ybGrafikleriCiz(kayit, aylikGelir, aylikGider, toplamGelir, toplamGider), 50);
        }

        function ybTamamlananlariGoster() {
            const wrap = document.getElementById("ybTimelineWrap");
            if(!wrap) return;
            const db = ybVeriYukle();
            const arr = db.tamamlananYillar||[];
            if(arr.length===0) { wrap.innerHTML = '<div style="text-align:center;padding:20px;color:var(--yb-text-light);font-size:13px;">Henüz tamamlanan yıl bulunmuyor.</div>'; return; }
            const sorted = [...arr].sort((a,b)=>b.yil-a.yil);
            let h = '<table class="yb-yil-tablo"><thead><tr>'+
                '<th>Yıl</th><th>Baş. Bakiye</th><th>Toplam Gelir</th><th>Toplam Gider</th><th>Net Bakiye</th><th>İşlemler</th>'+
                '</tr></thead><tbody>';
            sorted.forEach(function(y){
                const tG = ybYilToplam(y,"gelir"), tGi = ybYilToplam(y,"gider");
                const net = (y.baslangicBakiye||0)+tG-tGi;
                h += '<tr>'+
                    '<td class="t-yil">'+y.yil+'</td>'+
                    '<td class="t-sayi">'+(y.baslangicBakiye||0).toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</td>'+
                    '<td class="t-sayi t-gelir">+'+tG.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</td>'+
                    '<td class="t-sayi t-gider">-'+tGi.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</td>'+
                    '<td class="t-sayi '+(net>=0?'t-gelir':'t-gider')+'">'+(net>=0?'+':'')+net.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</td>'+
                    '<td class="t-islem">'+
                        '<button class="t-goruntule" onclick="ybGecmisYilGoster('+y.yil+')"><i class="fa-regular fa-folder-open"></i> Görüntüle</button>'+
                        '<button class="t-pdf" onclick="ybPdfIndir('+y.yil+')"><i class="fa-regular fa-file-lines"></i> PDF</button></td>'+
                    '</tr>';
            });
            h += '</tbody></table>';
            wrap.innerHTML = h;
        }

        function ybAccStateKaydet() { var a=[]; document.querySelectorAll(".yb-acc-body.open").forEach(function(e){a.push(e.id);}); return a; }
        function ybAccStateGeriYukle(liste) { liste.forEach(function(id){var e=document.getElementById(id);if(e){e.classList.add('open');e.parentElement.querySelector('.yb-acc-header').classList.add('open');}}); }

        function ybSekmeGoster(sekme) {
            ybAktifSekme = sekme;
            if(ybGosterilenYil !== null) { ybCariYilaDon(); return; }
            document.querySelectorAll(".yb-view-pill").forEach(function(el){el.classList.remove("yb-view-aktif");});
            var pillBtn = document.querySelector('.yb-view-pill[data-view="'+sekme+'"]');
            if(pillBtn) pillBtn.classList.add("yb-view-aktif");
            document.querySelectorAll(".yb-month-card").forEach(function(el){el.classList.remove("active");});
            var monthCard = document.querySelector('.yb-month-card[data-ay="'+sekme+'"]');
            if(monthCard) monthCard.classList.add("active");
            if(sekme==="rapor") ybRaporGoster();
            else if(sekme==="karsilastir") ybKarsilastirGoster();
            else ybAyGoster(parseInt(sekme));
        }

        function ybAyGoster(ayIdx) {
            const icerik = document.getElementById("ybSekmeIcerik");
            const kayit = ybYilVerisi();
            const ay = ybAyVerisi(ayIdx);
            const aylikGelir = ybAylikToplam(kayit,"gelir",ayIdx);
            const aylikGider = ybAylikToplam(kayit,"gider",ayIdx);
            const fark = aylikGelir - aylikGider;

            let h = '<h3 style="border:none;padding:0;margin:0 0 16px 0;"><i class="fa-regular fa-calendar"></i> '+YB_AY_ADI[ayIdx]+' - Bütçe Detayı</h3>';

            // 3 separate summary cards
            h += '<div class="yb-sum-row">'+
                '<div class="yb-sum-card sc-gelir"><div class="sc-label">Aylık Gelir</div><div class="sc-value">'+aylikGelir.toLocaleString('tr-TR',{minFractionDigits:2})+' ?</div></div>'+
                '<div class="yb-sum-card sc-gider"><div class="sc-label">Aylık Gider</div><div class="sc-value">'+aylikGider.toLocaleString('tr-TR',{minFractionDigits:2})+' ?</div></div>'+
                '<div class="yb-sum-card sc-fark"><div class="sc-label">Fark</div><div class="sc-value">'+fark.toLocaleString('tr-TR',{minFractionDigits:2})+' ?</div></div></div>';

            // Gelir accordion
            h += '<div class="yb-acc-section"><h4 class="acc-gelir"><i class="fa-solid fa-chart-line"></i> Gelirler</h4>';
            kayit.gelirKategorileri.forEach(function(ktg){
                const items = ay.gelirler[ktg]||[];
                const ara = items.reduce(function(s,i){return s+(i.tutar||0);},0);
                const itemId = "accG_"+ktg.replace(/[^a-z0-9]/gi,'_')+"_"+ayIdx;
                h += '<div class="yb-acc-item">'+
                    '<div class="yb-acc-header" onclick="document.getElementById(\''+itemId+'\').classList.toggle(\'open\');this.classList.toggle(\'open\');">'+
                    '<span class="acc-kat">'+ybTrUpper(ktg)+'</span>'+
                    '<span class="acc-tutar">'+ara.toLocaleString('tr-TR',{minFractionDigits:2})+' ?</span>'+
                    '<span class="acc-ok">¡</span></div>'+
                    '<div class="yb-acc-body" id="'+itemId+'">';
                if(items.length>0) {
                    h += '<table><tbody>';
                    items.forEach(function(k){
                        h += '<tr data-id="'+k.id+'">'+
                            '<td style="width:45%;"><input class="acc-input" type="text" value="'+k.aciklama+'" onchange="ybKalemGuncelle('+k.id+',\'aciklama\',this.value)" placeholder="Açıklama"></td>'+
                            '<td style="width:40%;"><div class="acc-tutar-wrap">'+
                                '<input class="acc-tutar-input" type="text" value="'+(k.tutar||0).toLocaleString('tr-TR',{minFractionDigits:2})+'" onfocus="tmTutarFocus(this)" oninput="tmTutarFormatla(this)" onblur="tmTutarBlur(this);ybKalemGuncelle('+k.id+',\'tutar\',this.value)">'+
                                ' <span class="acc-tl-simge">?</span></div></td>'+
                            '<td style="width:15%;"><button class="acc-btn-sil" onclick="ybKalemSil('+k.id+','+ayIdx+')" title="Sil"><i class="fa-solid fa-xmark"></i></button></td>'+
                        '</tr>';
                    });
                    h += '</tbody></table>';
                }
                h += '<button class="acc-btn-ekle" onclick="ybModalKalemAc(\'gelir\',\''+ktg+'\','+ayIdx+')"><i class="fa-solid fa-plus"></i> Kalem Ekle</button>'+
                    '</div></div>';
            });
            h += '<button class="acc-btn-yonet" onclick="ybKategoriYonet(\'gelir\')"><i class="fa-regular fa-folder-open"></i> Kategorileri Yönet</button></div>';

            // Gider accordion
            h += '<div class="yb-acc-section"><h4 class="acc-gider"><i class="fa-solid fa-chart-line fa-rotate-180"></i> Giderler</h4>';
            kayit.giderKategorileri.forEach(function(ktg){
                const items = ay.giderler[ktg]||[];
                const ara = items.reduce(function(s,i){return s+(i.tutar||0);},0);
                const itemId = "accD_"+ktg.replace(/[^a-z0-9]/gi,'_')+"_"+ayIdx;
                h += '<div class="yb-acc-item">'+
                    '<div class="yb-acc-header" onclick="document.getElementById(\''+itemId+'\').classList.toggle(\'open\');this.classList.toggle(\'open\');">'+
                    '<span class="acc-kat">'+ybTrUpper(ktg)+'</span>'+
                    '<span class="acc-tutar">'+ara.toLocaleString('tr-TR',{minFractionDigits:2})+' ?</span>'+
                    '<span class="acc-ok">¡</span></div>'+
                    '<div class="yb-acc-body" id="'+itemId+'">';
                if(items.length>0) {
                    h += '<table><tbody>';
                    items.forEach(function(k){
                        h += '<tr data-id="'+k.id+'">'+
                            '<td style="width:45%;"><input class="acc-input" type="text" value="'+k.aciklama+'" onchange="ybKalemGuncelle('+k.id+',\'aciklama\',this.value)" placeholder="Açıklama"></td>'+
                            '<td style="width:40%;"><div class="acc-tutar-wrap">'+
                                '<input class="acc-tutar-input" type="text" value="'+(k.tutar||0).toLocaleString('tr-TR',{minFractionDigits:2})+'" onfocus="tmTutarFocus(this)" oninput="tmTutarFormatla(this)" onblur="tmTutarBlur(this);ybKalemGuncelle('+k.id+',\'tutar\',this.value)">'+
                                ' <span class="acc-tl-simge">?</span></div></td>'+
                            '<td style="width:15%;"><button class="acc-btn-sil" onclick="ybKalemSil('+k.id+','+ayIdx+')" title="Sil"><i class="fa-solid fa-xmark"></i></button></td>'+
                        '</tr>';
                    });
                    h += '</tbody></table>';
                }
                h += '<button class="acc-btn-ekle" onclick="ybModalKalemAc(\'gider\',\''+ktg+'\','+ayIdx+')"><i class="fa-solid fa-plus"></i> Kalem Ekle</button>'+
                    '</div></div>';
            });
            h += '<button class="acc-btn-yonet" onclick="ybKategoriYonet(\'gider\')"><i class="fa-regular fa-folder-open"></i> Kategorileri Yönet</button></div>';

            icerik.innerHTML = h;
        }

        function ybRaporGoster() {
            const icerik = document.getElementById("ybSekmeIcerik");
            const kayit = ybYilVerisi();
            const db = ybVeriYukle();
            const yil = db.aktifYil;
            const aylikGelir = Array.from({length:12}, (_,i) => ybAylikToplam(kayit,"gelir",i));
            const aylikGider = Array.from({length:12}, (_,i) => ybAylikToplam(kayit,"gider",i));
            const toplamGelir = aylikGelir.reduce((s,v)=>s+v,0);
            const toplamGider = aylikGider.reduce((s,v)=>s+v,0);
            const bakiye = (kayit.baslangicBakiye||0) + toplamGelir - toplamGider;

            let h = '<h3 style="border:none;padding:0;margin:0 0 16px 0;"><i class="fa-solid fa-list"></i> Yıllık Bütçe Raporu - '+yil+'</h3>';

            h += '<div class="yb-graph-grid">'+
                '<div class="yb-graph-box full"><canvas id="ybChartNetDurum"></canvas></div>'+
                '<div class="yb-graph-box"><canvas id="ybChartGelirDagilim"></canvas></div>'+
                '<div class="yb-graph-box"><canvas id="ybChartGiderDagilim"></canvas></div>'+
                '<div class="yb-graph-box full"><canvas id="ybChartAylikKarsilastirma"></canvas></div></div>';

            h += '<div class="yb-ozet-row">'+
                '<div class="yb-ozet-card"><span class="oz-label">Başlangıç Bakiyesi</span><span class="oz-val" style="color:var(--yb-text);">'+(kayit.baslangicBakiye||0).toLocaleString('tr-TR',{minFractionDigits:2})+' ?</span></div>'+
                '<div class="yb-ozet-card"><span class="oz-label">Toplam Gelir</span><span class="oz-val green">'+toplamGelir.toLocaleString('tr-TR',{minFractionDigits:2})+' ?</span></div>'+
                '<div class="yb-ozet-card"><span class="oz-label">Toplam Gider</span><span class="oz-val red">'+toplamGider.toLocaleString('tr-TR',{minFractionDigits:2})+' ?</span></div>'+
                '<div class="yb-ozet-card"><span class="oz-label">Şirket Bakiyesi</span><span class="oz-val '+(bakiye>=0?'gold':'red')+'">'+bakiye.toLocaleString('tr-TR',{minFractionDigits:2})+' ?</span></div></div>';

            h += '<h4 style="color:var(--yb-gelir);margin:0 0 6px 0;"><i class="fa-solid fa-chart-line"></i> Gelir Dağılımı</h4>'+
                '<table class="yb-dagilim-tablo"><thead><tr><th style="padding:6px 4px;text-align:left;">Kategori</th>';
            YB_AY_KISA.forEach(function(a){h+='<th style="padding:6px 2px;font-size:10px;text-align:center;">'+a+'</th>';});
            h += '<th style="padding:6px 4px;text-align:center;">Toplam</th></tr></thead><tbody>';
            kayit.gelirKategorileri.forEach(function(ktg){
                let katTop=0; h+='<tr><td style="padding:4px;font-weight:600;text-align:left;">'+ybTrUpper(ktg)+'</td>';
                for(let i=0;i<12;i++) {
                    const ay = kayit.aylar[i];
                    const val = ay ? (ay.gelirler[ktg]||[]).reduce(function(s,k){return s+(k.tutar||0);},0) : 0;
                    katTop+=val; h+='<td style="padding:4px;text-align:center;">'+val.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</td>';
                }
                h+='<td style="padding:4px;text-align:center;font-weight:700;color:var(--yb-gelir);">'+katTop.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</td></tr>';
            });
            h+='<tr style="background:rgba(255,255,255,0.03);font-weight:700;"><td style="padding:4px;color:var(--yb-text);text-align:left;">TOPLAM GELİR</td>';
            for(let i=0;i<12;i++) h+='<td style="padding:4px;text-align:center;">'+aylikGelir[i].toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</td>';
            h+='<td style="padding:4px;text-align:center;font-weight:800;font-size:12px;color:var(--yb-gelir);">'+toplamGelir.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</td></tr></tbody></table>';

            h += '<h4 style="color:var(--yb-gider);margin:0 0 6px 0;"><i class="fa-solid fa-chart-line fa-rotate-180"></i> Gider Dağılımı</h4>'+
                '<table class="yb-dagilim-tablo"><thead><tr><th style="padding:6px 4px;text-align:left;">Kategori</th>';
            YB_AY_KISA.forEach(function(a){h+='<th style="padding:6px 2px;font-size:10px;text-align:center;">'+a+'</th>';});
            h += '<th style="padding:6px 4px;text-align:center;">Toplam</th></tr></thead><tbody>';
            kayit.giderKategorileri.forEach(function(ktg){
                let katTop=0; h+='<tr><td style="padding:4px;font-weight:600;text-align:left;">'+ybTrUpper(ktg)+'</td>';
                for(let i=0;i<12;i++) {
                    const ay = kayit.aylar[i];
                    const val = ay ? (ay.giderler[ktg]||[]).reduce(function(s,k){return s+(k.tutar||0);},0) : 0;
                    katTop+=val; h+='<td style="padding:4px;text-align:center;">'+val.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</td>';
                }
                h+='<td style="padding:4px;text-align:center;font-weight:700;color:var(--yb-gider);">'+katTop.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</td></tr>';
            });
            h+='<tr style="background:rgba(255,255,255,0.03);font-weight:700;"><td style="padding:4px;color:var(--yb-text);text-align:left;">TOPLAM GİDER</td>';
            for(let i=0;i<12;i++) h+='<td style="padding:4px;text-align:center;">'+aylikGider[i].toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</td>';
            h+='<td style="padding:4px;text-align:center;font-weight:800;font-size:12px;color:var(--yb-gider);">'+toplamGider.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</td></tr></tbody></table>';
            icerik.innerHTML = h;
            setTimeout(function(){ybGrafikleriCiz(kayit, aylikGelir, aylikGider, toplamGelir, toplamGider);}, 50);
        }

        function ybKarsilastirGoster() {
            const icerik = document.getElementById("ybSekmeIcerik");
            const db = ybVeriYukle();
            const cariYil = db.aktifYil;
            const cariKayit = ybYilVerisi();
            const gecmis = db.tamamlananYillar || [];
            const secimEl = document.getElementById("ybKarsilastirSecim");
            const seciliYil = secimEl ? parseInt(secimEl.value) : (gecmis.length > 0 ? gecmis[0].yil : null);

            let h = '<h3 style="border:none;padding:0;margin:0 0 16px 0;"><i class="fa-solid fa-chart-bar"></i> Yıl Karşılaştırması</h3>';

            if(!seciliYil) {
                h += '<p style="color:var(--yb-text-light);">Karşılaştırma yapmak için tamamlanmış bir yıl bulunmuyor.</p>';
                icerik.innerHTML = h; return;
            }

            const seciliKayit = gecmis.find(function(y){return y.yil===seciliYil;});
            if(!seciliKayit) { ybKarsilastirGoster(); return; }
            const cGelir = Array.from({length:12}, (_,i) => ybAylikToplam(cariKayit,"gelir",i));
            const cGider = Array.from({length:12}, (_,i) => ybAylikToplam(cariKayit,"gider",i));
            const sGelir = Array.from({length:12}, (_,i) => ybAylikToplam(seciliKayit,"gelir",i));
            const sGider = Array.from({length:12}, (_,i) => ybAylikToplam(seciliKayit,"gider",i));
            const cTopG = cGelir.reduce(function(s,v){return s+v;},0), cTopGi = cGider.reduce(function(s,v){return s+v;},0);
            const sTopG = sGelir.reduce(function(s,v){return s+v;},0), sTopGi = sGider.reduce(function(s,v){return s+v;},0);

            h += '<div style="display:flex;gap:10px;align-items:center;margin-bottom:20px;flex-wrap:wrap;">'+
                '<label style="font-weight:600;font-size:13px;color:var(--yb-text);">Karşılaştırılacak Yıl:</label>'+
                '<select class="yb-kars-select" id="ybKarsilastirSecim" onchange="ybKarsilastirGoster()">'+
                gecmis.map(function(y){return '<option value="'+y.yil+'" '+(y.yil===seciliYil?'selected':'')+'>'+y.yil+'</option>';}).join('')+
                '</select></div>';

            h += '<div class="yb-kars-grid">'+
                '<div class="yb-kars-card"><span class="kc-label">'+cariYil+' Gelir</span><span class="kc-value green">'+cTopG.toLocaleString('tr-TR',{minFractionDigits:2})+' ?</span></div>'+
                '<div class="yb-kars-card"><span class="kc-label">'+seciliYil+' Gelir</span><span class="kc-value green">'+sTopG.toLocaleString('tr-TR',{minFractionDigits:2})+' ?</span></div>'+
                '<div class="yb-kars-card"><span class="kc-label">Fark ('+cariYil+' - '+seciliYil+')</span><span class="kc-value '+(cTopG-sTopG>=0?'green':'red')+'">'+(cTopG-sTopG).toLocaleString('tr-TR',{minFractionDigits:2})+' ?</span></div>'+
                '</div>';

            h += '<div class="yb-kars-grid">'+
                '<div class="yb-kars-card"><span class="kc-label">'+cariYil+' Gider</span><span class="kc-value red">'+cTopGi.toLocaleString('tr-TR',{minFractionDigits:2})+' ?</span></div>'+
                '<div class="yb-kars-card"><span class="kc-label">'+seciliYil+' Gider</span><span class="kc-value red">'+sTopGi.toLocaleString('tr-TR',{minFractionDigits:2})+' ?</span></div>'+
                '<div class="yb-kars-card"><span class="kc-label">Fark ('+cariYil+' - '+seciliYil+')</span><span class="kc-value '+(cTopGi-sTopGi>=0?'red':'green')+'">'+(cTopGi-sTopGi).toLocaleString('tr-TR',{minFractionDigits:2})+' ?</span></div>'+
                '</div>';

            h += '<div class="yb-kars-graph"><canvas id="ybChartKarsilastirma"></canvas></div>';

            icerik.innerHTML = h;
            setTimeout(function(){ybKarsilastirmaGrafikCiz(cariYil, seciliYil, cGelir, cGider, sGelir, sGider);}, 50);
        }

        function ybKarsilastirmaGrafikCiz(cariYil, seciliYil, cGelir, cGider, sGelir, sGider) {
            try {
                if(window._ybKarsChart) { window._ybKarsChart.destroy(); window._ybKarsChart = null; }
                const ctx = document.getElementById("ybChartKarsilastirma");
                if(!ctx) return;
                window._ybKarsChart = new Chart(ctx, {
                    type:'bar',
                    data: {
                        labels: YB_AY_KISA,
                        datasets: [
                            { label:cariYil+' Gelir', data:cGelir, backgroundColor:'rgba(46,125,50,0.7)', borderRadius:3 },
                            { label:seciliYil+' Gelir', data:sGelir, backgroundColor:'rgba(46,125,50,0.3)', borderRadius:3 },
                            { label:cariYil+' Gider', data:cGider, backgroundColor:'rgba(158,42,43,0.7)', borderRadius:3 },
                            { label:seciliYil+' Gider', data:sGider, backgroundColor:'rgba(158,42,43,0.3)', borderRadius:3 }
                        ]
                    },
                    options: {
                        responsive:true, maintainAspectRatio:false,
                        plugins: { legend:{position:'top',labels:{font:{size:10,weight:'bold'}}}, datalabels:{display:false} },
                        scales: { y:{ beginAtZero:true, ticks:{callback:v=>v.toLocaleString('tr-TR',{minFractionDigits:0})+' ₺'} } }
                    }
                });
            } catch(e) { console.warn("Karşılaştırma grafiği çizilemedi:", e); }
        }

        function ybGrafikleriCiz(kayit, aylikGelir, aylikGider, toplamYillikGelir, toplamYillikGider) {
            if(!kayit) kayit = ybYilVerisi();
            if(!aylikGelir) {
                aylikGelir = Array.from({length:12}, (_,i) => ybAylikToplam(kayit,"gelir",i));
                aylikGider = Array.from({length:12}, (_,i) => ybAylikToplam(kayit,"gider",i));
                toplamYillikGelir = aylikGelir.reduce((s,v)=>s+v,0);
                toplamYillikGider = aylikGider.reduce((s,v)=>s+v,0);
            }
            try {
            if(ybChartAylik) { ybChartAylik.destroy(); ybChartAylik = null; }
            if(ybChartGelir) { ybChartGelir.destroy(); ybChartGelir = null; }
            if(ybChartGider) { ybChartGider.destroy(); ybChartGider = null; }
            if(ybChartNet) { ybChartNet.destroy(); ybChartNet = null; }
            const renkPalet = ['#2E7D32','#0D47A1','#F57C00','#6A1B9A','#00838F','#C62828','#558B2F','#1565C0','#EF6C00','#4A148C','#00695C','#B71C1C','#827717','#283593','#E65100'];

            const ctx1 = document.getElementById("ybChartAylikKarsilastirma");
            if(ctx1) {
                ybChartAylik = new Chart(ctx1, { type:'bar',
                    data: { labels: YB_AY_KISA, datasets: [
                        { label:'Gelir', data:aylikGelir, backgroundColor:'#2E7D32', borderRadius:4 },
                        { label:'Gider', data:aylikGider, backgroundColor:'#9E2A2B', borderRadius:4 }
                    ] },
                    options: { responsive:true, maintainAspectRatio:false,
                        plugins: { legend: { position:'top', labels:{font:{weight:'bold'}} },
                            datalabels: { anchor:'end', align:'end', font:{size:9,weight:'bold'}, color:'#444',
                                formatter:(v,ctx) => { const total = ctx.dataset.label==='Gelir' ? toplamYillikGelir : toplamYillikGider; return total>0 ? (v/total*100).toFixed(1)+'%' : ''; }
                            }
                        },
                        scales: { y: { beginAtZero:true, ticks:{callback:v=>v.toLocaleString('tr-TR',{minFractionDigits:0})+' ₺'} } }
                    }
                });
            }

            const gelirVeri = kayit.gelirKategorileri.map(k => { let t=0; for(let i=0;i<12;i++){const ay=kayit.aylar[i];if(ay)t+=(ay.gelirler[k]||[]).reduce((s,x)=>s+(x.tutar||0),0)} return t; });
            const giderVeri = kayit.giderKategorileri.map(k => { let t=0; for(let i=0;i<12;i++){const ay=kayit.aylar[i];if(ay)t+=(ay.giderler[k]||[]).reduce((s,x)=>s+(x.tutar||0),0)} return t; });
            const gelirEtiket = kayit.gelirKategorileri;
            const giderEtiket = kayit.giderKategorileri;

            const ctx2 = document.getElementById("ybChartGelirDagilim");
            if(ctx2 && gelirVeri.some(v=>v>0)) {
                ybChartGelir = new Chart(ctx2, { type:'doughnut',
                    data: { labels:gelirEtiket, datasets:[{ data:gelirVeri, backgroundColor:renkPalet.slice(0,gelirVeri.length), borderWidth:2 }] },
                    options: { responsive:true, maintainAspectRatio:false,
                        plugins: { legend:{position:'right',labels:{font:{size:11,weight:'bold'}}}, title:{display:true,text:'Gelir Dağılımı',font:{size:14,weight:'bold'}},
                            datalabels:{ color:'#fff', font:{size:11,weight:'bold'}, formatter:(v,ctx)=>{const t=ctx.dataset.data.reduce((a,b)=>a+b,0);return t>0?(v/t*100).toFixed(1)+'%':''} }
                        }
                    }
                });
            } else if(ctx2) {
                ybChartGelir = new Chart(ctx2, { type:'doughnut', data:{labels:['Veri Yok'],datasets:[{data:[1],backgroundColor:['#e0e0e0']}]}, options:{responsive:true,maintainAspectRatio:false,plugins:{title:{display:true,text:'Gelir Dağılımı',font:{size:14,weight:'bold'}},datalabels:{display:false}}} });
            }

            const ctx3 = document.getElementById("ybChartGiderDagilim");
            if(ctx3 && giderVeri.some(v=>v>0)) {
                ybChartGider = new Chart(ctx3, { type:'doughnut',
                    data: { labels:giderEtiket, datasets:[{ data:giderVeri, backgroundColor:renkPalet.slice(0,giderVeri.length), borderWidth:2 }] },
                    options: { responsive:true, maintainAspectRatio:false,
                        plugins: { legend:{position:'right',labels:{font:{size:11,weight:'bold'}}}, title:{display:true,text:'Gider Dağılımı',font:{size:14,weight:'bold'}},
                            datalabels:{ color:'#fff', font:{size:11,weight:'bold'}, formatter:(v,ctx)=>{const t=ctx.dataset.data.reduce((a,b)=>a+b,0);return t>0?(v/t*100).toFixed(1)+'%':''} }
                        }
                    }
                });
            } else if(ctx3) {
                ybChartGider = new Chart(ctx3, { type:'doughnut', data:{labels:['Veri Yok'],datasets:[{data:[1],backgroundColor:['#e0e0e0']}]}, options:{responsive:true,maintainAspectRatio:false,plugins:{title:{display:true,text:'Gider Dağılımı',font:{size:14,weight:'bold'}},datalabels:{display:false}}} });
            }

            const bakiye = kayit.baslangicBakiye || 0;
            let bir = bakiye;
            const bakiyeAylik = aylikGelir.map((g,i) => { bir += g - aylikGider[i]; return bir; });
            const ctx4 = document.getElementById("ybChartNetDurum");
            if(ctx4) {
                ybChartNet = new Chart(ctx4, { type:'line',
                    data: { labels:YB_AY_KISA,
                        datasets: [
                            { label:'Gelir', data:aylikGelir, borderColor:'#2E7D32', backgroundColor:'rgba(46,125,50,0.05)', fill:false, tension:0.3, pointRadius:4, pointHoverRadius:6 },
                            { label:'Gider', data:aylikGider, borderColor:'#9E2A2B', backgroundColor:'rgba(158,42,43,0.05)', fill:false, tension:0.3, pointRadius:4, pointHoverRadius:6 },
                            { label:'Şirket Bakiyesi', data:bakiyeAylik, borderColor:'#F57C00', backgroundColor:'rgba(245,124,0,0.08)', fill:true, tension:0.3, borderWidth:3, pointRadius:5, pointHoverRadius:7 }
                        ]
                    },
                    options: { responsive:true, maintainAspectRatio:false,
                        plugins: { legend:{position:'top',labels:{font:{weight:'bold'}}}, datalabels:{display:false} },
                        scales: { y: { ticks:{callback:v=>v.toLocaleString('tr-TR',{minFractionDigits:0})+' ₺'} } }
                    }
                });
            }
            } catch(e) { console.warn("Grafik çizilemedi:", e); }
        }

        /* Kalem ekleme now uses modal - ybModalKalemAc/Kaydet/Kapat */

        function ybDomSatirOlustur(item, ayIdx) {
            return '<tr data-id="'+item.id+'">'+
                '<td style="width:45%;"><input class="acc-input" type="text" value="'+item.aciklama+'" onchange="ybKalemGuncelle('+item.id+',\'aciklama\',this.value)" placeholder="Açıklama"></td>'+
                '<td style="width:40%;"><div class="acc-tutar-wrap">'+
                    '<input class="acc-tutar-input" type="text" value="'+(item.tutar||0).toLocaleString('tr-TR',{minFractionDigits:2})+'" onfocus="tmTutarFocus(this)" oninput="tmTutarFormatla(this)" onblur="tmTutarBlur(this);ybKalemGuncelle('+item.id+',\'tutar\',this.value)">'+
                    ' <span class="acc-tl-simge">?</span></div></td>'+
                '<td style="width:15%;"><button class="acc-btn-sil" onclick="ybKalemSil('+item.id+','+ayIdx+')" title="Sil"><i class="fa-solid fa-xmark"></i></button></td>'+
            '</tr>';
        }
        function ybDomKategoriTotalGuncelle(accBodyId) {
            var body = document.getElementById(accBodyId);
            if(!body) return;
            var table = body.querySelector('table');
            var total = 0;
            if(table) table.querySelectorAll('tr[data-id]').forEach(function(tr){
                var inp = tr.querySelector('.acc-tutar-input');
                if(inp) total += tmTutarCoz(inp.value||'0');
            });
            var hdr = body.parentElement.querySelector('.yb-acc-header');
            if(hdr) hdr.querySelector('.acc-tutar').textContent = total.toLocaleString('tr-TR',{minFractionDigits:2});
        }
        function ybDomOzetGuncelle(ayIdx) {
            var icerik = document.getElementById("ybSekmeIcerik");
            if(!icerik) return;
            var gelirRows = icerik.querySelectorAll('.acc-gelir ~ .yb-acc-item .acc-tutar');
            var giderRows = icerik.querySelectorAll('.acc-gider ~ .yb-acc-item .acc-tutar');
            var aylikGelir=0, aylikGider=0;
            gelirRows.forEach(function(el){ aylikGelir += tmTutarCoz(el.textContent.replace(/[^0-9.,-]/g,'').trim()); });
            giderRows.forEach(function(el){ aylikGider += tmTutarCoz(el.textContent.replace(/[^0-9.,-]/g,'').trim()); });
            var sumCards = icerik.querySelectorAll('.yb-sum-card .sc-value');
            if(sumCards.length>=3) {
                sumCards[0].textContent = aylikGelir.toLocaleString('tr-TR',{minFractionDigits:2});
                sumCards[1].textContent = aylikGider.toLocaleString('tr-TR',{minFractionDigits:2});
                var fark = aylikGelir - aylikGider;
                sumCards[2].textContent = fark.toLocaleString('tr-TR',{minFractionDigits:2});
            }
        }
        function ybDomAyKartGuncelle(ayIdx) {
            var card = document.querySelector('.yb-month-card[data-ay="'+ayIdx+'"]');
            if(!card) return;
            var kayit = ybYilVerisi();
            var gelir = ybAylikToplam(kayit,"gelir",ayIdx);
            var gider = ybAylikToplam(kayit,"gider",ayIdx);
            card.querySelectorAll('.mc-gelir, .mc-gider, .mc-bos').forEach(function(el){el.remove();});
            if(gelir > 0) card.insertAdjacentHTML('beforeend', '<div class="mc-gelir">+'+gelir.toLocaleString('tr-TR',{minFractionDigits:0})+' ?</div>');
            if(gider > 0) card.insertAdjacentHTML('beforeend', '<div class="mc-gider">-'+gider.toLocaleString('tr-TR',{minFractionDigits:0})+' ?</div>');
            if(gelir===0 && gider===0) card.insertAdjacentHTML('beforeend', '<div class="mc-bos">—</div>');
        }

        function ybKalemSil(id, ayIdx) {
            tmConfirm("Bu kalemi silmek istediğinize emin misiniz?", function() {
                const kayit = ybYilVerisi();
                const ay = ybAyVerisi(ayIdx, kayit);
                let bulunanKtg = null, bulunanTip = null;
                for(const tip of ['gelirler','giderler']) {
                    const d = ay[tip];
                    for(const ktg of Object.keys(d)) {
                        const idx = d[ktg].findIndex(k => k.id===id);
                        if(idx>-1) { d[ktg].splice(idx,1); bulunanKtg=ktg; bulunanTip=tip; break; }
                    }
                    if(bulunanKtg) break;
                }
                if(bulunanKtg) {
                    const db=ybVeriYukle(); db.yillar[db.aktifYil]=kayit; ybVeriKaydet(db);
                    var tr = document.querySelector('#ybSekmeIcerik tr[data-id="'+id+'"]');
                    if(tr) {
                        var tbody = tr.parentElement;
                        tr.remove();
                        if(tbody && tbody.querySelectorAll('tr[data-id]').length===0) {
                            var table = tbody.parentElement;
                            if(table && table.tagName==='TABLE') table.remove();
                        }
                    }
                    var tipPrefix = bulunanTip==='gelirler' ? 'accG' : 'accD';
                    ybDomKategoriTotalGuncelle(tipPrefix+'_'+bulunanKtg.replace(/[^a-z0-9]/gi,'_')+'_'+ayIdx);
                    ybDomOzetGuncelle(ayIdx);
                    ybDomAyKartGuncelle(ayIdx);
                }
            });
        }

        function ybKalemGuncelle(id, alan, deger) {
            const kayit = ybYilVerisi();
            for(let i=0;i<12;i++) {
                const ay = kayit.aylar[i];
                if(!ay) continue;
                for(const d of [ay.gelirler, ay.giderler]) {
                    for(const ktg of Object.keys(d)) {
                        const item = d[ktg].find(k => k.id===id);
                        if(item) {
                            if(alan==="tutar") item.tutar = tmTutarCoz(deger);
                            else item.aciklama = deger;
                            const db = ybVeriYukle(); db.yillar[db.aktifYil] = kayit; ybVeriKaydet(db);
                            var tipPrefix = d===ay.gelirler ? 'accG' : 'accD';
                            ybDomKategoriTotalGuncelle(tipPrefix+'_'+ktg.replace(/[^a-z0-9]/gi,'_')+'_'+i);
                            ybDomOzetGuncelle(i);
                            ybDomAyKartGuncelle(i);
                            return;
                        }
                    }
                }
            }
        }

        function ybKategoriYonet(aktifTip) {
            const modal = document.getElementById("ybKategoriModal");
            const body = document.getElementById("ybKategoriModalBody");
            const kayit = ybYilVerisi();
            const db = ybVeriYukle();

            function render() {
                let h = `<div style="display:flex;gap:10px;margin-bottom:15px;">
                    <button class="btn btn-sm ${aktifTip==='gelir'?'btn-save-green':'btn-clear-gray'}" onclick="ybKategoriYonet('gelir')" style="flex:1;"><i class="fa-solid fa-chart-line"></i> Gelir Kategorileri</button>
                    <button class="btn btn-sm ${aktifTip==='gider'?'btn-save-green':'btn-clear-gray'}" onclick="ybKategoriYonet('gider')" style="flex:1;"><i class="fa-solid fa-chart-line fa-rotate-180"></i> Gider Kategorileri</button>
                </div>`;

                const list = aktifTip === "gelir" ? kayit.gelirKategorileri : kayit.giderKategorileri;
                const etiket = aktifTip === "gelir" ? "gelir" : "gider";

                if(list.length===0) h += `<p style="color:var(--text-light);text-align:center;">Henüz kategori eklenmemiş.</p>`;
                list.forEach((ktg, idx) => {
                    h += `<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;margin-bottom:6px;background:var(--bg-main);border-radius:6px;border:1px solid var(--border-color);">
                        <span style="flex:1;font-weight:600;font-size:13px;">${ktg}</span>
                        <input type="text" id="ybKatYenidenAd_${aktifTip}_${idx}" value="${ktg}" style="display:none;flex:1;padding:6px 10px;border:1px solid var(--accent-red);border-radius:4px;background:var(--input-bg);color:var(--text-dark);font-size:13px;">
                        <button class="btn btn-sm btn-warning" onclick="document.getElementById('ybKatYenidenAd_${aktifTip}_${idx}').style.display='block';this.style.display='none';document.getElementById('ybKatKaydet_${aktifTip}_${idx}').style.display='inline-flex'" style="padding:4px 10px;"><i class="fa-regular fa-pen-to-square"></i></button>
                        <button class="btn btn-sm btn-save-green" id="ybKatKaydet_${aktifTip}_${idx}" style="display:none;padding:4px 10px;" onclick="var inp=document.getElementById('ybKatYenidenAd_${aktifTip}_${idx}');var yeni=trToUpper(inp.value.trim());if(!yeni){tmNotify('Ad boş olamaz!','error');return;}const k=ybYilVerisi();const l=${aktifTip==='gelir'?'k.gelirKategorileri':'k.giderKategorileri'};if(l.includes(yeni)){tmNotify('Bu kategori zaten var!','error');return;}l[l.indexOf('${ktg}')]=yeni;ybVeriKaydet(Object.assign(ybVeriYukle(),{yillar:{[Object.assign(ybVeriYukle()).aktifYil]:k}}));tmNotify('Kategori adı güncellendi.','success');ybKategoriYonet('${aktifTip}');"><i class="fa-solid fa-floppy-disk"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="tmConfirm('${ktg} kategorisini silmek istediğinize emin misiniz?\\nBu kategoriye ait tüm kalemler de silinecek.',function(){const k=ybYilVerisi();const l=${aktifTip==='gelir'?'k.gelirKategorileri':'k.giderKategorileri'};const idx=l.indexOf('${ktg}');if(idx>-1){l.splice(idx,1);Object.values(k.aylar).forEach(function(ay){delete (${aktifTip==='gelir'?'ay.gelirler':'ay.giderler'})['${ktg}'];});}const db2=ybVeriYukle();db2.yillar[db2.aktifYil]=k;ybVeriKaydet(db2);tmNotify('Kategori silindi.','success');ybKategoriYonet('${aktifTip}');});" style="padding:4px 10px;"><i class="fa-solid fa-trash-can"></i></button>
                    </div>`;
                });

                // Add new
                h += `<div style="margin-top:12px;padding:12px;background:var(--bg-main);border-radius:6px;border:1px dashed var(--border-color);">
                    <label style="font-size:10px;font-weight:600;color:var(--text-light);display:block;margin-bottom:4px;">Yeni ${etiket} Kategorisi Ekle</label>
                    <div style="display:flex;gap:8px;">
                        <input type="text" id="ybKatEkleInput_${aktifTip}" placeholder="Kategori adı" style="flex:1;padding:8px 12px;border:1px solid var(--border-color);border-radius:4px;background:var(--input-bg);color:var(--text-dark);font-size:13px;" onkeydown="if(event.key==='Enter')ybKatEkle('${aktifTip}')">
                        <button class="btn btn-primary" onclick="ybKatEkle('${aktifTip}')" style="padding:8px 16px;border-radius:4px;"><i class="fa-solid fa-plus"></i> Ekle</button>
                    </div>
                </div>`;

                body.innerHTML = h;
            }

            render();
            modal.style.display = "flex";
        }

        function ybKatEkle(tip) {
            const inp = document.getElementById("ybKatEkleInput_"+tip);
            if(!inp) return;
            const ad = trToUpper(inp.value.trim());
            if(!ad) { tmNotify("Kategori adı giriniz!","error"); return; }
            const kayit = ybYilVerisi();
            const list = tip==="gelir"?kayit.gelirKategorileri:kayit.giderKategorileri;
            if(list.includes(ad)) { tmNotify("Bu kategori zaten mevcut!","error"); return; }
            list.push(ad);
            Object.values(kayit.aylar).forEach(ay => { if(tip==="gelir") ay.gelirler[ad]=[]; else ay.giderler[ad]=[]; });
            const db = ybVeriYukle(); db.yillar[db.aktifYil] = kayit; ybVeriKaydet(db);
            tmNotify("Kategori eklendi.","success");
            ybKategoriYonet(tip);
        }

        function ybKategoriModalKapat() {
            document.getElementById("ybKategoriModal").style.display = "none";
            ybSekmeGoster("rapor");
        }

        // ===== BÜTÇE KALEM EKLEME MODAL =====
        var ybModalAyIdx = 0, ybModalTip = "gelir", ybModalKategori = "";
        function ybModalKalemAc(tip, kategori, ayIdx) {
            ybModalAyIdx = ayIdx; ybModalTip = tip; ybModalKategori = kategori;
            document.getElementById("ybModalKalem").style.display = "flex";
            document.getElementById("mkAciklama").value = "";
            document.getElementById("mkTutar").value = "";
            document.getElementById("mkTipSecimi").style.display = "none";
            document.getElementById("mkKatLabel").style.display = "none";
            document.getElementById("mkKatSatir").style.display = "none";
        }
        function ybModalKalemTip(tip) { /* not used when hidden */ }
        function ybModalKalemKapat() { document.getElementById("ybModalKalem").style.display = "none"; document.getElementById("mkTipSecimi").style.display = "flex"; document.getElementById("mkKatLabel").style.display = "block"; document.getElementById("mkKatSatir").style.display = "block"; }
        function ybModalKalemKaydet() {
            var tip = ybModalTip;
            var kategori = ybModalKategori;
            var aciklama = document.getElementById("mkAciklama").value.trim();
            var tutar = tmTutarCoz(document.getElementById("mkTutar").value);
            if(!aciklama) { tmNotify("Açıklama zorunludur!","error"); return; }
            if(isNaN(tutar)||tutar<=0) { tmNotify("Geçerli bir tutar giriniz!","error"); return; }
            var kayit = ybYilVerisi();
            var ay = ybAyVerisi(ybModalAyIdx, kayit);
            var yeniItem = {id:Date.now(),aciklama:aciklama,tutar:tutar};
            (tip==="gelir"?ay.gelirler:ay.giderler)[kategori].push(yeniItem);
            var db = ybVeriYukle(); db.yillar[db.aktifYil]=kayit; ybVeriKaydet(db);
            ybModalKalemKapat();
            tmNotify("Kalem başarıyla eklendi.","success");
            // DOM'a yeni satırı ekle (tam re-render yapma)
            var tipPrefix = tip==='gelir' ? 'accG' : 'accD';
            var accBodyId = tipPrefix+'_'+kategori.replace(/[^a-z0-9]/gi,'_')+'_'+ybModalAyIdx;
            var body = document.getElementById(accBodyId);
            if(body) {
                var table = body.querySelector('table');
                if(!table) {
                    // İlk kalem, tabloyu oluştur
                    table = document.createElement('table');
                    var tbody = document.createElement('tbody');
                    table.appendChild(tbody);
                    body.insertBefore(table, body.querySelector('.acc-btn-ekle'));
                }
                var tbody = table.querySelector('tbody') || table;
                tbody.insertAdjacentHTML('beforeend', ybDomSatirOlustur(yeniItem, ybModalAyIdx));
                ybDomKategoriTotalGuncelle(accBodyId);
                ybDomOzetGuncelle(ybModalAyIdx);
                ybDomAyKartGuncelle(ybModalAyIdx);
            } else {
                ybSekmeGoster(String(ybModalAyIdx));
            }
        }

        // ===== PDF Yardımcı =====
        function trAscii(s) { var m={'İ':'I','ı':'i','Ğ':'G','ğ':'g','Ş':'S','ş':'s'}; return (s||'').replace(/[İıĞğŞş]/g,function(c){return m[c]||c;}); }

        function ybPdfIndir(yil) {
            const db = ybVeriYukle();
            const kayit = db.tamamlananYillar.find(function(y){return y.yil===yil;});
            if(!kayit) { tmNotify("Veri bulunamadı!","error"); return; }
            const tG = ybYilToplam(kayit,"gelir"), tGi = ybYilToplam(kayit,"gider");
            const net = (kayit.baslangicBakiye||0)+tG-tGi;

            const logoData = localStorage.getItem("tm_multi_logo_1");
            const SEKME_RENGI = [27,42,74];
            const POZITIF = [39,120,60];
            const NEGATIF = [192,57,43];
            const GRI_METIN = [90,100,115];
            const ACIK_GR = [244,245,247];

            try {
                const { jsPDF } = window.jspdf;
                var doc = new jsPDF({ format:'a4', orientation:'portrait', unit:'mm' });
                // tüm jsPDF metodlarina NaN korumasi (direkt doc uzerinde, autoTable icin)
                ['text','rect','roundedRect','addImage','line','setFontSize','setLineWidth','setDrawColor','setFillColor','setTextColor','setFont'].forEach(function(m){
                    var orig=doc[m]; doc[m]=function(){for(var i=0;i<arguments.length;i++){if(typeof arguments[i]==='number'&&isNaN(arguments[i])){console.error('NaN in '+m+' arg'+i,arguments,new Error().stack);if(m==='setFontSize')return orig.call(doc,10);return;}}return orig.apply(doc,arguments);};
                });
                // Proxy ile ayrica NaN korumasi (en dis katman)
                var _doc = doc; doc = new Proxy(_doc, {
                    get: function(t, p) {
                        var v = t[p];
                        if(typeof v !== 'function' || p==='f2' || p==='getTextWidth' || p==='getStringUnitWidth') return v;
                        return function() {
                            for(var i=0;i<arguments.length;i++) {
                                if(typeof arguments[i]==='number'&&isNaN(arguments[i])) {
                                    console.error('NaN(P) in '+p,JSON.stringify(Array.from(arguments)).slice(0,500));
                                    if(p==='setFontSize') return t.setFontSize(10);
                                    return;
                                }
                            }
                            return v.apply(t, arguments);
                        };
                    }
                });
                const M = 14, W = 182, O = 105;

                var aylikGelir = [], aylikGider = [];
                for(var i=0;i<12;i++) {
                    var ay = kayit.aylar[i], g=0, gd=0;
                    if(ay) {
                        Object.entries(ay.gelirler||{}).forEach(function(e){e[1].forEach(function(x){g+=Number(x.tutar)||0;});});
                        Object.entries(ay.giderler||{}).forEach(function(e){e[1].forEach(function(x){gd+=Number(x.tutar)||0;});});
                    }
                    aylikGelir.push(g); aylikGider.push(gd);
                }

                var bakiyeAylik = [], bir = kayit.baslangicBakiye || 0;
                for(var bi=0;bi<12;bi++) { bir += aylikGelir[bi] - aylikGider[bi]; bakiyeAylik.push(bir); }

                var gelirVeri = kayit.gelirKategorileri.map(function(k) { var t=0; for(var i=0;i<12;i++){var a=kayit.aylar[i];if(a)t+=(a.gelirler[k]||[]).reduce(function(s,x){return s+(x.tutar||0);},0)} return t; });
                var giderVeri = kayit.giderKategorileri.map(function(k) { var t=0; for(var i=0;i<12;i++){var a=kayit.aylar[i];if(a)t+=(a.giderler[k]||[]).reduce(function(s,x){return s+(x.tutar||0);},0)} return t; });
                var gelirEtiket = kayit.gelirKategorileri;
                var giderEtiket = kayit.giderKategorileri;
                var renkPalet = ['#2E7D32','#0D47A1','#F57C00','#6A1B9A','#00838F','#C62828','#558B2F','#1565C0','#EF6C00','#4A148C','#00695C','#B71C1C','#827717','#283593','#E65100'];

                async function grafikBase64Uret() {
                    var container = document.createElement('div');
                    container.style.cssText = 'position:fixed;left:-9999px;top:0;width:1200px;height:2500px;background:#fff;z-index:99999';
                    document.body.appendChild(container);

                    function cC(w,h) { var c=document.createElement('canvas'); c.width=w; c.height=h; container.appendChild(c); return c; }

                    // 1) Net Durum - yüksek çözünürlük
                    var c1 = cC(2400,500);
                    new Chart(c1, { type:'line',
                        data:{ labels:YB_AY_KISA, datasets:[
                            { label:'Gelir', data:aylikGelir, borderColor:'#2E7D32', fill:false, tension:0.3, pointRadius:6, pointHoverRadius:8 },
                            { label:'Gider', data:aylikGider, borderColor:'#9E2A2B', fill:false, tension:0.3, pointRadius:6, pointHoverRadius:8 },
                            { label:'Sirket Bakiyesi', data:bakiyeAylik, borderColor:'#F57C00', fill:true, tension:0.3, borderWidth:4, pointRadius:6, pointHoverRadius:8 }
                        ]},
                        options:{ responsive:false, maintainAspectRatio:false,
                            plugins:{ legend:{position:'top',labels:{font:{size:24}}}, title:{display:true,text:yil+' Yili Net Durum Trendi',font:{size:28,weight:'bold'}} },
                            scales:{ y:{ beginAtZero:true, ticks:{callback:function(v){return v.toLocaleString('tr-TR',{minFractionDigits:0})+' ₺';},font:{size:18}} }, x:{ticks:{font:{size:18}}} }
                        }
                    });

                    // 2) Bar chart - yüksek çözünürlük
                    var c2 = cC(2400,480);
                    new Chart(c2, { type:'bar',
                        data:{ labels:YB_AY_KISA, datasets:[
                            { label:'Gelir', data:aylikGelir, backgroundColor:'#2E7D32', borderRadius:4 },
                            { label:'Gider', data:aylikGider, backgroundColor:'#9E2A2B', borderRadius:4 }
                        ]},
                        options:{ responsive:false, maintainAspectRatio:false,
                            plugins:{ legend:{position:'top',labels:{font:{size:24}}}, title:{display:true,text:'Aylik Gelir / Gider Karsilastirmasi',font:{size:28,weight:'bold'}} },
                            scales:{ y:{ beginAtZero:true, ticks:{callback:function(v){return v.toLocaleString('tr-TR',{minFractionDigits:0})+' ₺';},font:{size:18}} }, x:{ticks:{font:{size:18}}} }
                        },
                        plugins: [{
                            id:'barEtiket',
                            afterDraw:function(chart){
                                var ctx=chart.ctx, gD=chart.data.datasets, meta0=chart.getDatasetMeta(0), meta1=chart.getDatasetMeta(1);
                                ctx.save(); ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='#fff';
                                for(var i=0;i<gD[0].data.length;i++){
                                    var gVal=gD[0].data[i], gdVal=gD[1].data[i];
                                    if(gVal+gdVal<=0)continue;
                                    [{v:gVal,p:meta0.data[i]},{v:gdVal,p:meta1.data[i]}].forEach(function(d){
                                        if(d.v<=0)return;
                                        var pp=d.p.getProps(['x','y','base','width'],true), bw=pp.width, bh=pp.base-pp.y;
                                        var amt=d.v.toLocaleString('tr-TR',{minFractionDigits:0})+' ₺';
                                        var fs=Math.min(Math.floor(bw*0.55),24);
                                        fs=Math.max(14,fs);
                                        ctx.font='bold '+fs+'px Helvetica';
                                        var tw=ctx.measureText(amt).width;
                                        while(tw>bh-4&&fs>10){fs--;ctx.font='bold '+fs+'px Helvetica';tw=ctx.measureText(amt).width;}
                                        ctx.save(); ctx.translate(pp.x,pp.y); ctx.rotate(-Math.PI/2);
                                        ctx.fillText(amt,-Math.floor(tw/2)-2,0);
                                        ctx.restore();
                                    });
                                }
                                ctx.restore();
                            }
                        }]
                    });

                    // Doughnut yardimci - sade grafik, etiket yok
                    function doughnutOlustur(c, etiket, veri, baslik) {
                        if(veri.some(function(v){return v>0;})) {
                            new Chart(c, { type:'doughnut',
                                data:{ labels:etiket, datasets:[{ data:veri, backgroundColor:renkPalet.slice(0,veri.length), borderWidth:3 }] },
                                options:{ responsive:false, maintainAspectRatio:true,
                                    plugins:{ legend:{position:'right',labels:{font:{size:22}}}, title:{display:true,text:baslik,font:{size:30,weight:'bold'}} }
                                }
                            });
                        } else {
                            new Chart(c, { type:'doughnut', data:{labels:['Veri Yok'],datasets:[{data:[1],backgroundColor:['#e0e0e0']}]},
                                options:{ responsive:false, maintainAspectRatio:true,
                                    plugins:{ legend:{display:false}, title:{display:true,text:baslik,font:{size:22,weight:'bold'}} }
                                }
                            });
                        }
                    }

                    // 3-4) Doughnut
                    var c3 = cC(700,700); doughnutOlustur(c3, gelirEtiket, gelirVeri, '');
                    var c4 = cC(700,700); doughnutOlustur(c4, giderEtiket, giderVeri, '');

                    await new Promise(function(r){setTimeout(r,800);});

                    var resimler = {
                        netDurum: c1.toDataURL('image/png'),
                        aylikBar: c2.toDataURL('image/png'),
                        gelirDoughnut: c3.toDataURL('image/png'),
                        giderDoughnut: c4.toDataURL('image/png')
                    };

                    [c1,c2,c3,c4].forEach(function(cv){ try { Chart.getChart(cv)&&Chart.getChart(cv).destroy(); } catch(e){} });
                    try{container.remove()}catch(e){}
                    return resimler;
                }

                function buf2str(buf) {
                    var s = '', b = new Uint8Array(buf);
                    for(var fi=0;fi<b.length;fi++) s += String.fromCharCode(b[fi]);
                    return s;
                }

                var FN = 'Helvetica';

                function t(s) { return trAscii ? trAscii(s||'') : (s||''); }

                async function pdfOlustur() {
                    var SB = 'baslangic';
                    try {
                    var grafikler, logoResim = null;

                    SB='grafik'; grafikler = await grafikBase64Uret();

                    SB='logo';
                    if(logoData && logoData.length > 100) {
                        try {
                            logoResim = await new Promise(function(res) {
                                var img = new Image();
                                img.onload = function(){res(img);};
                                img.onerror=function(){res(null);};
                                img.src=logoData;
                            });
                        } catch(e){}
                    }

                    SB='tarih';
                    var bugun = new Date();
                    var tarihStr = bugun.toLocaleDateString('tr-TR',{day:'2-digit',month:'long',year:'numeric'});
                    var sayfaSayisi = 1;

                    SB='sayfa1';
                    // ======== SAYFA 1 (OZET) ========
                    var y = 12;

                    SB='ustbar';
                    // --- Ust Bar (ince renk cizgisi + logo + baslik) ---
                    doc.setFillColor(SEKME_RENGI[0], SEKME_RENGI[1], SEKME_RENGI[2]);
                    doc.rect(0, 0, 210, 3, 'F');
                    if(logoResim) {
                        var lMaxH = 13, lMaxW = 38;
                        var lw = logoResim.naturalWidth * (lMaxH / logoResim.naturalHeight);
                        var lh = lMaxH;
                        if(lw > lMaxW) { lw = lMaxW; lh = lw * logoResim.naturalHeight / logoResim.naturalWidth; }
                        doc.addImage(logoData, 'PNG', M, 6, lw, lh);
                    }
                    doc.setFont(FN, "bold"); doc.setFontSize(15);
                    doc.setTextColor(SEKME_RENGI[0], SEKME_RENGI[1], SEKME_RENGI[2]);
                    doc.text(t(yil+" YILI BUTCE RAPORU"), O, 13, {align:"center"});
                    doc.setFont(FN, "normal"); doc.setFontSize(6);
                    doc.setTextColor(GRI_METIN[0], GRI_METIN[1], GRI_METIN[2]);
                    doc.text(t("Rapor: ")+tarihStr, M+W, 13, {align:"right"});
                    y = 24;

                    // --- OZET KARTLARI (dashboard karti, sol renk cubugu) ---
                    var kartV = [
                        {l:t("BASLANGIC BAKIYESI"), v:kayit.baslangicBakiye||0, c:[80,90,105]},
                        {l:t("TOPLAM GELIR"), v:tG, c:[39,120,60]},
                        {l:t("TOPLAM GIDER"), v:tGi, c:[192,57,43]},
                        {l:t("NET BAKIYE"), v:net, c:net>=0?[39,120,60]:[192,57,43]}
                    ];
                    var kG = (W-12)/4, kY = 24;
                    for(var k=0;k<4;k++) {
                        var v = kartV[k], kx = M + k*(kG+4);
                        doc.setDrawColor(215, 218, 225);
                        doc.setFillColor(255, 255, 255);
                        doc.roundedRect(kx, y, kG, kY, 3, 3, 'FD');
                        doc.setFillColor(v.c[0], v.c[1], v.c[2]);
                        doc.rect(kx, y+3, 2.5, kY-6, 'F');
                        doc.setFont(FN, "bold"); doc.setFontSize(5.5);
                        doc.setTextColor(GRI_METIN[0], GRI_METIN[1], GRI_METIN[2]);
                        doc.text(v.l, kx+5, y+8);
                        doc.setFontSize(10);
                        doc.setTextColor(SEKME_RENGI[0], SEKME_RENGI[1], SEKME_RENGI[2]);
                        doc.text((v.v||0).toLocaleString('tr-TR',{minFractionDigits:2})+' ₺', kx+5, y+19);
                    }
                    y += kY + 10;

                    SB='grafik1';
                    // --- GRAFIK 1: Net Durum Trendi ---
                    doc.setDrawColor(220, 222, 227);
                    doc.setLineWidth(0.3);
                    doc.roundedRect(M-2, y-2, W+4, 60, 2, 2, 'S');
                    doc.addImage(grafikler.netDurum, 'PNG', M, y, W, 56);
                    y += 64;

                    SB='grafik2';
                    // --- GRAFIK 2: Gelir/Gider Bar ---
                    doc.setDrawColor(220, 222, 227);
                    doc.setLineWidth(0.3);
                    doc.roundedRect(M-2, y-2, W+4, 58, 2, 2, 'S');
                    doc.addImage(grafikler.aylikBar, 'PNG', M, y, W, 54);
                    y += 62;

                    SB='grafik34';
                    // --- GRAFIK 3-4: Doughnut + altinda veri listesi ---
                    var dw = (W - 14) / 2, dgy = y;
                    doc.addImage(grafikler.gelirDoughnut, 'PNG', M, dgy, dw, dw);
                    doc.addImage(grafikler.giderDoughnut, 'PNG', M+dw+12, dgy, dw, dw);
                    function hr(h){return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}
                    function vc(x,yl,et,vd){
                        var tp=vd.reduce(function(a,b){return a+b;},0); if(tp<=0)return yl;
                        doc.setFont(FN,"normal");doc.setFontSize(5);
                        for(var i=0;i<et.length;i++){
                            if(vd[i]<=0||yl>285)continue;
                            var c=hr(renkPalet[i%renkPalet.length]);
                            doc.setFillColor(c[0],c[1],c[2]);doc.rect(x,yl,2,2,'F');
                            doc.setTextColor(50,50,50);doc.text(t(et[i]).slice(0,16),x+3,yl+1.5);
                            doc.setTextColor(GRI_METIN[0],GRI_METIN[1],GRI_METIN[2]);
                            doc.text((vd[i]/tp*100).toFixed(1)+'%',x+38,yl+1.5);
                            doc.setTextColor(SEKME_RENGI[0],SEKME_RENGI[1],SEKME_RENGI[2]);
                            doc.text(vd[i].toLocaleString('tr-TR',{minFractionDigits:0})+' ₺',x+56,yl+1.5);
                            yl+=3;
                        } return yl;
                    }
                    var y1=vc(M, dgy+dw+3, gelirEtiket, gelirVeri);
                    var y2=vc(M+dw+12, dgy+dw+3, giderEtiket, giderVeri);
                    y = Math.max(y1, y2) + 4;

                    SB='altbilgi1';
                    // --- Alt Bilgi ---
                    y = Math.max(y, 280);
                    doc.setDrawColor(SEKME_RENGI[0], SEKME_RENGI[1], SEKME_RENGI[2]);
                    doc.line(M, y, M+W, y);
                    doc.setFont(FN, "normal"); doc.setFontSize(6);
                    doc.setTextColor(GRI_METIN[0], GRI_METIN[1], GRI_METIN[2]);
                    doc.text(t(yil+" Yili Butce Raporu | ")+tarihStr, M, y+4);
                    doc.text(t("Sayfa ")+sayfaSayisi, M+W, y+4, {align:"right"});

                    SB='ayliklar';
                    // ======== AYLIK DOKUM SAYFALARI ========
                    for(var ai=0;ai<12;ai++) {
                        var ayd = kayit.aylar[ai];
                        if(!ayd) continue;
                        var aG = aylikGelir[ai], aGi = aylikGider[ai];
                        if(aG===0 && aGi===0) continue;
                        sayfaSayisi++;
                        doc.addPage();

                        // --- Ust Bar (ince cizgili, Sayfa 2+) ---
                        doc.setFillColor(SEKME_RENGI[0], SEKME_RENGI[1], SEKME_RENGI[2]);
                        doc.rect(0, 0, 210, 2, 'F');
                        if(logoResim) {
                            var sMaxH = 10, sMaxW = 22;
                            var slw = logoResim.naturalWidth * (sMaxH / logoResim.naturalHeight);
                            var slh = sMaxH;
                            if(slw > sMaxW) { slw = sMaxW; slh = slw * logoResim.naturalHeight / logoResim.naturalWidth; }
                            doc.addImage(logoData, 'PNG', M, 5, slw, slh);
                        }
                        doc.setFont(FN, "bold"); doc.setFontSize(7);
                        doc.setTextColor(SEKME_RENGI[0], SEKME_RENGI[1], SEKME_RENGI[2]);
                        doc.text(t(yil+" YILI BUTCE RAPORU"), M+W, 10, {align:"right"});
                        y = 20;

                        // --- Ay Basligi (kalın sol cubuk) ---
                        doc.setFillColor(SEKME_RENGI[0], SEKME_RENGI[1], SEKME_RENGI[2]);
                        doc.rect(M, y, 3, 14, 'F');
                        doc.setFont(FN, "bold"); doc.setFontSize(14);
                        doc.setTextColor(SEKME_RENGI[0], SEKME_RENGI[1], SEKME_RENGI[2]);
                        doc.text(t(YB_AY_ADI[ai].toUpperCase()+" "+yil), M+8, y+10);
                        y += 20;

                        // --- Ozet Kartciklari (Gelir/Gider/Net) ---
                        var fark = aG - aGi;
                        var oKartG = (W-8)/3, oKartY = 16;
                        var oItems = [
                            {l:t("GELIR"), v:aG, c:POZITIF},
                            {l:t("GIDER"), v:aGi, c:NEGATIF},
                            {l:t("NET"), v:fark, c:fark>=0?POZITIF:NEGATIF}
                        ];
                        for(var oi=0;oi<3;oi++) {
                            var oiX = M + oi*(oKartG+4);
                            doc.setDrawColor(215, 218, 225);
                            doc.setFillColor(255, 255, 255);
                            doc.roundedRect(oiX, y, oKartG, oKartY, 3, 3, 'FD');
                            doc.setFillColor(oItems[oi].c[0], oItems[oi].c[1], oItems[oi].c[2]);
                            doc.rect(oiX, y+2, 2, oKartY-4, 'F');
                            doc.setFont(FN, "bold"); doc.setFontSize(7);
                            doc.setTextColor(GRI_METIN[0], GRI_METIN[1], GRI_METIN[2]);
                            doc.text(oItems[oi].l, oiX+5, y+6);
                            doc.setFontSize(9);
                            doc.setTextColor(SEKME_RENGI[0], SEKME_RENGI[1], SEKME_RENGI[2]);
                            doc.text(oItems[oi].v.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺', oiX+5, y+14);
                        }
                        y += oKartY + 8;

                        function _ct(baslik, rows, etiketRenk, hucreRenk) {
                            if(!rows||rows.length===0) return;
                            if(isNaN(y)||y>277){doc.addPage();y=18;}
                            doc.setFont(FN,"bold");doc.setFontSize(9);
                            doc.setTextColor(etiketRenk[0],etiketRenk[1],etiketRenk[2]);
                            doc.text(t(baslik),M,y);y+=6;
                            var tw=[35,Math.max(W-63,10),28], rh=6;
                            doc.setFont(FN,"bold");doc.setFontSize(6.5);
                            doc.setFillColor(SEKME_RENGI[0],SEKME_RENGI[1],SEKME_RENGI[2]);
                            for(var ci=0;ci<3;ci++){var cx=M+(ci===0?0:tw[0]+(ci===1?0:tw[1]));doc.rect(cx,y,tw[ci],rh,'F');doc.setTextColor(255,255,255);doc.text(t(['KATEGORI','ACIKLAMA','TUTAR'][ci]),cx+tw[ci]/2,y+4.5,{align:'center'});}
                            y+=rh;
                            doc.setFont(FN,"normal");doc.setFontSize(6.5);
                            for(var ri=0;ri<rows.length;ri++){
                                if(y>277){doc.addPage();y=18;}
                                for(var ci=0;ci<3;ci++){
                                    var cx=M+(ci===0?0:tw[0]+(ci===1?0:tw[1]));
                                    doc.setFillColor(hucreRenk[0],hucreRenk[1],hucreRenk[2]);doc.rect(cx,y,tw[ci],rh,'F');
                                    doc.setDrawColor(220,222,227);doc.rect(cx,y,tw[ci],rh,'S');
                                    doc.setTextColor(50,50,50);
                                    if(ci===2) doc.text(rows[ri][ci],cx+tw[ci]-2,y+4.5,{align:'right'});
                                    else doc.text(rows[ri][ci],cx+2,y+4.5);
                                }
                                y+=rh;
                            }
                            doc.setDrawColor(210,212,217);doc.line(M,y,M+W,y);y+=4;
                        }

                        // --- GELIR TABLOSU ---
                        var gRows = [];
                        Object.entries(ayd.gelirler||{}).forEach(function(e) {
                            e[1].forEach(function(x) { gRows.push([t(e[0].toUpperCase()), t(x.aciklama||''), (Number(x.tutar)||0).toLocaleString('tr-TR',{minFractionDigits:2})+' ₺']); });
                        });
                        _ct("GELIRLER", gRows, POZITIF, [245,252,245]);

                        // --- GIDER TABLOSU ---
                        var gdRows = [];
                        Object.entries(ayd.giderler||{}).forEach(function(e) {
                            e[1].forEach(function(x) { gdRows.push([t(e[0].toUpperCase()), t(x.aciklama||''), (Number(x.tutar)||0).toLocaleString('tr-TR',{minFractionDigits:2})+' ₺']); });
                        });
                        _ct("GIDERLER", gdRows, NEGATIF, [252,245,245]);

                        // --- Ay Net Bilgisi (sol renk cubugu) ---
                        if(y > 277) { doc.addPage(); sayfaSayisi++; y = 18; }
                        var farkRenk = fark>=0 ? POZITIF : NEGATIF;
                        doc.setFillColor(farkRenk[0], farkRenk[1], farkRenk[2]);
                        doc.rect(M, y, 3, 10, 'F');
                        doc.setFont(FN, "bold"); doc.setFontSize(10);
                        doc.setTextColor(farkRenk[0], farkRenk[1], farkRenk[2]);
                        doc.text(t("AYLIK NET: ")+fark.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺', M+8, y+7);
                        y += 16;

                        // --- Alt Bilgi ---
                        doc.setDrawColor(SEKME_RENGI[0], SEKME_RENGI[1], SEKME_RENGI[2]);
                        doc.line(M, y, M+W, y);
                        doc.setFont(FN, "normal"); doc.setFontSize(5.5);
                        doc.setTextColor(GRI_METIN[0], GRI_METIN[1], GRI_METIN[2]);
                        doc.text(t(yil+" Yili Butce Raporu | ")+tarihStr, M, y+4);
                        doc.text(t("Sayfa ")+sayfaSayisi, M+W, y+4, {align:"right"});
                    }

                    doc.save('Butce_Raporu_'+yil+'.pdf');
                    tmNotify(t("Butce PDF olusturuldu."),"success");
                    } catch(e) { e.message = SB+": "+e.message; throw e; }
                }

                async function giris() {
                    try { await pdfOlustur(); } catch(e) { console.error("PDF hatasi:", e, e&&e.stack); try { var ta=document.createElement('textarea');ta.style.cssText='position:fixed;top:10px;left:10px;width:90%;height:80%;z-index:99999;font-size:12px';ta.value="PDF hatasi: "+e.message+"\n\nStack:\n"+(e&&e.stack||'yok');document.body.appendChild(ta);setTimeout(function(){ta.select();},100); } catch(ex){} tmNotify("PDF hatasi: "+e.message+" | Konsola bak (F12)","error"); }
                }
                giris();

            } catch(e) {
                console.error("Butce PDF hatasi:", e);
                tmNotify("Butce PDF hatasi: "+e.message,"error");
            }
        }

        /* ================= HESAP TAKİP SİSTEMİ ================= */
        const HT_ORNEK_HESAPLAR = [
            { id:1, bankaAdi:"İŞ BANKASI", hesapSahibi:"OKAN TUGAY TURAK", bakiye:0, iban:"TR77 0006 4000 0011 4210 4058 43", kartSifre:"8998", internetSifre:"258046" },
            { id:2, bankaAdi:"ZİRAAT BANKASI", hesapSahibi:"OKAN TUGAY TURAK", bakiye:0, iban:"TR04 0010 0049 1575 0075 3501", kartSifre:"8998", internetSifre:"258046" },
            { id:3, bankaAdi:"İŞ BANKASI", hesapSahibi:"AHSEN TURAK", bakiye:0, iban:"TR81 0006 4000 0011 4210 4057 71", kartSifre:"XXXX", internetSifre:"XXXX" }
        ];
        const HT_ORNEK_ISLEMLER = (function(){
            var _islemler = [];
            var _sonId = 0;
            function _r(min,max) { return Math.round((Math.random()*(max-min)+min)*100)/100; }
            function _ri(min,max) { return Math.floor(Math.random()*(max-min+1))+min; }
            var _bugun = new Date();
            var _bas = new Date(_bugun.getFullYear(), _bugun.getMonth()-3, 1);
            var _gunler = [];
            for(var _d=new Date(_bas); _d<=_bugun; _d.setDate(_d.getDate()+1)) _gunler.push(new Date(_d));
            function _gs() { return _gunler[_ri(0,_gunler.length-1)]; }
            function _ts(g) { return g.getFullYear()+'-'+String(g.getMonth()+1).padStart(2,'0')+'-'+String(g.getDate()).padStart(2,'0'); }
            var _gelAc = ["MÜŞTERİ ÖDEMESİ","PROJE BEDELİ","DANIŞMANLIK ÜCRETİ","AVANS ÖDEMESİ","HİZMET BEDELİ","KEŞİF BEDELİ","PROJE TESLİM ÖDEMESİ","RÖLÖVE BEDELİ","HAKEDİŞ ÖDEMESİ","KAT KARŞILIĞI ÖDEME","İNŞAAT DANIŞMANLIK","PROJE AVANS","MÜHENDİSLİK HİZMETİ","ÇİZİM BEDELİ","FİZİBİLİTE RAPORU","ZEMİN ETÜDÜ","YAPI DENETİM","RUHSAT BAŞVURU BEDELİ"];
            var _gitAc = ["KIRA ÖDEMESİ","ELEKTRİK FATURASI","SU FATURASI","DOĞALGAZ FATURASI","İNTERNET ÜCRETİ","TELEFON FATURASI","KIRTASİYE MALZEMESİ","YAKIT GİDERİ","ULAŞIM GİDERİ","PERSONEL MAAŞI","SGK PRİMİ","VERGİ ÖDEMESİ","YEMEK GİDERİ","TEMİZLİK MALZEMESİ","BAKIM ONARIM","YAZILIM LİSANSI","SİGORTA PRİMİ","KOPYALAMA BASKI","TOPLANTI MASRAFI","OTO PARK ÜCRETİ"];
            var _trfAc = ["HESAPLAR ARASI AKTARIM","VADELİ HESABA AKTARIM","NAKİT AKTARIMI","BANKA HAVALESİ","FON AKTARIMI"];
            [1,2,3].forEach(function(hid){
                for(var i=0;i<22;i++){var g=_gs(),t=_r(1500,25000);_sonId++;_islemler.push({id:_sonId,hesapId:hid,aciklama:_gelAc[_ri(0,_gelAc.length-1)],tarih:_ts(g),tutar:t,islem:"GELEN"});}
                for(var j=0;j<20;j++){var g2=_gs(),t2=_r(200,8000);_sonId++;var k={id:_sonId,hesapId:hid,aciklama:_gitAc[_ri(0,_gitAc.length-1)],tarih:_ts(g2),tutar:t2,islem:"GİDEN"};if(Math.random()<0.3)k.hedefId=-1;_islemler.push(k);}
                var _dh=[1,2,3].filter(function(h){return h!==hid;});
                for(var k2=0;k2<8;k2++){var g3=_gs(),t3=_r(500,10000);_sonId++;_islemler.push({id:_sonId,hesapId:hid,hedefId:_dh[_ri(0,_dh.length-1)],aciklama:_trfAc[_ri(0,_trfAc.length-1)],tarih:_ts(g3),tutar:t3,islem:"TRANSFER"});}
            });
            return _islemler;
        })();
        var HT_AKTIF_DETAY_HESAP = null;

function htTl(v) { return (v||0).toLocaleString('tr-TR', {minimumFractionDigits:2, maximumFractionDigits:2}) + " ₺"; }
function tmTl(v) { return (v||0).toLocaleString('tr-TR', {minimumFractionDigits:2, maximumFractionDigits:2}) + " ₺"; }
        function htIbanGoster(iban) {
            if(!iban) return "-";
            var s = iban.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
            if(s.length <= 4) return s;
            var p = [];
            if(s.substring(0,2) === "TR") {
                p.push(s.substring(0,4));
                for(var i=4; i<s.length; i+=4) p.push(s.substring(i, i+4));
            } else {
                for(var i=0; i<s.length; i+=4) p.push(s.substring(i, i+4));
            }
            return p.join(" ");
        }
        function htIbanInputFormatla(el) {
            if(!el) return;
            var s = el.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
            if(s.length > 26) s = s.substring(0, 26);
            var p = [];
            if(s.substring(0,2) === "TR") {
                p.push(s.substring(0,4));
                for(var i=4; i<s.length; i+=4) p.push(s.substring(i, i+4));
            } else {
                for(var i=0; i<s.length; i+=4) p.push(s.substring(i, i+4));
            }
            el.value = p.join(" ");
        }

        function htBankaRenk(ad) {
            var a = ad.toUpperCase().replace(/[İI]/g, "I");
            if(a.indexOf("ZIRAAT") !== -1) return "#C62828";
            if(a.indexOf("IS") !== -1 && a.indexOf("BANK") !== -1) return "#003399";
            if(a.indexOf("AKBANK") !== -1) return "#E53935";
            if(a.indexOf("VAKIF") !== -1) return "#FDD835";
            if(a.indexOf("QNB") !== -1 || a.indexOf("FINANS") !== -1) return "#7B1FA2";
            if(a.indexOf("DENIZ") !== -1) return "#0D47A1";
            if(a.indexOf("ING") !== -1) return "#FF6F00";
            if(a.indexOf("GARANTI") !== -1) return "#00695C";
            if(a.indexOf("YAPI") !== -1 || a.indexOf("YKB") !== -1) return "#003399";
            if(a.indexOf("HALK") !== -1) return "#003399";
            if(a.indexOf("TEB") !== -1) return "#003B7B";
            if(a.indexOf("HSBC") !== -1) return "#DB0011";
            if(a.indexOf("ALTERNATIF") !== -1) return "#E51836";
            if(a.indexOf("SEKER") !== -1) return "#006B3F";
            if(a.indexOf("ANADOLU") !== -1) return "#004B87";
            if(a.indexOf("FIBA") !== -1) return "#005CA0";
            if(a.indexOf("BURGAN") !== -1) return "#003D7A";
            if(a.indexOf("ODEA") !== -1) return "#00843D";
            if(a.indexOf("TURKISH BANK") !== -1) return "#003366";
            if(a.indexOf("ICBC") !== -1) return "#C41928";
            if(a.indexOf("BANK OF CHINA") !== -1) return "#C8102E";
            return "#1a2a3a";
        }
        function htVeriYukle() {
            try { if(localStorage.getItem("tm_ht_clean") !== "v1.20.0") {
                localStorage.removeItem("tm_hesap_takip_db");
                origSetItem("tm_ht_clean", "v1.20.0");
            } } catch(e) { console.error("Hesap takip temizlik hatasi:", e); }
            var db;
            try { db = JSON.parse(localStorage.getItem("tm_hesap_takip_db")); } catch(e) { db = null; console.error("Hesap takip yukleme hatasi:", e); }
            if(db && db.hesaplar && db.islemler !== undefined) return db;
            db = { hesaplar:JSON.parse(JSON.stringify(HT_ORNEK_HESAPLAR)), nakit:0, islemler:[] };
            origSetItem("tm_hesap_takip_db", JSON.stringify(db));
            return db;
        }

        function htVeriKaydet(db) { try { localStorage.setItem("tm_hesap_takip_db", JSON.stringify(db)); } catch(e) { console.error("Hesap takip kaydetme hatasi:", e); } }

        function htSayfayiYukle() {
            try { var __d=JSON.parse(localStorage.getItem("tm_hesap_takip_db")); if(__d&&(!__d.hesaplar||__d.hesaplar.length===0)) { localStorage.removeItem("tm_hesap_takip_db"); localStorage.removeItem("tm_ht_test_v1.36.7"); } } catch(e){}
            htVeriYukle();
            HT_AKTIF_DETAY_HESAP = null;
            document.getElementById("htHesapDetayAlan").style.display = "none";
            document.getElementById("htAnaSayfa").style.display = "";
            htHesapKartlariGoster();
            htNakitKartGoster();
            htIslemleriGoster();
            htDurumGuncelle();
        }

        function htDurumGuncelle() {
            var db = htVeriYukle();
            var toplamHesap = 0;
            db.hesaplar.forEach(function(h){ toplamHesap += h.bakiye||0; });
            var toplamNakit = db.nakit||0;
            document.getElementById("htSirketBakiye").innerText = htTl(toplamHesap + toplamNakit);
            document.getElementById("htToplamHesapBakiye").innerText = htTl(toplamHesap);
            document.getElementById("htToplamNakitBakiye").innerText = htTl(toplamNakit);
            var bugun = new Date();
            var ayBaslangic = new Date(bugun.getFullYear(), bugun.getMonth(), 1);
            var buAyGelen = 0, buAyGiden = 0;
            db.islemler.forEach(function(i) {
                if(!i.tarih) return;
                var t = new Date(i.tarih);
                if(t < ayBaslangic) return;
                if(i.islem === "GELEN" || (i.islem === "GİDEN" && i.hedefId && (i.hedefId === 1 || i.hedefId === -1))) buAyGelen += i.tutar;
                else if(i.islem === "GİDEN") buAyGiden += i.tutar;
            });
            var buAyNet = buAyGelen - buAyGiden;
            document.getElementById("htBuAyGelen").innerText = htTl(buAyGelen);
            document.getElementById("htBuAyGiden").innerText = htTl(buAyGiden);
            document.getElementById("htBuAyNet").innerHTML = '<span style="color:'+(buAyNet>=0?'#4CAF50':'#f44336')+'">'+(buAyNet<0?'−':'')+htTl(Math.abs(buAyNet))+'</span>';
        }

        function htHesapKartlariGoster() {
            var konteyner = document.getElementById("htHesapKartlar");
            if(!konteyner) return;
            var db = htVeriYukle();
            var h = '';
            if(db.hesaplar && db.hesaplar.length) {
                db.hesaplar.forEach(function(hs) {
                    var bankaRenk = htBankaRenk(hs.bankaAdi);
                    var bakiyeTipi = hs.bakiye < 0 ? "negatif" : "pozitif";
                    var ibanStr = hs.iban ? htIbanGoster(hs.iban) : "";
                    var kartSifre = hs.kartSifre || "—";
                    var netSifre = hs.internetSifre || "—";
                    h += '<div class="ht-kart-3d" style="--ht-kart-renk:'+bankaRenk+'" onclick="htHesapDetayGoster('+hs.id+')">';
                    h += '<div class="kart-yuz">';
                    h += '<div class="kart-top"><div class="kart-banka">'+hs.bankaAdi+'</div></div>';
                    h += '<div class="kart-actions">';
                    h += '<button class="kart-duzenle" onclick="event.stopPropagation();htHesapModalAc('+hs.id+')" title="Düzenle">?</button>';
                    h += '<button class="kart-sil" onclick="event.stopPropagation();htHesapSil('+hs.id+')" title="Sil"><i class="fa-solid fa-xmark"></i></button>';
                    h += '</div>';
                    h += '<div class="kart-bakiye '+bakiyeTipi+'">'+htTl(hs.bakiye)+'</div>';
                    h += '<div class="kart-iban">'+ibanStr+'</div>';
                    h += '<div class="kart-alt"><div class="kart-alt-sol"><div class="kart-sahip">'+hs.hesapSahibi+'</div></div>';
                    h += '<div class="kart-alt-sag"><div class="kart-sifreler"><span>KART: '+kartSifre+'</span><span>NET: '+netSifre+'</span></div></div></div>';
                    h += '</div>';
                    h += '<div class="kart-chip"></div>';
                    h += '</div>';
                });
            }
            /* Nakit kart - her zaman son sırada */
            var nakitBakiyeTipi = db.nakit < 0 ? "negatif" : "pozitif";
            h += '<div class="ht-kart-3d ht-kart-nakit" onclick="htHesapDetayGoster(-1)">';
            h += '<div class="kart-yuz">';
            h += '<div class="kart-top"><div class="kart-banka">NAKİT HESABI</div><div class="kart-actions"></div></div>';
            h += '<div class="kart-bakiye '+nakitBakiyeTipi+'">'+htTl(db.nakit)+'</div>';
            h += '<div class="kart-iban">•••• •••• •••• ••••</div>';
            h += '<div class="kart-alt"><div class="kart-alt-sol"><div class="kart-sahip">Fiziki Nakit Para</div></div>';
            h += '<div class="kart-alt-sag"><div class="kart-sifreler"><span>KART: —</span><span>NET: —</span></div></div></div>';
            h += '</div>';
            h += '<div class="kart-chip"></div>';
            h += '</div>';
            konteyner.innerHTML = h;
        }

        var HT_BANKALAR = [
            "AKBANK", "ALTERNATİF BANK", "ANADOLUBANK", "BANK OF CHINA TURKEY",
            "BURGAN BANK", "DENİZBANK", "FİBABANKA", "GARANTİ BBVA",
            "HALKBANK", "HSBC", "ICBC TURKEY", "ING BANK",
            "İŞ BANKASI", "ODEA BANK", "QNB FİNANSBANK", "ŞEKERBANK",
            "TEB", "TURKISH BANK", "VAKIFBANK", "YAPI KREDİ", "ZİRAAT BANKASI"
        ];

        function htHesapModalAc(id) {
            var modal = document.getElementById("htHesapModal");
            if(!modal) return;
            var db = htVeriYukle();
            var hs = id ? db.hesaplar.find(function(h){return h.id===id;}) : null;
            document.getElementById("htModalId").value = id || "";
            var sec = document.getElementById("htModalBanka");
            var seciliDeger = hs ? hs.bankaAdi : "";
            sec.innerHTML = '<option value="">— Seçiniz —</option>';
            HT_BANKALAR.forEach(function(b) {
                sec.innerHTML += '<option value="'+b+'" '+(b===seciliDeger?'selected':'')+'>'+b+'</option>';
            });
            document.getElementById("htModalSahibi").value = hs ? hs.hesapSahibi : "";
            document.getElementById("htModalIban").value = hs ? htIbanGoster(hs.iban) : "";
            document.getElementById("htModalKart").value = hs ? hs.kartSifre : "";
            document.getElementById("htModalNet").value = hs ? hs.internetSifre : "";
            document.getElementById("htModalBakiye").value = hs ? htTl(hs.bakiye) : "0,00";
            modal.style.display = "flex";
        }

        function htHesapModalKapat() {
            document.getElementById("htHesapModal").style.display = "none";
        }

        function htHesapModalKaydet() {
            var id = document.getElementById("htModalId").value;
            var banka = document.getElementById("htModalBanka").value.trim();
            if(!banka) { tmNotify("Banka adı zorunludur!", "error"); return; }
            var sahip = document.getElementById("htModalSahibi").value.trim() || "-";
            var iban = document.getElementById("htModalIban").value.trim();
            var kart = document.getElementById("htModalKart").value.trim();
            var net = document.getElementById("htModalNet").value.trim();
            var bakiye = tmTutarCoz(document.getElementById("htModalBakiye").value);
            if(bakiye < 0) { tmNotify("Bakiye negatif olamaz! Lütfen geçerli bir bakiye giriniz.", "error"); return; }
            var db = htVeriYukle();
            if(id) {
                id = parseInt(id);
                var idx = db.hesaplar.findIndex(function(h){return h.id===id;});
                if(idx!==-1) db.hesaplar[idx] = { id:id, bankaAdi:banka, hesapSahibi:sahip, iban:iban, kartSifre:kart, internetSifre:net, bakiye:bakiye };
            } else {
                var maxId = db.hesaplar.reduce(function(m,h){return Math.max(m,h.id);},0);
                db.hesaplar.push({ id:maxId+1, bankaAdi:banka, hesapSahibi:sahip, iban:iban, kartSifre:kart, internetSifre:net, bakiye:bakiye });
            }
            htVeriKaydet(db);
            htHesapModalKapat();
            htHesapKartlariGoster();
            htNakitKartGoster();
            htDurumGuncelle();
            tmNotify(id ? "Hesap güncellendi." : "Hesap eklendi.", "success");
            aktiviteEkle((id ? "Hesap güncellendi: " : "Hesap eklendi: ") + banka, "Muhasebe");
        }

        function htHesapSil(id) {
            var db2 = htVeriYukle();
            var h = db2.hesaplar.find(function(x){return x.id===id;});
            if(!h) return;
            var bakiye = h.bakiye || 0;
            if(bakiye !== 0) {
                tmConfirm("Bu hesabın bakiyesi (" + htTl(bakiye) + ") bulunuyor. Silince bakiye Nakit hesabına aktarılsın mı?", function() {
                    var db = htVeriYukle();
                    db.nakit = (db.nakit||0) + bakiye;
                    db.hesaplar = db.hesaplar.filter(function(x){return x.id!==id;});
                    db.islemler = db.islemler.filter(function(i){return i.hesapId!==id;});
                    htVeriKaydet(db);
                    htHesapKartlariGoster();
                    htNakitKartGoster();
                    htIslemleriGoster();
                    htDurumGuncelle();
                    if(HT_AKTIF_DETAY_HESAP === id) htHesapDetayKapat();
                    tmNotify("Hesap silindi. Bakiye Nakite aktarıldı.", "success");
                    aktiviteEkle("Hesap silindi (bakiye nakite): " + h.bankaAdi, "Muhasebe");
                });
            } else {
                tmConfirm("Bu hesabı silmek istediğinize emin misiniz?", function() {
                    var db = htVeriYukle();
                    db.hesaplar = db.hesaplar.filter(function(x){return x.id!==id;});
                    db.islemler = db.islemler.filter(function(i){return i.hesapId!==id;});
                    htVeriKaydet(db);
                    htHesapKartlariGoster();
                    htNakitKartGoster();
                    htIslemleriGoster();
                    htDurumGuncelle();
                    if(HT_AKTIF_DETAY_HESAP === id) htHesapDetayKapat();
                    tmNotify("Hesap silindi.", "success");
                    aktiviteEkle("Hesap silindi: " + h.bankaAdi, "Muhasebe");
                });
            }
        }

        function htNakitKartGoster() {
            htHesapKartlariGoster();
        }

        function htHesapDetayGoster(hesapId) {
            HT_AKTIF_DETAY_HESAP = hesapId;
            var db = htVeriYukle();
            document.getElementById("htAnaSayfa").style.display = "none";
            var baslik = "", detayBilgi = "";
            var bakiyeEl = document.getElementById("htDetayBakiye");
            if(hesapId === -1) {
                baslik = '<i class="fa-solid fa-money-bill-wave"></i> Nakit Hesabı';
                detayBilgi = "Fiziki Nakit Para";
                bakiyeEl.innerHTML = '<span style="color:#4CAF50">' + htTl(db.nakit) + '</span>';
            } else {
                var hs = db.hesaplar.find(function(h){return h.id===hesapId;});
                if(!hs) { tmNotify("Hesap bulunamadı!", "error"); return; }
                baslik = '<i class="fa-solid fa-building-columns"></i> '+trToUpper(hs.bankaAdi)+' &middot; '+trToUpper(hs.hesapSahibi);
                detayBilgi = '<span title="IBAN">📘 '+htIbanGoster(hs.iban)+'</span> &nbsp;|&nbsp; Kart: '+trToUpper(hs.kartSifre||'-')+' &nbsp;|&nbsp; Net: '+trToUpper(hs.internetSifre||'-');
                var bak = hs.bakiye || 0;
                bakiyeEl.innerHTML = (bak >= 0 ? '<span style="color:#4CAF50">' : '<span style="color:#f44336">') + htTl(bak) + '</span>';
            }
            document.getElementById("htDetayBaslik").innerHTML = baslik;
            document.getElementById("htDetayBilgi").innerHTML = detayBilgi;
            document.getElementById("htHesapDetayAlan").style.display = "block";
            htDetayIslemleriGoster();
            history.pushState({ pageId:'hesap-takip-page', htDetay:hesapId }, "", "#hesap-takip-page");
        }

        function htHesapDetayKapat(skipHistory) {
            HT_AKTIF_DETAY_HESAP = null;
            document.getElementById("htHesapDetayAlan").style.display = "none";
            document.getElementById("htAnaSayfa").style.display = "";
            htHesapKartlariGoster();
            htNakitKartGoster();
            htIslemleriGoster();
            htDurumGuncelle();
            if(!skipHistory && history.state && history.state.htDetay) {
                history.back();
            }
        }

        function htDetayIslemleriGoster() {
            var konteyner = document.getElementById("htDetayIslemler");
            var sayfalamaEl = document.getElementById("htDetaySayfalama");
            if(!konteyner) return;
            var db = htVeriYukle();
            var hesapIslemler = db.islemler.filter(function(i){
                if(HT_AKTIF_DETAY_HESAP === -1) return i.hesapId === -1 || i.hedefId === -1;
                return i.hesapId === HT_AKTIF_DETAY_HESAP || i.hedefId === HT_AKTIF_DETAY_HESAP;
            });
            if(hesapIslemler.length === 0) {
                konteyner.innerHTML = "<p style='color:var(--text-light); padding:15px;'>Bu hesaba ait işlem bulunamadı.</p>";
                if(sayfalamaEl) sayfalamaEl.innerHTML = "";
                document.getElementById("htDetayAyBaslik").innerText = "";
                return;
            }
            function hesapAdiBul(id) {
                if(id === -1) return '<i class="fa-solid fa-money-bill-wave"></i> NAKİT';
                if(id === 0) return '<i class="fa-solid fa-globe"></i> HARİCİ';
                var h = db.hesaplar.find(function(hs){return hs.id===id;});
                return h ? trToUpper(h.bankaAdi)+" - "+trToUpper(h.hesapSahibi) : ("ID:"+id);
            }
            function hesapAdiBulPlain(id) {
                if(id === -1) return 'NAKİT';
                if(id === 0) return 'HARİCİ';
                var hx = db.hesaplar.find(function(hs){return hs.id===id;});
                return hx ? trToUpper(hx.bankaAdi)+" - "+trToUpper(hx.hesapSahibi) : ("ID:"+id);
            }
            var arama = trToLower(document.getElementById("htDetayArama").value);
            var simdi = new Date();
            var secYil = HT_DETAY_AKTIF_AY ? HT_DETAY_AKTIF_AY.yil : simdi.getFullYear();
            var secAy = HT_DETAY_AKTIF_AY ? HT_DETAY_AKTIF_AY.ay : simdi.getMonth();
            var filtreli = hesapIslemler.filter(function(i) {
                if(!arama && i.tarih) {
                    var t = new Date(i.tarih);
                    if(t.getFullYear() !== secYil || t.getMonth() !== secAy) return false;
                }
                if(arama) {
                    var txt = trToLower(i.aciklama||"") + " " + trToLower(hesapAdiBulPlain(i.hesapId));
                    if(i.hedefId) txt += " " + trToLower(hesapAdiBulPlain(i.hedefId));
                    if(!txt.includes(arama)) return false;
                }
                return true;
            });
            filtreli.sort(function(a,b){ var t=(a.tarih||"").localeCompare(b.tarih||"");return t!==0?t*HT_SIRALAMA.yon:(b.id||0)-(a.id||0); });
            var toplamSayfa = Math.max(1, Math.ceil(filtreli.length / HT_SAYFA_BOYUT));
            if(HT_DETAY_SAYFA > toplamSayfa) HT_DETAY_SAYFA = toplamSayfa;
            var basIdx = (HT_DETAY_SAYFA - 1) * HT_SAYFA_BOYUT;
            var sayfaListe = filtreli.slice(basIdx, basIdx + HT_SAYFA_BOYUT);
            document.getElementById("htDetayAyBaslik").innerHTML = '<i class="fa-regular fa-calendar"></i> ' + htAyBaslikGetir(secYil, secAy);
            var h = '<div class="ht-islem-kart-list">';
            sayfaListe.forEach(function(i) {
                var gorunenIslem = i.islem;
                var gorunenYon = hesapAdiBul(i.hesapId) + " → " + (i.hedefId ? hesapAdiBul(i.hedefId) : '<i class="fa-solid fa-globe"></i> HARİCİ');
                var gorunenYonPlain = hesapAdiBulPlain(i.hesapId) + " > " + (i.hedefId ? hesapAdiBulPlain(i.hedefId) : 'HARİCİ');
                var ikon = '<i class="fa-solid fa-paper-plane"></i>';
                if(i.islem === "GELEN") {
                    gorunenYon = '<i class="fa-solid fa-globe"></i> HARİCİ → ' + hesapAdiBul(i.hesapId);
                    gorunenYonPlain = 'HARİCİ > ' + hesapAdiBulPlain(i.hesapId);
                    ikon = '<i class="fa-solid fa-inbox"></i>';
                } else if(i.islem === "GİDEN") {
                    if(i.hedefId && i.hesapId !== HT_AKTIF_DETAY_HESAP) {
                        gorunenIslem = "GELEN";
                        ikon = '<i class="fa-solid fa-inbox"></i>';
                    }
                } else if(i.islem === "TRANSFER") {
                    if(i.hesapId === HT_AKTIF_DETAY_HESAP) {
                        gorunenIslem = "GİDEN";
                        ikon = '<i class="fa-solid fa-paper-plane"></i>';
                    } else {
                        gorunenIslem = "GELEN";
                        ikon = '<i class="fa-solid fa-inbox"></i>';
                    }
                }
                var cls = gorunenIslem === "GELEN" ? "gelen" : "giden";
                var hNeredenDetay, hNereyeDetay;
                if(i.islem === "GELEN") {
                    hNeredenDetay = '<i class="fa-solid fa-globe"></i> HARİCİ' + (i.hesapId === -1 ? ' / <i class="fa-solid fa-money-bill-wave"></i> NAKİT' : '');
                    hNereyeDetay = hesapAdiBul(i.hesapId);
                } else if(i.islem === "TRANSFER") {
                    hNeredenDetay = hesapAdiBul(i.hesapId);
                    hNereyeDetay = hesapAdiBul(i.hedefId);
                } else {
                    if(i.hedefId && i.hesapId !== HT_AKTIF_DETAY_HESAP) {
                        hNeredenDetay = hesapAdiBul(i.hesapId);
                        hNereyeDetay = i.hedefId ? hesapAdiBul(i.hedefId) : '<i class="fa-solid fa-globe"></i> HARİCİ';
                    } else {
                        hNeredenDetay = hesapAdiBul(i.hesapId);
                        hNereyeDetay = i.hedefId && i.hedefId !== 0 ? hesapAdiBul(i.hedefId) : '<i class="fa-solid fa-globe"></i> HARİCİ';
                    }
                }
                h += '<div class="ht-islem-kart" data-detay-search="'+htAttrEsc(trToLower(i.aciklama||'')+' '+trToLower(gorunenYonPlain))+'">';
                h += '<span class="ht-islem-kart-aciklama">'+i.aciklama+'</span>';
                h += '<span class="ht-islem-kart-tutar '+cls+'">'+htTl(i.tutar)+'</span>';
                h += '<span class="ht-islem-kart-nereden">'+hNeredenDetay+'</span>';
                h += '<span class="ht-islem-kart-arrow">→</span>';
                h += '<span class="ht-islem-kart-nereye">'+hNereyeDetay+'</span>';
                h += '<span class="ht-islem-kart-tarih">'+(i.tarih?new Date(i.tarih).toLocaleDateString("tr-TR"):"-")+'</span>';
                h += '<span class="ht-islem-kart-islem '+cls+'">'+gorunenIslem+'</span>';
                h += '<span class="ht-islem-kart-aksiyon">';
                h += '<button class="ht-islem-btn ht-islem-btn-del" onclick="htIslemSil('+i.id+')">Sil</button>';
                h += '</span></div>';
            });
            h += '</div>';
            konteyner.innerHTML = h;
            var sayfaHtml = '';
            if(!arama) {
                sayfaHtml += '<button class="ht-sayfa-btn" onclick="htDetayAyDegistir(-1)" title="Önceki Ay"><i class="fa-solid fa-chevron-left"></i></button>';
                sayfaHtml += '<span class="ht-sayfa-bilgi">'+htAyBaslikGetir(secYil, secAy)+' ('+filtreli.length+' işlem)</span>';
                sayfaHtml += '<button class="ht-sayfa-btn" onclick="htDetayAyDegistir(1)" title="Sonraki Ay"><i class="fa-solid fa-chevron-right"></i></button>';
                if(secYil !== simdi.getFullYear() || secAy !== simdi.getMonth()) {
                    sayfaHtml += '<button class="ht-sayfa-btn" onclick="htDetayAyBugun()" title="Bu Ay"><i class="fa-solid fa-calendar-day"></i></button>';
                }
                var yilSet={};hesapIslemler.forEach(function(i){if(i.tarih){var d=new Date(i.tarih);yilSet[d.getFullYear()]=true;}});
                var yilList=Object.keys(yilSet).map(Number).sort(function(a,b){return b-a;});
                if(yilList.length>1) {
                    sayfaHtml += '<select class="ht-yil-select" onchange="htDetayYilSec(this.value)">';
                    sayfaHtml += '<option value="">Tüm Yıllar</option>';
                    yilList.forEach(function(y){ sayfaHtml += '<option value="'+y+'"'+(secYil===y&&HT_DETAY_AKTIF_AY?' selected':'')+'>'+y+'</option>'; });
                    sayfaHtml += '</select>';
                }
            }
            sayfaHtml += '<div class="ht-sayfa-numara">';
            if(toplamSayfa > 1) {
                for(var p=1; p<=toplamSayfa; p++) {
                    if(p === HT_DETAY_SAYFA) sayfaHtml += '<span class="ht-sayfa-num ht-sayfa-aktif">'+p+'</span>';
                    else sayfaHtml += '<button class="ht-sayfa-num" onclick="htDetaySayfayiDegistir('+p+')">'+p+'</button>';
                }
            }
            sayfaHtml += '</div>';
            if(sayfalamaEl) sayfalamaEl.innerHTML = sayfaHtml;
            var sortBtn=document.getElementById("htDetaySortBtn");
            if(sortBtn) sortBtn.innerHTML=(HT_SIRALAMA.yon===-1?'<i class="fa-solid fa-arrow-down-short-wide"></i>':'<i class="fa-solid fa-arrow-up-wide-short"></i>')+' Tarih';
            var ac=document.getElementById("htDetayAramaClear");
            if(ac) ac.style.display=document.getElementById("htDetayArama").value?"":"none";
        }

        function htDetaySiralamaDegistir() {
            HT_SIRALAMA.yon *= -1;
            htDetayIslemleriGoster();
        }

        function htDetayYilSec(yil) {
            if(!yil) { HT_DETAY_AKTIF_AY = null; }
            else { HT_DETAY_AKTIF_AY = { yil: parseInt(yil), ay: HT_DETAY_AKTIF_AY ? HT_DETAY_AKTIF_AY.ay : new Date().getMonth() }; }
            HT_DETAY_SAYFA = 1;
            htDetayIslemleriGoster();
        }

        function htDetayIslemFiltrele() {
            var kelime = trToLower(document.getElementById("htDetayArama").value);
            var list = document.getElementById("htDetayIslemler");
            if(!list) return;
            list.querySelectorAll(".ht-islem-kart").forEach(function(k) {
                k.style.display = (k.getAttribute("data-detay-search")||"").includes(kelime) ? "" : "none";
            });
        }

        function htYeniIslemFormuDoldur() {
            var opts = '<option value="0"><i class="fa-solid fa-globe"></i> HARİCİ</option><option value="-1"><i class="fa-solid fa-money-bill-wave"></i> NAKİT</option>';
            var db = htVeriYukle();
            db.hesaplar.forEach(function(h) {
                opts += '<option value="'+h.id+'">'+h.bankaAdi+' - '+h.hesapSahibi+'</option>';
            });
            var nereden = document.getElementById("htYeniNereden");
            var nereye = document.getElementById("htYeniNereye");
            if(nereden) nereden.innerHTML = opts;
            if(nereye) nereye.innerHTML = opts;
            document.getElementById("htYeniTarih").value = anlikTarihGetir();
        }

        function htIslemModalAc(id, hesapId) {
            var modal = document.getElementById("htIslemModal");
            if(!modal) return;
            var db = htVeriYukle();
            var islem = id ? db.islemler.find(function(i){return i.id===id;}) : null;
            document.getElementById("htModalIslemId").value = id || "";
            document.getElementById("htModalIslemAciklama").value = islem ? islem.aciklama : "";
            document.getElementById("htModalTarih").value = islem ? islem.tarih : anlikTarihGetir();
            document.getElementById("htModalTutar").value = islem ? htTl(islem.tutar) : "0,00";
            document.getElementById("htModalIslemTur").value = islem ? islem.islem : "";
            var selectNereden = document.getElementById("htModalNereden");
            var selectNereye = document.getElementById("htModalNereye");
            var opts = '<option value="" disabled selected>SEÇİNİZ</option><option value="0"><i class="fa-solid fa-globe"></i> HARİCİ</option><option value="-1"><i class="fa-solid fa-money-bill-wave"></i> NAKİT</option>';
            db.hesaplar.forEach(function(h) {
                opts += '<option value="'+h.id+'">'+h.bankaAdi+' - '+h.hesapSahibi+'</option>';
            });
            selectNereden.innerHTML = opts;
            selectNereye.innerHTML = opts;
            if(islem) {
                if(islem.islem === "GELEN") {
                    selectNereden.value = "";
                    selectNereye.value = islem.hesapId;
                } else {
                    selectNereden.value = islem.hesapId;
                    selectNereye.value = islem.hedefId || "0";
                }
            } else {
                selectNereden.value = "";
                selectNereye.value = "";
            }
            htIslemModalTurDegisti();
            modal.style.display = "flex";
        }

        function htIslemModalKapat() {
            document.getElementById("htIslemModal").style.display = "none";
        }

        function htIslemModalTurDegisti() {
            var tur = document.getElementById("htModalIslemTur").value;
            var neredenDiv = document.getElementById("htModalNereden").closest("div");
            var nereyeDiv = document.getElementById("htModalNereye").closest("div");
            if(tur === "GELEN") {
                neredenDiv.style.display = "none";
                nereyeDiv.style.display = "";
            } else if(tur === "GİDEN") {
                neredenDiv.style.display = "";
                nereyeDiv.style.display = "none";
            } else {
                neredenDiv.style.display = "";
                nereyeDiv.style.display = "";
            }
        }

        function htIslemTersineCevir(db, islem) {
            if(islem.islem === "TRANSFER") {
                htBakiyeGuncelle(db, islem.hesapId, islem.tutar, "GİDEN", true);
                if(islem.hedefId) htBakiyeGuncelle(db, islem.hedefId, islem.tutar, "GELEN", true);
            } else if(islem.islem === "GİDEN" && islem.hedefId) {
                htBakiyeGuncelle(db, islem.hesapId, islem.tutar, "GİDEN", true);
                if(islem.hedefId === -1) htBakiyeGuncelle(db, islem.hedefId, islem.tutar, "GELEN", true);
            } else {
                htBakiyeGuncelle(db, islem.hesapId, islem.tutar, islem.islem, true);
            }
        }

        function htEksiBakiyeKontrol(db, hesapId, tutar, islem) {
            if(islem !== "GİDEN" && islem !== "TRANSFER") return true;
            if(hesapId === 0) return true;
            var bakiye = (hesapId === -1) ? (db.nakit||0) : (function(){
                var h = db.hesaplar.find(function(x){return x.id===hesapId;});
                return h ? (h.bakiye||0) : 999999;
            })();
            if(bakiye < tutar) {
                tmNotify("Yetersiz bakiye! Hesap bakiyesi: " + htTl(bakiye) + ", çekilmek istenen: " + htTl(tutar), "error");
                return false;
            }
            return true;
        }

        function htIslemModalKaydet() {
            var id = document.getElementById("htModalIslemId").value;
            var aciklama = document.getElementById("htModalIslemAciklama").value.trim();
            if(!aciklama) { tmNotify("Açıklama zorunludur!", "error"); return; }
            var tur = document.getElementById("htModalIslemTur").value;
            if(!tur) { tmNotify("İşlem türü seçiniz!", "error"); return; }
            var fromRaw = document.getElementById("htModalNereden").value;
            var toRaw = document.getElementById("htModalNereye").value;
            var fromId = parseInt(fromRaw);
            var toId = parseInt(toRaw);
            if(tur === "GELEN" && (toRaw==="" || isNaN(toId) || toId === 0)) { tmNotify("Lütfen alıcı hesap seçin!", "error"); return; }
            if(tur === "GİDEN" && (fromRaw==="" || isNaN(fromId) || fromId === 0)) { tmNotify("Lütfen gönderen hesap seçin!", "error"); return; }
            if(tur === "TRANSFER" && (fromRaw==="" || toRaw==="" || isNaN(fromId) || isNaN(toId) || fromId === 0 || toId === 0)) { tmNotify("Lütfen her iki hesabı da seçin!", "error"); return; }
            if(tur === "TRANSFER" && fromId === toId) { tmNotify("Transfer için farklı iki hesap seçin!", "error"); return; }
            var tarih = document.getElementById("htModalTarih").value;
            var tutar = tmTutarCoz(document.getElementById("htModalTutar").value);
            if(tutar <= 0) { tmNotify("Geçerli bir tutar giriniz!", "error"); return; }
            var db = htVeriYukle();
            var hesapId, hedefId;
            if(tur === "GELEN") { hesapId = toId; hedefId = null; }
            else if(tur === "GİDEN") { hesapId = fromId; hedefId = (!isNaN(toId) && toId !== 0) ? toId : null; }
            else { hesapId = fromId; hedefId = toId; }
            if(id) {
                id = parseInt(id);
                var eski = db.islemler.find(function(i){return i.id===id;});
                if(eski) htIslemTersineCevir(db, eski);
                if(!htEksiBakiyeKontrol(db, tur==="GELEN"?null:hesapId, tutar, tur)) {
                    if(eski) htIslemTersineCevir(db, eski);
                    return;
                }
                var idx = db.islemler.findIndex(function(i){return i.id===id;});
                if(idx!==-1) db.islemler[idx] = { id:id, hesapId:hesapId, hedefId:hedefId, aciklama:aciklama, tarih:tarih, tutar:tutar, islem:tur };
            } else {
                if(!htEksiBakiyeKontrol(db, hesapId, tutar, tur)) return;
                var maxId = db.islemler.reduce(function(m,i){return Math.max(m,i.id);},0);
                var yeniId = maxId + 1;
                if(tur === "TRANSFER") {
                    if(!htEksiBakiyeKontrol(db, hesapId, tutar, "TRANSFER")) return;
                    db.islemler.push({ id:yeniId, hesapId:hesapId, hedefId:hedefId, aciklama:aciklama, tarih:tarih, tutar:tutar, islem:"TRANSFER" });
                    htBakiyeGuncelle(db, hesapId, tutar, "GİDEN");
                    htBakiyeGuncelle(db, hedefId, tutar, "GELEN");
                } else if(tur === "GELEN") {
                    db.islemler.push({ id:yeniId, hesapId:hesapId, aciklama:aciklama, tarih:tarih, tutar:tutar, islem:"GELEN" });
                    htBakiyeGuncelle(db, hesapId, tutar, "GELEN");
                } else {
                    var gidenKayit = { id:yeniId, hesapId:hesapId, aciklama:aciklama, tarih:tarih, tutar:tutar, islem:"GİDEN" };
                    if(hedefId !== null) {
                        gidenKayit.hedefId = hedefId;
                        if(hedefId === -1) htBakiyeGuncelle(db, hedefId, tutar, "GELEN");
                    }
                    db.islemler.push(gidenKayit);
                    htBakiyeGuncelle(db, hesapId, tutar, "GİDEN");
                }
            }
            htVeriKaydet(db);
            htIslemModalKapat();
            htHesapKartlariGoster();
            htNakitKartGoster();
            htIslemleriGoster();
            if(HT_AKTIF_DETAY_HESAP !== null) htDetayIslemleriGoster();
            htDurumGuncelle();
            tmNotify(id ? "Hareket güncellendi." : "Hareket eklendi.", "success");
            if(!id && (tur === "GELEN" || tur === "TRANSFER")) tmSesCal('para');
            aktiviteEkle((id ? "Hareket güncellendi: " : "Hareket eklendi: ") + aciklama, "Muhasebe");
        }

        function htBakiyeGuncelle(db, hesapId, tutar, islem, geriAl) {
            var carp = geriAl ? -1 : 1;
            var etki = 0;
            if(islem === "GELEN") etki = tutar * carp;
            else if(islem === "GİDEN") etki = -tutar * carp;
            else if(islem === "TRANSFER") return;
            if(hesapId === -1) { db.nakit = (db.nakit||0) + etki; return; }
            var hs = db.hesaplar.find(function(h){return h.id===hesapId;});
            if(hs) hs.bakiye = (hs.bakiye||0) + etki;
        }

        function htIslemSil(id) {
            tmConfirm("Bu hareketi silmek istediğinize emin misiniz?", function() {
                var db = htVeriYukle();
                var sil = db.islemler.find(function(i){return i.id===id;});
                if(sil) htIslemTersineCevir(db, sil);
                db.islemler = db.islemler.filter(function(i){return i.id!==id;});
                htVeriKaydet(db);
                htHesapKartlariGoster();
                htNakitKartGoster();
                htIslemleriGoster();
                if(HT_AKTIF_DETAY_HESAP !== null) htDetayIslemleriGoster();
                htDurumGuncelle();
                var silAciklama = sil ? sil.aciklama : "";
                tmNotify("Hareket silindi.", "success");
                aktiviteEkle("Hareket silindi: " + silAciklama, "Muhasebe");
            });
        }

        var HT_SIRALAMA = { anahtar: "tarih", yon: -1 };
        var HT_AKTIF_AY = null;
        var HT_DETAY_AKTIF_AY = null;
        var HT_AKTIF_SAYFA = 1;
        var HT_DETAY_SAYFA = 1;
        var HT_SAYFA_BOYUT = 20;

        function htAyBaslikGetir(yil, ay) {
            var aylar = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
            return aylar[ay] + " " + yil;
        }

        function htAyBugun() {
            HT_AKTIF_AY = null;
            HT_AKTIF_SAYFA = 1;
            htIslemleriGoster();
        }

        function htAyDegistir(delta) {
            var simdi = new Date();
            var yil = HT_AKTIF_AY ? HT_AKTIF_AY.yil : simdi.getFullYear();
            var ay = HT_AKTIF_AY ? HT_AKTIF_AY.ay : simdi.getMonth();
            var d = new Date(yil, ay + delta, 1);
            HT_AKTIF_AY = { yil: d.getFullYear(), ay: d.getMonth() };
            HT_AKTIF_SAYFA = 1;
            htIslemleriGoster();
        }

        function htSayfayiDegistir(sayfa) {
            HT_AKTIF_SAYFA = sayfa;
            htIslemleriGoster();
        }

        function htDetayAyBugun() {
            HT_DETAY_AKTIF_AY = null;
            HT_DETAY_SAYFA = 1;
            htDetayIslemleriGoster();
        }

        function htDetayAyDegistir(delta) {
            var simdi = new Date();
            var yil = HT_DETAY_AKTIF_AY ? HT_DETAY_AKTIF_AY.yil : simdi.getFullYear();
            var ay = HT_DETAY_AKTIF_AY ? HT_DETAY_AKTIF_AY.ay : simdi.getMonth();
            var d = new Date(yil, ay + delta, 1);
            HT_DETAY_AKTIF_AY = { yil: d.getFullYear(), ay: d.getMonth() };
            HT_DETAY_SAYFA = 1;
            htDetayIslemleriGoster();
        }

        function htDetaySayfayiDegistir(sayfa) {
            HT_DETAY_SAYFA = sayfa;
            htDetayIslemleriGoster();
        }

        function htIslemleriGoster() {
            var konteyner = document.getElementById("htIslemListesi");
            var sayfalamaEl = document.getElementById("htSayfalama");
            if(!konteyner) return;
            var db = htVeriYukle();
            if(!db.islemler || db.islemler.length === 0) {
                konteyner.innerHTML = tmEmptyStateHTML('<i class="fa-regular fa-credit-card"></i>','Henüz hesap hareketi bulunmamaktadır.','Hesap hareketi eklemek için "Hareket Ekle" butonunu kullanın.');
                document.getElementById("htAyBaslik").innerText = "";
                if(sayfalamaEl) sayfalamaEl.innerHTML = "";
                return;
            }
            function hesapAdiBul(id) {
                if(id === -1) return '<i class="fa-solid fa-money-bill-wave"></i> NAKİT';
                if(id === 0) return '<i class="fa-solid fa-globe"></i> HARİCİ';
                var h = db.hesaplar.find(function(hs){return hs.id===id;});
                return h ? trToUpper(h.bankaAdi)+" - "+trToUpper(h.hesapSahibi) : ("ID:"+id);
            }
            function hesapAdiBulPlain(id) {
                if(id === -1) return 'NAKİT';
                if(id === 0) return 'HARİCİ';
                var hx = db.hesaplar.find(function(hs){return hs.id===id;});
                return hx ? trToUpper(hx.bankaAdi)+" - "+trToUpper(hx.hesapSahibi) : ("ID:"+id);
            }
            var arama = trToLower(document.getElementById("htArama").value);
            var simdi = new Date();
            var secYil = HT_AKTIF_AY ? HT_AKTIF_AY.yil : simdi.getFullYear();
            var secAy = HT_AKTIF_AY ? HT_AKTIF_AY.ay : simdi.getMonth();
            var filtreli = db.islemler.filter(function(i) {
                if(!arama && i.tarih) {
                    var t = new Date(i.tarih);
                    if(t.getFullYear() !== secYil || t.getMonth() !== secAy) return false;
                }
                if(arama) {
                    var txt = trToLower(i.aciklama||"") + " " + trToLower(hesapAdiBulPlain(i.hesapId));
                    if(i.hedefId) txt += " " + trToLower(hesapAdiBulPlain(i.hedefId));
                    if(!txt.includes(arama)) return false;
                }
                return true;
            });
            filtreli.sort(function(a,b){ var t=(a.tarih||"").localeCompare(b.tarih||"");return t!==0?t*HT_SIRALAMA.yon:(b.id||0)-(a.id||0); });
            var toplamSayfa = Math.max(1, Math.ceil(filtreli.length / HT_SAYFA_BOYUT));
            if(HT_AKTIF_SAYFA > toplamSayfa) HT_AKTIF_SAYFA = toplamSayfa;
            var basIdx = (HT_AKTIF_SAYFA - 1) * HT_SAYFA_BOYUT;
            var sayfaListe = filtreli.slice(basIdx, basIdx + HT_SAYFA_BOYUT);
            document.getElementById("htAyBaslik").innerHTML = '<i class="fa-regular fa-calendar"></i> ' + htAyBaslikGetir(secYil, secAy);
            var h = '<div class="ht-islem-kart-list">';
            sayfaListe.forEach(function(i) {
                var cls = i.islem === "GELEN" ? "gelen" : (i.islem === "GİDEN" ? "giden" : "transfer");
                var hAd, hAdPlain, ikon;
                if(i.islem === "TRANSFER") {
                    hAd = hesapAdiBul(i.hesapId) + ' → ' + hesapAdiBul(i.hedefId);
                    hAdPlain = hesapAdiBulPlain(i.hesapId) + ' > ' + hesapAdiBulPlain(i.hedefId);
                    ikon = '<i class="fa-solid fa-rotate"></i>';
                } else if(i.islem === "GELEN") {
                    hAd = '<i class="fa-solid fa-globe"></i> HARİCİ' + (i.hesapId === -1 ? ' / <i class="fa-solid fa-money-bill-wave"></i> NAKİT' : '') + ' → ' + hesapAdiBul(i.hesapId);
                    hAdPlain = 'HARİCİ' + (i.hesapId === -1 ? ' / NAKİT' : '') + ' > ' + hesapAdiBulPlain(i.hesapId);
                    ikon = '<i class="fa-solid fa-inbox"></i>';
                } else {
                    hAd = hesapAdiBul(i.hesapId) + ' → ' + (i.hedefId && i.hedefId !== 0 ? hesapAdiBul(i.hedefId) : '<i class="fa-solid fa-globe"></i> HARİCİ');
                    hAdPlain = hesapAdiBulPlain(i.hesapId) + ' > ' + (i.hedefId && i.hedefId !== 0 ? hesapAdiBulPlain(i.hedefId) : 'HARİCİ');
                    ikon = '<i class="fa-solid fa-paper-plane"></i>';
                }
                /* 7 sütun: aciklama | tutar | nereden | nereye | tarih | islem | aksiyon */
                var hNereden, hNereye;
                if(i.islem === "GELEN") {
                    hNereden = '<i class="fa-solid fa-globe"></i> HARİCİ' + (i.hesapId === -1 ? ' / <i class="fa-solid fa-money-bill-wave"></i> NAKİT' : '');
                    hNereye = hesapAdiBul(i.hesapId);
                } else if(i.islem === "TRANSFER") {
                    hNereden = hesapAdiBul(i.hesapId);
                    hNereye = hesapAdiBul(i.hedefId);
                } else {
                    hNereden = hesapAdiBul(i.hesapId);
                    hNereye = i.hedefId && i.hedefId !== 0 ? hesapAdiBul(i.hedefId) : '<i class="fa-solid fa-globe"></i> HARİCİ';
                }
                h += '<div class="ht-islem-kart" data-search="'+htAttrEsc(trToLower(i.aciklama||'')+' '+trToLower(hAdPlain))+'">';
                h += '<span class="ht-islem-kart-aciklama">'+i.aciklama+'</span>';
                h += '<span class="ht-islem-kart-tutar '+cls+'">'+htTl(i.tutar)+'</span>';
                h += '<span class="ht-islem-kart-nereden">'+hNereden+'</span>';
                h += '<span class="ht-islem-kart-arrow">→</span>';
                h += '<span class="ht-islem-kart-nereye">'+hNereye+'</span>';
                h += '<span class="ht-islem-kart-tarih">'+(i.tarih?new Date(i.tarih).toLocaleDateString("tr-TR"):"-")+'</span>';
                h += '<span class="ht-islem-kart-islem '+cls+'">'+i.islem+'</span>';
                h += '<span class="ht-islem-kart-aksiyon">';
                h += '<button class="ht-islem-btn ht-islem-btn-del" onclick="htIslemSil('+i.id+')">Sil</button>';
                h += '</span></div>';
            });
            h += '</div>';
            konteyner.innerHTML = h;
            var sayfaHtml = '';
            if(!arama) {
                sayfaHtml += '<button class="ht-sayfa-btn" onclick="htAyDegistir(-1)" title="Önceki Ay"><i class="fa-solid fa-chevron-left"></i></button>';
                sayfaHtml += '<span class="ht-sayfa-bilgi">'+htAyBaslikGetir(secYil, secAy)+' ('+filtreli.length+' işlem)</span>';
                sayfaHtml += '<button class="ht-sayfa-btn" onclick="htAyDegistir(1)" title="Sonraki Ay"><i class="fa-solid fa-chevron-right"></i></button>';
                if(secYil !== simdi.getFullYear() || secAy !== simdi.getMonth()) {
                    sayfaHtml += '<button class="ht-sayfa-btn" onclick="htAyBugun()" title="Bu Ay"><i class="fa-solid fa-calendar-day"></i></button>';
                }
                var yilSet={};db.islemler.forEach(function(i){if(i.tarih){var d=new Date(i.tarih);yilSet[d.getFullYear()]=true;}});
                var yilList=Object.keys(yilSet).map(Number).sort(function(a,b){return b-a;});
                if(yilList.length>1) {
                    sayfaHtml += '<select class="ht-yil-select" onchange="htYilSec(this.value)">';
                    sayfaHtml += '<option value="">Tüm Yıllar</option>';
                    yilList.forEach(function(y){ sayfaHtml += '<option value="'+y+'"'+(secYil===y&&HT_AKTIF_AY?' selected':'')+'>'+y+'</option>'; });
                    sayfaHtml += '</select>';
                }
            }
            sayfaHtml += '<div class="ht-sayfa-numara">';
            if(toplamSayfa > 1) {
                for(var p=1; p<=toplamSayfa; p++) {
                    if(p === HT_AKTIF_SAYFA) sayfaHtml += '<span class="ht-sayfa-num ht-sayfa-aktif">'+p+'</span>';
                    else sayfaHtml += '<button class="ht-sayfa-num" onclick="htSayfayiDegistir('+p+')">'+p+'</button>';
                }
            }
            sayfaHtml += '</div>';
            if(sayfalamaEl) sayfalamaEl.innerHTML = sayfaHtml;
            var sortBtn=document.getElementById("htSortBtn");
            if(sortBtn) sortBtn.innerHTML=(HT_SIRALAMA.yon===-1?'<i class="fa-solid fa-arrow-down-short-wide"></i>':'<i class="fa-solid fa-arrow-up-wide-short"></i>')+' Tarih';
            var ac=document.getElementById("htAramaClear");
            if(ac) ac.style.display=document.getElementById("htArama").value?"":"none";
        }

        function htSiralamaDegistir() {
            HT_SIRALAMA.yon *= -1;
            htIslemleriGoster();
        }

        function htYilSec(yil) {
            if(!yil) { HT_AKTIF_AY = null; }
            else { HT_AKTIF_AY = { yil: parseInt(yil), ay: HT_AKTIF_AY ? HT_AKTIF_AY.ay : new Date().getMonth() }; }
            HT_AKTIF_SAYFA = 1;
            htIslemleriGoster();
        }

        function htAramaKeyup(e) {
            htIslemleriGoster();
            var ac=document.getElementById("htAramaClear");
            if(ac) ac.style.display=e.target.value?"":"none";
        }

        function htAramaTemizle() {
            document.getElementById("htArama").value="";
            document.getElementById("htAramaClear").style.display="none";
            document.getElementById("htArama").focus();
            htIslemleriGoster();
        }

        function htDetayAramaKeyup(e) {
            htDetayIslemleriGoster();
            var ac=document.getElementById("htDetayAramaClear");
            if(ac) ac.style.display=e.target.value?"":"none";
        }

        function htDetayAramaTemizle() {
            document.getElementById("htDetayArama").value="";
            document.getElementById("htDetayAramaClear").style.display="none";
            document.getElementById("htDetayArama").focus();
            htDetayIslemleriGoster();
        }

        function htIslemFiltrele() {
            var kelime = trToLower(document.getElementById("htArama").value);
            var list = document.getElementById("htIslemListesi");
            if(!list) return;
            list.querySelectorAll(".ht-islem-kart").forEach(function(k) {
                k.style.display = (k.getAttribute("data-search")||"").includes(kelime) ? "" : "none";
            });
        }

        /* ================= HESAP TAKİBİ PDF RAPOR SİSTEMİ ================= */
        function htPdfDonemDegisti() {
            var donem = document.getElementById("htPdfDonem").value;
            document.getElementById("htPdfOzelTarih").style.display = donem === "ozel" ? "" : "none";
        }

        function htPdfModalAc(hesapId) {
            var modal = document.getElementById("htPdfModal");
            if(!modal) return;
            document.getElementById("htPdfHesapId").value = hesapId || "";
            var sec = document.getElementById("htPdfHesap");
            var db = htVeriYukle();
            sec.innerHTML = '<option value="0"><i class="fa-solid fa-building-columns"></i> Tüm Hesaplar</option>';
            db.hesaplar.forEach(function(h) {
                sec.innerHTML += '<option value="'+h.id+'" '+(hesapId===h.id?'selected':'')+'><i class="fa-solid fa-building-columns"></i> '+h.bankaAdi+' - '+h.hesapSahibi+'</option>';
            });
            sec.innerHTML += '<option value="-1" '+(hesapId===-1?'selected':'')+'><i class="fa-solid fa-money-bill-wave"></i> NAKİT</option>';
            document.getElementById("htPdfBaslangic").value = "";
            document.getElementById("htPdfBitis").value = "";
            document.getElementById("htPdfDonem").value = "aylik";
            document.getElementById("htPdfOzelTarih").style.display = "none";
            modal.style.display = "flex";
        }

        function htPdfModalKapat() {
            document.getElementById("htPdfModal").style.display = "none";
        }

        function htPdfTarihAraligiHesapla() {
            var donem = document.getElementById("htPdfDonem").value;
            var bugun = new Date();
            var bas, bitis = new Date(bugun);
            if(donem === "haftalik") {
                bas = new Date(bugun); bas.setDate(bas.getDate() - 7);
            } else if(donem === "aylik") {
                bas = new Date(bugun); bas.setMonth(bas.getMonth() - 1);
            } else if(donem === "yillik") {
                bas = new Date(bugun); bas.setFullYear(bas.getFullYear() - 1);
            } else {
                bas = new Date(document.getElementById("htPdfBaslangic").value);
                bitis = new Date(document.getElementById("htPdfBitis").value);
                if(isNaN(bas.getTime()) || isNaN(bitis.getTime())) {
                    tmNotify("Lütfen geçerli bir tarih aralığı seçin!", "error"); return null;
                }
                if(bas > bitis) { tmNotify("Başlangıç tarihi bitiş tarihinden sonra olamaz!", "error"); return null; }
            }
            return { bas: bas, bitis: bitis };
        }

        function htPdfRaporOlustur() {
            var hesapId = parseInt(document.getElementById("htPdfHesap").value);
            var aralik = htPdfTarihAraligiHesapla();
            if(!aralik) return;
            aralik.bas.setHours(0,0,0,0);
            aralik.bitis.setHours(23,59,59,999);
            var db = htVeriYukle();
            var islemler = db.islemler.filter(function(i) {
                if(!i.tarih) return false;
                var t = new Date(i.tarih);
                if(isNaN(t.getTime())) return false;
                if(hesapId !== 0 && i.hesapId !== hesapId && i.hedefId !== hesapId) return false;
                return t >= aralik.bas && t <= aralik.bitis;
            });
            islemler.sort(function(a,b){ return (a.tarih||"").localeCompare(b.tarih||""); });

            function hesapAdiBul(id) {
                if(id === -1) return "NAKİT";
                if(id === 0) return "HARİCİ";
                var h = db.hesaplar.find(function(hs){return hs.id===id;});
                return h ? h.bankaAdi+" - "+h.hesapSahibi : ("ID:"+id);
            }

            var toplamGelir = 0, toplamGider = 0;
            islemler.forEach(function(i) {
                if(i.islem === "GELEN" || (i.islem === "GİDEN" && i.hedefId && (i.hedefId === 1 || i.hedefId === -1))) toplamGelir += i.tutar;
                else if(i.islem === "GİDEN" || i.islem === "TRANSFER") toplamGider += i.tutar;
            });
            var netDegisim = toplamGelir - toplamGider;

            var baslik = "HESAP HAREKET RAPORU";
            var donemStr = aralik.bas.toLocaleDateString("tr-TR") + " - " + aralik.bitis.toLocaleDateString("tr-TR");
            var hesapStr = hesapId === 0 ? "TÜM HESAPLAR" : hesapAdiBul(hesapId);

            var logoData = localStorage.getItem("tm_sirket_logo");
            var firmaAd = (function(){ try{return JSON.parse(localStorage.getItem("tm_sirket_bilgileri"))||{};}catch(e){return {};} })()["ad"] || "TURAK MİMARLIK";

            var doc = new jspdf.jsPDF({format:'a4',orientation:'portrait',unit:'mm'});

            try {
                if(logoData && logoData !== "null" && logoData.length > 100) {
                    doc.addImage(logoData, 'PNG', 10, 8, 30, 10);
                }
            } catch(e) {}
            doc.setFontSize(18);
            doc.setFont(undefined,'bold');
            doc.setTextColor(26,26,46);
            doc.text(trPdfText(firmaAd), logoData&&logoData.length>100?42:10, 15);
            doc.setFontSize(9);
            doc.setFont(undefined,'normal');
            doc.setTextColor(136,136,136);
            doc.text(trPdfText(donemStr), doc.internal.pageSize.width-10, 12, {align:'right'});
            doc.setFontSize(14);
            doc.setFont(undefined,'bold');
            doc.setTextColor(26,58,92);
            doc.text(trPdfText(baslik), doc.internal.pageSize.width-10, 18, {align:'right'});

            doc.setDrawColor(26,26,46);
            doc.setLineWidth(0.4);
            doc.line(10, 23, 200, 23);
            doc.setFontSize(6);
            doc.setFont(undefined,'normal');
            doc.setTextColor(136,136,136);
            doc.text(trPdfText("RAPORLANAN HESAP: " + hesapStr), 10, 27);

            var yBas = 31;
            var kutuGenislik = 58;
            var kutuAralik = 4;
            var kutuStart = 10;
            var kutuRenkler = [
                [250,250,250], [250,250,250], [250,250,250]
            ];
            var kutuBilgiler = [
                { label:"TOPLAM GELİR", deger:toplamGelir.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺', renk:[46,125,50] },
                { label:"TOPLAM GİDER", deger:toplamGider.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺', renk:[158,42,43] },
                { label:"NET DEĞİŞİM", deger:netDegisim.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺', renk:netDegisim>=0?[46,125,50]:[158,42,43] }
            ];
            for(var ki=0; ki<3; ki++) {
                var kx = kutuStart + ki*(kutuGenislik+kutuAralik);
                doc.setDrawColor(224,224,224);
                doc.setFillColor(kutuRenkler[ki][0], kutuRenkler[ki][1], kutuRenkler[ki][2]);
                doc.roundedRect(kx, yBas, kutuGenislik, 14, 1, 1, 'FD');
                doc.setFontSize(6);
                doc.setFont(undefined,'bold');
                doc.setTextColor(136,136,136);
                doc.text(trPdfText(kutuBilgiler[ki].label), kx+2, yBas+4);
                doc.setFontSize(10);
                doc.setTextColor(kutuBilgiler[ki].renk[0], kutuBilgiler[ki].renk[1], kutuBilgiler[ki].renk[2]);
                doc.text(kutuBilgiler[ki].deger, kx+2, yBas+11);
            }
            doc.setFontSize(6);
            doc.setFont(undefined,'normal');
            doc.setTextColor(136,136,136);
            doc.text(trPdfText("Toplam Islem: " + islemler.length + " adet"), 200-10, yBas+4, {align:'right'});

            var tableY = yBas + 18;
            var tableHead = [
                { header:'TARIH', dataKey:'tarih' },
                { header:'ACIKLAMA', dataKey:'aciklama' },
                { header:'NEREDEN -> NEREYE', dataKey:'hesap' },
                { header:'TUR', dataKey:'islem' },
                { header:'TUTAR', dataKey:'tutar' }
            ];
            var tableData = islemler.map(function(i) {
                var hStr = '';
                if(i.islem === "TRANSFER") {
                    hStr = trPdfText(hesapAdiBul(i.hesapId) + " -> " + hesapAdiBul(i.hedefId));
                } else if(i.islem === "GELEN") {
                    hStr = trPdfText('HARICI -> ' + hesapAdiBul(i.hesapId));
                } else {
                    hStr = trPdfText(hesapAdiBul(i.hesapId) + ' -> ' + (i.hedefId && i.hedefId!==0 ? hesapAdiBul(i.hedefId) : 'HARICI'));
                }
                var renk = i.islem === "GELEN" ? [46,125,50] : (i.islem === "GİDEN" ? [158,42,43] : [160,184,204]);
                return {
                    tarih: i.tarih ? new Date(i.tarih).toLocaleDateString("tr-TR") : "-",
                    aciklama: trPdfText(i.aciklama || ""),
                    hesap: hStr,
                    islem: i.islem === "GELEN" || i.islem === "GİDEN" ? trPdfText(i.islem) : "TRANSFER",
                    tutar: { text: (i.tutar||0).toLocaleString('tr-TR',{minFractionDigits:2})+' TL', color: renk }
                };
            });

            doc.autoTable({
                head: [tableHead.map(function(h){return h.header;})],
                body: tableData.map(function(r){ return [r.tarih, r.aciklama, r.hesap, r.islem, r.tutar]; }),
                startY: tableY,
                theme: 'grid',
                headStyles: { fillColor:[26,26,46], textColor:255, fontSize:7, fontStyle:'bold' },
                bodyStyles: { fontSize:7 },
                columnStyles: {
                    0: { cellWidth:22 },
                    2: { cellWidth:45 },
                    3: { cellWidth:15 },
                    4: { cellWidth:25, halign:'right' }
                },
                didParseCell: function(data) {
                    if(data.column.index === 4 && data.cell.raw) {
                        data.cell.styles.textColor = data.cell.raw.color || [0,0,0];
                    }
                }
            });

            var sonY = doc.lastAutoTable.finalY || tableY;
            doc.setDrawColor(26,26,46);
            doc.setLineWidth(0.3);
            doc.line(10, sonY+5, 200, sonY+5);
            doc.setFontSize(6);
            doc.setTextColor(136,136,136);
            doc.text(trPdfText('TM-Portal Hesap Takip Sistemi · Rapor: '+donemStr+' · '+hesapStr), 105, sonY+9, {align:'center'});

            doc.save("HESAP_RAPORU_" + hesapStr.replace(/[^a-zA-Z0-9]/g,"_") + ".pdf");
            tmNotify("Rapor PDF olarak kaydedildi.", "success");
            htPdfModalKapat();
        }
        /* ================= TM FİYAT LİSTESİ — FİYAT KARTLARI ================= */
        const TMF_KART_KEY = 'tm_kategorili_fiyatlar';
        let tmfEditId = null;

        function tmfVeriYukle() {
            let db = JSON.parse(localStorage.getItem(TMF_KART_KEY));
            if (!db || !db.kartlar) {
                db = {
                    kartlar: [
                        { id: 1, ad: "Uygulama Proje", tip: "kademeli", birim: "m²", not: "Konut projeleri için geçerlidir.", kademeler: [
                            { min: "0", max: "100", fiyat: "1100" }, { min: "101", max: "200", fiyat: "570" }, { min: "201", max: "250", fiyat: "460" }, { min: "251", max: "500", fiyat: "240" }, { min: "501", max: "750", fiyat: "170" }, { min: "751", max: "1000", fiyat: "155" }, { min: "1001", max: "+", fiyat: "130" }
                        ] },
                        { id: 2, ad: "3B Modelleme ve Tasarım", tip: "birim", birim: "m²", not: "", birimFiyat: "500" },
                        { id: 3, ad: "Şantiye Şefliği", tip: "kademeli", birim: "ay", not: "Toplam inşaat alanına göre aylık ücret.", kademeler: [
                            { min: "0", max: "500", fiyat: "8000" }, { min: "501", max: "1000", fiyat: "12000" }, { min: "1001", max: "+", fiyat: "15000" }
                        ] },
                        { id: 4, ad: "Kat İrtifakı/Mülkiyeti", tip: "birim", birim: "adet", not: "Her bir bağımsız bölüm için.", birimFiyat: "5000" },
                        { id: 5, ad: "Danışmanlık", tip: "birim", birim: "saat", not: "", birimFiyat: "750" },
                        { id: 6, ad: "Rölöve", tip: "birim", birim: "m²", not: "", birimFiyat: "200" },
                        { id: 7, ad: "Keşif", tip: "sabit", birim: "adet", not: "Anahtar teslim keşif bedeli.", sabitFiyat: "3000" }
                    ],
                    sonrakiId: 8
                };
                origSetItem(TMF_KART_KEY, JSON.stringify(db));
            }
            return db;
        }

        function tmfVeriKaydet(db) { localStorage.setItem(TMF_KART_KEY, JSON.stringify(db)); }

        function tmfDegerCoz(s) {
            if (!s) return 0;
            var t = String(s).replace(/\./g, '').replace(',', '.').replace(/[^0-9.\-]/g, '');
            var n = parseFloat(t);
            return isNaN(n) ? 0 : n;
        }

        function tmfFmt(n) {
            return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        function tmfSayfayiYukle() {
            const db = tmfVeriYukle();
            const grid = document.getElementById("tmfKartGrid");
            if (!grid) return;
            if (db.kartlar.length === 0) {
                grid.innerHTML = '<div class="tmf-bos-durum"><div class="tmf-bos-icon"><i class="fa-solid fa-box-open"></i></div><div class="tmf-bos-title">Henüz fiyat kartı yok</div><div class="tmf-bos-desc">"Yeni Kart" butonuna tıklayarak ilk fiyatlandırma kartınızı oluşturun.</div></div>';
                return;
            }
            let h = "";
            db.kartlar.forEach(k => {
                const tipEtiket = k.tip === "sabit" ? "Sabit" : k.tip === "birim" ? "Birim" : "Kademeli";
                const tipIcon = k.tip === "sabit" ? '<i class="fa-solid fa-coins"></i>' : k.tip === "birim" ? '<i class="fa-solid fa-cube"></i>' : '<i class="fa-solid fa-ruler-combined"></i>';
                h += '<div class="tmf-kart" draggable="true" data-id="' + k.id + '">';
                h += '<div class="tmf-kart-header"><h3>' + esc(k.ad) + '</h3><div class="tmf-kart-badges">';
                h += '<span class="tmf-badge tmf-badge-' + k.tip + '">' + tipIcon + ' ' + tipEtiket + '</span>';
                h += '<span class="tmf-badge tmf-badge-unit">' + esc(k.birim || "—") + '</span>';
                h += '</div></div>';
                h += '<div class="tmf-kart-body">';
                if (k.tip === "sabit") {
                    h += '<div class="tmf-sabit-goster"><div class="tmf-fiyat-buyuk">' + tmfFmt(tmfDegerCoz(k.sabitFiyat)) + ' \u20BA</div></div>';
                } else if (k.tip === "birim") {
                    h += '<div class="tmf-birim-goster"><div class="tmf-fiyat-orta">' + tmfFmt(tmfDegerCoz(k.birimFiyat)) + ' \u20BA</div>';
                    h += '<div class="tmf-unit-label">/ ' + esc(k.birim) + '</div></div>';
                } else if (k.tip === "kademeli" && k.kademeler) {
                    h += '<table class="tmf-kademeli-tablo">';
                    k.kademeler.forEach(kd => {
                        const aralik = kd.max === "+" ? kd.min + ' ' + esc(k.birim) + ' ve \u00fczeri' : kd.min + ' - ' + kd.max + ' ' + esc(k.birim);
                        h += '<tr><td class="tmf-desc">' + esc(kd.aciklama || "") + '</td><td class="tmf-range">' + aralik + '</td><td class="tmf-price">' + tmfFmt(tmfDegerCoz(kd.fiyat)) + ' \u20BA</td></tr>';
                    });
                    h += '</table>';
                }
                h += '</div>';
                h += '<div class="tmf-kart-hesapla">';
                h += '<div class="tmf-hesap-row"><input type="text" class="tmf-hesap-input" id="tmfHesapInput_' + k.id + '" oninput="tmfKartHesapla(' + k.id + ')" placeholder="Miktar girin..." value=""><span class="tmf-hesap-unit">' + esc(k.birim) + '</span></div>';
                h += '<div class="tmf-hesap-islem" id="tmfHesapIslem_' + k.id + '"></div>';
                h += '<div class="tmf-hesap-sonuc"><span class="tmf-hesap-label">Toplam</span><span id="tmfHesapSonuc_' + k.id + '">—</span></div>';
                h += '</div>';
                if (k.not) { h += '<div class="tmf-kart-not"><i class="fa-solid fa-thumbtack"></i> ' + esc(k.not) + '</div>'; }
                h += '<div class="tmf-kart-actions">';
                h += '<button class="tmf-btn-edit" onclick="tmfKartDuzenle(' + k.id + ')">D\u00fczenle</button>';
                h += '<button class="tmf-btn-del" onclick="tmfKartSil(' + k.id + ')">Sil</button>';
                h += '</div></div>';
            });
            grid.innerHTML = h;
            // Drag-drop reorder
            var dragSrcId = null;
            function dragHandler(ev) {
                var card = ev.target.closest('.tmf-kart');
                if (!card) return;
                var id = parseInt(card.getAttribute('data-id'));
                if (ev.type === 'dragstart') { dragSrcId = id; card.classList.add('tmf-dragging'); ev.dataTransfer.effectAllowed = 'move'; }
                if (ev.type === 'dragend') { card.classList.remove('tmf-dragging'); document.querySelectorAll('.tmf-drag-over').forEach(function(e) { e.classList.remove('tmf-drag-over'); }); dragSrcId = null; }
                if (ev.type === 'dragenter') { ev.preventDefault(); if (id !== dragSrcId) card.classList.add('tmf-drag-over'); }
                if (ev.type === 'dragleave') { card.classList.remove('tmf-drag-over'); }
                if (ev.type === 'dragover') { ev.preventDefault(); }
                if (ev.type === 'drop') {
                    ev.preventDefault();
                    card.classList.remove('tmf-drag-over');
                    if (dragSrcId === null || dragSrcId === id) return;
                    var db = tmfVeriYukle();
                    var fromIdx = -1, toIdx = -1;
                    db.kartlar.forEach(function(k, i) { if (k.id === dragSrcId) fromIdx = i; if (k.id === id) toIdx = i; });
                    if (fromIdx === -1 || toIdx === -1) return;
                    var item = db.kartlar.splice(fromIdx, 1)[0];
                    db.kartlar.splice(toIdx, 0, item);
                    tmfVeriKaydet(db);
                    tmfSayfayiYukle();
                }
            }
            if (!grid._tmfDragInit) {
                grid._tmfDragInit = true;
                ['dragstart','dragend','dragenter','dragleave','dragover','drop'].forEach(function(et) { grid.addEventListener(et, dragHandler); });
            }
        }

        function tmfKartHesapla(id) {
            const db = tmfVeriYukle();
            const kart = db.kartlar.find(k => k.id === id);
            if (!kart) return;
            const input = document.getElementById("tmfHesapInput_" + id);
            if (!input) return;
            const miktarStr = input.value.trim();
            if (!miktarStr) {
                const sEl = document.getElementById("tmfHesapSonuc_" + id);
                const iEl = document.getElementById("tmfHesapIslem_" + id);
                if (sEl) sEl.textContent = "—";
                if (iEl) iEl.textContent = "";
                return;
            }
            const miktar = tmfDegerCoz(miktarStr);
            if (miktar <= 0) {
                const sEl = document.getElementById("tmfHesapSonuc_" + id);
                const iEl = document.getElementById("tmfHesapIslem_" + id);
                if (sEl) sEl.textContent = "0,00 ₺";
                if (iEl) iEl.textContent = "";
                return;
            }
            const sEl = document.getElementById("tmfHesapSonuc_" + id);
            const iEl = document.getElementById("tmfHesapIslem_" + id);
            if (kart.tip === "sabit") {
                const f = tmfDegerCoz(kart.sabitFiyat);
                if (sEl) sEl.textContent = tmfFmt(f) + ' \u20BA';
                if (iEl) iEl.textContent = "Sabit fiyat × 1";
            } else if (kart.tip === "birim") {
                const bf = tmfDegerCoz(kart.birimFiyat);
                const t = miktar * bf;
                if (sEl) sEl.textContent = tmfFmt(t) + ' \u20BA';
                if (iEl) iEl.textContent = tmfFmt(bf) + ' \u20BA × ' + tmfFmt(miktar) + ' ' + kart.birim;
            } else if (kart.tip === "kademeli" && kart.kademeler) {
                let eslesen = null;
                for (let i = 0; i < kart.kademeler.length; i++) {
                    const kd = kart.kademeler[i];
                    const min = tmfDegerCoz(kd.min);
                    const max = kd.max === "+" ? Infinity : tmfDegerCoz(kd.max);
                    if (miktar >= min && miktar <= max) { eslesen = kd; break; }
                }
                if (eslesen) {
                    const bf = tmfDegerCoz(eslesen.fiyat);
                    const t = miktar * bf;
                    if (sEl) sEl.textContent = tmfFmt(t) + ' \u20BA';
                    if (iEl) iEl.textContent = tmfFmt(bf) + ' \u20BA × ' + tmfFmt(miktar) + ' ' + kart.birim;
                } else {
                    if (sEl) sEl.innerHTML = 'ARALIK DIŞI';
                    if (iEl) iEl.textContent = "";
                }
            }
        }

        function tmfKartEkle() {
            const db = tmfVeriYukle();
            tmPrompt("Kart adı:", function(ad) {
                if (!ad || ad.trim() === "") return;
                ad = ad.trim();
                const yeniId = db.sonrakiId++;
                db.kartlar.push({ id: yeniId, ad: ad, tip: "birim", birim: "m²", not: "", birimFiyat: "" });
                tmfVeriKaydet(db);
                tmfSayfayiYukle();
                tmNotify("Kart eklendi: " + ad, "success");
            });
        }

        function tmfKartSil(id) {
            const db = tmfVeriYukle();
            const kart = db.kartlar.find(k => k.id === id);
            if (!kart) return;
            tmConfirm('"' + kart.ad + '" kartını silmek istediğinize emin misiniz?', function() {
                db.kartlar = db.kartlar.filter(k => k.id !== id);
                tmfVeriKaydet(db);
                tmfSayfayiYukle();
                tmNotify("Kart silindi.", "success");
            });
        }

        function tmfKartDuzenle(id) {
            tmfEditId = id;
            const db = tmfVeriYukle();
            const kart = db.kartlar.find(k => k.id === id);
            if (!kart) return;
            const modal = document.getElementById("tmfKartModal");
            const icerik = document.getElementById("tmfKartModalIcerik");
            if (!modal || !icerik) return;
            let h = '<div class="tmf-modal-header"><h3><i class="fa-regular fa-pen-to-square"></i> Kart Düzenle</h3><button class="tmf-modal-close" onclick="tmfKartModalKapat()"><i class="fa-solid fa-xmark"></i></button></div>';
            h += '<div class="tmf-modal-body">';
            h += '<div class="tmf-modal-field"><label>Kart Adı</label><input type="text" id="tmfModalAd" value="' + esc(kart.ad) + '"></div>';
            h += '<div class="tmf-modal-field"><label>Fiyat Türü</label><select id="tmfModalTip" onchange="tmfModalTipDegisti()"><option value="birim"' + (kart.tip==="birim"?' selected':'') + '>Birim Fiyat</option><option value="kademeli"' + (kart.tip==="kademeli"?' selected':'') + '><i class="fa-solid fa-ruler-combined"></i> Kademeli Fiyat</option></select></div>';
            h += '<div class="tmf-modal-field"><label>Birim Türü</label><input type="text" id="tmfModalBirim" value="' + esc(kart.birim) + '" placeholder="m², adet, ay, saat..."></div>';
            h += '<div id="tmfModalDinamikAlan"></div>';
            h += '<div class="tmf-modal-field"><label>Not (isteğe bağlı)</label><textarea id="tmfModalNot" placeholder="Bu kartla ilgili notlar...">' + esc(kart.not || "") + '</textarea></div>';
            h += '</div>';
            h += '<div class="tmf-modal-actions"><button class="tmf-modal-btn tmf-modal-btn-save" onclick="tmfKartModalKaydet()"><i class="fa-solid fa-floppy-disk"></i> Kaydet</button><button class="tmf-modal-btn tmf-modal-btn-cancel" onclick="tmfKartModalKapat()">İptal</button></div>';
            icerik.innerHTML = h;
            modal.style.display = "flex";
            tmfModalTipDegisti();
        }

        function tmfModalTipDegisti() {
            const tip = document.getElementById("tmfModalTip").value;
            const alan = document.getElementById("tmfModalDinamikAlan");
            if (!alan) return;
            const db = tmfVeriYukle();
            const kart = db.kartlar.find(k => k.id === tmfEditId);
            if (!kart) return;
            let h = "";
            if (tip === "sabit") {
                h += '<div class="tmf-modal-field"><label>Sabit Fiyat (?)</label><input type="text" id="tmfModalSabit" value="' + esc(kart.sabitFiyat || "") + '" placeholder="Örn: 5000"></div>';
            } else if (tip === "birim") {
                h += '<div class="tmf-modal-field"><label>Birim Fiyat (?)</label><input type="text" id="tmfModalBirimFiyat" value="' + esc(kart.birimFiyat || "") + '" placeholder="Örn: 500"></div>';
            } else if (tip === "kademeli") {
                const kd = kart.kademeler && kart.kademeler.length > 0 ? kart.kademeler : [{ min: "", max: "", fiyat: "" }];
                h += '<div class="tmf-modal-kademeler"><label style="font-size:9px; font-weight:700; color:#7a94ad; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px; display:block;">Fiyat Kademeleri</label>';
                h += '<table><thead><tr><th style="min-width:110px;">A\u00e7\u0131klama</th><th style="width:60px;">Min</th><th style="width:60px;">Max</th><th style="width:55px;">Fiyat</th><th style="width:30px;"></th></tr></thead><tbody id="tmfKademeTbody">';
                kd.forEach((k, i) => {
                    h += '<tr>';
                    h += '<td><input class="tmf-kd-aciklama" type="text" value="' + esc(k.aciklama || "") + '" placeholder="A\u00e7\u0131klama"></td>';
                    h += '<td><input class="tmf-kd-min" type="text" value="' + esc(k.min) + '" placeholder="0"></td>';
                    h += '<td><input class="tmf-kd-max" type="text" value="' + esc(k.max) + '" placeholder="100"></td>';
                    h += '<td><input class="tmf-kd-fiyat" type="text" value="' + esc(k.fiyat) + '" placeholder="Fiyat"></td>';
                    h += '<td>' + (kd.length > 1 ? '<button class="tmf-btn-kd-sil" onclick="this.closest(\'tr\').remove()"><i class="fa-solid fa-xmark"></i></button>' : '') + '</td>';
                    h += '</tr>';
                });
                h += '</tbody></table>';
                h += '<button class="tmf-btn-kd-ekle" onclick="tmfKademeEkle()">+ Kademe Ekle</button></div>';
            }
            alan.innerHTML = h;
        }

        function tmfKademeEkle() {
            const tbody = document.getElementById("tmfKademeTbody");
            if (!tbody) return;
            const tr = document.createElement("tr");
            tr.innerHTML = '<td><input class="tmf-kd-aciklama" type="text" value="" placeholder="A\u00e7\u0131klama"></td><td><input class="tmf-kd-min" type="text" value="" placeholder="0"></td><td><input class="tmf-kd-max" type="text" value="" placeholder="100"></td><td><input class="tmf-kd-fiyat" type="text" value="" placeholder="Fiyat"></td><td><button class="tmf-btn-kd-sil" onclick="this.closest(\'tr\').remove()"><i class="fa-solid fa-xmark"></i></button></td>';
            tbody.appendChild(tr);
        }

        function tmfKartModalKaydet() {
            const db = tmfVeriYukle();
            const kart = db.kartlar.find(k => k.id === tmfEditId);
            if (!kart) return;
            const ad = document.getElementById("tmfModalAd");
            const tip = document.getElementById("tmfModalTip");
            const birim = document.getElementById("tmfModalBirim");
            const notEl = document.getElementById("tmfModalNot");
            if (!ad || !tip || !birim) return;
            if (!ad.value.trim()) { tmNotify("Kart adı boş olamaz.", "error"); return; }
            kart.ad = ad.value.trim();
            kart.tip = tip.value;
            kart.birim = birim.value.trim() || "—";
            kart.not = notEl ? notEl.value : "";
            if (kart.tip === "sabit") {
                const s = document.getElementById("tmfModalSabit");
                kart.sabitFiyat = s ? s.value : "";
                delete kart.birimFiyat;
                delete kart.kademeler;
            } else if (kart.tip === "birim") {
                const b = document.getElementById("tmfModalBirimFiyat");
                kart.birimFiyat = b ? b.value : "";
                delete kart.sabitFiyat;
                delete kart.kademeler;
            } else if (kart.tip === "kademeli") {
                const tbody = document.getElementById("tmfKademeTbody");
                if (tbody) {
                    const rows = tbody.querySelectorAll("tr");
                    kart.kademeler = [];
                    rows.forEach(function(tr) {
                        const inputs = tr.querySelectorAll("input");
                        if (inputs.length >= 4) {
                            kart.kademeler.push({ aciklama: inputs[0].value, min: inputs[1].value, max: inputs[2].value, fiyat: inputs[3].value });
                        }
                    });
                }
                delete kart.sabitFiyat;
                delete kart.birimFiyat;
            }
            tmfVeriKaydet(db);
            tmfKartModalKapat();
            tmfSayfayiYukle();
            tmNotify("Kart kaydedildi.", "success");
        }

        function tmfKartModalKapat() {
            const modal = document.getElementById("tmfKartModal");
            if (modal) modal.style.display = "none";
            tmfEditId = null;
        }

        /* ==================== FATURA TAKİP SİSTEMİ ==================== */
        /* ==================== FATURA TAKİP SİSTEMİ ==================== */
        const FT_DB_KEY = "tm_fatura_takip_db";

        function ftDbYukle() {
            try { if(localStorage.getItem("tm_ft_clean") !== "v1.0.0") {
                localStorage.removeItem(FT_DB_KEY);
                origSetItem("tm_ft_clean", "v1.0.0");
            } } catch(e) { console.error("Fatura db temizlik hatasi:", e); }
            var db;
            try { db = JSON.parse(localStorage.getItem(FT_DB_KEY)); } catch(e) { db = null; console.error("Fatura db yukleme hatasi:", e); }
            if (!db || !db.yillar) db = { aktifYil: new Date().getFullYear(), yillar: {} };
            var y = String(db.aktifYil);
            if (!db.yillar[y]) db.yillar[y] = { gelenFaturalar: [], gidenFaturalar: [], vergiEtkinlikleri: [] };
            return db;
        }
        function ftDbKaydet(db) { try { localStorage.setItem(FT_DB_KEY, JSON.stringify(db)); } catch(e) { console.error("Fatura db kaydetme hatasi:", e); } }
        function ftYilVerisi() {
            var db = ftDbYukle();
            var y = String(db.aktifYil);
            if (!db.yillar[y]) db.yillar[y] = { gelenFaturalar: [], gidenFaturalar: [], vergiEtkinlikleri: [], odenmisVergiler: [] };
            if (!db.yillar[y].odenmisVergiler) db.yillar[y].odenmisVergiler = [];
            return { db: db, yil: db.aktifYil, data: db.yillar[y] };
        }

        function ftOtomatikEtkinlikleriEkle(yil) {
            var db = ftDbYukle();
            var y = String(yil);
            if (!db.yillar[y]) db.yillar[y] = { gelenFaturalar: [], gidenFaturalar: [], vergiEtkinlikleri: [], odenmisVergiler: [] };
            if (db.yillar[y]._otomatikEklendi) return;
            var etkinlikler = db.yillar[y].vergiEtkinlikleri || [];
            var maxId = 0;
            etkinlikler.forEach(function(e){ if (typeof e.id === "number" && e.id > maxId) maxId = e.id; });
            var yeni = [];
            var aylar = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
            for (var a = 0; a < 11; a++) {
                maxId++;
                yeni.push({ id: maxId, baslik: "KDV Beyannamesi (" + aylar[a] + ")", tur: "KDV", tarih: yil + "-" + (a<9?"0":"") + (a+2) + "-26", aciklama: "KDV beyannamesi verilecek", tamamlandi: false, otomatik: true });
            }
            var gv = [
                { baslik:"Geçici Vergi 1. Dönem (Ocak-Şubat-Mart)", ay:5, gun:14 },
                { baslik:"Geçici Vergi 2. Dönem (Nisan-Mayıs-Haziran)", ay:8, gun:14 },
                { baslik:"Geçici Vergi 3. Dönem (Temmuz-Ağustos-Eylül)", ay:11, gun:14 }
            ];
            gv.forEach(function(g) {
                maxId++;
                yeni.push({ id: maxId, baslik: g.baslik, tur: "Kurumlar Vergisi", tarih: yil + "-" + (g.ay<10?"0":"") + g.ay + "-" + (g.gun<10?"0":"") + g.gun, aciklama: "Geçici vergi beyannamesi verilecek", tamamlandi: false, otomatik: true });
            });
            maxId++;
            yeni.push({ id: maxId, baslik: "Yıllık Gelir Vergisi Beyannamesi", tur: "Gelir Vergisi", tarih: yil + "-03-31", aciklama: "Bir önceki yılın gelir vergisi beyannamesi verilecek", tamamlandi: false, otomatik: true });
            maxId++;
            yeni.push({ id: maxId, baslik: "Kurumlar Vergisi Beyannamesi", tur: "Kurumlar Vergisi", tarih: yil + "-04-30", aciklama: "Bir önceki yılın kurumlar vergisi beyannamesi verilecek", tamamlandi: false, otomatik: true });
            db.yillar[y].vergiEtkinlikleri = etkinlikler.concat(yeni);
            db.yillar[y]._otomatikEklendi = true;
            origSetItem(FT_DB_KEY, JSON.stringify(db));
        }

        function faturaSayfayiYukle() {
            var yv = ftYilVerisi();
            var sec = document.getElementById("ftYilSec");
            if (sec) {
                var simdi = new Date().getFullYear();
                sec.innerHTML = "";
                for (var y = simdi - 15; y <= simdi + 15; y++) {
                    var o = document.createElement("option");
                    o.value = y; o.textContent = y;
                    if (y === yv.yil) o.selected = true;
                    sec.appendChild(o);
                }
                var ekle = document.createElement("option");
                ekle.value = "ozel";
                ekle.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> Özel Yıl...';
                sec.appendChild(ekle);
            }
            var vtSpan = document.getElementById("ftOdenenVergiTurleri");
            if (vtSpan) vtSpan.innerText = "(" + SABIT_VERGI_TURLERI.join(", ") + ")";
            var tg = document.getElementById("ftTarihGoster");
            if (tg) { var n = new Date(); tg.innerText = n.getDate() + " " + ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"][n.getMonth()] + " " + n.getFullYear(); }
            ftOtomatikEtkinlikleriEkle(parseInt(yv.yil));
            ftGelenGoster(); ftGidenGoster(); ftKdvGoster(); ftOdenenVergiGoster(); ftTakvimGoster(); faturaOzetGuncelle();
        }

        function faturaYilDegistir(yil) {
            function _faturaYilAyarla(vyil) {
                var sec = document.getElementById("ftYilSec");
                if (sec) {
                    var mevcut = false;
                    for (var i = 0; i < sec.options.length; i++) { if (sec.options[i].value == vyil) { mevcut = true; break; } }
                    if (!mevcut) {
                        var o = document.createElement("option");
                        o.value = vyil; o.textContent = vyil;
                        sec.insertBefore(o, sec.lastElementChild);
                    }
                    sec.value = vyil;
                }
                var db = ftDbYukle();
                db.aktifYil = vyil;
                var y = String(vyil);
                if (!db.yillar[y]) db.yillar[y] = { gelenFaturalar: [], gidenFaturalar: [], vergiEtkinlikleri: [], odenmisVergiler: [] };
                ftDbKaydet(db);
                faturaSayfayiYukle();
            }
            if (yil === "ozel") {
                tmPrompt("Gitmek istediğiniz yılı giriniz (ör: 2025):", function(girilen) {
                    if (!girilen || isNaN(parseInt(girilen))) { faturaSayfayiYukle(); return; }
                    _faturaYilAyarla(parseInt(girilen));
                });
            } else {
                _faturaYilAyarla(parseInt(yil));
            }
        }

        function faturaOzetGuncelle() {
            var yv = ftYilVerisi();
            var gelen = yv.data.gelenFaturalar || [], giden = yv.data.gidenFaturalar || [];
            var odenmis = yv.data.odenmisVergiler || [];
            var gk = 0, gk2 = 0, ovTop = 0, odenmisKdv = 0;
            gelen.forEach(function(f){ gk += f.kdvTutari||0; });
            giden.forEach(function(f){ gk2 += f.kdvTutari||0; });
            odenmis.forEach(function(v){
                ovTop += v.tutar||0;
                if (v.vergiAdi === "KDV") odenmisKdv += v.tutar||0;
            });
            document.getElementById("ftGelenAdet").innerText = gelen.length + " adet";
            document.getElementById("ftGidenAdet").innerText = giden.length + " adet";
            document.getElementById("ftGelenKdv").innerText = tmTl(gk);
            document.getElementById("ftGidenKdv").innerText = tmTl(gk2);
            var fark = gk2 - gk;
            var kdvNet, netKart = document.getElementById("ftKdvNetKart"), netIco = document.getElementById("ftKdvNetIco"), netLbl = document.getElementById("ftKdvNetLbl"), netVal = document.getElementById("ftKdvNet");
            if (fark >= 0) {
                var net = fark - odenmisKdv;
                if (net >= 0) {
                    kdvNet = net;
                    netKart.className = "ft-ozet-card card-kdv-net kdv-odenecek";
                    netIco.innerHTML = '<i class="fa-solid fa-circle" style="color:#C0392B"></i>';
                    netLbl.innerText = "KDV Ödenecek";
                    netVal.style.color = "var(--accent-red)";
                } else {
                    kdvNet = -net;
                    netKart.className = "ft-ozet-card card-kdv-net kdv-alacak";
                    netIco.innerHTML = '<i class="fa-solid fa-circle" style="color:#2E7D32"></i>';
                    netLbl.innerText = "KDV Alacak (+ fazla ödeme)";
                    netVal.style.color = "var(--btn-green)";
                }
            } else {
                kdvNet = -fark;
                netKart.className = "ft-ozet-card card-kdv-net kdv-alacak";
                netIco.innerHTML = '<i class="fa-solid fa-circle" style="color:#2E7D32"></i>';
                netLbl.innerText = "KDV Alacak";
                netVal.style.color = "var(--btn-green)";
            }
            var isaret = netKart.className.indexOf("kdv-odenecek") !== -1 ? "- " : "+ ";
            netVal.innerText = isaret + tmTl(kdvNet);
            var ovEl = document.getElementById("ftOdenenVergiToplam");
            if (ovEl) ovEl.innerText = tmTl(ovTop);
        }

        /* ---------- Gelen Faturalar ---------- */
        function ftGelenFormAc(id) {
            var yv = ftYilVerisi();
            var f = id ? yv.data.gelenFaturalar.find(function(x){return x.id===id;}) : null;
            var form = document.getElementById("ftGelenForm");
            if (!form) return;
            var isEdit = !!f;
            var fn = isEdit ? "ftGelenKaydet("+id+")" : "ftGelenKaydet()";
            var tutarVal = f ? (f.tutar||0).toLocaleString('tr-TR',{minimumFractionDigits:2}) : '';
            form.style.display = "flex";
            form.innerHTML = '<div style="width:100%;">' +
                '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:10px;">' +
                '<div style="flex:2;min-width:180px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Firma Adı</label><input type="text" id="ftGelenFirma" value="'+(f?f.firmaAdi:'')+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;text-transform:uppercase;" oninput="this.value=this.value.toUpperCase()"></div>' +
                '<div style="flex:1;min-width:120px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Fatura No</label><input type="text" id="ftGelenFaturaNo" value="'+(f?f.faturaNo:'')+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;"></div>' +
                '<div style="flex:1;min-width:120px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Fatura Tarihi</label><input type="date" id="ftGelenTarih" value="'+(f?f.faturaTarihi:anlikTarihGetir())+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;"></div>' +
                '<div style="flex:1;min-width:120px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Vade</label><input type="date" id="ftGelenVade" value="'+(f?f.vadeTarihi:'')+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;"></div>' +
                '</div>' +
                '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:10px;">' +
                '<div style="flex:1;min-width:140px;text-align:center;"><label style="display:block;text-align:center;width:100%;">TUTAR (₺)</label><input type="text" id="ftGelenTutar" value="'+tutarVal+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;font-weight:700;" onfocus="tmTutarFocus(this)" oninput="tmTutarFormatla(this)" onblur="tmTutarBlur(this)"></div>' +
                '<div style="flex:0 0 90px;text-align:center;"><label style="display:block;text-align:center;width:100%;">KDV %</label><select id="ftGelenKdvOran" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;"><option value="0"'+(f&&f.kdvOrani==0?" selected":"")+'>%0</option><option value="10"'+(f&&f.kdvOrani==10?" selected":"")+'>%10</option><option value="20"'+(f&&f.kdvOrani==20?" selected":"")+'>%20</option></select></div>' +
                '<div style="flex:1;min-width:120px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Vergi D.</label><input type="text" id="ftGelenVergiD" value="'+(f?f.vergiDairesi:'')+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;text-transform:uppercase;" oninput="this.value=this.value.toUpperCase()"></div>' +
                '<div style="flex:1;min-width:100px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Vergi No</label><input type="text" id="ftGelenVergiNo" value="'+(f?f.vergiNo:'')+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;"></div>' +
                '<div style="flex:1;min-width:110px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Durum</label><select id="ftGelenDurum" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;"><option value="odenmedi"'+(f&&f.odemeDurumu=="odenmedi"?" selected":"")+'>Ödenmedi</option><option value="kismi"'+(f&&f.odemeDurumu=="kismi"?" selected":"")+'>Kısmi</option><option value="odendi"'+(f&&f.odemeDurumu=="odendi"?" selected":"")+'>Ödendi</option></select></div>' +
                '<div style="flex:1;min-width:110px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Ödeme T.</label><input type="date" id="ftGelenOdemeTarih" value="'+(f?f.odemeTarihi:'')+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;"></div>' +
                '</div>' +
                '<div style="display:flex;gap:8px;justify-content:center;padding-top:6px;">' +
                '<button class="btn-form btn-form-save" onclick="'+fn+'" style="padding:8px 20px;font-size:13px;"><i class="fa-solid fa-floppy-disk"></i> '+(isEdit?"Güncelle":"Ekle")+'</button>' +
                '<button class="btn-form btn-form-cancel" onclick="document.getElementById(\'ftGelenForm\').style.display=\'none\'" style="padding:8px 20px;font-size:13px;"><i class="fa-solid fa-xmark"></i> İptal</button></div></div>';
        }

        function ftGelenKaydet(id) {
            var firma = (document.getElementById("ftGelenFirma").value || "").trim();
            if (!firma) { tmNotify("Firma adı giriniz!", "error"); return; }
            var f = {
                firmaAdi: firma,
                faturaNo: document.getElementById("ftGelenFaturaNo").value.trim(),
                faturaTarihi: document.getElementById("ftGelenTarih").value,
                vadeTarihi: document.getElementById("ftGelenVade").value,
                tutar: tmTutarCoz(document.getElementById("ftGelenTutar").value),
                kdvOrani: parseInt(document.getElementById("ftGelenKdvOran").value),
                vergiDairesi: document.getElementById("ftGelenVergiD").value.trim(),
                vergiNo: document.getElementById("ftGelenVergiNo").value.trim(),
                odemeDurumu: document.getElementById("ftGelenDurum").value,
                odemeTarihi: document.getElementById("ftGelenOdemeTarih").value
            };
            if (f.tutar <= 0) { tmNotify("Geçerli tutar giriniz!", "error"); return; }
            f.kdvTutari = f.tutar * f.kdvOrani / 100;
            f.toplamTutar = f.tutar + f.kdvTutari;
            var yv = ftYilVerisi();
            if (id) {
                var idx = yv.data.gelenFaturalar.findIndex(function(x){return x.id===id;});
                if (idx !== -1) { f.id = id; yv.data.gelenFaturalar[idx] = f; }
            } else {
                f.id = (yv.data.gelenFaturalar.reduce(function(m,x){return Math.max(m,x.id);},0)) + 1;
                yv.data.gelenFaturalar.push(f);
            }
            ftDbKaydet(yv.db);
            document.getElementById("ftGelenForm").style.display = "none";
            ftGelenGoster(); ftKdvGoster(); faturaOzetGuncelle();
            tmNotify(id ? "Gelen fatura güncellendi." : "Gelen fatura eklendi.", "success");
            aktiviteEkle((id ? "Gelen fatura güncellendi: " : "Gelen fatura eklendi: ") + firma, "Muhasebe");
        }

        function ftGelenSil(id) {
            tmConfirm("Bu faturayı silmek istediğinize emin misiniz?", function() {
                var yv = ftYilVerisi();
                var silinen = yv.data.gelenFaturalar.find(function(x){return x.id === id;});
                yv.data.gelenFaturalar = yv.data.gelenFaturalar.filter(function(x){return x.id !== id;});
                ftDbKaydet(yv.db);
                ftGelenGoster(); ftKdvGoster(); faturaOzetGuncelle();
                tmNotify("Gelen fatura silindi.", "success");
                aktiviteEkle("Gelen fatura silindi: " + (silinen ? silinen.firmaAdi : ""), "Muhasebe");
            });
        }

        function ftGelenGoster() {
            var yv = ftYilVerisi();
            var liste = yv.data.gelenFaturalar || [];
            var konteyner = document.getElementById("ftGelenTablosu");
            if (!konteyner) return;
            var sayac = document.getElementById("ftGelenSayac");
            if (sayac) sayac.innerText = liste.length + " kayıt";
            if (!liste.length) { konteyner.innerHTML = tmEmptyStateHTML('<i class="fa-solid fa-inbox"></i>','Henüz gelen fatura bulunmamaktadır.','Yeni bir gelen fatura eklemek için "Fatura Ekle" butonunu kullanın.'); return; }
            var h = '<div class="ft-tbl-wrap"><table class="ft-table"><thead><tr><th>Firma</th><th>Fatura No</th><th>Vergi D.</th><th>Vergi No</th><th>Tarih</th><th>Vade</th><th>Tutar</th><th>KDV</th><th>Toplam</th><th>Durum</th><th>Ödeme T.</th><th></th></tr></thead><tbody>';
            liste.slice().reverse().forEach(function(f) {
                var dc = f.odemeDurumu, dt = dc==="odendi"?"Ödendi":dc==="kismi"?"Kısmi":"Ödenmedi";
                h += '<tr data-ftgelen="'+(f.firmaAdi||"").toLowerCase()+' '+(f.faturaNo||"").toLowerCase()+'">';
                h += '<td style="font-weight:600;">'+esc(f.firmaAdi)+'</td><td>'+esc(f.faturaNo)+'</td>';
                h += '<td style="font-size:11px;color:var(--text-light);">'+esc(f.vergiDairesi)+'</td><td style="font-size:11px;">'+esc(f.vergiNo)+'</td>';
                h += '<td style="font-size:11px;">'+(f.faturaTarihi?tarihStr(f.faturaTarihi):"-")+'</td><td style="font-size:11px;">'+(f.vadeTarihi?tarihStr(f.vadeTarihi):"-")+'</td>';
                h += '<td style="text-align:right;">'+tmTl(f.tutar)+'</td><td style="text-align:right;">'+tmTl(f.kdvTutari)+'</td><td style="text-align:right;font-weight:700;">'+tmTl(f.toplamTutar)+'</td>';
                h += '<td><span class="ft-badge '+dc+'">'+dt+'</span></td><td style="font-size:11px;">'+(f.odemeTarihi?tarihStr(f.odemeTarihi):"-")+'</td>';
                h += '<td><button class="ft-btn-sm ft-btn-edit" onclick="ftGelenFormAc('+f.id+')"><i class="fa-regular fa-pen-to-square"></i></button> <button class="ft-btn-sm ft-btn-del" onclick="ftGelenSil('+f.id+')"><i class="fa-solid fa-trash-can"></i></button></td></tr>';
            });
            h += '</tbody></table></div>';
            konteyner.innerHTML = h;
        }

        function ftGelenFiltrele() {
            var q = (document.getElementById("ftGelenArama").value || "").toLowerCase().trim();
            var tbody = document.querySelector("#ftGelenTablosu table tbody");
            if (!tbody) return;
            tbody.querySelectorAll("tr").forEach(function(s) {
                s.style.display = ((s.getAttribute("data-ftgelen")||"").indexOf(q) !== -1) ? "" : "none";
            });
        }

        /* ---------- Giden Faturalar ---------- */
        function ftGidenFormAc(id) {
            var yv = ftYilVerisi();
            var f = id ? yv.data.gidenFaturalar.find(function(x){return x.id===id;}) : null;
            var form = document.getElementById("ftGidenForm");
            if (!form) return;
            var isEdit = !!f;
            var fn = isEdit ? "ftGidenKaydet("+id+")" : "ftGidenKaydet()";
            var tutarVal = f ? (f.tutar||0).toLocaleString('tr-TR',{minimumFractionDigits:2}) : '';
            form.style.display = "flex";
            form.innerHTML = '<div style="width:100%;">' +
                '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:10px;">' +
                '<div style="flex:2;min-width:180px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Firma Adı</label><input type="text" id="ftGidenFirma" value="'+(f?f.firmaAdi:'')+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;text-transform:uppercase;" oninput="this.value=this.value.toUpperCase()"></div>' +
                '<div style="flex:1;min-width:120px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Fatura No</label><input type="text" id="ftGidenFaturaNo" value="'+(f?f.faturaNo:'')+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;"></div>' +
                '<div style="flex:1;min-width:120px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Fatura Tarihi</label><input type="date" id="ftGidenTarih" value="'+(f?f.faturaTarihi:anlikTarihGetir())+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;"></div>' +
                '<div style="flex:1;min-width:120px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Vade</label><input type="date" id="ftGidenVade" value="'+(f?f.vadeTarihi:'')+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;"></div>' +
                '</div>' +
                '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:10px;">' +
                '<div style="flex:1;min-width:140px;text-align:center;"><label style="display:block;text-align:center;width:100%;">TUTAR (₺)</label><input type="text" id="ftGidenTutar" value="'+tutarVal+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;font-weight:700;" onfocus="tmTutarFocus(this)" oninput="tmTutarFormatla(this)" onblur="tmTutarBlur(this)"></div>' +
                '<div style="flex:0 0 90px;text-align:center;"><label style="display:block;text-align:center;width:100%;">KDV %</label><select id="ftGidenKdvOran" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;"><option value="0"'+(f&&f.kdvOrani==0?" selected":"")+'>%0</option><option value="10"'+(f&&f.kdvOrani==10?" selected":"")+'>%10</option><option value="20"'+(f&&f.kdvOrani==20?" selected":"")+'>%20</option></select></div>' +
                '<div style="flex:1;min-width:120px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Vergi D.</label><input type="text" id="ftGidenVergiD" value="'+(f?f.vergiDairesi:'')+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;text-transform:uppercase;" oninput="this.value=this.value.toUpperCase()"></div>' +
                '<div style="flex:1;min-width:100px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Vergi No</label><input type="text" id="ftGidenVergiNo" value="'+(f?f.vergiNo:'')+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;"></div>' +
                '<div style="flex:1;min-width:120px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Durum</label><select id="ftGidenDurum" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;"><option value="tahsilEdilmedi"'+(f&&f.tahsilatDurumu=="tahsilEdilmedi"?" selected":"")+'>Tahsil Edilmedi</option><option value="kismi"'+(f&&f.tahsilatDurumu=="kismi"?" selected":"")+'>Kısmi</option><option value="tahsilEdildi"'+(f&&f.tahsilatDurumu=="tahsilEdildi"?" selected":"")+'>Tahsil Edildi</option></select></div>' +
                '<div style="flex:1;min-width:110px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Tahsilat T.</label><input type="date" id="ftGidenTahsilatTarih" value="'+(f?f.tahsilatTarihi:'')+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;"></div>' +
                '</div>' +
                '<div style="display:flex;gap:8px;justify-content:center;padding-top:6px;">' +
                '<button class="btn-form btn-form-save" onclick="'+fn+'" style="padding:8px 20px;font-size:13px;"><i class="fa-solid fa-floppy-disk"></i> '+(isEdit?"Güncelle":"Ekle")+'</button>' +
                '<button class="btn-form btn-form-cancel" onclick="document.getElementById(\'ftGidenForm\').style.display=\'none\'" style="padding:8px 20px;font-size:13px;"><i class="fa-solid fa-xmark"></i> İptal</button></div></div>';
        }

        function ftGidenKaydet(id) {
            var firma = (document.getElementById("ftGidenFirma").value || "").trim();
            if (!firma) { tmNotify("Firma adı giriniz!", "error"); return; }
            var f = {
                firmaAdi: firma,
                faturaNo: document.getElementById("ftGidenFaturaNo").value.trim(),
                faturaTarihi: document.getElementById("ftGidenTarih").value,
                vadeTarihi: document.getElementById("ftGidenVade").value,
                tutar: tmTutarCoz(document.getElementById("ftGidenTutar").value),
                kdvOrani: parseInt(document.getElementById("ftGidenKdvOran").value),
                vergiDairesi: document.getElementById("ftGidenVergiD").value.trim(),
                vergiNo: document.getElementById("ftGidenVergiNo").value.trim(),
                tahsilatDurumu: document.getElementById("ftGidenDurum").value,
                tahsilatTarihi: document.getElementById("ftGidenTahsilatTarih").value
            };
            if (f.tutar <= 0) { tmNotify("Geçerli tutar giriniz!", "error"); return; }
            f.kdvTutari = f.tutar * f.kdvOrani / 100;
            f.toplamTutar = f.tutar + f.kdvTutari;
            var yv = ftYilVerisi();
            if (id) {
                var idx = yv.data.gidenFaturalar.findIndex(function(x){return x.id===id;});
                if (idx !== -1) { f.id = id; yv.data.gidenFaturalar[idx] = f; }
            } else {
                f.id = (yv.data.gidenFaturalar.reduce(function(m,x){return Math.max(m,x.id);},0)) + 1;
                yv.data.gidenFaturalar.push(f);
            }
            ftDbKaydet(yv.db);
            document.getElementById("ftGidenForm").style.display = "none";
            ftGidenGoster(); ftKdvGoster(); faturaOzetGuncelle();
            tmNotify(id ? "Giden fatura güncellendi." : "Giden fatura eklendi.", "success");
            aktiviteEkle((id ? "Giden fatura güncellendi: " : "Giden fatura eklendi: ") + firma, "Muhasebe");
        }

        function ftGidenSil(id) {
            tmConfirm("Bu faturayı silmek istediğinize emin misiniz?", function() {
                var yv = ftYilVerisi();
                var silinen = yv.data.gidenFaturalar.find(function(x){return x.id === id;});
                yv.data.gidenFaturalar = yv.data.gidenFaturalar.filter(function(x){return x.id !== id;});
                ftDbKaydet(yv.db);
                ftGidenGoster(); ftKdvGoster(); faturaOzetGuncelle();
                tmNotify("Giden fatura silindi.", "success");
                aktiviteEkle("Giden fatura silindi: " + (silinen ? silinen.firmaAdi : ""), "Muhasebe");
            });
        }

        function ftGidenGoster() {
            var yv = ftYilVerisi();
            var liste = yv.data.gidenFaturalar || [];
            var konteyner = document.getElementById("ftGidenTablosu");
            if (!konteyner) return;
            var sayac = document.getElementById("ftGidenSayac");
            if (sayac) sayac.innerText = liste.length + " kayıt";
            if (!liste.length) { konteyner.innerHTML = tmEmptyStateHTML('<i class="fa-solid fa-paper-plane"></i>','Henüz giden fatura bulunmamaktadır.','Yeni bir giden fatura eklemek için "Fatura Ekle" butonunu kullanın.'); return; }
            var h = '<div class="ft-tbl-wrap"><table class="ft-table"><thead><tr><th>Firma</th><th>Fatura No</th><th>Vergi D.</th><th>Vergi No</th><th>Tarih</th><th>Vade</th><th>Tutar</th><th>KDV</th><th>Toplam</th><th>Durum</th><th>Tahsilat T.</th><th></th></tr></thead><tbody>';
            liste.slice().reverse().forEach(function(f) {
                var dc = f.tahsilatDurumu, dt = dc==="tahsilEdildi"?"Tah.Edildi":dc==="kismi"?"Kısmi":"Tah.Edilmedi";
                h += '<tr data-ftgiden="'+(f.firmaAdi||"").toLowerCase()+' '+(f.faturaNo||"").toLowerCase()+'">';
                h += '<td style="font-weight:600;">'+esc(f.firmaAdi)+'</td><td>'+esc(f.faturaNo)+'</td>';
                h += '<td style="font-size:11px;color:var(--text-light);">'+esc(f.vergiDairesi)+'</td><td style="font-size:11px;">'+esc(f.vergiNo)+'</td>';
                h += '<td style="font-size:11px;">'+(f.faturaTarihi?tarihStr(f.faturaTarihi):"-")+'</td><td style="font-size:11px;">'+(f.vadeTarihi?tarihStr(f.vadeTarihi):"-")+'</td>';
                h += '<td style="text-align:right;">'+tmTl(f.tutar)+'</td><td style="text-align:right;">'+tmTl(f.kdvTutari)+'</td><td style="text-align:right;font-weight:700;">'+tmTl(f.toplamTutar)+'</td>';
                h += '<td><span class="ft-badge '+dc+'">'+dt+'</span></td><td style="font-size:11px;">'+(f.tahsilatTarihi?tarihStr(f.tahsilatTarihi):"-")+'</td>';
                h += '<td><button class="ft-btn-sm ft-btn-edit" onclick="ftGidenFormAc('+f.id+')"><i class="fa-regular fa-pen-to-square"></i></button> <button class="ft-btn-sm ft-btn-del" onclick="ftGidenSil('+f.id+')"><i class="fa-solid fa-trash-can"></i></button></td></tr>';
            });
            h += '</tbody></table></div>';
            konteyner.innerHTML = h;
        }

        function ftGidenFiltrele() {
            var q = (document.getElementById("ftGidenArama").value || "").toLowerCase().trim();
            var tbody = document.querySelector("#ftGidenTablosu table tbody");
            if (!tbody) return;
            tbody.querySelectorAll("tr").forEach(function(s) {
                s.style.display = ((s.getAttribute("data-ftgiden")||"").indexOf(q) !== -1) ? "" : "none";
            });
        }

        /* ---------- Ödenen Vergiler ---------- */
        function ftDonemSecenekleri(yil, secili) {
            var aylar = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
            var h = '<option value="">Seçiniz</option>';
            aylar.forEach(function(a) {
                var v = yil + "/" + a;
                h += '<option value="'+v+'"'+(v===secili?" selected":"")+'>'+v+' (Aylık)</option>';
            });
            var donemAd = ["1. Dönem (Ocak-Şubat-Mart)","2. Dönem (Nisan-Mayıs-Haziran)","3. Dönem (Temmuz-Ağustos-Eylül)","4. Dönem (Ekim-Kasım-Aralık)"];
            donemAd.forEach(function(d) {
                var v = yil + "/" + d;
                h += '<option value="'+v+'"'+(v===secili?" selected":"")+'>'+v+' (Geçici Vergi)</option>';
            });
            var v = yil + " Yıllık";
            h += '<option value="'+v+'"'+(v===secili?" selected":"")+'>'+v+'</option>';
            return h;
        }

        function ftOdenenVergiFormAc(id) {
            var yv = ftYilVerisi();
            var v = id ? yv.data.odenmisVergiler.find(function(x){return x.id===id;}) : null;
            var form = document.getElementById("ftOdenenVergiForm");
            if (!form) return;
            var isEdit = !!v;
            var fn = isEdit ? "ftOdenenVergiKaydet("+id+")" : "ftOdenenVergiKaydet()";
            var tutarVal = v ? (v.tutar||0).toLocaleString('tr-TR',{minimumFractionDigits:2}) : '';
            var turOpts = SABIT_VERGI_TURLERI.map(function(t){
                var sel = v && v.vergiAdi === t ? " selected" : "";
                return '<option value="'+t+'"'+sel+'>'+t+'</option>';
            }).join('');
            var donemOpts = ftDonemSecenekleri(yv.yil, v?v.donem:"");
            form.style.display = "flex";
            form.innerHTML = '<div style="width:100%;">' +
                '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:10px;">' +
                '<div style="flex:2;min-width:160px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Vergi Adı</label><div style="display:flex;gap:4px;"><select id="ftOdenenVergiAdi" style="flex:1;padding:10px;box-sizing:border-box;text-align:center;">'+turOpts+'</select>' +
                '<button class="btn btn-save-green" title="Tür Ekle" onclick="yeniVergiTuruEklePrompt()" style="min-width:36px;height:42px;font-size:18px;line-height:1;"><i class="fa-solid fa-plus"></i></button>' +
                '<button class="btn btn-danger btn-sm" title="Tür Sil" onclick="vergiTuruSilPrompt()" style="min-width:36px;height:42px;font-size:18px;line-height:1;">?</button></div></div>' +
                '<div style="flex:1;min-width:120px;text-align:center;"><label style="display:block;text-align:center;width:100%;">TUTAR (₺)</label><input type="text" id="ftOdenenVergiTutar" value="'+tutarVal+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;font-weight:700;" onfocus="tmTutarFocus(this)" oninput="tmTutarFormatla(this)" onblur="tmTutarBlur(this)"></div>' +
                '<div style="flex:1;min-width:120px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Ödeme Tarihi</label><input type="date" id="ftOdenenVergiTarih" value="'+(v?v.odemeTarihi:'')+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;"></div>' +
                '<div style="flex:1;min-width:130px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Dönem</label><select id="ftOdenenVergiDonem" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;">'+donemOpts+'</select></div>' +
                '<div style="flex:2;min-width:150px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Açıklama</label><input type="text" id="ftOdenenVergiAciklama" value="'+(v?v.aciklama:'')+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;"></div>' +
                '</div>' +
                '<div style="display:flex;gap:8px;justify-content:center;padding-top:6px;">' +
                '<button class="btn-form btn-form-save" onclick="'+fn+'" style="padding:8px 20px;font-size:13px;"><i class="fa-solid fa-floppy-disk"></i> '+(isEdit?"Güncelle":"Ekle")+'</button>' +
                '<button class="btn-form btn-form-cancel" onclick="document.getElementById(\'ftOdenenVergiForm\').style.display=\'none\'" style="padding:8px 20px;font-size:13px;"><i class="fa-solid fa-xmark"></i> İptal</button></div></div>';
        }

        function ftOdenenVergiKaydet(id) {
            var vergiAdi = document.getElementById("ftOdenenVergiAdi").value;
            var tutar = tmTutarCoz(document.getElementById("ftOdenenVergiTutar").value);
            var odemeTarihi = document.getElementById("ftOdenenVergiTarih").value;
            var donem = document.getElementById("ftOdenenVergiDonem").value.trim();
            var aciklama = document.getElementById("ftOdenenVergiAciklama").value.trim();
            if (tutar <= 0) { tmNotify("Geçerli tutar giriniz!", "error"); return; }
            var yv = ftYilVerisi();
            if (id) {
                var idx = yv.data.odenmisVergiler.findIndex(function(x){return x.id===id;});
                if (idx !== -1) { yv.data.odenmisVergiler[idx] = { id:id, vergiAdi:vergiAdi, tutar:tutar, odemeTarihi:odemeTarihi, donem:donem, aciklama:aciklama }; }
            } else {
                var maxId = yv.data.odenmisVergiler.reduce(function(m,x){return Math.max(m,x.id);},0);
                yv.data.odenmisVergiler.push({ id:maxId+1, vergiAdi:vergiAdi, tutar:tutar, odemeTarihi:odemeTarihi, donem:donem, aciklama:aciklama });
            }
            ftDbKaydet(yv.db);
            document.getElementById("ftOdenenVergiForm").style.display = "none";
            ftOdenenVergiGoster(); faturaOzetGuncelle();
            tmNotify(id ? "Vergi güncellendi." : "Vergi eklendi.", "success");
        }

        function ftOdenenVergiSil(id) {
            tmConfirm("Bu vergi kaydını silmek istediğinize emin misiniz?", function() {
                var yv = ftYilVerisi();
                yv.data.odenmisVergiler = yv.data.odenmisVergiler.filter(function(x){return x.id !== id;});
                ftDbKaydet(yv.db); ftOdenenVergiGoster(); faturaOzetGuncelle();
                tmNotify("Vergi kaydı silindi.", "success");
            });
        }

        function ftOdenenVergiGoster() {
            var yv = ftYilVerisi();
            var liste = yv.data.odenmisVergiler || [];
            var konteyner = document.getElementById("ftOdenenVergiTablosu");
            if (!konteyner) return;
            var sayac = document.getElementById("ftOdenenVergiSayac");
            if (sayac) sayac.innerText = liste.length + " kayıt";
            if (!liste.length) { konteyner.innerHTML = tmEmptyStateHTML('<i class="fa-solid fa-receipt"></i>','Henüz ödenen vergi kaydı bulunmamaktadır.','Ödenen vergi kaydı eklemek için formu kullanın.'); return; }
            var h = '<div class="ft-tbl-wrap"><table class="ft-table"><thead><tr><th>Vergi Adı</th><th>Tutar</th><th>Ödeme Tarihi</th><th>Dönem</th><th>Açıklama</th><th></th></tr></thead><tbody>';
            liste.slice().reverse().forEach(function(v) {
                h += '<tr data-ftodenenv="'+(v.vergiAdi||"").toLowerCase()+'">';
                h += '<td style="font-weight:600;">'+esc(v.vergiAdi)+'</td>';
                h += '<td style="text-align:right;font-weight:700;">'+tmTl(v.tutar)+'</td>';
                h += '<td style="font-size:11px;">'+(v.odemeTarihi?tarihStr(v.odemeTarihi):"-")+'</td>';
                h += '<td style="font-size:11px;">'+(v.donem||"-")+'</td>';
                h += '<td style="font-size:11px;color:var(--text-light);">'+esc(v.aciklama||"")+'</td>';
                h += '<td><button class="ft-btn-sm ft-btn-edit" onclick="ftOdenenVergiFormAc('+v.id+')"><i class="fa-regular fa-pen-to-square"></i></button> <button class="ft-btn-sm ft-btn-del" onclick="ftOdenenVergiSil('+v.id+')"><i class="fa-solid fa-trash-can"></i></button></td></tr>';
            });
            h += '</tbody></table></div>';
            konteyner.innerHTML = h;
        }

        function ftOdenenVergiFiltrele() {
            var q = (document.getElementById("ftOdenenVergiArama").value || "").toLowerCase().trim();
            var tbody = document.querySelector("#ftOdenenVergiTablosu table tbody");
            if (!tbody) return;
            tbody.querySelectorAll("tr").forEach(function(s) {
                s.style.display = ((s.getAttribute("data-ftodenenv")||"").indexOf(q) !== -1) ? "" : "none";
            });
        }

        /* ---------- KDV Takibi ---------- */
        function ftKdvGoster() {
            var yv = ftYilVerisi();
            var gelen = yv.data.gelenFaturalar || [], giden = yv.data.gidenFaturalar || [];
            var aylar = [["Ocak","Şubat","Mart"],["Nisan","Mayıs","Haziran"],["Temmuz","Ağustos","Eylül"],["Ekim","Kasım","Aralık"]];
            var ceyrekAdi = function(d) {
                var p = d.split("-"), y = p[0], m = parseInt(p[1], 10);
                var q = Math.ceil(m / 3);
                return q + ". Dönem (" + aylar[q-1].join(", ") + ")";
            };
            var harita = {};
            function ekle(dizi, tur) {
                dizi.forEach(function(f) {
                    if (!f.faturaTarihi) return;
                    var d = f.faturaTarihi.substring(0, 7);
                    var yil = d.substring(0, 4);
                    var ay = parseInt(d.substring(5, 7), 10);
                    var q = Math.ceil(ay / 3);
                    var key = yil + "-Q" + q;
                    if (!harita[key]) harita[key] = { key:key, gelenKdv:0, gidenKdv:0, gelenAdet:0, gidenAdet:0, ad:ceyrekAdi(d) };
                    harita[key][tur+"Kdv"] += f.kdvTutari || 0;
                    harita[key][tur+"Adet"] += 1;
                });
            }
            ekle(gelen, "gelen"); ekle(giden, "giden");
            var donemler = Object.keys(harita).sort();
            var konteyner = document.getElementById("ftKdvTablosu");
            if (!konteyner) return;
            if (!donemler.length) { konteyner.innerHTML = tmEmptyStateHTML('<i class="fa-solid fa-chart-simple"></i>','Henüz KDV verisi bulunmamaktadır.','KDV verisi eklemek için formu kullanın.'); return; }
            var h = '<table class="ft-table"><thead><tr class="ft-kdv-header"><th>Dönem</th><th>Gelen</th><th>Giden</th><th>Gelen KDV</th><th>Giden KDV</th><th>KDV Farkı</th></tr></thead><tbody>';
            donemler.forEach(function(key) {
                var dm = harita[key], fark = dm.gidenKdv - dm.gelenKdv;
                var r = fark >= 0 ? 'var(--accent-red)' : 'var(--btn-green)';
                var rowCls = fark >= 0 ? 'ft-kdv-row-odenecek' : 'ft-kdv-row-alacak';
                h += '<tr class="'+rowCls+'"><td style="font-weight:700;">'+dm.ad+'</td><td>'+dm.gelenAdet+'</td><td>'+dm.gidenAdet+'</td><td style="font-weight:700;">'+tmTl(dm.gelenKdv)+'</td><td style="font-weight:700;">'+tmTl(dm.gidenKdv)+'</td><td style="font-weight:700;color:'+r+';">'+tmTl(fark)+'</td></tr>';
            });
            h += '</tbody></table>';
            konteyner.innerHTML = h;
        }

        /* ---------- Vergi Takvimi ---------- */
        function ftTakvimFormAc(id) {
            var yv = ftYilVerisi();
            var e = id ? yv.data.vergiEtkinlikleri.find(function(x){return x.id===id;}) : null;
            var form = document.getElementById("ftTakvimForm");
            if (!form) return;
            var isEdit = !!e;
            var fn = isEdit ? "ftTakvimKaydet("+id+")" : "ftTakvimKaydet()";
            var turOpts = SABIT_VERGI_TURLERI.map(function(t){
                var sel = e && e.tur === t ? " selected" : "";
                return '<option value="'+t+'"'+sel+'>'+t+'</option>';
            }).join('');
            form.style.display = "flex";
            form.innerHTML = '<div style="width:100%;">' +
                '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:10px;">' +
                '<div style="flex:2;min-width:180px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Başlık</label><input type="text" id="ftTakvimBaslik" value="'+(e?e.baslik:'')+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;text-transform:uppercase;" oninput="this.value=this.value.toUpperCase()"></div>' +
                '<div style="flex:1;min-width:130px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Tarih</label><input type="date" id="ftTakvimTarih" value="'+(e?e.tarih:'')+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;"></div>' +
                '<div style="flex:1;min-width:140px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Tür</label><div style="display:flex;gap:4px;"><select id="ftTakvimTur" style="flex:1;padding:10px;box-sizing:border-box;text-align:center;">'+turOpts+'</select>' +
                '<button class="btn btn-save-green" title="Tür Ekle" onclick="yeniVergiTuruEklePrompt()" style="min-width:36px;height:42px;font-size:18px;line-height:1;"><i class="fa-solid fa-plus"></i></button>' +
                '<button class="btn btn-danger btn-sm" title="Tür Sil" onclick="vergiTuruSilPrompt()" style="min-width:36px;height:42px;font-size:18px;line-height:1;">?</button></div></div>' +
                '<div style="flex:2;min-width:150px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Açıklama</label><input type="text" id="ftTakvimAciklama" value="'+(e?e.aciklama:'')+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;"></div>' +
                '</div>' +
                '<div style="display:flex;gap:8px;justify-content:center;padding-top:6px;">' +
                '<button class="btn-form btn-form-save" onclick="'+fn+'" style="padding:8px 20px;font-size:13px;"><i class="fa-solid fa-floppy-disk"></i> '+(isEdit?"Güncelle":"Ekle")+'</button>' +
                '<button class="btn-form btn-form-cancel" onclick="document.getElementById(\'ftTakvimForm\').style.display=\'none\'" style="padding:8px 20px;font-size:13px;"><i class="fa-solid fa-xmark"></i> İptal</button></div></div>';
        }

        function ftTakvimKaydet(id) {
            var baslik = (document.getElementById("ftTakvimBaslik").value || "").trim();
            if (!baslik) { tmNotify("Başlık giriniz!", "error"); return; }
            var tarih = document.getElementById("ftTakvimTarih").value;
            if (!tarih) { tmNotify("Tarih seçiniz!", "error"); return; }
            var tur = document.getElementById("ftTakvimTur").value;
            var aciklama = document.getElementById("ftTakvimAciklama").value.trim();
            var yv = ftYilVerisi();
            if (id) {
                var idx = yv.data.vergiEtkinlikleri.findIndex(function(x){return x.id===id;});
                if (idx !== -1) yv.data.vergiEtkinlikleri[idx] = { id:id, baslik:baslik, tarih:tarih, tur:tur, aciklama:aciklama, tamamlandi:yv.data.vergiEtkinlikleri[idx].tamamlandi||false };
            } else {
                var maxId = yv.data.vergiEtkinlikleri.reduce(function(m,x){return Math.max(m,x.id);},0);
                yv.data.vergiEtkinlikleri.push({ id:maxId+1, baslik:baslik, tarih:tarih, tur:tur, aciklama:aciklama, tamamlandi:false });
            }
            ftDbKaydet(yv.db);
            document.getElementById("ftTakvimForm").style.display = "none";
            ftTakvimGoster();
            tmNotify(id ? "Etkinlik güncellendi." : "Etkinlik eklendi.", "success");
        }

        function ftTakvimSil(id) {
            tmConfirm("Bu etkinliği silmek istediğinize emin misiniz?", function() {
                var yv = ftYilVerisi();
                yv.data.vergiEtkinlikleri = yv.data.vergiEtkinlikleri.filter(function(x){return x.id !== id;});
                ftDbKaydet(yv.db); ftTakvimGoster();
                tmNotify("Etkinlik silindi.", "success");
            });
        }

        function ftTakvimTamamla(id) {
            var yv = ftYilVerisi();
            var e = yv.data.vergiEtkinlikleri.find(function(x){return x.id===id;});
            if (e) { e.tamamlandi = !e.tamamlandi; ftDbKaydet(yv.db); ftTakvimGoster(); }
        }

        function yeniVergiTuruEklePrompt() {
            tmPrompt("Yeni vergi türü adını giriniz:", function(yeni) {
            if (!yeni || !yeni.trim()) return;
            yeni = yeni.trim().toUpperCase();
            if (SABIT_VERGI_TURLERI.some(function(t){return t.toUpperCase() === yeni;})) {
                tmNotify("Bu vergi türü zaten mevcut!", "error"); return;
            }
            SABIT_VERGI_TURLERI.push(yeni);
            localStorage.setItem("tm_vergi_turleri_v1", JSON.stringify(SABIT_VERGI_TURLERI));
            ftTakvimFormAc();
            tmNotify("Vergi türü eklendi: " + yeni, "success");
            });
        }

        function vergiTuruSilPrompt() {
            var secili = document.getElementById("ftTakvimTur");
            if (!secili || !secili.value) return;
            var val = secili.value;
            if (["KDV","Gelir Vergisi","Kurumlar Vergisi","Stopaj","Damga Vergisi","Diğer"].indexOf(val) !== -1) {
                tmNotify("Varsayılan türler silinemez!", "error"); return;
            }
            tmConfirm('"' + val + '" türünü silmek istediğinize emin misiniz?', function() {
                SABIT_VERGI_TURLERI = SABIT_VERGI_TURLERI.filter(function(t){return t !== val;});
                localStorage.setItem("tm_vergi_turleri_v1", JSON.stringify(SABIT_VERGI_TURLERI));
                ftTakvimFormAc();
                tmNotify("Vergi türü silindi: " + val, "success");
            });
        }

        function ftTakvimGoster() {
            var yv = ftYilVerisi();
            var liste = yv.data.vergiEtkinlikleri || [];
            var konteyner = document.getElementById("ftTakvimListesi");
            if (!konteyner) return;
            if (!liste.length) { konteyner.innerHTML = tmEmptyStateHTML('<i class="fa-regular fa-calendar"></i>','Henüz vergi etkinliği bulunmamaktadır.','Vergi takvimine yeni bir etkinlik ekleyin.'); return; }
            var simdi = new Date();
            simdi.setHours(0,0,0,0);
            var h = '<div class="ft-takvim-list">';
            h += '<div class="ft-takvim-header">' +
                '<span class="ft-takvim-h-chk"></span>' +
                '<span class="ft-takvim-h-tarih">Tarih</span>' +
                '<span class="ft-takvim-h-baslik">Başlık</span>' +
                '<span class="ft-takvim-h-tur">Tür</span>' +
                '<span class="ft-takvim-h-kalan">Kalan Süre</span>' +
                '<span class="ft-takvim-h-aciklama">Açıklama</span>' +
                '<span class="ft-takvim-h-aksiyon"></span></div>';
            liste.slice().reverse().forEach(function(e) {
                var turAd = ftTurAdi(e.tur);
                var kalanGun = "";
                var renk = "";
                if (e.tarih) {
                    try {
                        var et = new Date(e.tarih);
                        et.setHours(0,0,0,0);
                        var fark = Math.round((et - simdi) / 86400000);
                        if (fark > 0) { kalanGun = fark + " gün kaldı"; renk = fark <= 7 ? "color:var(--accent-red);font-weight:700;" : fark <= 30 ? "color:orange;" : "color:var(--text-light);"; }
                        else if (fark === 0) { kalanGun = "BUGÜN!"; renk = "color:red;font-weight:700;"; }
                        else { kalanGun = Math.abs(fark) + " gün geçti"; renk = "color:var(--text-light);"; }
                    } catch(e) { console.error("Fatura takvim tarih hatasi:", e); }
                }
                h += '<div class="ft-takvim-item'+(e.tamamlandi?" tamamlandi":"")+'">';
                h += '<input type="checkbox" '+(e.tamamlandi?"checked":"")+' onchange="ftTakvimTamamla('+e.id+')" style="width:16px;height:16px;cursor:pointer;">';
                h += '<div class="ft-takvim-tarih">'+(e.tarih?tarihStr(e.tarih):"-")+'</div>';
                h += '<div class="ft-takvim-baslik">'+esc(e.baslik)+'</div><div class="ft-takvim-tur">'+turAd+'</div>';
                if (kalanGun) h += '<div class="ft-takvim-kalan" style="'+renk+'">'+kalanGun+'</div>';
                if (e.aciklama) h += '<div class="ft-takvim-aciklama">'+esc(e.aciklama)+'</div>';
                h += '<button class="ft-btn-sm ft-btn-edit" onclick="ftTakvimFormAc('+e.id+')"><i class="fa-regular fa-pen-to-square"></i></button>';
                h += '<button class="ft-btn-sm ft-btn-del" onclick="ftTakvimSil('+e.id+')"><i class="fa-solid fa-trash-can"></i></button></div>';
            });
            h += '</div>';
            konteyner.innerHTML = h;
        }

        /* ---------- PDF Rapor ---------- */
        function faturaPdfIndir() {
            var yv = ftYilVerisi(), yil = yv.yil;
            var gelen = yv.data.gelenFaturalar || [], giden = yv.data.gidenFaturalar || [];
            var etk = yv.data.vergiEtkinlikleri || [];
            var gkT = 0, gk2T = 0, gTT = 0, g2T = 0;
            gelen.forEach(function(f){ gkT += f.kdvTutari||0; gTT += f.toplamTutar||0; });
            giden.forEach(function(f){ gk2T += f.kdvTutari||0; g2T += f.toplamTutar||0; });

            function satir(f, tip) {
                var d = tip==="gelen" ? (f.odemeDurumu==="odendi"?"Ödendi":f.odemeDurumu==="kismi"?"Kısmi":"Ödenmedi") : (f.tahsilatDurumu==="tahsilEdildi"?"Tah.Edildi":f.tahsilatDurumu==="kismi"?"Kısmi":"Tah.Edilmedi");
                var t = f.tutar||0, k = f.kdvTutari||0, tp = f.toplamTutar||0;
                return '<tr><td>'+esc(f.firmaAdi)+'</td><td>'+esc(f.faturaNo)+'</td><td>'+(f.faturaTarihi?tarihStr(f.faturaTarihi):"-")+'</td><td style="text-align:right;">'+t.toLocaleString("tr-TR",{minFractionDigits:2})+'</td><td style="text-align:right;">'+k.toLocaleString("tr-TR",{minFractionDigits:2})+'</td><td style="text-align:right;font-weight:700;">'+tp.toLocaleString("tr-TR",{minFractionDigits:2})+'</td><td>'+d+'</td></tr>';
            }

            var h = '<div style="width:210mm;padding:20mm;font-family:Arial,sans-serif;font-size:12px;">';
            h += '<div style="text-align:center;border-bottom:2px solid #000;padding-bottom:15px;margin-bottom:25px;"><h1 style="margin:0;font-size:22px;">FATURA TAKİP RAPORU</h1><p style="margin:5px 0 0 0;font-size:13px;color:#555;">Turak Mimarlık — '+yil+' Yılı</p></div>';
            h += '<div style="display:flex;justify-content:space-between;margin-bottom:25px;gap:10px;">';
            h += '<div style="flex:1;border:1px solid #ddd;padding:12px;text-align:center;border-radius:6px;"><div style="font-size:11px;color:#555;font-weight:600;">Gelen Fatura</div><div style="font-size:18px;font-weight:700;color:#1565C0;">'+gelen.length+' adet</div><div style="font-size:13px;">'+gTT.toLocaleString("tr-TR",{minFractionDigits:2})+' ?</div></div>';
            h += '<div style="flex:1;border:1px solid #ddd;padding:12px;text-align:center;border-radius:6px;"><div style="font-size:11px;color:#555;font-weight:600;">Giden Fatura</div><div style="font-size:18px;font-weight:700;color:#1565C0;">'+giden.length+' adet</div><div style="font-size:13px;">'+g2T.toLocaleString("tr-TR",{minFractionDigits:2})+' ?</div></div>';
            h += '<div style="flex:1;border:1px solid #ddd;padding:12px;text-align:center;border-radius:6px;"><div style="font-size:11px;color:#555;font-weight:600;">KDV Ödenecek</div><div style="font-size:18px;font-weight:700;color:#c62828;">'+(gk2T>gkT?(gk2T-gkT).toLocaleString("tr-TR",{minFractionDigits:2}):"0,00")+' ?</div></div>';
            h += '<div style="flex:1;border:1px solid #ddd;padding:12px;text-align:center;border-radius:6px;"><div style="font-size:11px;color:#555;font-weight:600;">KDV Alacak</div><div style="font-size:18px;font-weight:700;color:#2e7d32;">'+(gkT>gk2T?(gkT-gk2T).toLocaleString("tr-TR",{minFractionDigits:2}):"0,00")+' ?</div></div></div>';

            h += '<h3 style="font-size:14px;margin-bottom:8px;"><i class="fa-solid fa-inbox"></i> Gelen Faturalar</h3>';
            if (gelen.length) { h += '<table style="width:100%;border-collapse:collapse;margin-bottom:25px;"><thead><tr style="background:#f5f5f5;"><th style="padding:8px;border:1px solid #ddd;text-align:left;font-size:11px;">Firma</th><th style="padding:8px;border:1px solid #ddd;text-align:left;font-size:11px;">Fatura No</th><th style="padding:8px;border:1px solid #ddd;text-align:left;font-size:11px;">Tarih</th><th style="padding:8px;border:1px solid #ddd;text-align:right;font-size:11px;">Tutar</th><th style="padding:8px;border:1px solid #ddd;text-align:right;font-size:11px;">KDV</th><th style="padding:8px;border:1px solid #ddd;text-align:right;font-size:11px;">Toplam</th><th style="padding:8px;border:1px solid #ddd;text-align:left;font-size:11px;">Durum</th></tr></thead><tbody>'; gelen.slice().reverse().forEach(function(f){h+=satir(f,"gelen");}); h += '</tbody></table>'; }
            else h += '<div style="padding:16px;">'+tmEmptyStateHTML('<i class="fa-solid fa-inbox"></i>','Gelen fatura bulunmamaktadır.','','')+'</div>';

            h += '<h3 style="font-size:14px;margin-bottom:8px;"><i class="fa-solid fa-paper-plane"></i> Giden Faturalar</h3>';
            if (giden.length) { h += '<table style="width:100%;border-collapse:collapse;margin-bottom:25px;"><thead><tr style="background:#f5f5f5;"><th style="padding:8px;border:1px solid #ddd;text-align:left;font-size:11px;">Firma</th><th style="padding:8px;border:1px solid #ddd;text-align:left;font-size:11px;">Fatura No</th><th style="padding:8px;border:1px solid #ddd;text-align:left;font-size:11px;">Tarih</th><th style="padding:8px;border:1px solid #ddd;text-align:right;font-size:11px;">Tutar</th><th style="padding:8px;border:1px solid #ddd;text-align:right;font-size:11px;">KDV</th><th style="padding:8px;border:1px solid #ddd;text-align:right;font-size:11px;">Toplam</th><th style="padding:8px;border:1px solid #ddd;text-align:left;font-size:11px;">Durum</th></tr></thead><tbody>'; giden.slice().reverse().forEach(function(f){h+=satir(f,"giden");}); h += '</tbody></table>'; }
            else h += '<div style="padding:16px;">'+tmEmptyStateHTML('<i class="fa-solid fa-paper-plane"></i>','Giden fatura bulunmamaktadır.','','')+'</div>';

            if (etk.length) {
                h += '<h3 style="font-size:14px;margin-bottom:8px;"><i class="fa-regular fa-calendar"></i> Vergi Takvimi</h3><table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#f5f5f5;"><th style="padding:8px;border:1px solid #ddd;text-align:left;font-size:11px;">Tarih</th><th style="padding:8px;border:1px solid #ddd;text-align:left;font-size:11px;">Başlık</th><th style="padding:8px;border:1px solid #ddd;text-align:left;font-size:11px;">Tür</th><th style="padding:8px;border:1px solid #ddd;text-align:left;font-size:11px;">Durum</th></tr></thead><tbody>';
                etk.slice().reverse().forEach(function(e) {
                    var ta = e.tur==="kdv"?"KDV":e.tur==="gelirVergisi"?"Gelir Vergisi":e.tur==="kurumlarVergisi"?"Kurumlar Vergisi":e.tur==="stopaj"?"Stopaj":e.tur==="damgaVergisi"?"Damga Vergisi":"Diğer";
                    h += '<tr><td style="padding:8px;border:1px solid #ddd;">'+(e.tarih?tarihStr(e.tarih):"-")+'</td><td style="padding:8px;border:1px solid #ddd;">'+esc(e.baslik)+'</td><td style="padding:8px;border:1px solid #ddd;">'+ta+'</td><td style="padding:8px;border:1px solid #ddd;">'+(e.tamamlandi?'<i class="fa-solid fa-check"></i> Tamamlandı':"? Bekliyor")+'</td></tr>';
                });
                h += '</tbody></table>';
            }
            h += '<div style="margin-top:35px;padding-top:15px;border-top:1px solid #ddd;font-size:10px;color:#999;text-align:center;">Turak Mimarlık Portal — Rapor: '+new Date().toLocaleDateString("tr-TR")+'</div></div>';

            var el = document.createElement("div"); el.innerHTML = h; document.body.appendChild(el);
            html2canvas(el,{scale:6,useCORS:true}).then(function(c){var doc=new jspdf.jsPDF({format:'a4',orientation:'portrait',unit:'mm'});var imgW=190;var imgH=c.height*imgW/c.width;doc.addImage(c.toDataURL('image/png'),'PNG',10,10,imgW,imgH);doc.save('Fatura_Takip_Raporu_'+yil+'.pdf');try{document.body.removeChild(el)}catch(ex){console.error("Fatura PDF DOM temizlik:",ex);}}).catch(function(e){console.error("Fatura PDF hatasi:",e);tmNotify("Fatura PDF oluşturulurken hata: "+e.message,"error");try{document.body.removeChild(el)}catch(ex){}});
        }

        /* ---------- İş Takibi ---------- */
        var IT_DB_KEY = "tm_is_takibi_v2";
        var IT_TUR_LIST = ["Taslak", "Uygulama Proje", "3B Modelleme ve Tasarım", "Diğer"];
        var IT_ASAMALAR = [
            { field: 'fiyatOnayTarihi', label: 'FİYAT ANLAŞMASI ONAYI' },
            { field: 'isVerildiTarihi', label: 'İŞ VERİLDİ' },
            { field: 'belgelerTarihi', label: 'GEREKLİ BELGELER GÖNDERİLDİ' },
            { field: 'cizimTarihi', label: 'ÇİZİM TAMAMLANDI' },
            { field: 'baskiTarihi', label: 'BASKI İŞLEMİ TAMAMLANDI' },
            { field: 'imzaTarihi', label: 'YD VE MÜELLİF İMZALARI TAMAMLANDI' },
            { field: 'projeTeslimTarihi', label: 'PROJE TESLİM ALINDI' }
        ];
        var IT_ASAMALAR_TASLAK = [
            { field: 'isVerildiTarihi', label: 'İŞ VERİLDİ' },
            { field: 'belgelerTarihi', label: 'GEREKLİ BELGELER GÖNDERİLDİ' },
            { field: 'cizimTarihi', label: 'ÇİZİM TAMAMLANDI' }
        ];
        var IT_ASAMALAR_3B = [
            { field: 'fiyatOnayTarihi', label: 'FİYAT ANLAŞMASI ONAYI' },
            { field: 'isVerildiTarihi', label: 'İŞ VERİLDİ' },
            { field: 'belgelerTarihi', label: 'GEREKLİ BELGELER GÖNDERİLDİ' },
            { field: 'cizimTarihi', label: 'ÇİZİM TAMAMLANDI' },
            { field: 'projeTeslimTarihi', label: 'PROJE TESLİM ALINDI' }
        ];
        var IT_ASAMALAR_DIGER = [
            { field: 'fiyatOnayTarihi', label: 'FİYAT ANLAŞMASI ONAYI' },
            { field: 'isVerildiTarihi', label: 'İŞ VERİLDİ' },
            { field: 'belgelerTarihi', label: 'GEREKLİ BELGELER GÖNDERİLDİ' },
            { field: 'cizimTarihi', label: 'İŞ TAMAMLANDI' },
            { field: 'projeTeslimTarihi', label: 'İŞ TESLİM ALINDI' }
        ];
        function itAsamaList(tur) {
            if (tur === "Taslak") return IT_ASAMALAR_TASLAK;
            if (tur === "3B Modelleme ve Tasarım") return IT_ASAMALAR_3B;
            if (tur === "Diğer") return IT_ASAMALAR_DIGER;
            return IT_ASAMALAR;
        }
        function itAsamaRenkler(tur) {
            if (tur === "Taslak") return ['#e53935','#ef6c00','#2e7d32'];
            if (tur === "3B Modelleme ve Tasarım" || tur === "Diğer") return ['#c62828','#e53935','#ef6c00','#f9a825','#2e7d32'];
            return ['#c62828','#e53935','#ef6c00','#f9a825','#7cb342','#43a047','#2e7d32'];
        }

        function itGosterimPct(is) {
            if (is.tur === "Taslak") return itJobOrtalamaPct(is);
            if (is.tur === "Uygulama Proje") {
                var ort = is.ortaklar || [];
                if (ort.length === 0) return 0;
                var ASAMA_LIST = itAsamaList("Uygulama Proje");
                var share = 90 / ort.length;
                var total = 0;
                ort.forEach(function(o){ total += itAsamaPct(o, ASAMA_LIST) * share / 100; });
                var base = Math.round(total);
                if (is.ruhsatOnayi) base += 5;
                if (is.tahsilatOnayi) base += 5;
                return base;
            }
            var pct = itJobOrtalamaPct(is);
            return is.tahsilatOnayi ? pct : Math.min(pct, 99);
        }
        function itAsamaPct(o, stages) {
            stages = stages || IT_ASAMALAR;
            var completed = 0;
            stages.forEach(function(a){ if (o[a.field]) completed++; });
            return Math.round(completed / stages.length * 100);
        }
        function itPctColor(pct) {
    if (pct >= 100) return 'rgba(46,125,50,0.35)';
    if (pct >= 75) return 'rgba(253,216,53,0.30)';
    if (pct >= 50) return 'rgba(251,140,0,0.30)';
    if (pct >= 25) return 'rgba(239,83,80,0.30)';
    return 'rgba(229,57,53,0.35)';
}
function itJobOrtalamaPct(is) {
    var ASAMA_LIST = itAsamaList(is.tur);
    var ort = (is.ortaklar||[]);
    if (ort.length === 0) return 0;
    var total = 0;
    ort.forEach(function(o){ total += itAsamaPct(o, ASAMA_LIST); });
    return Math.round(total / ort.length);
}
function itDurumMetni(o) {
            if (o.projeTeslimTarihi) return 'TAMAMLANDI';
            if (o.baskiTarihi) return 'imza aşamasında';
            if (o.cizimTarihi) return 'Baskı Aşamasında';
            if (o.belgelerTarihi || o.isVerildiTarihi) return 'çizim aşamasında';
            if (o.fiyatOnayTarihi) return 'İş Verilmeyi Bekliyor';
            return '';
        }

        function itDbYukle() {
            var data;
            try { data = JSON.parse(localStorage.getItem(IT_DB_KEY)) || []; } catch(e) { return []; }
            data.forEach(function(job){
                if (job.tahsilatOnayi === undefined) job.tahsilatOnayi = false;
                if (job.ruhsatOnayi === undefined) job.ruhsatOnayi = false;
                if (job.pafta === undefined) job.pafta = "";
                if (job.ada === undefined) job.ada = "";
                (job.ortaklar||[]).forEach(function(o){
                    if (o.gonderildiTarihi && !o.isVerildiTarihi) o.isVerildiTarihi = o.gonderildiTarihi;
                    if (o.teslimTarihi && !o.projeTeslimTarihi) o.projeTeslimTarihi = o.teslimTarihi;
                    IT_ASAMALAR.forEach(function(a){ if (o[a.field] === undefined) o[a.field] = ""; });
                    if (!Array.isArray(o.not)) {
                        var oldText = String(o.not||'').trim();
                        o.not = oldText ? [{id: Date.now(), text: oldText.toUpperCase()}] : [];
                    }
                });
            });
            return data;
        }
        function itDbKaydet(d) { try { localStorage.setItem(IT_DB_KEY, JSON.stringify(d)); } catch(e) { console.error("Is takibi db kaydetme hatasi:", e); } }

        function itAktifSekmeDegistir(tur) {
            document.querySelectorAll("#itAktifSekmeBar .it-sekme").forEach(function(b){b.classList.remove("it-sekme-aktif");});
            var btn = document.querySelector('#itAktifSekmeBar .it-sekme[data-tur="'+tur+'"]');
            if (btn) btn.classList.add("it-sekme-aktif");
            itAktifKartlariGoster(tur);
        }

        function itTamamlananSekmeDegistir(tur) {
            document.querySelectorAll("#itTamamlananSekmeBar .it-sekme").forEach(function(b){b.classList.remove("it-sekme-aktif");});
            var btn = document.querySelector('#itTamamlananSekmeBar .it-sekme[data-tur="'+tur+'"]');
            if (btn) btn.classList.add("it-sekme-aktif");
            itTamamlananTablosuGoster(tur);
        }

        var itAktifSort = { col:"id", dir:"desc" };
        var itTamamlananSort = { col:"id", dir:"desc" };

        function itSortCompare(a, b, col, dir) {
            var va = col === "id" ? a.id : (a[col]||"");
            var vb = col === "id" ? b.id : (b[col]||"");
            if (va < vb) return dir === "asc" ? -1 : 1;
            if (va > vb) return dir === "asc" ? 1 : -1;
            return 0;
        }

        function itTurkcely(s) { return (s||"").replace(/İ/g,'i').replace(/Ü/g,'ü').replace(/Ö/g,'ö').replace(/Ç/g,'ç').replace(/Ş/g,'ş').replace(/Ğ/g,'ğ'); }
        function itFiltreVeSirala(liste, arama, sort) {
            if (arama) {
                var q = itTurkcely(arama.toLowerCase());
                liste = liste.filter(function(x){
                    return itTurkcely((x.isAdi||"").toLowerCase()).indexOf(q) !== -1 ||
                           itTurkcely((x.firma||"").toLowerCase()).indexOf(q) !== -1 ||
                           itTurkcely(((x.pafta||"") + " " + (x.ada||"") + " " + (x.parsel||"")).toLowerCase()).indexOf(q) !== -1 ||
                           itTurkcely(([x.pafta,x.ada,x.parsel].filter(Boolean).join("/")).toLowerCase()).indexOf(q) !== -1 ||
                           itTurkcely((x.not||"").toLowerCase()).indexOf(q) !== -1;
                });
            }
            liste.sort(function(a,b){ return itSortCompare(a,b,sort.col,sort.dir); });
            return liste;
        }

        function itSortOk(col, sort) {
            if (sort.col !== col) return "";
            return sort.dir === "asc" ? ' <i class="fa-solid fa-arrow-up-short-wide"></i>' : ' <i class="fa-solid fa-arrow-down-wide-short"></i>';
        }

        function itJobDurumMetni(is) {
            var maxStage = -1;
            (is.ortaklar||[]).forEach(function(o){
                if (is.tur === "Taslak") {
                    if (o.cizimTarihi) maxStage = Math.max(maxStage, 2);
                    else if (o.belgelerTarihi) maxStage = Math.max(maxStage, 1);
                    else if (o.isVerildiTarihi) maxStage = Math.max(maxStage, 0);
                } else {
                    if (o.projeTeslimTarihi) maxStage = Math.max(maxStage, 6);
                    else if (o.imzaTarihi) maxStage = Math.max(maxStage, 5);
                    else if (o.baskiTarihi) maxStage = Math.max(maxStage, 4);
                    else if (o.cizimTarihi) maxStage = Math.max(maxStage, 3);
                    else if (o.belgelerTarihi) maxStage = Math.max(maxStage, 2);
                    else if (o.isVerildiTarihi) maxStage = Math.max(maxStage, 1);
                    else if (o.fiyatOnayTarihi) maxStage = Math.max(maxStage, 0);
                }
            });
            if (maxStage === -1) return { text: 'BEKLEMEDE', color: '#fff', bg: '#e53935' };
            if (is.tur === "Taslak") {
                return maxStage < 2 ? { text: 'ÇİZİM AŞAMASINDA', color: '#fff', bg: '#e53935' } : { text: 'TAMAMLANDI', color: '#fff', bg: '#2e7d32' };
            }
            var tablo = [
                { text: 'İŞ VERİLMEYİ BEKLİYOR', color: '#fff', bg: '#c62828' },
                { text: 'ÇİZİM AŞAMASINDA', color: '#fff', bg: '#e53935' },
                { text: 'ÇİZİM AŞAMASINDA', color: '#222', bg: '#f9a825' },
                { text: 'BASKI AŞAMASINDA', color: '#fff', bg: '#ef6c00' },
                { text: 'İMZA AŞAMASINDA', color: '#fff', bg: '#7cb342' },
                { text: 'İMZA AŞAMASINDA', color: '#fff', bg: '#43a047' },
                { text: 'TESLİME HAZIR', color: '#fff', bg: '#2e7d32' }
            ];
            return tablo[maxStage];
        }

        function itJobStatusGuncelle(jobId) {
            var liste = itDbYukle();
            var is = liste.find(function(x){return x.id===jobId;});
            if (!is) return;
            var bar = document.getElementById("itJobMiniBar_" + jobId);
            var pctSpan = document.getElementById("itJobPct_" + jobId);
            if (!bar || !pctSpan) return;
            var avgPct = itJobOrtalamaPct(is);
            var dispPct = itGosterimPct(is);
            var barBg = is.tur === "Taslak" ? '#2e7d32' : '#f9a825,#4caf50';
            bar.style.width = dispPct + '%';
            bar.style.background = 'linear-gradient(90deg,#e53935,' + barBg + ')';
            pctSpan.innerText = dispPct + '%';
            var row = document.getElementById("itRow_" + jobId);
            if (row) row.style.background = itPctColor(avgPct);
        }

        function itTaslakTamamMi(is) {
            return (is.ortaklar||[]).length > 0 && (is.ortaklar||[]).every(function(o){ return o.isVerildiTarihi && o.belgelerTarihi && o.cizimTarihi; });
        }

        function itTaslakUygulamayaGec(id) {
            var liste = itDbYukle();
            var is = liste.find(function(x){return x.id===id;});
            if (!is) return;
            var maxId = liste.reduce(function(m,x){return Math.max(m,x.id);},0);
            var yeni = JSON.parse(JSON.stringify(is));
            yeni.id = maxId + 1;
            yeni.tur = "Uygulama Proje";
            yeni.tamamlandi = false;
            yeni.bitisTarihi = "";
            yeni.ortaklar = [];
            liste.push(yeni);
            itDbKaydet(liste);
            itGoster();
            document.querySelector('#itAktifSekmeBar .it-sekme[data-tur="Uygulama Proje"]').click();
            tmNotify("Taslak iş Uygulama Proje'ye kopyalandı.", "success");
        }

        function it3bModellemeyeGec(id) {
            var liste = itDbYukle();
            var is = liste.find(function(x){return x.id===id;});
            if (!is) return;
            var maxId = liste.reduce(function(m,x){return Math.max(m,x.id);},0);
            var yeni = JSON.parse(JSON.stringify(is));
            yeni.id = maxId + 1;
            yeni.tur = "3B Modelleme ve Tasarım";
            yeni.tamamlandi = false;
            yeni.bitisTarihi = "";
            yeni.ortaklar = [];
            liste.push(yeni);
            itDbKaydet(liste);
            itGoster();
            document.querySelector('#itAktifSekmeBar .it-sekme[data-tur="3B Modelleme ve Tasarım"]').click();
            tmNotify("İş 3B Modelleme ve Tasarım'a kopyalandı.", "success");
        }

        function itAktifKartlariGoster(tur) {
            var acikIds = [];
            document.querySelectorAll(".it-row-detail.open").forEach(function(el) {
                var id = el.id.replace("itDetayRow_","").replace("itTamDetayRow_","");
                if (id) acikIds.push(id);
            });
            var liste = itDbYukle().filter(function(x){return x.tur === tur && !x.tamamlandi;});
            var arama = (document.getElementById("itAktifAra")||{}).value||"";
            liste = itFiltreVeSirala(liste, arama, itAktifSort);
            var konteyner = document.getElementById("itAktifKartlar");
            if (!liste.length) { konteyner.innerHTML = tmEmptyStateHTML('<i class="fa-regular fa-folder-open"></i>','Bu bölümde aktif iş bulunmamaktadır.','Farklı bir sekme seçin veya yeni bir iş ekleyin.'); return; }
            var h = '<div class="it-tablo-wrapper"><table class="it-tablo"><thead><tr>' +
                '<th style="width:32px;"></th>' +
                '<th class="th-sortable" onclick="itAktifSortGuncelle(\'id\')" style="width:40px;">#<span id="itAktifSortId">'+itSortOk("id",itAktifSort)+'</span></th>' +
                '<th>İş Adı</th>' +
                '<th>Firma</th>' +
                '<th>PAFTA/ADA/PARSEL</th>' +
                '<th class="th-sortable" onclick="itAktifSortGuncelle(\'tarih\')">Başlama<span id="itAktifSortTarih">'+itSortOk("tarih",itAktifSort)+'</span></th>' +
                '<th style="width:130px;">Durum</th>' +
                '</tr></thead><tbody>';
            liste.forEach(function(is, idx) {
                var sira = itAktifSort.dir === "asc" ? idx+1 : liste.length-idx;
                var avgPct = itJobOrtalamaPct(is);
                var dispPct = itGosterimPct(is);
                var isTam = avgPct === 100 && (is.ortaklar||[]).length > 0;
                var barBg = is.tur === "Taslak" ? '#2e7d32' : '#f9a825,#4caf50';
                var rowBg = itPctColor(avgPct);
                var acik = acikIds.indexOf(String(is.id)) >= 0;
                h += '<tr class="it-row-clickable" id="itRow_' + is.id + '" style="background:' + rowBg + ';" onclick="itRowToggle(' + is.id + ')">' +
                    '<td style="text-align:center;"><span class="it-expand-icon" id="itExpandIcon_' + is.id + '" style="font-size:10px;color:var(--text-light);user-select:none;">' + (acik ? '<i class="fa-solid fa-chevron-down"></i>' : '<i class="fa-solid fa-chevron-right"></i>') + '</span></td>' +
                    '<td style="text-align:center;font-weight:700;color:var(--text-light);font-size:12px;">' + sira + '</td>' +
                    '<td style="font-weight:600;">' + esc(is.isAdi || "İSİMSİZ") + '</td>' +
                    '<td style="color:var(--text-dark);">' + esc(is.firma || "-") + '</td>' +
                    '<td style="color:var(--text-dark);">' + esc(is.pafta || is.ada || is.parsel ? [is.pafta, is.ada, is.parsel].filter(Boolean).join("/") : "-") + '</td>' +
                    '<td>' + (is.tarih ? tarihStr(is.tarih) : "-") + '</td>' +
                    '<td><div class="it-mini-bar"><div class="it-mini-bar-track"><div id="itJobMiniBar_' + is.id + '" class="it-mini-bar-fill" style="width:' + dispPct + '%;background:linear-gradient(90deg,#e53935,' + barBg + ');"></div></div><span id="itJobPct_' + is.id + '" class="it-mini-bar-pct" style="color:' + (avgPct >= 75 ? '#2e7d32' : avgPct >= 50 ? '#f9a825' : '#e53935') + ';">' + dispPct + '%</span></div></td>' +
                    '</tr>' +
                    '<tr class="it-row-detail' + (acik ? ' open' : '') + '" id="itDetayRow_' + is.id + '">' +
                    '<td colspan="7"><div class="it-detay-panel">' +
                    itOrtakSecimHtml(is.id) +
                    '<div class="it-detay-actions">' +
                    (isTam && is.tur === "Uygulama Proje" && !is.ruhsatOnayi ? '<button class="it-btn-ruhsat" onclick="event.stopPropagation();itRuhsatOnayiVer(' + is.id + ')"><i class="fa-solid fa-stamp"></i> RUHSAT ONAYI ALINDI</button>' : '') +
                    (isTam && is.tur === "Uygulama Proje" && is.ruhsatOnayi ? '<span class="it-ruhsat-badge"><i class="fa-solid fa-stamp"></i> RUHSAT ONAYI ALINDI</span>' : '') +
                    (isTam && is.tahsilatOnayi && is.tur !== "Taslak" ? '<span class="it-tahsilat-badge"><i class="fa-solid fa-check"></i> İŞİN TAHSİLATI ONAYLANDI</span>' : '') +
                    (isTam && !is.tahsilatOnayi && is.tur !== "Taslak" && is.tur !== "Uygulama Proje" ? '<button class="it-btn-tahsilat" onclick="event.stopPropagation();itTahsilatOnayiVer(' + is.id + ')"><i class="fa-solid fa-check"></i> TAHSİLAT ONAYI VER</button>' : '') +
                    (isTam && !is.tahsilatOnayi && is.tur === "Uygulama Proje" ? '<button class="it-btn-tahsilat" onclick="event.stopPropagation();itTahsilatOnayiVer(' + is.id + ')"><i class="fa-solid fa-check"></i> TAHSİLAT ONAYI VER</button>' : '') +
                    (isTam && (is.tur === "Taslak" || (is.tahsilatOnayi && (is.tur !== "Uygulama Proje" || is.ruhsatOnayi))) ? '<button class="it-btn-tamamla" onclick="event.stopPropagation();itTamamla(' + is.id + ')"><i class="fa-solid fa-check"></i> İŞ TAMAMLANDI</button>' : '') +
                    '<button class="it-btn-sil" onclick="event.stopPropagation();itSil(' + is.id + ')" style="margin-left:auto;"><i class="fa-solid fa-trash-can"></i> Sil</button>' +
                    '</div></div></td></tr>';
            });
            h += '</tbody></table></div>';
            konteyner.innerHTML = h;
        }

        function itTamamlananTablosuGoster(tur) {
            var acikIds = [];
            document.querySelectorAll(".it-row-detail.open").forEach(function(el) {
                var id = el.id.replace("itDetayRow_","").replace("itTamDetayRow_","");
                if (id) acikIds.push(id);
            });
            var liste = itDbYukle().filter(function(x){return x.tur === tur && x.tamamlandi;});
            var arama = (document.getElementById("itTamamlananAra")||{}).value||"";
            liste = itFiltreVeSirala(liste, arama, itTamamlananSort);
            var konteyner = document.getElementById("itTamamlananTablo");
            if (!liste.length) { konteyner.innerHTML = tmEmptyStateHTML('<i class="fa-solid fa-check"></i>','Bu bölümde tamamlanan iş bulunmamaktadır.','Tamamlanan iş kayıtları burada görüntülenecek.'); return; }
            var isTaslak = tur === "Taslak";
            var isUygulamaProje = tur === "Uygulama Proje";
            var showActionCol = isTaslak || isUygulamaProje;
            var colSpan = showActionCol ? 8 : 7;
            var h = '<table class="it-tablo"><thead><tr>' +
                '<th></th><th class="th-sortable" onclick="itTamamlananSortGuncelle(\'id\')">#<span id="itTamSortId">'+itSortOk("id",itTamamlananSort)+'</span></th><th>İş Adı</th><th>Firma</th><th>PAFTA/ADA/PARSEL</th><th class="th-sortable" onclick="itTamamlananSortGuncelle(\'tarih\')">Başlama<span id="itTamSortTarih">'+itSortOk("tarih",itTamamlananSort)+'</span></th><th class="th-sortable" onclick="itTamamlananSortGuncelle(\'bitisTarihi\')">Bitiş<span id="itTamSortBitis">'+itSortOk("bitisTarihi",itTamamlananSort)+'</span></th>' +
                (showActionCol ? '<th></th>' : '') +
                '</tr></thead><tbody>';
            liste.forEach(function(is, idx) {
                var sira = itTamamlananSort.dir === "asc" ? idx+1 : liste.length-idx;
                var acik = acikIds.indexOf(String(is.id)) >= 0;
                h += '<tr class="it-row-clickable" onclick="itRowToggle(' + is.id + ')">' +
                    '<td style="width:28px;text-align:center;"><span class="it-expand-icon" id="itTamExpandIcon_' + is.id + '">' + (acik ? '<i class="fa-solid fa-chevron-down"></i>' : '<i class="fa-solid fa-chevron-right"></i>') + '</span></td>' +
                    '<td style="text-align:center;font-weight:700;color:var(--text-light);font-size:12px;">' + sira + '</td>' +
                    '<td style="font-weight:600;">' + esc(is.isAdi || "İSİMSİZ") + '</td>' +
                    '<td>' + esc(is.firma || "-") + '</td>' +
                    '<td>' + esc(is.pafta || is.ada || is.parsel ? [is.pafta, is.ada, is.parsel].filter(Boolean).join("/") : "-") + '</td>' +
                    '<td>' + (is.tarih ? tarihStr(is.tarih) : "-") + '</td>' +
                    '<td>' + (is.bitisTarihi ? tarihStr(is.bitisTarihi) : "-") + '</td>' +
                    (showActionCol ? '<td style="text-align:center;"><div style="display:flex;gap:4px;justify-content:center;">' +
                        (isTaslak ? '<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();itTaslakUygulamayaGec(' + is.id + ')" style="white-space:nowrap;"><i class="fa-solid fa-rocket"></i> UYGULAMA PROJEYE BAŞLA</button>' : '') +
                        '<button class="btn btn-sm" onclick="event.stopPropagation();it3bModellemeyeGec(' + is.id + ')" style="background:#d68910;color:white;border:none;white-space:nowrap;border-radius:6px;"><i class="fa-solid fa-cube"></i> 3B MODELLEMEYE BAŞLA</button>' +
                        '</div></td>' : '') +
                    '</tr>' +
                    '<tr class="it-row-detail' + (acik ? ' open' : '') + '" id="itTamDetayRow_' + is.id + '">' +
                    '<td colspan="' + colSpan + '"><div class="it-detay-panel">' +
                    itOrtakSecimHtml(is.id, true) +
                    '<div class="it-detay-actions">' +
                    '<button class="it-btn-sil" onclick="event.stopPropagation();itSil(' + is.id + ')"><i class="fa-solid fa-trash-can"></i> Sil</button>' +
                    '</div></div></td></tr>';
            });
            h += '</tbody></table>';
            konteyner.innerHTML = h;
        }

        /* ================= GANTT ŞEMASI ================= */
        var itGanttAktif = false;
        function itGanttToggleGoruntu() {
            itGanttAktif = !itGanttAktif;
            var btn = document.getElementById("itGanttToggle");
            var kartlar = document.getElementById("itAktifKartlar");
            var gantt = document.getElementById("itGanttContainer");
            if (itGanttAktif) {
                btn.innerHTML = '<i class="fa-solid fa-list"></i> Liste';
                kartlar.style.display = "none";
                gantt.style.display = "block";
                itGanttGoster();
            } else {
                btn.innerHTML = '<i class="fa-solid fa-chart-simple"></i> Gantt';
                kartlar.style.display = "";
                gantt.style.display = "none";
            }
        }
        function itOrnekIsEkle() {
            if (localStorage.getItem("tm_ornek_is_eklendi")) return;
            var liste = itDbYukle();
            var ornek = {
                id: 999999,
                tur: "Uygulama Proje",
                isAdi: "ÖRNEK PROJE - GANTT İNCELEME",
                firma: "TURAK MİMARLIK",
                pafta: "12A-34B",
                ada: "567",
                parsel: "89",
                tarih: "2026-03-15",
                not: "GANTT ŞEMASI İNCELEMEK İÇİN OLUŞTURULMUŞ ÖRNEK İŞ.",
                tamamlandi: false,
                tahsilatOnayi: false,
                ruhsatOnayi: false,
                bitisTarihi: "2026-10-15",
                ortaklar: [
                    {ortakAdi:"AHMET YILMAZ MİMARLIK",brans:"MİMARİ PROJE",fiyatOnayTarihi:"2026-03-15",isVerildiTarihi:"2026-03-20",belgelerTarihi:"2026-04-01",cizimTarihi:"2026-05-15",baskiTarihi:"2026-06-01",imzaTarihi:"2026-06-10",projeTeslimTarihi:"2026-06-15",not:[]},
                    {ortakAdi:"ZEYNEP KAYA İNŞAAT",brans:"STATİK PROJE",fiyatOnayTarihi:"2026-04-01",isVerildiTarihi:"2026-04-05",belgelerTarihi:"2026-04-20",cizimTarihi:"2026-06-10",baskiTarihi:"",imzaTarihi:"",projeTeslimTarihi:"2026-07-15",not:[]},
                    {ortakAdi:"MEHMET DEMİR MÜHENDİSLİK",brans:"ELEKTRİK PROJESİ",fiyatOnayTarihi:"2026-05-01",isVerildiTarihi:"2026-05-10",belgelerTarihi:"2026-05-25",cizimTarihi:"",baskiTarihi:"",imzaTarihi:"",projeTeslimTarihi:"2026-08-01",not:[]},
                    {ortakAdi:"AYŞE ÇELİK TESİSAT",brans:"MEKANİK TESİSAT",fiyatOnayTarihi:"2026-06-01",isVerildiTarihi:"",belgelerTarihi:"",cizimTarihi:"",baskiTarihi:"",imzaTarihi:"",projeTeslimTarihi:"2026-09-01",not:[]}
                ]
            };
            var varsa = liste.some(function(x){return x.id === 999999;});
            if (!varsa) { liste.push(ornek); itDbKaydet(liste); }
            localStorage.setItem("tm_ornek_is_eklendi","1");
        }
        function itGanttGoster() {
            var konteyner = document.getElementById("itGanttContainer");
            itOrnekIsEkle();
            var liste = itDbYukle().filter(function(x){return !x.tamamlandi;});
            if (!liste.length) { konteyner.innerHTML = '<div class="it-gantt-notice"><div style="font-size:32px;margin-bottom:6px;"><i class="fa-solid fa-chart-simple"></i></div>Gantt şeması gösterilecek aktif iş bulunmamaktadır.<p>Yeni iş ekleyerek başlayın.</p></div>'; return; }
            var aylar = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
            var minDate = Infinity, maxDate = -Infinity;
            liste.forEach(function(is){
                var d = new Date(is.tarih || Date.now());
                if (d.getTime() < minDate) minDate = d.getTime();
                if (is.bitisTarihi) { var e = new Date(is.bitisTarihi); if (e.getTime() > maxDate) maxDate = e.getTime(); }
                else { var n = Date.now(); if (n > maxDate) maxDate = n; }
            });
            var minD = new Date(minDate); minD.setDate(1); minD.setMonth(minD.getMonth() - 1);
            var maxD = new Date(maxDate); maxD.setDate(1); maxD.setMonth(maxD.getMonth() + 2);
            var totalMonths = (maxD.getFullYear() - minD.getFullYear()) * 12 + (maxD.getMonth() - minD.getMonth());
            if (totalMonths < 2) { maxD.setMonth(maxD.getMonth() + 2); totalMonths += 2; }
            if (totalMonths > 24) { maxD.setMonth(minD.getMonth() + 24); totalMonths = 24; }
            var availW = konteyner.clientWidth - 230;
            if (availW < 300) availW = 300;
            var monthWidth = Math.floor(availW / totalMonths);
            if (monthWidth < 30) { monthWidth = 30; }
            var timelineW = totalMonths * monthWidth;
            var today = new Date(); today.setHours(0,0,0,0);
            function tarihToPx(t) {
                var diff = (t.getFullYear() - minD.getFullYear()) * 12 + (t.getMonth() - minD.getMonth()) + (t.getDate() - 1) / new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
                return Math.max(0, Math.min(timelineW, diff * monthWidth));
            }
            var todayLeft = tarihToPx(today);
            var renkPalet = ["#e53935","#1565C0","#2e7d32","#f9a825","#6a1b9a","#00838f","#d84315","#283593","#558b2f","#ad1457","#00acc1","#795548"];
            var h = '<div class="it-gantt-wrap"><table class="it-gantt-table"><thead><tr><th class="it-gantt-hdr-job">İş / Ortak</th>';
            var curD = new Date(minD);
            for (var m = 0; m < totalMonths; m++) {
                var yil = curD.getFullYear();
                var ay = curD.getMonth();
                var simdikiAy = (ay === today.getMonth() && yil === today.getFullYear());
                h += '<th class="it-gantt-hdr-month' + (simdikiAy ? ' it-gantt-hdr-current' : '') + '">' + aylar[ay] + (ay === 0 || m === 0 ? ' ' + yil : '') + '</th>';
                curD.setMonth(curD.getMonth() + 1);
            }
            h += '</tr></thead><tbody>';
            liste.forEach(function(is){
                var startDate = new Date(is.tarih || Date.now());
                var endDate = is.bitisTarihi ? new Date(is.bitisTarihi) : new Date(startDate.getTime() + 90*24*60*60*1000);
                if (endDate < startDate) endDate = new Date(startDate.getTime() + 90*24*60*60*1000);
                startDate.setHours(0,0,0,0); endDate.setHours(0,0,0,0);
                var leftPx = tarihToPx(startDate);
                var rightPx = tarihToPx(endDate);
                var widthPx = Math.max(8, rightPx - leftPx);
                if (leftPx + widthPx > timelineW) widthPx = timelineW - leftPx;
                var avgPct = itJobOrtalamaPct(is);
                var tTip = is.tur === "Taslak" ? "Taslak" : (is.tur === "Uygulama Proje" ? "UygulamaProje" : (is.tur === "3B Modelleme ve Tasarım" ? "3B" : "Diger"));
                var ortaklar = is.ortaklar || [];
                var rowspan = Math.max(1, ortaklar.length);
                var ASAMA_LIST = itAsamaList(is.tur);
                // Main job row
                h += '<tr class="it-gantt-job-row"><td class="it-gantt-job-cell" rowspan="' + rowspan + '"><div class="it-gantt-job-info"><div class="it-gantt-job-name">' + esc(is.isAdi || "İSİMSİZ") + ' <span class="it-gantt-tur-tag it-gantt-tur-' + tTip + '">' + esc(is.tur) + '</span> <span style="font-weight:700;font-size:10px;color:' + (avgPct>=75?'#2e7d32':avgPct>=50?'#f9a825':'#e53935') + ';">' + avgPct + '%</span></div></div></td>';
                h += '<td class="it-gantt-timeline-cell"><div class="it-gantt-bar-wrap">';
                var barColor = 'linear-gradient(90deg,#e53935,#f9a825,#4caf50)';
                h += '<div class="it-gantt-bar-main" style="left:' + leftPx + 'px;width:' + widthPx + 'px;">';
                if (avgPct > 0) { h += '<div class="it-gantt-bar-seg" style="width:' + Math.min(avgPct,100) + '%;background:' + barColor + ';"></div>'; }
                h += '<span class="it-gantt-bar-pct" style="font-size:' + (widthPx<40?'7px':'9px') + ';">' + avgPct + '%</span>';
                h += '</div>';
                // Milestones on main bar
                ortaklar.forEach(function(o, oi){
                    if (o.projeTeslimTarihi) {
                        var msDate = new Date(o.projeTeslimTarihi); msDate.setHours(0,0,0,0);
                        var msLeft = tarihToPx(msDate);
                        if (msLeft >= 0 && msLeft <= timelineW) {
                            h += '<div class="it-gantt-milestone" style="left:' + msLeft + 'px;" title="' + esc(o.ortakAdi || "") + ' teslim: ' + tarihStr(o.projeTeslimTarihi) + '"></div>';
                        }
                    }
                });
                if (todayLeft > 0 && todayLeft < timelineW) { h += '<div class="it-gantt-today-line" style="left:' + todayLeft + 'px;"></div>'; }
                h += '</div></td></tr>';
                // Partner sub-rows
                ortaklar.forEach(function(o, oi){
                    var renk = renkPalet[oi % renkPalet.length];
                    var pPct = itAsamaPct(o, ASAMA_LIST);
                    var pStart = new Date(o.fiyatOnayTarihi || o.isVerildiTarihi || is.tarih || Date.now());
                    pStart.setHours(0,0,0,0);
                    var pEnd = o.projeTeslimTarihi ? new Date(o.projeTeslimTarihi) : endDate;
                    pEnd.setHours(0,0,0,0);
                    var pLeft = tarihToPx(pStart);
                    var pRight = tarihToPx(pEnd);
                    var pWidth = Math.max(6, pRight - pLeft);
                    if (pLeft + pWidth > timelineW) pWidth = timelineW - pLeft;
                    h += '<tr class="it-gantt-ortak-row"><td class="it-gantt-ortak-cell"><div class="it-gantt-ortak-info"><span class="it-gantt-ortak-dot-sm" style="background:' + renk + ';"></span><span class="it-gantt-ortak-ad">' + esc(o.ortakAdi || "ORT-"+oi) + '</span><span class="it-gantt-ortak-brans">' + esc(o.brans || "") + '</span><span class="it-gantt-ortak-pct" style="color:' + (pPct>=75?'#2e7d32':pPct>=50?'#f9a825':'#e53935') + ';">' + pPct + '%</span></div></td>';
                    h += '<td class="it-gantt-timeline-cell"><div class="it-gantt-bar-wrap">';
                    h += '<div class="it-gantt-bar-ortak" style="left:' + pLeft + 'px;width:' + pWidth + 'px;background:' + renk + ';opacity:' + (pPct>0?0.85:0.35) + ';" title="' + esc(o.ortakAdi || "") + ' ' + pPct + '%">';
                    if (pPct > 0) { h += '<div class="it-gantt-bar-seg" style="width:' + Math.min(pPct,100) + '%;background:rgba(255,255,255,0.2);"></div>'; }
                    h += '<span class="it-gantt-bar-pct" style="font-size:8px;">' + pPct + '%</span>';
                    h += '</div>';
                    if (o.projeTeslimTarihi) {
                        var pmDate = new Date(o.projeTeslimTarihi); pmDate.setHours(0,0,0,0);
                        var pmLeft = tarihToPx(pmDate);
                        if (pmLeft >= 0 && pmLeft <= timelineW) {
                            h += '<div class="it-gantt-milestone-ortak" style="left:' + pmLeft + 'px;border-color:' + renk + ';" title="Teslim: ' + tarihStr(o.projeTeslimTarihi) + '"></div>';
                        }
                    }
                    if (todayLeft > 0 && todayLeft < timelineW) { h += '<div class="it-gantt-today-line" style="left:' + todayLeft + 'px;"></div>'; }
                    h += '</div></td></tr>';
                });
            });
            h += '</tbody></table></div>';
            konteyner.innerHTML = h;
        }
        function itAktifSortGuncelle(col) {
            if (itAktifSort.col === col) { itAktifSort.dir = itAktifSort.dir === "asc" ? "desc" : "asc"; }
            else { itAktifSort.col = col; itAktifSort.dir = "asc"; }
            itAktifKartlariGoster(document.querySelector("#itAktifSekmeBar .it-sekme-aktif").getAttribute("data-tur"));
        }

        function itTamamlananSortGuncelle(col) {
            if (itTamamlananSort.col === col) { itTamamlananSort.dir = itTamamlananSort.dir === "asc" ? "desc" : "asc"; }
            else { itTamamlananSort.col = col; itTamamlananSort.dir = "asc"; }
            itTamamlananTablosuGoster(document.querySelector("#itTamamlananSekmeBar .it-sekme-aktif").getAttribute("data-tur"));
        }

        function itRowToggle(id) {
            var aktifRow = document.getElementById("itDetayRow_" + id);
            var tamRow = document.getElementById("itTamDetayRow_" + id);
            var aktifIcon = document.getElementById("itExpandIcon_" + id);
            var tamIcon = document.getElementById("itTamExpandIcon_" + id);
            if (aktifRow) {
                aktifRow.classList.toggle("open");
                if (aktifIcon) aktifIcon.innerHTML = aktifRow.classList.contains("open") ? '<i class="fa-solid fa-chevron-down"></i>' : '<i class="fa-solid fa-chevron-right"></i>';
            }
            if (tamRow) {
                tamRow.classList.toggle("open");
                if (tamIcon) tamIcon.innerHTML = tamRow.classList.contains("open") ? '<i class="fa-solid fa-chevron-down"></i>' : '<i class="fa-solid fa-chevron-right"></i>';
            }
        }

        function itBolumToggle(id) {
            var bolum = document.getElementById(id);
            if (!bolum) return;
            bolum.classList.toggle("it-bolum-kapali");
            var ok = document.getElementById(id + "Ok");
            if (ok) ok.innerHTML = bolum.classList.contains("it-bolum-kapali") ? '<i class="fa-solid fa-chevron-right"></i>' : '<i class="fa-solid fa-chevron-down"></i>';
        }

        function itSayaciGuncelle() {
            var sayac = document.getElementById("itSayac");
            var liste = itDbYukle();
            if (sayac) sayac.innerText = liste.length + " kayıt";
            var aktif = liste.filter(function(x){return !x.tamamlandi;});
            var tamam = liste.filter(function(x){return x.tamamlandi;});
            var turler = ["Taslak","Uygulama Proje","3B Modelleme ve Tasarım","Diğer"];
            var aktifIds = ["itAktifTaslak","itAktifUP","itAktif3B","itAktifDiger"];
            var tamamIds = ["itTamamTaslak","itTamamUP","itTamam3B","itTamamDiger"];
            document.getElementById("itAktifToplam").innerText = aktif.length;
            document.getElementById("itTamamToplam").innerText = tamam.length;
            turler.forEach(function(t,i){
                document.getElementById(aktifIds[i]).innerText = aktif.filter(function(x){return x.tur===t;}).length;
                document.getElementById(tamamIds[i]).innerText = tamam.filter(function(x){return x.tur===t;}).length;
            });
        }

        function itGoster() {
            var acikDetayIds = itAcKalanKaydet();
            var acikOrtakCardIds = [];
            document.querySelectorAll(".it-ortak-card-body:not(.closed)").forEach(function(el){ acikOrtakCardIds.push(el.id); });
            var acikOrtakEkleIds = [];
            document.querySelectorAll("[id^='itOrtakEkleBody_']").forEach(function(el){ if (el.style.display !== 'none') acikOrtakEkleIds.push(el.id); });
            itSayaciGuncelle();
            var aktifTur = document.querySelector("#itAktifSekmeBar .it-sekme-aktif");
            itAktifKartlariGoster(aktifTur ? aktifTur.getAttribute("data-tur") : "Taslak");
            var tamamlananTur = document.querySelector("#itTamamlananSekmeBar .it-sekme-aktif");
            itTamamlananTablosuGoster(tamamlananTur ? tamamlananTur.getAttribute("data-tur") : "Taslak");
            itAcKalanYukle(acikDetayIds);
            acikOrtakCardIds.forEach(function(id) {
                var el = document.getElementById(id);
                if (el) el.classList.remove('closed');
            });
            acikOrtakEkleIds.forEach(function(id) {
                var el = document.getElementById(id);
                if (el) {
                    el.style.display = 'block';
                    var jobId = id.replace('itOrtakEkleBody_', '');
                    var icon = document.getElementById("itOrtakEkleIcon_" + jobId);
                    if (icon) icon.innerText = '¡';
                }
            });
        }

        function itOrtakListesiGetir() {
            var db = JSON.parse(localStorage.getItem("tm_isortaklari_db")) || [];
            var liste = [];
            db.forEach(function(o) {
                var ad = (o.ad||"").toUpperCase().trim();
                var sirket = (o.sirket||"").toUpperCase().trim();
                liste.push({ id: o.id, ad: ad, sirket: sirket, brans: (o.brans||"").toUpperCase().trim() });
            });
            liste.sort(function(a,b){ return a.ad.localeCompare(b.ad); });
            return liste;
        }

        function itBransListesiGetir() {
            try { return JSON.parse(localStorage.getItem("tm_piyasa_dallari_v2")) || []; } catch(e) { return []; }
        }

        function itOrtakSecimHtml(jobId, readonly) {
            var job = itDbYukle().find(function(x){return x.id===jobId;});
            if (!job) return '';
            var ortaklar = itOrtakListesiGetir();
            var branslar = itBransListesiGetir();
            var h = '<div class="it-detay-ortaklar" style="margin-top:8px;">';
            var isTaslak = job.tur === "Taslak";
            var is3B = job.tur === "3B Modelleme ve Tasarım";
            var isDiger = job.tur === "Diğer";
            var ASAMA_LIST = itAsamaList(job.tur);
            var ASAMA_RENKLER = itAsamaRenkler(job.tur);
            (job.ortaklar||[]).forEach(function(o,i){
                var pct = itAsamaPct(o, ASAMA_LIST);
                if (readonly) {
                    var _d2r = ''; var _r2r = '#e53935';
                    if (isTaslak) {
                        if (o.cizimTarihi) { _d2r = 'TAMAMLANDI'; _r2r = '#2e7d32'; }
                        else if (o.belgelerTarihi || o.isVerildiTarihi) { _d2r = 'çizim aşamasında'; _r2r = '#e53935'; }
                    } else if (is3B) {
                        if (o.projeTeslimTarihi) { _d2r = 'TAMAMLANDI'; _r2r = '#2e7d32'; }
                        else if (o.cizimTarihi) { _d2r = 'PROJE TESLİM AŞAMASINDA'; _r2r = '#f9a825'; }
                        else if (o.belgelerTarihi || o.isVerildiTarihi) { _d2r = 'ÇİZİM AŞAMASINDA'; _r2r = '#ef6c00'; }
                        else if (o.fiyatOnayTarihi) { _d2r = 'İŞ VERİLMEYİ BEKLİYOR'; _r2r = '#e53935'; }
                    } else if (isDiger) {
                        if (o.projeTeslimTarihi) { _d2r = 'TAMAMLANDI'; _r2r = '#2e7d32'; }
                        else if (o.cizimTarihi) { _d2r = 'İŞ TESLİM AŞAMASINDA'; _r2r = '#f9a825'; }
                        else if (o.belgelerTarihi || o.isVerildiTarihi) { _d2r = 'ÇİZİM AŞAMASINDA'; _r2r = '#ef6c00'; }
                        else if (o.fiyatOnayTarihi) { _d2r = 'İŞ VERİLMEYİ BEKLİYOR'; _r2r = '#e53935'; }
                    } else {
                        if (o.projeTeslimTarihi) { _d2r = 'TAMAMLANDI'; _r2r = '#2e7d32'; }
                        else if (o.baskiTarihi) { _d2r = 'imza aşamasında'; _r2r = '#7cb342'; }
                        else if (o.cizimTarihi) { _d2r = 'Baskı Aşamasında'; _r2r = '#f9a825'; }
                        else if (o.belgelerTarihi || o.isVerildiTarihi) { _d2r = 'çizim aşamasında'; _r2r = '#ef6c00'; }
                        else if (o.fiyatOnayTarihi) { _d2r = 'İş Verilmeyi Bekliyor'; _r2r = '#e53935'; }
                    }
                    h += '<div style="border:1px solid var(--border-color);border-radius:8px;padding:8px 12px;margin-top:4px;display:flex;align-items:center;gap:8px;">';
                    h += '<span style="font-weight:700;flex:1;">' + esc(o.ortakAdi||'') + ' - ' + esc(o.brans||'') + '</span>';
                    h += '<span style="font-size:10px;font-weight:700;text-transform:uppercase;color:#fff;background:' + _r2r + ';padding:2px 8px;border-radius:4px;white-space:nowrap;">' + _d2r + '</span>';
                    h += '<span style="font-weight:700;font-size:11px;min-width:30px;text-align:right;">' + pct + '%</span>';
                    h += '</div>';
                    return;
                }
                var durumClass = '';
                if (isTaslak) {
                    durumClass = o.cizimTarihi ? 'it-ortak-durum-teslim' : (pct > 0 ? 'it-ortak-durum-gonder' : 'it-ortak-durum-none');
                } else if (is3B || isDiger) {
                    durumClass = o.projeTeslimTarihi ? 'it-ortak-durum-teslim' : (pct > 0 ? 'it-ortak-durum-gonder' : 'it-ortak-durum-none');
                } else {
                    durumClass = o.projeTeslimTarihi ? 'it-ortak-durum-teslim' : (pct > 0 ? 'it-ortak-durum-gonder' : 'it-ortak-durum-none');
                }
                h += '<div class="it-ortak-card ' + durumClass + '" id="itOrtakCard_' + jobId + '_' + i + '">';
                h += '<div class="it-ortak-header it-ortak-card-header-click" onclick="itOrtakCardToggle(\'' + jobId + '_' + i + '\')">';
                h += '<span style="font-weight:700;">' + esc(o.ortakAdi||'') + ' - ' + esc(o.brans||'') + '</span>';
                var _d2 = '';
                var _r2 = '#e53935';
                if (isTaslak) {
                    if (o.cizimTarihi) { _d2 = 'TAMAMLANDI'; _r2 = '#2e7d32'; }
                    else if (o.belgelerTarihi || o.isVerildiTarihi) { _d2 = 'çizim aşamasında'; _r2 = '#e53935'; }
                } else if (is3B) {
                    if (o.projeTeslimTarihi) { _d2 = 'TAMAMLANDI'; _r2 = '#2e7d32'; }
                    else if (o.cizimTarihi) { _d2 = 'PROJE TESLİM AŞAMASINDA'; _r2 = '#f9a825'; }
                    else if (o.belgelerTarihi || o.isVerildiTarihi) { _d2 = 'ÇİZİM AŞAMASINDA'; _r2 = '#ef6c00'; }
                    else if (o.fiyatOnayTarihi) { _d2 = 'İŞ VERİLMEYİ BEKLİYOR'; _r2 = '#e53935'; }
                } else if (isDiger) {
                    if (o.projeTeslimTarihi) { _d2 = 'TAMAMLANDI'; _r2 = '#2e7d32'; }
                    else if (o.cizimTarihi) { _d2 = 'İŞ TESLİM AŞAMASINDA'; _r2 = '#f9a825'; }
                    else if (o.belgelerTarihi || o.isVerildiTarihi) { _d2 = 'ÇİZİM AŞAMASINDA'; _r2 = '#ef6c00'; }
                    else if (o.fiyatOnayTarihi) { _d2 = 'İŞ VERİLMEYİ BEKLİYOR'; _r2 = '#e53935'; }
                } else {
                    if (o.projeTeslimTarihi) { _d2 = 'TAMAMLANDI'; _r2 = '#2e7d32'; }
                    else if (o.baskiTarihi) { _d2 = 'imza aşamasında'; _r2 = '#7cb342'; }
                    else if (o.cizimTarihi) { _d2 = 'Baskı Aşamasında'; _r2 = '#f9a825'; }
                    else if (o.belgelerTarihi || o.isVerildiTarihi) { _d2 = 'çizim aşamasında'; _r2 = '#ef6c00'; }
                    else if (o.fiyatOnayTarihi) { _d2 = 'İş Verilmeyi Bekliyor'; _r2 = '#e53935'; }
                }
                h += '<span id="itDurumText_' + jobId + '_' + i + '" style="font-size:10px;font-weight:700;text-transform:uppercase;color:#fff;background:' + _r2 + ';padding:2px 8px;border-radius:4px;white-space:nowrap;">' + _d2 + '</span>';
                h += '<span style="display:flex;align-items:center;gap:6px;">';
                h += '<span id="itOrtakPct_' + jobId + '_' + i + '" style="font-weight:700;min-width:24px;text-align:right;font-size:11px;">' + pct + '%</span>';
                h += '<div style="width:60px;height:6px;background:var(--border-color);border-radius:3px;overflow:hidden;"><div id="itOrtakMiniBar_' + jobId + '_' + i + '" style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,#e53935,' + (isTaslak ? '#2e7d32' : '#f9a825,#4caf50') + ');border-radius:3px;"></div></div>';
                h += '<span class="it-ortak-card-toggle-icon" id="itOrtakToggleIcon_' + jobId + '_' + i + '"><i class="fa-solid fa-chevron-down"></i></span>';
                h += '<span onclick="event.stopPropagation();itOrtakKaldir(' + jobId + ',' + i + ')" style="cursor:pointer;color:#e53935;font-weight:700;font-size:16px;"><i class="fa-solid fa-xmark"></i></span>';
                h += '</span></div>';
                h += '<div class="it-ortak-card-body closed" id="itOrtakBody_' + jobId + '_' + i + '">';
                h += '<div class="it-asama-bar-container"><div class="it-asama-bar-title"><i class="fa-solid fa-chart-simple"></i> İşin Tamamlanma Durumu</div><div class="it-asama-bar-track"><div class="it-asama-bar-fill" id="itOrtakBar_' + jobId + '_' + i + '" style="width:' + pct + '%;background:linear-gradient(90deg,#e53935,' + (isTaslak ? '#2e7d32' : '#f9a825,#4caf50') + ');"></div><span class="it-asama-bar-text" id="itOrtakBarText_' + jobId + '_' + i + '">' + pct + '%</span></div></div>';
                h += '<div class="it-asama-steps">';
                var nextAc = true;
                ASAMA_LIST.forEach(function(a, ai){
                    var completed = !!o[a.field];
                    var isNext = nextAc && !completed;
                    if (isNext) nextAc = false;
                    var segClass = completed ? 'completed' : (isNext ? 'next' : 'pending');
                    var bgColor = completed ? ASAMA_RENKLER[ai] : (isNext ? ASAMA_RENKLER[ai] : '');
                    var displayDate = o[a.field] ? tarihStr(o[a.field]) : '-';
                    h += '<div class="it-asama-step"><button class="it-asama-segment ' + segClass + '" style="' + (bgColor ? 'background:' + bgColor + ';' : '') + '" id="itAsamaBtn_' + jobId + '_' + i + '_' + a.field + '" onclick="event.stopPropagation();itAsamaToggle(' + jobId + ',' + i + ',\'' + a.field + '\')"><span class="it-asama-seg-label">' + (completed ? '<i class="fa-solid fa-check" style="font-size:9px;margin-right:3px;"></i> ' : '') + a.label + '</span><span class="it-asama-seg-date" id="itAsamaTarih_' + jobId + '_' + i + '_' + a.field + '">' + displayDate + '</span></button></div>';
                });
                h += '</div>';
                h += '<div class="it-asama-row" style="margin-top:4px;border-bottom:none;flex-direction:column;align-items:stretch;">';
                var notlar = Array.isArray(o.not) ? o.not : [];
                h += '<div class="it-not-list" id="itNotList_' + jobId + '_' + i + '">';
                notlar.forEach(function(n, ni){
                    h += '<div class="it-not-item" id="itNotItem_' + jobId + '_' + i + '_' + ni + '">';
                    h += '<span class="it-not-text" id="itNotText_' + jobId + '_' + i + '_' + ni + '">' + esc(n.text||'') + '</span>';
                    h += '<span class="it-not-duzenle" id="itNotDuzenle_' + jobId + '_' + i + '_' + ni + '" onclick="event.stopPropagation();itOrtakNotDuzenleBaslat(' + jobId + ',' + i + ',' + ni + ')"><i class="fa-regular fa-pen-to-square"></i></span>';
                    h += '<span class="it-not-sil" onclick="event.stopPropagation();itOrtakNotSil(' + jobId + ',' + i + ',' + ni + ')"><i class="fa-solid fa-xmark"></i></span>';
                    h += '</div>';
                });
                h += '</div>';
                h += '<div style="display:flex;gap:4px;"><input id="itOrtakNotInput_' + jobId + '_' + i + '" placeholder="NOT EKLE" style="flex:1;padding:4px 8px;border:1px solid var(--border-color);border-radius:4px;background:var(--bg-main);font-size:12px;text-transform:uppercase;" onkeydown="if(event.key===\'Enter\'){event.stopPropagation();itOrtakNotEkle(' + jobId + ',' + i + ')}"><button class="btn btn-primary btn-sm" onclick="event.stopPropagation();itOrtakNotEkle(' + jobId + ',' + i + ')" style="white-space:nowrap;">+</button></div>';
                h += '</div>';
                h += '</div></div>';
            });
            if (!readonly) {
                h += '<div class="it-ortak-ekle-panel" style="margin-top:10px;border:1px dashed var(--border-color);border-radius:8px;background:var(--bg-main);">';
                h += '<div onclick="event.stopPropagation();itOrtakEkleToggle(\'' + jobId + '\')" style="cursor:pointer;padding:12px;font-size:12px;font-weight:700;text-transform:uppercase;color:var(--text-light);display:flex;align-items:center;gap:6px;">';
                h += '<span id="itOrtakEkleIcon_' + jobId + '" style="font-size:10px;"><i class="fa-solid fa-chevron-right"></i></span> <i class="fa-solid fa-plus"></i> YENİ İŞ ORTAĞI EKLE</div>';
                h += '<div id="itOrtakEkleBody_' + jobId + '" style="display:none;padding:0 12px 12px;">';
                h += '<div style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;">';
                h += '<div style="flex:1;min-width:160px;"><div style="font-size:10px;font-weight:600;text-transform:uppercase;color:var(--text-light);margin-bottom:2px;">İŞ ORTAĞI</div>';
                h += '<select id="itOrtakEkleSec_' + jobId + '" style="width:100%;padding:7px 8px;border-radius:6px;border:1px solid var(--border-color);background:var(--bg-main);font-size:12px;text-transform:uppercase;">';
                h += '<option value="">-- SEÇİNİZ --</option>';
                ortaklar.forEach(function(o){
                    h += '<option value="' + esc(o.ad) + '">' + esc(o.ad) + (o.sirket && o.sirket !== "BİREYSEL" ? ' (' + esc(o.sirket) + ')' : '') + '</option>';
                });
                h += '</select></div>';
                h += '<div style="flex:1;min-width:160px;"><div style="font-size:10px;font-weight:600;text-transform:uppercase;color:var(--text-light);margin-bottom:2px;">HİZMET BRANŞI</div>';
                h += '<select id="itOrtakBransSec_' + jobId + '" style="width:100%;padding:7px 8px;border-radius:6px;border:1px solid var(--border-color);background:var(--bg-main);font-size:12px;text-transform:uppercase;">';
                h += '<option value="">-- SEÇİNİZ --</option>';
                branslar.forEach(function(b){
                    h += '<option value="' + esc(b) + '">' + esc(b) + '</option>';
                });
                h += '</select></div>';
                h += '<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();itOrtakEkleDetay(' + jobId + ')" style="white-space:nowrap;height:32px;"><i class="fa-solid fa-plus"></i> EKLE</button>';
                h += '</div></div></div>';
            }
            var jobNot = (job.not||"").trim();
            h += '<div class="it-not-panel' + (jobNot ? ' has-not' : '') + '" onclick="event.stopPropagation();itNotPopupAc(' + jobId + ')">';
            h += '<div><i class="fa-solid fa-thumbtack"></i> NOTLAR' + (jobNot ? ' <span style="font-size:10px;color:var(--accent-red);"><i class="fa-solid fa-circle"></i></span>' : '') + '</div>';
            h += '</div>';
            return h;
        }

        function itAcKalanKaydet() {
            var ids = [];
            document.querySelectorAll('.it-row-detail.open').forEach(function(el){ids.push(el.id);});
            return ids;
        }
        function itAcKalanYukle(ids) {
            ids.forEach(function(id){
                var el = document.getElementById(id);
                if (!el) return;
                el.classList.add('open');
                var icon = document.getElementById(id.indexOf('itDetayRow_')===0 ? id.replace('itDetayRow_','itExpandIcon_') : id.replace('itTamDetayRow_','itTamExpandIcon_'));
                if (icon) icon.innerText = '¡';
            });
        }

        function itOrtakEkleToggle(jobId) {
            var body = document.getElementById("itOrtakEkleBody_" + jobId);
            var icon = document.getElementById("itOrtakEkleIcon_" + jobId);
            if (!body) return;
            var shown = body.style.display !== 'none';
            body.style.display = shown ? 'none' : 'block';
            if (icon) icon.innerHTML = shown ? '<i class="fa-solid fa-chevron-right"></i>' : '<i class="fa-solid fa-chevron-down"></i>';
        }
        function itOrtakEkleDetay(jobId) {
            var ortakAd = document.getElementById("itOrtakEkleSec_" + jobId).value;
            var brans = document.getElementById("itOrtakBransSec_" + jobId).value;
            if (!ortakAd || !brans) { tmNotify("Lütfen ortak ve branş seçin!", "error"); return; }
            var liste = itDbYukle();
            var idx = liste.findIndex(function(x){return x.id===jobId;});
            if (idx === -1) return;
            var openIds = itAcKalanKaydet();
            if (!liste[idx].ortaklar) liste[idx].ortaklar = [];
            var yeni = { ortakAdi: ortakAd, brans: brans, not: [] };
            var ekleTur = liste[idx].tur;
            itAsamaList(ekleTur).forEach(function(a){ yeni[a.field] = ""; });
            liste[idx].ortaklar.push(yeni);
            itDbKaydet(liste);
            itGoster();
            itAcKalanYukle(openIds);
            tmNotify("Ortak eklendi.", "success");
        }

        function itOrtakKaldir(jobId, index) {
            var liste = itDbYukle();
            var idx = liste.findIndex(function(x){return x.id===jobId;});
            if (idx === -1) return;
            var openIds = itAcKalanKaydet();
            liste[idx].ortaklar.splice(index, 1);
            itDbKaydet(liste);
            itGoster();
            itAcKalanYukle(openIds);
        }

        function itOrtakCardToggle(key) {
            var body = document.getElementById("itOrtakBody_" + key);
            var icon = document.getElementById("itOrtakToggleIcon_" + key);
            if (!body) return;
            body.classList.toggle("closed");
            if (icon) icon.innerHTML = body.classList.contains("closed") ? '<i class="fa-solid fa-chevron-down"></i>' : '<i class="fa-solid fa-chevron-up"></i>';
        }

        function itAsamaToggle(jobId, index, field) {
            var liste = itDbYukle();
            var idx = liste.findIndex(function(x){return x.id===jobId;});
            if (idx === -1) return;
            var tur = liste[idx].tur;
            var o = liste[idx].ortaklar[index];
            if (!o) return;
            var ASAMA_LIST = itAsamaList(tur);
            var asamaIdx = 0;
            ASAMA_LIST.some(function(a, ai){ if (a.field === field) { asamaIdx = ai; return true; } });
            if (!o[field] && asamaIdx > 0) {
                var prev = ASAMA_LIST[asamaIdx - 1];
                if (!o[prev.field]) {
                    tmNotify("Önce " + prev.label + " adımını tamamlayın!", "error"); return;
                }
            }
            if (o[field]) { o[field] = ""; } else { o[field] = anlikTarihGetir(); }
            itDbKaydet(liste);
            var dateSpan = document.getElementById("itAsamaTarih_" + jobId + "_" + index + "_" + field);
            if (dateSpan) dateSpan.innerText = o[field] ? tarihStr(o[field]) : '-';
            itOrtakGoruntuGuncelle(jobId, index, o, tur);
            itJobStatusGuncelle(jobId);
            // Re-render all segment classes for this partner (since next may shift)
            var ASAMA_RENKLER = itAsamaRenkler(tur);
            var partner = liste[idx].ortaklar[index];
            var nextAc = true;
            ASAMA_LIST.forEach(function(a, ai){
                var btn = document.getElementById("itAsamaBtn_" + jobId + "_" + index + "_" + a.field);
                if (!btn) return;
                var completed = !!partner[a.field];
                var isNext = nextAc && !completed;
                if (isNext) nextAc = false;
                var segClass = completed ? 'completed' : (isNext ? 'next' : 'pending');
                btn.className = 'it-asama-segment ' + segClass;
                btn.style.background = (completed || isNext) ? ASAMA_RENKLER[ai] : '';
                var label = btn.querySelector('.it-asama-seg-label');
                if (label) label.innerHTML = (completed ? '<i class="fa-solid fa-check" style="font-size:9px;margin-right:3px;"></i> ' : '') + a.label;
            });
            // Dinamik olarak TAHSİLAT ONAYI ve İŞ TAMAMLANDI butonlarını göster/gizle
            var is_ = liste[idx];
            var isTam2 = itJobOrtalamaPct(is_) === 100 && (is_.ortaklar||[]).length > 0;
            var actionsDiv = document.querySelector('#itDetayRow_' + jobId + ' .it-detay-actions');
            if (actionsDiv) {
                var silBtn = actionsDiv.querySelector('.it-btn-sil');
                var tahsilatBtn = actionsDiv.querySelector('.it-btn-tahsilat');
                var tahsilatBadge = actionsDiv.querySelector('.it-tahsilat-badge');
                var ruhsatBtn = actionsDiv.querySelector('.it-btn-ruhsat');
                var ruhsatBadge = actionsDiv.querySelector('.it-ruhsat-badge');
                var tamamBtn = actionsDiv.querySelector('.it-btn-tamamla');
                // Remove existing dynamic elements except sil
                if (tahsilatBtn) tahsilatBtn.remove();
                if (tahsilatBadge) tahsilatBadge.remove();
                if (ruhsatBtn) ruhsatBtn.remove();
                if (ruhsatBadge) ruhsatBadge.remove();
                if (tamamBtn) tamamBtn.remove();
                // Add appropriate elements
                if (isTam2 && is_.tur === "Taslak") {
                    var btn = document.createElement('button'); btn.className = 'it-btn-tamamla'; btn.style.background = '#2e7d32';
                    btn.onclick = function(e) { e.stopPropagation(); itTamamla(jobId); }; btn.innerHTML = '<i class="fa-solid fa-check"></i> İŞ TAMAMLANDI';
                    if (silBtn) actionsDiv.insertBefore(btn, silBtn); else actionsDiv.appendChild(btn);
                } else if (isTam2 && is_.tur === "Uygulama Proje") {
                    if (!is_.ruhsatOnayi) {
                        var rBtn = document.createElement('button'); rBtn.className = 'it-btn-ruhsat';
                        rBtn.onclick = function(e) { e.stopPropagation(); itRuhsatOnayiVer(jobId); }; rBtn.innerHTML = '<i class="fa-solid fa-stamp"></i> RUHSAT ONAYI ALINDI';
                        if (silBtn) actionsDiv.insertBefore(rBtn, silBtn); else actionsDiv.appendChild(rBtn);
                    } else {
                        var rSp = document.createElement('span'); rSp.className = 'it-ruhsat-badge'; rSp.innerHTML = '<i class="fa-solid fa-stamp"></i> RUHSAT ONAYI ALINDI';
                        if (silBtn) actionsDiv.insertBefore(rSp, silBtn); else actionsDiv.appendChild(rSp);
                    }
                    if (!is_.tahsilatOnayi) {
                        var tBtn = document.createElement('button'); tBtn.className = 'it-btn-tahsilat';
                        tBtn.onclick = function(e) { e.stopPropagation(); itTahsilatOnayiVer(jobId); }; tBtn.innerHTML = '<i class="fa-solid fa-check"></i> TAHSİLAT ONAYI VER';
                        if (silBtn) actionsDiv.insertBefore(tBtn, silBtn); else actionsDiv.appendChild(tBtn);
                    } else {
                        var tSp = document.createElement('span'); tSp.className = 'it-tahsilat-badge'; tSp.innerHTML = '<i class="fa-solid fa-check"></i> İŞİN TAHSİLATI ONAYLANDI';
                        if (silBtn) actionsDiv.insertBefore(tSp, silBtn); else actionsDiv.appendChild(tSp);
                    }
                    if (is_.ruhsatOnayi && is_.tahsilatOnayi) {
                        var btn = document.createElement('button'); btn.className = 'it-btn-tamamla'; btn.style.background = '#2e7d32';
                        btn.onclick = function(e) { e.stopPropagation(); itTamamla(jobId); }; btn.innerHTML = '<i class="fa-solid fa-check"></i> İŞ TAMAMLANDI';
                        if (silBtn) actionsDiv.insertBefore(btn, silBtn); else actionsDiv.appendChild(btn);
                    }
                } else if (isTam2 && is_.tahsilatOnayi) {
                    var sp = document.createElement('span'); sp.className = 'it-tahsilat-badge'; sp.innerHTML = '<i class="fa-solid fa-check"></i> İŞİN TAHSİLATI ONAYLANDI';
                    if (silBtn) actionsDiv.insertBefore(sp, silBtn); else actionsDiv.appendChild(sp);
                    var btn = document.createElement('button'); btn.className = 'it-btn-tamamla'; btn.style.background = '#2e7d32';
                    btn.onclick = function(e) { e.stopPropagation(); itTamamla(jobId); }; btn.innerHTML = '<i class="fa-solid fa-check"></i> İŞ TAMAMLANDI';
                    if (silBtn) actionsDiv.insertBefore(btn, silBtn); else actionsDiv.appendChild(btn);
                } else if (isTam2 && !is_.tahsilatOnayi) {
                    var btn2 = document.createElement('button'); btn2.className = 'it-btn-tahsilat';
                    btn2.onclick = function(e) { e.stopPropagation(); itTahsilatOnayiVer(jobId); }; btn2.innerHTML = '<i class="fa-solid fa-check"></i> TAHSİLAT ONAYI VER';
                    if (silBtn) actionsDiv.insertBefore(btn2, silBtn); else actionsDiv.appendChild(btn2);
                }
            }
        }

        function itOrtakGoruntuGuncelle(jobId, index, o, tur) {
            tur = tur || '';
            var ASAMA_LIST = itAsamaList(tur);
            var pct = itAsamaPct(o, ASAMA_LIST);
            var durumClass = '';
            if (tur === "Taslak") {
                durumClass = o.cizimTarihi ? 'it-ortak-durum-teslim' : (pct > 0 ? 'it-ortak-durum-gonder' : 'it-ortak-durum-none');
            } else if (tur === "3B Modelleme ve Tasarım" || tur === "Diğer") {
                durumClass = o.projeTeslimTarihi ? 'it-ortak-durum-teslim' : (pct > 0 ? 'it-ortak-durum-gonder' : 'it-ortak-durum-none');
            } else {
                durumClass = o.projeTeslimTarihi ? 'it-ortak-durum-teslim' : (pct > 0 ? 'it-ortak-durum-gonder' : 'it-ortak-durum-none');
            }
            var card = document.getElementById("itOrtakCard_" + jobId + "_" + index);
            if (card) { card.className = 'it-ortak-card ' + durumClass; }
            var bar = document.getElementById("itOrtakBar_" + jobId + "_" + index);
            if (bar) bar.style.width = pct + '%';
            var barText = document.getElementById("itOrtakBarText_" + jobId + "_" + index);
            if (barText) barText.innerText = pct + '%';
            var miniBar = document.getElementById("itOrtakMiniBar_" + jobId + "_" + index);
            if (miniBar) miniBar.style.width = pct + '%';
            var pctLabel = document.getElementById("itOrtakPct_" + jobId + "_" + index);
            if (pctLabel) pctLabel.innerText = pct + '%';
            var durumSpan = document.getElementById("itDurumText_" + jobId + "_" + index);
            if (durumSpan) {
                var _d2 = ''; var _r2 = '#e53935';
                if (tur === "Taslak") {
                    if (o.cizimTarihi) { _d2 = 'TAMAMLANDI'; _r2 = '#2e7d32'; }
                    else if (o.belgelerTarihi || o.isVerildiTarihi) { _d2 = 'çizim aşamasında'; _r2 = '#e53935'; }
                } else if (tur === "3B Modelleme ve Tasarım") {
                    if (o.projeTeslimTarihi) { _d2 = 'TAMAMLANDI'; _r2 = '#2e7d32'; }
                    else if (o.cizimTarihi) { _d2 = 'PROJE TESLİM AŞAMASINDA'; _r2 = '#f9a825'; }
                    else if (o.belgelerTarihi || o.isVerildiTarihi) { _d2 = 'ÇİZİM AŞAMASINDA'; _r2 = '#ef6c00'; }
                    else if (o.fiyatOnayTarihi) { _d2 = 'İŞ VERİLMEYİ BEKLİYOR'; _r2 = '#e53935'; }
                } else if (tur === "Diğer") {
                    if (o.projeTeslimTarihi) { _d2 = 'TAMAMLANDI'; _r2 = '#2e7d32'; }
                    else if (o.cizimTarihi) { _d2 = 'İŞ TESLİM AŞAMASINDA'; _r2 = '#f9a825'; }
                    else if (o.belgelerTarihi || o.isVerildiTarihi) { _d2 = 'ÇİZİM AŞAMASINDA'; _r2 = '#ef6c00'; }
                    else if (o.fiyatOnayTarihi) { _d2 = 'İŞ VERİLMEYİ BEKLİYOR'; _r2 = '#e53935'; }
                } else {
                    if (o.projeTeslimTarihi) { _d2 = 'TAMAMLANDI'; _r2 = '#2e7d32'; }
                    else if (o.baskiTarihi) { _d2 = 'imza aşamasında'; _r2 = '#7cb342'; }
                    else if (o.cizimTarihi) { _d2 = 'Baskı Aşamasında'; _r2 = '#f9a825'; }
                    else if (o.belgelerTarihi || o.isVerildiTarihi) { _d2 = 'çizim aşamasında'; _r2 = '#ef6c00'; }
                    else if (o.fiyatOnayTarihi) { _d2 = 'İş Verilmeyi Bekliyor'; _r2 = '#e53935'; }
                }
                durumSpan.innerText = _d2;
                durumSpan.style.background = _r2;
                durumSpan.style.color = _r2 === '#f9a825' ? '#222' : '#fff';
            }
        }

        function itOrtakNotEkle(jobId, oIdx) {
            var input = document.getElementById("itOrtakNotInput_" + jobId + "_" + oIdx);
            if (!input) return;
            var val = input.value.trim().toUpperCase();
            if (!val) return;
            var liste = itDbYukle();
            var idx = liste.findIndex(function(x){return x.id===jobId;});
            if (idx === -1) return;
            var o = liste[idx].ortaklar[oIdx];
            if (!o) return;
            if (!Array.isArray(o.not)) o.not = [];
            o.not.push({ id: Date.now(), text: val });
            itDbKaydet(liste);
            input.value = '';
            itOrtakNotRender(jobId, oIdx);
        }
        function itOrtakNotSil(jobId, oIdx, nIdx) {
            var liste = itDbYukle();
            var idx = liste.findIndex(function(x){return x.id===jobId;});
            if (idx === -1) return;
            var o = liste[idx].ortaklar[oIdx];
            if (!o || !Array.isArray(o.not)) return;
            o.not.splice(nIdx, 1);
            itDbKaydet(liste);
            itOrtakNotRender(jobId, oIdx);
        }
        function itOrtakNotDuzenleBaslat(jobId, oIdx, nIdx) {
            var liste = itDbYukle();
            var idx = liste.findIndex(function(x){return x.id===jobId;});
            if (idx === -1) return;
            var o = liste[idx].ortaklar[oIdx];
            if (!o || !Array.isArray(o.not) || !o.not[nIdx]) return;
            var item = document.getElementById("itNotItem_" + jobId + "_" + oIdx + "_" + nIdx);
            if (!item) return;
            var textSpan = document.getElementById("itNotText_" + jobId + "_" + oIdx + "_" + nIdx);
            var duzenleBtn = document.getElementById("itNotDuzenle_" + jobId + "_" + oIdx + "_" + nIdx);
            if (!textSpan) return;
            var curText = o.not[nIdx].text;
            textSpan.style.display = 'none';
            if (duzenleBtn) duzenleBtn.style.display = 'none';
            var inp = document.createElement('input');
            inp.type = 'text';
            inp.value = curText;
            inp.style.cssText = 'flex:1;padding:2px 6px;border:1px solid #1565C0;border-radius:3px;background:var(--bg-main);font-size:12px;text-transform:uppercase;';
            inp.setAttribute('data-jobid', jobId);
            inp.setAttribute('data-oix', oIdx);
            inp.setAttribute('data-nix', nIdx);
            inp.onkeydown = function(e) {
                if (e.key === 'Escape') { e.stopPropagation(); itOrtakNotDuzenleIptal(inp); }
            };
            var kaydetBtn = document.createElement('button');
            kaydetBtn.textContent = 'KAYDET';
            kaydetBtn.className = 'btn btn-primary btn-sm';
            kaydetBtn.onclick = function(e){ e.stopPropagation(); itOrtakNotDuzenleKaydet(inp); };
            var refNode = textSpan.nextSibling;
            item.insertBefore(inp, refNode);
            item.insertBefore(kaydetBtn, refNode);
            inp.focus();
            inp.select();
        }
        function itOrtakNotDuzenleKaydet(inp) {
            var jobId = parseInt(inp.getAttribute('data-jobid'));
            var oIdx = parseInt(inp.getAttribute('data-oix'));
            var nIdx = parseInt(inp.getAttribute('data-nix'));
            var val = inp.value.trim().toUpperCase();
            var liste = itDbYukle();
            var idx = liste.findIndex(function(x){return x.id===jobId;});
            if (idx !== -1) {
                var o = liste[idx].ortaklar[oIdx];
                if (o && Array.isArray(o.not) && o.not[nIdx]) {
                    if (val) {
                        o.not[nIdx].text = val;
                    } else {
                        o.not.splice(nIdx, 1);
                    }
                    itDbKaydet(liste);
                }
            }
            itOrtakNotRender(jobId, oIdx);
        }
        function itOrtakNotDuzenleIptal(inp) {
            var jobId = parseInt(inp.getAttribute('data-jobid'));
            var oIdx = parseInt(inp.getAttribute('data-oix'));
            var nIdx = parseInt(inp.getAttribute('data-nix'));
            var textSpan = document.getElementById("itNotText_" + jobId + "_" + oIdx + "_" + nIdx);
            var duzenleBtn = document.getElementById("itNotDuzenle_" + jobId + "_" + oIdx + "_" + nIdx);
            if (textSpan) textSpan.style.display = '';
            if (duzenleBtn) duzenleBtn.style.display = '';
            var sibling = inp.nextSibling;
            while (sibling && sibling.tagName === 'BUTTON') {
                var next = sibling.nextSibling;
                sibling.remove();
                sibling = next;
            }
            inp.remove();
        }
        function itOrtakNotRender(jobId, oIdx) {
            var liste = itDbYukle();
            var idx = liste.findIndex(function(x){return x.id===jobId;});
            if (idx === -1) return;
            var o = liste[idx].ortaklar[oIdx];
            if (!o) return;
            var notlar = Array.isArray(o.not) ? o.not : [];
            var container = document.getElementById("itNotList_" + jobId + "_" + oIdx);
            if (!container) return;
            container.innerHTML = '';
            notlar.forEach(function(n, ni){
                var item = document.createElement('div');
                item.className = 'it-not-item';
                item.id = 'itNotItem_' + jobId + '_' + oIdx + '_' + ni;
                var span = document.createElement('span');
                span.className = 'it-not-text';
                span.id = 'itNotText_' + jobId + '_' + oIdx + '_' + ni;
                span.textContent = n.text || '';
                var duzenle = document.createElement('span');
                duzenle.className = 'it-not-duzenle';
                duzenle.id = 'itNotDuzenle_' + jobId + '_' + oIdx + '_' + ni;
                duzenle.textContent = '<i class="fa-regular fa-pen-to-square"></i>';
                duzenle.onclick = function(e){ e.stopPropagation(); itOrtakNotDuzenleBaslat(jobId, oIdx, ni); };
                var sil = document.createElement('span');
                sil.className = 'it-not-sil';
                sil.textContent = '<i class="fa-solid fa-xmark"></i>';
                sil.onclick = function(e){ e.stopPropagation(); itOrtakNotSil(jobId, oIdx, ni); };
                item.appendChild(span);
                item.appendChild(duzenle);
                item.appendChild(sil);
                container.appendChild(item);
            });
        }

        function itFirmaListesiGetir() {
            var db = JSON.parse(localStorage.getItem("tm_musteriler_db")) || [];
            var sirketler = [];
            db.forEach(function(m) {
                var s = (m.sirket || "").toUpperCase().trim();
                if (s && s !== "-" && s !== "BİREYSEL") {
                    if (sirketler.indexOf(s) === -1) sirketler.push(s);
                } else {
                    var ad = (m.ad || "").toUpperCase().trim();
                    if (ad) {
                        var label = "MÜŞTERİ ADI SOYADI: " + ad;
                        if (sirketler.indexOf(label) === -1) sirketler.push(label);
                    }
                }
            });
            return sirketler.sort();
        }

        function itFormAdiGuncelle() {
            var tur = document.getElementById("itFormTur").value;
            var ad = document.getElementById("itFormAd");
            if (tur === "Diğer") {
                ad.removeAttribute("readonly");
                ad.style.background = "";
                ad.style.color = "";
                ad.style.fontWeight = "";
                return;
            }
            ad.setAttribute("readonly", "readonly");
            ad.style.background = "var(--bg-input-disabled,#f0f0f0)";
            ad.style.color = "var(--text-light)";
            ad.style.fontWeight = "600";
            var pafta = document.getElementById("itFormPafta").value.trim().toUpperCase();
            var ada = document.getElementById("itFormAda").value.trim().toUpperCase();
            var parsel = document.getElementById("itFormParsel").value.trim().toUpperCase();
            var parts = [];
            if (pafta) parts.push(pafta + " PAFTA");
            if (ada) parts.push(ada + " ADA");
            if (parsel) parts.push(parsel + " PARSEL");
            if (parts.length && tur) {
                ad.value = parts.join(" ") + " " + tur.toUpperCase();
            } else if (parts.length) {
                ad.value = parts.join(" ");
            } else {
                ad.value = tur ? tur.toUpperCase() : "";
            }
        }

        function itFormAc(data) {
            document.getElementById("itFormPopup").classList.add("active");
            document.getElementById("itFormEditId").value = data ? data.id : "";
            document.getElementById("itFormTitle").innerHTML = data ? '<i class="fa-regular fa-pen-to-square"></i> İŞ DÜZENLE' : '<i class="fa-solid fa-plus"></i> YENİ İŞ EKLE';

            var firmaSelect = document.getElementById("itFormFirma");
            var firmalar = itFirmaListesiGetir();
            firmaSelect.innerHTML = '<option value="">-- SEÇİNİZ --</option>';
            firmalar.forEach(function(f) {
                var opt = document.createElement("option");
                opt.value = f;
                opt.textContent = f;
                firmaSelect.appendChild(opt);
            });

            document.getElementById("itFormTur").value = data ? data.tur : "Taslak";
            document.getElementById("itFormPafta").value = data ? (data.pafta||"") : "";
            document.getElementById("itFormAda").value = data ? (data.ada||"") : "";
            document.getElementById("itFormParsel").value = data ? (data.parsel||"") : "";
            document.getElementById("itFormTarih").value = data ? data.tarih : anlikTarihGetir();
            document.getElementById("itFormNot").value = data ? data.not : "";
            document.getElementById("itFormAd").value = data ? data.isAdi : "";
            if (data) {
                if (firmaSelect.querySelector('option[value="' + data.firma.replace(/"/g,'&quot;') + '"]')) {
                    firmaSelect.value = data.firma;
                }
            } else {
                firmaSelect.value = "";
            }
            itFormAdiGuncelle();
            var csw = firmaSelect.parentNode.querySelector('.cs-wrapper'); if(csw){var cst=csw.querySelector('.cs-trigger');if(cst)cst.textContent=firmaSelect.options[firmaSelect.selectedIndex]?firmaSelect.options[firmaSelect.selectedIndex].text:'';}
        }

        function itFormKapat() {
            document.getElementById("itFormPopup").classList.remove("active");
        }

        function itNotPopupAc(jobId) {
            var liste = itDbYukle();
            var is = liste.find(function(x){return x.id===jobId;});
            if (!is) return;
            document.getElementById("itNotPopupJobId").value = jobId;
            document.getElementById("itNotPopupText").value = is.not || "";
            document.getElementById("itNotPopup").classList.add("active");
        }

        function itNotPopupKapat() {
            document.getElementById("itNotPopup").classList.remove("active");
        }

        function itNotKaydet() {
            var jobId = parseInt(document.getElementById("itNotPopupJobId").value);
            var not = document.getElementById("itNotPopupText").value.trim().toUpperCase();
            var liste = itDbYukle();
            var idx = liste.findIndex(function(x){return x.id===jobId;});
            if (idx === -1) return;
            liste[idx].not = not;
            itDbKaydet(liste);
            itNotPopupKapat();
            var panel = document.querySelector('#itDetayRow_' + jobId + ' .it-not-panel, #itTamDetayRow_' + jobId + ' .it-not-panel');
            if (panel) {
                var hasNot = not.length > 0;
                panel.className = 'it-not-panel' + (hasNot ? ' has-not' : '');
                var div = panel.querySelector('div');
                if (div) div.innerHTML = '<i class="fa-solid fa-thumbtack"></i> NOTLAR' + (hasNot ? ' <span style="font-size:10px;color:var(--accent-red);"><i class="fa-solid fa-circle"></i></span>' : '');
            }
            tmNotify("Notlar güncellendi.", "success");
        }

        function itKaydet() {
            var liste = itDbYukle();
            var id = document.getElementById("itFormEditId").value;
            var tur = document.getElementById("itFormTur").value;
            var firma = document.getElementById("itFormFirma").value;
            var pafta = document.getElementById("itFormPafta").value.trim().toUpperCase();
            var ada = document.getElementById("itFormAda").value.trim().toUpperCase();
            var parsel = document.getElementById("itFormParsel").value.trim().toUpperCase();
            var tarih = document.getElementById("itFormTarih").value;
            var not = document.getElementById("itFormNot").value.trim().toUpperCase();
            itFormAdiGuncelle();
            var isAdi = trToUpper(document.getElementById("itFormAd").value.trim());
            tmLoadingGoster('İş kaydediliyor...');
            if (!isAdi) { tmNotify("İş adı zorunludur!", "error"); return; }
            if (id) {
                var idx = liste.findIndex(function(x){return x.id == id;});
                if (idx !== -1) { liste[idx].tur = tur; liste[idx].isAdi = isAdi; liste[idx].firma = firma; liste[idx].pafta = pafta; liste[idx].ada = ada; liste[idx].parsel = parsel; liste[idx].tarih = tarih; liste[idx].not = not; }
            } else {
                var maxId = liste.reduce(function(m,x){return Math.max(m,x.id);},0);
                liste.push({ id:maxId+1, tur:tur, isAdi:isAdi, firma:firma, pafta:pafta, ada:ada, parsel:parsel, tarih:tarih, not:not, tamamlandi:false, tahsilatOnayi:false, ruhsatOnayi:false, bitisTarihi:"", ortaklar:[] });
            }
            itDbKaydet(liste);
            tmLoadingGizle();
            itFormKapat();
            itGoster();
            tmNotify(id ? "İş güncellendi." : "İş eklendi.", "success");
            aktiviteEkle((id ? "İş güncellendi: " : "İş eklendi: ") + isAdi, "İş Takibi");
        }

        function itRuhsatOnayiVer(id) {
            var liste = itDbYukle();
            var idx = liste.findIndex(function(x){return x.id === id;});
            if (idx === -1) return;
            var openIds = itAcKalanKaydet();
            liste[idx].ruhsatOnayi = true;
            itDbKaydet(liste);
            itGoster();
            itAcKalanYukle(openIds);
            tmNotify("Ruhsat onayı alındı.", "success");
            aktiviteEkle("Ruhsat onayı verildi: " + (liste[idx].isAdi || ""), "İş Takibi");
        }

        function itTahsilatOnayiVer(id) {
            var liste = itDbYukle();
            var idx = liste.findIndex(function(x){return x.id === id;});
            if (idx === -1) return;
            var openIds = itAcKalanKaydet();
            liste[idx].tahsilatOnayi = true;
            itDbKaydet(liste);
            itGoster();
            itAcKalanYukle(openIds);
            tmNotify('Tahsilat onayı verildi.', 'success');
            aktiviteEkle("Tahsilat onayı verildi: " + (liste[idx].isAdi || ""), "İş Takibi");
        }

        function itTamamla(id) {
            var liste = itDbYukle();
            var idx = liste.findIndex(function(x){return x.id === id;});
            if (idx === -1) return;
            if (liste[idx].tur !== "Taslak" && !liste[idx].tahsilatOnayi) { tmNotify("Önce tahsilat onayı verilmelidir!", "error"); return; }
            if (liste[idx].tur === "Uygulama Proje" && !liste[idx].ruhsatOnayi) { tmNotify("Önce ruhsat onayı alınmalıdır!", "error"); return; }
            tmConfirm("Bu işi tamamlandı olarak işaretlemek istediğinize emin misiniz?", function() {
                liste[idx].tamamlandi = true;
                liste[idx].bitisTarihi = anlikTarihGetir();
                itDbKaydet(liste);
                itGoster();
                tmNotify("İş tamamlandı olarak işaretlendi.", "success");
                aktiviteEkle("İş tamamlandı: " + (liste[idx].isAdi || ""), "İş Takibi");
            });
        }

        function itDuzenle(id) {
            var liste = itDbYukle();
            var is = liste.find(function(x){return x.id === id;});
            if (is) itFormAc(is);
        }

        function itSil(id) {
            tmConfirm("Bu kaydı silmek istediğinize emin misiniz?", function() {
                var liste = itDbYukle();
                var silinen = liste.find(function(x){return x.id === id;});
                liste = liste.filter(function(x){return x.id !== id;});
                itDbKaydet(liste);
                itGoster();
                tmNotify("Kayıt silindi.", "success");
                aktiviteEkle("İş takibi kaydı silindi: " + (silinen ? silinen.isAdi : ""), "İş Takibi");
            });
        }


        /* ================= DİLEKÇE MODÜLÜ ================= */
        const DLK_DB_KEY = "tm_dilekceler_db";

        function dlkDbYukle() {
            var db;
            try { db = JSON.parse(localStorage.getItem(DLK_DB_KEY)); } catch(e) { db = null; console.error("Dilekce db yukleme hatasi:", e); }
            if (!db || !Array.isArray(db)) db = [];
            return db;
        }
        function dlkDbKaydet(db) { try { localStorage.setItem(DLK_DB_KEY, JSON.stringify(db)); } catch(e) { console.error("Dilekce db kaydetme hatasi:", e); tmNotify("Dilekçe kaydedilirken hata oluştu!", "error"); } }

        function dlkYeniId() {
            var db = dlkDbYukle();
            var yil = new Date().getFullYear();
            var buYilKayitlar = db.filter(function(d) { return d.tarih && new Date(d.tarih).getFullYear() === yil; });
            return buYilKayitlar.length + 1;
        }

        function dlkFormdakiVeri() {
            return {
                gonderilecekYer: document.getElementById("dlkGonderilecekYer").value.trim(),
                ilgi: document.getElementById("dlkIlgi").value.trim(),
                konu: document.getElementById("dlkKonu").value.trim(),
                metin: document.getElementById("dlkMetin").value.trim()
            };
        }

        function dlkIdStr(id, tarih) {
            var yil = tarih ? new Date(tarih).getFullYear() : new Date().getFullYear();
            return yil + "/" + id;
        }

        function dlkIdGuncelle() {
            var el = document.getElementById("dlkIdGoster");
            if (el) {
                var yeniId = dlkYeniId();
                el.textContent = dlkIdStr(yeniId, anlikTarihGetir());
            }
        }

        function dlkFormTemizle() {
            document.getElementById("dlkGonderilecekYer").value = "";
            document.getElementById("dlkIlgi").value = "";
            document.getElementById("dlkKonu").value = "";
            document.getElementById("dlkMetin").value = "";
            dlkIdGuncelle();
        }

        function dlkKaydet() {
            var v = dlkFormdakiVeri();
            if (!v.konu || !v.metin || !v.gonderilecekYer) {
                tmNotify("Lütfen en az Konu, Metin ve Gönderilecek Yer alanlarını doldurun.", "error");
                return;
            }
            var db = dlkDbYukle();
            var id = dlkYeniId();
            db.push({ id: id, ...v, tarih: anlikTarihGetir() });
            dlkDbKaydet(db);
            dlkListele();
            dlkFormTemizle();
            tmNotify("Dilekçe " + dlkIdStr(id, anlikTarihGetir()) + " kaydedildi.", "success");
            aktiviteEkle("Dilekçe kaydedildi: " + dlkIdStr(id, anlikTarihGetir()) + " - " + (v.konu || ""), "Dilekçe");
        }

        function dlkPdfGoster(mod, id) {
            var v;
            if (mod === 'yeni') {
                v = dlkFormdakiVeri();
                if (!v.konu || !v.metin || !v.gonderilecekYer) {
                    tmNotify("Lütfen en az Konu, Metin ve Gönderilecek Yer alanlarını doldurun.", "error");
                    return;
                }
                v.id = "TASLAK";
                v.tarih = anlikTarihGetir();
            } else {
                var db = dlkDbYukle();
                var bul = db.find(function(d) { return d.id === id; });
                if (!bul) { tmNotify("Dilekçe bulunamadı.", "error"); return; }
                v = bul;
            }
            var idStr = typeof v.id === 'number' ? dlkIdStr(v.id, v.tarih) : "TASLAK";
            var trh = v.tarih ? new Date(v.tarih).toLocaleDateString("tr-TR") : "";

            var logoData = localStorage.getItem("tm_sirket_logo");
            var ci = {};
            try { ci = JSON.parse(localStorage.getItem("tm_sirket_bilgileri")) || {}; } catch(e) { ci = {}; }
            var firmaAd = ci.ad || "TURAK MİMARLIK";
            var imzaAd = ci.imzaAd || "OKAN TUGAY TURAK";

            var footerStr;
            if (ci.dilekceAltBilgi) {
                footerStr = ci.dilekceAltBilgi;
            } else {
                var line1 = ci.adres || '';
                if (!line1) line1 = "Adres: Deniz Mah. Selvi Sk. No: 14/D &nbsp;&nbsp;|&nbsp;&nbsp; İĞNEADA | DEMİRKÖY | KIRKLARELİ";
                var line2Parts = [];
                var telNo = ci.gsm || ci.telefon || "";
                if (telNo) line2Parts.push("Tel: " + telNo);
                if (ci.email) line2Parts.push("E-posta: " + ci.email);
                var line2 = line2Parts.length ? line2Parts.join(" &nbsp;&nbsp;|&nbsp;&nbsp; ") : '';
                if (line2) {
                    footerStr = line1 + "<br>" + line2;
                } else {
                    footerStr = line1;
                }
            }

            var paragraflar = v.metin.split(/\n+/).map(function(p){ return p.trim(); }).filter(function(p){ return p; });

            function pdfOlustur(logoHtml) {
                var logoHtmlStr = logoHtml || '<span style="font-size:14pt;font-weight:700;letter-spacing:1.5px;">' + firmaAd + '</span>';

                var logoKisim = '<div style="text-align:center;padding:2mm 0 3mm 0;">' + logoHtmlStr + '</div>';

                var etiketGen = 'display:inline-block;width:50px;';
                var bilgiKisim = '<div style="overflow:hidden;font-size:10pt;padding-bottom:1mm;">' +
                    '<span style="float:left;"><span style="' + etiketGen + '"><b>Sayı</b></span> : ' + idStr + '</span>' +
                    '<span style="float:right;"><span style="' + etiketGen + '"><b>Tarih</b></span> : ' + trh + '</span>' +
                    '</div>' +
                    '<div style="clear:both;font-size:10pt;padding-bottom:2mm;"><span style="' + etiketGen + '"><b>Konu</b></span> : ' + esc(v.konu) + '</div>';

                var yerSatirlari = v.gonderilecekYer.split('\n').filter(function(l){return l.trim();}).map(function(l){
                    return '<div>' + trToUpper(esc(l.trim())) + '</div>';
                }).join('');
                var yerKisim = '<div style="text-align:center;font-size:12pt;font-weight:700;padding:4mm 0 5mm 0;">' + yerSatirlari + '</div>';

                var ilgiKisim = '';
                if (v.ilgi) {
                    ilgiKisim = '<div style="font-size:10pt;padding-bottom:2mm;"><span style="' + etiketGen + '"><b>İlgi</b></span> : ' + esc(v.ilgi) + '</div>';
                }

                var baslikHtml = logoKisim + bilgiKisim + yerKisim + ilgiKisim;

                var parHTML = paragraflar.map(function(p){
                    return '<p style="margin:0 0 6px 0;text-indent:1.5em;text-align:justify;font-size:11pt;line-height:1.6;">' + esc(p) + '</p>';
                });

                var imzaHtml = '<div style="height:12mm;"></div>' +
                    '<div style="margin-left:102mm;width:34mm;text-align:center;white-space:nowrap;font-weight:700;font-size:10.5pt;">' + esc(imzaAd) + '</div>';

                var altbilgiHtml = '<div style="border-top:1px solid #1a1a2e;margin-bottom:2mm;"></div>' +
                    '<div style="font-size:7pt;color:#555;line-height:1.3;text-align:center;">' + footerStr + '</div>';

                var sayfaStil = 'width:210mm;height:297mm;padding:10mm 20mm 10mm 20mm;background:#fff;font-family:Arial,Helvetica,sans-serif;color:#000;font-size:11pt;line-height:1.5;box-sizing:border-box;overflow:hidden;';

                // Offscreen page elementi
                var sayfaEl = document.createElement("div");
                sayfaEl.style.cssText = "position:fixed;left:-9999px;top:0;" + sayfaStil;
                document.body.appendChild(sayfaEl);

                var icerikDiv = document.createElement("div");
                icerikDiv.style.paddingBottom = "9mm";
                sayfaEl.appendChild(icerikDiv);

                // Footer her sayfada en altta sabit (absolute konumlu)
                var footEl = document.createElement("div");
                footEl.style.cssText = "position:absolute;bottom:10mm;left:20mm;right:20mm;font-size:7pt;color:#555;line-height:1.3;text-align:center;";
                sayfaEl.appendChild(footEl);

                var maxH = sayfaEl.clientHeight;

                // Paragraflari sayfalara dagit (overflow detection ile)
                var sayfalar = [];
                var sira = 0;
                while (sira < parHTML.length) {
                    var sHtml = (sayfalar.length === 0) ? baslikHtml + '<div style="height:4mm;"></div>' : '';
                    var eklendi = false;
                    while (sira < parHTML.length) {
                        var test = sHtml + parHTML[sira];
                        icerikDiv.innerHTML = test;
                        if (eklendi && icerikDiv.offsetHeight > maxH) break;
                        sHtml = test;
                        eklendi = true;
                        sira++;
                    }
                    sayfalar.push(sHtml);
                }

                // Son sayfaya imza ekle, tasarsa paragraf ayir (footer ayri)
                for (var iter = 0; iter < 5 && sayfalar.length < 12; iter++) {
                    var son = sayfalar.length - 1;
                    var testSon = sayfalar[son] + imzaHtml;
                    icerikDiv.innerHTML = testSon;
                    if (icerikDiv.offsetHeight <= maxH) break;

                    var bulundu = false;
                    for (var t = parHTML.length - 1; t >= 0; t--) {
                        if (sayfalar[son].indexOf(parHTML[t]) >= 0) {
                            if (sayfalar[son] === parHTML[t]) break;
                            sayfalar[son] = sayfalar[son].replace(parHTML[t], '');
                            sayfalar.push(parHTML[t]);
                            bulundu = true;
                            break;
                        }
                    }
                    if (!bulundu) break;
                }

                // ---- PDF OLUSTUR (html2canvas + jsPDF, html2pdf yok) ----
                var doc = new jspdf.jsPDF({ format: 'a4', orientation: 'portrait', unit: 'mm' });

                function ekle(sayfaHtml, imzaEkle, ilk) {
                    icerikDiv.innerHTML = sayfaHtml + (imzaEkle ? imzaHtml : '');
                    footEl.innerHTML = altbilgiHtml;
                    return html2canvas(sayfaEl, { scale: 4, useCORS: true }).then(function(cv) {
                        var dt = cv.toDataURL('image/jpeg', 0.95);
                        if (!ilk) doc.addPage();
                        doc.addImage(dt, 'JPEG', 1, 1, 208, 295);
                    });
                }

                var p = Promise.resolve();
                p = p.then(function() { return ekle(sayfalar[0], sayfalar.length === 1, true); });
                for (var si = 1; si < sayfalar.length; si++) {
                    (function(s) {
                        var son = (s === sayfalar.length - 1);
                        p = p.then(function() { return ekle(sayfalar[s], son, false); });
                    })(si);
                }

                p.then(function() {
                    doc.save("DILEKCE_" + (typeof v.id === 'number' ? String(v.id).padStart(4, '0') : "TASLAK") + ".pdf");
                    document.body.removeChild(sayfaEl);
                }).catch(function(e) {
                    tmAlert('PDF HATA: ' + (e.message || e));
                    try { document.body.removeChild(sayfaEl); } catch(e) { console.error("Dilekce PDF DOM temizlik hatasi:", e); }
                });
            }

            if (logoData) {
                var img = new Image();
                img.onload = function() {
                    var logoHtml = '<img src="' + logoData + '" style="max-width:63mm;max-height:45mm;width:auto;height:auto;vertical-align:middle;" alt="Logo">';
                    pdfOlustur(logoHtml);
                };
                img.onerror = function() {
                    pdfOlustur(null);
                };
                img.src = logoData;
            } else {
                pdfOlustur(null);
            }
        }

        var dlkSortColumn = "id";
        var dlkSortDir = "desc";

        function dlkNormalize(text) {
            if (!text) return "";
            var s = text.toString();
            s = s.replace(/İ/g, "i").replace(/ı/g, "i").replace(/I/g, "i");
            s = s.replace(/Ü/g, "u").replace(/ü/g, "u");
            s = s.replace(/Ö/g, "o").replace(/ö/g, "o");
            s = s.replace(/Ç/g, "c").replace(/ç/g, "c");
            s = s.replace(/Ş/g, "s").replace(/ş/g, "s");
            s = s.replace(/Ğ/g, "g").replace(/ğ/g, "g");
            return s.toLowerCase();
        }

        function dlkListele() {
            var db = dlkDbYukle();
            var konteyner = document.getElementById("dlkListe");
            if (!konteyner) return;

            var aramaEl = document.getElementById("dlkArama");
            var arama = aramaEl ? dlkNormalize(aramaEl.value) : "";

            var filtrelenmis = db.filter(function(d) {
                if (!arama) return true;
                var no = dlkIdStr(d.id, d.tarih);
                var konu = d.konu || "";
                var yer = d.gonderilecekYer || "";
                var trh = d.tarih ? new Date(d.tarih).toLocaleDateString("tr-TR") : "";
                return dlkNormalize(no).indexOf(arama) !== -1 ||
                       dlkNormalize(konu).indexOf(arama) !== -1 ||
                       dlkNormalize(yer).indexOf(arama) !== -1 ||
                       dlkNormalize(trh).indexOf(arama) !== -1;
            });

            filtrelenmis.sort(function(a, b) {
                var va, vb;
                if (dlkSortColumn === "id") {
                    va = a.id;
                    vb = b.id;
                } else if (dlkSortColumn === "tarih") {
                    va = a.tarih || "";
                    vb = b.tarih || "";
                } else if (dlkSortColumn === "konu") {
                    va = (a.konu || "").toLowerCase();
                    vb = (b.konu || "").toLowerCase();
                } else {
                    va = (a.gonderilecekYer || "").toLowerCase();
                    vb = (b.gonderilecekYer || "").toLowerCase();
                }
                if (va < vb) return dlkSortDir === "asc" ? -1 : 1;
                if (va > vb) return dlkSortDir === "asc" ? 1 : -1;
                return 0;
            });

            if (filtrelenmis.length === 0) {
                konteyner.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-light);background:var(--bg-main);border-radius:8px;border:1px dashed var(--border-color);">' + (arama ? 'Aramanızla eşleşen dilekçe bulunamadı.' : 'Henüz kaydedilmiş dilekçe bulunmuyor.') + '</div>';
                return;
            }

            function sortOk(column) {
                return dlkSortColumn === column ? (dlkSortDir === "asc" ? " ^" : " ¡") : "";
            }

            var h = '<table class="app-table"><thead><tr>' +
                '<th onclick="dlkSortTikla(\'id\')" style="cursor:pointer;user-select:none;">Dilekçe No' + sortOk('id') + '</th>' +
                '<th onclick="dlkSortTikla(\'konu\')" style="cursor:pointer;user-select:none;">Konu' + sortOk('konu') + '</th>' +
                '<th onclick="dlkSortTikla(\'yer\')" style="cursor:pointer;user-select:none;">Gönderilen Yer' + sortOk('gonderilecekYer') + '</th>' +
                '<th onclick="dlkSortTikla(\'tarih\')" style="cursor:pointer;user-select:none;">Tarih' + sortOk('tarih') + '</th>' +
                '<th>İşlemler</th></tr></thead><tbody>';
            filtrelenmis.forEach(function(d) {
                var t = d.tarih ? new Date(d.tarih).toLocaleDateString("tr-TR") : "-";
                h += '<tr><td style="font-weight:700;">' + dlkIdStr(d.id, d.tarih) + '</td>' +
                    '<td>' + esc(d.konu) + '</td>' +
                    '<td>' + esc(d.gonderilecekYer) + '</td>' +
                    '<td>' + t + '</td>' +
                    '<td style="white-space:nowrap;">' +
                    '<button class="btn-warning" onclick="dlkPdfGoster(\'kayit\',' + d.id + ')" style="padding:4px 8px;font-size:11px;"><i class="fa-regular fa-file-lines"></i> PDF</button> ' +
                    '<button class="btn-danger" onclick="dlkSil(' + d.id + ')" style="padding:4px 8px;font-size:11px;">Sil</button>' +
                    '</td></tr>';
            });
            h += '</tbody></table>';
            konteyner.innerHTML = h;
        }

        function dlkSortTikla(column) {
            var colMap = { id: "id", konu: "konu", yer: "gonderilecekYer", tarih: "tarih" };
            var mapped = colMap[column] || "id";
            if (dlkSortColumn === mapped) {
                dlkSortDir = dlkSortDir === "asc" ? "desc" : "asc";
            } else {
                dlkSortColumn = mapped;
                dlkSortDir = mapped === "id" ? "desc" : "asc";
            }
            dlkListele();
        }

        function dlkSil(id) {
            tmConfirm("Bu dilekçeyi silmek istediğinize emin misiniz?", function() {
                var db = dlkDbYukle();
                var silinen = db.find(function(d) { return d.id === id; });
                db = db.filter(function(d) { return d.id !== id; });
                dlkDbKaydet(db);
                dlkListele();
                tmNotify("Dilekçe silindi.", "success");
                aktiviteEkle("Dilekçe silindi: " + (silinen ? silinen.konu : ""), "Dilekçe");
            });
        }

        /* ---------- Ortak Yardımcılar ---------- */
        function esc(s) { return (s||"").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
        function tarihStr(d) { try { return new Date(d).toLocaleDateString("tr-TR"); } catch(e) { return d||"-"; } }
        function formatPhone(el) { var v=el.value.replace(/\D/g,'').substring(0,11); if(v.length>0){var p=[];p.push(v.substring(0,4));if(v.length>4)p.push(v.substring(4,7));if(v.length>7)p.push(v.substring(7,9));if(v.length>9)p.push(v.substring(9,11));el.value=p.join(' ');} }

        /* ================= NOTLAR SISTEMI ================= */
        const NOTE_DB = "tm_notlar_notes_db";
        const NOTE_KLASOR_DB = "tm_notlar_folders_db";
        var noteAktifKlasorId = null;
        var noteViewerId = null;

        function noteDbYukle() { try { return JSON.parse(localStorage.getItem(NOTE_DB)) || []; } catch(e) { return []; } }
        function noteDbKaydet(d) { try { localStorage.setItem(NOTE_DB, JSON.stringify(d)); } catch(e) { console.error("Note kaydetme hatasi:", e); } }
        function noteKlasorDbYukle() { try { return JSON.parse(localStorage.getItem(NOTE_KLASOR_DB)) || []; } catch(e) { return []; } }
        function noteKlasorDbKaydet(d) { try { localStorage.setItem(NOTE_KLASOR_DB, JSON.stringify(d)); } catch(e) { console.error("Klasor kaydetme hatasi:", e); } }

        function noteIdUret() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 6); }

        function noteAktifKlasorDegistir(klasorId) {
            noteAktifKlasorId = klasorId;
            document.querySelectorAll('.note-klasor-item').forEach(function(el) { el.classList.toggle('active', el.dataset.id === String(klasorId)); });
            var ad = klasorId ? (noteKlasorDbYukle().find(function(k) { return k.id === klasorId; }) || {}).name : "Tüm Notlar";
            document.getElementById("noteKlasorAdi").innerText = ad || "Tüm Notlar";
            noteListele();
        }

        function noteListele() {
            var notes = noteDbYukle();
            var liste = document.getElementById("notlarListesi");
            var klasorListe = document.getElementById("notlarKlasorListesi");
            if (!liste || !klasorListe) return;

            var klasorler = noteKlasorDbYukle();
            klasorListe.innerHTML = '<button class="note-klasor-item' + (!noteAktifKlasorId ? ' active' : '') + '" data-id="" onclick="noteAktifKlasorDegistir(null)" ondragover="noteDragOver(event)" ondrop="noteDrop(event,null)" ondragenter="noteDragEnter(event)" ondragleave="noteDragLeave(event)"><span class="k-name"><i class="fa-regular fa-folder-open"></i> Tüm Notlar</span><span class="k-count">' + notes.length + '</span></button>';
            klasorler.forEach(function(k) {
                var adet = notes.filter(function(n) { return n.folderId === k.id; }).length;
                klasorListe.innerHTML += '<button class="note-klasor-item' + (noteAktifKlasorId === k.id ? ' active' : '') + '" data-id="' + k.id + '" onclick="noteAktifKlasorDegistir(\'' + k.id + '\')" ondragover="noteDragOver(event)" ondrop="noteDrop(event,\'' + k.id + '\')" ondragenter="noteDragEnter(event)" ondragleave="noteDragLeave(event)"><span class="k-name"><i class="fa-regular fa-folder"></i> ' + esc(k.name) + '</span><span class="k-count">' + adet + '</span><span class="k-actions"><span style="font-size:11px;cursor:pointer;color:var(--text-light);" onclick="event.stopPropagation();noteKlasorDuzenle(\'' + k.id + '\')"><i class="fa-regular fa-pen-to-square"></i></span><span style="font-size:11px;cursor:pointer;color:var(--accent-red);" onclick="event.stopPropagation();noteKlasorSil(\'' + k.id + '\')"><i class="fa-solid fa-trash-can"></i></span></span></button>';
            });

            if (noteAktifKlasorId) { notes = notes.filter(function(n) { return n.folderId === noteAktifKlasorId; }); }

            if (notes.length === 0) {
                liste.innerHTML = '<div style="grid-column:1/-1;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:200px;color:var(--text-light);font-size:14px;text-align:center;">Henüz not eklenmemiş.<br><small>Yeni bir not oluşturmak için "Yeni Not Oluştur" butonunu kullanın.</small></div>';
                return;
            }

            notes.sort(function(a, b) { return (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0); });
            liste.innerHTML = notes.map(function(n) {
                return '<div class="note-kart" draggable="true" ondragstart="noteDragStart(event,\'' + n.id + '\')" onclick="noteAc(\'' + n.id + '\')"><div class="note-kart-icon"><span class="note-kart-icon-title">' + esc(trToUpper(n.title || "BAŞLIKSIZ")) + '</span></div><div class="note-kart-tarih"><i class="fa-regular fa-calendar"></i> ' + tarihStr(n.updatedAt || n.createdAt) + '</div></div>';
            }).join('');
        }

        function noteYeniNot() {
            document.getElementById("noteEditorId").value = "";
            document.getElementById("noteEditorTitle").innerHTML = '<i class="fa-regular fa-note-sticky"></i> Yeni Not';
            document.getElementById("noteEditorBaslik").value = "";
            document.getElementById("noteEditorIcerik").innerHTML = "";
            document.getElementById("noteEditorModal").style.display = "flex";
            setTimeout(function() { document.getElementById("noteEditorBaslik").focus(); }, 200);
            setTimeout(function() { noteTbBtnDurumGuncelle(); }, 300);
        }

        function noteDuzenle() {
            var id = noteViewerId;
            if (!id) return;
            noteViewerKapat();
            var notes = noteDbYukle();
            var n = notes.find(function(x) { return x.id === id; });
            if (!n) { tmNotify("Not bulunamadi!", "error"); return; }
            document.getElementById("noteEditorId").value = id;
            document.getElementById("noteEditorTitle").innerHTML = '<i class="fa-regular fa-pen-to-square"></i> NOTU DÜZENLE';
            document.getElementById("noteEditorBaslik").value = (n.title || "") ? trToUpper(n.title || "") : "";
            document.getElementById("noteEditorIcerik").innerHTML = n.content || "";
            document.getElementById("noteEditorModal").style.display = "flex";
            setTimeout(function() { noteTbBtnDurumGuncelle(); }, 300);
        }

        function noteBaslikTrDuzenle(el) {
            if (el._trBusy) return;
            el._trBusy = true;
            var v = trToUpper(el.value);
            if (el.value !== v) el.value = v;
            el._trBusy = false;
        }

        function noteEditorKaydet() {
            var baslik = trToUpper(document.getElementById("noteEditorBaslik").value.trim()) || "BAŞLKSZ";
            var icerikEl = document.getElementById("noteEditorIcerik");
            var icerik = icerikEl.innerHTML;
            if (!baslik) { tmNotify("Not başlığı gerekli!", "error"); return; }
            var txt = icerikEl.innerText.replace(/\s+/g,' ').trim();
            if (txt === '' && icerikEl.querySelectorAll('img, table, iframe, video').length === 0) {
                icerik = '';
            }
            var id = document.getElementById("noteEditorId").value;
            if (!baslik) { tmNotify("Not başlığı gerekli!", "error"); return; }

            var notes = noteDbYukle();
            if (id) {
                var idx = notes.findIndex(function(x) { return x.id === id; });
                if (idx !== -1) {
                    notes[idx].title = baslik;
                    notes[idx].content = icerik;
                    notes[idx].updatedAt = Date.now();
                }
            } else {
                notes.push({ id: noteIdUret(), title: baslik, content: icerik, folderId: noteAktifKlasorId, createdAt: Date.now(), updatedAt: Date.now() });
            }
            noteDbKaydet(notes);
            noteEditorKapat();
            noteListele();
            tmNotify("Not kaydedildi.", "success");
        }

        function noteEditorKapat() {
            document.getElementById("noteEditorModal").style.display = "none";
        }

        function noteTbBtnDurumGuncelle() {
            document.querySelectorAll('.note-tb-btn').forEach(function(btn) {
                var c = btn.getAttribute('onclick') || '';
                var m = c.match(/noteTbCmd\('([^']+)'/);
                if (m) {
                    var sc = m[1];
                    if (['bold','italic','underline','strikeThrough','insertUnorderedList','insertOrderedList','justifyLeft','justifyCenter','justifyRight','justifyFull'].indexOf(sc) !== -1) {
                        if (document.queryCommandState(sc)) btn.classList.add('active');
                        else btn.classList.remove('active');
                    }
                }
            });
        }

        document.addEventListener('mouseup', function() { if (document.getElementById("noteEditorModal").style.display === "flex") noteTbBtnDurumGuncelle(); });
        document.addEventListener('keyup', function() { if (document.getElementById("noteEditorModal").style.display === "flex") noteTbBtnDurumGuncelle(); });

        function noteTbCmd(cmd, val) {
            var editor = document.getElementById("noteEditorIcerik");
            document.execCommand(cmd, false, val || null);
            editor.focus();
            setTimeout(function() {
                document.querySelectorAll('.note-tb-btn').forEach(function(btn) {
                    var c = btn.getAttribute('onclick') || '';
                    var m = c.match(/noteTbCmd\('([^']+)'/);
                    if (m) {
                        var stateCmd = m[1];
                        if (['justifyLeft','justifyCenter','justifyRight','justifyFull'].indexOf(stateCmd) !== -1) {
                            btn.classList.remove('active');
                            if (document.queryCommandState(stateCmd)) btn.classList.add('active');
                        } else if (['bold','italic','underline','strikeThrough','insertUnorderedList','insertOrderedList'].indexOf(stateCmd) !== -1) {
                            if (document.queryCommandState(stateCmd)) btn.classList.add('active');
                            else btn.classList.remove('active');
                        }
                    }
                });
            }, 10);
        }

        var noteFzSavedRange = null;
        var noteColorSavedRange = null;

        function noteTbFontSizeToggle(e) {
            e.stopPropagation();
            var sel = window.getSelection();
            if (sel.rangeCount) noteFzSavedRange = sel.getRangeAt(0).cloneRange();
            document.querySelectorAll('.note-tb-dropmenu.open').forEach(function(d) {
                if (d.id !== 'noteTbFontSizeMenu') d.classList.remove('open');
            });
            document.getElementById("noteTbColorMenu").classList.remove('open');
            document.getElementById("noteTbFontSizeMenu").classList.toggle('open');
        }

        function noteTbFontSizeSelect(px, el) {
            document.getElementById("noteTbFontSizeMenu").classList.remove('open');
            document.querySelector('#noteTbFontSizeDropdown .note-tb-dropbtn').innerHTML = px + '<span class="dd-arrow">?</span>';
            var editor = document.getElementById("noteEditorIcerik");
            editor.focus();
            if (noteFzSavedRange) {
                var sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(noteFzSavedRange);
                noteFzSavedRange = null;
                var sizeMap = { '8':'1', '10':'2', '12':'3', '14':'4', '18':'5', '24':'6', '36':'7' };
                document.execCommand('fontSize', false, sizeMap[String(px)] || '3');
            }
            setTimeout(function() { noteTbBtnDurumGuncelle(); }, 10);
        }

        function noteTbColorToggle(e) {
            e.stopPropagation();
            var sel = window.getSelection();
            if (sel.rangeCount) noteColorSavedRange = sel.getRangeAt(0).cloneRange();
            document.querySelectorAll('.note-tb-dropmenu.open').forEach(function(d) {
                if (d.id !== 'noteTbColorMenu') d.classList.remove('open');
            });
            document.getElementById("noteTbFontSizeMenu").classList.remove('open');
            document.getElementById("noteTbColorMenu").classList.toggle('open');
        }

        function noteTbColorPick(hex) {
            document.getElementById("noteTbColorMenu").classList.remove('open');
            document.getElementById("noteTbColorPreview").style.borderBottomColor = hex;
            var editor = document.getElementById("noteEditorIcerik");
            editor.focus();
            if (noteColorSavedRange) {
                var sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(noteColorSavedRange);
                noteColorSavedRange = null;
                document.execCommand('foreColor', false, hex);
            }
            setTimeout(function() { noteTbBtnDurumGuncelle(); }, 10);
        }

        function noteTbColorClear() {
            document.getElementById("noteTbColorMenu").classList.remove('open');
            document.getElementById("noteTbColorPreview").style.borderBottomColor = '';
            var editor = document.getElementById("noteEditorIcerik");
            editor.focus();
            if (noteColorSavedRange) {
                var sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(noteColorSavedRange);
                noteColorSavedRange = null;
                var def = getComputedStyle(editor).color;
                document.execCommand('foreColor', false, def);
            }
            setTimeout(function() { noteTbBtnDurumGuncelle(); }, 10);
        }

        document.addEventListener('click', function(e) {
            ['noteTbFontSizeDropdown','noteTbColorDropdown'].forEach(function(id) {
                var dd = document.getElementById(id);
                if (dd && !dd.contains(e.target)) {
                    var menu = dd.querySelector('.note-tb-dropmenu');
                    if (menu) menu.classList.remove('open');
                }
            });
        });

        document.addEventListener('paste', function(e) {
            var editor = document.getElementById("noteEditorIcerik");
            if (!editor || !editor.contains(e.target)) return;
            e.preventDefault();
            var text = e.clipboardData.getData('text/plain');
            var html = e.clipboardData.getData('text/html');
            if (html) {
                var t = document.createElement('div');
                t.innerHTML = html;
                t.querySelectorAll('*').forEach(function(n) {
                    n.style.backgroundColor = '';
                    n.style.background = '';
                    if (n.style.cssText === '') n.removeAttribute('style');
                });
                html = t.innerHTML;
            }
            var sel = window.getSelection();
            if (sel.rangeCount) {
                var range = sel.getRangeAt(0);
                range.deleteContents();
                var lastNode;
                if (html) {
                    var frag = range.createContextualFragment(html);
                    lastNode = frag.lastChild;
                    range.insertNode(frag);
                } else {
                    lastNode = document.createTextNode(text);
                    range.insertNode(lastNode);
                }
                if (lastNode) {
                    range.setStartAfter(lastNode);
                    range.collapse(true);
                }
                sel.removeAllRanges();
                sel.addRange(range);
            }
            editor.focus();
        });

        function noteAc(id) {
            var notes = noteDbYukle();
            var n = notes.find(function(x) { return x.id === id; });
            if (!n) { tmNotify("Not bulunamadi!", "error"); return; }
            noteViewerId = id;
            document.getElementById("noteViewerTitle").innerText = n.title ? trToUpper(n.title) : "BAŞLIKSIZ";
            var icerikEl = document.getElementById("noteViewerIcerik");
            var icerikHtml = n.content || '';
            icerikEl.innerHTML = icerikHtml;
            var txt = icerikEl.innerText.replace(/\s+/g,' ').trim();
            if (txt === '' && icerikEl.querySelectorAll('img, table, iframe, video').length === 0) {
                icerikEl.innerHTML = '<p style="color:#999;font-style:italic;">İçerik yok.</p>';
            }
            document.getElementById("noteViewerModal").style.display = "flex";
        }

        function noteViewerKapat() {
            document.getElementById("noteViewerModal").style.display = "none";
            noteViewerId = null;
        }

        function noteViewerSil() {
            var id = noteViewerId;
            if (!id) return;
            noteViewerKapat();
            tmConfirm("Bu notu silmek istediğinize emin misiniz?", function() {
                var notes = noteDbYukle().filter(function(x) { return x.id !== id; });
                noteDbKaydet(notes);
                noteListele();
                tmNotify("Not silindi.", "success");
            });
        }

        function noteSil(id) {
            tmConfirm("Bu notu silmek istediğinize emin misiniz?", function() {
                var notes = noteDbYukle().filter(function(x) { return x.id !== id; });
                noteDbKaydet(notes);
                noteListele();
                tmNotify("Not silindi.", "success");
            });
        }

        var noteDragId = null;

        function noteDragStart(event, id) {
            noteDragId = id;
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', id);
        }

        function noteDragOver(event) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
        }

        function noteDragEnter(event) {
            event.preventDefault();
            var item = event.target.closest('.note-klasor-item');
            if (item) item.classList.add('drag-over');
        }

        function noteDragLeave(event) {
            var item = event.target.closest('.note-klasor-item');
            if (item) item.classList.remove('drag-over');
        }

        function noteDrop(event, folderId) {
            event.preventDefault();
            var item = event.target.closest('.note-klasor-item');
            if (item) item.classList.remove('drag-over');
            var id = noteDragId || event.dataTransfer.getData('text/plain');
            if (!id) return;
            noteDragId = null;
            var notes = noteDbYukle();
            var n = notes.find(function(x) { return x.id === id; });
            if (!n) return;
            var hedefKlasorId = folderId || null;
            if (n.folderId === hedefKlasorId) return;
            n.folderId = hedefKlasorId;
            n.updatedAt = Date.now();
            noteDbKaydet(notes);
            noteListele();
            tmNotify("Not taşındı.", "success");
        }

        function noteKlasorDialog() {
            var body = document.getElementById("noteKlasorBody");
            var klasorler = noteKlasorDbYukle();
            var html = '<div style="display:flex;gap:8px;margin-bottom:14px;"><input type="text" id="noteYeniKlasorAd" placeholder="Klasör adı..." style="flex:1;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-card);color:var(--text-dark);"><button class="btn-save-green" onclick="noteKlasorEkle()" style="padding:8px 16px;">Ekle</button></div><div style="display:flex;flex-direction:column;gap:4px;" id="noteKlasorListeBody">';
            if (klasorler.length === 0) { html += '<p style="color:var(--text-light);font-size:13px;text-align:center;">Henüz klasör yok.</p>'; }
            klasorler.forEach(function(k) {
                html += '<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--bg-card);border-radius:6px;border:1px solid var(--border-color);"><span style="flex:1;font-size:13px;"><i class="fa-regular fa-folder"></i> ' + esc(k.name) + '</span><button class="btn-warning" onclick="noteKlasorAdDegistir(\'' + k.id + '\')" style="padding:3px 8px;font-size:10px;"><i class="fa-regular fa-pen-to-square"></i></button><button class="btn-danger" onclick="noteKlasorSil(\'' + k.id + '\')" style="padding:3px 8px;font-size:10px;"><i class="fa-solid fa-trash-can"></i></button></div>';
            });
            html += '</div>';
            body.innerHTML = html;
            document.getElementById("noteKlasorModal").style.display = "flex";
            setTimeout(function() { var inp = document.getElementById("noteYeniKlasorAd"); if (inp) inp.focus(); }, 200);
        }

        function noteKlasorKapat() { document.getElementById("noteKlasorModal").style.display = "none"; }

        function noteKlasorEkle() {
            var ad = document.getElementById("noteYeniKlasorAd").value.trim().toUpperCase();
            if (!ad) { tmNotify("Klasör adı gerekli!", "error"); return; }
            var klasorler = noteKlasorDbYukle();
            if (klasorler.some(function(k) { return k.name.toLowerCase() === ad.toLowerCase(); })) { tmNotify("Bu adla klasör zaten var!", "error"); return; }
            klasorler.push({ id: noteIdUret(), name: ad, createdAt: Date.now() });
            noteKlasorDbKaydet(klasorler);
            noteKlasorDialog();
            noteListele();
            tmNotify("Klasör oluşturuldu: " + ad, "success");
        }

        function noteKlasorAdDegistir(id) {
            tmPrompt("Yeni klasör adı:", function(yeniAd) {
                if (!yeniAd || !yeniAd.trim()) return;
                var klasorler = noteKlasorDbYukle();
                var k = klasorler.find(function(x) { return x.id === id; });
                if (k) { k.name = yeniAd.trim().toUpperCase(); noteKlasorDbKaydet(klasorler); noteKlasorDialog(); noteListele(); tmNotify("Klasör adı değiştirildi.", "success"); }
            }, (noteKlasorDbYukle().find(function(x) { return x.id === id; }) || {}).name || "");
        }

        function noteKlasorDuzenle(id) { noteKlasorAdDegistir(id); }

        function noteKlasorSil(id) {
            tmConfirm("Bu klasörü silmek istediğinize emin misiniz? (İçindeki notlar silinmez, klasörsüz kalır.)", function() {
                var klasorler = noteKlasorDbYukle().filter(function(x) { return x.id !== id; });
                noteKlasorDbKaydet(klasorler);
                var notes = noteDbYukle().map(function(x) { if (x.folderId === id) x.folderId = null; return x; });
                noteDbKaydet(notes);
                if (noteAktifKlasorId === id) noteAktifKlasorDegistir(null);
                noteListele();
                tmNotify("Klasör silindi, notlar korundu.", "success");
            });
        }

        function noteTasi(id) {
            var body = document.getElementById("noteTasiBody");
            var klasorler = noteKlasorDbYukle();
            var html = '<p style="font-size:13px;margin-bottom:10px;">Notu taşımak için bir klasör seçin:</p>';
            html += '<div style="display:flex;flex-direction:column;gap:4px;">';
            html += '<button class="note-klasor-item" onclick="noteTasiSec(\'' + id + '\', null)" style="width:100%;"><i class="fa-regular fa-folder-open"></i> Tüm Notlar (Klasörsüz)</button>';
            klasorler.forEach(function(k) {
                html += '<button class="note-klasor-item" onclick="noteTasiSec(\'' + id + '\', \'' + k.id + '\')" style="width:100%;"><i class="fa-regular fa-folder"></i> ' + esc(k.name) + '</button>';
            });
            html += '</div>';
            body.innerHTML = html;
            document.getElementById("noteTasiModal").style.display = "flex";
        }

        function noteTasiSec(noteId, klasorId) {
            var notes = noteDbYukle();
            var n = notes.find(function(x) { return x.id === noteId; });
            if (n) { n.folderId = klasorId; n.updatedAt = Date.now(); noteDbKaydet(notes); }
            noteTasiKapat();
            noteListele();
            tmNotify("Not taşındı.", "success");
        }

        function noteTasiKapat() { document.getElementById("noteTasiModal").style.display = "none"; }

        function notePdfIndir() {
            var id = noteViewerId;
            if (!id) return;
            var notes = noteDbYukle();
            var n = notes.find(function(x) { return x.id === id; });
            if (!n) { tmNotify("Not bulunamadi!", "error"); return; }

            var baslik = esc(trToUpper(n.title || "BAŞLIKSIZ"));

            var icerik = (n.content || '')
                .replace(/<font\s+([^>]*)>/gi, function(m, a) {
                    var s = '';
                    var sz = a.match(/size=["']?(\d)["']?/i);
                    if (sz) { var m2 = {1:'10px',2:'12px',3:'14px',4:'16px',5:'20px',6:'28px',7:'40px'}; s += 'font-size:' + (m2[sz[1]] || '14px') + ';'; }
                    var c = a.match(/color=["']?([^"'\s>]+)["']?/i);
                    if (c) s += 'color:' + c[1] + ';';
                    return '<span style="' + s + '">';
                }).replace(/<\/font>/gi, '</span>');

            var MM = 12, PW = 186, PH = 273;

            var htm = '<div style="font-size:14px;line-height:1.6;color:#333;">'
                + '<div style="font-weight:700;font-size:15px;color:#000;">' + baslik + '</div>'
                + '<div style="height:24px;"></div>'
                + icerik
                + '<style>body{margin:0;padding:0;background:#fff;}img{max-width:100%;height:auto;}table{width:100%;border-collapse:collapse;}td,th{padding:4px 6px;border:1px solid #ccc;text-align:left;}pre{white-space:pre-wrap;word-break:break-word;}*{box-sizing:border-box;}</style></div>';

            var el = document.createElement('div');
            el.style.cssText = 'position:fixed;left:0;top:0;width:' + PW + 'mm;box-sizing:border-box;background:#fff;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#333;z-index:99999;';
            el.innerHTML = htm;
            document.body.appendChild(el);

            tmLoadingGoster("PDF oluşturuluyor...");
            setTimeout(function() {
                try {
                    var totalH = el.scrollHeight;
                    if (!totalH || totalH < 10) { throw new Error("Eleman yuksekligi alinamadi: " + totalH); }
                    html2canvas(el, { scale: 1, useCORS: true, logging: false, backgroundColor: '#ffffff' }).then(function(cv) {
                        var ew = el.offsetWidth;
                        var lh = Math.round(parseFloat(getComputedStyle(el).lineHeight)) || 22;
                        el.style.display = 'none';
                        if (!cv || cv.width < 10 || cv.height < 10) { throw new Error("Canvas gorsel icerigi bos"); }
                        var doc = new jspdf.jsPDF({ format: 'a4', orientation: 'portrait', unit: 'mm' });
                        var pxPerMm = ew / PW;
                        var pp = Math.floor(PH * pxPerMm / lh) * lh;
                        if (pp < lh) pp = lh;
                        var pg = Math.ceil(totalH / pp);
                        for (var i = 0; i < pg; i++) {
                            if (i > 0) doc.addPage();
                            var sy = i * pp;
                            var sh = Math.min(pp, totalH - sy);
                            if (sh <= 0) break;
                            var c2 = document.createElement('canvas');
                            c2.width = cv.width;
                            c2.height = sh;
                            var ctx = c2.getContext('2d');
                            ctx.fillStyle = '#ffffff';
                            ctx.fillRect(0, 0, c2.width, c2.height);
                            ctx.drawImage(cv, 0, sy, cv.width, sh, 0, 0, c2.width, c2.height);
                            doc.addImage(c2.toDataURL('image/jpeg', 0.95), 'JPEG', MM, MM, PW, sh / pxPerMm);
                        }
                        var fn = (n.title || "NOT").replace(/[\/\\:*?"<>|,;\.]/g, '_').trim();
                        doc.save(fn + ".pdf");
                        document.body.removeChild(el);
                        tmLoadingGizle();
                    }).catch(function(e) {
                        throw e;
                    });
                } catch (e) {
                    console.error("PDF hatasi:", e);
                    try { document.body.removeChild(el); } catch (ex) {}
                    tmLoadingGizle();
                    tmNotify("PDF hatasi: " + (e.message || e), "error");
                }
            }, 400);
        }

