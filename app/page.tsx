import { getAllTierlists } from "@/lib/data";
import TierlistApp from "@/components/TierlistApp";

export const dynamic = 'force-dynamic'; // Since we are reading local files that might change

export default async function Page() {
  const data = await getAllTierlists();
  
  return <TierlistApp initialData={data} />;
}
