import { supabase } from "./supabaseClient.js";

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  // crea profilo (role default customer)
  const userId = data.user?.id;
  if (userId) {
    const { error: pErr } = await supabase
      .from("profiles")
      .insert({ id: userId, full_name: fullName, role: "customer" });
    if (pErr) throw pErr;
  }
  return data;
}

export async function getMyRole() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data.role;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function resetPassword(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password.html`,
  });
  if (error) throw error;
  return data;
}

export async function updatePassword(password) {
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  return data;
}

export async function requireAuthOrRedirect(loginPath = "/login.html") {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) window.location.href = loginPath;
}

export async function checkAuthAndRedirect() {
  const { data: { session } } = await supabase.auth.getSession();
  
  // Se non c'è sessione, vai a login
  if (!session) return false;
  
  // Se c'è sessione, controlla il role e reindirizza se necessario
  try {
    const role = await getMyRole();
    if (role === "barber") {
      window.location.href = "./barber.html";
    } else if (role === "customer") {
      window.location.href = "./app.html";
    }
    return true;
  } catch (e) {
    console.error("Error checking role:", e);
    return false;
  }
}
