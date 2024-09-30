import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Beer } from "../Entity/beer.entity";
import { Repository } from "typeorm";
import axios from "axios";



@Injectable()
export class BeerService{
    constructor(
        @InjectRepository(Beer)
        private beerRepositoy: Repository<Beer>
    ){}

    async createBeer(image: Express.Multer.File): Promise<any>{

        const base64Image = image.buffer.toString('base64')

        const formData = {
            file: base64Image,
            fileName: image.originalname
        }

        const pythonApiUrl = process.env.PYTHON_API_URL|| 'http://python_app:5000'
        const response = await axios.post(`${pythonApiUrl}/process-image`, formData) 
    
        const brandName = response.data.brand.trim();

        if (!brandName) {
            throw new HttpException('Nenhuma marca encontrada na imagem.', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        
        const beer = this.beerRepositoy.create({
            brand: response.data.brand,
            urlImage: image.originalname,
            createdAt: new Date()
        });

        await this.beerRepositoy.save(beer)
        return beer
    }
}