// import { getList } from "@/hooks/getList";
import { getList } from "@/hooks/getList";
import ListNav from "@/components/layout/ListNav";
import Sidebar from "@/components/layout/Sidebar";
import Mylist from "@/components/lists/view/Mylist";
import Details from "@/components/lists/Details/Details";


type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const list = await getList(id);
  const name = list?.name ?? "Inbox";

  return {
    title: `${name} – TaskPilot`,
    description: `Manage tasks in the ${name} list inside TaskPilot.`,
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const list = await getList(id);

  return (
    <div className="w-full flex h-screen relative">
      <Sidebar />
      <ListNav />
      <Mylist initialData={list} />
      <Details

      />
    </div>
  );
}