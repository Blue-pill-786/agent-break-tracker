import { useParams, Link } from "react-router-dom"
import { agents } from "../data/agents"
import Dashboard from "./Dashboard"

export default function AgentPage(){

const { agentId } = useParams()

const agent = agents.find(a => a.id === agentId)

if(!agent){

return(
<div style={{padding:"20px"}}>

<h2>Agent not found</h2>

<Link to="/team" style={{marginTop:"10px",display:"inline-block"}}>
Back to Team Dashboard
</Link>

</div>
)

}

return <Dashboard initialAgent={agent}/>

}