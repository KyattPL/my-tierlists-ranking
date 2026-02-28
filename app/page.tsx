import { getAllTierlists } from "@/lib/data";
import TierlistApp from "@/components/TierlistApp";

export default async function Page() {
  const data = await getAllTierlists();
  
  return <TierlistApp initialData={data} />;
}
