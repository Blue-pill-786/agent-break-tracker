import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Select from "react-select"
import CircularTimer from "../components/CircularTimer"

import { agents } from "../data/agents"
import { timeToMinutes, getESTMinutes } from "../utils/timeUtils"

import "../styles/dashboard.css"

export default function Dashboard({ initialAgent = null }){

const [agent,setAgent] = useState(initialAgent || agents[0])
const [now,setNow] = useState(getESTMinutes())

useEffect(()=>{

const timer = setInterval(()=>{
setNow(getESTMinutes())
},1000)

return ()=>clearInterval(timer)

},[])

/* ---------- dropdown ---------- */

const options = agents.map((a,index)=>({
value:index,
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

if(target === null) return null

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
return {
type:"Break",
start:breakAM,
duration:breakDuration
}
}

if(now >= lunch && now < lunch + lunchDuration){
return {
type:"Lunch",
start:lunch,
duration:lunchDuration
}
}

if(now >= breakPM && now < breakPM + breakDuration){
return {
type:"Break",
start:breakPM,
duration:breakDuration
}
}

return null

}

function getBreakProgress(start,duration){

const elapsed = now - start
const percent = (elapsed / duration) * 100

if(percent < 0) return 0
if(percent > 100) return 100

return percent

}

/* ---------- break color logic ---------- */

function getBreakColor(minutesLeft){

if(minutesLeft <= 3) return "#ef4444"
if(minutesLeft <= 7) return "#f59e0b"
return "#22c55e"

}

/* ---------- shift logic ---------- */

function getStatus(agent){

const start = timeToMinutes(agent.shiftStart)
const end = timeToMinutes(agent.shiftEnd)

if(now < start) return "Not Started"
if(now >= end) return "Shift Finished"

const currentBreak = getCurrentBreak(agent)

if(currentBreak) return currentBreak.type

return "Working"

}

function getNextEvent(agent){

const events=[

{label:"Break AM",time:timeToMinutes(agent.breakAM)},
{label:"Lunch",time:timeToMinutes(agent.lunch)},
{label:"Break PM",time:timeToMinutes(agent.breakPM)},
{label:"Shift End",time:timeToMinutes(agent.shiftEnd)}

]

return events.find(e=>e.time>now)

}

/* ---------- computed values ---------- */

const currentBreak = agent ? getCurrentBreak(agent) : null
const nextEvent = agent ? getNextEvent(agent) : null

const logoutTime = agent ? timeToMinutes(agent.shiftEnd) : null
const nextEventTime = nextEvent ? nextEvent.time : null

const logoutLeft = agent ? getMinutesLeft(logoutTime) : null

const breakLeft = currentBreak
? getMinutesLeft(currentBreak.start + currentBreak.duration)
: getMinutesLeft(nextEventTime)

const breakProgress = currentBreak
? getBreakProgress(currentBreak.start,currentBreak.duration)
: 0

const breakColor = currentBreak
? getBreakColor(breakLeft)
: "#4f46e5"

const status = agent ? getStatus(agent) : null

/* ---------- login countdown ---------- */

let loginLeft = null

if(agent){

const shiftStart = timeToMinutes(agent.shiftStart)

if(now < shiftStart){
loginLeft = shiftStart - now
}

}

/* ---------- UI ---------- */

return(

<div className="container">

<h1 className="title">Agent Break Tracker</h1>

<Link to="/team" className="nav-btn">
Team Dashboard
</Link>

<Select
options={options}
placeholder="Select Agent"
value={agent ? {label:agent.name,value:agents.indexOf(agent)} : null}
onChange={(option)=>setAgent(agents[option.value])}
/>

<h2 className="agent-name">{agent.name}</h2>

<Link to={`/agent/${agent.id}`} className="nav-btn">
Open Agent Page
</Link>

<p className="time">
Current ET Time: {formatTime(now)}
</p>

<div className="timer-row">

<CircularTimer
title="Next Login"
time={loginLeft ? formatCountdown(loginLeft) : "Started"}
progress={loginLeft ? 30 : 100}
/>

<CircularTimer
title={currentBreak ? currentBreak.type : "Next Break"}
time={breakLeft ? formatCountdown(breakLeft) : "--:--"}
progress={breakProgress}
color={breakColor}
/>

<CircularTimer
title="Logout Countdown"
time={logoutLeft ? formatCountdown(logoutLeft) : "Shift Over"}
progress={logoutLeft ? 100 - (logoutLeft/480)*100 : 100}
/>

</div>

<div style={{marginTop:"20px",fontWeight:"600"}}>
Status: {status}
</div>

</div>

)

}