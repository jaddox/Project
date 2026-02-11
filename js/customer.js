import { supabase } from "./supabaseClient.js";

function addMinutesToTimeStr(hhmm, minutes) {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

function timeToStr(t) {
  // t può arrivare "09:00:00" da postgres
  return t.slice(0, 5);
}

export async function getSlotsForDay(barberId, dayISO /* YYYY-MM-DD */) {
  const { data: avs, error: avErr } = await supabase
    .from("availability")
    .select("start_time,end_time,slot_minutes,is_active")
    .eq("barber_id", barberId)
    .eq("day", dayISO)
    .eq("is_active", true);

  if (avErr) throw avErr;

  const { data: booked, error: bErr } = await supabase
    .from("bookings")
    .select("start_time,status")
    .eq("barber_id", barberId)
    .eq("day", dayISO)
    .in("status", ["pending", "accepted"]);

  if (bErr) throw bErr;

  const bookedSet = new Set(booked.map(x => timeToStr(x.start_time)));

  const slots = [];
  for (const av of avs) {
    const step = av.slot_minutes ?? 30;
    let cur = timeToStr(av.start_time);
    const end = timeToStr(av.end_time);

    while (addMinutesToTimeStr(cur, step) <= end) {
      if (!bookedSet.has(cur)) slots.push(cur);
      cur = addMinutesToTimeStr(cur, step);
    }
  }
  return slots;
}

export async function createBooking(barberId, dayISO, startHHMM, note = "") {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");

  const endHHMM = addMinutesToTimeStr(startHHMM, 30);

  // Controlla se lo slot è ancora disponibile (evita race conditions)
  const { data: existingBooking, error: checkErr } = await supabase
    .from("bookings")
    .select("id")
    .eq("barber_id", barberId)
    .eq("day", dayISO)
    .eq("start_time", `${startHHMM}:00`)
    .in("status", ["pending", "accepted"])
    .single();

  if (checkErr && checkErr.code !== "PGRST116") throw checkErr; // PGRST116 = not found
  
  if (existingBooking) {
    throw new Error(`Slot già prenotato. Questo orario non è più disponibile.`);
  }

  // Controlla se l'utente ha già una prenotazione nello stesso giorno e ora
  const { data: userBooking, error: userCheckErr } = await supabase
    .from("bookings")
    .select("id")
    .eq("customer_id", user.id)
    .eq("day", dayISO)
    .eq("start_time", `${startHHMM}:00`);

  if (userCheckErr) throw userCheckErr;
  
  if (userBooking && userBooking.length > 0) {
    throw new Error(`Hai già una prenotazione per questo orario.`);
  }

  const { error } = await supabase
    .from("bookings")
    .insert({
      barber_id: barberId,
      customer_id: user.id,
      day: dayISO,
      start_time: `${startHHMM}:00`,
      end_time: `${endHHMM}:00`,
      status: "pending",
      note
    });

  if (error) throw error;
}
