import Link from 'next/link';

export default function NotFound() {
  return <div className="flex min-h-screen items-center justify-center bg-[#f8f6f1] px-4 pt-20 text-center dark:bg-dark"><div><p className="font-display text-8xl font-bold text-emerald-700">404</p><h1 className="mt-4 font-display text-3xl font-bold">This route drifted off course.</h1><p className="mt-3 text-stone-500 dark:text-white/50">The experience may have moved or is no longer available.</p><Link href="/tours" className="mt-7 inline-block rounded-xl bg-[#123f35] px-6 py-4 font-bold text-white">Explore available tours</Link></div></div>;
}

