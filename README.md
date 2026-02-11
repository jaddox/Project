# BeshBarber - Premium Booking System

Piattaforma di prenotazioni per barbieri con autenticazione Supabase e sicurezza RLS.

## 🎯 Caratteristiche

- ✂️ Due ruoli: Cliente + Barbiere
- 📅 Sistema prenotazioni slot 30 min
- 🔐 Autenticazione email/password + password recovery
- 📱 Responsive design (mobile/tablet/desktop)
- 🎨 Dark theme premium

## 🚀 Quick Start (20 minuti)

### 1. Aggiorna Supabase Keys
```javascript
// Apri: js/supabaseClient.js
// Aggiorna le tue chiavi da https://app.supabase.com → Settings → API

const SUPABASE_URL = "https://xxxxx.supabase.co";
const SUPABASE_ANON_KEY = "eyJ...";
```

### 2. Setup RLS Security (IMPORTANTE!)
```bash
# Apri: SUPABASE_RLS_SETUP.md
# Copia il codice SQL
# Incolla in Supabase → SQL Editor → Esegui
# Questo protegge i dati a livello database!
```

### 3. Deploy a GitHub Pages
```bash
git add .
git commit -m "BeshBarber ready"
git push origin main
```

**Poi in GitHub:**
- Repository → Settings → Pages
- Source: `Deploy from a branch`
- Branch: `main` + `/root`
- Save

✅ Sito live in 2-5 minuti!

---

## 📁 File Struttura

```
├── login.html                    # Cliente login
├── barber-login.html             # Barbiere login
├── app.html                      # Dashboard cliente
├── barber.html                   # Dashboard barbiere
├── forgot-password.html          # Recovery password
├── reset-password.html           # Reset password
├── js/
│   ├── supabaseClient.js         # Config Supabase (UPDATE!)
│   ├── auth.js                   # Autenticazione
│   ├── customer.js               # Logica cliente
│   └── barber.js                 # Logica barbiere
├── css/
│   └── style.css                 # Stili responsive
├── img/
│   └── Logo.png                  # Logo
├── SUPABASE_RLS_SETUP.md         # Setup RLS (CRITICAL!)
├── .env.example                  # Template env
├── .gitignore                    # Git exclusions
└── README.md                     # Questo file
```

---

## 🔐 Sicurezza

Le chiavi Supabase sono **pubbliche** (ANON_KEY).
Questo è **SAFE** perché usiamo **Row Level Security (RLS)**:

- ❌ Nessuno legge dati di altri utenti
- ❌ Nessuno modifica prenotazioni altrui
- ✅ Solo dati propri sono visibili
- ✅ Senza auth = niente accesso

**CRUCIALE**: Esegui setup RLS in `SUPABASE_RLS_SETUP.md`

---

## 🎮 Come Funziona

### Cliente
1. Accedi con email/password
2. Scegli data → visualizza slot disponibili
3. Prenota (status: pending)
4. Aspetta che barbiere accetti

### Barbiere
1. Accedi con email/password
2. Crea disponibilità (date + orari)
3. Gestisci prenotazioni (accept/reject)

---

## 💻 Local Development

```bash
# Avvia server
python -m http.server 8000  # Windows
python3 -m http.server 8000 # Mac/Linux

# Apri browser
http://localhost:8000
```

---

## 💵 Costo

- GitHub Pages: Gratis
- Supabase free tier: Gratis (500MB DB, 50k users)
- **Total: $0/mese**

---

## 🔗 Link Importanti

- Supabase: https://app.supabase.com
- GitHub: https://github.com
- Sito Live: https://tuonome.github.io/beshbarber/

---

## 📖 Documentazione

- `SUPABASE_RLS_SETUP.md` - Setup RLS security ⚠️ **CRITICAL!**
- `.env.example` - Template variabili ambiente

---

## 🛠️ Tech Stack

- Frontend: HTML5 + CSS3 + JavaScript ES6
- Backend: Supabase (PostgreSQL + Auth)
- Hosting: GitHub Pages
- Security: Row Level Security (RLS)

---

**By JB® 2025 - BeshBarber Premium Booking System**
