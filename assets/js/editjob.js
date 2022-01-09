// Get URL Params
const valores = window.location.search;

// Create Instance
const urlParams = new URLSearchParams(valores);

// Check if params exists
let jobId = null
if (urlParams.has("id")) {
    jobId = urlParams.get("id")
    getJob()
} 

let jobInfo = ""

function getJob () {
    firestore.doc("jobs/"+ jobId)
        .get()
        .then(doc => {
            jobInfo = doc.data()
            addInfo(jobInfo)
        })
}

function formValidation () {
    if (name.value != "" && address.value != "" && phone.value != "" && dni.value != "" && plate.value != "" && jobDescription.value != "") {
        save.disabled = false
    } else {
        save.disabled = true
    }
}

function addInfo (job) {
    document.getElementById("formUpdate").innerHTML = `<h6 style="font-weight: bold;">Datos generales</h6>
    <input class="form-control" type="text" placeholder="Nombre y Apellido *" style="margin: 10px 0;" value="${job.personalInfo.name}" required id="name">
    <input class="form-control" type="text" placeholder="Dirección completa *" style="margin: 10px 0;" value="${job.personalInfo.address}" required id="address">
    <input class="form-control" type="tel" required id="phone" value="${job.personalInfo.phone}" placeholder="Teléfono *">
    <input class="form-control" type="email" style="margin: 10px 0;" placeholder="E-mail" value="${job.personalInfo.email}" id="email">
    <input class="form-control" type="number" placeholder="DNI (Solo números) *" required="" value="${job.personalInfo.dni}" style="margin: 0 0 10px 0;" id="dni">
    
    <label class="form-label">Fecha de nacimiento</label>
    <input class="form-control" type="date" style="margin: 0 0 10px 0;" value="${job.personalInfo.birth}" id="birth">

    <h6 style="font-weight: bold;">Información del trabajo y del vehículo</h6>
    <input class="form-control" type="text" placeholder="Patente *" style="margin: 10px 0;" value="${job.personalInfo.plate}" required id="plate">
    <label class="form-label">Fecha del trabajo</label>

    <input class="form-control" type="date" style="margin: 0 0 10px 0;" required id="date" value="${job.jobInfo.date}" readonly>
    <textarea class="form-control" placeholder="Descripción del trabajo *"  id="jobDescription">${job.jobInfo.description}</textarea>
    
    <button class="btn btn-primary" type="button" style="margin: 10px 0;width: 100%;" id="save">Guardar cambios</button>`


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

    save.addEventListener("click", () => {editJob({
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
            
        }
    })})
}

function editJob(object) {
    firestore.doc("jobs/"+jobId).update(object)
    .then(() => {
        swal("¡Éxito!", "Trabajo actualizado correctamente.", "success")
        .then( () => {
            window.location.href = `detalle.html?id=${jobId}`
        }
        )
    })
}