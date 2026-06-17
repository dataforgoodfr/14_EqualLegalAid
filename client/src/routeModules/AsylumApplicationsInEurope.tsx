import { useOutletContext } from 'react-router'

export default function()
{
    const textSentThroughContext = useOutletContext()
    console.log(textSentThroughContext)
    return (
        <>
            <h1>Hello from AsylumApplicationsInEurope</h1>
            <p>Route Parameters: {textSentThroughContext}</p>
        </>
    )
}