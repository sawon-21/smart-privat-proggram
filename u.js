import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, get, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// ✅ Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyD8SUCRABkNj7C9_z7beoWVdeivE2vFKs",
    authDomain: "admition-52c47.firebaseapp.com",
    databaseURL: "https://admition-52c47-default-rtdb.firebaseio.com",
    projectId: "admition-52c47",
    storageBucket: "admition-52c47.appspot.com",
    messagingSenderId: "1065012142592",
    appId: "1:1065012142592:web:ea76b942aba95418eb6ee5",
    measurementId: "G-3N3F8DJ8FC"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 🔍 Check Payment Status
window.checkPayment = function () {
    let uniqueId = document.getElementById("unique-id").value.trim();
    if (!uniqueId) {
        showAlert("Please enter a valid Unique ID!", "Invalid Input");
        return;
    }

    localStorage.setItem("lastCheckedID", uniqueId);

    get(ref(db, "students")).then(snapshot => {
        let students = snapshot.val();
        if (!students) {
            showAlert("No students found!", "Error");
            return;
        }

        let studentArray = Object.values(students); // Convert object to array
        let student = studentArray.find(s => s.uniqueId === uniqueId);

        if (student) {
            document.getElementById("student-name").innerText = student.name;
            document.getElementById("student-id").innerText = student.uniqueId;
            document.getElementById("student-payment").innerText = student.paymentStatus || "Unpaid";
            document.getElementById("payment-details").classList.remove("d-none");
        } else {
            showAlert("Student not found!", "Search Result");
        }
    }).catch(error => {
        showAlert("Failed to fetch data! " + error.message, "Error");
    });
};

// 📢 Load Notices (Sorted by Date & Time)
function loadNotices() {
    onValue(ref(db, "notices"), (snapshot) => {
        let notices = snapshot.val();
        if (notices) {
            let sortedNotices = Object.entries(notices)
                .map(([key, notice]) => ({ key, ...notice }))
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by latest first

            displayNotices(sortedNotices);
        } else {
            document.getElementById("notice-list").innerHTML = "<li class='list-group-item text-muted'>No notices available</li>";
        }
    });
}

// 🎯 Display Notices with Date, Headline & Details
function displayNotices(notices) {
    let noticeContainer = document.getElementById("notice-list");
    noticeContainer.innerHTML = "";

    notices.forEach(notice => {
        let icon = notice.type === "pinned" ? "📌 Pinned" : notice.type === "latest" ? "🔥 Latest " : "⭕ Important";
        let formattedDate = new Date(notice.timestamp).toLocaleString();

        let li = `<li class="list-group-item d-flex justify-content-between align-items-start">
                    <div class="me-2">
                        <h5><strong><p style="background-color:gold">${icon}</p> ${notice.headline}</strong></h5>
                        <p class="mb-1">${notice.details}</p>
                        <small class="text-muted">${formattedDate}</small>
                    </div>
                  </li>`;
        noticeContainer.innerHTML += li;
    });
}

// 🔹 Function to Save Name to Local Storage
function saveName() {
    const name = document.getElementById("nameInput").value.trim();
    if (name) {
        localStorage.setItem("userName", name);
        document.getElementById("inputGroup").style.display = "none"; // Hide input after saving
        displayGreeting();
    } else {
        showAlert("Please enter a name!", "Name Required");
    }
}

// 🔹 Function to Display Greeting with Saved Name
function displayGreeting() {
    const savedName = localStorage.getItem("userName");
    if (savedName) {
        document.getElementById("greetingMessage").innerText = `Dear, ${savedName}!`;
        document.getElementById("inputGroup").style.display = "none";
    }
}

// 🚀 Unified On Page Load Event
window.onload = function () {
    // Load last checked Unique ID
    let lastID = localStorage.getItem("lastCheckedID");
    if (lastID) {
        document.getElementById("unique-id").value = lastID;
    }

    // Load notices
    loadNotices();

    // Display greeting
    displayGreeting();
};

// Expose saveName function globally
window.saveName = saveName;

// 🎨 Advanced Bootstrap Alert
function showAlert(message, title = "Notification") {
    document.getElementById("alertTitle").innerText = title;
    document.getElementById("alertMessage").innerText = message;
    var alertModal = new bootstrap.Modal(document.getElementById("alertModal"));
    alertModal.show();
}