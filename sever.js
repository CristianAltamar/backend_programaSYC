import express from 'express';
import cors from 'cors';
import rotes from './routes/index.js';

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api', rotes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});