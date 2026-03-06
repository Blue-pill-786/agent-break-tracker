import { BrowserRouter, Routes, Route } from "react-router-dom"

import Dashboard from "./pages/Dashboard"
import TeamDashboard from "./pages/TeamDashboard"
import AgentDashboard from "./pages/AgentDashboard"

function App(){

return(

<BrowserRouter>

<Routes>


<Route path="/" element={<Dashboard/>} />

<Route path="/team" element={<TeamDashboard/>} />

<Route path="/agent/:agentId" element={<AgentDashboard/>}/>

<Route path="*" element={<Dashboard />} />

</Routes>

</BrowserRouter>

)

}

export default App