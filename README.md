# BeshBarber - Premium Booking System

Piattaforma di prenotazioni per barbieri con autenticazione Supabase e sicurezza RLS.

## 🎯 Caratteristiche

- ✂️ Due ruoli: Cliente + Barbiere
- 📅 Sistema prenotazioni slot 30 min
- 🔐 Autenticazione email/password + password recovery
- 📱 Responsive design (mobile/tablet/desktop)
- 🎨 Dark theme premium


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
