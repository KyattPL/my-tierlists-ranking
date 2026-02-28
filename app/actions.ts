"use server"

import { revalidatePath } from "next/cache";
import { saveTierlist } from "@/lib/data";
import { AppNode, Category, TierList } from "@/lib/types";

export async function saveTierlistAction(tierlist: TierList, newCategories: Category[]) {
  try {
    // 1. Save new categories
    for (const cat of newCategories) {
      // Ensure children are correct?
      // For now, we trust the client state, but ideally we'd merge children if the file exists.
      // Since these are "new" categories created in the session, we assume they don't exist or we overwrite.
      await saveTierlist(cat);
    }

    // 2. Save the tierlist itself
    await saveTierlist(tierlist);

    // 3. Revalidate
    revalidatePath("/");
    
    return { success: true, message: `Saved ${tierlist.name} and ${newCategories.length} categories.` };
  } catch (e) {
    console.error("Save failed:", e);
    return { success: false, message: "Failed to save data." };
  }
}
