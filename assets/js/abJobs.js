// Inputs
const name = document.getElementById("name")
const address = document.getElementById("address")
const phone = document.getElementById("phone")
const email = document.getElementById("email")
const birth = document.getElementById("birth")
const dni = document.getElementById("dni")
const plate = document.getElementById("plate")
const date = document.getElementById("date")
const jobDescription = document.getElementById("jobDescription")
const save = document.getElementById("save")

// Set todays date by default in case of a new job
date.value = new Date().toISOString().slice(0,10)

// Set max value to the date input
date.setAttribute("max", new Date().toISOString().slice(0,10))

// Set max value to the birth input +16
birth.setAttribute("max", new Date().getFullYear()-18 + new Date().toISOString().slice(4,10))

// Form Validation

name.addEventListener("input", formValidation)
address.addEventListener("input", formValidation)
phone.addEventListener("input", formValidation)
dni.addEventListener("input", formValidation)
plate.addEventListener("input", formValidation)
jobDescription.addEventListener("input", formValidation)


function formValidation () {
    if (name.value != "" && address.value != "" && phone.value != "" && dni.value != "" && plate.value != "" && jobDescription.value != "") {
        save.disabled = false
    } else {
        save.disabled = true
    }
}

save.addEventListener("click", createJob)

function createJob() {
    let job = {
        "personalInfo": {
            "name": name.value,
            "address": address.value,
            "phone": phone.value,
            "email": email.value,
            "birth": birth.value,
            "dni": dni.value,
            "plate": plate.value
        },
        "jobInfo": {
            "date": date.value,
            "description": jobDescription.value,
            "status": "pending",
            "completedDate": null
        },
        "workValue": null,
        "sparesParts": null
    }

    firestore.collection("jobs").add(job)
    .then( docRef => {
        window.location.href = `detalle.html?id=${docRef.id}`
    }
    )
}