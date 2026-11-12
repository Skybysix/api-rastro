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