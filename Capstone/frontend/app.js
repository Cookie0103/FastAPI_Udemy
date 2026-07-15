const API_BASE_URL = "http://127.0.0.1:8000";
const registerForm = document.getElementById("register-form");
const registerUsername = document.getElementById("register-username");
const registerPassword = document.getElementById("register-password");
const registerRole = document.getElementById("register-role");
const registerMessage = document.getElementById("register-message");

const loginForm = document.getElementById("login-form");
const loginUsername = document.getElementById("login-username");
const loginPassword = document.getElementById("login-password");
const loginMessage = document.getElementById("login-message");

const currentUserMessage = document.getElementById("current-user");
const logoutButton = document.getElementById("logout-button");

const createRequestForm = document.getElementById("create-request-form");
const requestTitle = document.getElementById("request-title");
const requestDescription = document.getElementById("request-description");
const requestCategory = document.getElementById("request-category");
const requestPriority = document.getElementById("request-priority");
const createRequestMessage = document.getElementById("create-request-message");

const requestListMessage = document.getElementById("request-list-message");
const requestList = document.getElementById("request-list");

const statusFilter = document.getElementById("status-filter");
const priorityFilter = document.getElementById("priority-filter");
const filterButton = document.getElementById("filter-button");

const adminMessage = document.getElementById("admin-message");
const adminResults = document.getElementById("admin-results");
const loadAdminUsersButton = document.getElementById("load-admin-users-button");
const loadAdminRequestsButton = document.getElementById("load-admin-requests-button");

const registerSection = document.getElementById("register-section");
const loginSection = document.getElementById("login-section");
const currentUserSection = document.getElementById("current-user-section");
const createRequestSection = document.getElementById("create-request-section");
const requestListSection = document.getElementById("request-list-section");
const adminSection = document.getElementById("admin-section");

function showLoggedOutUI() {
    registerSection.hidden = false;
    loginSection.hidden = false;

    currentUserSection.hidden = true;
    createRequestSection.hidden = true;
    requestListSection.hidden = true;
    adminSection.hidden = true;
}

function showLoggedInUI(user) {
    registerSection.hidden = true;
    loginSection.hidden = true;

    currentUserSection.hidden = false;
    createRequestSection.hidden = false;
    requestListSection.hidden = false;

    adminSection.hidden = user.role !== "admin";
}

function getErrorMessage(response, data) {
    if (response.status === 401) {
        return "Please log in again. Your session may have expired.";
    }
    if (response.status === 403) {
        return "You do not have permission to perform this action.";
    }
    if (response.status === 404) {
        return "The requested resource does not exist.";
    }
    if (response.status === 422) {
        return JSON.stringify(data.detail);
    }
    if (data.detail) {
        return JSON.stringify(data.detail);
    }
    return "An unexpected error occurred.";
}

registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = registerUsername.value;
    const password = registerPassword.value;
    const role = registerRole.value;
    // console.log(username, password, role);

    const requestBody = {
        username,
        password,
        role
    };
    const response = await fetch(`${API_BASE_URL}/auth/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    });
    const data = await response.json()

    console.log("status: ", response.status);
    console.log("ok: ", response.ok);
    console.log("data: ", data);

    if (response.ok) {
        registerMessage.textContent = "Registration successful. Please log in."
        registerForm.reset();
    } else {
        registerMessage.textContent = getErrorMessage(response, data);
    }
});

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = loginUsername.value;
    const password = loginPassword.value;
    console.log(username, password);

    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch(`${API_BASE_URL}/auth/token/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData
    });
    const data = await response.json();
    console.log(data);

    if (response.ok) {
        localStorage.setItem("access_token", data.access_token);
        loginMessage.textContent = "Login successful.";
        loginForm.reset();

        const currentUser = await loadCurrentUser();
        if (currentUser) {
            await loadRequests();
        }
    } else {
        loginMessage.textContent = getErrorMessage(response, data);
    }
})

async function loadCurrentUser() {
    const token = localStorage.getItem("access_token")

    if (!token) {
        showLoggedOutUI();
        return null;
    }

    const response = await fetch(`${API_BASE_URL}/auth/me/`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    const data = await response.json();

    if (response.ok) {
        currentUserMessage.textContent = `${data.username} (${data.role})`;

        showLoggedInUI(data);
        return data;
    }

    localStorage.removeItem("access_token");

    currentUserMessage.textContent = getErrorMessage(response, data);

    requestList.innerHTML = "";
    adminResults.innerHTML = "";

    showLoggedOutUI();
    return null;
}

logoutButton.addEventListener("click", function () {
    localStorage.removeItem("access_token");

    currentUserMessage.textContent = "";
    loginMessage.textContent = "Logged out.";

    requestList.innerHTML = "";
    requestListMessage.textContent = "";

    adminResults.innerHTML = "";
    adminMessage.textContent = "";

    createRequestMessage.textContent = "";
    showLoggedOutUI();
});

createRequestForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    
    const title = requestTitle.value;
    const description = requestDescription.value;
    const category = requestCategory.value;
    const priority = requestPriority.value;

    console.log(title, description, category, priority);

    const token = localStorage.getItem("access_token");
    if (!token) {
        createRequestMessage.textContent = "Please log in first.";
        return;
    }
    const requestBody = {
        title,
        description,
        category,
        priority
    };
    const response = await fetch(`${API_BASE_URL}/requests/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
    });
    const data = await response.json();

    if (response.ok) {
        createRequestMessage.textContent = "Request created successfully.";
        createRequestForm.reset();
        await loadRequests();
    } else {
        createRequestMessage.textContent = getErrorMessage(response, data);
    }
});

async function loadRequests() {
    const token = localStorage.getItem("access_token");

    if (!token) {
        requestListMessage.textContent = "Please log in first.";
        requestList.innerHTML = "";
        return;
    }

    let url = `${API_BASE_URL}/requests/`
    const statusValue = statusFilter.value;
    const priorityValue = priorityFilter.value;

    const params = new URLSearchParams();
    if (statusValue) {
        params.append("status", statusValue);
    }
    if (priorityValue) {
        params.append("priority", priorityValue);
    }
    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();
    if (response.ok) {
        // console.log(data);
        requestList.innerHTML = "";
        requestListMessage.textContent = "";

        if (data.length === 0) {
            requestListMessage.textContent = "No requests found.";
            return;
        }
        data.forEach(function (request) {
            const requestItem = document.createElement("div");
            requestItem.className = "request-card";
            const displayArea = document.createElement("div");
            displayArea.className = "request-display";
            const editArea = document.createElement("div");
            editArea.className = "request-edit";

            editArea.hidden = true;
            editArea.innerHTML = `
                <label>
                    Title:
                    <input class="edit-title" type="text">
                </label>
                <label>
                    Description:
                    <input class="edit-description" type="text">
                </label>
                <label>
                    Priority:
                    <select class="edit-priority">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </label>
                <label>
                    Category:
                    <select class="edit-category">
                        <option value="bug">Bug</option>
                        <option value="feature">Feature</option>
                        <option value="question">Question</option>
                        <option value="billing">Billing</option>
                        <option value="other">Other</option>
                    </select>
                </label>
                <label>
                    Status:
                    <select class="edit-status">
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="closed">Closed</option>
                    </select>
                </label>
            `;
            const editTitleInput = editArea.querySelector(".edit-title");
            const editDescriptionInput = editArea.querySelector(".edit-description");
            const editCategorySelect = editArea.querySelector(".edit-category");
            const editPrioritySelect = editArea.querySelector(".edit-priority");
            const editStatusSelect = editArea.querySelector(".edit-status");

            editTitleInput.value = request.title;
            editDescriptionInput.value = request.description;
            editPrioritySelect.value = request.priority;
            editStatusSelect.value = request.status;
            editCategorySelect.value = request.category;

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.className = "danger-button";

            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            deleteButton.className = "secondary-button";

            deleteButton.addEventListener("click", function () {
                // console.log(request.id);
                deleteRequest(request.id);
            });

            const cancelButton = document.createElement("button");
            cancelButton.textContent = "Cancel";
            cancelButton.className = "secondary-button";

            const confirmButton = document.createElement("button");
            confirmButton.textContent = "Confirm";
            confirmButton.className = "primary-button";

            editArea.appendChild(cancelButton);
            editArea.appendChild(confirmButton);

            editButton.addEventListener("click", function () {
                displayArea.hidden = true;
                editArea.hidden = false;
            });
            cancelButton.addEventListener("click", function () {
                editTitleInput.value = request.title;
                editDescriptionInput.value = request.description;
                editPrioritySelect.value = request.priority;
                editStatusSelect.value = request.status;
                editCategorySelect.value = request.category;

                displayArea.hidden = false;
                editArea.hidden = true;
            })
            confirmButton.addEventListener("click", async function () {
                // console.log("Request ID:", request.id);
                // console.log("New title:", editTitleInput.value);
                // console.log("New description:", editDescriptionInput.value);
                const updatedTitle = editTitleInput.value;
                const updatedDescription = editDescriptionInput.value;
                const updatedPriority = editPrioritySelect.value;
                const updatedStatus = editStatusSelect.value;
                const updatedCategory = editCategorySelect.value;
                const requestBody = {
                    title: updatedTitle,
                    description: updatedDescription,
                    priority: updatedPriority,
                    category: updatedCategory,
                    status: updatedStatus
                };
                const updated = await updateRequest(request.id, requestBody);
                if (updated) {
                    displayArea.hidden = false;
                    editArea.hidden = true;
                }
            })

            displayArea.innerHTML = `
                <p>ID: ${request.id}</p>
                <h3>${request.title}</h3>
                <p>${request.description}</p>
                <p>Category: ${request.category}</p>
                <p>Priority: ${request.priority}</p>
                <p>Status: ${request.status}</p>
            `;
            displayArea.appendChild(editButton);
            displayArea.appendChild(deleteButton);

            requestItem.appendChild(displayArea);
            requestItem.appendChild(editArea);
            requestList.appendChild(requestItem);
        });
    } else {
        requestListMessage.textContent = getErrorMessage(response, data);
    }
}

filterButton.addEventListener("click", loadRequests);

async function deleteRequest(requestId) {
    const token = localStorage.getItem("access_token");

    if (!token) {
        requestListMessage.textContent = "Please log in first.";
        return;
    }

    const response = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (response.ok) {
        await loadRequests();
        requestListMessage.textContent = "Request deleted successfully.";
    } else {
        const data = await response.json();
        requestListMessage.textContent = getErrorMessage(response, data);
    }
};

async function updateRequest(requestId, requestBody) {
    const token = localStorage.getItem("access_token");

    if (!token) {
        requestListMessage.textContent = "Please log in first.";
        return;
    }

    const response = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody)
    });

    if (response.ok) {
        await loadRequests();
        requestListMessage.textContent = "Request updated successfully.";
        return true;
    } else {
        const data = await response.json();
        requestListMessage.textContent = getErrorMessage(response, data);
        return false;
    }
};

async function initializePage() {
    const token = localStorage.getItem("access_token");

    // console.log("initializePage called");
    // console.log("saved token:", token);

    if (!token) {
        showLoggedOutUI();
        return;
    }

    const currentUser = await loadCurrentUser();

    if (currentUser) {
        await loadRequests();
    }
}

initializePage();

async function loadAdminUsers () {
    const token = localStorage.getItem("access_token");

    if (!token) {
        adminMessage.textContent = "Please log in first.";
        return;
    }

    const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        adminMessage.textContent = getErrorMessage(response, data);
        return;
    }

    adminMessage.textContent = "";
    adminResults.innerHTML = "";

    data.forEach(function (user) {
        const userItem = document.createElement("div");
        userItem.className = "admin-user-card";
        userItem.textContent = `ID: ${user.id}, Username: ${user.username}, Role: ${user.role}`;
        adminResults.appendChild(userItem);
    });
}

async function loadAdminRequests () {
    const token = localStorage.getItem("access_token");

    if (!token) {
        adminMessage.textContent = "Please log in first.";
        return;
    }

    const response = await fetch(`${API_BASE_URL}/admin/requests`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        adminMessage.textContent = getErrorMessage(response, data);
        return;
    }

    adminMessage.textContent = "";
    adminResults.innerHTML = "";

    data.forEach(function (request) {
        const requestItem = document.createElement("div");
        requestItem.innerHTML = `
            <p>ID: ${request.id}</p>
            <h3>Title: ${request.title}</h3>
            <p>Description: ${request.description}</p>
            <p>Owner id: ${request.owner_id}</p>
            <p>Category: ${request.category}</p>
            <p>Priority: ${request.priority}</p>
            <p>Status: ${request.status}</p>
        `;
        requestItem.className = "request-card";
        adminResults.appendChild(requestItem);
    });
}

loadAdminUsersButton.addEventListener("click", loadAdminUsers);
loadAdminRequestsButton.addEventListener("click", loadAdminRequests);