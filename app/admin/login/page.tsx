import { adminLoginAction } from '../actions';

const ERROR_MESSAGES: Record<string, string> = {
  missing: 'Please enter both email and password.',
  invalid: 'Invalid credentials or email is not an allowed admin.',
  config: 'Admin authentication is not configured correctly.',
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className='mx-auto max-w-md p-6'>
      <h1 className='mb-6 text-3xl font-bold'>Admin Login</h1>
      {error && ERROR_MESSAGES[error] ? (
        <p className='mb-4 rounded bg-red-100 p-3 text-sm text-red-700'>
          {ERROR_MESSAGES[error]}
        </p>
      ) : null}
      <form action={adminLoginAction} className='space-y-4 rounded border p-4'>
        <div>
          <label htmlFor='email' className='mb-1 block text-sm font-medium'>
            Email
          </label>
          <input
            id='email'
            name='email'
            type='email'
            required
            className='w-full rounded border px-3 py-2'
          />
        </div>
        <div>
          <label htmlFor='password' className='mb-1 block text-sm font-medium'>
            Password
          </label>
          <input
            id='password'
            name='password'
            type='password'
            required
            className='w-full rounded border px-3 py-2'
          />
        </div>
        <button type='submit' className='rounded bg-black px-4 py-2 text-white'>
          Sign in
        </button>
      </form>
    </main>
  );
}
