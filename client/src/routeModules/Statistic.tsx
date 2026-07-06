import { KeyFiguresHeader } from '@/components/Indicators/KeyFiguresHeader'
import { useKeyFigures } from '@/hooks/useKeyFigures'
import { useIndicatorCustomTexts } from '@/hooks/useIndicatorCustomTexts'
import {
  Outlet,
} from "react-router";
import StatisticMenu from '@/components/Header/StatisticMenu';

export default function(){
    const { records: customTexts } = useIndicatorCustomTexts()
    const getCustomText = (name: string) => customTexts.find(ct => ct.name === name) ?? null
    const keyFigures = useKeyFigures()
    return (
        <>
            <StatisticMenu customTexts={customTexts} />
            <KeyFiguresHeader data={keyFigures} />
            <Outlet context={{getCustomText}} />
        </>
    )
}