const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");
const taskList = document.getElementById("taskList");
const taskFilter = document.getElementById("taskFilter");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");

const emptyMessage = document.getElementById("emptyMessage");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const progressBar = document.getElementById("progressBar");
const clearCompletedBtn = document.getElementById("clearCompleted");

const STORAGE_KEY = "studentTaskManagerTasks";

let tasks = [];

try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);

    if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);

        if (Array.isArray(parsedTasks)) {
            tasks = parsedTasks.filter(task =>
                task &&
                typeof task.id === "string" &&
                typeof task.text === "string" &&
                typeof task.completed === "boolean" &&
                typeof task.date === "string"
            );
        }
    }
} catch (error) {
    console.error("Could not load saved tasks:", error);
}

function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        alert("Tasks could not be saved in this browser.");
        console.error("Could not save tasks:", error);
    }
}

function renderTasks() {
    taskList.replaceChildren();

    const filter = taskFilter.value;

    let visibleTasks = tasks;

    if (filter === "pending") {
        visibleTasks = tasks.filter(task => !task.completed);
    } else if (filter === "completed") {
        visibleTasks = tasks.filter(task => task.completed);
    }

    visibleTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "task-item";

        if (task.completed) {
            li.classList.add("is-completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-check";
        checkbox.checked = task.completed;
        checkbox.setAttribute(
            "aria-label",
            "Mark " + task.text + " as completed"
        );

        checkbox.addEventListener("change", function () {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const details = document.createElement("div");
        details.className = "task-details";

        const title = document.createElement("div");
        title.className = "task-title";
        title.textContent = task.text;

        details.appendChild(title);

        if (task.date) {
            const date = document.createElement("div");
            date.className = "task-date";
            date.textContent = "Due: " + task.date;
            details.appendChild(date);
        }

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";
        deleteBtn.setAttribute(
            "aria-label",
            "Delete " + task.text
        );

        deleteBtn.addEventListener("click", function () {
            const shouldDelete = confirm(
                "Do you want to delete this task?"
            );

            if (!shouldDelete) {
                return;
            }

            tasks = tasks.filter(item => item.id !== task.id);
            saveTasks();
            renderTasks();
        });

        li.append(checkbox, details, deleteBtn);
        taskList.appendChild(li);
    });

    const completedCount = tasks.filter(task => task.completed).length;
    const pendingCount = tasks.length - completedCount;

    totalTasks.textContent = tasks.length;
    pendingTasks.textContent = pendingCount;
    completedTasks.textContent = completedCount;

    const progress = tasks.length === 0
        ? 0
        : Math.round((completedCount / tasks.length) * 100);

    progressText.textContent = progress + "%";
    progressFill.style.width = progress + "%";
    progressBar.setAttribute("aria-valuenow", progress);

    emptyMessage.hidden = visibleTasks.length !== 0;

    if (tasks.length === 0) {
        emptyMessage.textContent =
            "No tasks yet. Add your first task above!";
    } else if (visibleTasks.length === 0) {
        emptyMessage.textContent =
            "No tasks in this filter.";
    }

    clearCompletedBtn.disabled = completedCount === 0;
    clearCompletedBtn.style.opacity =
        completedCount === 0 ? "0.5" : "1";
}

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (text === "") {
        alert("Please enter a task name.");
        taskInput.focus();
        return;
    }

    const task = {
        id: crypto.randomUUID(),
        text: text,
        date: taskDate.value,
        completed: false
    };

    tasks.push(task);

    saveTasks();

    taskForm.reset();
    taskInput.focus();

    renderTasks();
});

taskFilter.addEventListener("change", function () {
    renderTasks();
});

clearCompletedBtn.addEventListener("click", function () {
    const completedCount = tasks.filter(
        task => task.completed
    ).length;

    if (completedCount === 0) {
        return;
    }

    const shouldClear = confirm(
        "Delete all completed tasks?"
    );

    if (!shouldClear) {
        return;
    }

    tasks = tasks.filter(task => !task.completed);

    saveTasks();
    renderTasks();
});

renderTasks();



