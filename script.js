const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbys3-iR1S28j_5aKSRX66OiTtNPsN6qN_1csOtJZZ84jVoix6IDQA7E9s4xLphnD-5DTA/exec';
let asignaturasCount = 1;
const maxAsignaturas = 3;

//validación de matrícula
document.getElementById('matricula').addEventListener('input', function(e) {
    const value = e.target.value.replace(/\D/g, '');
    e.target.value = value;

    if (value.length === 10) {
        e.target.classList.remove('input-error');
        document.getElementById('matricula-error').style.display = 'none';
    }
});

//agregar nueva asignatura
document.getElementById('btnAgregarAsignatura').addEventListener('click', function() {
    if (asignaturasCount >= maxAsignaturas) {
        alert('Solo puede dar de baja un máximo de 3 asignaturas');
        return;
    }

    const container = document.getElementById('asignaturas-container');
    const newIndex = asignaturasCount;

    const newAsignatura = document.createElement('div');
    newAsignatura.className = 'asignatura-item';
    newAsignatura.setAttribute('data-index', newIndex);

    newAsignatura.innerHTML = `
        <div class="asignatura-header">
            <h3>Asignatura ${newIndex + 1}</h3>
            <button type="button" class="btn-remove" onclick="removeAsignatura(${newIndex})">Eliminar</button>
        </div>

        <div class="form-group">
            <label for="asignatura-${newIndex}">Nombre de la Asignatura <span class="required">*</span></label>
            <input type="text" id="asignatura-${newIndex}" name="asignaturas[]" required>
            <span class="error">El nombre de la asignatura es obligatorio</span>
        </div>

        <div class="form-group">
            <label for="curso-${newIndex}">Tipo de curso <span class="required">*</span></label> 
            <select id="curso-${newIndex}" name="cursos[]" required>
                <option value="">Seleccione...</option>
                <option value="Curso Regular">Curso Regular</option>
                <option value="Recursamiento">Recursamiento</option>
            </select>
            <span class="error">Seleccione un tipo de curso</span>
        </div>
    `;

    container.appendChild(newAsignatura);
    asignaturasCount++;

    if (asignaturasCount >= maxAsignaturas) {
        this.disabled = true;
    }
});

// eliminar asignatura
function removeAsignatura(index) {
    const item = document.querySelector(`[data-index="${index}"]`);
    item.remove();
    asignaturasCount--;
            
    document.getElementById('btnAgregarAsignatura').disabled = false;
            
    // Reindexar las asignaturas restantes
    const items = document.querySelectorAll('.asignatura-item');
    items.forEach((item, i) => {
        item.setAttribute('data-index', i);
        item.querySelector('h3').textContent = `Asignatura ${i + 1}`;
        if (i > 0) {
            item.querySelector('.btn-remove').setAttribute('onclick', `removeAsignatura(${i})`);
        }
    });
}

//validaciones formulario
function validateForm() {
    let isValid = true;

    //nombre
    const nombre = document.getElementById('nombre');
    if (!nombre.value.trim()) {
        nombre.classList.add('input-error');
        document.getElementById('nombre-error').style.display = 'block';
        isValid = false;
    }

    //matrícula
    const matricula = document.getElementById('matricula');
    if (matricula.value.length !== 10) {
        matricula.classList.add('input-error');
        document.getElementById('matricula-error').style.display = 'block';
        isValid = false;
    }

    //programa académico
    const progAca = document.getElementById('progAca');
    if (!progAca.value) {
        progAca.classList.add('input-error');
        document.getElementById('progAca-error').style.display = 'block';
        isValid = false;
    }

    //cuatrimestre
    const cuatrimestre = document.getElementById('cuatrimestre');
    if (!cuatrimestre.value) {
        cuatrimestre.classList.add('input-error');
        document.getElementById('cuatrimestre-error').style.display = 'block';
        isValid = false;
    }

    //grupo
    const grupo = document.getElementById('grupo');
    if (!grupo.value) {
        grupo.classList.add('input-error');
        document.getElementById('grupo-error').style.display = 'block';
        isValid = false;
    }

    //asignaturas
    const asignaturas = document.querySelectorAll('[name="asignaturas[]"]');
    const cursos = document.querySelectorAll('[name="cursos[]"]');

    asignaturas.forEach((input, i) => {
        if (!input.value.trim()) {
            input.classList.add('input-error');
            input.nextElementSibling.style.display = 'block';
            isValid = false;
        }
    });

    cursos.forEach((select, i) => {
        if (!select.value) {
            select.classList.add('input-error');
            select.nextElementSibling.style.display = 'block';
            isValid = false;
        }
    });

    return isValid;
}

//limpiar errores al escribir
document.querySelectorAll('input, select').forEach(element => {
    element.addEventListener('input', function() {
        this.classList.remove('input-error');
        const errorSpan = this.nextElementSibling;
        if (errorSpan && errorSpan.classList.contains('error')) {
            errorSpan.style.display = 'none';
        }
    });
});

//envío del formulario
document.getElementById('bajaForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    //ocultar mensajes previos
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';

    //validar formulario
    if (!validateForm()) {
        return;
    }

    //loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('btnSubmit').disabled = true;

    //preparar datos
    const formData = new FormData(e.target);
    const data = {
        timestamp: new Date().toISOString(),
        nombre: formData.get('nombre'),
        matricula: formData.get('matricula'),
        progAca: formData.get('progAca'),
        cuatrimestre: formData.get('cuatrimestre'),
        grupo: formData.get('grupo'),
        asignaturas: []
    };

    //obtener datos de asignaturas
    const asignaturas = formData.getAll('asignaturas[]');
    const cursos = formData.getAll('cursos[]');

    for (let i = 0; i < asignaturas.length; i++) {
        data.asignaturas.push({
            nombre: asignaturas[i],
            curso: cursos[i]
        });
    }

    try {
        //enviar a Google Apps Script
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
	mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        // Como usamos no-cors, asumimos éxito si no hay error ._____.
        document.getElementById('loading').style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';

        //limpiar formulario
        e.target.reset();

        //eliminar asignaturas adicionales
        const extraAsignaturas = document.querySelectorAll('.asignatura-item:not(:first-child)');
        extraAsignaturas.forEach(item => item.remove());
        asignaturasCount = 1;
        document.getElementById('btnAgregarAsignatura').disabled = false;

        //scroll al mensaje de éxito
        document.getElementById('successMessage').scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('errorMessage').style.display = 'block';
    } finally {
        document.getElementById('btnSubmit').disabled = false;
    }
});