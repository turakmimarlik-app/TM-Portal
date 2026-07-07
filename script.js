        var APP_VERSION = 'V1.10.5';

        /* Production - console loglari kapat */
        console.log=function(){}; console.warn=function(){}; console.error=function(){};

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
            'tm-fiyatlar-page': ['tm_fiyat_listesi_db'],
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
            "₺/m²"
        ];
        let SABIT_BIRIM_LISTESI = ["M²","ADET","KM","AY","GÜN"];

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
                    var subMap={"teklif-submenu":"arrow-icon","portfoy-submenu":"arrow-portfoy-icon","muhasebe-submenu":"arrow-muhasebe-icon"};var openSub=localStorage.getItem("tm_submenu_open");if(openSub&&subMap[openSub]){var sm=document.getElementById(openSub);if(sm){sm.classList.add("open");var ar=document.getElementById(subMap[openSub]);if(ar)ar.innerText="▲";}}if(savedPage&&savedPage!=='anasayfa-page'){var si=document.getElementById('sub-'+savedPage.replace('-page',''));if(si)si.classList.add('active');}
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
                                errorDiv.innerText = "⚠️ " + baskaAktif + " kullanıcısı aktif olduğu için oturumunuz sonlandırıldı.";
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
            function csInit(){document.querySelectorAll('select:not(.cs-done)').forEach(function(s){if(s.options.length>0){s.classList.add('cs-done');s.style.display='none';var w=document.createElement('div');w.className='cs-wrapper';var t=document.createElement('div');t.className='cs-trigger';var d=document.createElement('div');d.className='cs-dropdown';var inp=document.createElement('input');inp.className='cs-search';inp.type='text';inp.placeholder='Ara...';inp.autocomplete='off';function csBuild(f){var opts=d.querySelectorAll('.cs-option');for(var j=opts.length-1;j>=0;j--){opts[j].remove();}var fv=f?f.toLowerCase():'';var found=false;for(var i=0;i<s.options.length;i++){var txt=s.options[i].text;if(fv&&txt.toLowerCase().indexOf(fv)===-1)continue;var o=document.createElement('div');o.className='cs-option'+(s.selectedIndex===i?' sel':'');o.textContent=txt;o.dataset.index=i;(function(idx){o.onclick=function(e){e.stopPropagation();s.selectedIndex=idx;t.textContent=s.options[idx].text;d.classList.remove('open');t.classList.remove('open');inp.value='';d.querySelectorAll('.cs-option').forEach(function(x){x.classList.remove('sel');});this.classList.add('sel');s.dispatchEvent(new Event('change',{bubbles:true}));};})(i);d.appendChild(o);found=true;}if(!found&&fv){var no=document.createElement('div');no.className='cs-option';no.textContent='(eşleşme bulunamadı)';no.style.cursor='default';no.style.color='var(--text-light)';d.appendChild(no);}t.textContent=s.options[s.selectedIndex]?s.options[s.selectedIndex].text:'';}d.appendChild(inp);inp.oninput=function(){csBuild(this.value);};inp.onclick=function(e){e.stopPropagation();};inp.onkeydown=function(e){if(e.key==='Escape'){d.classList.remove('open');t.classList.remove('open');inp.value='';}};csBuild('');t.onclick=function(e){e.stopPropagation();if(d.classList.contains('open')){d.classList.remove('open');t.classList.remove('open');inp.value='';return;}document.querySelectorAll('.cs-dropdown.open').forEach(function(x){x.classList.remove('open');x.previousElementSibling.classList.remove('open');});csBuild('');var wr=w.getBoundingClientRect();d.style.position='fixed';d.style.top=wr.bottom+'px';d.style.left=wr.left+'px';d.style.width=wr.width+'px';d.style.marginTop='-1px';d.style.borderTop='none';var sk=function(){var nr=w.getBoundingClientRect();d.style.top=nr.bottom+'px';d.style.left=nr.left+'px';};window.addEventListener('scroll',sk);d.classList.add('open');t.classList.add('open');inp.focus();d.scrollTop=0;var cf=d.querySelector('.cs-birim-footer');if(cf)cf.remove();if(s.classList.contains('row-birim')){var cft=document.createElement('div');cft.className='cs-birim-footer';cft.style.cssText='border-top:1px solid var(--border-color);padding:6px;display:flex;gap:6px;';cft.innerHTML='<button onclick="event.stopPropagation();birimEklePrompt();birimDropdownKapat(this);" style="flex:1;padding:3px 6px;font-size:10px;cursor:pointer;background:var(--accent-red);color:#fff;border:none;border-radius:3px;font-weight:600;">+ YENİ</button><button onclick="event.stopPropagation();birimSilPrompt();birimDropdownKapat(this);" style="flex:1;padding:3px 6px;font-size:10px;cursor:pointer;background:#555;color:#fff;border:none;border-radius:3px;font-weight:600;">- SİL</button>';d.appendChild(cft);}};w.appendChild(t);w.appendChild(d);s.parentNode.insertBefore(w,s);if(s.style.flex){w.style.flex=s.style.flex;w.style.width='';}else if(s.style.width)w.style.width=s.style.width;}});}document.addEventListener('click',function(){document.querySelectorAll('.cs-dropdown.open').forEach(function(x){x.classList.remove('open');var ps=x.previousElementSibling;if(ps)ps.classList.remove('open');var si=x.querySelector('.cs-search');if(si)si.value='';});});

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

            document.addEventListener("click", function(e) {
                if (!e.target.classList.contains("tm-autocomplete-item") && e.target.tagName !== "INPUT") {
                    document.querySelectorAll(".tm-autocomplete-box").forEach(box => box.style.display = "none");
                }
            });

            piyasaDallariSecenekleriniDoldur();
            piyasaBirimTipiSecenekleriniDoldur();
            musteriEtiketleriniDoldur();
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

        let AKTIF_KULLANICI_YETKILERI = [];
        let TEKLIF_SIRALAMA_YONU = "AZALAN";
        let P_GRUP_SIRALAMA = {};

        const TM_YETKI_TANIMLARI = [
            { key:"anasayfa", label:"🏠 Ana Sayfa (Dashboard)" },
            { key:"teklif-olustur", label:"📄 Fiyatlandırma: Teklif Oluştur" },
            { key:"teklif-liste", label:"📋 Fiyatlandırma: Geçmiş Teklifler" },
            { key:"piyasa-fiyatlari", label:"📊 Fiyatlandırma: Piyasa Fiyatları" },
            { key:"tm-fiyatlar", label:"📈 Fiyatlandırma: TM Fiyatlar" },
            { key:"musteriler", label:"🗂️ Portföy: Müşteriler" },
            { key:"isortaklari", label:"🤝 Portföy: İş Ortakları" },
            { key:"dilekce", label:"📝 Dilekçe Oluştur" },
            { key:"istakibi", label:"📅 İş Takibi" },
            { key:"nakit-dekont", label:"💳 Muhasebe: Nakit Ödeme Dekontu" },
            { key:"is-muhasebe-olustur", label:"📌 Muhasebe: İş Muhasebesi Oluştur" },
            { key:"is-muhasebe", label:"💰 Muhasebe: İş Muhasebesi Takibi" },
            { key:"tamamlanan-is-muhasebe", label:"✅ Muhasebe: Tamamlanan İş Muhasebeleri" },
            { key:"hesap-takip", label:"🏦 Muhasebe: Hesap Takip Sistemi" },
            { key:"fatura-takip", label:"🧾 Muhasebe: Fatura Takip Sistemi" },
            { key:"yillik-butce", label:"📊 Muhasebe: Yıllık Bütçeler" },
            { key:"yonetim", label:"⚙️ Portal Yönetimi" }
        ];

        function yetkiCheckboxlariniRenderEt() {
            const container = document.getElementById("yetkiCheckboxContainer");
            if (!container) return;
            let html = '<div class="checkbox-group" style="display:grid; grid-template-columns:repeat(2,1fr); gap:10px; background:none; border:none; padding:0;">';
            TM_YETKI_TANIMLARI.forEach(function(item) {
                html += '<div class="checkbox-item" style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--panel-bg);border:1px solid var(--border-color);border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.02);">';
                html += '<input type="checkbox" id="auth_' + item.key.replace(/[.-]/g,"_") + '" style="width:16px;height:16px;cursor:pointer;">';
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
            if(!text) return "-";
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
                lo.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);z-index:99998;justify-content:center;align-items:center;backdrop-filter:blur(2px);';
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
            return '<div class="tm-empty-state"><div class="tm-empty-icon">' + (icon||'📭') + '</div><div class="tm-empty-title">' + (title||'Kayıt bulunamadı') + '</div><div class="tm-empty-desc">' + (desc||'Henüz kayıt eklenmemiş.') + '</div>' + (btn ? btn : '') + '</div>';
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
                var txt = b.textContent.replace(/[🔍📋📊📜✅🗑️📌📅📄➕💾🔷🚀🎨📤📥🧾⚙️📁✏️❌⭐✔️🎯🔗🔒🔓👁️🔄❓📎📩🖨️🔃🔔💳💰👤👥🏢🏠🛠️📦📝🖊️💵🔑🔧🔨🪛📐📏🖍️🎨🖼️🏗️🏘️🌳🏞️📰🗞️🗺️📍📌🔍🔎☀️🌙🔆🌓◀▶▲▼✕＋×\s]/g,'').trim();
                if (!txt && b.textContent.trim().length > 0) {
                    var iconText = b.textContent.trim().substring(0,2);
                    var label = '';
                    if (iconText.indexOf('🗑')!==-1) label = 'Sil';
                    else if (iconText.indexOf('✏')!==-1) label = 'Düzenle';
                    else if (iconText.indexOf('📜')!==-1) label = 'Ruhsat Onayı';
                    else if (iconText.indexOf('✅')!==-1) label = 'Onayla';
                    else if (iconText.indexOf('📄')!==-1) label = 'PDF';
                    else if (iconText.indexOf('💾')!==-1) label = 'Kaydet';
                    else if (iconText.indexOf('➕')!==-1) label = 'Ekle';
                    else if (iconText.indexOf('🚀')!==-1) label = 'Başlat';
                    else if (iconText.indexOf('🔷')!==-1) label = '3B Modelleme';
                    else if (iconText.indexOf('📤')!==-1) label = 'Giden';
                    else if (iconText.indexOf('📥')!==-1) label = 'Gelen';
                    else if (iconText.indexOf('🔍')!==-1) label = 'Ara';
                    else if (iconText.indexOf('📋')!==-1) label = 'Liste';
                    else if (iconText.indexOf('📊')!==-1) label = 'Gantt';
                    else if (iconText.indexOf('📅')!==-1) label = 'Takvim';
                    if (label) {
                        b.classList.add('tm-tooltip-wrap');
                        b.innerHTML = b.innerHTML + '<span class="tm-tooltip-text">' + label + '</span>';
                    }
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
            if(name.includes("ZİRAAT") || name.includes("ZIRAAT")) return "#9E2A2B"; 
            if(name.includes("GARANTİ") || name.includes("GARANTI") || name.includes("VAKIF")) return "#2E7D32";
            if(name.includes("İŞ") || name.includes("IS ") || name.includes("YAPI") || name.includes("AKBANK")) return "#0D47A1";
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
                        errorDiv.innerText = "⚠️ " + aktif + " kullanıcısı halen aktif. Çıkış yapmasını bekleyin.";
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
            btn.textContent = collapsed ? '▶' : '◀';
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
                document.getElementById('sidebarToggle').textContent = '◀';
                localStorage.setItem('tm_sidebar_collapsed', '0');
            }
        }
        function menuyuInsaEt(yetkiler) {
            if (localStorage.getItem('tm_sidebar_collapsed') === '1') {
                document.querySelector('.sidebar').classList.add('collapsed');
                document.getElementById('sidebarToggle').textContent = '▶';
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
            document.querySelectorAll(".menu-item .arrow").forEach(a => { if (a.id !== arrowId) a.innerText = "▼"; });
            if (opening) { sub.classList.add("open"); arrow.innerText = "▲"; try { origSetItem("tm_submenu_open", id); } catch(e) { console.error("Submenu acma hatasi:", e); } }
            else { sub.classList.remove("open"); arrow.innerText = "▼"; try { origSetItem("tm_submenu_open", ""); } catch(e) { console.error("Submenu kapama hatasi:", e); } }
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
        function tmConfirm(msg, onEvet) {
            document.getElementById("tmConfirmMsg").textContent = msg;
            document.getElementById("tmConfirmOverlay").style.display = "flex";
            document.getElementById("tmConfirmOk").onclick = function() { document.getElementById("tmConfirmOverlay").style.display = "none"; if (onEvet) onEvet(); };
            document.getElementById("tmConfirmCancel").onclick = function() { document.getElementById("tmConfirmOverlay").style.display = "none"; };
        }
        function tmPrompt(msg, onTamam) {
            document.getElementById("tmPromptMsg").textContent = msg;
            document.getElementById("tmPromptInput").value = "";
            document.getElementById("tmPromptOverlay").style.display = "flex";
            setTimeout(function() { document.getElementById("tmPromptInput").focus(); }, 100);
            document.getElementById("tmPromptOk").onclick = function() {
                var val = document.getElementById("tmPromptInput").value;
                document.getElementById("tmPromptOverlay").style.display = "none";
                if (onTamam) onTamam(val);
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
                if (pageId === 'anasayfa-page') { asTakvimRender(); asGorevListele(); dashboardVerileriniGuncelle(); }
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
            } catch(e) { console.warn('sayfa yenileme hatasi', e); }
            localStorage.setItem('tm_active_page', pageId);
            tmFormDirty = false;
            sayfaLoadingBitir();
            setTimeout(function(){ tmIkonButtonTooltipEkle(); tmScrollHintKontrol(); }, 100);
        }
        function yenileAktifSayfa() {
            try {
                if (document.querySelector('.cs-dropdown.open')) return;
                if (document.activeElement && ['INPUT','TEXTAREA'].indexOf(document.activeElement.tagName) !== -1) return;
                var csValues = {};
                document.querySelectorAll('select.cs-done').forEach(function(s){
                    csValues[s.id] = s.selectedIndex;
                });
                var activePage = document.querySelector('.page.active');
                if (!activePage) return;
                var id = activePage.id;
                if (id === 'anasayfa-page') { asTakvimRender(); asGorevListele(); dashboardVerileriniGuncelle(); }
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
                else if (id === 'tm-fiyatlar-page') { if (!tmfEditing) tmfSayfayiYukle(); }
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

        function temaDegistir(tema) {
            document.documentElement.setAttribute('data-theme', tema);
            localStorage.setItem("tm_theme", tema);
            const thumb = document.getElementById("themeToggleThumb");
            if (thumb) {
                if (tema === "dark") thumb.classList.add("dark"); else thumb.classList.remove("dark");
            }
            document.querySelectorAll(".theme-toggle-option").forEach(function(el) {
                el.classList.toggle("active", (tema === "dark" && el.classList.contains("right")) || (tema === "light" && el.classList.contains("left")));
            });
        }
        function temaToggle() {
            const simdiki = localStorage.getItem("tm_theme") || "dark";
            temaDegistir(simdiki === "dark" ? "light" : "dark");
        }
        temaDegistir(localStorage.getItem("tm_theme") || "dark");

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
                    offerBody.innerHTML = '<tr><td colspan="4">'+tmEmptyStateHTML('📄','Kayıtlı teklif bulunmamaktadır.','Yeni bir teklif oluşturmak için "Yeni Teklif" butonunu kullanın.')+'</td></tr>';
                } else {
                    const son = [...teklifDb].sort(function(a,b){return b.id-a.id;}).slice(0,5);
                    offerBody.innerHTML = "";
                    son.forEach(function(t){
                        offerBody.innerHTML += '<tr>' +
                            '<td style="font-weight:700;color:var(--accent-red);font-size:12px;">#' + String(t.id).padStart(4,'0') + '</td>' +
                            '<td style="font-weight:600;">' + esc(t.musteriAd) + '</td>' +
                            '<td style="color:var(--text-light);font-size:12px;">' + (t.isAdi ? esc(t.isAdi).substring(0,30) + (t.isAdi.length>30?'...':'') : '-') + '</td>' +
                            '<td style="text-align:right;font-weight:700;color:var(--accent-red);font-size:13px;">' + (t.genelTutar || '0,00 ₺') + '</td>' +
                            '</tr>';
                    });
                }
            }

            // AKTİF İŞLER
            const jobsBody = document.getElementById("dashActiveJobsBody");
            if(jobsBody) {
                if(isMuhDb.length === 0) {
                    jobsBody.innerHTML = tmEmptyStateHTML('📅','Aktif iş bulunmamaktadır.','Dashboard\'da görüntülenecek aktif bir iş kaydı bulunmuyor.');
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
                            '<div class="job-amount"><span class="val" style="color:' + (kalan>0?'var(--accent-red)':'var(--btn-green)') + ';">' + (kalan || 0).toLocaleString('tr-TR',{minFractionDigits:2}) + ' ₺</span>' +
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
                        '<tr><td style="font-weight:600;">📥 Gelen</td><td style="text-align:center;">' + gelen.length + '</td><td style="text-align:right;font-weight:600;">' + tmTl(gelenT) + '</td><td style="text-align:right;font-size:12px;color:var(--accent-red);">' + tmTl(gelenK) + '</td></tr>' +
                        '<tr><td style="font-weight:600;">📤 Giden</td><td style="text-align:center;">' + giden.length + '</td><td style="text-align:right;font-weight:600;">' + tmTl(gidenT) + '</td><td style="text-align:right;font-size:12px;color:var(--btn-green);">' + tmTl(gidenK) + '</td></tr>';
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
                        vTkv.innerHTML = '<div style="text-align:center;padding:15px;color:var(--text-light);font-size:13px;">📅 Yaklaşan vergi günü bulunmuyor.</div>';
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
                chart:"📊", shortcuts:"🚀", takvim:"📅", teklifler:"📄",
                isler:"🏗️", gorevler:"📋", fatura:"💰", piyasa:"📊", vergi:"📅", notlar:"📝"
            };
            var h = "";
            Object.keys(widgetAdlari).forEach(function(wid){
                var gizliMi = gizli.indexOf(wid) !== -1;
                var kart = document.querySelector('[data-widget="'+wid+'"]');
                if (!kart || kart.closest('[data-perm]') && kart.closest('[data-perm]').style.display === "none") {
                    if (!gizliMi) return;
                }
                h += '<div class="dash-ayar-item">';
                h += '<span class="dash-ayar-icon">' + (widgetIkonlari[wid]||'📦') + '</span>';
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
                { icon:"📄", label:"Yeni Teklif", page:"teklif-olustur", perm:"teklif-olustur" },
                { icon:"👤", label:"Müşteri Ekle", page:"musteriler", perm:"musteriler-page" },
                { icon:"🤝", label:"Partner Ekle", page:"isortaklari", perm:"isortaklari-page" },
                { icon:"💵", label:"Nakit Dekont", page:"nakit-dekont", perm:"nakit-dekont" },
                { icon:"📅", label:"İş Takibi", page:"istakibi", perm:"istakibi-page" },
                { icon:"💰", label:"Fatura Takip", page:"fatura-takip", perm:"fatura-takip" }
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
                h += '<span class="dash-short-icon">' + (s.icon||"📌") + '</span>';
                h += '<span>' + (s.label||"Sayfa") + '</span></div>';
            });
            if (!h) {
                konteyner.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:12px;color:var(--text-light);font-size:12px;">Henüz kısayol bulunmuyor.</div>';
            } else {
                konteyner.innerHTML = h;
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

            document.getElementById("musteriFormTitle").innerText = "⚙️ Müşteri Kartını Düzenle";
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

            document.getElementById("btnMusteriSave").innerText = "Değişiklikleri Kaydet";
            document.getElementById("btnMusteriCancel").style.display = "inline-block";
        }

        function musteriFormTemizle() {
            document.getElementById("musteriFormTitle").innerText = "📌 Yeni Müşteri Kartı Tanımla";
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
            
            document.getElementById("btnMusteriSave").innerText = "💾 Profil Kartını Kaydet";
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
                    <div style="text-align:center;"><small style="font-size:10px; color:var(--text-light); font-weight:600; display:block; text-transform:uppercase;">Toplam Müşteri</small><span style="font-weight:700; color:var(--accent-red); font-size:18px;">${db.length}</span></div>
                    <div style="text-align:center;"><small style="font-size:10px; color:var(--text-light); font-weight:600; display:block; text-transform:uppercase;">Toplam Yapılan İş</small><span style="font-weight:700; color:var(--btn-green); font-size:18px;">${toplamIs}</span></div>
                `;
            }
            if(db.length === 0) { konteyner.innerHTML = tmEmptyStateHTML('👥','Kayıtlı müşteri bulunmamaktadır.','Yeni bir müşteri eklemek için "Müşteri Ekle" butonunu kullanın.'); return; }
            
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
                        bankaHTML += `<div style="font-size:13px; margin-left:15px; color:${bankaRenk}; font-weight:700; letter-spacing:0.5px;">• ${b.banka}: ${ibanFormatted}</div>`; 
                    });
                } else { bankaHTML = " GİRİLMEMİŞ"; }

                const isSayisi = tamamlananDb.filter(t => trToUpper(t.musteriAd || t.firma || "") === trToUpper(m.ad) || trToUpper(t.firma || "") === trToUpper(m.sirket)).length;

                konteyner.innerHTML += `
                    <div class="portfolio-card m-card-item">
                        <div class="card-job-counter">
                            <small>Yapılan İş</small>
                            <span>${isSayisi}</span>
                        </div>
                        <div class="card-main-header">
                            <h4 class="m-search-ad">${m.ad}</h4>
                            <div class="p-type m-search-tipi">🏷️ ${m.tipi}</div>
                        </div>
                        <div class="p-detail"><b>Firma/Kurum:</b> <span class="m-search-sirket">${m.sirket}</span></div>
                        <div class="p-detail"><b>Ünvan:</b> <span class="m-search-unvan">${m.unvan || '-'}</span></div>
                        <div class="p-detail"><b>Telefon:</b> <span>${m.tel}</span></div>
                        <div class="p-detail"><b>E-Posta:</b> <span>${m.eposta}</span></div>
                        <div class="p-detail"><b>T.C. Kimlik:</b> <span class="m-search-kimlik">${m.kimlik || '-'}</span></div>
                        <div class="p-detail"><b>Vergi Dairesi:</b> <span>${m.vergiDairesi || '-'}</span></div>
                        <div class="p-detail"><b>Vergi No:</b> <span>${m.vergiNo || '-'}</span></div>
                        <div class="p-detail"><b>Adres:</b> <span class="m-search-adres">${m.adres}</span></div>
                        <div class="p-detail" style="flex-direction:column; gap:2px;"><b>Banka Hesapları:</b>${bankaHTML}</div>
                        <div class="card-actions">
                            <button class="btn-warning" onclick="musteriDuzenle(${m.id})">Düzenle</button>
                            <button class="btn-danger" onclick="portfolioKartSil('tm_musteriler_db', ${m.id}, 'musteri')">Sil</button>
                        </div>
                    </div>
                `;
            });
        }

        function musterileriFiltrele() {
            const kelime = document.getElementById("musteriAramaInput").value.toLowerCase().trim();
            document.querySelectorAll("#musteriKartlariKonteyner .m-card-item").forEach((kart) => {
                const ad = kart.querySelector(".m-search-ad").innerText.toLowerCase();
                const tipi = kart.querySelector(".m-search-tipi").innerText.toLowerCase();
                const sirket = kart.querySelector(".m-search-sirket").innerText.toLowerCase();
                const unvan = kart.querySelector(".m-search-unvan").innerText.toLowerCase();
                const kimlik = kart.querySelector(".m-search-kimlik").innerText.toLowerCase();
                const adres = kart.querySelector(".m-search-adres").innerText.toLowerCase();
                
                if (ad.includes(kelime) || tipi.includes(kelime) || sirket.includes(kelime) || unvan.includes(kelime) || kimlik.includes(kelime) || adres.includes(kelime)) {
                    kart.style.display = "flex";
                } else {
                    kart.style.display = "none";
                }
            });
        }

        /* ================= PORTFÖY MODÜLÜ (İŞ ORTAKLARI) MOTORU ================= */
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

            document.getElementById("partnerFormTitle").innerText = "⚙️ Partner Kartını Düzenle";
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
            document.getElementById("ioStatus").value = kart.status;
            document.getElementById("ioAdres").value = kart.adres || "";

            const kont = document.getElementById("partnerBankaKonteyner");
            kont.innerHTML = "";
            if(kart.bankalar && kart.bankalar.length > 0) {
                kart.bankalar.forEach(b => bankaSatiriEkle("partnerBankaKonteyner", b.banka, b.iban));
            } else {
                bankaSatiriEkle("partnerBankaKonteyner");
            }

            document.getElementById("btnPartnerSave").innerText = "Değişiklikleri Kaydet";
            document.getElementById("btnPartnerCancel").style.display = "inline-block";
        }

        function partnerFormTemizle() {
            document.getElementById("partnerFormTitle").innerText = "📌 Yeni İş Ortağı / Partner Kaydet";
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

            document.getElementById("btnPartnerSave").innerText = "💾 Partner Profilini Kaydet";
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
                    <div style="text-align:center;"><small style="font-size:10px; color:var(--text-light); font-weight:600; display:block; text-transform:uppercase;">Toplam Partner</small><span style="font-weight:700; color:var(--accent-red); font-size:18px;">${db.length}</span></div>
                    <div style="text-align:center;"><small style="font-size:10px; color:var(--text-light); font-weight:600; display:block; text-transform:uppercase;">Toplam Yapılan İş</small><span style="font-weight:700; color:var(--btn-green); font-size:18px;">${toplamIs}</span></div>
                `;
            }
            if(db.length === 0) { konteyner.innerHTML = tmEmptyStateHTML('🤝','Kayıtlı iş ortağı bulunmamaktadır.','Yeni bir iş ortağı eklemek için "İş Ortağı Ekle" butonunu kullanın.'); return; }

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
                        bankaHTML += `<div style="font-size:13px; margin-left:15px; color:${bankaRenk}; font-weight:700; letter-spacing:0.5px;">• ${b.banka}: ${ibanFormatted}</div>`; 
                    });
                } else { bankaHTML = " GİRİLMEMİŞ"; }

                const isSayisi = tamamlananDb.filter(t => trToUpper(t.musteriAd || t.firma || "") === trToUpper(io.ad) || trToUpper(t.firma || "") === trToUpper(io.sirket) || (t.kalemler && t.kalemler.some(k => trToUpper(k.kisi || "") === trToUpper(io.ad) || trToUpper(k.kisi || "") === trToUpper(io.sirket)))).length;

                konteyner.innerHTML += `
                    <div class="portfolio-card partner-card-item">
                        <div class="card-job-counter">
                            <small>Yapılan İş</small>
                            <span>${isSayisi}</span>
                        </div>
                        <div class="card-main-header">
                            <h4 class="p-search-ad">${io.ad}${io.status === 'Sürekli Partner' ? ' ⭐' : ''}</h4>
                            <div class="p-type p-search-brans" style="color:var(--btn-green)">📐 ${io.brans}</div>
                        </div>
                        <div class="p-detail"><b>Firma/Kurum:</b> <span class="p-search-sirket">${io.sirket}</span></div>
                        <div class="p-detail"><b>Ünvanı:</b> <span>${io.unvan || '-'}</span></div>
                        <div class="p-detail"><b>Statü:</b> <span>${io.status}</span></div>
                        <div class="p-detail"><b>İletişim:</b> <span>${io.tel}</span></div>
                        <div class="p-detail"><b>E-Posta:</b> <span>${io.eposta}</span></div>
                        <div class="p-detail"><b>T.C. Kimlik:</b> <span class="p-search-kimlik">${io.kimlik || '-'}</span></div>
                        <div class="p-detail"><b>Vergi Dairesi:</b> <span>${io.vergiDairesi || '-'}</span></div>
                        <div class="p-detail"><b>Vergi No:</b> <span>${io.vergiNo || '-'}</span></div>
                        <div class="p-detail"><b>Adres:</b> <span class="p-search-adres">${io.adres || '-'}</span></div>
                        <div class="p-detail" style="flex-direction:column; gap:2px;"><b>Banka Hesapları:</b>${bankaHTML}</div>
                        <div class="card-actions">
                            <button class="btn-warning" onclick="partnerDuzenle(${io.id})">Düzenle</button>
                            <button class="btn-danger" onclick="portfolioKartSil('tm_isortaklari_db', ${io.id}, 'partner')">Sil</button>
                        </div>
                    </div>
                `;
            });
        }

        function partnerleriFiltrele() {
            const kelime = document.getElementById("partnerAramaInput").value.toLowerCase().trim();
            document.querySelectorAll("#isOrtaklariKartlariKonteyner .partner-card-item").forEach((kart) => {
                const ad = kart.querySelector(".p-search-ad").innerText.toLowerCase();
                const brans = kart.querySelector(".p-search-brans").innerText.toLowerCase();
                const sirket = kart.querySelector(".p-search-sirket").innerText.toLowerCase();
                const kimlik = kart.querySelector(".p-search-kimlik").innerText.toLowerCase();
                const adres = kart.querySelector(".p-search-adres").innerText.toLowerCase();
                
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
                document.getElementById("yedekMsg").textContent = "✅ Yedek başarıyla indirildi.";
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
                    document.getElementById("yedekMsg").textContent = "✅ " + sayac + " veri geri yüklendi. Sayfa yenileniyor...";
                    setTimeout(function() { location.reload(); }, 1500);
                } catch(err) {
                    document.getElementById("yedekMsg").textContent = "❌ Hata: Geçersiz dosya.";
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

        /* ================= ANA SAYFA TAKVİM ================= */
        let asTakvimGorunum = "monthly";
        let asTakvimTarih = new Date();

        function asTakvimGorunumDegistir() {
            asTakvimGorunum = asTakvimGorunum === "monthly" ? "weekly" : "monthly";
            document.getElementById("asTakvimToggleBtn").textContent = asTakvimGorunum === "monthly" ? "📅 HAFTALIK GÖRÜNÜM" : "📅 AYLIK GÖRÜNÜM";
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
        function asGorevRenk(durum, tarih) {
            if (durum === "tamamlandi") return "#2E7D32";
            const bugun = new Date(); bugun.setHours(23,59,59,0);
            const hedef = new Date(tarih + "T23:59:59");
            return hedef < bugun ? "#C0392B" : "#F9A825";
        }
        function asGorevDurumEtiketi(durum, tarih) {
            if (durum === "tamamlandi") return "✅";
            const bugun = new Date(); bugun.setHours(23,59,59,0);
            const hedef = new Date(tarih + "T23:59:59");
            return hedef < bugun ? "🔴" : "📋";
        }
        function asGetMergedEvents() {
            const aktifUser = localStorage.getItem("tm_active_user") || "";
            const etkinlikler = JSON.parse(localStorage.getItem("tm_as_etkinlikler_" + aktifUser)) || [];
            const gorevler = JSON.parse(localStorage.getItem("tm_gorevler")) || [];
            var gorevEvents = gorevler.filter(function(g) {
                var atananlar = Array.isArray(g.atanan) ? g.atanan : [g.atanan];
                return atananlar.indexOf(aktifUser) >= 0 || g.veren === aktifUser;
            }).map(function(g) {
                var atananlar = Array.isArray(g.atanan) ? g.atanan : [g.atanan];
                var gorevIcin = atananlar.indexOf(aktifUser) >= 0 ? "" : (" → " + atananlar.join(", "));
                return { id: "gorev_" + g.id, date: g.tarih, time: "", title: g.baslik + (g.veren ? " (" + g.veren + gorevIcin + ")" : ""), description: g.mesaj || "", type: "gorev", durum: g.durum, tarih: g.tarih };
            });
            return etkinlikler.concat(gorevEvents);
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
            let html = '<table class="as-tbl"><thead><tr>';
            ["PTS","SAL","ÇAR","PER","CUM","CMT","PAZ"].forEach(function(g) { html += '<th>' + g + '</th>'; });
            html += '</tr></thead><tbody><tr>';
            for (let i = 0; i < (ilkGun === 0 ? 6 : ilkGun - 1); i++) {
                html += '<td class="as-td-other">' + (oncekiAyGun - (ilkGun === 0 ? 7 : ilkGun - 1) + 1 + i) + '</td>';
            }
            for (let g = 1; g <= ayGun; g++) {
                const gunStr = yil + "-" + String(ay + 1).padStart(2, "0") + "-" + String(g).padStart(2, "0");
                const bugunMu = (bugun.getFullYear() === yil && bugun.getMonth() === ay && bugun.getDate() === g);
                const gunEtk = etkinlikler.filter(function(e) { return e.date === gunStr; });
                html += '<td' + (bugunMu ? ' class="as-day-today"' : '') + '>';
                html += '<span class="as-day-num">' + g + '</span>';
                if (gunEtk.length > 0) {
                    html += '<div class="as-event-dots">';
                    gunEtk.forEach(function(e) {
                        const renk = e.type === "reminder" ? "#E67E22" : (e.type === "note" ? "#95A5A6" : (e.type === "gorev" ? asGorevRenk(e.durum, e.tarih) : "#2B6CB0"));
                        html += '<span class="as-event-dot" style="background:' + renk + ';" onclick="asGosterGunBilgi(\'' + gunStr + '\');event.stopPropagation();" title="' + e.title.replace(/'/g,"&apos;") + '"></span>';
                    });
                    html += '</div>';
                }
                html += '<span class="as-add-btn" onclick="asEventModalAc(\'' + gunStr + '\')">+</span>';
                html += '</td>';
                if ((ilkGun === 0 ? 6 : ilkGun - 1) + g > 0 && ((ilkGun === 0 ? 6 : ilkGun - 1) + g) % 7 === 0) html += '</tr><tr>';
            }
            const kalan = 7 - (((ilkGun === 0 ? 6 : ilkGun - 1) + ayGun) % 7 || 7);
            for (let i = 1; i <= kalan; i++) { html += '<td class="as-td-other">' + i + '</td>'; }
            html += '</tr></tbody></table>';
            container.innerHTML = html;
        }
        function asTakvimHaftalikRender(container) {
            const yil = asTakvimTarih.getFullYear(), ay = asTakvimTarih.getMonth();
            const bugun = asTakvimTarih.getDate();
            const haftaBas = new Date(yil, ay, bugun - ((asTakvimTarih.getDay() || 7) - 1));
            document.getElementById("asTakvimBaslik").textContent = haftaBas.toLocaleDateString("tr-TR") + " HAFTASI";
            const etkinlikler = asGetMergedEvents();
            const saatler = ["08","09","10","11","12","13","14","15","16","17","18","19","20"];
            let html = '<table class="as-tbl"><thead><tr><th style="width:30px;"></th>';
            for (let i = 0; i < 7; i++) {
                const d = new Date(haftaBas); d.setDate(haftaBas.getDate() + i);
                const gnAd = ["PTS","SAL","ÇAR","PER","CUM","CMT","PAZ"][i];
                const bugunMu = (new Date().getFullYear() === d.getFullYear() && new Date().getMonth() === d.getMonth() && new Date().getDate() === d.getDate());
                html += '<th' + (bugunMu ? ' style="color:var(--accent-red);"' : '') + '>' + gnAd + ' ' + d.getDate() + '</th>';
            }
            html += '</tr></thead><tbody>';
            saatler.forEach(function(s) {
                html += '<tr><td style="padding:2px;text-align:center;font-size:8px;color:var(--text-light);border:1px solid var(--border-color);font-weight:600;">' + s + ':00</td>';
                for (let i = 0; i < 7; i++) {
                    const d = new Date(haftaBas); d.setDate(haftaBas.getDate() + i);
                    const gunStr = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
                    const saatEtk = etkinlikler.filter(function(e) { return e.date === gunStr && e.time && e.time.startsWith(s); });
                    let cell = '<td style="padding:1px;border:1px solid var(--border-color);vertical-align:top;overflow:hidden;cursor:pointer;position:relative;" onclick="asEventModalAc(\'' + gunStr + '\');event.stopPropagation();">';
                    if (saatEtk.length > 0) {
                        cell += '<div class="as-event-dots">';
                        saatEtk.forEach(function(e) {
                            const renk = e.type === "reminder" ? "#E67E22" : (e.type === "note" ? "#95A5A6" : (e.type === "gorev" ? asGorevRenk(e.durum, e.tarih) : "#2B6CB0"));
                            const isGorev = e.type === "gorev";
                            const id = e.id || "";
                            cell += '<span class="as-event-dot" style="background:' + renk + ';cursor:pointer;" onclick="event.stopPropagation();' + (isGorev ? 'asGosterGunBilgi(\'' + gunStr + '\')' : 'asEventDuzenle(\'' + id.replace(/'/g,"\\'") + '\')') + ';" title="' + e.title.replace(/'/g,"&apos;") + '"></span>';
                        });
                        cell += '</div>';
                    }
                    cell += '<span style="position:absolute;right:1px;bottom:1px;font-size:10px;font-weight:700;color:var(--text-light);cursor:pointer;opacity:0.5;" onclick="event.stopPropagation();asEventModalAc(\'' + gunStr + '\');">+</span>';
                    cell += '</td>';
                    html += cell;
                }
                html += '</tr>';
            });
            html += '</tbody></table>';
            container.innerHTML = html;
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
                html += '<span class="as-etkinlik-text">' + durumEtiketi + e.title + ' <small>' + e.date + ' ' + (e.time||'') + '</small></span>';
                if (!isGorev) { html += '<button class="as-etkinlik-edit" onclick="asEventDuzenle(\'' + e.id + '\')">✏️</button>'; }
                html += '</div>';
            });
            html += '</div>';
            container.innerHTML = html;
        }
        function asEventModalAc(tarih) {
            document.getElementById("asEventEditId").value = "";
            document.getElementById("asEventDate").value = tarih;
            document.getElementById("asEventTitle").value = "";
            document.getElementById("asEventTime").value = "09:00";
            document.getElementById("asEventDesc").value = "";
            document.getElementById("asEventType").value = "reminder";
            document.getElementById("asEventModalTitle").textContent = "ETKİNLİK EKLE - " + tarih;
            document.getElementById("asEventSilBtn").style.display = "none";
            document.getElementById("asEventModal").style.display = "flex";
        }
        function asEventDuzenle(id) {
            const aktifUser = localStorage.getItem("tm_active_user") || "";
            const etkinlikler = JSON.parse(localStorage.getItem("tm_as_etkinlikler_" + aktifUser)) || [];
            const ev = etkinlikler.find(function(e) { return e.id === id; });
            if (!ev) return;
            document.getElementById("asEventEditId").value = id;
            document.getElementById("asEventDate").value = ev.date;
            document.getElementById("asEventTitle").value = ev.title;
            document.getElementById("asEventTime").value = ev.time || "09:00";
            document.getElementById("asEventDesc").value = ev.description || "";
            document.getElementById("asEventType").value = ev.type;
            document.getElementById("asEventModalTitle").textContent = "ETKİNLİK DÜZENLE - " + ev.date;
            document.getElementById("asEventSilBtn").style.display = "inline-block";
            document.getElementById("asEventModal").style.display = "flex";
        }
        function asEventKaydet() {
            const aktifUser = localStorage.getItem("tm_active_user") || "";
            const editId = document.getElementById("asEventEditId").value;
            const date = document.getElementById("asEventDate").value;
            const title = document.getElementById("asEventTitle").value.trim();
            const time = document.getElementById("asEventTime").value;
            const desc = document.getElementById("asEventDesc").value.trim();
            const type = document.getElementById("asEventType").value;
            if (!title || !date) { tmNotify("Başlık ve tarih zorunludur!", "error"); return; }
            let etkinlikler = JSON.parse(localStorage.getItem("tm_as_etkinlikler_" + aktifUser)) || [];
            if (editId) {
                const idx = etkinlikler.findIndex(function(e) { return e.id === editId; });
                if (idx >= 0) { etkinlikler[idx] = { id: editId, date: date, time: time, title: title, description: desc, type: type }; }
            } else {
                const id = "as_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4);
                etkinlikler.push({ id: id, date: date, time: time, title: title, description: desc, type: type });
            }
            localStorage.setItem("tm_as_etkinlikler_" + aktifUser, JSON.stringify(etkinlikler));
            asEventModalKapat();
            asTakvimRender();
            tmNotify("Etkinlik kaydedildi.", "success");
        }
        function asEventSil() {
            const id = document.getElementById("asEventEditId").value;
            if (!id) return;
            tmConfirm("Bu etkinliği silmek istediğinize emin misiniz?", function() {
                const aktifUser = localStorage.getItem("tm_active_user") || "";
                let etkinlikler = JSON.parse(localStorage.getItem("tm_as_etkinlikler_" + aktifUser)) || [];
                etkinlikler = etkinlikler.filter(function(e) { return e.id !== id; });
                localStorage.setItem("tm_as_etkinlikler_" + aktifUser, JSON.stringify(etkinlikler));
                asEventModalKapat();
                asTakvimRender();
                tmNotify("Etkinlik silindi.", "success");
            });
        }
        function asEventModalKapat() {
            document.getElementById("asEventModal").style.display = "none";
        }
        function asGosterGunBilgi(gunStr) {
            const etkinlikler = asGetMergedEvents().filter(function(e) { return e.date === gunStr; });
            if (etkinlikler.length === 0) return;
            document.getElementById("asGunInfoTitle").textContent = "📅 " + gunStr + " - ETKİNLİKLER";
            var h = "";
            etkinlikler.forEach(function(e) {
                const renk = e.type === "reminder" ? "#E67E22" : (e.type === "note" ? "#95A5A6" : (e.type === "gorev" ? asGorevRenk(e.durum, e.tarih) : "#2B6CB0"));
                const turAdi = e.type === "reminder" ? "🔔 ANIMSATICI" : (e.type === "note" ? "📝 NOT" : (e.type === "gorev" ? (e.durum === "tamamlandi" ? "✅ GÖREV (TAMAMLANDI)" : "📋 GÖREV") : "🔵 DİĞER"));
                const isGorev = e.type === "gorev";
                const id = e.id || "";
                h += '<div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border-color);">';
                h += '<span style="width:12px;height:12px;border-radius:50%;background:' + renk + ';flex-shrink:0;margin-top:5px;"></span>';
                h += '<div style="flex:1;min-width:0;word-break:break-word;"><b style="font-size:13px;">' + e.title + '</b><br><small style="color:var(--text-light);">' + turAdi + (e.time ? ' &middot; ' + e.time : '') + (e.description ? '<br>' + e.description : '') + '</small></div>';
                if (!isGorev) {
                    var realId = id.replace("gorev_", "");
                    h += '<button class="as-etkinlik-edit" onclick="asEventDuzenle(\'' + realId.replace(/'/g,"\\'") + '\');asGunInfoKapat();" style="background:none;border:none;cursor:pointer;font-size:14px;padding:2px;" title="Düzenle">✏️</button>';
                    h += '<button class="as-etkinlik-edit" onclick="asEventSilById(\'' + realId.replace(/'/g,"\\'") + '\');" style="background:none;border:none;cursor:pointer;font-size:14px;padding:2px;color:var(--accent-red);" title="Sil">🗑</button>';
                }
                h += '</div>';
            });
            document.getElementById("asGunInfoBody").innerHTML = h;
            document.getElementById("asGunInfoModal").style.display = "flex";
        }
        function asEventSilById(id) {
            if (!id) return;
            tmConfirm("Bu etkinliği silmek istediğinize emin misiniz?", function() {
                const aktifUser = localStorage.getItem("tm_active_user") || "";
                let etkinlikler = JSON.parse(localStorage.getItem("tm_as_etkinlikler_" + aktifUser)) || [];
                etkinlikler = etkinlikler.filter(function(e) { return e.id !== id; });
                localStorage.setItem("tm_as_etkinlikler_" + aktifUser, JSON.stringify(etkinlikler));
                asGunInfoKapat();
                asTakvimRender();
                tmNotify("Etkinlik silindi.", "success");
            });
        }
        function asTumEtkinlikleriGoster() {
            const etkinlikler = asGetMergedEvents();
            document.getElementById("asGunInfoTitle").textContent = "📋 TÜM ETKİNLİKLER";
            var h = "";
            etkinlikler.forEach(function(e) {
                const renk = e.type === "reminder" ? "#E67E22" : (e.type === "note" ? "#95A5A6" : (e.type === "gorev" ? asGorevRenk(e.durum, e.tarih) : "#2B6CB0"));
                const turAdi = e.type === "reminder" ? "🔔 ANIMSATICI" : (e.type === "note" ? "📝 NOT" : (e.type === "gorev" ? (e.durum === "tamamlandi" ? "✅ GÖREV (TAMAMLANDI)" : "📋 GÖREV") : "🔵 DİĞER"));
                const isGorev = e.type === "gorev";
                const id = e.id || "";
                h += '<div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border-color);">';
                h += '<span style="width:12px;height:12px;border-radius:50%;background:' + renk + ';flex-shrink:0;margin-top:5px;"></span>';
                h += '<div style="flex:1;min-width:0;word-break:break-word;"><b style="font-size:13px;">' + e.title + '</b><br><small style="color:var(--text-light);"><span style="color:' + renk + ';">●</span> ' + turAdi + ' &middot; ' + e.date + (e.time ? ' ' + e.time : '') + (e.description ? '<br>' + e.description : '') + '</small></div>';
                if (!isGorev) {
                    var realId = id.replace("gorev_", "");
                    h += '<button class="as-etkinlik-edit" onclick="asEventDuzenle(\'' + realId.replace(/'/g,"\\'") + '\');asGunInfoKapat();" style="background:none;border:none;cursor:pointer;font-size:14px;padding:2px;" title="Düzenle">✏️</button>';
                    h += '<button class="as-etkinlik-edit" onclick="asEventSilById(\'' + realId.replace(/'/g,"\\'") + '\');" style="background:none;border:none;cursor:pointer;font-size:14px;padding:2px;color:var(--accent-red);" title="Sil">🗑</button>';
                }
                h += '</div>';
            });
            if (etkinlikler.length === 0) { h = tmEmptyStateHTML('📅','Hiç etkinlik bulunmamaktadır.','Takvimden yeni bir etkinlik ekleyebilirsiniz.'); }
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
            if (form.style.display === "block") { form.style.display = "none"; btn.textContent = "➕ GÖREV ATA"; return; }
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
            btn.textContent = "✕ İPTAL";
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
            document.getElementById("asGorevAtaBtn").textContent = "➕ GÖREV ATA";
            tmNotify("Görev atandı.", "success");
            aktiviteEkle("Görev atandı: " + baslik + " → " + atanan, "Dashboard");
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
            let html = '<div class="as-section-label" style="color:#2e7d32;">📥 BANA ATANAN GÖREVLER</div>';
            if (benimGorevlerim.length === 0) { html += '<div style="padding:8px 0;">'+tmEmptyStateHTML('✅','Size atanmış görev bulunmamaktadır.','','')+'</div>'; }
            else {
                benimGorevlerim.forEach(function(g) {
                    const renk = asGorevRenk(g.durum, g.tarih);
                    const etiket = asGorevDurumEtiketi(g.durum, g.tarih);
                    var atananAd = Array.isArray(g.atanan) ? g.atanan.join(", ") : g.atanan;
                    html += '<div class="as-gorev-item" style="border-left:4px solid ' + renk + ';">';
                    html += '<div class="as-gorev-text"><b>' + etiket + ' ' + g.baslik + '</b>' + (g.mesaj ? ' — ' + g.mesaj : '') + '<br><small>' + g.veren + ' → ' + atananAd + ' | ' + g.tarih + '</small></div>';
                    if (g.durum !== "tamamlandi") { html += '<button class="as-gorev-complete" onclick="asGorevTamamla(\'' + g.id + '\')">✓ TAMAMLA</button>'; }
                    else { html += '<span class="as-gorev-tamamlandi">✓ ' + tamamlanmaStr(g.tamamlanmaTarihi) + '</span>'; }
                    html += '</div>';
                });
            }
            html += '<div class="as-section-label" style="color:var(--accent-red);margin-top:14px;">📤 VERDİĞİM GÖREVLER</div>';
            if (verdigimGorevler.length === 0) { html += '<div style="padding:8px 0;">'+tmEmptyStateHTML('📋','Verdiğiniz görev bulunmamaktadır.','','')+'</div>'; }
            else {
                verdigimGorevler.forEach(function(g) {
                    const renk = asGorevRenk(g.durum, g.tarih);
                    const etiket = asGorevDurumEtiketi(g.durum, g.tarih);
                    var atananAd = Array.isArray(g.atanan) ? g.atanan.join(", ") : g.atanan;
                    html += '<div class="as-gorev-item" style="border-left:4px solid ' + renk + ';">';
                    html += '<div class="as-gorev-text"><b>' + etiket + ' ' + g.baslik + '</b>' + (g.mesaj ? ' — ' + g.mesaj : '') + '<br><small>→ ' + atananAd + ' | ' + g.tarih + ' | <span style="color:' + renk + ';font-weight:700;">' + (g.durum === "tamamlandi" ? "TAMAMLANDI " + tamamlanmaStr(g.tamamlanmaTarihi) : (asGorevRenk(g.durum, g.tarih) === "#C0392B" ? "GECİKMİŞ" : "BEKLİYOR")) + '</span></small></div>';
                    html += '<button class="as-gorev-delete" onclick="asGorevSil(\'' + g.id + '\')">🗑</button>';
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
        function birimEklePrompt() {
            tmPrompt("Yeni birim türü giriniz (örn: M², ADET, KG):", function(yeni) {
                if (!yeni || yeni.trim() === "") return;
                yeni = yeni.trim().toUpperCase();
                var list = birimListesiGetir();
                if (list.indexOf(yeni) !== -1) { tmNotify("Bu birim zaten mevcut!", "error"); return; }
                list.push(yeni);
                localStorage.setItem("tm_birim_listesi_v1", JSON.stringify(list));
                birimListesiniYenile();
                tmNotify("Birim eklendi: " + yeni, "success");
            });
        }
        function birimSilPrompt() {
            var list = birimListesiGetir();
            if (list.length === 0) { tmNotify("Silinecek birim kalmadı.", "error"); return; }
            tmPrompt("Silmek istediğiniz birim adını yazın:\nMevcut: " + list.join(", "), function(sec) {
                if (!sec || sec.trim() === "") return;
                sec = sec.trim().toUpperCase();
                var idx = list.indexOf(sec);
                if (idx === -1) { tmNotify("Bu birim listede bulunamadı.", "error"); return; }
                list.splice(idx, 1);
                localStorage.setItem("tm_birim_listesi_v1", JSON.stringify(list));
                birimListesiniYenile();
                tmNotify("Birim silindi: " + sec, "success");
            });
        }
        function birimDropdownKapat(el){var dd=el.closest('.cs-dropdown');if(dd){dd.classList.remove('open');dd.previousElementSibling.classList.remove('open');}}
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
                icon.innerText = "↑";
            } else {
                TEKLIF_SIRALAMA_YONU = "AZALAN";
                icon.innerText = "↓";
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
            if(db.length === 0) { tbody.innerHTML = '<tr><td colspan="7">'+tmEmptyStateHTML('📄','Henüz kayıtlı teklif bulunmuyor.','Yeni bir teklif oluşturmak için yukarıdaki butonu kullanın.')+'</td></tr>'; return; }

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
                    kalemHTML += `<tr><td>${k.servis}</td><td style='text-align:center;'>${k.miktar}</td><td style='text-align:center;'>${k.birim||''}</td><td style='text-align:right;'>${k.fiyat.toLocaleString('tr-TR')} ₺</td><td style='text-align:center;'>%${k.kdv}</td><td style='text-align:right;'>${toplamKalem.toLocaleString('tr-TR')} ₺</td></tr>`;
                });

                tbody.innerHTML += `
                    <tr class="teklif-row-item teklif-row-header" onclick="teklifDetayiniAcKapat(${t.id})">
                        <td class="search-target-id" style="font-weight:700; color:var(--accent-red);">${formatliId}</td>
                        <td class="search-target-date">${t.sTarih}</td>
                        <td class="search-target-m"><b>${t.musteriAd}</b><br><small class="search-target-f">${t.firma}</small></td>
                        <td class="search-target-j">${t.isAdi}</td>
                        <td class="search-target-h">${t.hazirlayan}</td>
                        <td style="color:var(--accent-red); font-weight:700;">${t.genelTutar}</td>
                        <td>
                            <button class="btn-warning" onclick="event.stopPropagation(); eskiTeklifPdfUretDbId(${t.id})">📄 PDF</button> 
                            <button class="btn-danger" onclick="event.stopPropagation(); teklifSilDbId(${t.id})">Sil</button>
                        </td>
                    </tr>
                    <tr id="detail-row-${t.id}" class="detail-expanded-row">
                        <td colspan="7">
                            <div class="detail-panel-inner">
                                <div class="detail-grid-box">
                                    <div style="font-weight:700; border-bottom:1px solid var(--border-color); padding-bottom:8px; margin-bottom:12px; color:var(--accent-red); font-size:13px;">🔎 TEKLİF İÇERİK DETAYI</div>
                                    <p style="margin:5px 0; font-size:13px;"><b>Müşteri Telefon:</b> ${t.telefon}</p>
                                    <table style="width:100%; border-collapse:collapse; font-size:13px; margin-top:10px;">
                                        <thead>
                                            <tr style="background:var(--bg-main); font-weight:700;">
                                                <th style="padding:8px; text-align:left;">Hizmet Kalemi</th>
                                                <th style="padding:8px; text-align:center;">Miktar</th>
                                                <th style="padding:8px; text-align:center;">Birim</th>
                                                <th style="padding:8px; text-align:right;">Br. Fiyat</th>
                                                <th style="padding:8px; text-align:center;">KDV</th>
                                                <th style="padding:8px; text-align:right;">Toplam</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${kalemHTML}
                                            <tr style="border-top:2px solid var(--border-color); font-weight:600;"><td colspan="5" style="text-align:right; padding:8px;">ARA TOPLAM:</td><td style="text-align:right; padding:8px;">${(t.araTutar || 0).toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</td></tr>
                                            <tr style="font-weight:600;"><td colspan="5" style="text-align:right; padding:8px;">TOPLAM K.D.V:</td><td style="text-align:right; padding:8px;">${(t.kdvTutar || 0).toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</td></tr>
                                            <tr style="font-weight:700; color:var(--accent-red); background:var(--bg-main);"><td colspan="5" style="text-align:right; padding:8px;">GENEL TOPLAM:</td><td style="text-align:right; padding:8px;">${t.genelTutar}</td></tr>
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

                const tOk = tarihYon === "ARTAN" ? "↑" : "↓";
                const fOk = fiyatYon === "ARTAN" ? "↑" : (fiyatYon === "AZALAN" ? "↓" : "↕");

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

            document.getElementById("isMuhFormTitle").innerText = "⚙️ İş Muhasebesi Kaydını Düzenle";
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
            const icon = document.getElementById("isMuhKartIcon_" + id);
            if(content) {
                const yeniDurum = content.style.display === "none" ? "block" : "none";
                content.style.display = yeniDurum;
                if(icon) icon.innerText = yeniDurum === "none" ? "▶" : "▼";
            }
        }

        function isMuhasebeListesiniYenile() {
            const konteyner = document.getElementById("isMuhasebeKartKonteyner");
            if(!konteyner) return;

            const onceExpanded = new Set();
            document.querySelectorAll('.is-muh-card').forEach(card => {
                const content = card.querySelector('[id^="isMuhKartContent_"]');
                if(content && content.style.display !== 'none') {
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
                            <div style="flex:1; padding:0 10px;"><small style="font-size:12px; color:var(--text-light); font-weight:600; display:block; letter-spacing:0.5px;">GENEL ÖDENEN</small><span style="font-weight:900; color:var(--btn-green); font-size:22px;">${genelOdenen.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
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
                konteyner.innerHTML = tmEmptyStateHTML('📊','Henüz iş muhasebesi kaydı bulunmamaktadır.','Önce "İş Muhasebesi Oluştur" sayfasından bir kayıt oluşturun.');
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

                konteyner.innerHTML += `
                    <div class="portfolio-card is-muh-card" data-search="${kayit.isAdi} ${kayit.firma} ${paftaAdaParsel} ${formatliId}" style="width:100%; cursor:pointer;" onclick="isMuhKartToggle(${kayit.id}, event)">
                        <div class="card-main-header">
                            <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <span id="isMuhKartIcon_${kayit.id}" style="font-size:14px; color:var(--accent-red); font-weight:700;">▶</span>
                                    <h4 style="margin:0;">${kayit.isAdi}</h4>
                                </div>
                                <div style="display:flex; align-items:center; gap:15px;">
                                    <span style="font-weight:700; color:var(--accent-red); font-size:14px;">${formatliId}</span>
                                </div>
                            </div>
                            <div style="display:flex; gap:15px; margin-top:4px; font-size:13px;">
                                ${kayit.firma && kayit.firma !== "-" ? '<span style="color:var(--text-light);"><b>Firma:</b> ' + kayit.firma + '</span>' : ''}
                                ${paftaAdaParsel && paftaAdaParsel !== "-" ? '<span style="color:var(--text-light);">' + paftaAdaParsel + '</span>' : ''}
                            </div>
                        </div>
                        <div id="isMuhKartContent_${kayit.id}" style="display:none;">

                        <div style="display:flex; flex-direction:column; gap:3px; background:var(--bg-main); padding:8px 10px; border-radius:8px; margin:5px 0 10px 0; border:1px solid var(--border-color);">
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
                                <span style="font-weight:700; font-size:13px; color:var(--btn-green);">📋 Tahsilatlar</span>
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
                                <span style="font-weight:700; font-size:13px; color:var(--accent-red);">📋 Ödemeler</span>
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
                            <button class="btn btn-pdf-red" onclick="event.stopPropagation(); isMuhasebePdfUret(${kayit.id})">📄 PDF</button>
                            <button class="btn-save-green" onclick="event.stopPropagation(); isMuhasebeBitirVeTasi(${kayit.id})" style="cursor:${(kalanTahsilat !== 0 || kalanToplam !== 0) ? 'not-allowed' : 'pointer'};${(kalanTahsilat !== 0 || kalanToplam !== 0) ? 'opacity:0.5;' : ''}" ${(kalanTahsilat !== 0 || kalanToplam !== 0) ? 'disabled' : ''}>✅ İŞ BİTİRME ONAYI</button>
                            <button class="btn-danger" onclick="event.stopPropagation(); isMuhasebeSil(${kayit.id})">Sil</button>
                        </div>
                        </div>
                    </div>
                `;
            });

            onceExpanded.forEach(id => {
                const content = document.getElementById("isMuhKartContent_" + id);
                const icon = document.getElementById("isMuhKartIcon_" + id);
                if(content) {
                    content.style.display = "block";
                    if(icon) icon.innerText = "▼";
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
            tmConfirm("Bu iş muhasebesini 'Tamamlanan İşler' kategorisine taşımak istediğinize emin misiniz?", function() {
                let db = isMuhasebeVerileriniYukle();
                const kayit = db.find(k => k.id === id);
                if(!kayit) return;

                let tamamlananDb = JSON.parse(localStorage.getItem("tm_is_muhasebe_tamamlanan_db")) || [];
                kayit.bitisTarihi = anlikTarihGetir();
                tamamlananDb.push(kayit);
                localStorage.setItem("tm_is_muhasebe_tamamlanan_db", JSON.stringify(tamamlananDb));

                db = db.filter(k => k.id !== id);
                localStorage.setItem("tm_is_muhasebe_db", JSON.stringify(db));

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
            });
        }

        function tamamlananIsMuhasebeListesiniYenile() {
            const konteyner = document.getElementById("tamamlananIsMuhasebeKonteyner");
            if(!konteyner) return;
            konteyner.innerHTML = "";

            const db = tamamlananIsMuhasebeVerileriniYukle();
            if(db.length === 0) {
                konteyner.innerHTML = tmEmptyStateHTML('✅','Henüz tamamlanan iş muhasebesi bulunmamaktadır.','Tamamlanan iş muhasebesi kayıtları burada görüntülenecek.');
                return;
            }

            db.sort((a, b) => new Date(b.bitisTarihi || b.anlasmaTarihi || b.tarih) - new Date(a.bitisTarihi || a.anlasmaTarihi || a.tarih));

            let toplamHTML = `
                <div style="display:flex; gap:20px; background:var(--bg-main); padding:15px 20px; border-radius:8px; border:1px solid var(--border-color); margin-bottom:20px; justify-content:space-around; font-weight:600;">
                    <div style="text-align:center;"><small style="font-size:10px; color:var(--text-light); font-weight:600; display:block;">TAMAMLANAN İŞ SAYISI</small><span style="font-weight:700; color:var(--accent-red); font-size:18px;">${db.length}</span></div>
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
                            <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <span id="tamIsMuhKartIcon_${kayit.id}" style="font-size:14px; color:var(--accent-red); font-weight:700;">▶</span>
                                    <h4 style="margin:0;">${isAdi}</h4>
                                </div>
                                <div style="display:flex; align-items:center; gap:15px;">
                                    <span style="background:var(--btn-green); color:white; padding:3px 10px; border-radius:12px; font-size:11px; font-weight:700;">TAMAMLANDI</span>
                                    <span style="font-weight:700; color:var(--accent-red); font-size:14px;">${formatliId}</span>
                                </div>
                            </div>
                            <div style="display:flex; gap:15px; margin-top:4px; font-size:13px;">
                                <span style="color:var(--text-light);"><b>Firma:</b> ${firma}</span>
                                <span style="color:var(--text-light);">${paftaAdaParsel}</span>
                            </div>
                        </div>
                        <div id="tamIsMuhKartContent_${kayit.id}" style="display:none;">

                        <div style="display:flex; flex-direction:column; gap:3px; background:var(--bg-main); padding:8px 10px; border-radius:8px; margin:5px 0 10px 0; border:1px solid var(--border-color);">
                            <div style="display:flex; justify-content:space-between; text-align:center; gap:2px;">
                                <div style="flex:1; border-right:1px solid var(--border-color); padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">ANLAŞMA ÜCRETİ</small><span style="font-weight:800; color:var(--accent-red); font-size:15px; line-height:1.3;">${(kayit.anlasmaUcreti || 0).toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                                <div style="flex:1; border-right:1px solid var(--border-color); padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">TOPLAM KAR</small><span style="font-weight:800; color:${karRenk}; font-size:15px; line-height:1.3;">${toplamKar.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                                <div style="flex:1; border-right:1px solid var(--border-color); padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">KAR %</small><span style="font-weight:800; color:${karYuzdeRenkKart}; font-size:15px; line-height:1.3;">%${karYuzde}</span></div>
                                <div style="flex:1; border-right:1px solid var(--border-color); padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">TOPLAM GİDER</small><span style="font-weight:800; color:var(--accent-red); font-size:15px; line-height:1.3;">${toplamVerecek.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                                <div style="flex:1; padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">ANLAŞMA TARİHİ</small><span style="font-weight:700; color:var(--text-dark); font-size:15px; line-height:1.3;">${basTarih ? new Date(basTarih).toLocaleDateString("tr-TR") : "-"}</span></div>
                            </div>
                            <div style="display:flex; justify-content:space-between; text-align:center; gap:2px; padding-top:4px; border-top:1px solid var(--border-color);">
                                <div style="flex:1; border-right:1px solid var(--border-color); padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">TAHSİLAT</small><span style="font-weight:800; color:var(--btn-green); font-size:15px; line-height:1.3;">${toplamAlacak.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                                <div style="flex:1; border-right:1px solid var(--border-color); padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">ÖDENEN</small><span style="font-weight:800; color:var(--btn-green); font-size:15px; line-height:1.3;">${toplamOdenen.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                                <div style="flex:1; border-right:1px solid var(--border-color); padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">KALAN ÖDEME</small><span style="font-weight:800; color:var(--accent-red); font-size:15px; line-height:1.3;">${kalanToplam.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                                <div style="flex:1; padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">NET</small><span style="font-weight:800; color:${netRenk}; font-size:15px; line-height:1.3;">${netDurum.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span></div>
                            </div>
                            <div style="display:flex; justify-content:space-between; text-align:center; gap:2px; padding-top:4px; border-top:1px dashed var(--border-color);">
                                <div style="flex:1; border-right:1px solid var(--border-color); padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">BİTİŞ ONAY TARİHİ</small><span style="font-weight:700; color:var(--btn-green); font-size:15px; line-height:1.3;">${kayit.bitisTarihi ? new Date(kayit.bitisTarihi).toLocaleDateString("tr-TR") : "-"}</span></div>
                                <div style="flex:1; padding:0 4px; display:flex; flex-direction:column; gap:2px; align-items:center;"><small style="font-size:11px; color:var(--text-light); font-weight:600; letter-spacing:0.3px; line-height:1.3;">DURUM</small><span style="font-weight:800; color:var(--btn-green); font-size:15px; line-height:1.3;">✅ TAMAMLANDI</span></div>
                            </div>
                        </div>

                        <div style="margin-top:6px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                <span style="font-weight:700; font-size:13px; color:var(--btn-green);">📋 Tahsilatlar</span>
                            </div>
                            ${(() => {
                                const alacakKalemler = kayit.kalemler.filter(k => k.tip === "alacak");
                                if(alacakKalemler.length === 0) return '<p style="font-size:12px; color:var(--text-light); font-style:italic; padding:8px;">Henüz tahsilat kalemi bulunmuyor.</p>';
                                let tbl = '<table style="width:100%; border-collapse:collapse; font-size:12px;"><thead><tr style="background:var(--bg-main);"><th style="padding:8px 6px; text-align:left; font-size:11px;">Açıklama</th><th style="padding:8px 6px; text-align:right; font-size:11px;">Tutar</th><th style="padding:8px 6px; text-align:left; font-size:11px;">Tarih</th></tr></thead><tbody>';
                                alacakKalemler.forEach(k => {
                                    tbl += '<tr><td style="padding:6px; font-size:12px;">' + (k.aciklama || "-") + '</td><td style="padding:6px; font-size:12px; text-align:right; font-weight:700; color:var(--btn-green);">' + (k.tutar || 0).toLocaleString('tr-TR', {minimumFractionDigits:2}) + ' ₺</td><td style="padding:6px; font-size:11px;">' + (k.tarih ? new Date(k.tarih).toLocaleDateString("tr-TR") : "-") + '</td></tr>';
                                });
                                tbl += '</tbody></table>';
                                return tbl;
                            })()}
                        </div>

                        <div style="margin-top:12px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                <span style="font-weight:700; font-size:13px; color:var(--accent-red);">📋 Ödemeler</span>
                            </div>
                            ${(() => {
                                const verecekKalemler = kayit.kalemler.filter(k => k.tip !== "alacak");
                                if(verecekKalemler.length === 0) return '<p style="font-size:12px; color:var(--text-light); font-style:italic; padding:8px;">Henüz ödeme kalemi bulunmuyor.</p>';
                                let tbl = '<table style="width:100%; border-collapse:collapse; font-size:12px;"><thead><tr style="background:var(--bg-main);"><th style="padding:8px 6px; text-align:left; font-size:11px;">Proje / Hizmet Dalı</th><th style="padding:8px 6px; text-align:left; font-size:11px;">Kişi / Firma</th><th style="padding:8px 6px; text-align:right; font-size:11px;">Toplam</th><th style="padding:8px 6px; text-align:right; font-size:11px;">Ödenen</th><th style="padding:8px 6px; text-align:right; font-size:11px;">Kalan</th></tr></thead><tbody>';
                                verecekKalemler.forEach(k => {
                                    const odenen = k.odenenTutar || 0;
                                    const kalan = k.tutar - odenen;
                                    tbl += '<tr><td style="padding:6px; font-size:12px;">' + (k.dal || k.aciklama || "-") + '</td><td style="padding:6px; font-size:11px; color:var(--text-light);">' + (k.kisi || "-") + '</td><td style="padding:6px; font-size:12px; text-align:right; font-weight:700;">' + (k.tutar || 0).toLocaleString('tr-TR', {minimumFractionDigits:2}) + ' ₺</td><td style="padding:6px; font-size:12px; text-align:right; font-weight:600; color:var(--btn-green);">' + odenen.toLocaleString('tr-TR', {minimumFractionDigits:2}) + ' ₺</td><td style="padding:6px; font-size:12px; text-align:right; font-weight:600; color:var(--accent-red);">' + kalan.toLocaleString('tr-TR', {minimumFractionDigits:2}) + ' ₺</td></tr>';
                                });
                                tbl += '</tbody></table>';
                                return tbl;
                            })()}
                        </div>

                        <div class="card-actions">
                            <button class="btn-warning" onclick="event.stopPropagation(); tamamlananIsMuhasebeGeriAl(${kayit.id})">↩ Geri Al</button>
                            <button class="btn btn-pdf-red" onclick="event.stopPropagation(); isMuhasebePdfUret(${kayit.id})">📄 PDF</button>
                            <button class="btn-danger" onclick="event.stopPropagation(); tamamlananIsMuhasebeSil(${kayit.id})">Sil</button>
                        </div>
                        </div>
                    </div>
                `;
            });

            konteyner.innerHTML = toplamHTML;
        }

        function tamIsMuhKartToggle(id) {
            const content = document.getElementById("tamIsMuhKartContent_" + id);
            const icon = document.getElementById("tamIsMuhKartIcon_" + id);
            if(content) {
                const yeniDurum = content.style.display === "none" ? "block" : "none";
                content.style.display = yeniDurum;
                if(icon) icon.innerText = yeniDurum === "none" ? "▶" : "▼";
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
            const kayit = db.find(k => k.id === id);
            if(!kayit) { tmNotify("Kayıt bulunamadı!", "error"); return; }

            let toplamAlacak = 0, toplamVerecek = 0, toplamOdenen = 0;
            kayit.kalemler.forEach(k => {
                if(k.tip === "alacak") toplamAlacak += k.tutar;
                else { toplamVerecek += k.tutar; toplamOdenen += (k.odenenTutar || 0); }
            });
            const kalanToplam = toplamVerecek - toplamOdenen;
            const netDurum = toplamAlacak - toplamVerecek;
            const p = kayit.pafta && kayit.pafta !== "-" ? kayit.pafta : "";
            const a = kayit.ada && kayit.ada !== "-" ? kayit.ada : "";
            const par = kayit.parsel && kayit.parsel !== "-" ? kayit.parsel : "";
            const paftaAdaParsel = (p ? "Pafta: " + p + ", " : "") + (a ? "Ada: " + a + ", " : "") + (par ? "Parsel: " + par : "") || kayit.parsel || "-";

            let kalemSatirlari = "";
            kayit.kalemler.forEach(k => {
                if(k.tip === "alacak") {
                    kalemSatirlari += '<tr><td style="padding:6px 8px; font-size:11px;">' + (k.aciklama || "TAHSİLAT") + '</td><td style="padding:6px 8px; font-size:11px; text-align:center;">TAHSİLAT</td><td style="padding:6px 8px; font-size:11px; text-align:right;">' + (k.tutar || 0).toLocaleString('tr-TR', {minimumFractionDigits:2}) + ' ₺</td></tr>';
                } else {
                    const odenen = k.odenenTutar || 0;
                    kalemSatirlari += '<tr><td style="padding:6px 8px; font-size:11px;">' + (k.dal || k.aciklama || "ÖDEME") + (k.kisi ? " (" + k.kisi + ")" : "") + '</td><td style="padding:6px 8px; font-size:11px; text-align:center;">ÖDEME</td><td style="padding:6px 8px; font-size:11px; text-align:right;">' + (k.tutar || 0).toLocaleString('tr-TR', {minimumFractionDigits:2}) + ' ₺</td></tr>';
                }
            });

            const formatliId = "#" + String(kayit.id).padStart(4, '0');
            const tarihStr = kayit.anlasmaTarihi ? new Date(kayit.anlasmaTarihi).toLocaleDateString("tr-TR") : "-";

            const pdfContent = `
                <div style="width:210mm; padding:20mm; box-sizing:border-box; font-family:'Segoe UI',Arial,sans-serif; color:#111; text-transform:uppercase;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #111; padding-bottom:15px; margin-bottom:25px;">
                        <div><h1 style="margin:0 0 2px 0;font-size:26px;font-weight:900;letter-spacing:4px;color:#111;line-height:1.1;">TURAK MİMARLIK</h1><p style="margin:3px 0 0 0; font-size:9px; color:#9E2A2B; font-weight:700;">İŞ MUHASEBESİ RAPORU</p></div>
                        <div style="text-align:right; font-size:14px; font-weight:800; color:#9E2A2B;">${formatliId}</div>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:25px;">
                        <div style="border-left:3px solid #111; padding-left:12px; width:55%;">
                            <p style="font-size:11px; font-weight:800; color:#777; letter-spacing:1px;">PROJE & İŞ BİLGİLERİ</p>
                            <p style="margin:4px 0;"><b>İŞ ADI:</b> ${kayit.isAdi}</p>
                            <p style="margin:4px 0;"><b>FİRMA/MÜŞTERİ:</b> ${kayit.firma}</p>
                            <p style="margin:4px 0;"><b>PAFTA/ADA/PARSEL:</b> ${paftaAdaParsel}</p>
                            <p style="margin:4px 0;"><b>ANLAŞMA TARİHİ:</b> ${tarihStr}</p>
                        </div>
                        <div style="text-align:right; width:40%; font-size:12px;">
                            <p><b>ANLAŞMA ÜCRETİ:</b> ${(kayit.anlasmaUcreti || 0).toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</p>
                            <p style="color:#2E7D32;"><b>TAHSİLAT:</b> ${toplamAlacak.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</p>
                            <p style="color:#9E2A2B;"><b>TOPLAM GİDER:</b> ${toplamVerecek.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</p>
                            <p style="color:#2E7D32;"><b>ÖDENEN:</b> ${toplamOdenen.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</p>
                        </div>
                    </div>
                    <table style="width:100%; border-collapse:collapse; margin-top:15px;">
                        <thead>
                            <tr style="border-bottom:2px solid #111;">
                                <th style="padding:8px; text-align:left; font-size:11px; letter-spacing:1px;">KALEM AÇIKLAMASI</th>
                                <th style="padding:8px; text-align:center; font-size:11px; letter-spacing:1px;">TİP</th>
                                <th style="padding:8px; text-align:right; font-size:11px; letter-spacing:1px;">TUTAR</th>
                            </tr>
                        </thead>
                        <tbody>${kalemSatirlari}</tbody>
                    </table>
                    <div style="display:flex; justify-content:flex-end; margin-top:25px; padding-top:15px; border-top:2px solid #111;">
                        <table style="width:50%; border-collapse:collapse;">
                            <tr><td style="padding:8px; font-size:12px;"><b>KALAN ÖDEME:</b></td><td style="padding:8px; font-size:12px; text-align:right; color:#9E2A2B; font-weight:700;">${kalanToplam.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</td></tr>
                            <tr><td style="padding:8px; font-size:12px;"><b>NET DURUM:</b></td><td style="padding:8px; font-size:12px; text-align:right; font-weight:700; color:${netDurum >= 0 ? '#2E7D32' : '#9E2A2B'};">${netDurum.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</td></tr>
                        </table>
                    </div>
                    <div style="margin-top:50px; font-size:10px; border-top:1px solid #111; padding-top:15px; display:flex; justify-content:space-between;">
                        <div>KIRKLARELİ / DEMİRKÖY / İĞNEADA</div>
                        <div style="font-weight:700;">TURAK ARCHITECTURE</div>
                    </div>
                </div>
            `;

            try {
                const pdfWindow = window.open('', '_blank');
                if (!pdfWindow) { tmNotify("Pop-up engelleyici PDF açılmasını engelledi!", "error"); return; }
                pdfWindow.document.write(pdfContent);
                pdfWindow.document.close();
                setTimeout(function() { try { pdfWindow.print(); } catch(e) { console.error("PDF yazdirma hatasi:", e); } }, 500);
            } catch(e) { console.error("Is muhasebe PDF hatasi:", e); tmNotify("PDF oluşturulurken hata: " + e.message, "error"); }
        }

        /* ================= NAKİT ÖDEMEK DEKONTU MOTORU ================= */
        function nakitDekontVerileriniYukle() {
            try { return JSON.parse(localStorage.getItem("tm_nakit_dekont_db")) || []; } catch(e) { console.error("Nakit dekont veri yukleme hatasi:", e); return []; }
        }

        function tutarYaziyla(tutar) {
            if (tutar === 0) return "SIFIR TL";
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
            result += "TL";
            if (kurus > 0) {
                result += " " + ucBasamakOku(kurus) + "KURUŞ";
            }
            return result;
        }

        function nakitDekontPdfOlustur(d) {
            const formatliId = String(d.id).padStart(5, '0');
            const formatliTutar = d.tutar.toLocaleString('tr-TR', {minimumFractionDigits:2, maximumFractionDigits:2}) + " TL";
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
                                    <th style="padding:2mm 4mm;text-align:right;font-size:8px;letter-spacing:1px;width:35%;">TUTAR (TL)</th>
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
                konteyner.innerHTML = tmEmptyStateHTML('💵','Henüz nakit ödeme dekontu bulunmamaktadır.','Yeni bir nakit ödeme dekontu oluşturmak için formu doldurun.');
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

            const sortIcon = (kolon) => ND_SIRALA.kolon === kolon ? (ND_SIRALA.yon === 'azalan' ? '↓' : '↑') : '↕';

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
                            <button class="btn-warning" onclick="nakitDekontPdfUretById(${d.id})" style="font-size:11px; padding:4px 8px;">📄 PDF</button>
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
                    (gelir>0 ? '<div class="mc-gelir">+'+gelir.toLocaleString('tr-TR',{minFractionDigits:0})+' ₺</div>' : '')+
                    (gider>0 ? '<div class="mc-gider">-'+gider.toLocaleString('tr-TR',{minFractionDigits:0})+' ₺</div>' : '')+
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
                '<h3>📂 '+yil+' Yılı Bütçe Raporu</h3>'+
                '<button class="btn btn-primary" onclick="ybCariYilaDon()" style="padding:8px 18px;font-size:12px;">🔙 Cari Yıla Dön</button></div>';

            h += '<div class="yb-graph-grid"><div class="yb-graph-box full"><canvas id="ybChartNetDurum"></canvas></div>'+
                '<div class="yb-graph-box"><canvas id="ybChartGelirDagilim"></canvas></div>'+
                '<div class="yb-graph-box"><canvas id="ybChartGiderDagilim"></canvas></div>'+
                '<div class="yb-graph-box full"><canvas id="ybChartAylikKarsilastirma"></canvas></div></div>';

            h += '<div class="yb-ozet-row">'+
                '<div class="yb-ozet-card"><span class="oz-label">Başlangıç Bakiyesi</span><span class="oz-val" style="color:var(--yb-text);">'+(kayit.baslangicBakiye||0).toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</span></div>'+
                '<div class="yb-ozet-card"><span class="oz-label">Toplam Gelir</span><span class="oz-val green">'+toplamGelir.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</span></div>'+
                '<div class="yb-ozet-card"><span class="oz-label">Toplam Gider</span><span class="oz-val red">'+toplamGider.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</span></div>'+
                '<div class="yb-ozet-card"><span class="oz-label">Net Bakiye</span><span class="oz-val '+(bakiye>=0?'gold':'red')+'">'+bakiye.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</span></div></div>';

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
                        '<button class="t-goruntule" onclick="ybGecmisYilGoster('+y.yil+')">📂 Görüntüle</button>'+
                        '<button class="t-pdf" onclick="ybPdfIndir('+y.yil+')">📄 PDF</button></td>'+
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

            let h = '<h3 style="border:none;padding:0;margin:0 0 16px 0;">📅 '+YB_AY_ADI[ayIdx]+' - Bütçe Detayı</h3>';

            // 3 separate summary cards
            h += '<div class="yb-sum-row">'+
                '<div class="yb-sum-card sc-gelir"><div class="sc-label">Aylık Gelir</div><div class="sc-value">'+aylikGelir.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</div></div>'+
                '<div class="yb-sum-card sc-gider"><div class="sc-label">Aylık Gider</div><div class="sc-value">'+aylikGider.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</div></div>'+
                '<div class="yb-sum-card sc-fark"><div class="sc-label">Fark</div><div class="sc-value">'+fark.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</div></div></div>';

            // Gelir accordion
            h += '<div class="yb-acc-section"><h4 class="acc-gelir">📈 Gelirler</h4>';
            kayit.gelirKategorileri.forEach(function(ktg){
                const items = ay.gelirler[ktg]||[];
                const ara = items.reduce(function(s,i){return s+(i.tutar||0);},0);
                const itemId = "accG_"+ktg.replace(/[^a-z0-9]/gi,'_')+"_"+ayIdx;
                h += '<div class="yb-acc-item">'+
                    '<div class="yb-acc-header" onclick="document.getElementById(\''+itemId+'\').classList.toggle(\'open\');this.classList.toggle(\'open\');">'+
                    '<span class="acc-kat">'+ybTrUpper(ktg)+'</span>'+
                    '<span class="acc-tutar">'+ara.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</span>'+
                    '<span class="acc-ok">▼</span></div>'+
                    '<div class="yb-acc-body" id="'+itemId+'">';
                if(items.length>0) {
                    h += '<table><tbody>';
                    items.forEach(function(k){
                        h += '<tr data-id="'+k.id+'">'+
                            '<td style="width:45%;"><input class="acc-input" type="text" value="'+k.aciklama+'" onchange="ybKalemGuncelle('+k.id+',\'aciklama\',this.value)" placeholder="Açıklama"></td>'+
                            '<td style="width:40%;"><div class="acc-tutar-wrap">'+
                                '<input class="acc-tutar-input" type="text" value="'+(k.tutar||0).toLocaleString('tr-TR',{minFractionDigits:2})+'" onfocus="tmTutarFocus(this)" oninput="tmTutarFormatla(this)" onblur="tmTutarBlur(this);ybKalemGuncelle('+k.id+',\'tutar\',this.value)">'+
                                ' <span class="acc-tl-simge">₺</span></div></td>'+
                            '<td style="width:15%;"><button class="acc-btn-sil" onclick="ybKalemSil('+k.id+','+ayIdx+')" title="Sil">✕</button></td>'+
                        '</tr>';
                    });
                    h += '</tbody></table>';
                }
                h += '<button class="acc-btn-ekle" onclick="ybModalKalemAc(\'gelir\',\''+ktg+'\','+ayIdx+')">➕ Kalem Ekle</button>'+
                    '</div></div>';
            });
            h += '<button class="acc-btn-yonet" onclick="ybKategoriYonet(\'gelir\')">📂 Kategorileri Yönet</button></div>';

            // Gider accordion
            h += '<div class="yb-acc-section"><h4 class="acc-gider">📉 Giderler</h4>';
            kayit.giderKategorileri.forEach(function(ktg){
                const items = ay.giderler[ktg]||[];
                const ara = items.reduce(function(s,i){return s+(i.tutar||0);},0);
                const itemId = "accD_"+ktg.replace(/[^a-z0-9]/gi,'_')+"_"+ayIdx;
                h += '<div class="yb-acc-item">'+
                    '<div class="yb-acc-header" onclick="document.getElementById(\''+itemId+'\').classList.toggle(\'open\');this.classList.toggle(\'open\');">'+
                    '<span class="acc-kat">'+ybTrUpper(ktg)+'</span>'+
                    '<span class="acc-tutar">'+ara.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</span>'+
                    '<span class="acc-ok">▼</span></div>'+
                    '<div class="yb-acc-body" id="'+itemId+'">';
                if(items.length>0) {
                    h += '<table><tbody>';
                    items.forEach(function(k){
                        h += '<tr data-id="'+k.id+'">'+
                            '<td style="width:45%;"><input class="acc-input" type="text" value="'+k.aciklama+'" onchange="ybKalemGuncelle('+k.id+',\'aciklama\',this.value)" placeholder="Açıklama"></td>'+
                            '<td style="width:40%;"><div class="acc-tutar-wrap">'+
                                '<input class="acc-tutar-input" type="text" value="'+(k.tutar||0).toLocaleString('tr-TR',{minFractionDigits:2})+'" onfocus="tmTutarFocus(this)" oninput="tmTutarFormatla(this)" onblur="tmTutarBlur(this);ybKalemGuncelle('+k.id+',\'tutar\',this.value)">'+
                                ' <span class="acc-tl-simge">₺</span></div></td>'+
                            '<td style="width:15%;"><button class="acc-btn-sil" onclick="ybKalemSil('+k.id+','+ayIdx+')" title="Sil">✕</button></td>'+
                        '</tr>';
                    });
                    h += '</tbody></table>';
                }
                h += '<button class="acc-btn-ekle" onclick="ybModalKalemAc(\'gider\',\''+ktg+'\','+ayIdx+')">➕ Kalem Ekle</button>'+
                    '</div></div>';
            });
            h += '<button class="acc-btn-yonet" onclick="ybKategoriYonet(\'gider\')">📂 Kategorileri Yönet</button></div>';

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

            let h = '<h3 style="border:none;padding:0;margin:0 0 16px 0;">📋 Yıllık Bütçe Raporu - '+yil+'</h3>';

            h += '<div class="yb-graph-grid">'+
                '<div class="yb-graph-box full"><canvas id="ybChartNetDurum"></canvas></div>'+
                '<div class="yb-graph-box"><canvas id="ybChartGelirDagilim"></canvas></div>'+
                '<div class="yb-graph-box"><canvas id="ybChartGiderDagilim"></canvas></div>'+
                '<div class="yb-graph-box full"><canvas id="ybChartAylikKarsilastirma"></canvas></div></div>';

            h += '<div class="yb-ozet-row">'+
                '<div class="yb-ozet-card"><span class="oz-label">Başlangıç Bakiyesi</span><span class="oz-val" style="color:var(--yb-text);">'+(kayit.baslangicBakiye||0).toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</span></div>'+
                '<div class="yb-ozet-card"><span class="oz-label">Toplam Gelir</span><span class="oz-val green">'+toplamGelir.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</span></div>'+
                '<div class="yb-ozet-card"><span class="oz-label">Toplam Gider</span><span class="oz-val red">'+toplamGider.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</span></div>'+
                '<div class="yb-ozet-card"><span class="oz-label">Şirket Bakiyesi</span><span class="oz-val '+(bakiye>=0?'gold':'red')+'">'+bakiye.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</span></div></div>';

            h += '<h4 style="color:var(--yb-gelir);margin:0 0 6px 0;">📈 Gelir Dağılımı</h4>'+
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

            h += '<h4 style="color:var(--yb-gider);margin:0 0 6px 0;">📉 Gider Dağılımı</h4>'+
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

            let h = '<h3 style="border:none;padding:0;margin:0 0 16px 0;">🔁 Yıl Karşılaştırması</h3>';

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
                '<div class="yb-kars-card"><span class="kc-label">'+cariYil+' Gelir</span><span class="kc-value green">'+cTopG.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</span></div>'+
                '<div class="yb-kars-card"><span class="kc-label">'+seciliYil+' Gelir</span><span class="kc-value green">'+sTopG.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</span></div>'+
                '<div class="yb-kars-card"><span class="kc-label">Fark ('+cariYil+' - '+seciliYil+')</span><span class="kc-value '+(cTopG-sTopG>=0?'green':'red')+'">'+(cTopG-sTopG).toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</span></div>'+
                '</div>';

            h += '<div class="yb-kars-grid">'+
                '<div class="yb-kars-card"><span class="kc-label">'+cariYil+' Gider</span><span class="kc-value red">'+cTopGi.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</span></div>'+
                '<div class="yb-kars-card"><span class="kc-label">'+seciliYil+' Gider</span><span class="kc-value red">'+sTopGi.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</span></div>'+
                '<div class="yb-kars-card"><span class="kc-label">Fark ('+cariYil+' - '+seciliYil+')</span><span class="kc-value '+(cTopGi-sTopGi>=0?'red':'green')+'">'+(cTopGi-sTopGi).toLocaleString('tr-TR',{minFractionDigits:2})+' ₺</span></div>'+
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
                    ' <span class="acc-tl-simge">₺</span></div></td>'+
                '<td style="width:15%;"><button class="acc-btn-sil" onclick="ybKalemSil('+item.id+','+ayIdx+')" title="Sil">✕</button></td>'+
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
            if(hdr) hdr.querySelector('.acc-tutar').textContent = total.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺';
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
                sumCards[0].textContent = aylikGelir.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺';
                sumCards[1].textContent = aylikGider.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺';
                var fark = aylikGelir - aylikGider;
                sumCards[2].textContent = fark.toLocaleString('tr-TR',{minFractionDigits:2})+' ₺';
            }
        }
        function ybDomAyKartGuncelle(ayIdx) {
            var card = document.querySelector('.yb-month-card[data-ay="'+ayIdx+'"]');
            if(!card) return;
            var kayit = ybYilVerisi();
            var gelir = ybAylikToplam(kayit,"gelir",ayIdx);
            var gider = ybAylikToplam(kayit,"gider",ayIdx);
            card.querySelectorAll('.mc-gelir, .mc-gider, .mc-bos').forEach(function(el){el.remove();});
            if(gelir > 0) card.insertAdjacentHTML('beforeend', '<div class="mc-gelir">+'+gelir.toLocaleString('tr-TR',{minFractionDigits:0})+' ₺</div>');
            if(gider > 0) card.insertAdjacentHTML('beforeend', '<div class="mc-gider">-'+gider.toLocaleString('tr-TR',{minFractionDigits:0})+' ₺</div>');
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
                    <button class="btn btn-sm ${aktifTip==='gelir'?'btn-save-green':'btn-clear-gray'}" onclick="ybKategoriYonet('gelir')" style="flex:1;">📈 Gelir Kategorileri</button>
                    <button class="btn btn-sm ${aktifTip==='gider'?'btn-save-green':'btn-clear-gray'}" onclick="ybKategoriYonet('gider')" style="flex:1;">📉 Gider Kategorileri</button>
                </div>`;

                const list = aktifTip === "gelir" ? kayit.gelirKategorileri : kayit.giderKategorileri;
                const etiket = aktifTip === "gelir" ? "gelir" : "gider";

                if(list.length===0) h += `<p style="color:var(--text-light);text-align:center;">Henüz kategori eklenmemiş.</p>`;
                list.forEach((ktg, idx) => {
                    h += `<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;margin-bottom:6px;background:var(--bg-main);border-radius:6px;border:1px solid var(--border-color);">
                        <span style="flex:1;font-weight:600;font-size:13px;">${ktg}</span>
                        <input type="text" id="ybKatYenidenAd_${aktifTip}_${idx}" value="${ktg}" style="display:none;flex:1;padding:6px 10px;border:1px solid var(--accent-red);border-radius:4px;background:var(--input-bg);color:var(--text-dark);font-size:13px;">
                        <button class="btn btn-sm btn-warning" onclick="document.getElementById('ybKatYenidenAd_${aktifTip}_${idx}').style.display='block';this.style.display='none';document.getElementById('ybKatKaydet_${aktifTip}_${idx}').style.display='inline-flex'" style="padding:4px 10px;">✏️</button>
                        <button class="btn btn-sm btn-save-green" id="ybKatKaydet_${aktifTip}_${idx}" style="display:none;padding:4px 10px;" onclick="var inp=document.getElementById('ybKatYenidenAd_${aktifTip}_${idx}');var yeni=trToUpper(inp.value.trim());if(!yeni){tmNotify('Ad boş olamaz!','error');return;}const k=ybYilVerisi();const l=${aktifTip==='gelir'?'k.gelirKategorileri':'k.giderKategorileri'};if(l.includes(yeni)){tmNotify('Bu kategori zaten var!','error');return;}l[l.indexOf('${ktg}')]=yeni;ybVeriKaydet(Object.assign(ybVeriYukle(),{yillar:{[Object.assign(ybVeriYukle()).aktifYil]:k}}));tmNotify('Kategori adı güncellendi.','success');ybKategoriYonet('${aktifTip}');">💾</button>
                        <button class="btn btn-sm btn-danger" onclick="tmConfirm('${ktg} kategorisini silmek istediğinize emin misiniz?\\nBu kategoriye ait tüm kalemler de silinecek.',function(){const k=ybYilVerisi();const l=${aktifTip==='gelir'?'k.gelirKategorileri':'k.giderKategorileri'};const idx=l.indexOf('${ktg}');if(idx>-1){l.splice(idx,1);Object.values(k.aylar).forEach(function(ay){delete (${aktifTip==='gelir'?'ay.gelirler':'ay.giderler'})['${ktg}'];});}const db2=ybVeriYukle();db2.yillar[db2.aktifYil]=k;ybVeriKaydet(db2);tmNotify('Kategori silindi.','success');ybKategoriYonet('${aktifTip}');});" style="padding:4px 10px;">🗑</button>
                    </div>`;
                });

                // Add new
                h += `<div style="margin-top:12px;padding:12px;background:var(--bg-main);border-radius:6px;border:1px dashed var(--border-color);">
                    <label style="font-size:10px;font-weight:600;color:var(--text-light);display:block;margin-bottom:4px;">Yeni ${etiket} Kategorisi Ekle</label>
                    <div style="display:flex;gap:8px;">
                        <input type="text" id="ybKatEkleInput_${aktifTip}" placeholder="Kategori adı" style="flex:1;padding:8px 12px;border:1px solid var(--border-color);border-radius:4px;background:var(--input-bg);color:var(--text-dark);font-size:13px;" onkeydown="if(event.key==='Enter')ybKatEkle('${aktifTip}')">
                        <button class="btn btn-primary" onclick="ybKatEkle('${aktifTip}')" style="padding:8px 16px;border-radius:4px;">➕ Ekle</button>
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
                            scales:{ y:{ beginAtZero:true, ticks:{callback:function(v){return v.toLocaleString('tr-TR',{minFractionDigits:0})+' TL';},font:{size:18}} }, x:{ticks:{font:{size:18}}} }
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
                            scales:{ y:{ beginAtZero:true, ticks:{callback:function(v){return v.toLocaleString('tr-TR',{minFractionDigits:0})+' TL';},font:{size:18}} }, x:{ticks:{font:{size:18}}} }
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
                                        var amt=d.v.toLocaleString('tr-TR',{minFractionDigits:0})+' TL';
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
                        doc.text((v.v||0).toLocaleString('tr-TR',{minFractionDigits:2})+' TL', kx+5, y+19);
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
                            doc.text(vd[i].toLocaleString('tr-TR',{minFractionDigits:0})+' TL',x+56,yl+1.5);
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
                            doc.text(oItems[oi].v.toLocaleString('tr-TR',{minFractionDigits:2})+' TL', oiX+5, y+14);
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
                            e[1].forEach(function(x) { gRows.push([t(e[0].toUpperCase()), t(x.aciklama||''), (Number(x.tutar)||0).toLocaleString('tr-TR',{minFractionDigits:2})+' TL']); });
                        });
                        _ct("GELIRLER", gRows, POZITIF, [245,252,245]);

                        // --- GIDER TABLOSU ---
                        var gdRows = [];
                        Object.entries(ayd.giderler||{}).forEach(function(e) {
                            e[1].forEach(function(x) { gdRows.push([t(e[0].toUpperCase()), t(x.aciklama||''), (Number(x.tutar)||0).toLocaleString('tr-TR',{minFractionDigits:2})+' TL']); });
                        });
                        _ct("GIDERLER", gdRows, NEGATIF, [252,245,245]);

                        // --- Ay Net Bilgisi (sol renk cubugu) ---
                        if(y > 277) { doc.addPage(); sayfaSayisi++; y = 18; }
                        var farkRenk = fark>=0 ? POZITIF : NEGATIF;
                        doc.setFillColor(farkRenk[0], farkRenk[1], farkRenk[2]);
                        doc.rect(M, y, 3, 10, 'F');
                        doc.setFont(FN, "bold"); doc.setFontSize(10);
                        doc.setTextColor(farkRenk[0], farkRenk[1], farkRenk[2]);
                        doc.text(t("AYLIK NET: ")+fark.toLocaleString('tr-TR',{minFractionDigits:2})+' TL', M+8, y+7);
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
        const HT_ORNEK_ISLEMLER = [];
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
            if(a.indexOf("AKBANK") !== -1) return "#D32F2F";
            if(a.indexOf("GARANTI") !== -1) return "#00695C";
            if(a.indexOf("YAPI") !== -1 || a.indexOf("YKB") !== -1) return "#003399";
            if(a.indexOf("VAKIF") !== -1) return "#005BAA";
            if(a.indexOf("HALK") !== -1) return "#003399";
            if(a.indexOf("DENIZ") !== -1) return "#00AEEF";
            if(a.indexOf("QNB") !== -1 || a.indexOf("FINANS") !== -1) return "#8F1B1B";
            if(a.indexOf("TEB") !== -1) return "#003B7B";
            if(a.indexOf("ING") !== -1) return "#FF6600";
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
            db = { hesaplar:JSON.parse(JSON.stringify(HT_ORNEK_HESAPLAR)), nakit:0, islemler:JSON.parse(JSON.stringify(HT_ORNEK_ISLEMLER)) };
            origSetItem("tm_hesap_takip_db", JSON.stringify(db));
            return db;
        }

        function htVeriKaydet(db) { try { localStorage.setItem("tm_hesap_takip_db", JSON.stringify(db)); } catch(e) { console.error("Hesap takip kaydetme hatasi:", e); } }

        function htSayfayiYukle() {
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
                    h += '<div class="kart-top"><div class="kart-banka">'+hs.bankaAdi+'</div><div class="kart-actions">';
                    h += '<button class="kart-duzenle" onclick="event.stopPropagation();htHesapModalAc('+hs.id+')" title="Düzenle">✎</button>';
                    h += '<button class="kart-sil" onclick="event.stopPropagation();htHesapSil('+hs.id+')" title="Sil">✕</button>';
                    h += '</div></div>';
                    h += '<div class="kart-bakiye '+bakiyeTipi+'">'+htTl(hs.bakiye)+'</div>';
                    h += '<div class="kart-iban">'+ibanStr+'</div>';
                    h += '<div class="kart-alt"><div class="kart-alt-sol"><div class="kart-sahip">'+hs.hesapSahibi+'</div></div>';
                    h += '<div class="kart-alt-sag"><div class="kart-sifreler"><span>KART: '+kartSifre+'</span><span>NET: '+netSifre+'</span></div></div></div>';
                    h += '</div>';
                    h += '<div class="kart-chip"></div>';
                    h += '<div class="kart-logo">TM</div>';
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
            h += '<div class="kart-chip"></div><div class="kart-logo">NAKİT</div>';
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
            tmConfirm("Bu hesabı silmek istediğinize emin misiniz?", function() {
                var db = htVeriYukle();
                var silinen = db.hesaplar.find(function(h){return h.id===id;});
                db.hesaplar = db.hesaplar.filter(function(h){return h.id!==id;});
                db.islemler = db.islemler.filter(function(i){return i.hesapId!==id;});
                htVeriKaydet(db);
                htHesapKartlariGoster();
                htNakitKartGoster();
                htYeniIslemFormuDoldur();
                htIslemleriGoster();
                htDurumGuncelle();
                if(HT_AKTIF_DETAY_HESAP === id) htHesapDetayKapat();
                tmNotify("Hesap silindi.", "success");
                aktiviteEkle("Hesap silindi: " + (silinen ? silinen.bankaAdi : ""), "Muhasebe");
            });
        }

        function htNakitKartGoster() {
            htHesapKartlariGoster();
        }

        function htHesapDetayGoster(hesapId) {
            HT_AKTIF_DETAY_HESAP = hesapId;
            var db = htVeriYukle();
            document.getElementById("htAnaSayfa").style.display = "none";
            var baslik = "", detayBilgi = "";
            if(hesapId === -1) {
                baslik = "💵 Nakit Hesabı";
                detayBilgi = "Fiziki Nakit Para — " + htTl(db.nakit);
            } else {
                var hs = db.hesaplar.find(function(h){return h.id===hesapId;});
                if(!hs) { tmNotify("Hesap bulunamadı!", "error"); return; }
                baslik = "🏦 " + hs.bankaAdi + " - " + hs.hesapSahibi + " (Bakiye: " + htTl(hs.bakiye) + ")";
                detayBilgi = "IBAN: " + htIbanGoster(hs.iban) + " &nbsp;|&nbsp; Kart Şifre: " + hs.kartSifre + " &nbsp;|&nbsp; İnternet Şifre: " + hs.internetSifre;
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
            if(!konteyner) return;
            var db = htVeriYukle();
            var islemler = db.islemler.filter(function(i){
                if(HT_AKTIF_DETAY_HESAP === -1) return i.hesapId === -1 || i.hedefId === -1;
                return i.hesapId === HT_AKTIF_DETAY_HESAP || i.hedefId === HT_AKTIF_DETAY_HESAP;
            });
            if(islemler.length === 0) {
                konteyner.innerHTML = "<p style='color:var(--text-light); padding:15px;'>Bu hesaba ait işlem bulunamadı.</p>";
                return;
            }
            function hesapAdiBul(id) {
                if(id === -1) return "💵 NAKİT";
                if(id === 0) return "🌐 HARİCİ";
                var h = db.hesaplar.find(function(hs){return hs.id===id;});
                return h ? h.bankaAdi+" - "+h.hesapSahibi : ("ID:"+id);
            }
            var h = '<div class="ht-islem-kart-list">';
            islemler.slice().reverse().forEach(function(i) {
                var gorunenIslem = i.islem;
                var gorunenYon = hesapAdiBul(i.hesapId) + " → " + (i.hedefId ? hesapAdiBul(i.hedefId) : "🌐 HARİCİ");
                var ikon = "📤";
                if(i.islem === "GELEN") {
                    gorunenYon = "🌐 HARİCİ → " + hesapAdiBul(i.hesapId);
                    ikon = "📥";
                } else if(i.islem === "GİDEN") {
                    if(i.hedefId && i.hesapId !== HT_AKTIF_DETAY_HESAP) {
                        gorunenIslem = "GELEN";
                        ikon = "📥";
                    }
                } else if(i.islem === "TRANSFER") {
                    if(i.hesapId === HT_AKTIF_DETAY_HESAP) {
                        gorunenIslem = "GİDEN";
                        ikon = "📤";
                    } else {
                        gorunenIslem = "GELEN";
                        ikon = "📥";
                    }
                }
                var cls = gorunenIslem === "GELEN" ? "gelen" : "giden";
                h += '<div class="ht-islem-kart" data-detay-search="'+(i.aciklama||"").toLowerCase()+' '+gorunenYon.toLowerCase()+'">';
                h += '<div class="ht-islem-kart-ust">';
                h += '<span class="ht-islem-kart-aciklama">'+i.aciklama+'</span>';
                h += '<span class="ht-islem-kart-tutar '+cls+'">'+htTl(i.tutar)+'</span>';
                h += '</div>';
                h += '<div class="ht-islem-kart-alt">';
                h += '<span class="ht-islem-kart-hesap">'+ikon+' '+gorunenYon+'</span>';
                h += '<span class="ht-islem-kart-tarih">'+(i.tarih?new Date(i.tarih).toLocaleDateString("tr-TR"):"-")+'</span>';
                h += '<span class="ht-islem-kart-islem '+cls+'">'+gorunenIslem+'</span>';
                h += '</div></div>';
            });
            h += '</div>';
            konteyner.innerHTML = h;
        }

        function htDetayIslemFiltrele() {
            var kelime = document.getElementById("htDetayArama").value.toLowerCase().trim();
            var list = document.getElementById("htDetayIslemler");
            if(!list) return;
            list.querySelectorAll(".ht-islem-kart").forEach(function(k) {
                k.style.display = (k.getAttribute("data-detay-search")||"").includes(kelime) ? "" : "none";
            });
        }

        function htYeniIslemFormuDoldur() {
            var opts = '<option value="0">🌐 HARİCİ</option><option value="-1">💵 NAKİT</option>';
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
            document.getElementById("htModalIslemTur").value = islem ? islem.islem : "GELEN";
            var selectNereden = document.getElementById("htModalNereden");
            var selectNereye = document.getElementById("htModalNereye");
            var opts = '<option value="0">🌐 HARİCİ</option><option value="-1">💵 NAKİT</option>';
            db.hesaplar.forEach(function(h) {
                opts += '<option value="'+h.id+'">'+h.bankaAdi+' - '+h.hesapSahibi+'</option>';
            });
            selectNereden.innerHTML = opts;
            selectNereye.innerHTML = opts;
            if(islem) {
                selectNereden.value = islem.hesapId;
                selectNereye.value = islem.hedefId || "0";
            } else {
                selectNereden.value = (hesapId || "0");
                selectNereye.value = "0";
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
                document.getElementById("htModalNereden").value = "0";
                neredenDiv.style.display = "none";
                nereyeDiv.style.display = "";
            } else if(tur === "GİDEN") {
                document.getElementById("htModalNereye").value = "0";
                neredenDiv.style.display = "";
                nereyeDiv.style.display = "none";
            } else {
                neredenDiv.style.display = "";
                nereyeDiv.style.display = "";
            }
        }

        function htIslemTersineCevir(db, islem) {
            if(islem.islem === "TRANSFER" || (islem.islem === "GİDEN" && islem.hedefId)) {
                htBakiyeGuncelle(db, islem.hesapId, islem.tutar, "GİDEN", true);
                if(islem.hedefId && (islem.hedefId === 1 || islem.hedefId === -1)) htBakiyeGuncelle(db, islem.hedefId, islem.tutar, "GELEN", true);
            } else {
                htBakiyeGuncelle(db, islem.hesapId, islem.tutar, islem.islem, true);
            }
        }

        function htIslemModalKaydet() {
            var id = document.getElementById("htModalIslemId").value;
            var aciklama = document.getElementById("htModalIslemAciklama").value.trim();
            if(!aciklama) { tmNotify("Açıklama zorunludur!", "error"); return; }
            var tur = document.getElementById("htModalIslemTur").value;
            var fromId = parseInt(document.getElementById("htModalNereden").value);
            var toId = parseInt(document.getElementById("htModalNereye").value);
            if(tur === "TRANSFER") {
                if(fromId === toId || fromId === 0 || toId === 0) { tmNotify("Transfer için geçerli iki hesap seçin!", "error"); return; }
            } else if(tur === "GELEN") {
                if(toId === 0) { tmNotify("GELEN işleminde alıcı hesap seçilmelidir!", "error"); return; }
            } else {
                if(fromId === 0) { tmNotify("GİDEN işleminde gönderen hesap seçilmelidir!", "error"); return; }
            }
            var tarih = document.getElementById("htModalTarih").value;
            var tutar = tmTutarCoz(document.getElementById("htModalTutar").value);
            if(tutar <= 0) { tmNotify("Geçerli bir tutar giriniz!", "error"); return; }
            var db = htVeriYukle();
            if(id) {
                id = parseInt(id);
                var eski = db.islemler.find(function(i){return i.id===id;});
                if(eski) htIslemTersineCevir(db, eski);
                var idx = db.islemler.findIndex(function(i){return i.id===id;});
                if(idx!==-1) db.islemler[idx] = { id:id, hesapId:fromId, hedefId:tur==="GELEN"?null:toId, aciklama:aciklama, tarih:tarih, tutar:tutar, islem:tur };
            } else {
                var maxId = db.islemler.reduce(function(m,i){return Math.max(m,i.id);},0);
                var yeniId = maxId + 1;
                if(tur === "TRANSFER") {
                    db.islemler.push({ id:yeniId, hesapId:fromId, hedefId:toId, aciklama:aciklama, tarih:tarih, tutar:tutar, islem:"TRANSFER" });
                    htBakiyeGuncelle(db, fromId, tutar, "GİDEN");
                    htBakiyeGuncelle(db, toId, tutar, "GELEN");
                } else if(tur === "GELEN") {
                    db.islemler.push({ id:yeniId, hesapId:toId, aciklama:aciklama, tarih:tarih, tutar:tutar, islem:"GELEN" });
                    htBakiyeGuncelle(db, toId, tutar, "GELEN");
                } else {
                    var gidenKayit = { id:yeniId, hesapId:fromId, aciklama:aciklama, tarih:tarih, tutar:tutar, islem:"GİDEN" };
                    if(toId !== 0) {
                        gidenKayit.hedefId = toId;
                        if(toId === 1 || toId === -1) htBakiyeGuncelle(db, toId, tutar, "GELEN");
                    }
                    db.islemler.push(gidenKayit);
                    htBakiyeGuncelle(db, fromId, tutar, "GİDEN");
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

        var HT_SIRALAMA = { anahtar: "id", yon: -1 };

        function htIslemleriGoster() {
            var konteyner = document.getElementById("htIslemListesi");
            if(!konteyner) return;
            var db = htVeriYukle();
            if(!db.islemler || db.islemler.length === 0) {
                konteyner.innerHTML = tmEmptyStateHTML('💳','Henüz hesap hareketi bulunmamaktadır.','Hesap hareketi eklemek için "Hareket Ekle" butonunu kullanın.');
                return;
            }
            function hesapAdiBul(id) {
                if(id === -1) return "💵 NAKİT";
                if(id === 0) return "🌐 HARİCİ";
                var h = db.hesaplar.find(function(hs){return hs.id===id;});
                return h ? h.bankaAdi+" - "+h.hesapSahibi : ("ID:"+id);
            }
            var sirali = db.islemler.slice();
            sirali.sort(function(a, b) {
                var va, vb;
                if(HT_SIRALAMA.anahtar === "id") { va = a.id; vb = b.id; }
                else if(HT_SIRALAMA.anahtar === "aciklama") { va = (a.aciklama||"").toLowerCase(); vb = (b.aciklama||"").toLowerCase(); }
                else if(HT_SIRALAMA.anahtar === "hesap") { va = hesapAdiBul(a.hesapId).toLowerCase()+(a.hedefId?" → "+hesapAdiBul(a.hedefId).toLowerCase():""); vb = hesapAdiBul(b.hesapId).toLowerCase()+(b.hedefId?" → "+hesapAdiBul(b.hedefId).toLowerCase():""); }
                else if(HT_SIRALAMA.anahtar === "tarih") { va = a.tarih||""; vb = b.tarih||""; }
                else if(HT_SIRALAMA.anahtar === "tutar") { va = a.tutar; vb = b.tutar; }
                else if(HT_SIRALAMA.anahtar === "islem") { va = a.islem; vb = b.islem; }
                if(va < vb) return -1 * HT_SIRALAMA.yon;
                if(va > vb) return 1 * HT_SIRALAMA.yon;
                return 0;
            });
            var h = '<div class="ht-islem-kart-list">';
            sirali.forEach(function(i) {
                var cls = i.islem === "GELEN" ? "gelen" : (i.islem === "GİDEN" ? "giden" : "transfer");
                var hAd, ikon;
                if(i.islem === "TRANSFER") {
                    hAd = hesapAdiBul(i.hesapId) + " → " + hesapAdiBul(i.hedefId);
                    ikon = "🔄";
                } else if(i.islem === "GELEN") {
                    hAd = hesapAdiBul(i.hesapId);
                    ikon = "📥";
                } else {
                    hAd = (i.hedefId && i.hedefId !== 0 ? hesapAdiBul(i.hedefId) : "🌐 HARİCİ");
                    ikon = "📤";
                }
                h += '<div class="ht-islem-kart" data-search="'+(i.aciklama||"").toLowerCase()+' '+hAd.toLowerCase()+'">';
                h += '<div class="ht-islem-kart-ust">';
                h += '<span class="ht-islem-kart-aciklama">'+i.aciklama+'</span>';
                h += '<span class="ht-islem-kart-tutar '+cls+'">'+htTl(i.tutar)+'</span>';
                h += '</div>';
                h += '<div class="ht-islem-kart-alt">';
                h += '<span class="ht-islem-kart-hesap">'+ikon+' '+hAd+'</span>';
                h += '<span class="ht-islem-kart-tarih">'+(i.tarih?new Date(i.tarih).toLocaleDateString("tr-TR"):"-")+'</span>';
                h += '<span class="ht-islem-kart-islem '+cls+'">'+i.islem+'</span>';
                h += '</div>';
                h += '<div class="ht-islem-kart-aksiyon">';
                h += '<button class="ht-islem-btn ht-islem-btn-edit" onclick="htIslemModalAc('+i.id+')">Düzenle</button>';
                h += '<button class="ht-islem-btn ht-islem-btn-del" onclick="htIslemSil('+i.id+')">Sil</button>';
                h += '</div></div>';
            });
            h += '</div>';
            konteyner.innerHTML = h;
        }

        function htSiralamaDegistir(anahtar) {
            if(HT_SIRALAMA.anahtar === anahtar) {
                HT_SIRALAMA.yon *= -1;
            } else {
                HT_SIRALAMA.anahtar = anahtar;
                HT_SIRALAMA.yon = -1;
            }
            document.querySelectorAll("#htSiralama .ht-sirala-btn").forEach(function(b) {
                b.classList.toggle("active", b.getAttribute("data-key") === HT_SIRALAMA.anahtar);
            });
            htIslemleriGoster();
            htIslemFiltrele();
        }

        function htIslemFiltrele() {
            var kelime = document.getElementById("htArama").value.toLowerCase().trim();
            var list = document.getElementById("htIslemListesi");
            if(!list) return;
            list.querySelectorAll(".ht-islem-kart").forEach(function(k) {
                k.style.display = (k.getAttribute("data-search")||"").includes(kelime) ? "" : "none";
            });
        }

        /* ================= TM FİYAT LİSTESİ MODÜLÜ ================= */
        const TM_FIYAT_VARSAYILAN = [
            { aralikMin: 0, aralikMax: 100, birimFiyat: 1100.00, soylenenBirimFiyat: 650.00, ekipBirimFiyat: 350.00, avniBirimFiyat: 150.00, tarih: "2025-10-11" },
            { aralikMin: 101, aralikMax: 200, birimFiyat: 570.00, soylenenBirimFiyat: 325.00, ekipBirimFiyat: 175.00, avniBirimFiyat: 75.00, tarih: "2025-10-11" },
            { aralikMin: 201, aralikMax: 250, birimFiyat: 460.00, soylenenBirimFiyat: 260.00, ekipBirimFiyat: 140.00, avniBirimFiyat: 60.00, tarih: "2025-10-11" },
            { aralikMin: 251, aralikMax: 500, birimFiyat: 240.00, soylenenBirimFiyat: 135.00, ekipBirimFiyat: 70.00, avniBirimFiyat: 32.50, tarih: "2025-10-11" },
            { aralikMin: 501, aralikMax: 750, birimFiyat: 170.00, soylenenBirimFiyat: 95.00, ekipBirimFiyat: 50.00, avniBirimFiyat: 22.50, tarih: "2025-10-11" },
            { aralikMin: 751, aralikMax: 1000, birimFiyat: 155.00, soylenenBirimFiyat: 90.00, ekipBirimFiyat: 45.00, avniBirimFiyat: 22.50, tarih: "2025-10-11" },
            { aralikMin: 1001, aralikMax: 1250, birimFiyat: 150.00, soylenenBirimFiyat: 85.00, ekipBirimFiyat: 45.00, avniBirimFiyat: 20.00, tarih: "2025-10-11" },
            { aralikMin: 1251, aralikMax: 1500, birimFiyat: 150.00, soylenenBirimFiyat: 85.00, ekipBirimFiyat: 45.00, avniBirimFiyat: 20.00, tarih: "2025-10-11" },
            { aralikMin: 1501, aralikMax: 1750, birimFiyat: 150.00, soylenenBirimFiyat: 80.00, ekipBirimFiyat: 42.00, avniBirimFiyat: 19.00, tarih: "2025-10-11" },
            { aralikMin: 1751, aralikMax: 2000, birimFiyat: 150.00, soylenenBirimFiyat: 80.00, ekipBirimFiyat: 42.00, avniBirimFiyat: 19.00, tarih: "2025-10-11" },
            { aralikMin: 2001, aralikMax: 2250, birimFiyat: 140.00, soylenenBirimFiyat: 78.00, ekipBirimFiyat: 40.00, avniBirimFiyat: 18.00, tarih: "2025-10-11" },
            { aralikMin: 2251, aralikMax: 2500, birimFiyat: 140.00, soylenenBirimFiyat: 78.00, ekipBirimFiyat: 40.00, avniBirimFiyat: 18.00, tarih: "2025-10-11" },
            { aralikMin: 2501, aralikMax: 2750, birimFiyat: 140.00, soylenenBirimFiyat: 76.00, ekipBirimFiyat: 38.00, avniBirimFiyat: 17.00, tarih: "2025-10-11" },
            { aralikMin: 2751, aralikMax: 3000, birimFiyat: 130.00, soylenenBirimFiyat: 76.00, ekipBirimFiyat: 36.00, avniBirimFiyat: 16.00, tarih: "2025-10-11" },
            { aralikMin: 3001, aralikMax: 99999, birimFiyat: 130.00, soylenenBirimFiyat: 74.00, ekipBirimFiyat: 35.00, avniBirimFiyat: 15.50, tarih: "2025-10-11" }
        ];

        function tmFiyatVerileriniYukle() {
            let db = JSON.parse(localStorage.getItem("tm_fiyat_listesi_db"));
            if(db && db.length > 0) return db;
            db = TM_FIYAT_VARSAYILAN.map((item, idx) => ({ id: idx + 1, ...item }));
            origSetItem("tm_fiyat_listesi_db", JSON.stringify(db));
            return db;
        }

        function tmFiyatListesiniYenile() {
            const tbody = document.getElementById("tmFiyatTabloGovde");
            if(!tbody) return;
            const db = tmFiyatVerileriniYukle();
            if(db.length === 0) { tbody.innerHTML = '<tr><td colspan="8">'+tmEmptyStateHTML('💰','Henüz fiyat kaydı bulunmamaktadır.','Yeni bir piyasa fiyatı eklemek için formu kullanın.')+'</td></tr>'; return; }
            let h = "";
            db.forEach((k, i) => {
                const aralikStr = k.aralikMax >= 99999 ? k.aralikMin + " m² & ÜZERİ" : k.aralikMin + " - " + k.aralikMax + " m²";
                const trh = k.tarih ? new Date(k.tarih).toLocaleDateString("tr-TR") : "-";
                h += `<tr>
                    <td style="font-weight:700; color:var(--accent-red);">${k.id}</td>
                    <td><input type="text" class="tf-aralik-min" value="${k.aralikMin}" style="width:45%; text-align:center; padding:6px;"> - <input type="text" class="tf-aralik-max" value="${k.aralikMax >= 99999 ? '+' : k.aralikMax}" style="width:45%; text-align:center; padding:6px;"></td>
                    <td><input type="text" class="tf-birim" value="${k.birimFiyat.toLocaleString('tr-TR', {minimumFractionDigits:2})}" onfocus="tmTutarFocus(this)" oninput="tmTutarFormatla(this)" onblur="tmTutarBlur(this)" style="width:90%; text-align:right; padding:6px;"></td>
                    <td><input type="text" class="tf-soylenen" value="${k.soylenenBirimFiyat.toLocaleString('tr-TR', {minimumFractionDigits:2})}" onfocus="tmTutarFocus(this)" oninput="tmTutarFormatla(this)" onblur="tmTutarBlur(this)" style="width:90%; text-align:right; padding:6px;"></td>
                    <td><input type="text" class="tf-ekip" value="${k.ekipBirimFiyat.toLocaleString('tr-TR', {minimumFractionDigits:2})}" onfocus="tmTutarFocus(this)" oninput="tmTutarFormatla(this)" onblur="tmTutarBlur(this)" style="width:90%; text-align:right; padding:6px;"></td>
                    <td><input type="text" class="tf-avni" value="${k.avniBirimFiyat.toLocaleString('tr-TR', {minimumFractionDigits:2})}" onfocus="tmTutarFocus(this)" oninput="tmTutarFormatla(this)" onblur="tmTutarBlur(this)" style="width:90%; text-align:right; padding:6px;"></td>
                    <td><input type="date" class="tf-tarih" value="${k.tarih || ''}" style="width:100%; padding:6px;"></td>
                    <td style="white-space:nowrap;">
                        <button class="btn-warning" onclick="tmFiyatSatirKaydet(this, ${k.id})" style="padding:4px 8px; font-size:11px;">💾 Kaydet</button>
                        <button class="btn-danger" onclick="tmFiyatSatirSil(${k.id})" style="padding:4px 8px; font-size:11px;">Sil</button>
                    </td>
                </tr>`;
            });
            tbody.innerHTML = h;
        }

        function tmFiyatSatirKaydet(btn, id) {
            const tr = btn.closest("tr");
            const db = tmFiyatVerileriniYukle();
            const idx = db.findIndex(k => k.id === id);
            if(idx === -1) return;
            const minVal = parseFloat(tr.querySelector(".tf-aralik-min").value.replace(/,/g, '')) || 0;
            let maxVal = tr.querySelector(".tf-aralik-max").value.trim();
            maxVal = maxVal === '+' ? 99999 : (parseFloat(maxVal.replace(/,/g, '')) || 0);
            db[idx] = {
                ...db[idx],
                aralikMin: minVal,
                aralikMax: maxVal,
                birimFiyat: tmTutarCoz(tr.querySelector(".tf-birim").value),
                soylenenBirimFiyat: tmTutarCoz(tr.querySelector(".tf-soylenen").value),
                ekipBirimFiyat: tmTutarCoz(tr.querySelector(".tf-ekip").value),
                avniBirimFiyat: tmTutarCoz(tr.querySelector(".tf-avni").value),
                tarih: tr.querySelector(".tf-tarih").value || db[idx].tarih
            };
            localStorage.setItem("tm_fiyat_listesi_db", JSON.stringify(db));
            tmNotify("Fiyat satırı güncellendi.", "success");
            tmFiyatListesiniYenile();
        }

        function tmFiyatSatirSil(id) {
            tmConfirm("Bu fiyat satırını silmek istediğinize emin misiniz?", function() {
                let db = tmFiyatVerileriniYukle();
                db = db.filter(k => k.id !== id);
                localStorage.setItem("tm_fiyat_listesi_db", JSON.stringify(db));
                tmFiyatListesiniYenile();
                tmNotify("Fiyat satırı silindi.", "success");
            });
        }

        function tmFiyatYeniSatir() {
            const db = tmFiyatVerileriniYukle();
            const maxId = db.reduce((m, k) => Math.max(m, k.id), 0);
            db.push({ id: maxId + 1, aralikMin: 0, aralikMax: 100, birimFiyat: 0, soylenenBirimFiyat: 0, ekipBirimFiyat: 0, avniBirimFiyat: 0, tarih: anlikTarihGetir() });
            localStorage.setItem("tm_fiyat_listesi_db", JSON.stringify(db));
            tmFiyatListesiniYenile();
            tmNotify("Yeni fiyat satırı eklendi.", "success");
        }

        function tmFiyatlariSifirla() {
            tmConfirm("Tüm fiyat listesini varsayılan değerlere sıfırlamak istediğinize emin misiniz?", function() {
                const db = TM_FIYAT_VARSAYILAN.map((item, idx) => ({ id: idx + 1, ...item }));
                localStorage.setItem("tm_fiyat_listesi_db", JSON.stringify(db));
                tmFiyatListesiniYenile();
                tmNotify("Fiyat listesi varsayılan değerlere sıfırlandı.", "success");
            });
        }

        function tmFiyatHesapla() {
            const alanStr = document.getElementById("tmFiyatHesapAlan").value.trim().replace(/\./g, '').replace(',', '.');
            const alan = parseFloat(alanStr);
            if(isNaN(alan) || alan <= 0) { tmNotify("Geçerli bir inşaat alanı giriniz!", "error"); return; }
            const tur = document.getElementById("tmFiyatHesapTur").value;
            const db = tmFiyatVerileriniYukle();
            const satir = db.find(k => alan >= k.aralikMin && alan <= k.aralikMax);
            if(!satir) { tmNotify("Bu alan için uygun fiyat aralığı bulunamadı.", "error"); return; }
            let birimFiyat = 0;
            let etiket = "";
            switch(tur) {
                case "birim": birimFiyat = satir.birimFiyat; etiket = "Birim Fiyatı"; break;
                case "soylenen": birimFiyat = satir.soylenenBirimFiyat; etiket = "Söylenen Birim Fiyat"; break;
                case "ekip": birimFiyat = satir.ekipBirimFiyat; etiket = "Ekip Birim Fiyat"; break;
                case "avni": birimFiyat = satir.avniBirimFiyat; etiket = "Avni Birim Fiyat"; break;
            }
            const toplam = alan * birimFiyat;
            const aralikStr = satir.aralikMax >= 99999 ? satir.aralikMin + " m² ve üzeri" : satir.aralikMin + " - " + satir.aralikMax + " m²";
            document.getElementById("tmFiyatHesapBirim").innerText = etiket + ": " + birimFiyat.toLocaleString('tr-TR', {minimumFractionDigits:2}) + " ₺";
            document.getElementById("tmFiyatHesapToplam").innerText = toplam.toLocaleString('tr-TR', {minimumFractionDigits:2}) + " ₺";
            document.getElementById("tmFiyatHesapAralik").innerText = aralikStr;
            document.getElementById("tmFiyatHesapSonuc").style.display = "block";
        }

        /* ================= TM FİYAT LİSTESİ EXCEL TAB SİSTEMİ ================= */
        const TMF_DB_KEY = "tm_fiyat_sayfalar_v2";
        const TMF_DATA_PREFIX = "tm_fiyat_excel_";

        const TMF_DEFAULT_PAGES = [
            "Uygulama Proje Fiyatlandırma",
            "3B Modelleme ve Tasarım Fiyatlandırma",
            "Şantiye Şefliği Fiyatlandırma",
            "Kat İrtifakı/Mülkiyeti İşi Fiyatlandırma",
            "Danışmanlık Fiyatlandırma",
            "Rölöve Fiyatlandırma",
            "Keşif Fiyatlandırma"
        ];

        let tmfAktifId = null;
        let tmfSResize = null;
        var tmfEditing = false;

        function tmfHucreObj(val) {
            if (typeof val === 'object' && val !== null) return val;
            return { t: val || "", b: false, c: "#000000", s: 13, bg: "" };
        }

        function tmfHucreHtml(val) {
            var o = tmfHucreObj(val);
            var st = "font-size:" + o.s + "px;color:" + o.c + ";";
            if (o.b) st += "font-weight:700;";
            if (o.bg) st += "background-color:" + o.bg + ";";
            return '<span style="' + st + '">' + esc(o.t || "") + '</span>';
        }

        function tmfSayfalarYukle() {
            let db = JSON.parse(localStorage.getItem(TMF_DB_KEY));
            if (!db || !Array.isArray(db) || db.length === 0) {
                db = TMF_DEFAULT_PAGES.map((n, i) => ({ id: i + 1, name: n }));
                origSetItem(TMF_DB_KEY, JSON.stringify(db));
                TMF_DEFAULT_PAGES.forEach((n, i) => tmfVeriYukle(i + 1));
            }
            return db;
        }

        function tmfSayfalarKaydet(db) { localStorage.setItem(TMF_DB_KEY, JSON.stringify(db)); }

        function tmfVeriYukle(id) {
            try {
                var raw = localStorage.getItem(TMF_DATA_PREFIX + id);
                if (raw) {
                    var d = JSON.parse(raw);
                    if (d && d.grid && d.colWidths) {
                        if (!d.rowHeights) d.rowHeights = [];
                        return d;
                    }
                }
            } catch(e) { tmAlert("Veri yükleme hatası, yeni tablo oluşturuldu: " + e.message); }
            var obj = { grid: [["","",""],["","",""],["","",""],["","",""],["","",""]], colWidths: [120,180,180], rowHeights: [] };
            origSetItem(TMF_DATA_PREFIX + id, JSON.stringify(obj));
            return obj;
        }

        function tmfVeriKaydet(id, data) { localStorage.setItem(TMF_DATA_PREFIX + id, JSON.stringify(data)); }

        function tmfSayfayiYukle() {
            const pages = tmfSayfalarYukle();
            const bar = document.getElementById("tmfTabBar");
            const content = document.getElementById("tmfTabContent");
            if (!bar || !content) return;

            if (!tmfAktifId || !pages.find(p => p.id === tmfAktifId)) {
                tmfAktifId = pages.length > 0 ? pages[0].id : null;
            }

            bar.innerHTML = pages.map(p => {
                const aktif = p.id === tmfAktifId;
                return '<div class="tmf-tab' + (aktif ? ' active' : '') + '" data-id="' + p.id + '" onclick="tmfTabDegistir(' + p.id + ')">' +
                    '<span class="tmf-tab-rename" onclick="event.stopPropagation(); tmfSayfaYenidenAdlandir(' + p.id + ')" title="Yeniden adlandır">✏️</span>' +
                    '<span>' + esc(p.name) + '</span>' +
                    (pages.length > 1 ? '<span class="tmf-tab-close" onclick="event.stopPropagation(); tmfSayfaSil(' + p.id + ')" title="Sayfayı sil">✕</span>' : '') +
                    '</div>';
            }).join("");

            if (tmfAktifId) {
                tmfExcelGoster(tmfAktifId);
            } else {
                content.innerHTML = tmEmptyStateHTML('📑','Henüz sayfa bulunmamaktadır.','İlk Excel sayfasını oluşturarak başlayın.','<button class="tm-empty-btn" onclick="tmfSayfaEkle()">İlk Sayfayı Oluştur</button>');
            }
        }

        function tmfTabDegistir(id) {
            if (tmfEditing) { tmNotify("Önce değişiklikleri kaydedin veya iptal edin.", "error"); return; }
            tmfAktifId = id;
            tmfSayfayiYukle();
        }

        function tmfSayfaEkle() {
            if (tmfEditing) { tmNotify("Önce değişiklikleri kaydedin veya iptal edin.", "error"); return; }
            tmPrompt("Yeni sayfa adı:", function(name) {
                if (!name || name.trim() === "") return;
                name = name.trim();
                var pages = tmfSayfalarYukle();
                var maxId = 0;
                pages.forEach(function(p){ if(p.id > maxId) maxId = p.id; });
                var yeniId = maxId + 1;
                pages.push({ id: yeniId, name: name });
                tmfSayfalarKaydet(pages);
                var obj = { grid: [["","",""],["","",""],["","",""],["","",""],["","",""]], colWidths: [120,180,180], rowHeights: [] };
                origSetItem(TMF_DATA_PREFIX + yeniId, JSON.stringify(obj));
                tmfAktifId = yeniId;
                tmfSayfayiYukle();
                tmNotify("Yeni sayfa eklendi: " + name, "success");
            });
        }

        function tmfSayfaSil(id) {
            if (tmfEditing) { tmNotify("Önce değişiklikleri kaydedin veya iptal edin.", "error"); return; }
            var pages = tmfSayfalarYukle();
            var p = null;
            pages.forEach(function(x){ if(x.id === id) p = x; });
            if (!p) { tmNotify("Sayfa bulunamadı.", "error"); return; }
            tmConfirm('"' + p.name + '" sayfasını silmek istediğinize emin misiniz?', function() {
                var yeniPages = [];
                pages.forEach(function(x){ if(x.id !== id) yeniPages.push(x); });
                tmfSayfalarKaydet(yeniPages);
                localStorage.removeItem(TMF_DATA_PREFIX + id);
                if (tmfAktifId === id) { tmfAktifId = yeniPages.length > 0 ? yeniPages[0].id : null; }
                tmfSayfayiYukle();
                tmNotify("Sayfa silindi.", "success");
            });
        }

        function tmfSayfaYenidenAdlandir(id) {
            if (tmfEditing) { tmNotify("Önce değişiklikleri kaydedin veya iptal edin.", "error"); return; }
            const pages = tmfSayfalarYukle();
            const p = pages.find(x => x.id === id);
            if (!p) return;
            tmPrompt("Yeni sayfa adı:", function(yeniAd) {
                if (!yeniAd || yeniAd.trim() === "" || yeniAd.trim() === p.name) return;
                p.name = yeniAd.trim();
                tmfSayfalarKaydet(pages);
                tmfSayfayiYukle();
                tmNotify("Sayfa adı değiştirildi.", "success");
            });
        }

        function tmfSutunHarfi(n) {
            var s = "";
            while (n >= 0) {
                s = String.fromCharCode(65 + (n % 26)) + s;
                n = Math.floor(n / 26) - 1;
            }
            return s;
        }

        function tmfExcelGoster(id) {
            var data = tmfVeriYukle(id);
            var grid = data.grid;
            var colWidths = data.colWidths;
            var rowHeights = data.rowHeights || [];
            var rows = grid.length;
            var cols = colWidths.length;
            var container = document.getElementById("tmfTabContent");
            if (!container) return;

            while (rowHeights.length < rows) rowHeights.push(32);

            var h = '<div class="tmf-excel-wrap">';

            h += '<div class="tmf-fmt-bar" id="tmfFmtBar" style="display:' + (tmfEditing ? "flex" : "none") + ';">';
            h += '<button class="tmf-fmt-btn" id="tmfFmtBold" onclick="tmfFmtBold()" title="Kalın"><b>B</b></button>';
            h += '<select class="tmf-fmt-select" id="tmfFmtSize" onchange="tmfFmtSizeDegistir(this.value)" title="Punto">';
            h += '<option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13" selected>13</option><option value="14">14</option><option value="16">16</option><option value="18">18</option><option value="20">20</option><option value="24">24</option>';
            h += '</select>';
            h += '<div class="tmf-fmt-group">';
            h += '<span class="tmf-fmt-label">Yazı:</span>';
            h += '<input type="color" id="tmfFmtColor" value="#000000" onchange="tmfFmtColorDegistir(this.value)" title="Yazı rengi" style="width:28px;height:28px;padding:0;border:1px solid var(--border-color);border-radius:4px;cursor:pointer;">';
            h += '</div>';
            h += '<div class="tmf-fmt-group">';
            h += '<span class="tmf-fmt-label">Hücre:</span>';
            h += '<input type="color" id="tmfFmtBg" value="#ffffff" onchange="tmfFmtBgDegistir(this.value)" title="Hücre arka plan rengi" style="width:28px;height:28px;padding:0;border:1px solid var(--border-color);border-radius:4px;cursor:pointer;">';
            h += '</div>';
            h += '<span style="flex:1;"></span>';
            h += '<button class="tmf-fmt-btn tmf-fmt-save" onclick="tmfDuzenleKaydet(' + id + ')">Kaydet</button>';
            h += '<button class="tmf-fmt-btn tmf-fmt-cancel" onclick="tmfDuzenleIptal(' + id + ')">İptal</button>';
            h += '</div>';

            h += '<div class="tmf-excel-scroll"><table class="tmf-excel" id="tmfExcel_' + id + '">';

            h += '<thead><tr>';
            h += '<th class="tmf-ex-corner"></th>';
            for (var c = 0; c < cols; c++) {
                h += '<th class="tmf-ex-col-h" style="width:' + colWidths[c] + 'px;" data-col="' + c + '">';
                h += '<span class="tmf-ex-col-label">' + tmfSutunHarfi(c) + '</span>';
                h += '<span class="tmf-ex-col-del" onclick="tmfSutunSil(' + id + ',' + c + ')" title="Sütunu sil">✕</span>';
                h += '<div class="tmf-ex-col-resize" onmousedown="tmfColResizeB(event,' + id + ',' + c + ')"></div>';
                h += '</th>';
            }
            h += '<th class="tmf-ex-add-col" onclick="tmfSutunEkle(' + id + ')" title="Sütun ekle">+</th>';
            h += '</tr></thead><tbody>';

            for (var r = 0; r < rows; r++) {
                var rh = Math.max(32, rowHeights[r] || 32);
                h += '<tr data-row="' + r + '" style="' + (tmfEditing ? 'min-height:' : 'height:') + rh + 'px;">';
                h += '<td class="tmf-ex-row-h" style="' + (tmfEditing ? '' : 'height:' + rh + 'px;') + '"><span class="tmf-ex-row-label">' + (r + 1) + '</span><span class="tmf-ex-row-del" onclick="tmfSatirSil(' + id + ',' + r + ')" title="Satırı sil">✕</span><div class="tmf-ex-row-resize" onmousedown="tmfRowResizeB(event,' + id + ',' + r + ')"></div></td>';
                for (var c = 0; c < cols; c++) {
                    var val = grid[r] !== undefined ? grid[r][c] : "";
                    if (tmfEditing) {
                        var o = tmfHucreObj(val);
                        h += '<td style="width:' + colWidths[c] + 'px;min-width:' + colWidths[c] + 'px;' + (o.bg ? 'background-color:' + o.bg + ';' : '') + '">';
                        h += '<textarea class="tmf-ex-input tmf-ex-ta" data-r="' + r + '" data-c="' + c + '" style="font-size:' + o.s + 'px;color:' + o.c + ';' + (o.b ? 'font-weight:700;' : '') + (o.bg ? 'background-color:' + o.bg + ';' : '') + '" oninput="tmfTaGrow(this)" onfocus="tmfTaFocus(this)" onblur="tmfTaBlur(this)">' + esc(o.t) + '</textarea>';
                        h += '</td>';
                    } else {
                        h += '<td style="width:' + colWidths[c] + 'px;min-width:' + colWidths[c] + 'px;overflow:hidden;' + (tmfHucreObj(val).bg ? 'background-color:' + tmfHucreObj(val).bg + ';' : '') + '"><div class="tmf-ex-view" style="max-height:' + (rh - 8) + 'px;">' + tmfHucreHtml(val) + '</div></td>';
                    }
                }
                h += '<td class="tmf-ex-empty"></td>';
                h += '</tr>';
            }

            h += '</tbody></table></div>';

            h += '<div class="tmf-ex-toolbar">';
            if (!tmfEditing) {
                h += '<button class="tmf-ex-btn tmf-ex-btn-edit" onclick="tmfDuzenleBaslat(' + id + ')">Düzenle</button>';
            }
            h += '<button class="tmf-ex-btn" onclick="tmfSatirEkle(' + id + ')">+ Satır Ekle</button>';
            h += '<button class="tmf-ex-btn" onclick="tmfSutunEkle(' + id + ')">+ Sütun Ekle</button>';
            h += '</div></div>';

            container.innerHTML = h;

            if (tmfEditing) {
                container.querySelectorAll(".tmf-ex-ta").forEach(function(ta) { tmfTaGrow(ta); });
            }
        }

        function tmfDuzenleBaslat(id) {
            tmfEditing = true;
            tmfExcelGoster(id);
            setTimeout(function() {
                var ilkTa = document.querySelector("#tmfTabContent .tmf-ex-ta");
                if (ilkTa) { ilkTa.focus(); ilkTa.setSelectionRange(ilkTa.value.length, ilkTa.value.length); }
            }, 50);
        }

        function tmfDuzenleKaydet(id) {
            try {
                var data = tmfVeriYukle(id);
                var textareas = document.querySelectorAll("#tmfExcel_" + id + " .tmf-ex-ta");
                if (!textareas.length) { tmAlert("Kaydedilecek hücre bulunamadı."); return; }
                textareas.forEach(function(ta) {
                    var r = parseInt(ta.dataset.r);
                    var c = parseInt(ta.dataset.c);
                    var o = tmfHucreObj(data.grid[r] ? data.grid[r][c] : "");
                    o.t = ta.value;
                    o.s = parseInt(ta.style.fontSize) || 13;
                    o.b = ta.style.fontWeight === "700" || ta.style.fontWeight === "bold";
                    o.c = ta.style.color || o.c;
                    o.bg = ta.style.backgroundColor || o.bg;
                    if (!data.grid[r]) data.grid[r] = [];
                    data.grid[r][c] = o;
                });
                tmfVeriKaydet(id, data);
                tmfEditing = false;
                tmfFocusedCell = null;
                tmfExcelGoster(id);
                tmNotify("Değişiklikler kaydedildi.", "success");
            } catch(e) { tmAlert("Kaydetme hatası: " + e.message); }
        }

        function tmfDuzenleIptal(id) {
            tmfEditing = false;
            tmfFocusedCell = null;
            tmfExcelGoster(id);
            tmNotify("Düzenleme iptal edildi.", "info");
        }

        function tmfTaGrow(ta) {
            ta.style.height = "auto";
            ta.style.height = ta.scrollHeight + "px";
        }

        var tmfFocusedCell = null;

        function tmfRenkToHex(renk) {
            if (!renk || renk === "transparent" || renk === "rgba(0, 0, 0, 0)") return "";
            if (renk.charAt(0) === "#") return renk;
            var ctx = document.createElement("canvas").getContext("2d");
            ctx.fillStyle = renk;
            var hex = ctx.fillStyle;
            if (hex && hex.charAt(0) === "#") return hex;
            return "#000000";
        }

        function tmfTaFocus(ta) {
            tmfFocusedCell = ta;
            var o = tmfHucreObj({ t: ta.value, b: ta.style.fontWeight === "700", c: ta.style.color || "#000000", s: parseInt(ta.style.fontSize) || 13, bg: ta.style.backgroundColor || "" });
            var boldBtn = document.getElementById("tmfFmtBold");
            if (boldBtn) boldBtn.classList.toggle("active", o.b);
            var sizeEl = document.getElementById("tmfFmtSize");
            if (sizeEl) sizeEl.value = String(o.s);
            var colorEl = document.getElementById("tmfFmtColor");
            if (colorEl) colorEl.value = tmfRenkToHex(o.c);
            var bgEl = document.getElementById("tmfFmtBg");
            if (bgEl) bgEl.value = tmfRenkToHex(o.bg) || "#ffffff";
        }

        function tmfTaBlur(ta) {
            if (tmfFocusedCell === ta) tmfFocusedCell = null;
        }

        function tmfFmtBold() {
            if (!tmfFocusedCell) return;
            var ta = tmfFocusedCell;
            var isBold = ta.style.fontWeight === "700" || ta.style.fontWeight === "bold";
            ta.style.fontWeight = isBold ? "normal" : "700";
            var boldBtn = document.getElementById("tmfFmtBold");
            if (boldBtn) boldBtn.classList.toggle("active", !isBold);
        }

        function tmfFmtSizeDegistir(val) {
            if (!tmfFocusedCell) return;
            tmfFocusedCell.style.fontSize = val + "px";
            tmfTaGrow(tmfFocusedCell);
        }

        function tmfFmtColorDegistir(val) {
            if (!tmfFocusedCell) return;
            tmfFocusedCell.style.color = val;
        }

        function tmfFmtBgDegistir(val) {
            if (!tmfFocusedCell) return;
            tmfFocusedCell.style.backgroundColor = val;
            var td = tmfFocusedCell.closest("td");
            if (td) td.style.backgroundColor = val;
        }

        function tmfSatirEkle(id) {
            try {
                var data = tmfVeriYukle(id);
                var cols = data.colWidths.length;
                var yeniSatir = [];
                for (var i = 0; i < cols; i++) yeniSatir.push({ t: "", b: false, c: "#000000", s: 13, bg: "" });
                data.grid.push(yeniSatir);
                if (data.rowHeights) data.rowHeights.push(32);
                tmfVeriKaydet(id, data);
                tmfExcelGoster(id);
                tmNotify("Yeni satır eklendi.", "success");
            } catch(e) { tmAlert("Satır ekleme hatası: " + e.message); }
        }

        function tmfSatirSil(id, r) {
            try {
                tmConfirm((r + 1) + ". satırı silmek istediğinize emin misiniz?", function() {
                    try {
                        var data = tmfVeriYukle(id);
                        data.grid.splice(r, 1);
                        if (data.rowHeights) data.rowHeights.splice(r, 1);
                        if (data.grid.length === 0) {
                            var bosSatir = [];
                            for (var i = 0; i < data.colWidths.length; i++) bosSatir.push({ t: "", b: false, c: "#000000", s: 13, bg: "" });
                            data.grid.push(bosSatir);
                        }
                        tmfVeriKaydet(id, data);
                        tmfExcelGoster(id);
                        tmNotify("Satır silindi.", "success");
                    } catch(e) { tmAlert("Satır silme hatası: " + e.message); }
                });
            } catch(e) { tmAlert("Satır silme hatası: " + e.message); }
        }

        function tmfSutunEkle(id) {
            try {
                var data = tmfVeriYukle(id);
                data.colWidths.push(120);
                for (var r = 0; r < data.grid.length; r++) data.grid[r].push({ t: "", b: false, c: "#000000", s: 13, bg: "" });
                tmfVeriKaydet(id, data);
                tmfExcelGoster(id);
                tmNotify("Yeni sütun eklendi.", "success");
            } catch(e) { tmAlert("Sütun ekleme hatası: " + e.message); }
        }

        function tmfSutunSil(id, c) {
            try {
                tmConfirm(tmfSutunHarfi(c) + " sütununu silmek istediğinize emin misiniz?", function() {
                    try {
                        var data = tmfVeriYukle(id);
                        data.colWidths.splice(c, 1);
                        for (var r = 0; r < data.grid.length; r++) data.grid[r].splice(c, 1);
                        if (data.colWidths.length === 0) {
                            data.colWidths.push(120);
                            for (var r = 0; r < data.grid.length; r++) data.grid[r].push({ t: "", b: false, c: "#000000", s: 13, bg: "" });
                        }
                        tmfVeriKaydet(id, data);
                        tmfExcelGoster(id);
                        tmNotify("Sütun silindi.", "success");
                    } catch(e) { tmAlert("Sütun silme hatası: " + e.message); }
                });
            } catch(e) { tmAlert("Sütun silme hatası: " + e.message); }
        }

        function tmfColResizeB(e, id, colIdx) {
            e.preventDefault();
            var th = e.target.closest("th");
            if (!th) return;
            tmfSResize = { id, colIdx, th, sx: e.clientX, sw: th.offsetWidth };
            document.addEventListener("mousemove", tmfColResizeH);
            document.addEventListener("mouseup", tmfColResizeE);
        }
        function tmfColResizeH(e) {
            if (!tmfSResize) return;
            var yw = Math.max(40, tmfSResize.sw + e.clientX - tmfSResize.sx);
            tmfSResize.th.style.width = yw + "px";
            var tbl = document.getElementById("tmfExcel_" + tmfSResize.id);
            if (tbl) {
                var idx = tmfSResize.colIdx + 2;
                tbl.querySelectorAll("td:nth-child(" + idx + ")").forEach(function(td) { td.style.width = yw + "px"; td.style.minWidth = yw + "px"; });
            }
        }
        function tmfColResizeE(e) {
            if (!tmfSResize) return;
            document.removeEventListener("mousemove", tmfColResizeH);
            document.removeEventListener("mouseup", tmfColResizeE);
            var w = tmfSResize.th.offsetWidth;
            var data = tmfVeriYukle(tmfSResize.id);
            if (data.colWidths[tmfSResize.colIdx] !== undefined) {
                data.colWidths[tmfSResize.colIdx] = w;
                tmfVeriKaydet(tmfSResize.id, data);
            }
            tmfSResize = null;
        }

        /* Row resize */
        function tmfRowResizeB(e, id, rowIdx) {
            e.preventDefault();
            var tr = e.target.closest("tr");
            if (!tr) return;
            tmfSResize = { id: id, rowIdx: rowIdx, tr: tr, sy: e.clientY, sh: tr.offsetHeight };
            document.addEventListener("mousemove", tmfRowResizeH);
            document.addEventListener("mouseup", tmfRowResizeE);
        }
        function tmfRowResizeH(e) {
            if (!tmfSResize) return;
            var yh = Math.max(20, tmfSResize.sh + e.clientY - tmfSResize.sy);
            tmfSResize.tr.style.height = yh + "px";
            tmfSResize.tr.querySelectorAll("td").forEach(function(td) { td.style.height = yh + "px"; });
        }
        function tmfRowResizeE(e) {
            if (!tmfSResize) return;
            document.removeEventListener("mousemove", tmfRowResizeH);
            document.removeEventListener("mouseup", tmfRowResizeE);
            var h = tmfSResize.tr.offsetHeight;
            var data = tmfVeriYukle(tmfSResize.id);
            if (!data.rowHeights) data.rowHeights = [];
            while (data.rowHeights.length <= tmfSResize.rowIdx) data.rowHeights.push(32);
            data.rowHeights[tmfSResize.rowIdx] = h;
            tmfVeriKaydet(tmfSResize.id, data);
            tmfSResize = null;
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
                ekle.textContent = "✏️ Özel Yıl...";
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
                    netIco.innerText = "🔴";
                    netLbl.innerText = "KDV Ödenecek";
                    netVal.style.color = "var(--accent-red)";
                } else {
                    kdvNet = -net;
                    netKart.className = "ft-ozet-card card-kdv-net kdv-alacak";
                    netIco.innerText = "🟢";
                    netLbl.innerText = "KDV Alacak (+ fazla ödeme)";
                    netVal.style.color = "var(--btn-green)";
                }
            } else {
                kdvNet = -fark;
                netKart.className = "ft-ozet-card card-kdv-net kdv-alacak";
                netIco.innerText = "🟢";
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
                '<div style="flex:1;min-width:140px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Tutar (₺)</label><input type="text" id="ftGelenTutar" value="'+tutarVal+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;font-weight:700;" onfocus="tmTutarFocus(this)" oninput="tmTutarFormatla(this)" onblur="tmTutarBlur(this)"></div>' +
                '<div style="flex:0 0 90px;text-align:center;"><label style="display:block;text-align:center;width:100%;">KDV %</label><select id="ftGelenKdvOran" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;"><option value="0"'+(f&&f.kdvOrani==0?" selected":"")+'>%0</option><option value="10"'+(f&&f.kdvOrani==10?" selected":"")+'>%10</option><option value="20"'+(f&&f.kdvOrani==20?" selected":"")+'>%20</option></select></div>' +
                '<div style="flex:1;min-width:120px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Vergi D.</label><input type="text" id="ftGelenVergiD" value="'+(f?f.vergiDairesi:'')+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;text-transform:uppercase;" oninput="this.value=this.value.toUpperCase()"></div>' +
                '<div style="flex:1;min-width:100px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Vergi No</label><input type="text" id="ftGelenVergiNo" value="'+(f?f.vergiNo:'')+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;"></div>' +
                '<div style="flex:1;min-width:110px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Durum</label><select id="ftGelenDurum" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;"><option value="odenmedi"'+(f&&f.odemeDurumu=="odenmedi"?" selected":"")+'>Ödenmedi</option><option value="kismi"'+(f&&f.odemeDurumu=="kismi"?" selected":"")+'>Kısmi</option><option value="odendi"'+(f&&f.odemeDurumu=="odendi"?" selected":"")+'>Ödendi</option></select></div>' +
                '<div style="flex:1;min-width:110px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Ödeme T.</label><input type="date" id="ftGelenOdemeTarih" value="'+(f?f.odemeTarihi:'')+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;"></div>' +
                '</div>' +
                '<div style="display:flex;gap:8px;justify-content:center;padding-top:6px;">' +
                '<button class="btn-form btn-form-save" onclick="'+fn+'" style="padding:8px 20px;font-size:13px;">💾 '+(isEdit?"Güncelle":"Ekle")+'</button>' +
                '<button class="btn-form btn-form-cancel" onclick="document.getElementById(\'ftGelenForm\').style.display=\'none\'" style="padding:8px 20px;font-size:13px;">✕ İptal</button></div></div>';
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
            if (!liste.length) { konteyner.innerHTML = tmEmptyStateHTML('📥','Henüz gelen fatura bulunmamaktadır.','Yeni bir gelen fatura eklemek için "Fatura Ekle" butonunu kullanın.'); return; }
            var h = '<div class="ft-tbl-wrap"><table class="ft-table"><thead><tr><th>Firma</th><th>Fatura No</th><th>Vergi D.</th><th>Vergi No</th><th>Tarih</th><th>Vade</th><th>Tutar</th><th>KDV</th><th>Toplam</th><th>Durum</th><th>Ödeme T.</th><th></th></tr></thead><tbody>';
            liste.slice().reverse().forEach(function(f) {
                var dc = f.odemeDurumu, dt = dc==="odendi"?"Ödendi":dc==="kismi"?"Kısmi":"Ödenmedi";
                h += '<tr data-ftgelen="'+(f.firmaAdi||"").toLowerCase()+' '+(f.faturaNo||"").toLowerCase()+'">';
                h += '<td style="font-weight:600;">'+esc(f.firmaAdi)+'</td><td>'+esc(f.faturaNo)+'</td>';
                h += '<td style="font-size:11px;color:var(--text-light);">'+esc(f.vergiDairesi)+'</td><td style="font-size:11px;">'+esc(f.vergiNo)+'</td>';
                h += '<td style="font-size:11px;">'+(f.faturaTarihi?tarihStr(f.faturaTarihi):"-")+'</td><td style="font-size:11px;">'+(f.vadeTarihi?tarihStr(f.vadeTarihi):"-")+'</td>';
                h += '<td style="text-align:right;">'+tmTl(f.tutar)+'</td><td style="text-align:right;">'+tmTl(f.kdvTutari)+'</td><td style="text-align:right;font-weight:700;">'+tmTl(f.toplamTutar)+'</td>';
                h += '<td><span class="ft-badge '+dc+'">'+dt+'</span></td><td style="font-size:11px;">'+(f.odemeTarihi?tarihStr(f.odemeTarihi):"-")+'</td>';
                h += '<td><button class="ft-btn-sm ft-btn-edit" onclick="ftGelenFormAc('+f.id+')">✏️</button> <button class="ft-btn-sm ft-btn-del" onclick="ftGelenSil('+f.id+')">🗑️</button></td></tr>';
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
                '<div style="flex:1;min-width:140px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Tutar (₺)</label><input type="text" id="ftGidenTutar" value="'+tutarVal+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;font-weight:700;" onfocus="tmTutarFocus(this)" oninput="tmTutarFormatla(this)" onblur="tmTutarBlur(this)"></div>' +
                '<div style="flex:0 0 90px;text-align:center;"><label style="display:block;text-align:center;width:100%;">KDV %</label><select id="ftGidenKdvOran" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;"><option value="0"'+(f&&f.kdvOrani==0?" selected":"")+'>%0</option><option value="10"'+(f&&f.kdvOrani==10?" selected":"")+'>%10</option><option value="20"'+(f&&f.kdvOrani==20?" selected":"")+'>%20</option></select></div>' +
                '<div style="flex:1;min-width:120px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Vergi D.</label><input type="text" id="ftGidenVergiD" value="'+(f?f.vergiDairesi:'')+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;text-transform:uppercase;" oninput="this.value=this.value.toUpperCase()"></div>' +
                '<div style="flex:1;min-width:100px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Vergi No</label><input type="text" id="ftGidenVergiNo" value="'+(f?f.vergiNo:'')+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;"></div>' +
                '<div style="flex:1;min-width:120px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Durum</label><select id="ftGidenDurum" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;"><option value="tahsilEdilmedi"'+(f&&f.tahsilatDurumu=="tahsilEdilmedi"?" selected":"")+'>Tahsil Edilmedi</option><option value="kismi"'+(f&&f.tahsilatDurumu=="kismi"?" selected":"")+'>Kısmi</option><option value="tahsilEdildi"'+(f&&f.tahsilatDurumu=="tahsilEdildi"?" selected":"")+'>Tahsil Edildi</option></select></div>' +
                '<div style="flex:1;min-width:110px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Tahsilat T.</label><input type="date" id="ftGidenTahsilatTarih" value="'+(f?f.tahsilatTarihi:'')+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;"></div>' +
                '</div>' +
                '<div style="display:flex;gap:8px;justify-content:center;padding-top:6px;">' +
                '<button class="btn-form btn-form-save" onclick="'+fn+'" style="padding:8px 20px;font-size:13px;">💾 '+(isEdit?"Güncelle":"Ekle")+'</button>' +
                '<button class="btn-form btn-form-cancel" onclick="document.getElementById(\'ftGidenForm\').style.display=\'none\'" style="padding:8px 20px;font-size:13px;">✕ İptal</button></div></div>';
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
            if (!liste.length) { konteyner.innerHTML = tmEmptyStateHTML('📤','Henüz giden fatura bulunmamaktadır.','Yeni bir giden fatura eklemek için "Fatura Ekle" butonunu kullanın.'); return; }
            var h = '<div class="ft-tbl-wrap"><table class="ft-table"><thead><tr><th>Firma</th><th>Fatura No</th><th>Vergi D.</th><th>Vergi No</th><th>Tarih</th><th>Vade</th><th>Tutar</th><th>KDV</th><th>Toplam</th><th>Durum</th><th>Tahsilat T.</th><th></th></tr></thead><tbody>';
            liste.slice().reverse().forEach(function(f) {
                var dc = f.tahsilatDurumu, dt = dc==="tahsilEdildi"?"Tah.Edildi":dc==="kismi"?"Kısmi":"Tah.Edilmedi";
                h += '<tr data-ftgiden="'+(f.firmaAdi||"").toLowerCase()+' '+(f.faturaNo||"").toLowerCase()+'">';
                h += '<td style="font-weight:600;">'+esc(f.firmaAdi)+'</td><td>'+esc(f.faturaNo)+'</td>';
                h += '<td style="font-size:11px;color:var(--text-light);">'+esc(f.vergiDairesi)+'</td><td style="font-size:11px;">'+esc(f.vergiNo)+'</td>';
                h += '<td style="font-size:11px;">'+(f.faturaTarihi?tarihStr(f.faturaTarihi):"-")+'</td><td style="font-size:11px;">'+(f.vadeTarihi?tarihStr(f.vadeTarihi):"-")+'</td>';
                h += '<td style="text-align:right;">'+tmTl(f.tutar)+'</td><td style="text-align:right;">'+tmTl(f.kdvTutari)+'</td><td style="text-align:right;font-weight:700;">'+tmTl(f.toplamTutar)+'</td>';
                h += '<td><span class="ft-badge '+dc+'">'+dt+'</span></td><td style="font-size:11px;">'+(f.tahsilatTarihi?tarihStr(f.tahsilatTarihi):"-")+'</td>';
                h += '<td><button class="ft-btn-sm ft-btn-edit" onclick="ftGidenFormAc('+f.id+')">✏️</button> <button class="ft-btn-sm ft-btn-del" onclick="ftGidenSil('+f.id+')">🗑️</button></td></tr>';
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
                '<button class="btn btn-save-green" title="Tür Ekle" onclick="yeniVergiTuruEklePrompt()" style="min-width:36px;height:42px;font-size:18px;line-height:1;">➕</button>' +
                '<button class="btn btn-danger btn-sm" title="Tür Sil" onclick="vergiTuruSilPrompt()" style="min-width:36px;height:42px;font-size:18px;line-height:1;">➖</button></div></div>' +
                '<div style="flex:1;min-width:120px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Tutar (₺)</label><input type="text" id="ftOdenenVergiTutar" value="'+tutarVal+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;font-weight:700;" onfocus="tmTutarFocus(this)" oninput="tmTutarFormatla(this)" onblur="tmTutarBlur(this)"></div>' +
                '<div style="flex:1;min-width:120px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Ödeme Tarihi</label><input type="date" id="ftOdenenVergiTarih" value="'+(v?v.odemeTarihi:'')+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;"></div>' +
                '<div style="flex:1;min-width:130px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Dönem</label><select id="ftOdenenVergiDonem" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;">'+donemOpts+'</select></div>' +
                '<div style="flex:2;min-width:150px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Açıklama</label><input type="text" id="ftOdenenVergiAciklama" value="'+(v?v.aciklama:'')+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;"></div>' +
                '</div>' +
                '<div style="display:flex;gap:8px;justify-content:center;padding-top:6px;">' +
                '<button class="btn-form btn-form-save" onclick="'+fn+'" style="padding:8px 20px;font-size:13px;">💾 '+(isEdit?"Güncelle":"Ekle")+'</button>' +
                '<button class="btn-form btn-form-cancel" onclick="document.getElementById(\'ftOdenenVergiForm\').style.display=\'none\'" style="padding:8px 20px;font-size:13px;">✕ İptal</button></div></div>';
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
            if (!liste.length) { konteyner.innerHTML = tmEmptyStateHTML('🧾','Henüz ödenen vergi kaydı bulunmamaktadır.','Ödenen vergi kaydı eklemek için formu kullanın.'); return; }
            var h = '<div class="ft-tbl-wrap"><table class="ft-table"><thead><tr><th>Vergi Adı</th><th>Tutar</th><th>Ödeme Tarihi</th><th>Dönem</th><th>Açıklama</th><th></th></tr></thead><tbody>';
            liste.slice().reverse().forEach(function(v) {
                h += '<tr data-ftodenenv="'+(v.vergiAdi||"").toLowerCase()+'">';
                h += '<td style="font-weight:600;">'+esc(v.vergiAdi)+'</td>';
                h += '<td style="text-align:right;font-weight:700;">'+tmTl(v.tutar)+'</td>';
                h += '<td style="font-size:11px;">'+(v.odemeTarihi?tarihStr(v.odemeTarihi):"-")+'</td>';
                h += '<td style="font-size:11px;">'+(v.donem||"-")+'</td>';
                h += '<td style="font-size:11px;color:var(--text-light);">'+esc(v.aciklama||"")+'</td>';
                h += '<td><button class="ft-btn-sm ft-btn-edit" onclick="ftOdenenVergiFormAc('+v.id+')">✏️</button> <button class="ft-btn-sm ft-btn-del" onclick="ftOdenenVergiSil('+v.id+')">🗑️</button></td></tr>';
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
            if (!donemler.length) { konteyner.innerHTML = tmEmptyStateHTML('📊','Henüz KDV verisi bulunmamaktadır.','KDV verisi eklemek için formu kullanın.'); return; }
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
                '<button class="btn btn-save-green" title="Tür Ekle" onclick="yeniVergiTuruEklePrompt()" style="min-width:36px;height:42px;font-size:18px;line-height:1;">➕</button>' +
                '<button class="btn btn-danger btn-sm" title="Tür Sil" onclick="vergiTuruSilPrompt()" style="min-width:36px;height:42px;font-size:18px;line-height:1;">➖</button></div></div>' +
                '<div style="flex:2;min-width:150px;text-align:center;"><label style="display:block;text-align:center;width:100%;">Açıklama</label><input type="text" id="ftTakvimAciklama" value="'+(e?e.aciklama:'')+'" style="width:100%;padding:10px;box-sizing:border-box;text-align:center;"></div>' +
                '</div>' +
                '<div style="display:flex;gap:8px;justify-content:center;padding-top:6px;">' +
                '<button class="btn-form btn-form-save" onclick="'+fn+'" style="padding:8px 20px;font-size:13px;">💾 '+(isEdit?"Güncelle":"Ekle")+'</button>' +
                '<button class="btn-form btn-form-cancel" onclick="document.getElementById(\'ftTakvimForm\').style.display=\'none\'" style="padding:8px 20px;font-size:13px;">✕ İptal</button></div></div>';
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
            if (!liste.length) { konteyner.innerHTML = tmEmptyStateHTML('📅','Henüz vergi etkinliği bulunmamaktadır.','Vergi takvimine yeni bir etkinlik ekleyin.'); return; }
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
                h += '<button class="ft-btn-sm ft-btn-edit" onclick="ftTakvimFormAc('+e.id+')">✏️</button>';
                h += '<button class="ft-btn-sm ft-btn-del" onclick="ftTakvimSil('+e.id+')">🗑️</button></div>';
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
            h += '<div style="flex:1;border:1px solid #ddd;padding:12px;text-align:center;border-radius:6px;"><div style="font-size:11px;color:#555;font-weight:600;">Gelen Fatura</div><div style="font-size:18px;font-weight:700;color:#1565C0;">'+gelen.length+' adet</div><div style="font-size:13px;">'+gTT.toLocaleString("tr-TR",{minFractionDigits:2})+' ₺</div></div>';
            h += '<div style="flex:1;border:1px solid #ddd;padding:12px;text-align:center;border-radius:6px;"><div style="font-size:11px;color:#555;font-weight:600;">Giden Fatura</div><div style="font-size:18px;font-weight:700;color:#1565C0;">'+giden.length+' adet</div><div style="font-size:13px;">'+g2T.toLocaleString("tr-TR",{minFractionDigits:2})+' ₺</div></div>';
            h += '<div style="flex:1;border:1px solid #ddd;padding:12px;text-align:center;border-radius:6px;"><div style="font-size:11px;color:#555;font-weight:600;">KDV Ödenecek</div><div style="font-size:18px;font-weight:700;color:#c62828;">'+(gk2T>gkT?(gk2T-gkT).toLocaleString("tr-TR",{minFractionDigits:2}):"0,00")+' ₺</div></div>';
            h += '<div style="flex:1;border:1px solid #ddd;padding:12px;text-align:center;border-radius:6px;"><div style="font-size:11px;color:#555;font-weight:600;">KDV Alacak</div><div style="font-size:18px;font-weight:700;color:#2e7d32;">'+(gkT>gk2T?(gkT-gk2T).toLocaleString("tr-TR",{minFractionDigits:2}):"0,00")+' ₺</div></div></div>';

            h += '<h3 style="font-size:14px;margin-bottom:8px;">📥 Gelen Faturalar</h3>';
            if (gelen.length) { h += '<table style="width:100%;border-collapse:collapse;margin-bottom:25px;"><thead><tr style="background:#f5f5f5;"><th style="padding:8px;border:1px solid #ddd;text-align:left;font-size:11px;">Firma</th><th style="padding:8px;border:1px solid #ddd;text-align:left;font-size:11px;">Fatura No</th><th style="padding:8px;border:1px solid #ddd;text-align:left;font-size:11px;">Tarih</th><th style="padding:8px;border:1px solid #ddd;text-align:right;font-size:11px;">Tutar</th><th style="padding:8px;border:1px solid #ddd;text-align:right;font-size:11px;">KDV</th><th style="padding:8px;border:1px solid #ddd;text-align:right;font-size:11px;">Toplam</th><th style="padding:8px;border:1px solid #ddd;text-align:left;font-size:11px;">Durum</th></tr></thead><tbody>'; gelen.slice().reverse().forEach(function(f){h+=satir(f,"gelen");}); h += '</tbody></table>'; }
            else h += '<div style="padding:16px;">'+tmEmptyStateHTML('📥','Gelen fatura bulunmamaktadır.','','')+'</div>';

            h += '<h3 style="font-size:14px;margin-bottom:8px;">📤 Giden Faturalar</h3>';
            if (giden.length) { h += '<table style="width:100%;border-collapse:collapse;margin-bottom:25px;"><thead><tr style="background:#f5f5f5;"><th style="padding:8px;border:1px solid #ddd;text-align:left;font-size:11px;">Firma</th><th style="padding:8px;border:1px solid #ddd;text-align:left;font-size:11px;">Fatura No</th><th style="padding:8px;border:1px solid #ddd;text-align:left;font-size:11px;">Tarih</th><th style="padding:8px;border:1px solid #ddd;text-align:right;font-size:11px;">Tutar</th><th style="padding:8px;border:1px solid #ddd;text-align:right;font-size:11px;">KDV</th><th style="padding:8px;border:1px solid #ddd;text-align:right;font-size:11px;">Toplam</th><th style="padding:8px;border:1px solid #ddd;text-align:left;font-size:11px;">Durum</th></tr></thead><tbody>'; giden.slice().reverse().forEach(function(f){h+=satir(f,"giden");}); h += '</tbody></table>'; }
            else h += '<div style="padding:16px;">'+tmEmptyStateHTML('📤','Giden fatura bulunmamaktadır.','','')+'</div>';

            if (etk.length) {
                h += '<h3 style="font-size:14px;margin-bottom:8px;">📅 Vergi Takvimi</h3><table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#f5f5f5;"><th style="padding:8px;border:1px solid #ddd;text-align:left;font-size:11px;">Tarih</th><th style="padding:8px;border:1px solid #ddd;text-align:left;font-size:11px;">Başlık</th><th style="padding:8px;border:1px solid #ddd;text-align:left;font-size:11px;">Tür</th><th style="padding:8px;border:1px solid #ddd;text-align:left;font-size:11px;">Durum</th></tr></thead><tbody>';
                etk.slice().reverse().forEach(function(e) {
                    var ta = e.tur==="kdv"?"KDV":e.tur==="gelirVergisi"?"Gelir Vergisi":e.tur==="kurumlarVergisi"?"Kurumlar Vergisi":e.tur==="stopaj"?"Stopaj":e.tur==="damgaVergisi"?"Damga Vergisi":"Diğer";
                    h += '<tr><td style="padding:8px;border:1px solid #ddd;">'+(e.tarih?tarihStr(e.tarih):"-")+'</td><td style="padding:8px;border:1px solid #ddd;">'+esc(e.baslik)+'</td><td style="padding:8px;border:1px solid #ddd;">'+ta+'</td><td style="padding:8px;border:1px solid #ddd;">'+(e.tamamlandi?"✅ Tamamlandı":"⏳ Bekliyor")+'</td></tr>';
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
            return sort.dir === "asc" ? " ▲" : " ▼";
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
            if (!liste.length) { konteyner.innerHTML = tmEmptyStateHTML('📂','Bu bölümde aktif iş bulunmamaktadır.','Farklı bir sekme seçin veya yeni bir iş ekleyin.'); return; }
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
                    '<td style="text-align:center;"><span class="it-expand-icon" id="itExpandIcon_' + is.id + '" style="font-size:10px;color:var(--text-light);user-select:none;">' + (acik ? '▼' : '▶') + '</span></td>' +
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
                    (isTam && is.tur === "Uygulama Proje" && !is.ruhsatOnayi ? '<button class="it-btn-ruhsat" onclick="event.stopPropagation();itRuhsatOnayiVer(' + is.id + ')">📜 RUHSAT ONAYI ALINDI</button>' : '') +
                    (isTam && is.tur === "Uygulama Proje" && is.ruhsatOnayi ? '<span class="it-ruhsat-badge">📜 RUHSAT ONAYI ALINDI</span>' : '') +
                    (isTam && is.tahsilatOnayi && is.tur !== "Taslak" ? '<span class="it-tahsilat-badge">✅ İŞİN TAHSİLATI ONAYLANDI</span>' : '') +
                    (isTam && !is.tahsilatOnayi && is.tur !== "Taslak" && is.tur !== "Uygulama Proje" ? '<button class="it-btn-tahsilat" onclick="event.stopPropagation();itTahsilatOnayiVer(' + is.id + ')">✅ TAHSİLAT ONAYI VER</button>' : '') +
                    (isTam && !is.tahsilatOnayi && is.tur === "Uygulama Proje" ? '<button class="it-btn-tahsilat" onclick="event.stopPropagation();itTahsilatOnayiVer(' + is.id + ')">✅ TAHSİLAT ONAYI VER</button>' : '') +
                    (isTam && (is.tur === "Taslak" || (is.tahsilatOnayi && (is.tur !== "Uygulama Proje" || is.ruhsatOnayi))) ? '<button class="it-btn-tamamla" onclick="event.stopPropagation();itTamamla(' + is.id + ')">✅ İŞ TAMAMLANDI</button>' : '') +
                    '<button class="it-btn-sil" onclick="event.stopPropagation();itSil(' + is.id + ')" style="margin-left:auto;">🗑️ Sil</button>' +
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
            if (!liste.length) { konteyner.innerHTML = tmEmptyStateHTML('✅','Bu bölümde tamamlanan iş bulunmamaktadır.','Tamamlanan iş kayıtları burada görüntülenecek.'); return; }
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
                    '<td style="width:28px;text-align:center;"><span class="it-expand-icon" id="itTamExpandIcon_' + is.id + '">' + (acik ? '▼' : '▶') + '</span></td>' +
                    '<td style="text-align:center;font-weight:700;color:var(--text-light);font-size:12px;">' + sira + '</td>' +
                    '<td style="font-weight:600;">' + esc(is.isAdi || "İSİMSİZ") + '</td>' +
                    '<td>' + esc(is.firma || "-") + '</td>' +
                    '<td>' + esc(is.pafta || is.ada || is.parsel ? [is.pafta, is.ada, is.parsel].filter(Boolean).join("/") : "-") + '</td>' +
                    '<td>' + (is.tarih ? tarihStr(is.tarih) : "-") + '</td>' +
                    '<td>' + (is.bitisTarihi ? tarihStr(is.bitisTarihi) : "-") + '</td>' +
                    (showActionCol ? '<td style="text-align:center;"><div style="display:flex;gap:4px;justify-content:center;">' +
                        (isTaslak ? '<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();itTaslakUygulamayaGec(' + is.id + ')" style="white-space:nowrap;">🚀 UYGULAMA PROJEYE BAŞLA</button>' : '') +
                        '<button class="btn btn-sm" onclick="event.stopPropagation();it3bModellemeyeGec(' + is.id + ')" style="background:#d68910;color:white;border:none;white-space:nowrap;border-radius:6px;">🔷 3B MODELLEMEYE BAŞLA</button>' +
                        '</div></td>' : '') +
                    '</tr>' +
                    '<tr class="it-row-detail' + (acik ? ' open' : '') + '" id="itTamDetayRow_' + is.id + '">' +
                    '<td colspan="' + colSpan + '"><div class="it-detay-panel">' +
                    itOrtakSecimHtml(is.id, true) +
                    '<div class="it-detay-actions">' +
                    '<button class="it-btn-sil" onclick="event.stopPropagation();itSil(' + is.id + ')">🗑️ Sil</button>' +
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
                btn.textContent = "📋 Liste";
                kartlar.style.display = "none";
                gantt.style.display = "block";
                itGanttGoster();
            } else {
                btn.textContent = "📊 Gantt";
                kartlar.style.display = "";
                gantt.style.display = "none";
            }
        }
        function itGanttGoster() {
            var konteyner = document.getElementById("itGanttContainer");
            var liste = itDbYukle().filter(function(x){return !x.tamamlandi;});
            if (!liste.length) { konteyner.innerHTML = '<div class="it-gantt-notice"><div style="font-size:32px;margin-bottom:6px;">📊</div>Gantt şeması gösterilecek aktif iş bulunmamaktadır.<p>Yeni iş ekleyerek başlayın.</p></div>'; return; }
            var aylar = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
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
            if (totalMonths < 3) { maxD.setMonth(maxD.getMonth() + 3); totalMonths = (maxD.getFullYear() - minD.getFullYear()) * 12 + (maxD.getMonth() - minD.getMonth()); }
            if (totalMonths > 36) { maxD.setMonth(minD.getMonth() + 36); totalMonths = 36; }
            var totalDays = (maxD - minD) / (1000*60*60*24);
            var today = new Date();
            today.setHours(0,0,0,0);
            var h = '<div class="it-gantt-wrap"><table class="it-gantt-table"><thead><tr><th style="width:180px;text-align:left;padding:6px 10px;">İş Adı</th>';
            for (var m = 0; m < totalMonths; m++) {
                var dt = new Date(minD); dt.setMonth(dt.getMonth() + m);
                h += '<th style="width:' + (100/totalMonths) + '%"><span class="it-gantt-month-label">' + aylar[dt.getMonth()] + ' ' + dt.getFullYear() + '</span></th>';
            }
            h += '</tr></thead><tbody>';
            liste.forEach(function(is){
                var startDate = new Date(is.tarih || Date.now());
                var endDate = is.bitisTarihi ? new Date(is.bitisTarihi) : new Date();
                if (endDate < startDate) endDate = new Date(startDate.getTime() + 30*24*60*60*1000);
                startDate.setHours(0,0,0,0); endDate.setHours(0,0,0,0);
                var leftDays = (startDate - minD) / (1000*60*60*24);
                var spanDays = (endDate - startDate) / (1000*60*60*24);
                if (spanDays < 7) spanDays = 7;
                var leftPct = (leftDays / totalDays) * 100;
                var widthPct = (spanDays / totalDays) * 100;
                if (leftPct < 0) { widthPct += leftPct; leftPct = 0; }
                if (widthPct > 100 - leftPct) widthPct = 100 - leftPct;
                if (widthPct < 2) widthPct = 2;
                var avgPct = itJobOrtalamaPct(is);
                var durum = itJobDurumMetni(is);
                var turKisaltma = is.tur === "Uygulama Proje" ? "UygulamaProje" : (is.tur === "3B Modelleme ve Tasarım" ? "3B" : is.tur);
                var firmaBilgi = (is.firma || "").toUpperCase();
                h += '<tr><td class="it-gantt-job-cell">' + esc(is.isAdi || "İSİMSİZ") + '<span class="it-gantt-meta">' + esc(firmaBilgi || "-") + ' <span class="it-gantt-tur-tag it-gantt-tur-' + turKisaltma + '">' + esc(is.tur) + '</span></span></td>';
                h += '<td colspan="' + totalMonths + '" style="position:relative;padding:0;">';
                h += '<div class="it-gantt-bar-wrap">';
                h += '<div class="it-gantt-bar" style="left:' + leftPct + '%;width:' + widthPct + '%;background:' + durum.bg + ';" title="' + esc(is.isAdi) + ' - ' + durum.text + ' (' + avgPct + '%)">';
                if (avgPct > 0 && avgPct < 100) {
                    var donePct = Math.min(avgPct, 100);
                    h += '<div class="it-gantt-bar-seg" style="width:' + donePct + '%;background:rgba(255,255,255,0.2);"></div>';
                }
                h += '<div class="it-gantt-bar-label' + (widthPct < 8 ? ' overflow' : '') + '">' + durum.text + ' ' + avgPct + '%</div>';
                h += '</div>';
                (is.ortaklar||[]).forEach(function(o, oi){
                    if (o.projeTeslimTarihi) {
                        var msDate = new Date(o.projeTeslimTarihi);
                        msDate.setHours(0,0,0,0);
                        var msLeft = (msDate - minD) / (1000*60*60*24);
                        var msPct = (msLeft / totalDays) * 100;
                        if (msPct >= 0 && msPct <= 100) {
                            h += '<div class="it-gantt-milestone it-gantt-milestone-complete" style="left:' + msPct + '%;" title="Teslim: ' + esc(o.ortakAdi || "") + ' (' + tarihStr(o.projeTeslimTarihi) + ')"></div>';
                        }
                    }
                });
                h += '</div></td></tr>';
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
                if (aktifIcon) aktifIcon.innerText = aktifRow.classList.contains("open") ? "▼" : "▶";
            }
            if (tamRow) {
                tamRow.classList.toggle("open");
                if (tamIcon) tamIcon.innerText = tamRow.classList.contains("open") ? "▼" : "▶";
            }
        }

        function itBolumToggle(id) {
            var bolum = document.getElementById(id);
            if (!bolum) return;
            bolum.classList.toggle("it-bolum-kapali");
            var ok = document.getElementById(id + "Ok");
            if (ok) ok.innerText = bolum.classList.contains("it-bolum-kapali") ? "▶" : "▼";
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
                    if (icon) icon.innerText = '▼';
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
                h += '<span class="it-ortak-card-toggle-icon" id="itOrtakToggleIcon_' + jobId + '_' + i + '">▶</span>';
                h += '<span onclick="event.stopPropagation();itOrtakKaldir(' + jobId + ',' + i + ')" style="cursor:pointer;color:#e53935;font-weight:700;font-size:16px;">✕</span>';
                h += '</span></div>';
                h += '<div class="it-ortak-card-body closed" id="itOrtakBody_' + jobId + '_' + i + '">';
                h += '<div class="it-asama-bar-container"><div class="it-asama-bar-title">📊 İşin Tamamlanma Durumu</div><div class="it-asama-bar-track"><div class="it-asama-bar-fill" id="itOrtakBar_' + jobId + '_' + i + '" style="width:' + pct + '%;background:linear-gradient(90deg,#e53935,' + (isTaslak ? '#2e7d32' : '#f9a825,#4caf50') + ');"></div><span class="it-asama-bar-text" id="itOrtakBarText_' + jobId + '_' + i + '">' + pct + '%</span></div></div>';
                h += '<div class="it-asama-steps">';
                var nextAc = true;
                ASAMA_LIST.forEach(function(a, ai){
                    var completed = !!o[a.field];
                    var isNext = nextAc && !completed;
                    if (isNext) nextAc = false;
                    var segClass = completed ? 'completed' : (isNext ? 'next' : 'pending');
                    var bgColor = completed ? ASAMA_RENKLER[ai] : (isNext ? ASAMA_RENKLER[ai] : '');
                    var displayDate = o[a.field] ? tarihStr(o[a.field]) : '-';
                    h += '<div class="it-asama-step"><button class="it-asama-segment ' + segClass + '" style="' + (bgColor ? 'background:' + bgColor + ';' : '') + '" id="itAsamaBtn_' + jobId + '_' + i + '_' + a.field + '" onclick="event.stopPropagation();itAsamaToggle(' + jobId + ',' + i + ',\'' + a.field + '\')"><span class="it-asama-seg-label">' + (completed ? '✓ ' : '') + a.label + '</span><span class="it-asama-seg-date" id="itAsamaTarih_' + jobId + '_' + i + '_' + a.field + '">' + displayDate + '</span></button></div>';
                });
                h += '</div>';
                h += '<div class="it-asama-row" style="margin-top:4px;border-bottom:none;flex-direction:column;align-items:stretch;">';
                var notlar = Array.isArray(o.not) ? o.not : [];
                h += '<div class="it-not-list" id="itNotList_' + jobId + '_' + i + '">';
                notlar.forEach(function(n, ni){
                    h += '<div class="it-not-item" id="itNotItem_' + jobId + '_' + i + '_' + ni + '">';
                    h += '<span class="it-not-text" id="itNotText_' + jobId + '_' + i + '_' + ni + '">' + esc(n.text||'') + '</span>';
                    h += '<span class="it-not-duzenle" id="itNotDuzenle_' + jobId + '_' + i + '_' + ni + '" onclick="event.stopPropagation();itOrtakNotDuzenleBaslat(' + jobId + ',' + i + ',' + ni + ')">✏️</span>';
                    h += '<span class="it-not-sil" onclick="event.stopPropagation();itOrtakNotSil(' + jobId + ',' + i + ',' + ni + ')">✕</span>';
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
                h += '<span id="itOrtakEkleIcon_' + jobId + '" style="font-size:10px;">▶</span> ➕ YENİ İŞ ORTAĞI EKLE</div>';
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
                h += '<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();itOrtakEkleDetay(' + jobId + ')" style="white-space:nowrap;height:32px;">➕ EKLE</button>';
                h += '</div></div></div>';
            }
            var jobNot = (job.not||"").trim();
            h += '<div class="it-not-panel' + (jobNot ? ' has-not' : '') + '" onclick="event.stopPropagation();itNotPopupAc(' + jobId + ')">';
            h += '<div>📌 NOTLAR' + (jobNot ? ' <span style="font-size:10px;color:#1565C0;">✓</span>' : '') + '</div>';
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
                if (icon) icon.innerText = '▼';
            });
        }

        function itOrtakEkleToggle(jobId) {
            var body = document.getElementById("itOrtakEkleBody_" + jobId);
            var icon = document.getElementById("itOrtakEkleIcon_" + jobId);
            if (!body) return;
            var shown = body.style.display !== 'none';
            body.style.display = shown ? 'none' : 'block';
            if (icon) icon.innerText = shown ? '▶' : '▼';
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
            if (icon) icon.innerText = body.classList.contains("closed") ? "▶" : "▼";
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
                if (label) label.innerText = (completed ? '✓ ' : '') + a.label;
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
                    btn.onclick = function(e) { e.stopPropagation(); itTamamla(jobId); }; btn.innerText = '✅ İŞ TAMAMLANDI';
                    if (silBtn) actionsDiv.insertBefore(btn, silBtn); else actionsDiv.appendChild(btn);
                } else if (isTam2 && is_.tur === "Uygulama Proje") {
                    if (!is_.ruhsatOnayi) {
                        var rBtn = document.createElement('button'); rBtn.className = 'it-btn-ruhsat';
                        rBtn.onclick = function(e) { e.stopPropagation(); itRuhsatOnayiVer(jobId); }; rBtn.innerText = '📜 RUHSAT ONAYI ALINDI';
                        if (silBtn) actionsDiv.insertBefore(rBtn, silBtn); else actionsDiv.appendChild(rBtn);
                    } else {
                        var rSp = document.createElement('span'); rSp.className = 'it-ruhsat-badge'; rSp.innerText = '📜 RUHSAT ONAYI ALINDI';
                        if (silBtn) actionsDiv.insertBefore(rSp, silBtn); else actionsDiv.appendChild(rSp);
                    }
                    if (!is_.tahsilatOnayi) {
                        var tBtn = document.createElement('button'); tBtn.className = 'it-btn-tahsilat';
                        tBtn.onclick = function(e) { e.stopPropagation(); itTahsilatOnayiVer(jobId); }; tBtn.innerText = '✅ TAHSİLAT ONAYI VER';
                        if (silBtn) actionsDiv.insertBefore(tBtn, silBtn); else actionsDiv.appendChild(tBtn);
                    } else {
                        var tSp = document.createElement('span'); tSp.className = 'it-tahsilat-badge'; tSp.innerText = '✅ İŞİN TAHSİLATI ONAYLANDI';
                        if (silBtn) actionsDiv.insertBefore(tSp, silBtn); else actionsDiv.appendChild(tSp);
                    }
                    if (is_.ruhsatOnayi && is_.tahsilatOnayi) {
                        var btn = document.createElement('button'); btn.className = 'it-btn-tamamla'; btn.style.background = '#2e7d32';
                        btn.onclick = function(e) { e.stopPropagation(); itTamamla(jobId); }; btn.innerText = '✅ İŞ TAMAMLANDI';
                        if (silBtn) actionsDiv.insertBefore(btn, silBtn); else actionsDiv.appendChild(btn);
                    }
                } else if (isTam2 && is_.tahsilatOnayi) {
                    var sp = document.createElement('span'); sp.className = 'it-tahsilat-badge'; sp.innerText = '✅ İŞİN TAHSİLATI ONAYLANDI';
                    if (silBtn) actionsDiv.insertBefore(sp, silBtn); else actionsDiv.appendChild(sp);
                    var btn = document.createElement('button'); btn.className = 'it-btn-tamamla'; btn.style.background = '#2e7d32';
                    btn.onclick = function(e) { e.stopPropagation(); itTamamla(jobId); }; btn.innerText = '✅ İŞ TAMAMLANDI';
                    if (silBtn) actionsDiv.insertBefore(btn, silBtn); else actionsDiv.appendChild(btn);
                } else if (isTam2 && !is_.tahsilatOnayi) {
                    var btn2 = document.createElement('button'); btn2.className = 'it-btn-tahsilat';
                    btn2.onclick = function(e) { e.stopPropagation(); itTahsilatOnayiVer(jobId); }; btn2.innerText = '✅ TAHSİLAT ONAYI VER';
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
                duzenle.textContent = '✏️';
                duzenle.onclick = function(e){ e.stopPropagation(); itOrtakNotDuzenleBaslat(jobId, oIdx, ni); };
                var sil = document.createElement('span');
                sil.className = 'it-not-sil';
                sil.textContent = '✕';
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
            document.getElementById("itFormTitle").innerText = data ? "✏️ İŞ DÜZENLE" : "➕ YENİ İŞ EKLE";

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
                if (div) div.innerHTML = '📌 NOTLAR' + (hasNot ? ' <span style="font-size:10px;color:#1565C0;">✓</span>' : '');
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
            tmNotify("📜 Ruhsat onayı alındı.", "success");
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
            tmNotify("✅ Tahsilat onayı verildi.", "success");
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
                p = p.then(function() { return ekle(sayfalar[0], true, true); });
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
                return dlkSortColumn === column ? (dlkSortDir === "asc" ? " ▲" : " ▼") : "";
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
                    '<button class="btn-warning" onclick="dlkPdfGoster(\'kayit\',' + d.id + ')" style="padding:4px 8px;font-size:11px;">📄 PDF</button> ' +
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
