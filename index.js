import express from 'express';
import cors from 'cors';
import multer from 'multer';
import {GoogleGenAI} from '@google/genai';
import 'dotenv/config';


//inisialisasi express

const app = express();
const ai = new GoogleGenAI({});

//inisialisasi middleware

app.use(cors());
// app.use(multer());
app.use(express.json());
app.use(express.static('public'));

//inisialisasi endpoint
//
app.post('/chat', 
    async (req,res) => {
        const {body} = req;
        const {conversation} = body; 
        
        if(!conversation || !Array.isArray(conversation)) {
            res.status(400).json({
                message:"Percakapan harus valid!",
                data:null,
                success:false
            });
            return;
        }
        const conversationIsValid = conversation.every((message)=>{
            if(!message) return false;
            //kondisi kedua -- message harus berupa object namun bukan array!
            if(typeof message !== 'object' || Array.isArray(message)) return false;
            //kondisi ketiga -- message harus berisi hanya role dan text
            const keys = Object.keys(message);
            const keysLengthIsValid = keys.length === 2;
            const keyContainsValidName = keys.every(key => ['role', 'text'].includes(key));

            if(!keysLengthIsValid || !keyContainsValidName) return false;

            //kondisi --role harus berupa 'user' | 'model'
            // --text harus berupa string

            const{role, text} = message;
            const roleIsValid = ['user', 'model'].includes(role);
            const textIsValid = typeof text === 'string';

            if(!roleIsValid || !textIsValid) return false;

            //selebihnya.....

            return true;
        });

        if(!conversationIsValid) {
            res.status(400).json({
                message:"Percakapan harus valid!",
                data:null,
                success:false
            });
            return;
        }
        
        const contents = conversation.map(({ role, text }) => ({
            role,
            parts: [{ text }]
        }));

        try{
            //3d party API --google ai
            const aiResponse = await ai.models.generateContent({
                model:'gemini-2.5-flash',
                contents
            });
            res.status(200).json({
                message:"Berhasil ditanggapi oleh Google Gemini Flash!",
                data:aiResponse.text,
                success:true
            })
        }catch(e){
            console.log(e);
            res.status(500).json({
                message: e.message || "Ada masalah di server!",
                data:null,
                success:false
            })
        }
    }
);

//entry point
app.listen(3000, () => {
    console.log("I Love You 3000")
});

