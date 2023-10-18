import axios from "axios";
import { useState } from "react";
import { useCookies } from "react-cookie";

export default function CreateProject({ closeWin, setMessage, setShowToast }) {
    const [cookies] = useCookies(["token"]);
    const [project, setProject] = useState({
        projectName: "",
        description: "",
        vertical: "",
        horizontal: "",
        subHorizontal: "",
        customerName: "",
        customerID: "",
    });

    function handleChange(e) {
        const { name, value } = e.target;
        setProject({ ...project, [name]: value });
    }

    function handleSubmit(e) {
        e.preventDefault();
        axios({
            method: "post",
            url: "http://localhost:4000/project/create",
            data: project,
            headers: {
                Authorization: `Bearer ${cookies.token}`,
            },
        })
            .then((response) => {
                setMessage(response.data.message);
                setShowToast(true);
                closeWin();
            })
            .catch((error) => {
                console.log("error: ", error);
            });
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Project Name</label>
                    <input
                        className="form-control"
                        name="projectName"
                        value={project.projectName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Project Code</label>
                    <input
                        className="form-control"
                        name="id"
                        value={project.id}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Description</label>
                    <input
                        className="form-control"
                        name="description"
                        value={project.description}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Vertical</label>
                    <input
                        className="form-control"
                        name="vertical"
                        value={project.vertical}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Horizontal</label>
                    <input
                        className="form-control"
                        name="horizontal"
                        value={project.horizontal}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Sub-Horizontal</label>
                    <input
                        className="form-control"
                        name="subHorizontal"
                        value={project.subHorizontal}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Customer Name</label>
                    <input
                        className="form-control"
                        name="customerName"
                        value={project.customerName}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Customer ID</label>
                    <input
                        className="form-control"
                        name="customerID"
                        value={project.customerID}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit" className="btn btn-outline-primary">
                    Add Project
                </button>
            </form>
        </div>
    );
}
