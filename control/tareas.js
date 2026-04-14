let tareas = [];
let filtroActual = "todas";
let idActual = 1;

function obtenerUsuario() {
    return localStorage.getItem("usuarioActivo");
}

function guardar() {
    const usuario = obtenerUsuario();
    localStorage.setItem("tareas_" + usuario, JSON.stringify(tareas));
}

async function cargarTareas() {
    const usuario = obtenerUsuario();
    if (!usuario) return;

    const guardadas = localStorage.getItem("tareas_" + usuario);

    // Si ya hay tareas guardadas para ese usuario, usar esas
    if (guardadas) {
        tareas = JSON.parse(guardadas);
        idActual = tareas.length ? Math.max(...tareas.map(t => t.id)) + 1 : 1;
        render();
        return;
    }

    // Si no hay tareas guardadas, leer desde bd/tareas.txt
    const res = await fetch("bd/tareas.txt");
    const data = await res.text();

    tareas = data.split("\n")
        .filter(linea => linea.trim() !== "")
        .map(linea => {
            const [user, descripcion, estado, fecha] = linea.split(",");

            return {
                usuario: user.trim(),
                descripcion: descripcion.trim(),
                estado: estado.trim(),
                fecha: fecha ? fecha.trim() : ""
            };
        })
        .filter(t => t.usuario === usuario)
        .map(t => ({
            id: idActual++,
            descripcion: t.descripcion,
            estado: t.estado,
            fecha: t.fecha
        }));

    guardar();
    render();
}

function crear() {
    let txt = document.getElementById("texto").value;
    let fecha = document.getElementById("fecha").value;

    if (!txt) return;

    tareas.push({
        id: idActual++,
        descripcion: txt,
        estado: "por hacer",
        fecha: fecha
    });

    document.getElementById("texto").value = "";
    guardar();
    render();
}

function eliminar(id) {
    tareas = tareas.filter(t => t.id !== id);
    guardar();
    render();
}

function editar(id) {
    let nueva = prompt("Editar tarea:");
    if (!nueva) return;

    let t = tareas.find(x => x.id === id);
    if (t) t.descripcion = nueva;

    guardar();
    render();
}

function filtrar(f) {
    filtroActual = f;
    render();
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev, id) {
    ev.dataTransfer.setData("id", id);
}

function drop(ev, estado) {
    ev.preventDefault();

    let id = ev.dataTransfer.getData("id");
    let t = tareas.find(x => x.id == id);

    if (t) t.estado = estado;

    guardar();
    render();
}

function render() {
    ["por hacer", "haciendo", "finalizado"].forEach(e => {
        const el = document.getElementById(e);
        if (el) el.innerHTML = "";
    });

    let lista = tareas;

    if (filtroActual !== "todas") {
        lista = tareas.filter(t => t.estado === filtroActual);
    }

    lista.forEach(t => {
        let div = document.createElement("div");
        div.className = "card";
        div.draggable = true;
        div.ondragstart = (e) => drag(e, t.id);

        // Botones gráficos para mover estados
        let botones = "";

        if (t.estado !== "por hacer") {
            botones += `<button class="btn-mover" onclick="moverEstado(${t.id}, 'izq')">⬅️</button>`;
        }

        if (t.estado !== "finalizado") {
            botones += `<button class="btn-mover" onclick="moverEstado(${t.id}, 'der')">➡️</button>`;
        }

        div.innerHTML = `
            <div class="titulo">${t.descripcion}</div>
            <div class="fecha">📅 ${t.fecha || "Sin fecha"}</div>

            <div class="acciones">
                ${botones}
                <button class="btn-edit" onclick="editar(${t.id})">✏️</button>
                <button class="btn-delete" onclick="eliminar(${t.id})">🗑️</button>
            </div>
        `;

        document.getElementById(t.estado).appendChild(div);
    });
}

function moverEstado(id, direccion) {
    const estados = ["por hacer", "haciendo", "finalizado"];

    let tarea = tareas.find(t => t.id === id);
    if (!tarea) return;

    let index = estados.indexOf(tarea.estado);

    if (direccion === "der" && index < estados.length - 1) {
        tarea.estado = estados[index + 1];
    }

    if (direccion === "izq" && index > 0) {
        tarea.estado = estados[index - 1];
    }

    guardar();
    render();
}