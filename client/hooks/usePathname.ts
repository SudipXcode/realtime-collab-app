import { usePathname } from "next/navigation";

export function usePath() {
  const pathname = usePathname();
  return pathname;
}
