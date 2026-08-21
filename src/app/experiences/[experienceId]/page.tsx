import Repurposer from "@/components/Repurposer";

// Whop loads the app at this path inside the iframe:
//   {Base URL}/experiences/[experienceId]
// (configured in Whop dashboard → your app → Hosting → Experience path).
//
// `params` is a Promise in this version of Next.js and must be awaited.
// We don't need the experienceId to render the UI — access is verified
// server-side in /api/repurpose against WHOP_EXPERIENCE_ID — but we await it
// so the route follows the framework's async params contract.
export default async function ExperiencePage({
  params,
}: PageProps<"/experiences/[experienceId]">) {
  await params;
  return <Repurposer />;
}
