const App = require('./app')

async function main() {
    const app = new App();
    await app.listen();
}

/** Inicia o servidor */
main();
