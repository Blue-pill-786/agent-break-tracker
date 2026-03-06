import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Select from "react-select"

import { agents } from "../data/agents"
import { timeToMinutes, getESTMinutes } from "../utils/timeUtils"

import "../styles/dashboard.css"

export default function Dashboard(){

const [now,setNow] = useState(getESTMinutes())
const [selectedAgent,setSelectedAgent] = useState(agents[0])

useEffect(()=>{

const timer=setInterval(()=>{
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

function isAgentWorking(agent,time){

const start = timeToMinutes(agent.shiftStart)
const end = timeToMinutes(agent.shiftEnd)

const breakAM = timeToMinutes(agent.breakAM)
const lunch = timeToMinutes(agent.lunch)
const breakPM = timeToMinutes(agent.breakPM)

const breakDuration = 15
const lunchDuration = 30

if(time < start || time >= end) return false

if(time >= breakAM && time < breakAM + breakDuration) return false
if(time >= lunch && time < lunch + lunchDuration) return false
if(time >= breakPM && time < breakPM + breakDuration) return false

return true

}

function countWorkingAgents(offset){

const checkTime = now + offset

let count = 0

agents.forEach(agent=>{

if(isAgentWorking(agent,checkTime)){
count++
}

})

return count

}

/* ---------- coverage ---------- */

const coverageNow = countWorkingAgents(0)
const coverage15 = countWorkingAgents(15)
const coverage30 = countWorkingAgents(30)
const coverage60 = countWorkingAgents(60)

/* ---------- UI ---------- */

return(

<div className="container">

<h1 className="title">Agent Break Tracker</h1>

<Link to="/team" className="nav-btn">
Team Dashboard
</Link>

<Select
options={options}
value={{label:selectedAgent.name,value:agents.indexOf(selectedAgent)}}
onChange={(option)=>setSelectedAgent(agents[option.value])}
/>

{/* OPEN AGENT DASHBOARD BUTTON */}

<Link
to={`/agent/${selectedAgent.id}`}
className="nav-btn"
style={{marginTop:"10px",display:"inline-block"}}
>
Open Agent Dashboard
</Link>

<p className="time">
Current ET Time: {formatTime(now)}
</p>

<div className="cards">

<div className="card">
<p className="card-title">Now</p>
<p className="card-value">{coverageNow} agents</p>
</div>

<div className="card">
<p className="card-title">15 Minutes</p>
<p className="card-value">{coverage15} agents</p>
</div>

<div className="card">
<p className="card-title">30 Minutes</p>
<p className="card-value">{coverage30} agents</p>
</div>

<div className="card">
<p className="card-title">60 Minutes</p>
<p className="card-value">{coverage60} agents</p>
</div>

</div>

</div>

)

}