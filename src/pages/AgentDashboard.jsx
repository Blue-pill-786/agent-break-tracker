import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"

import { agents } from "../data/agents"
import { timeToMinutes, getESTMinutes } from "../utils/timeUtils"

import CircularTimer from "../components/CircularTimer"

import "../styles/dashboard.css"

export default function AgentDashboard(){

const { agentId } = useParams()

const agent = agents.find(a => a.id === agentId)

const [now,setNow] = useState(getESTMinutes())

useEffect(()=>{

const timer=setInterval(()=>{
setNow(getESTMinutes())
},1000)

return ()=>clearInterval(timer)

},[])

if(!agent){
return <div className="container">Agent not found</div>
}

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

let diff = target-now

if(diff < 0) diff += 1440

return diff

}

/* ---------- shift times ---------- */

const shiftStart = timeToMinutes(agent.shiftStart)
const shiftEnd = timeToMinutes(agent.shiftEnd)

const breakAM = timeToMinutes(agent.breakAM)
const lunch = timeToMinutes(agent.lunch)
const breakPM = timeToMinutes(agent.breakPM)

const breakDuration = 15
const lunchDuration = 30

/* ---------- status ---------- */

function getStatus(){

if(now < shiftStart) return "Not Started"

if(now >= shiftEnd) return "Shift Finished"

if(now >= breakAM && now < breakAM + breakDuration) return "Break AM"

if(now >= lunch && now < lunch + lunchDuration) return "Lunch"

if(now >= breakPM && now < breakPM + breakDuration) return "Break PM"

return "Working"

}

/* ---------- current break ---------- */

function getCurrentBreak(){

if(now >= breakAM && now < breakAM + breakDuration){

return {
label:"Break AM",
remaining:(breakAM + breakDuration) - now,
duration:breakDuration
}

}

if(now >= lunch && now < lunch + lunchDuration){

return {
label:"Lunch",
remaining:(lunch + lunchDuration) - now,
duration:lunchDuration
}

}

if(now >= breakPM && now < breakPM + breakDuration){

return {
label:"Break PM",
remaining:(breakPM + breakDuration) - now,
duration:breakDuration
}

}

return null

}

/* ---------- next break ---------- */

function getNextEvent(){

const events=[

{label:"Break AM",time:breakAM},
{label:"Lunch",time:lunch},
{label:"Break PM",time:breakPM}

]

return events.find(e=>e.time>now)

}

/* ---------- shift progress ---------- */

function getShiftProgress(){

const total = shiftEnd-shiftStart
const done = now-shiftStart

if(done<=0) return 0
if(done>=total) return 100

return Math.floor((done/total)*100)

}

/* ---------- computed values ---------- */

const status = getStatus()

const progress = getShiftProgress()

const shiftLeft = getMinutesLeft(shiftEnd)

const currentBreak = getCurrentBreak()

const nextEvent = getNextEvent()

const breakLeft = nextEvent ? getMinutesLeft(nextEvent.time) : null

/* ---------- break circle progress ---------- */

let breakProgress = 0

if(currentBreak){

breakProgress =
((currentBreak.duration - currentBreak.remaining) /
currentBreak.duration) * 100

}

/* ---------- UI ---------- */

return(

<div className="container">

<h1 className="title">My Shift Dashboard</h1>

<h2 className="agent-name">{agent.name}</h2>

<p className="time">
Current ET Time: {formatTime(now)}
</p>

<div className="timer-row">

<CircularTimer
title={
status==="Shift Finished"
? "Shift Completed"
: currentBreak
? currentBreak.label
: "Next Break"
}
time={
status==="Shift Finished"
? "Completed"
: currentBreak
? formatCountdown(currentBreak.remaining)
: breakLeft
? formatCountdown(breakLeft)
: "Completed"
}
progress={
status==="Shift Finished"
? 100
: currentBreak
? breakProgress
: 40
}
/>

<CircularTimer
title="Shift Ends"
time={
status==="Shift Finished"
? "Completed"
: formatCountdown(shiftLeft)
}
progress={progress}
/>

</div>

<div className="cards">

<div className="card">
<p className="card-title">Status</p>
<p className="card-value">{status}</p>
</div>

{currentBreak && (

<div className="card">
<p className="card-title">Break Remaining</p>
<p className="card-value">
{currentBreak.remaining} min
</p>
</div>

)}

<div className="card">
<p className="card-title">Break AM</p>
<p className="card-value">{agent.breakAM}</p>
</div>

<div className="card">
<p className="card-title">Lunch</p>
<p className="card-value">{agent.lunch}</p>
</div>

<div className="card">
<p className="card-title">Break PM</p>
<p className="card-value">{agent.breakPM}</p>
</div>

<div className="card">
<p className="card-title">Shift End</p>
<p className="card-value">{agent.shiftEnd}</p>
</div>

</div>

<div className="shift-box">

<p className="shift-title">Shift Progress</p>

<div style={{
width:"100%",
height:"12px",
background:"#e2e8f0",
borderRadius:"10px",
marginTop:"10px"
}}>

<div style={{
width:`${progress}%`,
height:"12px",
background:"#007aff",
borderRadius:"10px"
}}/>

</div>

<p style={{marginTop:"8px",fontWeight:"bold"}}>
{progress}% Complete
</p>

</div>

</div>

)

}