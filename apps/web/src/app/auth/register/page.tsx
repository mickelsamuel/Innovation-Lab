'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect /auth/register to /auth/signup
    router.replace('/auth/signup');
  }, [router]);

  return null;
}
