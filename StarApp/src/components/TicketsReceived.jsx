import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import SideNav from "./SideNav";
import axios from "axios";
import Navbar from "./Navbar";
import Header from "./Header";
import Toast from 'react-bootstrap/Toast';
import { MdInfoOutline } from "react-icons/md";

export default function TicketsReceived() {

    const [isLoading, setIsLoading] = useState(true);
    const [cookies, setCookie] = useCookies(['token']);
    const [tickets, setTickets] = useState([]);

    let [message, setMessage] = useState(""); // State variable for managing a message

    // This state variable manages the visibility of the toast. 
    const [showToast, setShowToast] = useState(false);

    // This function is responsible for toggling the state of the showToast variable.
    const toggleShowToast = () => setShowToast(!showToast);

    useEffect(() => {
        setIsLoading(true)
        axios({
            method: "get",
            url: "http://localhost:4000/ticket/received",
            headers: {
                'Authorization': `Bearer ${cookies.token}`,
            }
        }).then((response) => {
            setTickets(response.data.tickets)
            setIsLoading(false)
        })
    }, [message])

    function handleElevate(id) {
        setIsLoading(true)
        axios({
            method: "patch",
            url: "http://localhost:4000/ticket/elevate",
            data: {
                ticketID: id,
                elevate: true
            },
            headers: {
                'Authorization': `Bearer ${cookies.token}`,
            }
        }).then((response) => {
            setMessage(response.data.message);
            setShowToast(true);
            setIsLoading(false);
        })
    }

    function handleReject(id) {
        setIsLoading(true)
        axios({
            method: "patch",
            url: "http://localhost:4000/ticket/elevate",
            data: {
                ticketID: id,
                elevate: false
            },
            headers: {
                'Authorization': `Bearer ${cookies.token}`,
            }
        }).then((response) => {
            setMessage(response.data.message);
            setShowToast(true);
            setIsLoading(false);
        })
    }

    return (
        <>
            <Navbar />
            {isLoading && (
                <div className="loader-overlay">
                    <div className="bouncing-loader">
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                </div>
            )}
            <div className="row">
                <div className="col-lg-1 mt-6">
                <SideNav />
                </div>
                <div className="col-lg-11 mt-6">
                <div className="ticketsContainer ">
                    <Header isManager={true} />
                    <div className="d-flex p-3">
                        <div className="recentTickets">
                            <div>
                                {tickets.map((ticket) => {

                                    let statusClass = "primary";

                                    if (ticket.status == "Pending") {
                                        statusClass = "primary"
                                    } else if (ticket.status == "Rejected") {
                                        statusClass = "danger"
                                    } else if (ticket.status == "Approved") {
                                        statusClass = "success"
                                    } else {
                                        statusClass = "info"
                                    }

                                    return (
                                        <div key={ticket._id} className="m-6" style={{ width: '83vw' }}>
                                            <ul>
                                                <li>
                                                    <div className="shadow-lg p-3 ticketcard">
                                                        <div className="d-flex">
                                                            <div><img src={ticket.image.url} alt="User" className="user-image mb-3" style={{ width: "70px", height: "70px", borderRadius: "50%" }} /></div>
                                                            <div className="p-3"> <span className="h3" style={{ fontWeight: "500" }}>{ticket.name} </span><span className={`badge text-bg-${statusClass} text-white`}>{ticket.status}</span></div>
                                                        </div>
                                                        <div className="mb-3">
                                                            <div><strong>Subject: </strong>{ticket.subject}</div>
                                                            <div><strong>Category: </strong>{ticket.category}</div>
                                                            {
                                                                ticket.category == "Projects Inquiries" && (
                                                                    <div><strong>Project Code: </strong>{ticket.projectID}</div>
                                                                )
                                                            }
                                                        </div>
                                                        <p>{ticket.description}</p>
                                                        {ticket.status == "Pending" && <div>
                                                            <button onClick={() => { handleElevate(ticket._id) }} className="btn btn-outline-success mx-1">
                                                                Elevate
                                                            </button>
                                                            <button onClick={() => { handleReject(ticket._id) }} className="btn btn-outline-danger mx-1">
                                                                Reject
                                                            </button>
                                                        </div>}
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    )
                                })}

                            </div>

                            <div>


                            </div>
                        </div>
                    </div>
                </div>
                </div>
                <Toast delay={5000} autohide show={showToast} onClose={toggleShowToast} style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}>
                    <Toast.Body className="bg-success text-white">
                        <strong><MdInfoOutline size={25} /> {message}</strong>
                        <button type="button" className="btn-close btn-close-white float-end" onClick={toggleShowToast}></button>
                    </Toast.Body>
                </Toast>
            </div>
        </>
    )
}