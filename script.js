import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, get, set, update, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyD8SUCRABkNj7cC9_z7beoWVdeivE2vFKs",
    authDomain: "admition-52c47.firebaseapp.com",
    databaseURL: "https://admition-52c47-default-rtdb.firebaseio.com",
    projectId: "admition-52c47",
    storageBucket: "admition-52c47.appspot.com",
    messagingSenderId: "1065012142592",
    appId: "1:1065012142592:web:ea76b942aba95418eb6ee5",
    measurementId: "G-3N3F8DJ8FC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Real-time Dashboard Updates
function updateDashboard() {
    get(ref(db, "students")).then((snapshot) => {
        const students = snapshot.val() || [];
        const totalStudents = students.length;

        let totalIncome = 0;
        let pendingPayments = 0;

        students.forEach(student => {
            if (student.paymentStatus && student.paymentStatus !== "Unpaid") {
                totalIncome += parseFloat(student.paymentStatus.replace(' TK', '')) || 0;
            } else {
                pendingPayments++;
            }
        });

        // Update Dashboard
        document.getElementById("total-students").innerText = totalStudents;
        document.getElementById("total-income").innerText = `${totalIncome} TK`;
        document.getElementById("pending-payments").innerText = pendingPayments;
    });
}

// Add Student
window.addStudent = function () {
    let name = document.getElementById("name").value.trim();
    let department = document.getElementById("department").value.trim();
    let semester = document.getElementById("semester").value.trim();
    let batch = document.getElementById("batch").value.trim();

    let departmentShortForm = department.substring(0, 3).toUpperCase();
    let serialNumber = 0;

    get(ref(db, "students")).then((snapshot) => {
        let students = snapshot.val() || [];

        let highestSerial = students
            .filter(student => student.department === department)
            .map(student => parseInt(student.uniqueId.substring(3)))
            .sort((a, b) => b - a)[0] || 0;

        serialNumber = highestSerial + 1;
        let uniqueId = departmentShortForm + String(serialNumber).padStart(3, '0');

        students.push({ name, department, semester, batch, uniqueId, paymentStatus: "Unpaid" });

        set(ref(db, "students"), students);
        alert("Student Added!");

        // Display the generated Unique ID
        document.getElementById("generated-unique-id").innerText = uniqueId;
        document.getElementById("unique-id-display").style.display = "block";

        // Reset input fields
        document.getElementById("name").value = '';
        document.getElementById("department").value = '';
        document.getElementById("semester").value = '';
        document.getElementById("batch").value = '';

        updateDashboard();
    });
};

// Make Payment
window.makePayment = function () {
    const studentId = document.getElementById("payment-id").value.trim();
    const paymentAmount = parseFloat(document.getElementById("amount").value.trim());

    if (!studentId || !paymentAmount || isNaN(paymentAmount)) {
        alert("Please enter valid data.");
        return;
    }

    get(ref(db, "students")).then((snapshot) => {
        const students = snapshot.val() || [];
        const studentIndex = students.findIndex(student => student.uniqueId === studentId);

        if (studentIndex !== -1) {
            students[studentIndex].paymentStatus = `${paymentAmount} TK`;
            students[studentIndex].paymentAmount = paymentAmount;

            set(ref(db, "students"), students);
            alert("Payment Made!");

            // Reset input fields
            document.getElementById("payment-id").value = '';
            document.getElementById("amount").value = '';

            updateDashboard();
        } else {
            alert("Student not found.");
        }
    });
};

// Real-time listener for students' payment updates
onValue(ref(db, "students"), (snapshot) => {
    const students = snapshot.val() || [];
    const totalStudents = students.length;

    let totalIncome = 0;
    let pendingPayments = 0;

    students.forEach(student => {
        if (student.paymentStatus && student.paymentStatus !== "Unpaid") {
            totalIncome += parseFloat(student.paymentStatus.replace(' TK', '')) || 0;
        } else {
            pendingPayments++;
        }
    });

    // Update dashboard on real-time change
    document.getElementById("total-students").innerText = totalStudents;
    document.getElementById("total-income").innerText = `${totalIncome} TK`;
    document.getElementById("pending-payments").innerText = pendingPayments;
});

// Initial Dashboard and Student List Load
window.onload = function () {
    updateDashboard();
    get(ref(db, "students")).then((snapshot) => {
        const students = snapshot.val() || [];
        displayStudents(students);
    });
};

// Display Students in Table
function displayStudents(students) {
    const studentList = document.getElementById("student-list");
    studentList.innerHTML = '';

    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.department}</td>
            <td>${student.semester}</td>
            <td>${student.uniqueId}</td>
            <td>${student.batch}</td>
            <td>${student.paymentStatus}</td>
        `;
        studentList.appendChild(row);
    });
}

// Function to show different sections (Dashboard, Add Student, etc.)
function showSection(sectionId) {
    const sections = ['dashboard', 'add-student', 'details', 'payment'];
    sections.forEach(section => {
        document.getElementById(section).style.display = (section === sectionId) ? 'block' : 'none';
    });
}