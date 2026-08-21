import Repurposer from "@/components/Repurposer";

// Standalone / demo entry point. Also works when the app is opened directly
// (outside Whop). Access gating is enforced server-side in /api/repurpose.
export default function Home() {
  return <Repurposer />;
}
