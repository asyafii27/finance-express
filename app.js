const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors')

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const CompanyRouter = require('./app/api/Company/CompanyRouter');
const ExpenditureRouter = require('./app/api/Expenditure/ExpenditureRouter');
const UserRouter = require('./app/api/user/UserRouter');

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to EGA Finance API',
    status: 'success',
  });
});

const authenticateUser = require('./app/api/middlewares/AuthMiddleWare');

app.use('/', UserRouter);
app.use('/master/companies', authenticateUser, CompanyRouter);
app.use('/keuangan/expenditure', authenticateUser, ExpenditureRouter);


app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});