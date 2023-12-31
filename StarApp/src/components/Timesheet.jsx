import { useEffect, useState } from "react";

import moment from "moment";

import axios from "axios";

import { useCookies } from "react-cookie";

import Calendar from "react-calendar";

import "react-calendar/dist/Calendar.css";

import Navbar from "./Navbar";

import SideNav from "./SideNav";

import Toast from "react-bootstrap/Toast";

import { MdInfoOutline } from "react-icons/md";

export default function Timesheet() {
  const [isLoading, setIsLoading] = useState(true); // State variable for managing loading state

  const [cookies, setCookie] = useCookies(["token"]); // State variable for managing cookies, specifically the 'token' cookie

  const [date, setDate] = useState(new Date()); //Variable to keep the selected date

  const [isCalendarOpen, setIsCalendarOpen] = useState(false); // State variable for controlling the visibility of the calendar component

  const dateContainer = []; // Array for storing current week's date-related data

  let [message, setMessage] = useState(""); // State variable for managing a message

  let [enableButton, setEB] = useState(false); // State variable for enabling/disabling the save and submit button

  const [projects, setProjects] = useState([]); // State variable for storing project-related data

  const [currentWeekStartDate, setCurrentWeekStartDate] = useState(
    moment().startOf("week")
  ); // State variable for storing the start date of the current week

  let [dateChange, setDateChange] = useState(0); // State variable for tracking date changes

  let [hours, setHours] = useState([]); // State variable for managing daily working hours

  const [projectInputValues, setProjectInputValues] = useState({}); // State variable for storing input values related to projects

  let [comment, setComment] = useState(""); // State variable for managing comments

  // This state variable manages the visibility of the toast.

  const [showToast, setShowToast] = useState(false);

  // This function is responsible for toggling the state of the showToast variable.

  const toggleShowToast = () => setShowToast(!showToast);

  // Update the moment.js locale to start the week on Monday

  moment.updateLocale(moment.locale(), {
    week: {
      dow: 1, // 1 = Monday
    },
  });

  // Function to open the calendar

  const openCalendar = (e) => {
    e.stopPropagation(); // Prevent click event from propagating to document

    setIsCalendarOpen(true);
  };

  // Function to close the calendar

  const closeCalendar = () => {
    setIsCalendarOpen(false);
  };

  // Function to handle clicks within the calendar

  const handleCalendarClick = (e) => {
    e.stopPropagation(); // Prevent click event from propagating to document

    setDateChange(dateChange + 1);

    setProjectInputValues({});
  };

  // Function to handle date changes

  const handleDateChange = (newDate) => {
    // Handle date change logic here

    setDate(newDate);

    setCurrentWeekStartDate(moment(newDate).startOf("week"));

    closeCalendar();

    //console.log(moment(moment(newDate).format("DD-MM-YYYY")))
  };

  // Fetch projects data from the server on component mount

  useEffect(() => {
    setIsLoading(true);

    axios({
      method: "get",

      url: "http://localhost:4000/project/resource",

      headers: {
        Authorization: `Bearer ${cookies.token}`,
      },
    }).then(
      function (response) {
        setProjects(response.data);

        setIsLoading(false);
      },
      function (error) {
        console.log("error: ", error);

        setIsLoading(false);
      }
    );
  }, []);

  // Function to navigate to the previous week

  function prevWeek() {
    setCurrentWeekStartDate(currentWeekStartDate.clone().subtract(1, "week"));

    setDateChange(dateChange + 1);

    setProjectInputValues({});
  }

  // Function to navigate to the next week

  function nextWeek() {
    setCurrentWeekStartDate(currentWeekStartDate.clone().add(1, "week"));

    setDateChange(dateChange + 1);

    setProjectInputValues({});
  }

  // useEffect to fetch attendance data when 'dateChange' changes

  useEffect(() => {
    setIsLoading(true);

    axios({
      method: "post",

      url: "http://localhost:4000/timesheet/getAttendance",

      data: {
        date: dateContainer[0],
      },

      headers: {
        Authorization: `Bearer ${cookies.token}`,
      },
    }).then(
      (response) => {
        setIsLoading(false);

        // Check if there's data, and enable the button if it's not empty

        if (response.data.length != 0) {
          setEB(true);
        }

        // Map response data to 'hours' state

        setHours(
          response.data.map((item) => {
            return {
              projectID: item.projectID,

              hours: item.hours,
            };
          })
        );
      },
      (error) => {
        setIsLoading(false);

        console.log("error: ", error);
      }
    );
  }, [dateChange]);

  // useEffect to merge 'hours' data into 'projectInputValues'

  useEffect(() => {
    // Convert 'hours' data into an object with project IDs as keys

    let temp = hours.map((item) => {
      return {
        [item.projectID]: item.hours,
      };
    });

    let mergedValues = { ...projectInputValues }; // Create a copy of the existing object

    temp.forEach((item) => {
      for (let key in item) {
        mergedValues[key] = item[key]; // Merge each key-value pair into the object
      }
    });

    // Update 'projectInputValues' with the merged values

    setProjectInputValues(mergedValues);
  }, [hours]);

  // Function to update input values for a specific project

  function handleInputChange(projectID, dayIndex, value) {
    setEB(true);

    // Copy the current input values

    const updatedInputValues = { ...projectInputValues };

    // Get or create the project's input values object

    if (!updatedInputValues[projectID]) {
      updatedInputValues[projectID] = Array(7).fill(0);
    }

    // Update the input value for the specific day

    updatedInputValues[projectID][dayIndex] = value;

    // Update the state

    setProjectInputValues(updatedInputValues);
  }

  // Function to render week dates for the calendar

  const renderWeekDates = () => {
    const dates = [];

    const startOfWeek = currentWeekStartDate.clone().startOf("week");

    const endOfWeek = currentWeekStartDate.clone().endOf("week");

    while (startOfWeek.isSameOrBefore(endOfWeek)) {
      dates.push(startOfWeek.format("dddd DD-MMM-YY"));

      dateContainer.push(startOfWeek.format("YYYY-MM-DD"));

      startOfWeek.add(1, "day");
    }

    return dates.map((date) => {
      const day = date.split(" ");

      return (
        <td key={date}>
          <span style={{ fontWeight: "600" }}>{day[0]}</span>
          <br />
          <span style={{ fontWeight: "400" }}>{day[1]}</span>
        </td>
      );
    });
  };

  // Function to handle comment input change

  function handleComment(event) {
    setComment(event.target.value);
  }

  // Function to save attendance data

  function handleSave() {
    setIsLoading(true);

    axios({
      method: "post",

      url: "http://localhost:4000/timesheet/saveAttendance",

      data: {
        weekStartDate: dateContainer[0],

        hours: projectInputValues,
      },

      headers: {
        Authorization: `Bearer ${cookies.token}`,
      },
    }).then(
      (response) => {
        setIsLoading(false);

        setMessage(response.data.message);

        setShowToast(true);
      },
      (error) => {
        setIsLoading(false);

        setMessage(error.message);

        setShowToast(true);

        console.log("error: ", error);
      }
    );
  }

  // Function to submit timesheet data

  function handleSubmit() {
    setIsLoading(true);

    axios({
      method: "post",

      url: "http://localhost:4000/timesheet/submitTimesheet",

      data: {
        weekStartDate: dateContainer[0],

        hours: projectInputValues,

        comment: comment,
      },

      headers: {
        Authorization: `Bearer ${cookies.token}`,
      },
    }).then(
      (response) => {
        setIsLoading(false);

        setMessage(response.data.message);

        setShowToast(true);
      },
      (error) => {
        setIsLoading(false);

        setMessage(error.message);

        setShowToast(true);

        console.log("error: ", error);
      }
    );
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
          <div className="timesheet-container">
            <div className="d-flex justify-content-between p-4">
              <span
                className="h1"
                style={{ fontWeight: "350", verticalAlign: "middle" }}
              >
                Create Timesheet
              </span>

              <span>
                <button
                  style={{ padding: "2px 12px 10px 12px" }}
                  className="btn btn-outline-dark calander-btn m-1"
                  onClick={openCalendar}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-calendar-date"
                    viewBox="0 0 16 16"
                  >
                    <path d="M6.445 11.688V6.354h-.633A12.6 12.6 0 0 0 4.5 7.16v.695c.375-.257.969-.62 1.258-.777h.012v4.61h.675zm1.188-1.305c.047.64.594 1.406 1.703 1.406 1.258 0 2-1.066 2-2.871 0-1.934-.781-2.668-1.953-2.668-.926 0-1.797.672-1.797 1.809 0 1.16.824 1.77 1.676 1.77.746 0 1.23-.376 1.383-.79h.027c-.004 1.316-.461 2.164-1.305 2.164-.664 0-1.008-.45-1.05-.82h-.684zm2.953-2.317c0 .696-.559 1.18-1.184 1.18-.601 0-1.144-.383-1.144-1.2 0-.823.582-1.21 1.168-1.21.633 0 1.16.398 1.16 1.23z" />

                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
                  </svg>
                </button>

                {isCalendarOpen && (
                  <div className="calendar-overlay" onClick={handleCalendarClick}>
                    <div className={`calendar-container`}>
                      <Calendar
                        className={`${isCalendarOpen ? "calendar-active" : ""}`}
                        onChange={handleDateChange}
                        value={date}
                      />

                      <div className="d-flex justify-content-center">
                        <button
                          className="btn btn-dark m-3"
                          onClick={closeCalendar}
                        >
                          Back to Timesheet
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <button onClick={prevWeek} className="btn btn-outline-dark m-1">
                  Previous Week
                </button>

                <button onClick={nextWeek} className="btn btn-outline-dark m-1">
                  Next Week
                </button>
              </span>
            </div>

            <table className="table">
              <thead className="table-secondary">
                <tr>
                  <th
                    style={{
                      fontSize: "26px",
                      fontWeight: "350",
                      verticalAlign: "middle",
                    }}
                    scope="col"
                  >
                    Projects
                  </th>

                  {renderWeekDates()}
                </tr>
              </thead>

              <tbody>
                {projects.map((project) => {
                  let projectHours = [];

                  let data = projectInputValues[project._id] ?? [];

                  if (data.length == 0) {
                    projectHours = Array(7).fill(0);
                  } else {
                    projectHours = data;
                  }

                  return (
                    <tr key={project.id}>
                      <th
                        className="p-3 projectName"
                        style={{ fontWeight: "350", verticalAlign: "middle" }}
                      >
                        {project.projectName}

                        <br />

                        {project.id}
                      </th>

                      {projectHours &&
                        projectHours.map((pHour, dayIndex) => {
                          return (
                            <td key={dayIndex} className={`col-xs-2 ${(dayIndex == 5 || dayIndex == 6) ? "table-warning" : ""}`}>
                              <input
                                type="number"
                                value={pHour}
                                onChange={(e) => {
                                  if (e.target.value > 24 || e.target.value < 0) {
                                    setMessage("Enter a valid value!");

                                    setShowToast(true);
                                  } else {
                                    handleInputChange(
                                      project._id,
                                      dayIndex,
                                      e.target.value
                                    );
                                  }
                                }}
                                className={`timesheet-input no-spinners shadow ${pHour < 0 || pHour > 24 ? "is-invalid" : ""
                                  }`}
                                min="0"
                                max="24"
                              />
                            </td>
                          );
                        })}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="p-4">
              <textarea
                onChange={handleComment}
                className="form-control border border-secondary"
                placeholder="Add Comments"
                rows="3"
              ></textarea>
            </div>

            {enableButton && (
              <div className="d-flex justify-content-end p-4">
                <button onClick={handleSave} className="btn btn-outline-dark m-1">
                  Save
                </button>

                <button onClick={handleSubmit} className="btn btn-dark m-1">
                  Submit
                </button>
              </div>
            )}

            {!enableButton && (
              <div className="d-flex justify-content-end p-4">
                <button
                  disabled
                  onClick={handleSave}
                  className="btn btn-outline-dark m-1"
                >
                  Save
                </button>

                <button
                  disabled
                  onClick={handleSubmit}
                  className="btn btn-dark m-1"
                >
                  Submit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Toast
        show={showToast}
        onClose={toggleShowToast}
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "400px", // Adjust the width as per your requirement
        }}
      >
        <Toast.Body className="bg-success text-white">
          <strong>
            <MdInfoOutline size={25} /> {message}
          </strong>
          <button
            type="button"
            className="btn-close btn-close-white float-end"
            onClick={toggleShowToast}
          ></button>
        </Toast.Body>
      </Toast>
    </>
  );
}
