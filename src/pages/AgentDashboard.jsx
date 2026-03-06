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

let diff=target-now

if(diff<0) diff+=1440

return diff

}

function getStatus(){

const start = timeToMinutes(agent.shiftStart)
const end = timeToMinutes(agent.shiftEnd)

if(now < start) return "Not Started"
if(now >= end) return "Shift Finished"

return "Working"

}

function getNextEvent(){

const events=[

{label:"Break AM",time:timeToMinutes(agent.breakAM)},
{label:"Lunch",time:timeToMinutes(agent.lunch)},
{label:"Break PM",time:timeToMinutes(agent.breakPM)}

]

return events.find(e=>e.time>now)

}

function getShiftProgress(){

const start=timeToMinutes(agent.shiftStart)
const end=timeToMinutes(agent.shiftEnd)

const total=end-start
const done=now-start

if(done<=0) return 0
if(done>=total) return 100

return Math.floor((done/total)*100)

}

function getNextWorkingDay(date){

const next = new Date(date)
next.setDate(next.getDate()+1)

while(next.getDay() === 0 || next.getDay() === 6){
next.setDate(next.getDate()+1)
}

return next

}

const status=getStatus()
const progress=getShiftProgress()

const shiftEnd=timeToMinutes(agent.shiftEnd)
const shiftLeft=getMinutesLeft(shiftEnd)

const nextEvent=getNextEvent()
const nextEventTime=nextEvent ? nextEvent.time : null
const breakLeft=nextEventTime ? getMinutesLeft(nextEventTime) : null

/* next login */

let nextLoginLabel=""

if(status==="Shift Finished"){

const estNow = new Date().toLocaleString("en-US",{timeZone:"America/New_York"})
const current = new Date(estNow)

const nextDay=getNextWorkingDay(current)

nextLoginLabel = nextDay.toLocaleDateString("en-US",{weekday:"long"}) + " " + agent.shiftStart

}

/* UI */

return(

<div className="container">

<h1 className="title">My Shift Dashboard</h1>

<h2 className="agent-name">{agent.name}</h2>

<p className="time">
Current ET Time: {formatTime(now)}
</p>

<div className="timer-row">

<CircularTimer
title={status==="Shift Finished" ? "Next Login" : "Next Break"}
time={
status==="Shift Finished"
? nextLoginLabel
: breakLeft
? formatCountdown(breakLeft)
: "Completed"
}
progress={status==="Shift Finished" ? 100 : 40}
/>

<CircularTimer
title="Shift Ends"
time={
status==="Shift Finished"
? "Shift Completed"
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
