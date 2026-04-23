export async function getCsrf() {
  const res = await fetch("http://localhost:5000/api/auth/csrf", {
    credentials: "include",
  });
  return res.json();
}
