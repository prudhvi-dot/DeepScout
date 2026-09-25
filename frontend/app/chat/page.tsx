
import { redirect } from "next/navigation";

async function create_chat() {
  const chatId = crypto.randomUUID();


  redirect(`/chat/${chatId}`)
}
const page = async () => {
  await create_chat();
  return (
    <div>
      <h1>chat main</h1>
    </div>
  )
}

export default page
