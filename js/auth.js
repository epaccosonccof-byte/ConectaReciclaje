document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
            
            if (error) { 
                document.getElementById('loginError').innerText = error.message; 
            } else { 
                window.location.href = 'dashboard.html'; 
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const nombre = document.getElementById('nombre').value;
            const rol = document.getElementById('rol').value;
            
            const { data, error } = await supabaseClient.auth.signUp({ email, password });
            
            if (error) { 
                document.getElementById('regError').innerText = error.message; 
                return; 
            }
            
            if (data.user) {
                const { error: profileError } = await supabaseClient.from('profiles').insert([{
                    id: data.user.id, 
                    nombres: nombre, 
                    rol: rol, 
                    email: email
                }]);
                
                if (profileError) {
                    console.error('Detalle error perfil:', profileError);
                    document.getElementById('regError').innerText = "Error creando perfil: " + profileError.message;
                } else {
                    document.getElementById('regSuccess').innerText = "Registro exitoso. Puedes iniciar sesión.";
                    registerForm.reset();
                }
            }
        });
    }
});
