import Link from 'next/link';
import { connection } from 'next/server';

export default async function NotFound() {
  await connection();
  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-4xl md:text-5xl font-bold tracking-tight mb-4'>
          404
        </h1>
        <p className='text-lg text-slate-500 dark:text-slate-400 mb-6'>
          Page not found
        </p>
        <Link href='/'>
          <a className='inline-flex items-center px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors'>
            Go to Home
          </a>
        </Link>
      </div>
    </div>
  );
}
