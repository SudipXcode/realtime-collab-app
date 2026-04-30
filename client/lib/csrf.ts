export async function getCsrf() {
  const res = await fetch("https://realtime-collab-app-production.up.railway.app/api/auth/csrf", {
    credentials: "include",
  });
  return res.json();
}
