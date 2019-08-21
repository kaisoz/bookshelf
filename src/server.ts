import { App } from './app';

const port = Number(process.env.PORT) || 3000;

const app = new App(port, 'static');
app.listen();
