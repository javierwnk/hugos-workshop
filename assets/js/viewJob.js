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
    

    document.getElementById("personalInfo").innerHTML = `<li>Nombre y apellido: ${job.personalInfo.name}</li>
    <li>Teléfono: ${job.personalInfo.phone}</li>
    <li>DNI: ${job.personalInfo.dni}</li>
    <li>Dirección: ${job.personalInfo.address}</li>
    <li>Fecha de Nac: ${job.personalInfo.birth}</li>
    <li>Email: ${job.personalInfo.email}</li>`

    document.getElementById("jobInfo").innerHTML = `<li>Fecha de ingreso: ${job.jobInfo.date}</li>
    <li>Patente: ${job.personalInfo.plate}</li>
    <li>Detalle: ${job.jobInfo.description}</li>`

    if(job.workValue != null) {
        document.getElementById("invoice").innerHTML = `
        <div class="row">
        <div class="col">
            <p>Concepto</p><input class="form-control facturacionInput partName" value="Mano de Obra" type="text" readonly>
        </div>
        <div class="col">
            <p>Importe</p><input class="form-control facturacionInput partPrice" value="${job.workValue}" type="number">
        </div>
        <div class="col">
            <p>Acciones</p><button class="btn btn-primary facturacionAcciones add" id="AddBtn1" type="button">Agregar nueva fila</button>
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
                                    <p>Concepto</p><input class="form-control facturacionInput partName" value="${item.name}" type="text">
                                </div>
                                <div class="col">
                                    <p>Importe</p><input class="form-control facturacionInput partPrice" value="${item.price}" type="number">
                                </div>
                                <div class="col">
                                    <p>Acciones</p><button class="btn btn-primary facturacionAcciones delete" type="button" id="delete${idNumber}">Eliminar Item</button>
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
                            <p>Concepto</p><input class="form-control facturacionInput partName " type="text">
                        </div>
                        <div class="col">
                            <p>Importe</p><input class="form-control facturacionInput partPrice" type="number">
                        </div>
                        <div class="col">
                            <p>Acciones</p><button class="btn btn-primary facturacionAcciones delete" id="delete${idNumber}" type="button">Eliminar Item</button>
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
    document.getElementById("totalValue").innerText = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(total)

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

    handleUpdate({"sparesParts": sparesParts, "workValue": partPrice[0].value}, "Datos de facturación actualizados correctamente")
})

// Mark as Completed

document.getElementById("completedButton").addEventListener("click", () => {
    jobInfo.statusinfo = {status: true, "completedDate": new Date().toISOString().slice(0,10)}
    handleUpdate({statusInfo: jobInfo.statusinfo}, "Trabajo terminado")
    handleCompleted(jobInfo.statusInfo.completedDate)
})

function handleCompleted(date) {
    const inputs = document.getElementsByTagName("input")

    for(i = 0; i < inputs.length; i++) {
        inputs[i].setAttribute("readonly", "true")
    }

    document.getElementById("actionBtns").innerHTML = `<p class="completedJob text-success">Trabajo Completado</p>
    <p class="completedJob small">Fecha: ${date}</p>`

    document.getElementById("AddBtn1").remove()
    document.getElementById("save").remove()
}

// Handle Update

const handleUpdate = (update, message) => {
    firestore.doc("jobs/"+jobId)
        .update(update)
        .then(() => {
            swal("¡Éxito!", message, "success");
        })
}

// Delete job

document.getElementById("deleteJob").addEventListener("click", () => {
    swal({
        title: "¿Estás seguro?",
        text: "Una vez que confirmes no se podrá recuperar el trabajo",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((willDelete) => {
        if (willDelete) {

            firestore.doc("jobs/"+jobId).delete()
            .then(() => {
                swal("Eliminado", "Presione Ok para ir a trabajos", "success")
                .then (() => {
                    window.location.href = "jobs.html"
                  })
                
            })

        } else {
          swal("¡Ok! No lo borramos");
        }
      });
})