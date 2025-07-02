
    let knownDescriptors = []; // Base de rostros
    let registros = [];        // Lista de registros (nombre + hora)

    async function iniciarCamara() {
      await faceapi.nets.tinyFaceDetector.loadFromUri('./models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('./models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('./models');

      const video = document.getElementById('video');
      navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => video.srcObject = stream)
        .catch(err => alert("No se pudo acceder a la cámara."));
    }

    iniciarCamara();

    async function registrar() {
      const nombre = document.getElementById('nombre').value.trim();
      const apellido = document.getElementById('apellido').value.trim();

      if (!nombre || !apellido) {
        alert("Ingrese nombre y apellido.");
        return;
      }

      const fullName = `${nombre} ${apellido}`;

      // Validar nombre único
      if (registros.some(r => r.nombre === fullName)) {
        alert("Este nombre ya fue registrado.");
        return;
      }

      const deteccion = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
      if (!deteccion) {
        alert("No se detectó rostro.");
        return;
      }

      const nuevoDescriptor = deteccion.descriptor;

      // Comparar rostro con base registrada
      for (const item of knownDescriptors) {
        const distancia = faceapi.euclideanDistance(item.descriptor, nuevoDescriptor);
        if (distancia < 0.6) {
          alert("Este rostro ya fue registrado.");
          return;
        }
      }

      // Registrar nuevo rostro
      knownDescriptors.push({ nombre: fullName, descriptor: nuevoDescriptor });

      // Registrar en log
      const fecha = new Date().toLocaleString();
      registros.push({ nombre: fullName, fecha });

      const div = document.createElement("div");
      div.className = "entry";
      div.innerHTML = `<strong>${fullName}</strong><br><small>${fecha}</small>`;
      document.getElementById("registros").appendChild(div);

      document.getElementById("nombre").value = "";
      document.getElementById("apellido").value = "";
    }
  
