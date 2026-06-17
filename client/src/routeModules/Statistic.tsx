import { KeyFiguresHeader } from '@/components/Indicators/KeyFiguresHeader'
import { useKeyFigures } from '@/hooks/useKeyFigures'
import { useIndicatorCustomTexts } from '@/hooks/useIndicatorCustomTexts'
import {
  Outlet,
} from "react-router";

export default function(){
    const { records: customTexts } = useIndicatorCustomTexts()
    const getCustomText = (name: string) => customTexts.find(ct => ct.name === name) ?? null
    const keyFigures = useKeyFigures()
    return (
        <>
            <KeyFiguresHeader data={keyFigures} />
            <Outlet context={{getCustomText}} />
        </>
    )
}