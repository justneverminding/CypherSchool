import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import type { CourseCertificate } from '../types'

export function CertificateTemplate({ certificate, compact = false }: { certificate: CourseCertificate; compact?: boolean }) {
  const [qrSource, setQrSource] = useState('')
  const verificationUrl = `${window.location.origin}/verify/${certificate.certificateId}`

  useEffect(() => {
    QRCode.toDataURL(verificationUrl, { width: 240, margin: 0, color: { dark: '#F1F0E9', light: '#0B0D0C' } })
      .then(setQrSource)
      .catch(() => setQrSource(''))
  }, [verificationUrl])

  return <figure className={compact ? 'certificate-template certificate-template-compact' : 'certificate-template'}>
    <img src="/cypherschool-certificate-template.png" alt="CypherSchool Financial Privacy Course completion certificate" />
    <figcaption className="certificate-template-verification">
      <span>CERTIFICATE ID</span>
      <code>{certificate.certificateId}</code>
      <small>VERIFY AT CYPHERSCHOOL.ONLINE/VERIFY</small>
    </figcaption>
    {qrSource && <img className="certificate-template-qr" src={qrSource} alt={`QR code to verify ${certificate.certificateId}`} />}
  </figure>
}
