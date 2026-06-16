import { KeyFiguresHeader } from '@/components/Indicators/KeyFiguresHeader'
import { useKeyFigures } from '@/hooks/useKeyFigures'

export default function(){
    const keyFigures = useKeyFigures()
    return (
        <KeyFiguresHeader data={keyFigures} />
    )
}