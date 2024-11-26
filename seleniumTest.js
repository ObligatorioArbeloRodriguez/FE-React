const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const httpServer = require('http-server'); // Librería para servidor local

(async function testWhatsNext() {
    // Configurar opciones para Chrome
    const options = new chrome.Options();
    options.addArguments('--headless'); // Ejecuta en modo headless
    options.addArguments('--disable-gpu'); // Desactiva GPU (recomendado para headless)
    options.addArguments('--no-sandbox'); // Requerido en entornos CI/CD
    options.addArguments('--disable-dev-shm-usage'); // Soluciona problemas de memoria compartida en contenedores

    // Configurar y arrancar el servidor HTTP
    const server = httpServer.createServer({
        root: './react/dist/apps/catalog', // Ruta a la carpeta build
    });

    const port = 8080; // Puerto para servir la aplicación
    server.listen(port, () => console.log(`Servidor corriendo en http://localhost:${port}`));

    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    try {
        // Abre la página servida localmente
        await driver.get(`http://localhost:${port}`); // URL local

        // Verifica que el título sea correcto
        let title = await driver.getTitle();
        if (!title.includes('Catalog')) {
            throw new Error('El título de la página no es el esperado');
        }
        console.log("Prueba (1) exitosa: 'El titulo de la pestaña es Catalog");

        // Busca y clic en "What's next?"
        let whatsNextLink = await driver.findElement(By.linkText("What's next?"));
        await whatsNextLink.click();

        console.log("Prueba (2) exitosa: el botón 'What's next?' existe");

        // Validar URL o comportamiento esperado
        let currentUrl = await driver.getCurrentUrl();
        if (!currentUrl.includes('#commands')) {
            throw new Error('El clic no redirigió correctamente a "#commands"');
        }
        console.log("Prueba (3) exitosa: El botón 'What's next', redirecciona a Comandos satisfactoriamente");
        console.log("Todas las pruebas concluyeron con éxito!");

    } catch (error) {
        console.error(`Prueba fallida: ${error.message}`);
        process.exit(1);
    } finally {
        await driver.quit(); // Cierra el navegador
        server.close(() => console.log("Servidor HTTP detenido")); // Detiene el servidor
    }
})();
