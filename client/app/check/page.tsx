export default async function CheckPage() {
  const res = await fetch("http://127.0.0.1:8000/check");
  const message = await res.json();
  const return_msg = Object.values(message);
  return return_msg;
}
