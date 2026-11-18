import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';
import userRoutes from './routes/user.routes';

const app: Application = express();


app.use(cors());
app.use(express.json());


app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/users', userRoutes);

app.use(errorHandler);

export default app;