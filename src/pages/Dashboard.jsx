import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Select from "react-select"

import { agents } from "../data/agents"
import { timeToMinutes, getESTMinutes } from "../utils/timeUtils"
import CircularTimer from "../components/CircularTimer"

import "../styles/dashboard.css"

export default function Dashboard({ initialAgent = null }){

const [agent,setAgent] = useState(initialAgent)
const [now,setNow] = useState(getESTMinutes())

useEffect(()=>{

const timer = setInterval(()=>{
setNow(getESTMinutes())
},1000)

return ()=>clearInterval(timer)

},[])

/* ---------- dropdown options ---------- */

const options = agents.map((a,index)=>({
value:index,
label:a.name
}))

/* ---------- helper functions ---------- */

function formatTime(minutes){

const h = String(Math.floor(minutes/60)).padStart(2,"0")
const m = String(minutes%60).padStart(2,"0")

return `${h}:${m}`

}

function formatCountdown(minutes){

if(!minutes) return "--:--"

const h = Math.floor(minutes/60)
const m = minutes % 60

return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`

}

function getNextEvent(agent){

const events = [

{label:"Break AM",time:timeToMinutes(agent.breakAM)},
{label:"Lunch",time:timeToMinutes(agent.lunch)},
{label:"Break PM",time:timeToMinutes(agent.breakPM)},
{label:"Shift End",time:timeToMinutes(agent.shiftEnd)}

]

return events.find(e => e.time > now)

}

function getStatus(agent){

const start = timeToMinutes(agent.shiftStart)
const end = timeToMinutes(agent.shiftEnd)

const breakAM = timeToMinutes(agent.breakAM)
const lunch = timeToMinutes(agent.lunch)
const breakPM = timeToMinutes(agent.breakPM)

const breakDuration = 15
const lunchDuration = 30

if(now < start) return "Not Started"

if(now >= end) return "Shift Finished"

if(now >= breakAM && now < breakAM + breakDuration) return "Break"

if(now >= lunch && now < lunch + lunchDuration) return "Lunch"

if(now >= breakPM && now < breakPM + breakDuration) return "Break"

return "Working"

}

function getShiftRemaining(agent){

const end = timeToMinutes(agent.shiftEnd)

const diff = end - now

if(diff <= 0) return "Shift Finished"

const h = Math.floor(diff/60)
const m = diff % 60

return `${h}h ${m}m`

}

function getShiftProgress(agent){

const start = timeToMinutes(agent.shiftStart)
const end = timeToMinutes(agent.shiftEnd)

const total = end - start
const done = now - start

if(done <= 0) return 0

if(done >= total) return 100

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

function getNextWorkingDayLabel(){

const estNow = new Date().toLocaleString("en-US",{timeZone:"America/New_York"})

const today = new Date(estNow)

const nextDay = getNextWorkingDay(today)

return nextDay.toLocaleDateString("en-US",{weekday:"long"})

}

function getMinutesLeft(target){

if(!target) return null

let diff = target - now

if(diff < 0){
diff += 1440
}

return diff

}

/* ---------- computed values ---------- */

const nextEvent = agent ? getNextEvent(agent) : null

let loginLeft = null

if(agent){

const shiftStart = timeToMinutes(agent.shiftStart)

if(now < shiftStart){

loginLeft = shiftStart - now

}else{

const estNow = new Date().toLocaleString("en-US",{timeZone:"America/New_York"})

const current = new Date(estNow)

const nextDay = getNextWorkingDay(current)

const [h,m] = agent.shiftStart.split(":").map(Number)

const nextShift = new Date(nextDay)

nextShift.setHours(h,m,0,0)

loginLeft = Math.floor((nextShift - current)/60000)

}

}

const logoutTime = agent ? timeToMinutes(agent.shiftEnd) : null

const nextEventTime = nextEvent ? nextEvent.time : null

const logoutLeft = agent ? getMinutesLeft(logoutTime) : null

const breakLeft = agent ? getMinutesLeft(nextEventTime) : null

const progress = agent ? getShiftProgress(agent) : 0

const status = agent ? getStatus(agent) : null

const logoutProgress = agent

? Math.min(
100,
Math.max(
0,
((now - timeToMinutes(agent.shiftStart)) /
(timeToMinutes(agent.shiftEnd) - timeToMinutes(agent.shiftStart))) * 100
)
)

: 0

/* ---------- UI ---------- */

return(

<div className="container">

<h1 className="title">Agent Break Tracker</h1>

<Link to="/team" className="nav-btn">Team Dashboard</Link>

<Select

options={options}

placeholder="Select Agent"

value={agent ? {label:agent.name,value:agents.indexOf(agent)} : null}

onChange={(option)=>{

const selectedAgent = agents[option.value]

setAgent(selectedAgent)

}}

styles={{

control:(base)=>({

...base,

borderRadius:"12px",

borderColor:"#d1d1d6",

padding:"4px",

boxShadow:"none"

}),

menu:(base)=>({

...base,

borderRadius:"12px",

overflow:"hidden"

})

}}

/>

{agent && (

<div>

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

time={loginLeft ? formatCountdown(loginLeft) : "Starting Soon"}

progress={loginLeft ? 30 : 100}

/>

<CircularTimer

title="Next Break"

time={

status === "Shift Finished"

? `${getNextWorkingDayLabel()} ${agent.breakAM}`

: breakLeft

? formatCountdown(breakLeft)

: "On Break"

}

progress={breakLeft ? 30 : 100}

/>

<CircularTimer

title="Logout Countdown"

time={

status === "Shift Finished"

? "Shift Over"

: logoutLeft

? formatCountdown(logoutLeft)

: "Logging Out"

}

progress={logoutProgress}

/>

</div>

<div className="cards">

<div className="card">

<p className="card-title">Status</p>

<p className="card-value">{status}</p>

</div>

<div className="card">

<p className="card-title">Next Event</p>

<p className="card-value">

{status === "Shift Finished" ? "Completed" : nextEvent?.label || "Pending"}

</p>

</div>

<div className="card">

<p className="card-title">Shift Start</p>

<p className="card-value">{agent.shiftStart}</p>

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

<p className="shift-title">Shift Remaining</p>

<p className="shift-value">

{getShiftRemaining(agent)}

</p>

</div>

<div className="shift-box">

<p className="shift-title">Shift Progress</p>

<div

style={{

width:"100%",

height:"12px",

background:"#e2e8f0",

borderRadius:"10px",

marginTop:"10px"

}}

>

<div

style={{

width:`${progress}%`,

height:"12px",

background:"#4f46e5",

borderRadius:"10px",

transition:"width 1s linear"

}}

/>

</div>

<p style={{marginTop:"8px",fontWeight:"bold"}}>

{status === "Shift Finished"

? "Shift Completed"

: `${progress}% Complete`}

</p>

</div>

</div>

)}

</div>

)

}
