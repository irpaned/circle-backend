// berfungsi untuk menentukan type data apa yang harus di isi

import joi from "joi";
import { CreateThreadDTO } from "../dto/thread-dto";

export const createThreadSchemaJoi = joi.object<CreateThreadDTO>({
  content: joi.string().min(1).max(255).required(),
  image: joi.any(), // Cundus : allow(null, '') : agar image boleh kosong dgn berupa string kosong
});
