import axios from "axios";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";

export default function TicketCard({ticket}) {

    const [image, setImage] = useState({});
    const [cookies, setCookie] = useCookies(['token']);

    let statusClass = "primary";

    if(ticket.status == "Pending") {
        statusClass="primary"
    } else if(ticket.status == "Rejected") {
        statusClass="danger"
    } else if(ticket.status == "Approved") {
        statusClass="success"
    } else {
        statusClass="info"
    }

    useEffect(() => {
        if (cookies.token) {
          axios({
            method: "get",
            url: "http://localhost:4000/user/profile",
            headers: {
              'Authorization': `Bearer ${cookies.token}`,
            }
          }).then((response) => {
            setImage(response.data.image)
          })
        }
      }, [])

    return (
        <>
            <div className="m-6" style={{ width: '83vw' }}>
                <ul>
                    <li>
                        <div className="shadow-lg p-3 ticketcard">
                            <div className="d-flex">
                                <div><img src={image.url} alt="User" className="user-image mb-3" style={{ width: "70px", height: "70px", borderRadius: "50%" }} /></div>
                                <div className="p-3"> <span className="h3" style={{ fontWeight: "500"}}>{ticket.subject} </span><span class={`badge text-bg-${statusClass} text-white`}>{ticket.status}</span></div>
                                                           
                            </div>
                            <div className="mb-3">
                            <div><strong>Category: </strong>{ticket.category}</div> 
                            {
                                ticket.category == "Projects Inquiries" && (
                                    <div><strong>Project Code: </strong>{ticket.projectCode}</div>
                                )
                            }
                            </div>
                            <p>{ticket.description}</p>
                        </div>
                    </li>
                </ul>
            </div>
        </>
    );
}