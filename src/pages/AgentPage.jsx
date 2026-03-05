import { useParams } from "react-router-dom"
import { agents } from "../data/agents"
import Dashboard from "./Dashboard"

export default function AgentPage(){

const { agentId } = useParams()

const agent = agents.find(a => a.id === agentId)

if(!agent){
return <div style={{padding:"20px"}}>Agent not found</div>
}

return <Dashboard initialAgent={agent}/>

}
