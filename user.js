async function login(){
	const  usuario = documento.getElementById('user').value;
	const password = document.getElementById('pass'),value;

	const res = await fetch('https://localhost:3000/login',{
		method:'POST',
		headers:{'Content-Type':'Application/json'},
		body: JSON.stringify({usuario,password})
	});

	const data = await res.json();
	localStorage.setItem('token',data.token);
}
