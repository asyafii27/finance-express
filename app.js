const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors')

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const UserRouter = require('./app/api/user/UserRouter');
const TipeRouter = require('./app/api/tipe/TipeRouter');
const CompanyRouter = require('./app/api/company/CompanyRouter');
const ExpenditureRouter = require('./app/api/Expenditure/ExpenditureRouter');
const DivisiRouter = require('./app/api/divisi/DivisiRouter');
const CategoryRoute = require('./app/api/category/CategoryRoute');
const ProductRouter = require('./app/api/product/ProductRouter');
const RekeningRouter = require('./app/api/rekening/RekeningRouter');
const IncomeRouter = require('./app/api/income/IncomeRouter');
const FileUploadRouter = require('./app/api/upload/FileUploadRouter');

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to EGA Finance API',
    status: 'success',
  });
});

const authenticateUser = require('./app/api/middlewares/AuthMiddleWare');

app.use('/', UserRouter);
app.use('/master/companies', authenticateUser, CompanyRouter);
app.use('/master/tipes', authenticateUser, TipeRouter);
app.use('/keuangan/expenditure', authenticateUser, ExpenditureRouter);
app.use('/master/divisies', authenticateUser, DivisiRouter);
app.use('/master/categories', authenticateUser, CategoryRoute);
app.use('/master/products', authenticateUser, ProductRouter);
app.use('/master/rekenings', authenticateUser, RekeningRouter);
app.use('/finance/incomes', authenticateUser, IncomeRouter);
app.use('/files', authenticateUser, FileUploadRouter);


app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});