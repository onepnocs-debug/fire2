import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAcuIK9Bq50IsxPSflo3HILvXSXghZoyyY",
  authDomain: "aircon-monitoring-system.firebaseapp.com",
  projectId: "aircon-monitoring-system",
  storageBucket: "aircon-monitoring-system.firebasestorage.app",
  messagingSenderId: "887130221420",
  appId: "1:887130221420:web:af4a548b5c5ecc153ba149",
  measurementId: "G-KR1YF2CL3G"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// =========================
// AIRCON RECORDS
// =========================
console.log("LINE 1");
let records = [];
let editIndex = -1;

// =========================
// SAVE RECORD
// =========================

function saveRecord() {


const file = document.getElementById("photo").files[0];

const existingPhoto =
    editIndex !== -1
        ? records[editIndex].photo || ""
        : "";

async function saveData(photoData) {

    const record = {

        personnel:
            document.getElementById("personnel").value,

        brand:
            document.getElementById("brand").value,


        serialNumber:
            document.getElementById("serialNumber").value,

        location:
            document.getElementById("location").value,

        inspectionDate:
            document.getElementById("inspectionDate").value,

        inspector:
            document.getElementById("inspector").value,

        status:
            document.getElementById("status").value,

        remarks:
            document.getElementById("remarks").value,

        photo: photoData
    };

   await addDoc(
    collection(db, "airconRecords"),
    record
);



    document
        .querySelectorAll(
            ".form-container input, .form-container textarea"
        )
        .forEach(el => {

            if (el.type !== "file") {
                el.value = "";
            }

        });

    document.getElementById("photo").value = "";

    loadRecords();

    alert("Record saved successfully!");

};

if (file) {

    const reader = new FileReader();

    reader.onload = function (e) {

        saveData(e.target.result);

    };

    reader.readAsDataURL(file);

} else {

    saveData(existingPhoto);

}


}


// =========================
// EDIT RECORD
// =========================

function editRecord(index) {

    const record = records[index];

    document.getElementById("personnel").value = record.personnel;
    document.getElementById("brand").value = record.brand;
    
    document.getElementById("serialNumber").value = record.serialNumber;
    document.getElementById("location").value = record.location;
    document.getElementById("inspectionDate").value = record.inspectionDate;
    document.getElementById("inspector").value = record.inspector;
    document.getElementById("status").value = record.status;
    document.getElementById("remarks").value = record.remarks;

    editIndex = index;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// =========================
// LOAD RECORDS
// =========================

async function loadRecords() {

    records = [];

    const snapshot = await getDocs(
        collection(db, "airconRecords")
    );

    snapshot.forEach((docSnap) => {

        records.push({
            id: docSnap.id,
            ...docSnap.data()
        });

    });

    const table = document.getElementById("recordsTable");

    if (!table) return;

    const search =
        document.getElementById("search")
            ? document.getElementById("search").value.toLowerCase()
            : "";

    table.innerHTML = "";

    records.forEach((record, index) => {

        const text = JSON.stringify(record).toLowerCase();

        if (text.includes(search)) {

            table.innerHTML += `
                <tr>

                    <td>${record.inspectionDate || ""}</td>

                    <td>${record.inspector || ""}</td>

                    <td>
    <span class="${
        record.status === "Good"
            ? "status-good"
            : record.status === "Needs Repair"
            ? "status-repair"
            : "status-maintenance"
    }">
        ${record.status || ""}
    </span>
</td>

                    <td>${record.personnel || ""}</td>

                    <td>${record.location || ""}</td>

                    <td>${record.brand || ""}</td>

                    <td>${record.serialNumber || ""}</td>

                    <td>
                        ${
                            record.photo
                            ? `
                                <img
                                    src="${record.photo}"
                                    class="record-photo"
                                    onclick="viewImage('${record.photo}')"
                                >
                              `
                            : "No Photo"
                        }
                    </td>

                    <td>${record.remarks || ""}</td>

                   <td>
    <div class="action-buttons">

        <button
    type="button"
    class="edit-btn"
    onclick="editRecord(${index})">
            Edit
        </button>

        <button
            type="button"
            class="delete-btn"
            onclick="deleteRecord(${index})">
            Delete
        </button>

    </div>
</td>

                </tr>
            `;
        }
    });

    document.getElementById("totalRecords").textContent =
        records.length;

    setupPermissions();
}

// =========================
// DELETE RECORD
// =========================

async function deleteRecord(index) {

    if (currentUser && currentUser.role === "user") {
        alert("You do not have permission to delete records.");
        return;
    }

    if (confirm("Delete this record?")) {

        await deleteDoc(
            doc(db, "airconRecords", records[index].id)
        );

        loadRecords();
    }
}

// =========================
// EXPORT CSV
// =========================

function exportCSV() {

    let csv =
"Date,Inspector,Status,Personnel,Brand,Serial Number,Location,Remarks\n";

    records.forEach(r => {

       csv += `"${r.inspectionDate}","${r.inspector}","${r.status}","${r.personnel}","${r.brand}","${r.serialNumber}","${r.location}","${r.remarks}"\n`;

    });

    const blob = new Blob([csv], {
        type: "text/csv"
    });

    const a = document.createElement("a");

    a.href = URL.createObjectURL(blob);
    a.download = "Aircon_Maintenance_Records.csv";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// =========================
// EXPORT PDF
// =========================

function exportPDF() {

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    doc.text(
        "Air Conditioner Maintenance Records",
        14,
        15
    );

   const rows = records.map(r => [
    r.inspectionDate,
    r.inspector,
    r.status,
    r.personnel,
    r.location,
    r.brand,
    r.serialNumber,
    r.remarks
]);
    doc.autoTable({
    head: [
[
    "Date",
    "Inspector",
    "Status",
    "Person In Charge",
    "Location",
    "Brand",
    "Serial Number",
    "Remarks"
]
],
        body: rows,
        startY: 20
    });

    doc.save(
        "Aircon_Maintenance_Records.pdf"
    );
}

// =========================
// LOGIN SYSTEM
// =========================



let currentUser = null;


function logout() {

    currentUser = {
        username: "user",
        role: "user"
    };

    setupPermissions();

    document.getElementById(
        "adminBtn"
    ).innerText =
        "Run as Administrator";

    loadRecords();

}
  function showAdminLogin() {

    document.getElementById(
        "adminModal"
    ).style.display = "block";

}

function closeAdminLogin() {

    document.getElementById(
        "adminModal"
    ).style.display = "none";

}

function adminLogin() {

    const username =
        document.getElementById(
            "adminUsername"
        ).value;

    const password =
        document.getElementById(
            "adminPassword"
        ).value;

    if (
        username === "admin" &&
        password === "admin123"
    ) {

        currentUser = {
            username: "admin",
            role: "admin"
        };

        setupPermissions();

        closeAdminLogin();

        document.getElementById(
            "adminBtn"
        ).innerText =
            "Administrator Active";

        loadRecords();

        alert(
            "Administrator Mode Activated"
        );

    } else {

        alert(
            "Invalid Administrator Credentials"
        );

    }
}
// =========================
// PERMISSIONS
// =========================

function setupPermissions() {

    const saveBtn =
        document.querySelector(
            "button[onclick='saveRecord()']"
        );

    const editBtns =
        document.querySelectorAll(
            ".edit-btn"
        );

    const deleteBtns =
        document.querySelectorAll(
            ".delete-btn"
        );

    if (currentUser.role === "user") {

        if (saveBtn)
            saveBtn.style.display = "none";

        editBtns.forEach(btn => {
            btn.style.display = "none";
        });

        deleteBtns.forEach(btn => {
            btn.style.display = "none";
        });

    } else {

        if (saveBtn)
            saveBtn.style.display = "inline-block";

        editBtns.forEach(btn => {
            btn.style.display = "inline-block";
        });

        deleteBtns.forEach(btn => {
            btn.style.display = "inline-block";
        });

    }

}

// =========================
// PAGE LOAD
// =========================

window.onload = function () {

    currentUser = {
        username: "user",
        role: "user"
    };

    setupPermissions();

    loadRecords();

};

function viewImage(src) {

    document.getElementById("imageModal").style.display = "block";

    document.getElementById("fullImage").src = src;
}

document.querySelector(".close").addEventListener("click", function () {

    document.getElementById("imageModal").style.display = "none";

});

window.addEventListener("click", function (e) {

    const modal = document.getElementById("imageModal");

    if (e.target === modal) {
        modal.style.display = "none";
    }

});
console.log("REACHED BOTTOM");

window.logout = logout;
window.saveRecord = saveRecord;
window.editRecord = editRecord;
window.deleteRecord = deleteRecord;
window.exportPDF = exportPDF;
window.exportCSV = exportCSV;
window.loadRecords = loadRecords;
window.viewImage = viewImage;

window.showAdminLogin = showAdminLogin;
window.closeAdminLogin = closeAdminLogin;
window.adminLogin = adminLogin;
