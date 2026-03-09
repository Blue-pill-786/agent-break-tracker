import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Select from "react-select"
import CircularTimer from "../components/CircularTimer"

import { agents } from "../data/agents"
import { timeToMinutes, getESTMinutes } from "../utils/timeUtils"

import "../styles/dashboard.css"

export default function Dashboard(){

const [now,setNow] = useState(getESTMinutes())
const [selectedAgent,setSelectedAgent] = useState(null)

useEffect(()=>{

const timer=setInterval(()=>{
setNow(getESTMinutes())
},1000)

return ()=>clearInterval(timer)

},[])

/* ---------- dropdown ---------- */

const options = agents.map(a=>({
value:a.id,
label:a.name
}))

/* ---------- helpers ---------- */

function formatTime(minutes){

const h = String(Math.floor(minutes/60)).padStart(2,"0")
const m = String(minutes%60).padStart(2,"0")

return `${h}:${m}`

}

function formatCountdown(minutes){

if(minutes === null || minutes <= 0) return "--:--"

const h = Math.floor(minutes/60)
const m = minutes % 60

return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`

}

function getMinutesLeft(target){

let diff = target - now
if(diff < 0) diff += 1440
return diff

}

/* ---------- break detection ---------- */

function getCurrentBreak(agent){

const breakAM = timeToMinutes(agent.breakAM)
const lunch = timeToMinutes(agent.lunch)
const breakPM = timeToMinutes(agent.breakPM)

const breakDuration = 15
const lunchDuration = 30

if(now >= breakAM && now < breakAM + breakDuration){
return { type:"Break", end: breakAM + breakDuration, duration: breakDuration }
}

if(now >= lunch && now < lunch + lunchDuration){
return { type:"Lunch", end: lunch + lunchDuration, duration: lunchDuration }
}

if(now >= breakPM && now < breakPM + breakDuration){
return { type:"Break", end: breakPM + breakDuration, duration: breakDuration }
}

return null

}

/* ---------- next event ---------- */

function getNextEvent(agent){

const events=[
{label:"Break AM",time:timeToMinutes(agent.breakAM)},
{label:"Lunch",time:timeToMinutes(agent.lunch)},
{label:"Break PM",time:timeToMinutes(agent.breakPM)},
{label:"Shift End",time:timeToMinutes(agent.shiftEnd)}
]

return events.find(e=>e.time>now)

}

/* ---------- break logic ---------- */

const currentBreak = selectedAgent ? getCurrentBreak(selectedAgent) : null

let breakRemaining = null
let breakProgress = 0
let breakColor = "#22c55e"

if(currentBreak){

breakRemaining = getMinutesLeft(currentBreak.end)
breakProgress = (breakRemaining / currentBreak.duration) * 100

if(breakRemaining <= 3){
breakColor = "#ef4444"
}
else if(breakRemaining <= 7){
breakColor = "#f59e0b"
}
else{
breakColor = "#22c55e"
}

}

/* ---------- next event timer ---------- */

let nextEvent = selectedAgent ? getNextEvent(selectedAgent) : null
let nextEventRemaining = nextEvent ? getMinutesLeft(nextEvent.time) : null

/* ---------- status ---------- */

let status = "Idle"

if(selectedAgent){

if(currentBreak){
status = currentBreak.type
}
else{
status = "Working"
}

}

/* ---------- UI ---------- */

return(

<div className="container">

<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>

<h1 className="title">Agent Break Tracker</h1>

<Link to="/team" className="nav-btn">
Team Dashboard
</Link>

</div>

<Select
options={options}
placeholder="Select Agent"
onChange={(option)=>{

if(!option){
setSelectedAgent(null)
return
}

const agent = agents.find(a=>a.id===option.value)
setSelectedAgent(agent)

}}
/>

{selectedAgent && (

<div style={{
marginTop:"15px",
padding:"14px",
background:"#f8fafc",
borderRadius:"10px"
}}>

<h2 className="agent-name">{selectedAgent.name}</h2>

<div style={{
display:"inline-block",
padding:"6px 12px",
borderRadius:"20px",
fontSize:"13px",
fontWeight:"600",
background:
status==="Working" ? "#dcfce7" :
status==="Break" ? "#fee2e2" :
"#fef3c7",
color:
status==="Working" ? "#15803d" :
status==="Break" ? "#b91c1c" :
"#92400e"
}}>
{status}
</div>

<Link
to={`/agent/${selectedAgent.id}`}
className="nav-btn"
style={{marginLeft:"10px"}}
>
Open Agent Page
</Link>

</div>

)}

<p className="time">
Current ET Time: {formatTime(now)}
</p>

{/* ---------- TIMER SECTION ---------- */}

<div className="timer-grid">

{/* Next Break */}

{selectedAgent && !currentBreak && nextEvent && (

<CircularTimer
title={nextEvent.label}
time={formatCountdown(nextEventRemaining)}
progress={0}
/>

)}

{/* Break Timer */}

{currentBreak && (

<CircularTimer
title={currentBreak.type}
time={`${breakRemaining} min`}
progress={breakProgress}
color={breakColor}
/>

)}

{/* Shift End */}

{selectedAgent && (

<CircularTimer
title="Shift End"
time={formatCountdown(getMinutesLeft(timeToMinutes(selectedAgent.shiftEnd)))}
progress={0}
/>

)}

</div>

{/* Next Event */}

{selectedAgent && !currentBreak && nextEvent && (

<CircularTimer
title={nextEvent.label}
time={formatCountdown(nextEventRemaining)}
progress={0}
/>

)}

{/* Break Timer */}

{currentBreak && (

<CircularTimer
title={currentBreak.type}
time={`${breakRemaining} min`}
progress={breakProgress}
color={breakColor}
/>

)}

</div>

</div>

)

}