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
            showData(doc.data())
            document.getElementById("data").classList.remove("isLoading")
            document.getElementById("spinner").classList.add("loaded")
        })
}


function showData(job) {
    

    document.getElementById("personalInfo").innerHTML = `<li>Full name: ${job.personalInfo.name}</li>
    <li>Cellphone: ${job.personalInfo.phone}</li>
    <li>ID: ${job.personalInfo.dni}</li>
    <li>Address: ${job.personalInfo.address}</li>
    <li>Birthday: ${job.personalInfo.birth}</li>
    <li>Email: ${job.personalInfo.email}</li>`

    document.getElementById("jobInfo").innerHTML = `<li>Date of admission: ${job.jobInfo.date}</li>
    <li>License plate: ${job.personalInfo.plate}</li>
    <li>Details: ${job.jobInfo.description}</li>`

    if(job.workValue != null) {
        document.getElementById("invoice").innerHTML = `
        <div class="row">
        <div class="col">
            <p>Concept</p><input class="form-control facturacionInput partName" value="Mano de Obra" type="text" readonly>
        </div>
        <div class="col">
            <p>Price</p><input class="form-control facturacionInput partPrice" value="${job.workValue}" type="number">
        </div>
        <div class="col">
            <p>Actions</p><button class="btn btn-primary facturacionAcciones add" id="AddBtn1" type="button">Add rows</button>
        </div>
    </div>`

    handleAddEvent()
    }

    if(job.sparesParts != null) {

        job.sparesParts.forEach((item, index) => {

            if (index != "0") { // Because "Mano de obra" is already rendered and it is always the first value
                let idNumber = Math.random()

                let div = document.createElement("div")
                div.innerHTML = ` <div class="row">
                                <div class="col">
                                    <p>Concept</p><input class="form-control facturacionInput partName" value="${item.name}" type="text">
                                </div>
                                <div class="col">
                                    <p>Price</p><input class="form-control facturacionInput partPrice" value="${item.price}" type="number">
                                </div>
                                <div class="col">
                                    <p>Acciones</p><button class="btn btn-primary facturacionAcciones delete" type="button" id="delete${idNumber}">Delete row</button>
                                </div>
                            </div>`
    
                document.getElementById("invoice").appendChild(div)
                handleRemoveEvents(idNumber)
    
            }

        })
    }

    {jobInfo.statusInfo.status ? handleCompleted(jobInfo.statusInfo.completedDate) : handlePriceInputsEvents()}

    insertTotal()

}

// Algorithm to add a row

function handleAddEvent() {
    document.getElementById("AddBtn1").addEventListener("click", () => {

        let idNumber = Math.random()
    
        let div = document.createElement("div")
        div.innerHTML = ` <div class="row">
                        <div class="col">
                            <p>Concept</p><input class="form-control facturacionInput partName " type="text">
                        </div>
                        <div class="col">
                            <p>Price</p><input class="form-control facturacionInput partPrice" type="number">
                        </div>
                        <div class="col">
                            <p>Actions</p><button class="btn btn-primary facturacionAcciones delete" id="delete${idNumber}" type="button">Delete row</button>
                        </div>
                    </div>`
    
        document.getElementById("invoice").appendChild(div)

        handlePriceInputsEvents()
        handleRemoveEvents(idNumber)
        insertTotal()
    } )    
}

handleAddEvent()
// Function to remove a row

function handleRemoveEvents (row) {
    const button = document.getElementById(`delete${row}`)
    button.addEventListener("click", () => {button.parentNode.parentNode.remove(); insertTotal() })
}

// Functions relative of the total value

function insertTotal () {
    const inputs = document.getElementsByClassName("partPrice")

    const total = getTotal(inputs)
    document.getElementById("totalValue").innerText = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'AUD' }).format(total)

}

const getTotal = (inputs) => {

    let total = 0
    for (i=0; i < inputs.length; i++) {

        if(inputs[i].value == "") {
            continue
        } else {
            total += parseInt(inputs[i].value)   
        }
    }
    
    if (total == NaN) {
        return 0
    } else {
        return total
    }
}

const handlePriceInputsEvents = () => {
    const inputs = document.getElementsByClassName("partPrice")

    for(i=0; i < inputs.length; i++) {
        inputs[i].addEventListener("input", insertTotal)
    }
}

// Save invoice

document.getElementById("save").addEventListener("click", () => {
    const partName = document.getElementsByClassName("partName")
    const partPrice = document.getElementsByClassName("partPrice")

    const sparesParts = []

    for (i = 0; i < partName.length; i++) {
        sparesParts.push({name: partName[i].value, price: partPrice[i].value})
    }

    handleUpdate({"sparesParts": sparesParts, "workValue": partPrice[0].value}, "Invoice details saved successfully")
})

// Mark as Completed

document.getElementById("completedButton").addEventListener("click", () => {
    jobInfo.statusinfo = {status: true, "completedDate": new Date().toISOString().slice(0,10)}
    handleUpdate({statusInfo: jobInfo.statusinfo}, "Finished")
    handleCompleted( new Date().toISOString().slice(0,10))
})

function handleCompleted(date) {
    const inputs = document.getElementsByTagName("input")

    for(i = 0; i < inputs.length; i++) {
        inputs[i].setAttribute("readonly", "true")
    }

    document.getElementById("actionBtns").innerHTML = `<p class="completedJob text-success">Finished</p>
    <p class="completedJob small">Date: ${date}</p>`

    document.getElementById("save").remove()
    const buttons = document.getElementsByTagName("button")
    for(i = 0; i < buttons.length; i++) {
        buttons[i].setAttribute("disabled", true)
    } 
}

// Handle Update

const handleUpdate = (update, message) => {
    firestore.doc("jobs/"+jobId)
        .update(update)
        .then(() => {
            swal("Done!", message, "success");
        })
}

// Delete job

document.getElementById("deleteJob").addEventListener("click", () => {
    swal({
        title: "Are you sure?",
        text: "Once confirmed it can't be recovered",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((willDelete) => {
        if (willDelete) {

            firestore.doc("jobs/"+jobId).delete()
            .then(() => {
                swal("Delete", "Press Ok to continuo", "success")
                .then (() => {
                    window.location.href = "jobs.html"
                  })
                
            })

        } else {
          swal("Okay! We are not deleting it");
        }
      });
})

// Edit Job

document.getElementById("editBtn").addEventListener("click", () => {
    window.location.href = `edit.html?id=${jobId}`
})
