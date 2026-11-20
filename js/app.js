document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = 'login.html'; return; }

    const user = session.user;
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    
    document.getElementById('userGreeting').innerText = `Hola, ${profile.nombres} (${profile.rol})`;
    document.getElementById('btnLogout').addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'index.html';
    });

    if(profile.rol === 'ciudadano') {
        document.getElementById('ciudadanoView').style.display = 'block';
        loadCiudadanoRequests(user.id);
    } else if(profile.rol === 'reciclador') {
        document.getElementById('recicladorView').style.display = 'block';
        loadRecicladorRequests();
    } else if(profile.rol === 'admin') {
        document.getElementById('adminView').style.display = 'block';
    }

    // Geolocalización
    const btnLoc = document.getElementById('btnLocation');
    if(btnLoc) {
        btnLoc.addEventListener('click', () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        document.getElementById('solLat').value = pos.coords.latitude;
                        document.getElementById('solLng').value = pos.coords.longitude;
                        alert('Ubicación capturada');
                    },
                    (err) => alert('Error obteniendo ubicación')
                );
            }
        });
    }

    const formSol = document.getElementById('formSolicitud');
    if(formSol) {
        formSol.addEventListener('submit', async (e) => {
            e.preventDefault();
            const req = {
                ciudadano_id: user.id,
                material: document.getElementById('solMaterial').value,
                cantidad: document.getElementById('solCantidad').value,
                direccion: document.getElementById('solDireccion').value,
                latitud: document.getElementById('solLat').value || null,
                longitud: document.getElementById('solLng').value || null,
                estado: 'Pendiente'
            };
            await supabase.from('requests').insert([req]);
            document.getElementById('solicitudModal').style.display = 'none';
            formSol.reset();
            loadCiudadanoRequests(user.id);
        });
    }
});

async function loadCiudadanoRequests(userId) {
    const { data } = await supabase.from('requests').select('*').eq('ciudadano_id', userId).order('created_at', { ascending: false });
    const tbody = document.querySelector('#tableCiudadano tbody');
    tbody.innerHTML = '';
    if(data) data.forEach(r => {
        tbody.innerHTML += `<tr><td>${r.material}</td><td>${r.cantidad}</td><td>${r.estado}</td><td>${new Date(r.created_at).toLocaleDateString()}</td></tr>`;
    });
}

async function loadRecicladorRequests() {
    const user = (await supabase.auth.getSession()).data.session.user;
    
    // Disponibles (Pendientes)
    const { data: disponibles } = await supabase.from('requests').select('*, profiles(nombres)').eq('estado', 'Pendiente');
    const tbodyDisp = document.querySelector('#tableReciclador tbody');
    tbodyDisp.innerHTML = '';
    if(disponibles) disponibles.forEach(r => {
        tbodyDisp.innerHTML += `<tr>
            <td>${r.profiles.nombres}</td><td>${r.material} (${r.cantidad})</td><td>${r.direccion}</td>
            <td><button class="btn btn-primary" onclick="aceptarSolicitud('${r.id}', '${user.id}')">Aceptar</button></td>
        </tr>`;
    });

    // Mis recolecciones (Aceptadas, En proceso, Completadas por mi)
    const { data: mias } = await supabase.from('requests').select('*').eq('reciclador_id', user.id);
    const tbodyMias = document.querySelector('#tableMisRecolecciones tbody');
    tbodyMias.innerHTML = '';
    if(mias) mias.forEach(r => {
        tbodyMias.innerHTML += `<tr>
            <td>${r.material}</td><td>${r.direccion}</td><td>${r.estado}</td>
            <td>
                ${r.estado === 'Aceptada' ? `<button class="btn btn-outline" onclick="actualizarEstado('${r.id}', 'En proceso')">En proceso</button>` : ''}
                ${r.estado === 'En proceso' ? `<button class="btn btn-primary" onclick="actualizarEstado('${r.id}', 'Completada')">Completada</button>` : ''}
            </td>
        </tr>`;
    });
}

async function aceptarSolicitud(reqId, recId) {
    await supabase.from('requests').update({ estado: 'Aceptada', reciclador_id: recId }).eq('id', reqId);
    loadRecicladorRequests();
}
async function actualizarEstado(reqId, estado) {
    await supabase.from('requests').update({ estado: estado }).eq('id', reqId);
    loadRecicladorRequests();
}
