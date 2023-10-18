import { FcInfo } from "react-icons/fc";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import Modal from 'react-bootstrap/Modal';
import SideNav from "./SideNav";
import axios from "axios";
import Navbar from "./Navbar";
import moment from 'moment';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { Link } from "react-router-dom";
import Toast from 'react-bootstrap/Toast';
import { MdInfoOutline } from "react-icons/md";
import Card from 'react-bootstrap/Card';


export default function ApprovalPage() {

    const [selectedTimesheet, setSelectedTimesheet] = useState(null);
    const [level, setLevel] = useState(1);

    let [isLoading, setIsLoading] = useState(true);
    let [render, setRender] = useState(0)
    const [cookies, setCookie] = useCookies(['token']);
    const [timesheets, setTimesheets] = useState([]);

    const steps = selectedTimesheet
        ? [`Submitted on ${moment(selectedTimesheet.submissionDate).format('MMM D, YYYY')}`, `Project Manager\n${selectedTimesheet.status}`, 'Approved']
        : ['Manager Approval', 'Approved'];

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [message, setMessage] = useState(""); // State variable for managing a message
    const [remarks, setRemarks] = useState("");

    // This state variable manages the visibility of the toast. 
    const [showToast, setShowToast] = useState(false);

    // This function is responsible for toggling the state of the showToast variable.
    const toggleShowToast = () => setShowToast(!showToast);

    // Function to handle row click and set submission date
    const handleRowClick = (timesheet) => {
        setSelectedTimesheet(timesheet);

        if (timesheet.status == "Accepted") {
            setLevel(3);
        }

        else if (timesheet.status == "Rejected") {
            setLevel(1);
        }

        //setSubmissionDate(moment(timesheet.submissionDate).format('MMM D, YYYY'));
        handleShow(); // Open the modal
    };

    function handleRemarks(event) {
        setRemarks(event.target.value);
    }

    const pendingTimesheets = timesheets.filter((timesheet) => {
        return timesheet.status === "Pending";
    });

    useEffect(() => {
        setIsLoading(true)
        axios({
            method: "get",
            url: "http://localhost:4000/timesheet/manager",
            headers: {
                'Authorization': `Bearer ${cookies.token}`,
            }
        }).then((response) => {
            setTimesheets(response.data.timesheets)
            setIsLoading(false)
        })
    }, [render])

    function handleAccept(timesheetID) {
        axios({
            method: "post",
            url: "http://localhost:4000/timesheet/status",
            data: {
                ID: timesheetID,
                remarks: remarks,
                status: "Accepted"
            },
            headers: {
                'Authorization': `Bearer ${cookies.token}`,
            }
        }).then((response) => {
            setMessage(response.data.message);
            setShowToast(true);
            setShow(false);
            setRender(render + 1);
        })
    }

    function handleReject(timesheetID) {
        axios({
            method: "post",
            url: "http://localhost:4000/timesheet/status",
            data: {
                ID: timesheetID,
                remarks: remarks,
                status: "Rejected"
            },
            headers: {
                'Authorization': `Bearer ${cookies.token}`,
            }
        }).then((response) => {
            setMessage(response.data.message);
            setShowToast(true);
            setShow(false);
            setRender(render + 1);
        })
    }

    return (
        <>
            <Modal show={show} onHide={handleClose} animation={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Activity</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Box sx={{ width: '100%' }}>
                        <Stepper activeStep={level} alternativeLabel>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>
                </Modal.Body>
                <Modal.Footer>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col" style={{ textAlign: "center" }}>Day</th>
                                <th scope="col" style={{ textAlign: "center" }}>Date</th>
                                <th scope="col" style={{ textAlign: "center" }}>Hours</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedTimesheet && selectedTimesheet.totalHours.map((item, index) => (
                                <tr key={index}>
                                    <td style={{ textAlign: "center" }}>{moment(selectedTimesheet.startDate).clone().add(index, 'days').format('dddd')}</td>
                                    <td style={{ textAlign: "center" }}>{moment(selectedTimesheet.startDate).clone().add(index, 'days').format('MMM DD, YYYY')}</td>
                                    <td style={{ textAlign: "center" }}>{item}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Modal.Footer>
                {selectedTimesheet && <div className="d-flex justify-content-around m-2 p-2">
                    <span>
                        <strong>Total Hours:</strong> {selectedTimesheet.totalHours.reduce((accumulator, currentValue) => {
                            return accumulator + currentValue;
                        }, 0)}
                    </span>
                    <br />
                    <span>
                        <strong>Expected Hours:</strong> {selectedTimesheet.expectedHours}
                    </span>
                </div>}
                <div>
                    <Card
                        style={{ "backgroundColor": "#043365", width: '18rem' }}
                        text={'white'}
                        className="mx-4 mb-3"
                    >
                        <Card.Header>Comment:</Card.Header>
                        <Card.Body className="p-3">
                            <Card.Text>
                                {selectedTimesheet && selectedTimesheet.comment && (selectedTimesheet.comment)}
                                {selectedTimesheet && !selectedTimesheet.comment && "NA"}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </div>
                <div className="d-flex justify-content-end">
                    <Card
                        text={'white'}
                        style={{ "backgroundColor": "#e06e02", width: '18rem' }}
                        className="mx-4 mb-3"
                    >
                        <Card.Header>Remark:</Card.Header>
                        <Card.Body className="p-3">
                            <Card.Text>
                                {
                                    selectedTimesheet && selectedTimesheet.remarks && (
                                        <div>{selectedTimesheet.remarks}</div>
                                    )
                                }
                                {
                                    selectedTimesheet && !selectedTimesheet.remarks && (
                                        <input type="text" onChange={(e) => handleRemarks(e)} placeholder="Add Remarks Here" className="form-control" />
                                    )
                                }
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </div>
                <div className="d-flex justify-content-center mb-4">
                    <button
                        className="btn btn-outline-success mx-1"
                        onClick={() => handleAccept(selectedTimesheet._id)}
                    >
                        Accept
                    </button>
                    <button
                        className="btn btn-outline-danger mx-1"
                        onClick={() => handleReject(selectedTimesheet._id)}
                    >
                        Reject
                    </button>
                </div>
            </Modal>
            {isLoading && (
                <div className="loader-overlay">
                    <div className="bouncing-loader">
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                </div>
            )}
            <Navbar />
            <div className="row">
                <div className="col-lg-1 mt-6">
                    <SideNav />
                </div>
                <div className="col-lg-11 mt-6">
                    <div className="table-container">
                        <div className="timesheet-header d-flex justify-content-between">
                            <h3 className="h2 m-2" style={{ fontWeight: "350", verticalAlign: 'middle' }}>Manager's Desk</h3>
                            <Link to="/manager-activities">
                                <button className="btn btn-outline-dark m-2">Activities</button>
                            </Link>
                        </div>
                        <table className="table">
                            <thead>
                                <tr style={{ fontWeight: "600" }}>
                                    <th scope="col" style={{ textAlign: "center" }}>Time Period</th>
                                    <th scope="col" style={{ textAlign: "center" }}>Project</th>
                                    <th scope="col" style={{ textAlign: "center" }}>Member</th>
                                    <th scope="col" style={{ textAlign: "center" }}>Total Hours</th>
                                    <th scope="col" style={{ textAlign: "center" }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    pendingTimesheets.map((timesheet) => {

                                        const hours = timesheet.totalHours.reduce((accumulator, currentValue) => {
                                            return accumulator + currentValue;
                                        }, 0);

                                        return (
                                            <tr style={{ fontWeight: "350", verticalAlign: 'middle' }} key={timesheet._id}>
                                                <td scope=" d-flex" style={{ textAlign: "center" }}>{moment(timesheet.startDate).format("MMM D")} - {moment(timesheet.endDate).format("MMM D, YY")}</td>
                                                <td style={{ textAlign: "center" }}>{timesheet.projectName}</td>
                                                <td style={{ textAlign: "center" }}>{timesheet.name}</td>
                                                <td style={{ textAlign: "center" }}>{hours}</td>
                                                <td style={{ textAlign: "center" }}>
                                                    <button onClick={() => handleRowClick(timesheet)} className="btn btn-outline-primary">React</button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
                <Toast className="p-0" delay={5000} autohide show={showToast} onClose={toggleShowToast} style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}>
                    <Toast.Body className="bg-success text-white">
                        <strong><MdInfoOutline size={25} /> {message}</strong>
                        <button type="button" className="btn-close btn-close-white float-end" onClick={toggleShowToast}></button>
                    </Toast.Body>
                </Toast>
            </div>
        </>
    )
}