import { KeyFiguresHeader } from '@/components/Indicators/KeyFiguresHeader'
import { useKeyFigures } from '@/hooks/useKeyFigures'
import {
  Outlet,
} from "react-router";

export default function(){
    const keyFigures = useKeyFigures()
    return (
        <>
            <KeyFiguresHeader data={keyFigures} />
            <Outlet context={"hello sent through context"} />
        </>
    )
}