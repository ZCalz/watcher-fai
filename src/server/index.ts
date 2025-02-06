
import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(cors());

app.get('/', (req, res) => {
  res.json({ message: 'Hello from server!' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
