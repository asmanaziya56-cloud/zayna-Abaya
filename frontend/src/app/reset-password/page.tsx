'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      router.replace(`/auth/reset-password?token=${token}`);
    } else {
      router.replace('/auth/reset-password');
    }
  }, [router, searchParams]);

  return <div className="text-center py-20 text-xs text-brand-noir/60">Redirecting to secure password reset...</div>;
}

export default function ResetPasswordRedirectPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs text-brand-noir/60">Loading...</div>}>
      <RedirectContent />
    </Suspense>
  );
}
