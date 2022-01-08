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

function getJob () {
    firestore.doc("jobs/"+ jobId)
        .get()
        .then(doc => {
            showData(doc.data())
            document.getElementById("data").classList.remove("isLoading")
            document.getElementById("spinner").classList.add("loaded")
        })
}

let total = 0

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
            <p>Concepto</p><input class="form-control facturacionInput" value="Mano de Obra" id="work" type="text" readonly>
        </div>
        <div class="col">
            <p>Importe</p><input class="form-control facturacionInput" value="${job.workValue}" type="number">
        </div>
        <div class="col">
            <p>Acciones</p><button class="btn btn-primary facturacionAcciones" type="button">Agregar</button>
        </div>
    </div>`

    total += job.workValue
    }

    if(job.sparesParts != null) {

        job.sparesParts.forEach((item, index) => {

            item = JSON.parse(item)
            total += item.price

            let div = document.createElement("div")
            div.innerHTML = ` <div class="row">
                            <div class="col">
                                <p>Concepto</p><input class="form-control facturacionInput partName" value="${item.name}" type="text">
                            </div>
                            <div class="col">
                                <p>Importe</p><input class="form-control facturacionInput partPrice" value="${item.price}" type="number">
                            </div>
                            <div class="col">
                                <p>Acciones</p><button class="btn btn-primary facturacionAcciones" type="button">Eliminar</button><button class="btn btn-primary facturacionAcciones" type="button">Agregar</button>
                            </div>
                        </div>`

            document.getElementById("invoice").appendChild(div)

        })

        let div = document.createElement("div")
        div.innerHTML = `<div class="row">
                            <div class="col">
                                <p style="font-size: 24px;color: rgb(0,0,0);font-weight: bold;">Total del trabajo: ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(total)}</p>
                            </div>
                        </div>
                        
                        <button class="btn btn-primary d-lg-flex justify-content-lg-end" type="button">Guardar facturación</button>`

        document.getElementById("invoice").appendChild(div)

    }
}