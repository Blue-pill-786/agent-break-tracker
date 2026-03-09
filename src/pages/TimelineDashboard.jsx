import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

import ShiftTimeline from "../components/ShiftTimeline"
import { getESTMinutes } from "../utils/timeUtils"

import "./dashboard.css"

export default function TimelineDashboard(){

const [now,setNow] = useState(getESTMinutes())

/* ---------- live clock ---------- */

useEffect(()=>{

const timer = setInterval(()=>{
setNow(getESTMinutes())
},1000)

return ()=>clearInterval(timer)

},[])

/* ---------- helpers ---------- */

function formatTime(minutes){

const h = String(Math.floor(minutes/60)).padStart(2,"0")
const m = String(minutes%60).padStart(2,"0")

return `${h}:${m}`

}

/* ---------- UI ---------- */

return(

<div className="container">

<div className="header">

<h1 className="title">Live Shift Timeline</h1>

<div className="live-indicator">

<span className="live-dot"></span>
Live

</div>

</div>

<p className="time">
Current ET Time: {formatTime(now)}
</p>

<Link to="/team" className="nav-btn">
Back to Team Dashboard
</Link>

<div style={{marginTop:"25px"}}>

{/* key forces re-render */}
<ShiftTimeline key={now} currentTime={now} />

</div>

</div>

)

}