import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 3000);

createApp().listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
