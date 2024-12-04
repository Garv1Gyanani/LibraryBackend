import express from 'express';
import cors from 'cors';
import ProxyRouter from './Src/ProxyServerRouter.js';
import AdminRouter from './Src/Admin.js';
import userRouter from './Src/RouterUser.js';

const app = express();
const PORT = 3400;

app.use(express.json());
app.use(cors());
app.use(ProxyRouter);
app.use(userRouter);
app.use(AdminRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
