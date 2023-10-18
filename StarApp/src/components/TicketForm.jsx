import axios from "axios";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import Select from 'react-select'

export default function TicketForm({closeWin, setMessage, setShowToast}) {

    const [cookies, setCookie] = useCookies(['token']);

    const [projects, setProjects] = useState("");

    const [subject, setSubject] = useState("");
    const [category, setCategory] = useState("");
    const [projectID, setProjectID] = useState("");
    const [description, setDescription] = useState("");

    const [showProjectField, setShowProjectField] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);

    const [projectOptions, setProjectOptions] = useState([])

    useEffect(() => {
        axios({
            method: "get",
            url: "http://localhost:4000/project/all",
            headers: {
                'Authorization': `Bearer ${cookies.token}`,
            }
        }).then(function (response) {
            
            setProjects(response.data)

            setProjectOptions(response.data.map((item) => {
                return ({
                    value: item._id,
                    label: item.id
                })
            }))
            
        }, function (error) {
            console.log("error: ", error)
        })
    }, [])

    const handleSubject = (e) => {
        setSubject(e.target.value);
    }

    const handleCategory = (e) => {
        setCategory(e.target.value);
        if (e.target.value === "Projects Inquiries") {
            setShowProjectField(true);
        } else {
            setShowProjectField(false);
        }
    }

    const handleProjectID = (option) => {
        setProjectID(option)
    }

    const handleDescription = (e) => {
        setDescription(e.target.value);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormSubmitted(true);

        axios({
            method: "post",
            url: "http://localhost:4000/ticket/create",
            data: {
                subject,
                category,
                projectID: showProjectField ? projectID.value : null,
                description,
            },
            headers: {
                'Authorization': `Bearer ${cookies.token}`,
            }
        }).then(function (response) {
            setMessage(response.data.message);
            setShowToast(true);
            closeWin();
        }, function (error) {
            console.log("error: ", error);
        })
    }

    return (
        <div>
            <form onSubmit={handleSubmit} className={`needs-validation ${formSubmitted ? 'was-validated' : ''}`} noValidate>
                <div className="mb-3 m-2">
                    <label htmlFor="subject" className="col-form-label">Subject</label>
                    <input
                        type="text"
                        className="form-control"
                        onChange={handleSubject}
                        id="subject"
                        required
                    />
                    <div className="invalid-feedback">Please provide a subject.</div>
                </div>
                <div className="mb-3 m-2">
                    <label htmlFor="category" className="col-form-label">Category</label>
                    <select
                        className="form-select"
                        onChange={handleCategory}
                        id="category"
                        value={category}
                        required
                    >
                        <option value="" disabled>Select Category</option>
                        <option value="Projects Inquiries">Projects Inquiries</option>
                        <option value="Technical Issue">Technical Issue</option>
                    </select>
                    <div className="invalid-feedback">Please select a category.</div>
                </div>
                {showProjectField && <div className="mb-3 m-2">
                    <label htmlFor="projectID">Project ID</label>
                    <Select
                        id="projectID"
                        name="projectID"
                        value={projectID}
                        onChange={handleProjectID}
                        options={projectOptions}
                        placeholder="Select Project ID"
                    />
                </div>}
                <div className="mb-3 m-2">
                    <label htmlFor="message-text" className="col-form-label">Message</label>
                    <textarea
                        className="form-control"
                        onChange={handleDescription}
                        id="message-text"
                        required
                    ></textarea>
                    <div className="invalid-feedback">Please provide a message.</div>
                </div>
                <div className="mb-3 m-2">
                    <button type="submit" className="btn btn-dark">Submit</button>
                </div>
            </form>
        </div>
    )
}
