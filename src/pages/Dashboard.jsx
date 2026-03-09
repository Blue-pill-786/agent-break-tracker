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

return {
type:"Break",
end: breakAM + breakDuration,
duration: breakDuration
}

}

if(now >= lunch && now < lunch + lunchDuration){

return {
type:"Lunch",
end: lunch + lunchDuration,
duration: lunchDuration
}

}

if(now >= breakPM && now < breakPM + breakDuration){

return {
type:"Break",
end: breakPM + breakDuration,
duration: breakDuration
}

}

return null

}

const currentBreak = selectedAgent ? getCurrentBreak(selectedAgent) : null

/* ---------- break timer ---------- */

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

<Link
to={`/agent/${selectedAgent.id}`}
className="nav-btn"
style={{marginTop:"10px",display:"inline-block"}}
>
Open Agent Dashboard
</Link>

)}

<p className="time">
Current ET Time: {formatTime(now)}
</p>

{/* ---------- BREAK TIMER ---------- */}

{currentBreak && (

<div style={{
marginTop:"20px",
display:"flex",
justifyContent:"center"
}}>

<CircularTimer
title={currentBreak.type}
time={`${breakRemaining} min`}
progress={breakProgress}
color={breakColor}
/>

</div>

)}

</div>

)

}