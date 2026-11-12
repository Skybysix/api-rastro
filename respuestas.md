## Ejercicio 0
1. Al intentar hacer push directamente a main, GitHub lo rechaza porque los cambios deben hacerse mediante una Pull Request:

Enumerating objects: 7, done.
Counting objects: 100% (7/7), done.
Delta compression using up to 8 threads
Compressing objects: 100% (3/3), done.
Writing objects: 100% (4/4), 385 bytes | 3.00 KiB/s, done.
Total 4 (delta 2), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (2/2), completed with 2 local objects.
remote: error: GH013: Repository rule violations found for refs/heads/main.
remote: Review all repository rules at https://github.com/Skybysix/api-rastro/rules?ref=refs%2Fheads%2Fmain
remote: 
remote: - Changes must be made through a pull request.
remote: 
remote: - 2 of 2 required status checks are expected.
remote: 
To https://github.com/Skybysix/api-rastro.git
 ! [remote rejected] main -> main (push declined due to repository rule violations)
error: failed to push some refs to 'https://github.com/Skybysix/api-rastro.git'


2. ¿por qué la segunda no encuentra nada? Pista: ¿en qué formato llega todo lo que viene en una URL?

Porque los valores de la URL llegan como texto, pero el precio en MongoDB está guardado como número.

3. ¿por qué la API ignora views y status si el cliente los envía? ¿Qué podría hacer alguien si no los ignorara?

Porque son campos que controla la API. Si no los ignorase, un usuario podría falsear las visitas o marcar un anuncio como vendido sin estarlo.

4. Ana baja el iPhone de 380 a 350 €. La oferta de Sara guarda una copia: listing.price: 380. ¿Debe tu PATCH cambiar también esa copia? ¿Por qué?

No. El PATCH solo debe modificar el precio del anuncio en la colección listings. La oferta guarda una copia independiente de los datos del anuncio, por lo que mantiene los 380 € originales.

5. ¿por qué ofertar por un anuncio vendido es 409 y no 400?

Devuelve 409 porque hemos creado esta línea de cógigo:

// 5. Comprobar que el anuncio está disponible
  if (listing.status !== "AVAILABLE") {
    res.status(409).json({ error: "El anuncio no está disponible" });
    return;
  }

Necesitamos esa respuesta porque en este caso el método que usamos y el body que pusimos era correcto, el único error era que el anuncio ya no estaba disponible. Es decir, la petición y el formato de petición era correcto, por eso es buena práctica devolver un 409 y no un 400.

6. 

MongoDB se encarga de almacenar objetos, generar el id automáticamente si no se pone de forma manual y revisar si este es válido. 

Con el código, en cambio, realizamos validaciones, peticiones HTTP y devolvemos códigos de error (400) o de petición realizada (200), entre otras.

Ejemplo MongoDB:

await offersCollection().insertOne(newOffer);

    Mongo inserta automáticamente un id si no lo ponemos nosotros y verifica que no se duplique con otro.

Ejemplo código:

if (typeof amount !== "number" || amount <= 0)

    Comprobar que el precio sea igual o mayor a 0.