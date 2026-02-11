# BeshBarber - Premium Booking System

Una moderna piattaforma di prenotazioni per barbieri, costruita con HTML5, CSS3, JavaScript vanilla e Supabase.

## 🎯 Caratteristiche

- ✂️ **Autenticazione a due ruoli**: Cliente (per prenotare) e Barbiere (per gestire)
- 📅 **Sistema di prenotazioni**: Slot da 30 minuti con gestione automatica
- 🔐 **Sicurezza**: Autenticazione via Supabase, password reset
- 📱 **Responsive design**: Perfetto su mobile, tablet e desktop
- 🎨 **Design moderno**: Interfaccia premium con gradiente dorato

## 🚀 Setup

### Prerequisiti
- Browser moderno (Chrome, Firefox, Safari, Edge)
- Account Supabase

### Installazione

1. **Clona il repository**
```bash
git clone https://github.com/tuonome/beshbarber.git
cd beshbarber
```

2. **Configura Supabase**
   - Crea un progetto su [supabase.com](https://supabase.com)
   - Copia l'URL e la Anon Key dal dashboard
   - Aggiorna `js/supabaseClient.js`:

```javascript
const SUPABASE_URL = "tuo_url_qui";
const SUPABASE_ANON_KEY = "tua_key_qui";
```

3. **Setup del database**
   - Vai su SQL Editor in Supabase
   - Crea le tabelle necessarie:

```sql
-- Tabella Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabella Availability (per barbieri)
CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES auth.users(id),
  day DATE,
  start_time TIME,
  end_time TIME,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabella Bookings (prenotazioni clienti)
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id),
  barber_id UUID REFERENCES auth.users(id),
  day DATE,
  start_time TIME,
  end_time TIME,
  note TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

4. **Avvia il server locale**
   - Su Windows: `python -m http.server 8000`
   - Su Mac/Linux: `python3 -m http.server 8000`
   - Apri `http://localhost:8000` nel browser

## 📖 Struttura del Progetto

```
├── index.html           # Landing (in futuro)
├── login.html           # Login cliente
├── barber-login.html    # Login barbiere
├── app.html             # Dashboard cliente
├── barber.html          # Dashboard barbiere
├── forgot-password.html # Recupero password
├── reset-password.html  # Reset password
├── css/
│   └── style.css        # Stili globali
├── js/
│   ├── auth.js          # Funzioni autenticazione
│   ├── customer.js      # Logica cliente
│   ├── barber.js        # Logica barbiere
│   └── supabaseClient.js# Configurazione Supabase
├── img/
│   └── Logo.png         # Logo BeshBarber
└── README.md
```

## 🔑 Flusso di Autenticazione

### Cliente
1. `login.html` → Signup/Login
2. `app.html` → Prenota slot disponibili
3. Barbiere accetta/rifiuta prenotazione

### Barbiere
1. `barber-login.html` → Signup/Login
2. `barber.html` → Gestisci disponibilità e prenotazioni
3. Visualizza richieste pending e accetta/rifiuta

## 🛠️ Tecnologie Utilizzate

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: [Supabase](https://supabase.com) (PostgreSQL + Auth)
- **Styling**: CSS Grid, Flexbox, Gradenti
- **Font**: Inter (Google Fonts)

## 🔐 Variabili di Ambiente

Crea un file `.env` (o .env.local) se usi un build tool:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
```

⚠️ **Non committare mai le chiavi Supabase nel repository!** Usa `.gitignore`

## 📱 Testing

### Test Desktop
- Apri due browser: uno per cliente, uno per barbiere
- Simula il flusso di prenotazione

### Test Mobile
- Usa Chrome DevTools: F12 → Toggle device toolbar
- Verifica responsive su iPhone, Android

## 🐛 Troubleshooting

**"Not authenticated" loop?**
- Verifica che le chiavi Supabase siano corrette in `supabaseClient.js`
- Controlla che la tabella `profiles` esista e abbia role column

**Email di reset non arriva?**
- Abilita SMTP in Supabase → Authentication → Email Templates
- Verifica indirizzo email di test nel dashboard

**Slot non appaiono?**
- Verifica che il barbiere abbia aggiunto disponibilità per quella data
- Controlla lo stato `is_active` nella tabella `availability`

## 📧 Contatti

Per supporto o feature requests: [il tuo email qui]

## 📄 Licenza

Progetto interno - By JB® 2025

---

**Nota**: Questo progetto è in fase di sviluppo. Per hostare in produzione:
1. Usa un reverse proxy (Nginx/Apache)
2. Abilita HTTPS
3. Configura CORS in Supabase
4. Setup backup database regolari
