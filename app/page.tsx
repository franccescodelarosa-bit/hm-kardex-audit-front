import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">
          HMSoft
        </h1>

        <Link
          href="/login"
          className="inline-block mt-4 px-5 py-3 rounded-lg bg-black text-white"
        >
          Ir al Login
        </Link>
      </div>
    </div>
  );
}