import { RiArrowDropDownLine } from "react-icons/ri"
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Link } from "react-router-dom";
import SideNav from "./SideNav";
import axios from "axios";
import moment from 'moment';
import Modal from 'react-bootstrap/Modal';

import Toast from 'react-bootstrap/Toast';

import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Navbar from "./Navbar";

export default function HomePage() {

  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [message, setMessage] = useState("");
  const [level, setLevel] = useState(1);

  const steps = selectedTimesheet
    ? [`Submitted on ${moment(selectedTimesheet.submissionDate).format('MMM D, YYYY')}`, `Project Manager\n${selectedTimesheet.status}`, 'Approved']
    : ['Manager Approval', 'Approved'];

  const [show, setShow] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const toggleShowToast = () => setShowToast(!showToast);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

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

  let [isLoading, setIsLoading] = useState(true);
  let [isDeleted, setIsDeleted] = useState(0);
  const [cookies, setCookie] = useCookies(['token']);
  const [timesheets, setTimesheets] = useState([]);

  useEffect(() => {
    setIsLoading(true)
    axios({
      method: "get",
      url: "http://localhost:4000/timesheet/",
      headers: {
        'Authorization': `Bearer ${cookies.token}`,
      }
    }).then((response) => {
      setTimesheets(response.data.timesheets)
      setIsLoading(false)
    })
  }, [isDeleted])

  function handleDelete(timesheetID) {
    setIsLoading(true)
    axios({
      method: "delete",
      url: "http://localhost:4000/timesheet/",
      data: {
        _id: timesheetID
      },
      headers: {
        'Authorization': `Bearer ${cookies.token}`,
      }
    }).then((response) => {
      setMessage(response.data.message);
      setShowToast(true);
      setIsDeleted(isDeleted + 1);
      setIsLoading(false)
    })
  }

  return (
    <>

      <Modal className="modal" show={show} onHide={handleClose} animation={false}>
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
                <th scope="col" style={{ textAlign: "center" }}>Date</th>
                <th scope="col" style={{ textAlign: "center" }}>Hours</th>
              </tr>
            </thead>
            <tbody>
              {selectedTimesheet && selectedTimesheet.totalHours.map((item, index) => (
                <tr key={index}>
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
        </div>}
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
      <div className="row homePage">
        <div className="col-lg-1 mt-6">
        <SideNav />
        </div>
        <div className="col-lg-11 mt-6">
        <div className="table-container">
          <div className="timesheet-header d-flex justify-content-between">
            <h3 className="h2 m-2" style={{ fontWeight: "350", verticalAlign: 'middle' }}>My Timesheets</h3>
            <Link to="/create-timesheet">
              <button className="btn btn-outline-dark m-2">Create Timesheet</button>
            </Link>
          </div>
          <table className="table">
            <thead>
              <tr style={{ fontWeight: "600" }}>
                <th scope="col" style={{ textAlign: "center" }}>Time Period</th>
                <th scope="col" style={{ textAlign: "center" }}>Project</th>
                <th scope="col" style={{ textAlign: "center" }}>Total Hours</th>
                <th scope="col" style={{ textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody className="timesheetTable">
              {
                timesheets.map((timesheet) => {

                  let statusClass = "primary"

                  if (timesheet.status == "Pending") {
                    statusClass = "primary"
                  } else if (timesheet.status == "Rejected") {
                    statusClass = "danger"
                  } else if (timesheet.status == "Accepted") {
                    statusClass = "success"
                  } else {
                    statusClass = "secondary"
                  }

                  const hours = timesheet.totalHours.reduce((accumulator, currentValue) => {
                    return accumulator + currentValue;
                  }, 0);

                  return (

                    <tr className="timesheetTable" style={{ fontWeight: "350", verticalAlign: 'middle' }} key={timesheet._id}>


                      <td scope=" d-flex" style={{ textAlign: "center" }}>{moment(timesheet.startDate).format("MMM D")} - {moment(timesheet.endDate).format("MMM D, YY")}</td>
                      <td style={{ textAlign: "center" }}>{timesheet.projectName}</td>
                      <td style={{ textAlign: "center" }}>{hours}</td>
                      <td style={{ textAlign: "center" }}><span className={`badge bg-${statusClass} text-light`}>{timesheet.status}</span></td>
                      <td>
                        {/* Add the dropdown menu */}
                        <div className="dropdown">
                          <button
                            className="btn"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                              <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                            </svg>
                          </button>
                          <ul
                            className="dropdown-menu"
                            aria-labelledby={`dropdownMenuButton${timesheet.projectID}`}
                          >
                            <li>
                              <a onClick={() => handleRowClick(timesheet)}
                                className={`dropdown-item`} href="#">
                                View Details
                              </a>
                            </li>
                            <li>
                              <a onClick={(e) => {
                                handleDelete(timesheet._id)
                              }} className={`dropdown-item${timesheet.status !== 'Pending' ? ' disabled' : ''}`} href="#">
                                Delete
                              </a>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              end: 0,
              padding: '1rem',
            }}
          >
            <Toast show={showToast} delay={5000} autohide onClose={toggleShowToast} style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}>
              <Toast.Body className="bg-success text-white">
                <strong>{message}</strong>
                <button type="button" className="btn-close btn-close-white float-end" onClick={toggleShowToast}></button>
              </Toast.Body>
            </Toast>
          </div>
        </div>
        </div>
      </div>
    </>
  )
}