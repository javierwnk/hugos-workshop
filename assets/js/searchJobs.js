// You can search a job by just one parameter (DNI, Plate or all jobs by a range of days)
// Search button only enables if one of them is completed.

let dni = document.getElementById("dni")
let plate = document.getElementById("plate")
let fromDate = document.getElementById("fromDate")
let toDate = document.getElementById("toDate")

dni.addEventListener("input", (event) => formValidation(event.path[0].id))
plate.addEventListener("input", (event) => formValidation(event.path[0].id))
fromDate.addEventListener("input", (event) => formValidation(event.path[0].id))
toDate.addEventListener("input", (event) => formValidation(event.path[0].id))

function formValidation (input) {
    if(dni.value != ""|| plate.value != "" || fromDate.value != "" || toDate.value != "") {
        
        document.getElementById("searchBtn").disabled = false
        readOnlyInputs(input)
        
    } else {
        document.getElementById("searchBtn").disabled = true
        enableInputs()
    }
}

const readOnlyInputs = (value) => {
    let inputs = document.getElementsByClassName("form-control")

    for (i = 0; i < inputs.length; i++) {
        if(inputs[i].id == value) {

            if(inputs[i].id == "fromDate") {
                break
            } else if(inputs[i].id == "toDate") {
                inputs[i-1].removeAttribute("readonly")
            }

            continue
        } else {
            inputs[i].setAttribute("readonly", true)
        }
    }
}

const enableInputs = () => {
    let inputs = document.getElementsByClassName("form-control")

    for (i = 0; i < inputs.length; i++) {
        inputs[i].removeAttribute("readonly")
    }
}

// Search function

document.getElementById("searchBtn").addEventListener("click", search)

function search () {
    let value = findInputValue() 
    let jobs = []
    
    switch (value.id) {
        case "date":
            firestore.collection("jobs")
            .where("jobInfo.date", ">=", value.from)
            .where("jobInfo.date", "<=", value.to)
            .get().then(querySnapshot => {

                if(querySnapshot.empty) {
                    renderJobs(false)
                } else {
                    querySnapshot.forEach(doc => {
                        jobs.push({...doc.data(), "id": doc.id})
                    })
                    renderJobs(jobs)
                }
   
            })
            break;
    
        default:
            firestore.collection("jobs")
            .where(`personalInfo.${value.id}`, "==", value.value)
            .get().then(querySnapshot => {
                if(querySnapshot.empty) {
                    renderJobs(false)
                } else {
                    querySnapshot.forEach(doc => {
                        jobs.push({...doc.data(), "id": doc.id})
                    })
                    renderJobs(jobs)
                }
            })
            break;
    }

}

const findInputValue = () => {
    let inputs = document.getElementsByClassName("form-control")
    let date = {"id": "date"}

    for (let input of inputs) {
        if(!input.readOnly) {

            if(input.id == "fromDate") {
                date = {...date, "from": input.value}
                continue
            } else if (input.id == "toDate"){
                date = {...date, "to": input.value}
                return date
            } else {
                return {"id": input.id, "value": input.value}
            }
            
        } else {
            continue 
        }
    }
}

function renderJobs(jobs) {

    let details = document.getElementById("details")

    if(jobs) {
        
        details.innerHTML = `<div class="col-md-6" style="width: 100%;">
        <div class="table-responsive text-center">
            <table class="table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Nombre y Apellido</th>
                        <th>Patente</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody id="tableBody">
                
                </tbody>
                </table>
            </div>
        </div>`

        
        jobs.forEach(job => {
            let row = document.createElement("tr")
            console.log(job)
            row.innerHTML = `<td>${job.jobInfo.date}</td>
                            <td>${job.personalInfo.name}</td>
                            <td>${job.personalInfo.plate}</td>
                            <td class="text-center">${job.statusInfo.status ? "Completado" : "Pendiente"}</td>
                            <td class="link-primary"><a style="text-decoration: none;" href="detalle.html?id=${job.id}">Ver detalles</a></td>`

            document.getElementById("tableBody").appendChild(row)
        })

    } else {
        details.innerHTML = `<div class="col-md-6" style="width: 100%;"><i class="fa fa-frown-o" style="font-size: 4rem;text-align: center;display: block;"></i>
        <p style="text-align: center;font-weight: bold;">No se encontraron resultados con los filtros aplicados</p>
    </div>`
    }

}