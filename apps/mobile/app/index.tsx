import { useAuthRedirect } from "~/features/auth/useAuthRedirect";

export default function Index() {
  useAuthRedirect();
  return null;
}
