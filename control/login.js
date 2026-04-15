async function cargarUsuariosTXT() {
    const res = await fetch("bd/usuarios.txt");
    const data = await res.text();

    return data.split("\n")
        .filter(linea => linea.trim() !== "")
        .map(linea => {
            const [usuario, password] = linea.split(",");
            return { usuario: usuario.trim(), password: password.trim() };
        });
}

async function login() {
    const user = document.getElementById("user").value;
    const pass = document.getElementById("pass").value;

    const usuarios = await cargarUsuariosTXT();

    const encontrado = usuarios.find(u => u.usuario === user && u.password === pass);

    if (encontrado) {
        localStorage.setItem("sesionActiva", "true");
        localStorage.setItem("usuarioActivo", user);

        alert("Bienvenido " + user);

        cargarPizarra();
        setTimeout(() => cargarTareas(), 200); // cargar tareas después de cargar la vista
    } else {
        alert("Usuario o contraseña incorrectos");
    }
}

function logout() {
    localStorage.removeItem("sesionActiva");
    localStorage.removeItem("usuarioActivo");
    location.reload();
}

if (localStorage.getItem("sesionActiva") === "true") {
    cargarPizarra().then(() => cargarTareas());
} else {
    cargarLogin();
}

function registro() {
    location.href = "views/registro.html";
}   