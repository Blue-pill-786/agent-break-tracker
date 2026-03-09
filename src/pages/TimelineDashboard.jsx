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

<div style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
flexWrap:"wrap",
gap:"10px"
}}>

<h1 className="title">Live Shift Timeline</h1>

<div style={{
display:"flex",
alignItems:"center",
gap:"8px",
fontSize:"14px",
color:"#64748b"
}}>

<div style={{
width:"8px",
height:"8px",
borderRadius:"50%",
background:"#22c55e",
animation:"pulse 1.5s infinite"
}}/>

Live

</div>

</div>

<p className="time">
Current ET Time: {formatTime(now)}
</p>

<Link to="/team" className="nav-btn">
Back to Team Dashboard
</Link>

<div style={{marginTop:"20px"}}>
<ShiftTimeline currentTime={now}/>
</div>

</div>

)

}