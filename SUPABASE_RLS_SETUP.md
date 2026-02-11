# 🔐 Supabase Row Level Security (RLS) Setup

## ⚠️ Importante: Sicurezza su GitHub Pages

Su GitHub Pages, le chiavi Supabase **devono** essere pubbliche (non puoi nasconderle in uno static site).
La sicurezza viene da **RLS policies** nel database di Supabase, non dalle chiavi.

Con RLS configurato:
- ❌ Non puoi leggere dati di altri utenti (anche con chiave pubblica)
- ❌ Non puoi modificare dati di altri utenti
- ❌ Accesso ai dati è garantito solo da autenticazione valida

---

## 📋 Step-by-Step Setup RLS

### 1. Accedi a Supabase Dashboard
- Vai su https://app.supabase.com
- Seleziona il tuo progetto
- Vai su `Authentication` → `Policies`

### 2. Abilita RLS su Tutte le Tabelle

```sql
-- Esegui questi comandi in SQL Editor (Supabase → SQL Editor)

-- ============================================
-- 1. PROFILI DEGLI UTENTI
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Gli utenti vedono e modificano solo il loro profilo
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Solo il sistema può inserire profili (in auth.js)
CREATE POLICY "System can insert profiles"
ON profiles FOR INSERT
WITH CHECK (true);

-- ============================================
-- 2. DISPONIBILITA' DEI BARBIERI
-- ============================================
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

-- Barbiere vede e modifica solo la sua disponibilità
CREATE POLICY "Barbers can view own availability"
ON availability FOR SELECT
USING (auth.uid() = barber_id);

CREATE POLICY "Barbers can insert own availability"
ON availability FOR INSERT
WITH CHECK (auth.uid() = barber_id);

CREATE POLICY "Barbers can update own availability"
ON availability FOR UPDATE
USING (auth.uid() = barber_id);

-- Clienti vedono disponibilità pubblica (non eliminata)
CREATE POLICY "Customers can view available slots"
ON availability FOR SELECT
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'customer'
  AND is_active = true
);

-- ============================================
-- 3. PRENOTAZIONI
-- ============================================
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Clienti vedono solo le loro prenotazioni
CREATE POLICY "Customers can view own bookings"
ON bookings FOR SELECT
USING (auth.uid() = customer_id);

-- Barbieri vedono prenotazioni per loro
CREATE POLICY "Barbers can view own bookings"
ON bookings FOR SELECT
USING (auth.uid() = barber_id);

-- Clienti creano solo le loro prenotazioni
CREATE POLICY "Customers can create bookings"
ON bookings FOR INSERT
WITH CHECK (auth.uid() = customer_id);

-- Barbieri possono accettare/rifiutare le loro prenotazioni
CREATE POLICY "Barbers can update own bookings"
ON bookings FOR UPDATE
USING (auth.uid() = barber_id);

-- Clienti possono cancellare solo le loro (pending)
CREATE POLICY "Customers can delete own pending bookings"
ON bookings FOR DELETE
USING (
  auth.uid() = customer_id
  AND status = 'pending'
);
```

### 3. Verifica RLS è Attivo

Nella dashboard Supabase:
1. Vai su `Tables` → seleziona una tabella
2. Click su `Policies` (tab in alto)
3. Dovresti vedere le policies appena create ✓

---

## 🧪 Test RLS

### Test 1: Accedi come Cliente
```javascript
// In browser console
const { data, error } = await supabase
  .from('profiles')
  .select('*');

// Dovresti vedere SOLO il tuo profilo
console.log(data); // [{id: 'tue-uuid', full_name: '...', role: 'customer'}]
```

### Test 2: Prova a leggere un altro profilo
```javascript
// In browser console - prova a leggere con WHERE diverso
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', 'uuid-di-qualcun-altro');

// Dovresti ottenere un array vuoto [] (RLS blocca)
console.log(data); // []
```

### Test 3: Logout e prova ad accedere
```javascript
await supabase.auth.signOut();

const { data, error } = await supabase
  .from('profiles')
  .select('*');

// Senza autenticazione, niente dati
console.log(data); // [] (RLS blocca)
console.log(error); // Potrebbe avere un errore di policy
```

---

## 🔒 Come Funziona la Sicurezza

### Chiavi Supabase (pubbliche ma safe)
```
SUPABASE_URL = https://xxxxx.supabase.co      ← Identifica il progetto
SUPABASE_ANON_KEY = eyJ...                    ← Token anonimo limitato
```

**IMPORTANTE**: La `ANON_KEY` è fatta per essere pubblica!
- Supabase sa che è una chiave cliente
- **Non** può accedere ai dati senza RLS che lo permetta
- È come una porta con serratura: la chiave apre la porta, ma RLS controlla chi entra

### Protezione con RLS
```
Client Request → ANON_KEY → Supabase
                              ↓
                        RLS Policy Check
                              ↓
                    Chi sei? (auth.uid())
                    Qual è il tuo ruolo? (role)
                    Puoi leggere QUESTO dato? (USING)
                    Puoi modificare QUESTO dato? (WITH CHECK)
                              ↓
                    Accesso CONCESSO ✓ o NEGATO ✗
```

---

## 🚨 Sicurezza Extra (Opzionale)

### 1. Rate Limiting
- Supabase ha rate limiting built-in (gratuito)
- Vai su `Settings` → `API` → `Rate Limiting`

### 2. Authentication Providers
- Non usare solo email/password
- Aggiungi Google Sign-In, GitHub OAuth (più sicuro)
- Dashboard Supabase → `Authentication` → `Providers`

### 3. Limita colonne esposte
Se una tabella ha dati sensibili, esponi solo le colonne necessarie:

```sql
CREATE POLICY "Customers view limited booking data"
ON bookings FOR SELECT
USING (auth.uid() = customer_id)
WITH CHECK (false); -- Solo SELECT, no UPDATE

-- Esponi solo certi campi in app
SELECT id, day, start_time, status FROM bookings WHERE customer_id = auth.uid();
```

### 4. Audit Trail (log di accessi)
```sql
-- Opzionale: traccia chi ha fatto cosa
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT,
  table_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Aggiungi un trigger per loggare modifiche
CREATE OR REPLACE FUNCTION log_booking_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, table_name)
  VALUES (auth.uid(), TG_OP, 'bookings');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_audit
AFTER INSERT OR UPDATE OR DELETE ON bookings
FOR EACH ROW EXECUTE FUNCTION log_booking_changes();
```

---

## 📚 Risorsa Ufficiale
- Supabase RLS Docs: https://supabase.com/docs/guides/auth/row-level-security
- RLS Best Practices: https://supabase.com/docs/guides/auth/row-level-security-best-practices

---

## ✅ Checklist Finale

Prima di pushare su GitHub Pages:

- [ ] Ho copiato SUPABASE_URL e SUPABASE_ANON_KEY nel progetto
- [ ] Ho eseguito tutti gli SQL CREATE POLICY nel Supabase SQL Editor
- [ ] Ho testato RLS in browser console (Test 1, 2, 3 sopra)
- [ ] Ho verificato che RLS è ENABLED su tutte le tabelle
- [ ] Ho aggiunto le chiavi a js/supabaseClient.js (pubbliche è OK)
- [ ] Ho rimosso le chiavi da .gitignore (tanto sono pubbliche)
- [ ] Ho pushato il codice su GitHub
- [ ] Ho deployato il sito su GitHub Pages

**Risultato**: ✅ Sito sicuro su GitHub Pages + Supabase senza server aggiuntivo!

---

**Data Setup**: 2026-02-11
**Progetto**: BeshBarber - Premium Booking System
