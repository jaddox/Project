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

  const { data, error } = await supabase
    .from("bookings")
    .select("id, day, start_time, end_time, status, note, customer_id, created_at")
    .eq("barber_id", user.id)
    .eq("day", dayISO)
    .eq("status", "pending")
    .order("start_time", { ascending: true });

  if (error) throw error;
  return data;
}

export async function setBookingStatus(bookingId, status /* accepted/rejected */) {
  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId);

  if (error) throw error;
}
