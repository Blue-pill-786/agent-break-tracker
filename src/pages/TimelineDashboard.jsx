import { Link } from "react-router-dom"
import ShiftTimeline from "../components/ShiftTimeline"
import { getESTMinutes } from "../utils/timeUtils"

export default function TimelineDashboard(){

const now = getESTMinutes()

function formatTime(minutes){

const h = String(Math.floor(minutes/60)).padStart(2,"0")
const m = String(minutes%60).padStart(2,"0")

return `${h}:${m}`

}

return(

<div className="container">

<h1 className="title">Live Shift Timeline</h1>

<p className="time">
Current ET Time: {formatTime(now)}
</p>

<Link to="/team" className="nav-btn">
Back to Team Dashboard
</Link>

<ShiftTimeline/>

</div>

)

}