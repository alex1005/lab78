const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const logger = (req, res, next) => { 
    const timestamp = new Date().toISOString(); 
    console.log(`\n${timestamp}   ${req.method}: ${req.url} from ${req.ip}`); 
    next(); 
};

const app = express();
app.use(bodyParser.json());
app.use(logger);

const cors=require("cors");
const corsOptions = {
   origin:'*', 
   credentials:true,
   optionSuccessStatus:200,
}

app.use(cors(corsOptions))

// Функція підключення до бази даних за адресою mongodb://192.168.1.113:27017/myapp
const connectToMongo = async () => {
    try {
        await mongoose.connect('mongodb://192.168.1.113:27017/myapp', {useNewUrlParser: true, useUnifiedTopology: true});
        console.log('MongoDB connected!')
    }
    catch(error) {
        console.log(error)
        process.exit()
    }
};

//Функція запуску сервера
const startServer = async () => {
    await connectToMongo();
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
}

const Schema = mongoose.Schema;
const productSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true
  }
});
const Product = mongoose.model('Product', productSchema);

/*
    Формат товару:
    {
        "name": "Product 1",
        "description": "Some product"
        "price": 10.0,
    }
*/

function validateProduct(product) {
    const price = parseFloat(product.price)
    return Boolean(product.name && typeof(price) == 'number' && !isNaN(price) && price >= 0);
}

// Отримання всіх доступних товарів
app.get('/products', async (req, res) => {
    console.log('List of all products requested');
    const products = await Product.find();
    console.log(products);
    res.json(products);
});

// Отримання товару за id
app.get('/products/:id', async (req, res) => {
    const rawId = req.params.id;
    console.log(`Product with id = ${rawId} requested`);
    if(mongoose.isValidObjectId(rawId)) {
        const product = await Product.findById(rawId);
        if(product) {
            console.log(`Requested product: ${product}`);
            res.json(product);
        } else {
            console.log("Requested product not found!");
            res.status(404).send("Product not found!");
        }
    } else {
        console.log("Passed id is incorrect!");
        res.status(404).send("Id is incorrect!");
    }
});

// Додавання нового товару
app.post('/products', async (req, res) => {
    const newProduct = req.body;
    console.log(`Trying to add new product: ${JSON.stringify(newProduct)}`);
    if(validateProduct(newProduct)) {
        const productModel = new Product({
            name: newProduct.name,
            description: newProduct.description ?? null,
            price: newProduct.price,
        });
        try {
            const result = await productModel.save();
            console.log("Added successfully!");
            res.status(201).json(result);
        } catch (error) {
            console.log("Incorrect product!");
            const message = {
                "message": `Incorrect product! Error: ${error}`,
                "request_object": newProduct
            };
            res.status(400).json(message);
        }
    } else {
        console.log("Incorrect product!");
        const message = {
            "message": "Incorrect product!",
            "request_object": newProduct
        };
        res.status(400).json(message);
    }
});

// Оновлення товару за id
app.put('/products/:id', async (req, res) => {
    const rawId = req.params.id;
    console.log(`Request to update product with id = ${rawId}`);
    if(mongoose.isValidObjectId(rawId)) {
        const updatedProduct = req.body;
        const existingProduct = await Product.findById(rawId);
        if(existingProduct) {
            if(validateProduct(updatedProduct)) {
                existingProduct.name = updatedProduct.name;
                existingProduct.description = updatedProduct.description ?? existingProduct.description;
                existingProduct.price = updatedProduct.price;
                const result = await existingProduct.save();
                if(result.errors) {
                    console.log(`Updated version is incorrect! Error: ${result.errors}`);
                    const message = {
                        "message": "Incorrect product!",
                        "request_object": updatedProduct
                    };
                    res.status(400).json(message);
                } else{
                    console.log("Updated successfully!");
                    res.status(201).json(result);
                }
            } else {
                console.log(`Updated version is incorrect!`);
                const message = {
                    "message": "Incorrect product!",
                    "request_object": updatedProduct
                };
                res.status(400).json(message);
            }
        } else {
            console.log("Requested product not found!");
            res.status(404).send("Product not found!");
        }
    } else {
        console.log("Passed id is incorrect!");
        res.status(404).send("Id is incorrect!");
    }
});

// Видалення товару за id
app.delete('/products/:id', async (req, res) => {
    const rawId = req.params.id;
    console.log(`Request to delete product with id = ${rawId}.`);
    if(mongoose.isValidObjectId(rawId)) {
        const deletedProduct = await Product.findByIdAndDelete(rawId);
        
        if(deletedProduct) {
            console.log(`Requested product deleted: ${deletedProduct}`);
            res.status(204).send();
        } else {
            console.log("Requested product not found!");
            res.status(404).send("Product not found!");
        }
    } else {
        console.log("Passed id is incorrect!");
        res.status(404).send("Id is incorrect!");
    }
});

// Видалення всіх товарів
app.delete('/products', async (req, res) => {
    console.log("Request to delete all products.");
    await Product.deleteMany();
    console.log("All products deleted!");
    res.status(204).send();
});

// Запуск сервера за адресою http://localhost:3000/
startServer();