import { supabase } from "./supabaseClient.js";

export async function addAvailability(dayISO, startHHMM, endHHMM) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");

  // Validazione: start < end
  if (startHHMM >= endHHMM) {
    throw new Error("L'ora di inizio deve essere prima di quella di fine.");
  }

  // Controlla se esiste già una fascia oraria sovrapposta per lo stesso giorno
  const { data: existing, error: checkErr } = await supabase
    .from("availability")
    .select("id, start_time, end_time")
    .eq("barber_id", user.id)
    .eq("day", dayISO);

  if (checkErr) throw checkErr;

  // Verifica sovrapposizioni
  for (const slot of existing || []) {
    const existingStart = slot.start_time.slice(0, 5);
    const existingEnd = slot.end_time.slice(0, 5);
    
    // Controlla se c'è sovrapposizione
    if (startHHMM < existingEnd && endHHMM > existingStart) {
      throw new Error(`Fascia oraria sovrapposta con ${existingStart}-${existingEnd}`);
    }
  }

  const { error } = await supabase
    .from("availability")
    .insert({
      barber_id: user.id,
      day: dayISO,
      start_time: `${startHHMM}:00`,
      end_time: `${endHHMM}:00`,
      slot_minutes: 30,
      is_active: true
    });

  if (error) throw error;
}

export async function listPendingBookings(dayISO) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");

  // Carica TUTTE le prenotazioni pending indipendentemente dal giorno
  // Ordina dalla più recente (created_at DESC) alla più lontana
  const { data, error } = await supabase
    .from("bookings")
    .select("id, day, start_time, end_time, status, note, customer_id, created_at")
    .eq("barber_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false }); // Più recente prima

  if (error) throw error;
  return data;
}

export async function setBookingStatus(bookingId, status /* accepted/rejected */, rejectionReason = "") {
  // Prima recupera i dati del booking per ottenere day, start_time, barber_id e customer_id
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("day, start_time, barber_id, customer_id")
    .eq("id", bookingId)
    .single();

  if (bookingError) throw bookingError;

  const updateData = { status };
  
  // Se è un reject, aggiungi il motivo
  if (status === "rejected" && rejectionReason) {
    updateData.rejection_reason = rejectionReason;
  }
  
  const { error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", bookingId);

  if (error) throw error;

  // Se è stato accettato, aggiungi XP al barbiere e al cliente
  if (status === "accepted") {
    // +10 XP al barbiere
    const barberXpGain = 10;
    
    const { data: barberProfile, error: barberErr } = await supabase
      .from("profiles")
      .select("current_xp, current_level")
      .eq("id", booking.barber_id)
      .single();

    if (!barberErr && barberProfile) {
      let newXP = (barberProfile.current_xp || 0) + barberXpGain;
      let newLevel = barberProfile.current_level || 1;
      const xpPerLevel = 100;

      if (newXP >= xpPerLevel) {
        newLevel += Math.floor(newXP / xpPerLevel);
        newXP = newXP % xpPerLevel;
      }

      await supabase
        .from("profiles")
        .update({ current_xp: newXP, current_level: newLevel })
        .eq("id", booking.barber_id);
    }

    // +5 XP al cliente (prenotazione accettata)
    const customerXpGain = 5;
    
    const { data: customerProfile, error: customerErr } = await supabase
      .from("profiles")
      .select("current_xp, current_level")
      .eq("id", booking.customer_id)
      .single();

    if (!customerErr && customerProfile) {
      let newXP = (customerProfile.current_xp || 0) + customerXpGain;
      let newLevel = customerProfile.current_level || 1;
      const xpPerLevel = 100;

      if (newXP >= xpPerLevel) {
        newLevel += Math.floor(newXP / xpPerLevel);
        newXP = newXP % xpPerLevel;
      }

      await supabase
        .from("profiles")
        .update({ current_xp: newXP, current_level: newLevel })
        .eq("id", booking.customer_id);
    }
  }

  // Se è stato rifiutato, rimuovi quello slot dalla disponibilità del barbiere
  if (status === "rejected") {
    // Trova la fascia di disponibilità che contiene questo orario
    const { data: availabilities, error: avError } = await supabase
      .from("availability")
      .select("id, start_time, end_time")
      .eq("barber_id", booking.barber_id)
      .eq("day", booking.day);

    if (avError) throw avError;

    // Trova l'availability che contiene questo slot
    for (const av of availabilities || []) {
      const avStart = av.start_time.slice(0, 5);
      const avEnd = av.end_time.slice(0, 5);
      const slotStart = booking.start_time.slice(0, 5);

      // Se lo slot rifiutato è all'interno di questa fascia, disattivala
      if (slotStart >= avStart && slotStart < avEnd) {
        const { error: updateError } = await supabase
          .from("availability")
          .update({ is_active: false })
          .eq("id", av.id);

        if (updateError) throw updateError;
        break;
      }
    }
  }
}

// Marcare prenotazione come completata (o no-show)
export async function completeBooking(bookingId, noShow = false) {
  const status = noShow ? "no-show" : "completed";
  
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("barber_id, customer_id")
    .eq("id", bookingId)
    .single();

  if (bookingError) throw bookingError;

  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId);

  if (error) throw error;

  // Se completato, aggiungi il taglio alle statistiche di ENTRAMBI
  if (!noShow) {
    // +1 taglio al barbiere
    const { data: barberProfile, error: barberErr } = await supabase
      .from("profiles")
      .select("total_cuts, current_xp, current_level")
      .eq("id", booking.barber_id)
      .single();

    if (!barberErr && barberProfile) {
      const newBarberCuts = (barberProfile.total_cuts || 0) + 1;
      await supabase
        .from("profiles")
        .update({ total_cuts: newBarberCuts })
        .eq("id", booking.barber_id);
    }

    // +1 taglio al cliente E +15 XP
    const { data: customerProfile, error: customerErr } = await supabase
      .from("profiles")
      .select("total_cuts, current_xp, current_level")
      .eq("id", booking.customer_id)
      .single();

    if (!customerErr && customerProfile) {
      let newCustomerCuts = (customerProfile.total_cuts || 0) + 1;
      let newXP = (customerProfile.current_xp || 0) + 15; // +15 XP al cliente
      let newLevel = customerProfile.current_level || 1;
      const xpPerLevel = 100;

      // Controlla level up
      if (newXP >= xpPerLevel) {
        newLevel += Math.floor(newXP / xpPerLevel);
        newXP = newXP % xpPerLevel;
      }

      await supabase
        .from("profiles")
        .update({ total_cuts: newCustomerCuts, current_xp: newXP, current_level: newLevel })
        .eq("id", booking.customer_id);
    }
  }
}

