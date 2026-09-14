import { Navigation } from "@/components/Navigation";
import { Link } from "react-router-dom";
export default function ComingSoon() {
  return (
    <>
      <Navigation />
      <main
        id="main-content"
        className="mx-auto min-h-screen max-w-3xl px-5 pb-20 pt-32"
      >
        <p className="text-sm font-semibold text-teal-700">
          Made by the GCET community
        </p>
        <h1 className="mt-4 text-4xl font-bold">Beyond the classroom</h1>
        <div className="mt-10 rounded-2xl border border-dashed p-10 text-center">
          <h2 className="text-xl font-semibold">
            Good things take a little preparation
          </h2>
          <p className="my-4 text-muted-foreground">
            Community contributions will appear here once they are reviewed and
            ready.
          </p>
          <Link className="text-teal-700 underline" to="/youtube-resources">
            Explore more resources
          </Link>
        </div>
      </main>
    </>
  );
}
