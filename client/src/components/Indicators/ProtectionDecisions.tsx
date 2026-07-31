import type { IndicatorCustomText } from '@/hooks/useIndicatorCustomTexts'
import { useProtectionDecisions } from '@/hooks/useProtectionDecisions'
import { ProtectionDecisionsDetails } from './ProtectionDecisionsDetails'

export function ProtectionDecisions({ customText }: { customText?: IndicatorCustomText | null }) {
  const { firstInstance, secondInstance, appealsLegalAid, loading, error } = useProtectionDecisions()
  return (
    <ProtectionDecisionsDetails
      firstInstance={firstInstance}
      secondInstance={secondInstance}
      appealsLegalAid={appealsLegalAid}
      loading={loading}
      error={error}
      customText={customText}
    />)
}
