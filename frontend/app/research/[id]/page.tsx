import { cookies } from "next/headers";
import Research from "@/components/Research";
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
async function getResearch(research_id: string) {
  const cookieStore = await cookies();
  const res = await fetch(`${BACKEND_URL}/api/researches/${research_id}/report`, {
    headers: { Cookie: cookieStore.toString() },
    cache: "no-store",
  });
  if (!res.ok) return "";
  const data = await res.json();

  return data.report ?? "";
}
const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const [report, user] = await Promise.all([
    getResearch(id),
    getCurrentUser(),
  ]);


  return (
    <div className="min-h-0 h-full overflow-hidden bg-gray-100">
         <Research docId={id} report={report.report_content} userName={user.username} topic={report.query} />
        <h1>Research Page</h1>
    </div>
  );
};

export default Page;