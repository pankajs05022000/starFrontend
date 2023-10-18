import { Link } from "react-router-dom";
import SideNav from "./SideNav";
import Header from "./Header";
import TicketCard from "./TicketCard";
import { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import Navbar from "./Navbar";

export default function Tickets() {

    const [isLoading, setIsLoading] = useState(true);
    const [cookies, setCookie] = useCookies(['token']);
    const [ticketsData, setTicketsData] = useState([]);

    useEffect(() => {
        axios({
            method: "get",
            url: "http://localhost:4000/ticket/raised",
            headers: {
                'Authorization': `Bearer ${cookies.token}`,
            }
        }).then((response) => {
            setTicketsData(response.data.tickets);
            setIsLoading(false);
        })
    })

    return (
        <>
            <Navbar />
            <div className="row">
                <div className="col-lg-1 mt-6">
                <SideNav />
                </div>
                <div className="col-lg-11 mt-6">
                <div className="ticketsContainer ">
                    <Header />
                    <div className="d-flex p-3">
                        <div className="recentTickets">
                            <div>
                                {
                                    ticketsData.map((ticket) => {
                                        return (
                                            <TicketCard key={ticket._id} ticket={ticket} />
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </>
    );
}