import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Chat from "@/components/Chat";
import { BACKEND_URL } from "@/lib/config";
async function getCurrentUser() {
  const cookieStore = await cookies();
  const res = await fetch(`${BACKEND_URL}/api/users/me`, {
    headers: { Cookie: cookieStore.toString() },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}
async function getMessages(chat_id: string) {
  const cookieStore = await cookies();
  const res = await fetch(`${BACKEND_URL}/api/chats/${chat_id}/messages`, {
    headers: { Cookie: cookieStore.toString() },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  console.log(`Messages: ${data.messages}`)
  return data.messages ?? [];   // unwrap the array from the response object
}
const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const [messages, user] = await Promise.all([
    getMessages(id),
    getCurrentUser(),
  ]);


  return (
    <div className="min-h-0 h-full overflow-hidden bg-gray-100">
        <Chat docId={id} initialMessages={messages} userName={user.username} />
    </div>
  );
};

export default Page;