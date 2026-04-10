'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/protected-route'
import { CertificateDisplay } from '@/components/certificates/CertificateDisplay'
import { certificateApi } from '@/lib/services'
import { useAuth } from '@/contexts/auth-context'
import type { CertificateDto } from '@/services/generated'
import { useToast } from '@/hooks/use-toast'
import { ADPSpinner } from '@/components/ui/adp-spinner'

function CertificatesContent() {
  const { user } = useAuth()
  const [certificates, setCertificates] = useState<CertificateDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (!user?.id) return
    setIsLoading(true)
    certificateApi
      .getUserCertificates()
      .catch(() => [])
      .then(setCertificates)
      .catch(() =>
        toast({ title: 'Error', description: 'Failed to load certificates', variant: 'error' }),
      )
      .finally(() => setIsLoading(false))
  }, [toast, user?.id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <ADPSpinner size="sm" />
      </div>
    )
  }

  return <CertificateDisplay certificates={certificates} />
}

export default function CertificatesPage() {
  return (
    <ProtectedRoute requireActiveMembership requiredPermissions={["member.certificates.access"]}>
      <CertificatesContent />
    </ProtectedRoute>
  )
}
